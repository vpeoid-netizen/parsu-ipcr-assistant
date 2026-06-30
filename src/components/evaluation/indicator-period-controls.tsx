"use client";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  RATING_PERIOD_TOGGLE_NOTE,
  supportsProfessorPeriodTarget,
} from "@/lib/indicator-period";
import { cn } from "@/lib/utils";
import type { IndicatorDefinition } from "@/data/indicators";
import type { IndicatorEntryState, RankCategory } from "@/lib/types";

function PeriodToggle({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        checked ? "bg-primary" : "bg-muted",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      )}
    >
      <span
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

export function IndicatorPeriodControls({
  entry,
  def,
  rankCategory,
  onUpdate,
}: {
  entry: IndicatorEntryState;
  def: IndicatorDefinition;
  rankCategory: RankCategory;
  onUpdate: (patch: Partial<IndicatorEntryState>) => void;
}) {
  const showPeriodTarget = supportsProfessorPeriodTarget(def.code, rankCategory);
  const targetLockedOff = entry.ratingPeriodTarget === 0;
  const included = entry.includedInRatingPeriod !== false && !targetLockedOff;

  const handleToggle = (on: boolean) => {
    if (targetLockedOff && on) {
      onUpdate({ includedInRatingPeriod: true, ratingPeriodTarget: 1 });
      return;
    }
    onUpdate({ includedInRatingPeriod: on });
  };

  const handleTargetChange = (value: number) => {
    if (value === 0) {
      onUpdate({ ratingPeriodTarget: 0, includedInRatingPeriod: false });
      return;
    }
    onUpdate({ ratingPeriodTarget: value, includedInRatingPeriod: true });
  };

  return (
    <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <PeriodToggle
            checked={included}
            disabled={targetLockedOff}
            onChange={handleToggle}
          />
          <div>
            <Label className="text-sm font-medium">Included in rating period</Label>
            <p className="text-xs text-muted-foreground mt-0.5">{RATING_PERIOD_TOGGLE_NOTE}</p>
          </div>
        </div>
        {!included && (
          <span className="text-xs font-medium text-muted-foreground">Excluded from computation</span>
        )}
      </div>

      {showPeriodTarget && (
        <div className="max-w-xs">
          <Label className="text-xs">Target for rating period (Professor)</Label>
          <Select
            value={String(entry.ratingPeriodTarget ?? 2)}
            onValueChange={(v) => handleTargetChange(parseInt(v, 10))}
          >
            <SelectTrigger className="mt-1 h-9">
              <SelectValue placeholder="Select target" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0 — Not targeted</SelectItem>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Rating is computed as total accomplishment score divided by this target.
          </p>
        </div>
      )}
    </div>
  );
}
