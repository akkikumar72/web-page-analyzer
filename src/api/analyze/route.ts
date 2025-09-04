import { diffLines } from "diff";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { type Browser, chromium } from "playwright";

type Annotation = {
  website_section: string;
  state_before: string;
  state_after: string;
  change_analysis: string;
  element_aria_label: string;
};

export const maxRequestBodySize = "1mb";

const MAX_CLICKS = 15;
const SETTLE_MS = 500;

export async function POST(request: Request) {
  const { url } = await request.json();
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;

  let browser: Browser | null = null;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    const loc = page.locator(
      [
        "button",
        "[role=button]",
        "a[href]:not([href^='#'])",
        "input[type=button]",
        "input[type=submit]",
        "input[type=checkbox]",
        "input[type=radio]",
        "summary",
        "[onclick]",
      ].join(","),
    );

    const count = await loc.count();
    const toClick = Math.min(count, MAX_CLICKS);

    const annotations: Annotation[] = [];

    for (let i = 0; i < toClick; i++) {
      const el = loc.nth(i);

      const { label, section } = await el.evaluate((node: Element) => {
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
                cur.tagName,
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
        return {
          label:
            getText(node) ||
            (node as HTMLElement).id ||
            (node as HTMLElement).className ||
            "unknown",
          section: nearestSectionLabel(node),
        };
      });

      const beforeTree = await page.accessibility
        .snapshot({ interestingOnly: true })
        .catch(() => null);

      try {
        await el.click({ timeout: 2000 });
        await page.waitForTimeout(SETTLE_MS);
      } catch {
        continue;
      }

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

      let summary = "UI state changed (see diff).";
      if (openai) {
        try {
          const resp = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0,
            messages: [
              {
                role: "system",
                content:
                  "Describe the visible UI change in one short sentence.",
              },
              {
                role: "user",
                content: `Accessibility-tree diff:\n${delta}\n\nOne sentence:`,
              },
            ],
          });
          summary = resp.choices?.[0]?.message?.content?.trim() || summary;
        } catch {}
      }

      annotations.push({
        website_section: section,
        state_before: "Captured via accessibility snapshot.",
        state_after: "Captured via accessibility snapshot.",
        change_analysis: summary,
        element_aria_label: label,
      });
    }

    await browser.close();
    return NextResponse.json({ annotations });
  } catch (e: unknown) {
    if (browser) await browser.close();
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Analysis failed" },
      { status: 500 },
    );
  }
}
