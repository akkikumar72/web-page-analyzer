import { Brain, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Screenshot } from "@/components/ui/screenshot";
import { TechDetails } from "@/components/ui/tech-details";
import type { Annotation } from "@/types/annotation";

interface AnalysisResultsProps {
  data: Annotation[];
}

export function AnalysisResults({ data }: AnalysisResultsProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between p-6 bg-success/10 rounded-2xl border border-success/20">
        <div>
          <h2 className="text-3xl font-bold text-accent mb-2">
            Analysis Complete!
          </h2>
          <p className="text-base-content/70">
            Successfully analyzed interactive elements
          </p>
        </div>
        <div className="text-right">
          <Badge variant="accent" size="lg" className="badge-outline text-lg px-6 py-3">
            {data.length} interaction{data.length !== 1 ? "s" : ""} found
          </Badge>
        </div>
      </div>

      <div className="grid gap-8">
        {data.map((annotation, index) => (
          <div
            key={`${annotation.element_aria_label}-${annotation.coordinates.x}-${annotation.coordinates.y}-${index}`}
            className="card glass backdrop-blur-sm overflow-hidden hover:shadow-2xl transition-all duration-300 shadow-xl"
          >
            <div className="card-body">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="primary" size="sm">
                      {annotation.element_type}
                    </Badge>
                    <Badge variant="outline" size="sm">
                      #{index + 1}
                    </Badge>
                  </div>
                  <h2 className="card-title text-xl">
                    {annotation.element_aria_label}
                  </h2>
                  <p className="flex items-center gap-2 text-base text-base-content/70">
                    <MapPin className="h-5 w-5 text-accent" />
                    {annotation.website_section}
                  </p>
                </div>
              </div>
            </div>

            <div className="card-body space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-base-200/50 p-6 rounded-xl">
                  <h4 className="font-bold text-base text-base-content mb-3 flex items-center gap-2">
                    <div className="w-3 h-3 bg-warning rounded-full"></div>
                    Before State
                  </h4>
                  <p className="text-sm text-base-content/80 leading-relaxed">
                    {annotation.state_before}
                  </p>
                </div>
                <div className="bg-base-200/50 p-6 rounded-xl">
                  <h4 className="font-bold text-base text-base-content mb-3 flex items-center gap-2">
                    <div className="w-3 h-3 bg-success rounded-full"></div>
                    After State
                  </h4>
                  <p className="text-sm text-base-content/80 leading-relaxed">
                    {annotation.state_after}
                  </p>
                </div>
              </div>

              <div className="bg-primary/5 p-6 rounded-xl border border-primary/20">
                <h4 className="font-bold text-base text-base-content mb-3 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  AI Analysis
                </h4>
                <p className="text-sm text-base-content/80 leading-relaxed">
                  {annotation.change_analysis}
                </p>
              </div>

              <TechDetails
                selector={annotation.element_selector}
                coordinates={annotation.coordinates}
              />

              {(annotation.screenshot_before ||
                annotation.screenshot_after) && (
                <div className="grid md:grid-cols-2 gap-6">
                  {annotation.screenshot_before && (
                    <Screenshot
                      src={`data:image/png;base64,${annotation.screenshot_before}`}
                      alt="Before interaction"
                      title="Before Screenshot"
                      type="before"
                    />
                  )}
                  {annotation.screenshot_after && (
                    <Screenshot
                      src={`data:image/png;base64,${annotation.screenshot_after}`}
                      alt="After interaction"
                      title="After Screenshot"
                      type="after"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
