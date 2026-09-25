"use client";

import {
  ArrowRight,
  Check,
  ChevronRight,
  Clipboard,
  Code2,
  Columns2,
  Expand,
  Eye,
  ListFilter,
  MousePointer2,
  Search,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import {
  type AnalysisRun,
  durationLabel,
  type Interaction,
  runCounts,
} from "@/types/analysis";

function StatusDot({ outcome }: { outcome: string }) {
  return <span className={`status-dot ${outcome}`} />;
}
function imageSource(item: Interaction, state: "before" | "after") {
  const source =
    state === "before" ? item.screenshot_before : item.screenshot_after;
  return source
    ? `data:${item.screenshot_mime || "image/png"};base64,${source}`
    : "";
}
export function ReportInspector({ run }: { run: AnalysisRun }) {
  const [selectedId, setSelectedId] = useState(
    run.annotations.find((item) => item.outcome === "changed")?.id ||
      run.annotations[0]?.id,
  );
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [tab, setTab] = useState("inspector");
  const [capture, setCapture] = useState<"after" | "before" | "compare">(
    "after",
  );
  const [split, setSplit] = useState(50);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const counts = runCounts(run);
  const filtered = run.annotations.filter(
    (item) =>
      (filter === "all" || item.outcome === filter) &&
      `${item.element_aria_label} ${item.element_type} ${item.element_selector}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const selected =
    filtered.find((item) => item.id === selectedId) || filtered[0];
  const selectedIndex = selected
    ? run.annotations.findIndex((item) => item.id === selected.id)
    : -1;
  const copySelector = async () => {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(selected.element_selector);
      setCopied(true);
      setCopyError("");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopyError(
        "Clipboard unavailable. Select and copy the selector below.",
      );
    }
  };
  return (
    <>
      <section className="metrics" aria-label="Run statistics">
        <div>
          <span>
            Elements discovered <MousePointer2 size={15} />
          </span>
          <strong>
            {run.discovered}
            <small>on this page</small>
          </strong>
        </div>
        <div>
          <span>
            Interactions inspected <Eye size={15} />
          </span>
          <strong>
            {run.annotations.length}
            <small>{run.viewport} viewport</small>
          </strong>
        </div>
        <div>
          <span>
            State changes <span className="tiny-signal" />
          </span>
          <strong>
            {counts.changed}
            <small>
              {counts.unchanged} unchanged · {counts.skipped} skipped
            </small>
          </strong>
        </div>
        <div>
          <span>
            Run duration <span className="mini-clock" />
          </span>
          <strong>
            {durationLabel(run.duration)}
            <small>Chromium browser</small>
          </strong>
        </div>
      </section>
      <section className="report-panel">
        <fieldset className="report-tabs" aria-label="Report view">
          {[
            {
              id: "inspector",
              name: "Interaction inspector",
              icon: MousePointer2,
            },
            { id: "summary", name: "Run summary", icon: ListFilter },
            { id: "json", name: "JSON", icon: Code2 },
          ].map(({ id, name, icon: Icon }) => (
            <button
              type="button"
              key={id}
              aria-pressed={tab === id}
              className={tab === id ? "active" : ""}
              onClick={() => setTab(id)}
            >
              <Icon size={15} />
              {name}
            </button>
          ))}
          <span className="report-count">
            {run.annotations.length} interactions captured
          </span>
        </fieldset>
        {tab === "inspector" && (
          <div className="inspector-grid">
            <aside
              className="interaction-list"
              aria-label="Captured interactions"
            >
              <div className="list-heading">
                <h2>
                  Interactions <span>{run.annotations.length}</span>
                </h2>
                <ListFilter size={15} />
              </div>
              <label className="search-control">
                <Search size={15} />
                <input
                  aria-label="Search interactions"
                  placeholder="Find an interaction…"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
              <div className="list-filters">
                <select
                  aria-label="Filter interactions"
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                >
                  <option value="all">All outcomes</option>
                  <option value="changed">State changed</option>
                  <option value="unchanged">Unchanged</option>
                  <option value="skipped">Skipped</option>
                </select>
                <span>{filtered.length} results</span>
              </div>
              <div className="interaction-items">
                {filtered.map((item) => (
                  <button
                    type="button"
                    className={`interaction-item ${selected?.id === item.id ? "selected" : ""}`}
                    aria-pressed={selected?.id === item.id}
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <span className="interaction-number">
                      {String(run.annotations.indexOf(item) + 1).padStart(
                        2,
                        "0",
                      )}
                    </span>
                    <span className="interaction-name">
                      <strong>{item.element_aria_label}</strong>
                      <span>
                        <StatusDot outcome={item.outcome} />
                        {item.outcome === "changed"
                          ? "State changed"
                          : item.outcome === "skipped"
                            ? "Skipped"
                            : "Unchanged"}
                        <i>·</i>
                        {item.element_type}
                      </span>
                    </span>
                    <ChevronRight size={14} />
                  </button>
                ))}
              </div>
              {!filtered.length && (
                <div className="small-empty">
                  <Search size={23} />
                  <strong>No matching interactions</strong>
                  <p>Try another search or outcome.</p>
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setFilter("all");
                    }}
                  >
                    Reset filters
                  </button>
                </div>
              )}
              <div className="list-footer">
                <span className="status-dot changed" />
                Captured in a fresh browser session
              </div>
            </aside>
            <div className="interaction-detail">
              {selected ? (
                <>
                  <div className="detail-heading">
                    <div className="detail-title">
                      <span className="element-icon">
                        <MousePointer2 size={18} />
                      </span>
                      <div>
                        <span className="eyebrow">
                          INTERACTION{" "}
                          {String(selectedIndex + 1).padStart(2, "0")}
                        </span>
                        <h2>{selected.element_aria_label}</h2>
                      </div>
                    </div>
                    <span className={`outcome-badge ${selected.outcome}`}>
                      <StatusDot outcome={selected.outcome} />
                      {selected.outcome === "changed"
                        ? "State changed"
                        : selected.outcome === "skipped"
                          ? "Skipped"
                          : "Unchanged"}
                    </span>
                  </div>
                  <div className="detail-meta">
                    <span>{selected.action}</span>
                    <span>{selected.element_type}</span>
                    <span>{durationLabel(selected.duration)}</span>
                    <span>{selected.website_section}</span>
                  </div>
                  <div className="capture-toolbar">
                    <fieldset
                      className="segmented"
                      aria-label="Screenshot state"
                    >
                      {(["before", "after", "compare"] as const).map(
                        (state) => (
                          <button
                            type="button"
                            key={state}
                            aria-pressed={capture === state}
                            onClick={() => setCapture(state)}
                          >
                            {state === "compare" && <Columns2 size={13} />}
                            {state[0].toUpperCase() + state.slice(1)}
                          </button>
                        ),
                      )}
                    </fieldset>
                    <div className="capture-tools">
                      <span>
                        {run.dimensions.width} × {run.dimensions.height}
                      </span>
                      <button
                        type="button"
                        className="icon-button"
                        aria-label="Enlarge screenshot"
                        disabled={
                          !imageSource(
                            selected,
                            capture === "before" ? "before" : "after",
                          )
                        }
                        onClick={() => dialog.current?.showModal()}
                      >
                        <Expand size={15} />
                      </button>
                    </div>
                  </div>
                  <div
                    className={`screenshot-stage ${run.viewport === "mobile" ? "mobile-capture" : ""}`}
                  >
                    <div className="browser-frame">
                      <div className="browser-chrome">
                        <span className="browser-dots">
                          <i />
                          <i />
                          <i />
                        </span>
                        <span>
                          {run.url === "/playground"
                            ? "orbit.playground / workspace"
                            : run.url.replace(/^https?:\/\//, "")}
                        </span>
                        <span className="browser-secure">◇</span>
                      </div>
                      {imageSource(
                        selected,
                        capture === "before" ? "before" : "after",
                      ) ? (
                        <div className="screenshot-canvas">
                          <Image
                            unoptimized
                            src={imageSource(
                              selected,
                              capture === "before" ? "before" : "after",
                            )}
                            alt={`Page ${capture === "before" ? "before" : "after"} interacting with ${selected.element_aria_label}`}
                            width={run.dimensions.width}
                            height={run.dimensions.height}
                          />
                          {capture === "compare" &&
                            imageSource(selected, "before") && (
                              <>
                                <Image
                                  unoptimized
                                  className="compare-before"
                                  style={{
                                    clipPath: `inset(0 ${100 - split}% 0 0)`,
                                  }}
                                  src={imageSource(selected, "before")}
                                  alt="Before state in comparison"
                                  width={run.dimensions.width}
                                  height={run.dimensions.height}
                                />
                                <span
                                  className="compare-line"
                                  style={{ left: `${split}%` }}
                                >
                                  <Columns2 size={14} />
                                </span>
                                <span className="compare-label before-label">
                                  BEFORE
                                </span>
                                <span className="compare-label after-label">
                                  AFTER
                                </span>
                                <input
                                  className="compare-range"
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={split}
                                  aria-label="Screenshot comparison position"
                                  onChange={(event) =>
                                    setSplit(Number(event.target.value))
                                  }
                                />
                              </>
                            )}
                        </div>
                      ) : (
                        <div className="capture-empty">
                          <Eye size={25} />
                          <strong>
                            No {capture === "before" ? "before" : "after"}{" "}
                            capture
                          </strong>
                          <p>
                            {selected.outcome === "skipped"
                              ? "This control was left untouched."
                              : "The page did not provide a screenshot."}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="observation">
                    <div className="observation-title">
                      <span className="observation-mark">
                        <Eye size={15} />
                      </span>
                      <h3>
                        {selected.analysisSource === "ai"
                          ? "AI interpretation"
                          : "What changed"}
                      </h3>
                      <span>
                        {selected.analysisSource === "ai"
                          ? "AI assisted"
                          : "Observed evidence"}
                      </span>
                    </div>
                    <p>{selected.change_analysis}</p>
                  </div>
                  <div className="state-comparison">
                    <div>
                      <span className="eyebrow">BEFORE</span>
                      <p>{selected.state_before.replace(/^-\s*/, "")}</p>
                    </div>
                    <ArrowRight size={16} />
                    <div>
                      <span className="eyebrow">AFTER</span>
                      <p>{selected.state_after.replace(/^\+\s*/gm, "")}</p>
                    </div>
                  </div>
                  <div className="selector-row">
                    <span>Selector</span>
                    <code>{selected.element_selector}</code>
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={copied ? "Selector copied" : "Copy selector"}
                      onClick={copySelector}
                    >
                      {copied ? <Check size={14} /> : <Clipboard size={14} />}
                    </button>
                  </div>
                  {copyError && (
                    <output className="inline-message">{copyError}</output>
                  )}
                  <details className="evidence-disclosure">
                    <summary>
                      View observed changes <Code2 size={14} />
                    </summary>
                    <pre>{selected.evidence}</pre>
                  </details>
                </>
              ) : (
                <div className="empty-detail">
                  <MousePointer2 size={30} />
                  <h2>
                    {run.annotations.length
                      ? "Nothing in this filter"
                      : "No interactions found"}
                  </h2>
                  <p>
                    {run.annotations.length
                      ? "Choose another outcome to continue exploring."
                      : "Try a page with visible buttons, tabs or form controls."}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        {tab === "summary" && (
          <div className="summary-panel">
            <span className="eyebrow">THE BIG PICTURE</span>
            <h2>A clearer picture of this page.</h2>
            <p>
              Trace inspected {run.annotations.length} of {run.discovered}{" "}
              discovered elements. A state change is an observation, not a pass
              or fail assertion.
            </p>
            <div className="summary-bars">
              {[
                {
                  label: "State changed",
                  count: counts.changed,
                  name: "changed",
                },
                {
                  label: "No observed change",
                  count: counts.unchanged,
                  name: "unchanged",
                },
                {
                  label: "Left untouched",
                  count: counts.skipped,
                  name: "skipped",
                },
              ].map((item) => (
                <div key={item.name}>
                  <span>
                    <StatusDot outcome={item.name} />
                    {item.label}
                  </span>
                  <div className="summary-track">
                    <i
                      className={item.name}
                      style={{
                        width: `${run.annotations.length ? (item.count / run.annotations.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </div>
            <dl className="summary-facts">
              <div>
                <dt>Captured</dt>
                <dd>{new Date(run.startedAt).toLocaleString()}</dd>
              </div>
              <div>
                <dt>Analysis</dt>
                <dd>
                  {run.mode === "ai"
                    ? "AI assisted, with observed fallback"
                    : "Observed browser evidence"}
                </dd>
              </div>
              <div>
                <dt>Viewport</dt>
                <dd>
                  {run.viewport} · {run.dimensions.width} ×{" "}
                  {run.dimensions.height}
                </dd>
              </div>
              <div>
                <dt>Storage</dt>
                <dd>
                  {run.example
                    ? "Bundled playground example"
                    : "This browser only"}
                </dd>
              </div>
            </dl>
          </div>
        )}
        {tab === "json" && (
          <div className="json-panel">
            <div>
              <h2>Structured report</h2>
              <p>
                Screenshot data is omitted from this preview. Export JSON
                includes the complete captures.
              </p>
            </div>
            <pre>
              {JSON.stringify(
                {
                  ...run,
                  annotations: run.annotations.map(
                    ({ screenshot_before, screenshot_after, ...item }) => ({
                      ...item,
                      screenshot_before: screenshot_before
                        ? "[base64 image in export]"
                        : undefined,
                      screenshot_after: screenshot_after
                        ? "[base64 image in export]"
                        : undefined,
                    }),
                  ),
                },
                null,
                2,
              )}
            </pre>
          </div>
        )}
      </section>
      <dialog ref={dialog} className="screenshot-dialog">
        <header>
          <strong>
            {selected?.element_aria_label} ·{" "}
            {capture === "before" ? "Before" : "After"}
          </strong>
          <button
            type="button"
            className="icon-button"
            aria-label="Close enlarged screenshot"
            onClick={() => dialog.current?.close()}
          >
            <X size={20} />
          </button>
        </header>
        {selected &&
          imageSource(selected, capture === "before" ? "before" : "after") && (
            <Image
              unoptimized
              src={imageSource(
                selected,
                capture === "before" ? "before" : "after",
              )}
              width={run.dimensions.width}
              height={run.dimensions.height}
              alt={`Enlarged ${capture === "before" ? "before" : "after"} capture`}
            />
          )}
      </dialog>
    </>
  );
}
