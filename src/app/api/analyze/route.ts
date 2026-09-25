import { existsSync } from "node:fs";
import { NextResponse } from "next/server";
import { chromium } from "playwright";
import { z } from "zod";
import { analyzePage } from "@/lib/analyze-page";
import { assertPublicTarget, parseTarget } from "@/lib/analyze-target";

export const runtime = "nodejs";
export const maxDuration = 180;
const schema = z.object({
  url: z.string().max(2048).default(""),
  playground: z.boolean().default(false),
  viewport: z.enum(["desktop", "mobile"]).default("desktop"),
  limit: z.number().int().min(1).max(15).default(8),
  ai: z.boolean().default(false),
});
let active = false;
export function GET() {
  return NextResponse.json({
    aiConfigured: !!process.env.OPENAI_API_KEY,
    browserReady:
      !!process.env.PLAYWRIGHT_CHANNEL || existsSync(chromium.executablePath()),
  });
}
export async function POST(request: Request) {
  let options: z.infer<typeof schema>;
  try {
    options = schema.parse(await request.json());
    if (!options.playground) await assertPublicTarget(parseTarget(options.url));
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof z.ZodError
            ? "Check the address, viewport and interaction limit."
            : error instanceof Error
              ? error.message
              : "Invalid request.",
      },
      { status: 400 },
    );
  }
  if (options.ai && !process.env.OPENAI_API_KEY)
    return NextResponse.json(
      {
        error:
          "AI summaries need an OpenAI key on the server. Evidence mode works without one.",
      },
      { status: 503 },
    );
  if (active)
    return NextResponse.json(
      { error: "Another analysis is running. Try again when it finishes." },
      { status: 429 },
    );
  active = true;
  if (!request.headers.get("accept")?.includes("application/x-ndjson")) {
    try {
      const run = await analyzePage(options, request.signal, () => {});
      return NextResponse.json({ annotations: run.annotations, run });
    } catch {
      return NextResponse.json(
        {
          error:
            "The page could not be analyzed. Check browser setup or try the playground.",
        },
        { status: 502 },
      );
    } finally {
      active = false;
    }
  }
  const canceled = new AbortController();
  const signal = AbortSignal.any([request.signal, canceled.signal]);
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: unknown) => {
        if (!signal.aborted)
          controller.enqueue(
            new TextEncoder().encode(`${JSON.stringify(event)}\n`),
          );
      };
      try {
        const run = await analyzePage(options, signal, send);
        send({ type: "result", run });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Analysis failed.";
        send({
          type: "error",
          error: message.includes("Executable doesn't exist")
            ? "Chromium is not installed. Run bunx playwright install chromium on the server."
            : signal.aborted
              ? "Analysis canceled."
              : "The page could not be analyzed. It may block automation, be unavailable, or have reached the run timeout. Try the playground or a smaller run.",
        });
      } finally {
        active = false;
        if (!canceled.signal.aborted) controller.close();
      }
    },
    cancel() {
      canceled.abort();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
