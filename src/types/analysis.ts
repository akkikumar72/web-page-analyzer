import type { Annotation } from "./annotation";

export type Outcome = "changed" | "unchanged" | "skipped";
export type Viewport = "desktop" | "mobile";
export interface Interaction extends Annotation {
  id: string;
  outcome: Outcome;
  duration: number;
  action: string;
  evidence: string;
  analysisSource: "observed" | "ai";
  screenshot_mime: "image/jpeg";
}
export interface AnalysisRun {
  id: string;
  url: string;
  title: string;
  startedAt: string;
  duration: number;
  viewport: Viewport;
  dimensions: { width: number; height: number };
  mode: "evidence" | "ai";
  discovered: number;
  annotations: Interaction[];
  bookmarked: boolean;
  example?: boolean;
}
export interface RunProgress {
  type: "progress";
  stage: "opening" | "discovering" | "inspecting";
  label: string;
  completed: number;
  total: number;
}
export interface Preferences {
  theme: "light" | "dark" | "system";
  viewport: Viewport;
  limit: number;
  ai: boolean;
}
export const DEFAULT_PREFERENCES: Preferences = {
  theme: "light",
  viewport: "desktop",
  limit: 8,
  ai: false,
};
export const durationLabel = (milliseconds: number) =>
  milliseconds < 1000
    ? `${Math.round(milliseconds)} ms`
    : `${(milliseconds / 1000).toFixed(1)} s`;
export function runCounts(run: AnalysisRun) {
  return {
    changed: run.annotations.filter((item) => item.outcome === "changed")
      .length,
    unchanged: run.annotations.filter((item) => item.outcome === "unchanged")
      .length,
    skipped: run.annotations.filter((item) => item.outcome === "skipped")
      .length,
  };
}
