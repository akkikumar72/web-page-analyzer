import assert from "node:assert/strict";
import { test } from "node:test";
import type { AnalysisRun } from "../src/types/analysis";

const origin = process.env.TRACE_TEST_ORIGIN || "http://127.0.0.1:3040";
const post = (body: unknown, extra: RequestInit = {}) =>
  fetch(`${origin}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    ...extra,
  });

test("API rejects invalid/private targets and invalid run limits", async () => {
  for (const body of [
    { url: "http://127.0.0.1" },
    { url: "file:///etc/passwd" },
    { playground: true, limit: 99 },
  ]) {
    const response = await post(body);
    assert.equal(response.status, 400);
    assert.equal(typeof (await response.json()).error, "string");
  }
});

test("real browser run captures every playground control and preserves JSON compatibility", async () => {
  const response = await post({ playground: true, limit: 8 });
  assert.equal(response.status, 200);
  const body = (await response.json()) as {
    run: AnalysisRun;
    annotations: AnalysisRun["annotations"];
  };
  assert.equal(body.annotations.length, 8);
  assert.equal(body.run.discovered, 8);
  assert.equal(
    body.run.annotations.filter((item) => item.outcome === "changed").length,
    6,
  );
  assert.equal(
    body.run.annotations.filter((item) => item.outcome === "unchanged").length,
    2,
  );
  assert.equal(
    body.run.annotations.filter((item) => item.outcome === "skipped").length,
    0,
  );
  for (const item of body.annotations) {
    assert.ok(item.screenshot_before && item.screenshot_before.length > 1000);
    assert.ok(item.screenshot_after && item.screenshot_after.length > 1000);
    assert.ok(item.duration > 0);
  }
  const yearly = body.annotations.find(
    (item) => item.element_selector === "#yearly-plan",
  );
  assert.match(yearly?.evidence || "", /\$19/);
  assert.match(yearly?.evidence || "", /\$24/);
});

test("stream reports real progress and a mobile capture", async () => {
  const response = await post(
    { playground: true, viewport: "mobile", limit: 4 },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/x-ndjson",
      },
    },
  );
  assert.match(response.headers.get("Content-Type") || "", /x-ndjson/);
  const events = (await response.text())
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
  assert.ok(
    events.some((event) => event.type === "progress" && event.completed === 4),
  );
  const result = events.find((event) => event.type === "result");
  assert.deepEqual(result.run.dimensions, { width: 390, height: 844 });
  assert.equal(result.run.annotations.length, 4);
  assert.equal(
    result.run.annotations.filter(
      (item: { outcome: string }) => item.outcome === "skipped",
    ).length,
    0,
  );
});
