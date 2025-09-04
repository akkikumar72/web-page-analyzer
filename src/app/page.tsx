"use client";

import {
  AlertCircle,
  Bot,
  Brain,
  Eye,
  Layers,
  Loader2,
  Palette,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

import { useState } from "react";
import { AnalysisResults } from "@/components/ui/analysis-results";
import { AnalysisSkeleton } from "@/components/ui/analysis-skeleton";
import { Button } from "@/components/ui/button";
import { useAnalysisCache } from "@/hooks/useAnalysisCache";
import type { Annotation } from "@/types/annotation";

const QUICK_EXAMPLES = [
  {
    id: "shadcn-accordion",
    url: "https://ui.shadcn.com/docs/components/accordion",
    title: "shadcn/ui",
    description: "Accordion component docs",
    icon: Layers,
    theme: "primary",
  },
  {
    id: "vercel-ai-elements",
    url: "https://vercel.com/changelog/introducing-ai-elements",
    title: "Vercel",
    description: "AI Elements changelog",
    icon: Bot,
    theme: "secondary",
  },
  {
    id: "daisyui-button",
    url: "https://daisyui.com/components/button/",
    title: "DaisyUI",
    description: "Button component docs",
    icon: Palette,
    theme: "accent",
  },
] as const;

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Annotation[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { getFromCache, setCache } = useAnalysisCache({
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    maxSize: 50,
  });

  const handleQuickExample = (exampleUrl: string) => {
    setUrl(exampleUrl);
    setError(null);
    setData(null);
  };

  const analyze = async () => {
    setLoading(true);
    setError(null);
    setData(null);

    // Check cache first
    const cachedData = getFromCache(url);
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
      return;
    }

    try {
      const resp = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || "Failed");

      const annotations = json.annotations || [];
      setData(annotations);

      // Cache the result
      setCache(url, annotations);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-300 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-spin"
          style={{ animationDuration: "20s" }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        <div className="hero min-h-[20vh]">
          <div className="hero-content text-center">
            <div className="max-w-4xl">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Brain className="w-16 h-16 text-primary" />
                </div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-6 font-outfit">
              Annotating components with AI
              </h1>
              
              <p className="text-xl text-base-content/80 max-w-2xl mx-auto">
                Easily find interactive elements on any documentation website
              </p>
            </div>
          </div>
        </div>

        {/* Analysis Form */}
        <div className="card glass backdrop-blur-sm bg-base-100/80 mb-12 shadow-xl">
          <div className="card-body p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="card-title text-2xl mb-1">Analyze Website</h2>
                <p className="text-base text-base-content/70">
                  Enter a public documentation URL to analyze interactive
                  elements with AI
                </p>
              </div>
            </div>
            <div className="join w-full">
              <input
                type="url"
                placeholder="https://ui.shadcn.com/docs/components/button"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="input input-lg join-item flex-1"
                disabled={loading}
              />
              <button
                type="button"
                onClick={analyze}
                disabled={!url || loading}
                className="btn btn-lg btn-accent join-item min-w-[140px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5" />
                    Analyze
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-base-300/50">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-base-content/70 font-medium">
                  Quick examples
                </span>
                <Sparkles className="h-4 w-4 text-base-content/50" />
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_EXAMPLES.map((example) => (
                  <button
                    type="button"
                    key={example.id}
                    onClick={() => handleQuickExample(example.url)}
                    disabled={loading}
                    className={`badge badge-lg badge-${example.theme} badge-outline hover:badge-${example.theme} transition-all duration-200 cursor-pointer text-xs font-medium px-3 py-2 h-8`}
                  >
                    {example.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div role="alert" className="alert alert-error mb-8">
            <AlertCircle className="stroke-current shrink-0 h-6 w-6" />
            <span>{error}</span>
          </div>
        )}

        {!error && !loading && data && data.length === 0 && (
          <div className="card glass backdrop-blur-sm shadow-xl">
            <div className="card-body text-center py-16">
              <div className="p-4 bg-info/10 rounded-full w-fit mx-auto mb-6">
                <Eye className="h-12 w-12 text-info" />
              </div>
              <h3 className="text-2xl font-bold text-base-content mb-4">
                No interactions found
              </h3>
              <p className="text-base-content/70 max-w-md mx-auto mb-6">
                The analysis didn't detect any interactive elements on this
                page. Try a different URL or check if the page has clickable
                components.
              </p>
              <Button variant="outline" size="sm">
                Try Another URL
              </Button>
            </div>
          </div>
        )}

        {loading && <AnalysisSkeleton count={2} />}

        {!error && !loading && data && data.length > 0 && (
          <AnalysisResults data={data} />
        )}
      </div>
    </main>
  );
}
