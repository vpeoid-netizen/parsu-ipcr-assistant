import type { IndicatorDefinition } from "@/data/indicators";
import type { IndicatorEntryState, RankCategory } from "@/lib/types";

/** MFO3 indicators where Professors declare a 0–2 rating-period target. */
export const PROFESSOR_PERIOD_TARGET_INDICATORS = [
  "MFO3-Q01",
  "MFO3-Q02",
  "MFO3-E02",
] as const;

export function supportsProfessorPeriodTarget(
  code: string,
  rankCategory: RankCategory
): boolean {
  return (
    rankCategory === "PROFESSOR" &&
    PROFESSOR_PERIOD_TARGET_INDICATORS.includes(
      code as (typeof PROFESSOR_PERIOD_TARGET_INDICATORS)[number]
    )
  );
}

export function defaultRatingPeriodTarget(
  code: string,
  rankCategory: RankCategory
): number | undefined {
  return supportsProfessorPeriodTarget(code, rankCategory) ? 2 : undefined;
}

export function isIncludedInRatingPeriod(entry: IndicatorEntryState): boolean {
  return entry.includedInRatingPeriod !== false;
}

export function getEffectivePeriodTarget(
  entry: IndicatorEntryState,
  rule: IndicatorDefinition,
  rankCategory: RankCategory
): number | undefined {
  if (!supportsProfessorPeriodTarget(rule.code, rankCategory)) return undefined;
  const target = entry.ratingPeriodTarget;
  if (target == null) return 2;
  return target;
}

export const RATING_PERIOD_TOGGLE_NOTE =
  "Turn this on only when the said indicator is targeted for the rating period.";
