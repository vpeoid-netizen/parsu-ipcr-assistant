"use client";

import { useEvaluation } from "@/components/evaluation/evaluation-context";
import { IndicatorRatingBar } from "@/components/evaluation/rating-bar";
import { cosUsesMfo12OnlyIpcr, profileIsComplete } from "@/lib/evaluation-client";
import { formatRating } from "@/lib/utils";
import { RULESET_VERSION } from "@/data/reference";

export function SummaryStep() {
  const { state, computation } = useEvaluation();
  if (!state || !computation) return null;

  const profileComplete = profileIsComplete(state.profile);
  const ipcrRating = computation.finalIpcr.rating;
  const mfo12OnlyIpcr = cosUsesMfo12OnlyIpcr(state);

  return (
    <div className="space-y-6">
      {mfo12OnlyIpcr && (
        <p className="text-sm text-primary bg-primary/5 border border-primary/20 rounded-lg p-3">
          COS faculty with no assigned Strategic or Priority targets: Final IPCR rating is computed
          from MFO 1 &amp; 2 only.
        </p>
      )}
      {!profileComplete && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
          Faculty information is incomplete. Ratings below update live as you enter data and will
          refine once all required fields are filled in.
        </p>
      )}

      <div className="text-center rounded-lg bg-primary/10 p-6 space-y-3">
        <p className="text-sm text-muted-foreground">IPCR Rating</p>
        <p className="text-4xl font-bold font-mono text-parsu-dark">
          {formatRating(ipcrRating)}
        </p>
        <p className="text-lg font-semibold">
          {ipcrRating > 0 ? computation.adjectivalRating : "Enter ratings to compute"}
        </p>
        <IndicatorRatingBar rating={ipcrRating} label="IPCR Rating" showValue={false} variant="ipcr" />
        <p className="text-xs text-muted-foreground">{RULESET_VERSION}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 text-sm">
        {[
          ["Performance Results", computation.performanceResults.rating],
          [
            "Strategic/Priority (combined)",
            mfo12OnlyIpcr ? null : computation.consolidatedStratPri.rating,
          ],
          ...(state.profile.hasSupportFunctions
            ? [["Support Functions", computation.supportFunctionsRating.rating]]
            : []),
          ["Base IPCR", computation.baseIpcr.rating],
          ...(state.profile.hasDesignation
            ? [["Designation", computation.designationRating.rating]]
            : []),
          ["Final IPCR", computation.finalIpcr.rating],
        ].map(([label, val]) => (
          <div key={String(label)} className="flex justify-between border-b py-2">
            <span>{label}</span>
            <span className="font-mono font-semibold">
              {val == null ? "N/A" : formatRating(val as number)}
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        This rating summary is for computation assistance only and remains subject to official
        approval and signing. No documentary evidence is attached.
      </p>
    </div>
  );
}
