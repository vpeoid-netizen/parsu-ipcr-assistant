"use client";

import { cn, formatRating } from "@/lib/utils";
import { ipcrRatingHealthColor, ratingHealthColor, ratingHealthPercent } from "@/lib/rating-scales";

interface IndicatorRatingBarProps {
  rating: number;
  label?: string;
  compact?: boolean;
  showValue?: boolean;
  variant?: "default" | "ipcr";
}

export function IndicatorRatingBar({
  rating,
  label = "Indicator rating",
  compact = false,
  showValue = true,
  variant = "default",
}: IndicatorRatingBarProps) {
  const pct = ratingHealthPercent(rating);
  const hasRating = variant === "ipcr" ? rating >= 0 : rating > 0;
  const barColor = variant === "ipcr" ? ipcrRatingHealthColor(rating) : ratingHealthColor(rating);

  return (
    <div className={cn("space-y-1", compact ? "text-xs" : "text-sm")}>
      <div className="flex justify-between items-center gap-2">
        <span className="text-muted-foreground font-medium">{label}</span>
        {showValue && (
          <span
            className={cn(
              "font-mono font-bold tabular-nums",
              hasRating ? "text-primary" : "text-muted-foreground"
            )}
          >
            {hasRating ? formatRating(rating) : "—"}
          </span>
        )}
      </div>
      <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300 ease-out",
            hasRating ? barColor : "bg-muted-foreground/20"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface RatingHealthTrackerProps {
  finalRating: number;
  adjectival?: string;
  completionPercent: number;
  completed: number;
  total: number;
  mfo12Rating?: number;
  mfo12Percent?: number;
}

export function RatingHealthTracker({
  finalRating,
  adjectival,
  completionPercent,
  completed,
  total,
  mfo12Rating,
  mfo12Percent,
}: RatingHealthTrackerProps) {
  const healthPct = ratingHealthPercent(finalRating);
  const showRating = finalRating > 0;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="font-medium">IPCR Rating</span>
          <span className="font-mono font-semibold">
            {showRating ? formatRating(finalRating) : "—"}
            {adjectival && showRating && (
              <span className="text-muted-foreground font-normal ml-1">({adjectival})</span>
            )}
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              showRating ? ipcrRatingHealthColor(finalRating) : "bg-muted-foreground/20"
            )}
            style={{ width: `${healthPct}%` }}
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Indicators completed</span>
          <span>
            {completed} / {total} ({completionPercent}%)
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary/70 transition-all duration-300"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {mfo12Percent != null && mfo12Rating != null && (
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">MFO 1 &amp; 2 progress</span>
            <span className="font-mono">
              {mfo12Rating > 0 ? formatRating(mfo12Rating) : "—"} · {mfo12Percent}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary/60 transition-all duration-300"
              style={{ width: `${mfo12Percent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
