"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RatingHealthTracker } from "@/components/evaluation/rating-bar";
import { useEvaluation } from "@/components/evaluation/evaluation-context";
import { cosUsesMfo12OnlyIpcr, getRatingProgress, profileIsComplete } from "@/lib/evaluation-client";
import { formatRating } from "@/lib/utils";

export function SummaryPanel() {
  const { state, computation } = useEvaluation();

  const progress = useMemo(() => (state ? getRatingProgress(state) : null), [state]);

  const mfoProgress = useMemo(() => {
    if (!progress || !computation) return [];
    return progress.mfoProgress.map((mfo) => ({
      ...mfo,
      rating:
        mfo.code === "MFO1_2"
          ? computation.mfo1_2Rating
          : (computation.mfoRatings[mfo.code]?.rating ?? 0),
    }));
  }, [progress, computation]);

  if (!state || !computation) return null;

  const profileComplete = profileIsComplete(state.profile);
  const ipcrRating = computation.finalIpcr.rating;
  const mfo12OnlyIpcr = cosUsesMfo12OnlyIpcr(state);

  return (
    <Card className="sticky top-20 h-fit">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Live Rating Summary</CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-4">
        {mfo12OnlyIpcr && (
          <p className="text-primary bg-primary/5 border border-primary/20 rounded-lg p-2 text-xs">
            COS faculty: no Strategic/Priority targets — Final IPCR is from MFO 1 &amp; 2 only.
          </p>
        )}
        <div className="flex justify-between">
          <span>Profile</span>
          <span className={profileComplete ? "text-blue-700" : "text-amber-600"}>
            {profileComplete ? "Complete" : "Incomplete"}
          </span>
        </div>

        {progress && (
          <RatingHealthTracker
            finalRating={ipcrRating}
            adjectival={computation.adjectivalRating}
            completionPercent={progress.percent}
            completed={progress.completed}
            total={progress.total}
            mfoProgress={mfoProgress}
          />
        )}

        <div className="space-y-2 border-t pt-3">
          <div className="flex justify-between">
            <span>Performance Results</span>
            <span className="font-mono">{formatRating(computation.performanceResults.rating)}</span>
          </div>
          <div className="flex justify-between">
            <span>Strategic/Priority</span>
            <span className="font-mono">
              {mfo12OnlyIpcr ? "N/A" : formatRating(computation.consolidatedStratPri.rating)}
            </span>
          </div>
          {state.profile.hasSupportFunctions && (
            <div className="flex justify-between">
              <span>Support Functions</span>
              <span className="font-mono">
                {formatRating(computation.supportFunctionsRating.rating)}
              </span>
            </div>
          )}
          {state.profile.hasDesignation && (
            <div className="flex justify-between">
              <span>Designation</span>
              <span className="font-mono">{formatRating(computation.designationRating.rating)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold border-t pt-2 mt-2">
            <span>Final IPCR</span>
            <span className="font-mono text-primary">{formatRating(ipcrRating)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
