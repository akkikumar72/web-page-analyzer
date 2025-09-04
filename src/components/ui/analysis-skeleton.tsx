interface AnalysisSkeletonProps {
  count?: number;
}

export function AnalysisSkeleton({ count = 3 }: AnalysisSkeletonProps) {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex items-center justify-between p-6 bg-base-200/30 rounded-2xl border border-base-300/20">
        <div>
          <div className="skeleton h-8 w-48 mb-2"></div>
          <div className="skeleton h-4 w-64"></div>
        </div>
        <div className="text-right">
          <div className="skeleton h-10 w-32 rounded-full"></div>
        </div>
      </div>

      {/* Results skeleton */}
      <div className="grid gap-8">
        {Array.from({ length: count }, (_, index) => index).map((index) => (
          <div
            key={`skeleton-${index}`}
            className="card glass backdrop-blur-sm overflow-hidden shadow-xl"
          >
            <div className="card-body">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="skeleton h-6 w-16 rounded-full"></div>
                    <div className="skeleton h-6 w-8 rounded-full"></div>
                  </div>
                  <div className="skeleton h-6 w-64"></div>
                  <div className="flex items-center gap-2">
                    <div className="skeleton h-5 w-5 rounded-full"></div>
                    <div className="skeleton h-4 w-32"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-body space-y-6">
              {/* Before/After state skeletons */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-base-200/50 p-6 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-warning rounded-full"></div>
                    <div className="skeleton h-4 w-24"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="skeleton h-3 w-full"></div>
                    <div className="skeleton h-3 w-3/4"></div>
                    <div className="skeleton h-3 w-1/2"></div>
                  </div>
                </div>
                <div className="bg-base-200/50 p-6 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-success rounded-full"></div>
                    <div className="skeleton h-4 w-24"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="skeleton h-3 w-full"></div>
                    <div className="skeleton h-3 w-2/3"></div>
                    <div className="skeleton h-3 w-3/4"></div>
                  </div>
                </div>
              </div>

              {/* AI Analysis skeleton */}
              <div className="bg-primary/5 p-6 rounded-xl border border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="skeleton h-5 w-5 rounded-full"></div>
                  <div className="skeleton h-4 w-20"></div>
                </div>
                <div className="space-y-2">
                  <div className="skeleton h-3 w-full"></div>
                  <div className="skeleton h-3 w-5/6"></div>
                  <div className="skeleton h-3 w-4/5"></div>
                </div>
              </div>

              {/* Tech details skeleton */}
              <div className="bg-primary/10 p-4 rounded-xl">
                <div className="space-y-2">
                  <div className="skeleton h-4 w-48"></div>
                  <div className="skeleton h-4 w-32"></div>
                </div>
              </div>

              {/* Screenshots skeleton */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-warning/10 p-6 rounded-xl border border-warning/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-warning rounded-full"></div>
                    <div className="skeleton h-4 w-32"></div>
                  </div>
                  <div className="skeleton h-32 w-full rounded-xl"></div>
                </div>
                <div className="bg-success/10 p-6 rounded-xl border border-success/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-success rounded-full"></div>
                    <div className="skeleton h-4 w-32"></div>
                  </div>
                  <div className="skeleton h-32 w-full rounded-xl"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
