import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { diffLines } from "diff";
import { NextResponse } from "next/server";
import { type Browser, chromium } from "playwright";
import { z } from "zod";
import type { Annotation } from "@/types/annotation";
import { getInteractiveElementSelector } from "@/lib/interactive-selectors";

const annotationSchema = z.object({
  website_section: z
    .string()
    .describe("The section of the website where the element is located"),
  state_before: z
    .string()
    .describe("Description of the UI state before the interaction"),
  state_after: z
    .string()
    .describe("Description of the UI state after the interaction"),
  change_analysis: z
    .string()
    .describe("Detailed analysis of what changed in the UI"),
  element_aria_label: z
    .string()
    .describe("Accessible label or text content of the element"),
  element_selector: z.string().describe("CSS selector for the element"),
  element_type: z
    .string()
    .describe("Type of element (button, link, input, etc.)"),
  coordinates: z.object({
    x: z.number().describe("X coordinate of the element"),
    y: z.number().describe("Y coordinate of the element"),
  }),
  screenshot_before: z
    .string()
    .optional()
    .describe("Base64 encoded screenshot before interaction"),
  screenshot_after: z
    .string()
    .optional()
    .describe("Base64 encoded screenshot after interaction"),
});

export const maxRequestBodySize = "1mb";

const MAX_CLICKS = 15;
const SETTLE_MS = 500;

export async function POST(request: Request) {
  const { url } = await request.json();
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 500 }
    );
  }

  let browser: Browser | null = null;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    const loc = page.locator(getInteractiveElementSelector());

    const count = await loc.count();
    const toClick = Math.min(count, MAX_CLICKS);

    const annotations: Annotation[] = [];

    for (let i = 0; i < toClick; i++) {
      const el = loc.nth(i);

      // Get element details
      const elementDetails = await el.evaluate((node: Element) => {
        function getText(n: Element | null): string {
          if (!n) return "";
          const aria = (n as HTMLElement).getAttribute?.("aria-label");
          const lblBy = (n as HTMLElement).getAttribute?.("aria-labelledby");
          let byText = "";
          if (lblBy) {
            const ids = lblBy.split(/\s+/);
            const t =
              ids.length > 0
                ? document.getElementById(ids[0])?.textContent?.trim()
                : "";
            byText = t || "";
          }
          const text = (n.textContent || "").trim();
          return aria || byText || text || n.getAttribute?.("title") || "";
        }
        function nearestSectionLabel(n: Element | null): string {
          let cur: Element | null = n;
          while (cur) {
            if (
              ["ASIDE", "NAV", "HEADER", "FOOTER", "MAIN", "SECTION"].includes(
                cur.tagName
              ) ||
              cur.hasAttribute("role") ||
              cur.hasAttribute("aria-label") ||
              cur.hasAttribute("aria-labelledby")
            ) {
              const role =
                cur.getAttribute("role") || cur.tagName.toLowerCase();
              const label = getText(cur);
              return label ? `${role}: ${label}` : role;
            }
            cur = cur.parentElement;
          }
          return "page";
        }

        const rect = node.getBoundingClientRect();
        const tagName = node.tagName.toLowerCase();

        return {
          label:
            getText(node) ||
            (node as HTMLElement).id ||
            (node as HTMLElement).className ||
            "unknown",
          section: nearestSectionLabel(node),
          tagName,
          coordinates: {
            x: Math.round(rect.left + rect.width / 2),
            y: Math.round(rect.top + rect.height / 2),
          },
          selector: node.id
            ? `#${node.id}`
            : `${tagName}.${(node as HTMLElement).className
                .split(" ")
                .join(".")}`,
        };
      });

      // Take screenshot before interaction
      const screenshotBefore = await page
        .screenshot({
          clip: {
            x: elementDetails.coordinates.x - 50,
            y: elementDetails.coordinates.y - 50,
            width: 100,
            height: 100,
          },
        })
        .catch(() => null);

      const beforeTree = await page.accessibility
        .snapshot({ interestingOnly: true })
        .catch(() => null);

      try {
        await el.click({ timeout: 2000 });
        await page.waitForTimeout(SETTLE_MS);
      } catch {
        continue;
      }

      // Take screenshot after interaction
      const screenshotAfter = await page
        .screenshot({
          clip: {
            x: elementDetails.coordinates.x - 50,
            y: elementDetails.coordinates.y - 50,
            width: 100,
            height: 100,
          },
        })
        .catch(() => null);

      const afterTree = await page.accessibility
        .snapshot({ interestingOnly: true })
        .catch(() => null);

      const beforeTxt = JSON.stringify(beforeTree ?? {});
      const afterTxt = JSON.stringify(afterTree ?? {});
      const delta = diffLines(beforeTxt, afterTxt)
        .filter((d) => d.added || d.removed)
        .map((d) => (d.added ? "+ " : "- ") + (d.value || "").slice(0, 300))
        .join("\n")
        .slice(0, 3000);

      try {
        const { object: annotation } = await generateObject({
          model: openai("gpt-4o-mini"),
          schema: annotationSchema,
          prompt: `Analyze this UI interaction:
            
Element: ${elementDetails.tagName} with label "${elementDetails.label}"
Section: ${elementDetails.section}
Coordinates: (${elementDetails.coordinates.x}, ${elementDetails.coordinates.y})

Accessibility changes:
${delta}

Generate a comprehensive annotation for this interaction.`,
        });

        annotations.push({
          ...annotation,
          element_selector: elementDetails.selector,
          element_type: elementDetails.tagName,
          coordinates: elementDetails.coordinates,
          screenshot_before: screenshotBefore
            ? Buffer.from(screenshotBefore).toString("base64")
            : undefined,
          screenshot_after: screenshotAfter
            ? Buffer.from(screenshotAfter).toString("base64")
            : undefined,
        });
      } catch (_aiError) {
        // Fallback to basic annotation if AI fails
        annotations.push({
          website_section: elementDetails.section,
          state_before: "UI state before interaction",
          state_after: "UI state after interaction",
          change_analysis: delta || "UI state changed",
          element_aria_label: elementDetails.label,
          element_selector: elementDetails.selector,
          element_type: elementDetails.tagName,
          coordinates: elementDetails.coordinates,
          screenshot_before: screenshotBefore
            ? Buffer.from(screenshotBefore).toString("base64")
            : undefined,
          screenshot_after: screenshotAfter
            ? Buffer.from(screenshotAfter).toString("base64")
            : undefined,
        });
      }
    }

    await browser.close();
    return NextResponse.json({ annotations });
  } catch (e: unknown) {
    if (browser) await browser.close();
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
