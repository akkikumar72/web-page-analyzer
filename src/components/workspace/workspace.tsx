"use client";

import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  ExternalLink,
  FlaskConical,
  FolderClock,
  Globe2,
  LayoutDashboard,
  Loader2,
  Menu,
  Monitor,
  Moon,
  MousePointer2,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Square,
  Sun,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { deleteRun, exportRun, loadRuns, saveRun } from "@/lib/run-storage";
import {
  type AnalysisRun,
  DEFAULT_PREFERENCES,
  durationLabel,
  type Preferences,
  type RunProgress,
  runCounts,
} from "@/types/analysis";
import { ReportInspector } from "./report-inspector";

export type WorkspaceView =
  | "overview"
  | "history"
  | "saved"
  | "settings"
  | "guide";
const labels = {
  overview: "Overview",
  history: "Run history",
  saved: "Saved reports",
  settings: "Preferences",
  guide: "Documentation",
};
const NAVIGATION = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, href: "/" },
  { id: "history", label: "Run history", icon: FolderClock, href: "/history" },
  { id: "saved", label: "Saved reports", icon: Bookmark, href: "/saved" },
] as const;
const dateLabel = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export function Workspace({ view }: { view: WorkspaceView }) {
  const router = useRouter();
  const [runs, setRuns] = useState<AnalysisRun[]>([]);
  const [current, setCurrent] = useState<AnalysisRun | null>(null);
  const [example, setExample] = useState<AnalysisRun | null>(null);
  const [preferences, setPreferences] =
    useState<Preferences>(DEFAULT_PREFERENCES);
  const [ready, setReady] = useState(false);
  const [configuration, setConfiguration] = useState({
    aiConfigured: false,
    browserReady: true,
  });
  const [url, setUrl] = useState("");
  const [playground, setPlayground] = useState(true);
  const [setupOpen, setSetupOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<RunProgress | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [historyQuery, setHistoryQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const request = useRef<AbortController | null>(null);
  const urlInput = useRef<HTMLInputElement>(null);
  const mobileMenu = useRef<HTMLDialogElement>(null);
  const deleteDialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    let mounted = true;
    try {
      const saved = JSON.parse(
        localStorage.getItem("trace-preferences") || "null",
      );
      if (saved)
        setPreferences({
          theme: ["light", "dark", "system"].includes(saved.theme)
            ? saved.theme
            : "light",
          viewport: saved.viewport === "mobile" ? "mobile" : "desktop",
          limit: [4, 8, 15].includes(saved.limit) ? saved.limit : 8,
          ai: saved.ai === true,
        });
    } catch {
      /* Use defaults when settings cannot be read. */
    }
    void Promise.all([
      loadRuns().catch(() => {
        if (mounted)
          setNotice(
            "Browser storage is unavailable. Reports can still be exported.",
          );
        return [];
      }),
      fetch("/example-report.json")
        .then((response) =>
          response.ok ? (response.json() as Promise<AnalysisRun>) : null,
        )
        .catch(() => null),
    ]).then(([stored, bundled]) => {
      if (!mounted) return;
      setRuns(stored);
      setExample(bundled);
      let activeId: string | null = null;
      try {
        activeId = sessionStorage.getItem("trace-active-run");
      } catch {
        /* Storage can be disabled. */
      }
      setCurrent(
        stored.find((run) => run.id === activeId) || stored[0] || bundled,
      );
      setSetupOpen(
        new URLSearchParams(window.location.search).has("new") ||
          (!stored.length && !bundled),
      );
      setReady(true);
    });
    void fetch("/api/analyze")
      .then((response) => response.json())
      .then((data) => {
        if (mounted) setConfiguration(data);
      })
      .catch(() => {});
    return () => {
      mounted = false;
      request.current?.abort();
    };
  }, []);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.dataset.theme =
        preferences.theme === "system"
          ? media.matches
            ? "dark"
            : "light"
          : preferences.theme;
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [preferences.theme]);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      const editable =
        event.target instanceof HTMLElement &&
        ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName);
      if (
        (event.key === "k" && (event.metaKey || event.ctrlKey)) ||
        (event.key === "/" && !editable)
      ) {
        event.preventDefault();
        setSetupOpen(true);
        if (view !== "overview") router.push("/?new=1");
        setTimeout(() => urlInput.current?.focus(), 100);
      }
    };
    document.addEventListener("keydown", keydown);
    return () => document.removeEventListener("keydown", keydown);
  }, [router, view]);
  const updatePreferences = (patch: Partial<Preferences>) => {
    const updated = { ...preferences, ...patch };
    setPreferences(updated);
    try {
      localStorage.setItem("trace-preferences", JSON.stringify(updated));
    } catch {
      setNotice(
        "Preferences apply for this session. Browser storage is unavailable.",
      );
    }
  };
  const openRun = (run: AnalysisRun) => {
    setCurrent(run);
    setSetupOpen(false);
    setError("");
    try {
      sessionStorage.setItem("trace-active-run", run.id);
    } catch {
      /* The report still opens in memory. */
    }
    if (view !== "overview") router.push("/");
  };
  const store = async (run: AnalysisRun) => {
    await saveRun(run);
    setRuns((previous) =>
      [run, ...previous.filter((item) => item.id !== run.id)].sort((a, b) =>
        b.startedAt.localeCompare(a.startedAt),
      ),
    );
  };
  const bookmark = async (run: AnalysisRun) => {
    const updated = { ...run, bookmarked: !run.bookmarked };
    try {
      await store(updated);
      if (current?.id === run.id) setCurrent(updated);
      setNotice(
        updated.bookmarked
          ? "Report added to Saved reports."
          : "Report removed from Saved reports.",
      );
    } catch (failure) {
      setNotice(
        failure instanceof Error
          ? failure.message
          : "Could not save this report.",
      );
    }
  };
  const analyze = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    setProgress({
      type: "progress",
      stage: "opening",
      label: "Connecting to the browser",
      completed: 0,
      total: 0,
    });
    const controller = new AbortController();
    request.current = controller;
    let result: AnalysisRun | null = null;
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/x-ndjson",
        },
        body: JSON.stringify({
          url: url.trim(),
          playground,
          viewport: preferences.viewport,
          limit: preferences.limit,
          ai: preferences.ai && configuration.aiConfigured,
        }),
        signal: controller.signal,
      });
      if (!response.ok) {
        const failure = await response.json();
        throw new Error(failure.error || "Analysis could not start.");
      }
      if (!response.body)
        throw new Error("The browser did not receive a response stream.");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const message = JSON.parse(line);
          if (message.type === "progress") setProgress(message);
          if (message.type === "error") throw new Error(message.error);
          if (message.type === "result") result = message.run;
        }
      }
      if (!result)
        throw new Error(
          "The run ended before a report was returned. Please retry.",
        );
      openRun(result);
      try {
        await store(result);
        setNotice("Analysis complete. Your report is saved in this browser.");
      } catch (failure) {
        setNotice(
          failure instanceof Error
            ? failure.message
            : "Export this report to keep a copy.",
        );
      }
    } catch (failure) {
      if (controller.signal.aborted)
        setNotice(
          "Analysis canceled. Your previous report is still available.",
        );
      else
        setError(
          failure instanceof Error
            ? failure.message
            : "Analysis failed. Please try again.",
        );
    } finally {
      setBusy(false);
      setProgress(null);
      request.current = null;
    }
  };
  const newAnalysis = () => {
    setSetupOpen(true);
    setError("");
    if (view !== "overview") router.push("/?new=1");
    setTimeout(() => urlInput.current?.focus(), 100);
  };
  const remove = async () => {
    if (!deleteId) return;
    try {
      await deleteRun(deleteId);
      setRuns((items) => items.filter((run) => run.id !== deleteId));
      if (current?.id === deleteId) setCurrent(example);
      setNotice("Report deleted from this browser.");
      deleteDialog.current?.close();
      setDeleteId(null);
    } catch {
      setNotice("Could not delete this report. Please try again.");
    }
  };
  const navigate = (event: React.MouseEvent) => {
    if (busy) event.preventDefault();
    else mobileMenu.current?.close();
  };
  const savedCount = runs.filter((run) => run.bookmarked).length;
  const navigation = (
    <>
      <Link
        className="brand"
        href="/"
        onClick={navigate}
        aria-label="Trace overview"
      >
        <span className="brand-mark">
          <i />
          <i />
        </span>
        <span>
          trace<span className="brand-period">.</span>
        </span>
      </Link>
      <div className="workspace-selector">
        <span className="workspace-avatar">A</span>
        <span>
          <strong>Personal workspace</strong>
          <small>Local to this browser</small>
        </span>
      </div>
      <span className="nav-label">WORKSPACE</span>
      <nav aria-label="Workspace navigation">
        {NAVIGATION.map(({ id, label, icon: Icon, href }) => (
          <Link
            className={`nav-item ${view === id ? "active" : ""}`}
            aria-current={view === id ? "page" : undefined}
            aria-disabled={busy}
            onClick={navigate}
            key={id}
            href={href}
          >
            <Icon size={18} />
            <span>{label}</span>
            {id !== "overview" && (
              <small>{id === "history" ? runs.length : savedCount}</small>
            )}
          </Link>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="playground-card">
          <span className="playground-icon">
            <FlaskConical size={19} />
          </span>
          <strong>A little room to explore.</strong>
          <p>See how real interactions become useful insights.</p>
          <Link href="/playground" onClick={navigate}>
            Open the playground <ArrowUpRight size={14} />
          </Link>
        </div>
        <nav aria-label="Workspace resources">
          <Link
            className={`nav-item ${view === "settings" ? "active" : ""}`}
            aria-current={view === "settings" ? "page" : undefined}
            href="/settings"
            onClick={navigate}
          >
            <Settings2 size={18} />
            Preferences
          </Link>
          <Link
            className={`nav-item ${view === "guide" ? "active" : ""}`}
            aria-current={view === "guide" ? "page" : undefined}
            href="/guide"
            onClick={navigate}
          >
            <BookOpen size={18} />
            Documentation
            <ArrowUpRight size={13} />
          </Link>
        </nav>
        <div className="sidebar-person">
          <span className="person-avatar">AP</span>
          <div>
            <strong>Your workspace</strong>
            <small>Made for the details.</small>
          </div>
          <span className="local-dot" />
        </div>
      </div>
    </>
  );
  const shownRuns = runs.filter(
    (run) =>
      (view !== "saved" || run.bookmarked) &&
      `${run.title} ${run.url}`
        .toLowerCase()
        .includes(historyQuery.toLowerCase()),
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">{navigation}</aside>
      <dialog className="mobile-menu" ref={mobileMenu}>
        <button
          type="button"
          className="icon-button mobile-close"
          aria-label="Close navigation"
          onClick={() => mobileMenu.current?.close()}
        >
          <X size={20} />
        </button>
        {navigation}
      </dialog>
      <div className="workspace-main">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              type="button"
              className="icon-button menu-trigger"
              aria-label="Open navigation"
              onClick={() => mobileMenu.current?.showModal()}
            >
              <Menu size={21} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={13} />
            <strong>{labels[view]}</strong>
          </div>
          <div className="topbar-actions">
            <span className="local-status">
              <span className="local-dot" />
              Local workspace
            </span>
            <button
              type="button"
              className="shortcut-button"
              aria-label="Start a new analysis"
              onClick={newAnalysis}
            >
              <Search size={15} />
              <kbd>⌘ K</kbd>
            </button>
            <Link
              className="icon-button help-link"
              href="/guide"
              aria-label="Help and documentation"
            >
              <CircleHelp size={18} />
            </Link>
          </div>
        </header>
        <main id="main-content" className="workspace-content">
          <div className="page-heading">
            <div>
              <span className="eyebrow">A CLOSER LOOK AT YOUR INTERFACE</span>
              <h1>{view === "overview" ? "Run overview" : labels[view]}</h1>
              <p>
                {view === "overview"
                  ? "Every click has a story. See what happens next."
                  : view === "history"
                    ? "Your previous explorations, all in one place."
                    : view === "saved"
                      ? "Keep the reports worth coming back to."
                      : view === "settings"
                        ? "A workspace that works the way you do."
                        : "From a single click to a clearer understanding."}
              </p>
            </div>
            <div className="page-actions">
              {view === "overview" && current && (
                <button
                  className="secondary-button export-button"
                  type="button"
                  onClick={() => exportRun(current)}
                >
                  <ArrowDownToLine size={15} />
                  Export JSON
                </button>
              )}
              <button
                type="button"
                className="primary-button"
                onClick={newAnalysis}
                disabled={busy}
              >
                <Plus size={16} />
                New analysis
              </button>
            </div>
          </div>
          {notice && (
            <output className="notice">
              <Check size={15} />
              <span>{notice}</span>
              <button
                type="button"
                className="icon-button"
                aria-label="Dismiss notice"
                onClick={() => setNotice("")}
              >
                <X size={15} />
              </button>
            </output>
          )}
          {view === "overview" && (
            <>
              {(setupOpen || busy) && (
                <section className="run-setup" aria-label="New analysis">
                  <div className="setup-heading">
                    <div>
                      <span className="setup-icon">
                        <Globe2 size={18} />
                      </span>
                      <h2>Where should we look?</h2>
                    </div>
                    {current && !busy && (
                      <button
                        type="button"
                        className="icon-button"
                        aria-label="Close new analysis"
                        onClick={() => setSetupOpen(false)}
                      >
                        <X size={17} />
                      </button>
                    )}
                  </div>
                  <form onSubmit={analyze}>
                    <fieldset
                      className="target-toggle"
                      aria-label="Analysis target"
                    >
                      <button
                        type="button"
                        aria-pressed={!playground}
                        disabled={busy}
                        onClick={() => setPlayground(false)}
                      >
                        Your website
                      </button>
                      <button
                        type="button"
                        aria-pressed={playground}
                        disabled={busy}
                        onClick={() => setPlayground(true)}
                      >
                        <FlaskConical size={13} />
                        Playground
                      </button>
                    </fieldset>
                    <div className="url-row">
                      <label>
                        <Globe2 size={18} />
                        <input
                          ref={urlInput}
                          type={playground ? "text" : "url"}
                          aria-label="Website URL"
                          placeholder="https://your-website.com"
                          readOnly={playground}
                          required={!playground}
                          value={
                            playground ? "Built-in component playground" : url
                          }
                          disabled={busy}
                          onChange={(event) => setUrl(event.target.value)}
                        />
                      </label>
                      <button
                        className="primary-button"
                        type="submit"
                        disabled={busy || (!playground && !url.trim())}
                      >
                        {busy ? (
                          <Loader2 className="spin" size={16} />
                        ) : (
                          <MousePointer2 size={16} />
                        )}
                        {busy ? "Analyzing…" : "Run analysis"}
                        <ArrowRight size={15} />
                      </button>
                    </div>
                    <div className="run-options">
                      <label>
                        <Monitor size={14} />
                        <select
                          aria-label="Analysis viewport"
                          value={preferences.viewport}
                          disabled={busy}
                          onChange={(event) =>
                            updatePreferences({
                              viewport: event.target
                                .value as Preferences["viewport"],
                            })
                          }
                        >
                          <option value="desktop">Desktop · 1280 px</option>
                          <option value="mobile">Mobile · 390 px</option>
                        </select>
                      </label>
                      <label>
                        <MousePointer2 size={14} />
                        <select
                          aria-label="Interaction limit"
                          value={preferences.limit}
                          disabled={busy}
                          onChange={(event) =>
                            updatePreferences({
                              limit: Number(event.target.value),
                            })
                          }
                        >
                          <option value={4}>4 interactions</option>
                          <option value={8}>8 interactions</option>
                          <option value={15}>15 interactions</option>
                        </select>
                      </label>
                      <label className="ai-option">
                        <input
                          type="checkbox"
                          checked={preferences.ai && configuration.aiConfigured}
                          disabled={busy || !configuration.aiConfigured}
                          onChange={(event) =>
                            updatePreferences({ ai: event.target.checked })
                          }
                        />
                        AI summaries
                        {!configuration.aiConfigured && (
                          <span>Not configured</span>
                        )}
                      </label>
                    </div>
                    <p className="setup-note">
                      <ShieldCheck size={13} />
                      {playground
                        ? "A real local test. No API key needed."
                        : "Use public documentation or test pages you control. Forms are not submitted."}
                      <Link href="/guide">
                        How it works <ArrowUpRight size={12} />
                      </Link>
                    </p>
                  </form>
                </section>
              )}
              {error && (
                <div role="alert" className="error-message">
                  <strong>We couldn’t complete this run.</strong>
                  <p>{error}</p>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => {
                      setError("");
                      setSetupOpen(true);
                    }}
                  >
                    Review run settings <ArrowRight size={14} />
                  </button>
                </div>
              )}
              {busy && progress && (
                <section
                  className="run-progress"
                  aria-label="Analysis progress"
                >
                  <span className="running-symbol">
                    <MousePointer2 size={23} />
                  </span>
                  <div>
                    <span className="eyebrow">
                      {progress.stage === "opening"
                        ? "OPENING BROWSER"
                        : progress.stage === "discovering"
                          ? "DISCOVERING ELEMENTS"
                          : "INSPECTING INTERACTIONS"}
                    </span>
                    <h2>{progress.label}</h2>
                    <p>
                      {progress.total
                        ? `${progress.completed} of ${progress.total} interactions inspected`
                        : "Preparing an isolated session for this page."}
                    </p>
                    <progress
                      value={progress.total ? progress.completed : undefined}
                      max={progress.total || 1}
                    />
                  </div>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => request.current?.abort()}
                  >
                    <Square size={12} />
                    Cancel run
                  </button>
                </section>
              )}
              {!busy && current && (
                <>
                  <div className="run-title-row">
                    <div className="run-site-icon">
                      <Globe2 size={19} />
                    </div>
                    <div className="run-site">
                      <h2>{current.title}</h2>
                      <p>
                        {current.url === "/playground"
                          ? "Built-in playground"
                          : current.url}
                        <span>·</span>
                        {dateLabel(current.startedAt)}
                      </p>
                    </div>
                    <div className="run-title-actions">
                      {current.example && (
                        <span className="example-badge">Example report</span>
                      )}
                      <span className="complete-badge">
                        <span className="status-dot changed" />
                        Complete
                      </span>
                      <button
                        type="button"
                        className={`icon-button bookmark-button ${current.bookmarked ? "is-saved" : ""}`}
                        aria-label={
                          current.bookmarked ? "Unsave report" : "Save report"
                        }
                        aria-pressed={current.bookmarked}
                        onClick={() => void bookmark(current)}
                      >
                        <Bookmark
                          size={18}
                          fill={current.bookmarked ? "currentColor" : "none"}
                        />
                      </button>
                      <button
                        type="button"
                        className="icon-button"
                        aria-label="Configure a new run"
                        onClick={newAnalysis}
                      >
                        <SlidersHorizontal size={17} />
                      </button>
                    </div>
                  </div>
                  {current.example && (
                    <p className="example-note">
                      A recorded run against our interactive playground. Start a
                      new analysis to capture your own.
                    </p>
                  )}
                  <ReportInspector key={current.id} run={current} />
                </>
              )}
              {!busy && !current && (
                <section className="welcome-panel">
                  <div className="welcome-art" aria-hidden="true">
                    <div className="art-window">
                      <span />
                      <span />
                      <span />
                      <div className="art-row">
                        <i />
                        <b />
                        <em />
                      </div>
                      <div className="art-row">
                        <i />
                        <b />
                        <em />
                      </div>
                      <div className="art-row">
                        <i />
                        <b />
                        <em />
                      </div>
                    </div>
                    <span className="art-cursor">
                      <MousePointer2 size={36} />
                    </span>
                    <span className="art-label">
                      <Check size={14} />
                      State change captured
                    </span>
                  </div>
                  <h2>
                    {ready
                      ? "Good interfaces are in the details."
                      : "Opening your workspace…"}
                  </h2>
                  <p>
                    Explore a page, inspect what changed, and keep the evidence.
                    Start with the playground to see Trace in action.
                  </p>
                  {example && (
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => openRun(example)}
                    >
                      Explore example report <ArrowRight size={15} />
                    </button>
                  )}
                </section>
              )}
            </>
          )}
          {(view === "history" || view === "saved") && (
            <section className="history-panel">
              <div className="history-toolbar">
                <h2>
                  {view === "saved" ? "Your collection" : "All analyses"}
                  <span>{shownRuns.length}</span>
                </h2>
                <label className="search-control">
                  <Search size={15} />
                  <input
                    value={historyQuery}
                    onChange={(event) => setHistoryQuery(event.target.value)}
                    aria-label="Search reports"
                    placeholder="Search reports…"
                  />
                </label>
              </div>
              {shownRuns.length ? (
                <div className="history-table">
                  <div className="history-table-header">
                    <span>Page / report</span>
                    <span>Interactions</span>
                    <span>Duration</span>
                    <span>Captured</span>
                    <span />
                  </div>
                  {shownRuns.map((run) => (
                    <div className="history-row" key={run.id}>
                      <button
                        className="history-open"
                        type="button"
                        onClick={() => openRun(run)}
                      >
                        <span className="run-site-icon">
                          <Globe2 size={18} />
                        </span>
                        <span>
                          <strong>{run.title}</strong>
                          <small>
                            {run.example
                              ? "Recorded example"
                              : run.url === "/playground"
                                ? "Playground"
                                : run.url}{" "}
                            · {run.viewport}
                          </small>
                        </span>
                      </button>
                      <span>
                        {run.annotations.length}
                        <small>{runCounts(run).changed} changed</small>
                      </span>
                      <span>{durationLabel(run.duration)}</span>
                      <span>{dateLabel(run.startedAt)}</span>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="icon-button"
                          aria-label={`${run.bookmarked ? "Unsave" : "Save"} ${run.title}`}
                          onClick={() => void bookmark(run)}
                        >
                          <Bookmark
                            size={16}
                            fill={run.bookmarked ? "currentColor" : "none"}
                          />
                        </button>
                        <button
                          type="button"
                          className="icon-button"
                          aria-label={`Export ${run.title}`}
                          onClick={() => exportRun(run)}
                        >
                          <ArrowDownToLine size={16} />
                        </button>
                        <button
                          type="button"
                          className="icon-button"
                          aria-label={`Delete ${run.title}`}
                          onClick={() => {
                            setDeleteId(run.id);
                            deleteDialog.current?.showModal();
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="large-empty">
                  {view === "saved" ? (
                    <Bookmark size={32} />
                  ) : (
                    <Clock3 size={32} />
                  )}
                  <h2>
                    {historyQuery
                      ? "No matching reports"
                      : view === "saved"
                        ? "A home for useful discoveries."
                        : "Your next discovery starts here."}
                  </h2>
                  <p>
                    {historyQuery
                      ? "Try a different title or website address."
                      : view === "saved"
                        ? "Bookmark a report from the overview or run history to keep it here."
                        : "Run your first analysis. Reports and screenshots stay in this browser."}
                  </p>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={
                      historyQuery ? () => setHistoryQuery("") : newAnalysis
                    }
                  >
                    {historyQuery ? "Clear search" : "Start an analysis"}
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </section>
          )}
          {view === "settings" && (
            <div className="settings-layout">
              <section className="settings-panel">
                <h2>Make yourself at home.</h2>
                <p>These preferences are stored on this device.</p>
                <div className="setting-row">
                  <div>
                    <h3>Appearance</h3>
                    <p>A comfortable view, day or night.</p>
                  </div>
                  <fieldset
                    className="appearance-options"
                    aria-label="Appearance"
                  >
                    {[
                      { value: "light", icon: Sun, label: "Light" },
                      { value: "dark", icon: Moon, label: "Dark" },
                      { value: "system", icon: Monitor, label: "System" },
                    ].map(({ value, icon: Icon, label }) => (
                      <button
                        type="button"
                        key={value}
                        aria-pressed={preferences.theme === value}
                        onClick={() =>
                          updatePreferences({
                            theme: value as Preferences["theme"],
                          })
                        }
                      >
                        <Icon size={17} />
                        {label}
                      </button>
                    ))}
                  </fieldset>
                </div>
                <div className="setting-row">
                  <div>
                    <h3>Default viewport</h3>
                    <p>The browser size used for a new run.</p>
                  </div>
                  <select
                    aria-label="Default viewport"
                    value={preferences.viewport}
                    onChange={(event) =>
                      updatePreferences({
                        viewport: event.target.value as Preferences["viewport"],
                      })
                    }
                  >
                    <option value="desktop">Desktop · 1280 × 800</option>
                    <option value="mobile">Mobile · 390 × 844</option>
                  </select>
                </div>
                <div className="setting-row">
                  <div>
                    <h3>Interaction limit</h3>
                    <p>Choose a focused check or a wider exploration.</p>
                  </div>
                  <select
                    aria-label="Default interaction limit"
                    value={preferences.limit}
                    onChange={(event) =>
                      updatePreferences({ limit: Number(event.target.value) })
                    }
                  >
                    <option value={4}>4 interactions</option>
                    <option value={8}>8 interactions</option>
                    <option value={15}>15 interactions</option>
                  </select>
                </div>
                <div className="setting-row">
                  <div>
                    <h3>AI summaries</h3>
                    <p>
                      {configuration.aiConfigured
                        ? "Add a written interpretation to observed browser evidence."
                        : "Add OPENAI_API_KEY to the server to enable. Evidence mode is ready now."}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    aria-label="Enable AI summaries by default"
                    disabled={!configuration.aiConfigured}
                    checked={preferences.ai && configuration.aiConfigured}
                    onChange={(event) =>
                      updatePreferences({ ai: event.target.checked })
                    }
                  />
                </div>
              </section>
              <aside className="storage-note">
                <ShieldCheck size={24} />
                <h2>Your reports stay with you.</h2>
                <p>
                  Run history and captures live in this browser’s IndexedDB.
                  They are not synced to an account.
                </p>
                <p>
                  Export JSON to keep a portable copy. Clearing browser site
                  data removes your local history.
                </p>
                <Link href="/history">
                  Manage your reports <ArrowRight size={14} />
                </Link>
              </aside>
            </div>
          )}
          {view === "guide" && (
            <div className="guide-layout">
              <section className="guide-panel">
                <span className="eyebrow">MEET TRACE</span>
                <h2>
                  Follow the interaction.
                  <br />
                  Understand the change.
                </h2>
                <p>
                  Trace opens a page in Chromium, finds visible controls, and
                  records what changes when it interacts with them. Screenshots
                  sit alongside observed accessibility changes so you can
                  inspect the evidence yourself.
                </p>
                <div className="guide-steps">
                  {[
                    {
                      title: "Choose a page",
                      body: "Use a public documentation page or a test page you control. The built-in playground is a real, local interface and needs no API key.",
                    },
                    {
                      title: "Capture the interactions",
                      body: "Choose desktop or mobile and an interaction limit. Each control starts from a fresh page load, keeping the starting state consistent.",
                    },
                    {
                      title: "Look a little closer",
                      body: "Filter the interaction list, compare before and after, inspect selectors, and read the observed changes. A changed state is not automatically a passing test.",
                    },
                    {
                      title: "Keep the useful parts",
                      body: "Bookmark reports in this browser or export complete JSON, including screenshots. No cloud account or subscription is required.",
                    },
                  ].map((step, index) => (
                    <article key={step.title}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <h3>{step.title}</h3>
                        <p>{step.body}</p>
                      </div>
                    </article>
                  ))}
                </div>
                <h3>What’s included</h3>
                <p>
                  Buttons, tabs, switches, checkboxes, text inputs, selects, and
                  same-site links. Disabled controls and unsupported actions are
                  reported as skipped. Passwords and file inputs are left alone;
                  forms are not submitted, cross-site links are not followed,
                  and non-read network requests are blocked.
                </p>
                <h3>Observed evidence and AI</h3>
                <p>
                  Evidence mode compares the accessible page state. It works
                  without an API key and does not claim to detect every visual
                  change. Optional AI summaries send control labels and a
                  limited state diff to OpenAI. If AI is unavailable, observed
                  evidence remains in the report.
                </p>
                <h3>Run locally</h3>
                <pre>
                  bun install{"\n"}bunx playwright install chromium{"\n"}bun run
                  dev --port 3040
                </pre>
                <p>
                  This is a local inspection tool. A public deployment needs
                  access control and a sandboxed browser worker. No hosted
                  service is included.
                </p>
                <a
                  className="text-button"
                  href="https://github.com/akkikumar72/web-page-analyzer"
                  target="_blank"
                  rel="noreferrer"
                >
                  View source on GitHub <ExternalLink size={14} />
                </a>
              </section>
              <aside className="guide-aside">
                <span className="guide-icon">
                  <FlaskConical size={26} />
                </span>
                <h3>A good place to start.</h3>
                <p>
                  Our Orbit playground includes billing controls, a switch, an
                  accordion, tabs and a dialog. Every change is real and stays
                  local.
                </p>
                <Link className="secondary-button" href="/playground">
                  Open playground <ArrowUpRight size={15} />
                </Link>
                <div className="guide-shortcut">
                  <kbd>⌘ / Ctrl K</kbd>
                  <span>Start a new analysis</span>
                </div>
              </aside>
            </div>
          )}
          <footer className="workspace-footer">
            <span>
              <span className="footer-mark">t.</span> A clearer view of what
              happens next.
            </span>
            <span>
              Built with Playwright <i>·</i>
              <Link href="/guide">
                About Trace <ArrowUpRight size={11} />
              </Link>
            </span>
          </footer>
        </main>
      </div>
      <dialog ref={deleteDialog} className="confirm-dialog">
        <span className="eyebrow">LOCAL REPORT</span>
        <h2>Delete this report?</h2>
        <p>
          The report and its screenshots will be removed from this browser.
          Export a copy first if you want to keep it.
        </p>
        <div>
          <button
            className="secondary-button"
            type="button"
            onClick={() => deleteDialog.current?.close()}
          >
            Keep report
          </button>
          <button
            className="danger-button"
            type="button"
            onClick={() => void remove()}
          >
            Delete report
          </button>
        </div>
      </dialog>
    </div>
  );
}
