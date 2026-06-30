import type { IndicatorDefinition } from "@/data/indicators";
import {
  GEOGRAPHIC_LEVELS_ENGAGEMENT,
  GEOGRAPHIC_LEVELS_TRAINING,
} from "@/data/reference";

export interface RatingScaleOption {
  value: number;
  label: string;
}

const TIMELINESS_SCALE: RatingScaleOption[] = [
  { value: 5, label: "5 — At least 3 working days before deadline" },
  { value: 4, label: "4 — 1–2 working days before deadline" },
  { value: 3, label: "3 — On the deadline" },
  { value: 2, label: "2 — 1–2 working days after deadline" },
  { value: 1, label: "1 — At least 3 working days after deadline" },
];

const PERCENTAGE_TARGET_SCALE: RatingScaleOption[] = [
  { value: 5, label: "5 — >115% of target" },
  { value: 4, label: "4 — >100% and ≤115% of target" },
  { value: 3, label: "3 — 100% of target" },
  { value: 2, label: "2 — >85% and <100% of target" },
  { value: 1, label: "1 — ≤85% and >0" },
  { value: 0, label: "0 — No accomplishment" },
];

const PERCENTAGE_SATISFACTION_SCALE: RatingScaleOption[] = [
  { value: 5, label: "5 — 100%" },
  { value: 4, label: "4 — >90%" },
  { value: 3, label: "3 — >80%" },
  { value: 2, label: "2 — >70%" },
  { value: 1, label: "1 — ≤70% and >0" },
  { value: 0, label: "0 — No valid result" },
];

const STAGE_RATINGS: Record<string, number> = {
  AC_ENDORSED: 5,
  UNIV_IMDC_ENDORSED: 4,
  UNIV_IMDC_SUBMITTED: 3,
  COLLEGE_IMDC_ENDORSED: 2,
  COLLEGE_IMDC_DRAFT: 1,
};

export function isMfo12Indicator(mfoCode: string): boolean {
  return mfoCode === "MFO1" || mfoCode === "MFO2";
}

export function isMfo4PercentageDropdown(indicator: IndicatorDefinition): boolean {
  return (
    indicator.mfoCode === "MFO4" &&
    (indicator.measurementType === "PERCENTAGE_TARGET" ||
      indicator.measurementType === "PERCENTAGE_NUM_DEN")
  );
}

/** Indicators that use a rating-scale dropdown instead of free-form or date inputs. */
export function usesRatingScaleDropdown(indicator: IndicatorDefinition): boolean {
  if (indicator.measurementType === "NUMERIC_RATING") return false;
  if (indicator.measurementType === "WORKING_DAY_TIMELINESS") return true;
  if (isMfo4PercentageDropdown(indicator)) return true;
  if (isMfo12Indicator(indicator.mfoCode)) return true;
  return false;
}

/** Rating-scale dropdown options for timeliness, MFO 1 & 2, and MFO 4 percentage indicators. */
export function getRatingScaleOptions(indicator: IndicatorDefinition): RatingScaleOption[] {
  if (indicator.measurementType === "WORKING_DAY_TIMELINESS") {
    return TIMELINESS_SCALE;
  }

  if (indicator.measurementType === "PERCENTAGE_TARGET") {
    return PERCENTAGE_TARGET_SCALE;
  }

  if (indicator.measurementType === "PERCENTAGE_NUM_DEN") {
    return PERCENTAGE_SATISFACTION_SCALE;
  }

  if (indicator.stageMovRequirements && indicator.stageMovRequirements.length > 0) {
    return [...indicator.stageMovRequirements]
      .map((s) => ({
        value: STAGE_RATINGS[s.stageKey] ?? 0,
        label: `${STAGE_RATINGS[s.stageKey] ?? "?"} — ${s.stageLabel}`,
      }))
      .filter((o) => o.value > 0)
      .sort((a, b) => b.value - a.value);
  }

  if (indicator.measurementType === "GEOGRAPHIC_LEVEL") {
    const levels =
      indicator.code === "MFO2-Q02" ? GEOGRAPHIC_LEVELS_ENGAGEMENT : GEOGRAPHIC_LEVELS_TRAINING;
    return levels.map((g) => {
      const match = g.label.match(/\((\d)\)/);
      const value = match ? parseInt(match[1], 10) : 0;
      return { value, label: g.label };
    });
  }

  return [];
}

/** @deprecated use getRatingScaleOptions */
export function getMfo12RatingOptions(indicator: IndicatorDefinition): RatingScaleOption[] {
  return getRatingScaleOptions(indicator);
}

export function ipcrRatingHealthColor(rating: number): string {
  if (rating > 4) return "bg-green-500";
  if (rating > 3) return "bg-yellow-500";
  return "bg-red-500";
}

export function ratingHealthColor(rating: number): string {
  if (rating >= 4.5) return "bg-blue-600";
  if (rating >= 4) return "bg-blue-500";
  if (rating >= 3) return "bg-sky-500";
  if (rating >= 2) return "bg-amber-500";
  if (rating > 0) return "bg-orange-500";
  return "bg-muted";
}

export function ratingHealthPercent(rating: number): number {
  if (rating <= 0) return 0;
  return Math.min(100, (rating / 5) * 100);
}
