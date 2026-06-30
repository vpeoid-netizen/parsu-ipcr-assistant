import { INDICATOR_SEEDS, type IndicatorDefinition } from "@/data/indicators";
import { PH_HOLIDAYS_2026 } from "@/data/reference";
import {
  consolidateStrategicPriority,
  d,
  percentageToRating,
  round,
} from "@/lib/calculation-engine/decimal";
import { computeFullEvaluation } from "@/lib/calculation-engine/evaluation";
import { computeIndicatorRating } from "@/lib/calculation-engine/indicators";
import { isMfo12Indicator, usesRatingScaleDropdown } from "@/lib/rating-scales";
import {
  defaultRatingPeriodTarget,
  getEffectivePeriodTarget,
  isIncludedInRatingPeriod,
} from "@/lib/indicator-period";
import type {
  AppointmentType,
  EvaluationProfile,
  EvaluationState,
  IndicatorEntryState,
  RankCategory,
  TargetEntryState,
  SupportFunctionState,
  DesignationDeliverableState,
} from "@/lib/types";

const SESSION_KEY = "parsu-ipcr-session";

export function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function isIndicatorApplicable(
  ind: IndicatorDefinition,
  rankCategory: RankCategory,
  appointmentType: AppointmentType
): boolean {
  return (
    ind.allowedRankCategories.includes(rankCategory) &&
    ind.allowedAppointments.includes(appointmentType)
  );
}

export function getApplicableIndicators(
  rankCategory: RankCategory,
  appointmentType: AppointmentType
): IndicatorDefinition[] {
  return INDICATOR_SEEDS.filter((ind) => isIndicatorApplicable(ind, rankCategory, appointmentType));
}

export const TEACHING_LOAD_UNITS = 18;

export function createDefaultProfile(): EvaluationProfile {
  return {
    facultyName: "",
    academicRankTitle: "Instructor I",
    rankCategory: "INSTRUCTOR",
    collegeCode: "CED",
    collegeName: "College of Education",
    appointmentType: "PERMANENT",
    evaluationYear: 2026,
    ratingPeriod: "January–June",
    teachingLoadUnits: TEACHING_LOAD_UNITS,
    hasSupportFunctions: false,
    hasDesignation: false,
    deloadedUnits: 0,
    officeOrderVerified: false,
  };
}

export function buildIndicatorEntries(
  rankCategory: RankCategory,
  appointmentType: AppointmentType
): IndicatorEntryState[] {
  return getApplicableIndicators(rankCategory, appointmentType).map((ind) => ({
    code: ind.code,
    applicabilityStatus: "APPLICABLE" as const,
    includedInRatingPeriod: true,
    ratingPeriodTarget: defaultRatingPeriodTarget(ind.code, rankCategory),
    outputs: [],
  }));
}

export function createInitialState(): EvaluationState {
  const profile = createDefaultProfile();
  return {
    mode: "SELF_EVALUATION",
    currentStep: 1,
    profile,
    indicators: buildIndicatorEntries(profile.rankCategory, profile.appointmentType),
    strategicTargets: [],
    priorityTargets: [],
    supportFunctions: [],
    designationDeliverables: [],
  };
}

export function refreshIndicatorsForProfile(state: EvaluationState): EvaluationState {
  const applicable = getApplicableIndicators(
    state.profile.rankCategory,
    state.profile.appointmentType
  );
  const existing = new Map(state.indicators.map((i) => [i.code, i]));
  return {
    ...state,
    indicators: applicable.map((ind) => {
      const prev = existing.get(ind.code);
      if (prev) {
        const periodTarget = defaultRatingPeriodTarget(ind.code, state.profile.rankCategory);
        return {
          ...prev,
          ratingPeriodTarget:
            periodTarget != null ? (prev.ratingPeriodTarget ?? periodTarget) : undefined,
          includedInRatingPeriod:
            prev.ratingPeriodTarget === 0 ? false : prev.includedInRatingPeriod !== false,
        };
      }
      return {
        code: ind.code,
        applicabilityStatus: "APPLICABLE" as const,
        includedInRatingPeriod: true,
        ratingPeriodTarget: defaultRatingPeriodTarget(ind.code, state.profile.rankCategory),
        outputs: [],
      };
    }),
  };
}

export function profileIsComplete(profile: EvaluationProfile): boolean {
  return Boolean(
    profile.facultyName.trim() &&
      profile.academicRankTitle &&
      profile.collegeCode &&
      profile.appointmentType &&
      profile.evaluationYear &&
      profile.ratingPeriod
  );
}

function mapEntryForCompute(
  _state: EvaluationState,
  entry: IndicatorEntryState,
  rule: IndicatorDefinition
) {
  if (usesRatingScaleDropdown(rule)) {
    if (
      rule.measurementType === "WORKING_DAY_TIMELINESS" ||
      rule.measurementType === "PERCENTAGE_TARGET" ||
      rule.measurementType === "PERCENTAGE_NUM_DEN"
    ) {
      const raw = entry.outputs[0]?.rawScore;
      if (raw != null && raw >= 0) {
        return {
          outputs: [{ rawScore: raw }],
          measurementType: "NUMERIC_RATING" as const,
          manualRating: undefined,
        };
      }
    }

    if (entry.outputs.some((o) => o.stageKey)) {
      return {
        outputs: entry.outputs.map((o) => ({
          stageKey: o.stageKey,
          stageLabel: o.stageLabel,
          numberOfAuthors: o.numberOfAuthors,
          isMainAuthor: o.isMainAuthor,
          numberOfMembers: o.numberOfMembers,
          isProjectLeader: o.isProjectLeader,
          title: o.title,
        })),
        measurementType: rule.measurementType,
        manualRating: undefined,
      };
    }

    if (rule.measurementType === "GEOGRAPHIC_LEVEL" && entry.outputs.some((o) => o.geographicLevel)) {
      return {
        outputs: entry.outputs.map((o) => ({
          geographicLevel: o.geographicLevel,
          title: o.title,
        })),
        measurementType: "GEOGRAPHIC_LEVEL" as const,
        manualRating: undefined,
      };
    }
  }

  return {
    outputs: entry.outputs.map((o) => ({
      stageKey: o.stageKey,
      stageLabel: o.stageLabel,
      geographicLevel: o.geographicLevel,
      fundAmount: o.fundAmount,
      percentageNumerator: o.percentageNumerator,
      percentageDenominator: o.percentageDenominator,
      deadline: o.deadline,
      submissionDate: o.submissionDate,
      numberOfAuthors: o.numberOfAuthors,
      isMainAuthor: o.isMainAuthor,
      numberOfMembers: o.numberOfMembers,
      isProjectLeader: o.isProjectLeader,
      isMainContributor: o.isMainContributor,
      rawScore: o.rawScore,
      title: o.title,
    })),
    measurementType: rule.measurementType,
    manualRating: entry.evaluatorRating,
  };
}

export function hasIndicatorInput(entry: IndicatorEntryState, rule: IndicatorDefinition): boolean {
  if (rule.measurementType === "NUMERIC_RATING") {
    return (entry.outputs[0]?.rawScore ?? 0) > 0;
  }
  if (usesRatingScaleDropdown(rule)) {
    if (
      rule.measurementType === "WORKING_DAY_TIMELINESS" ||
      rule.measurementType === "PERCENTAGE_TARGET" ||
      rule.measurementType === "PERCENTAGE_NUM_DEN"
    ) {
      return entry.outputs[0]?.rawScore != null;
    }
    return entry.outputs.some(
      (o) =>
        (o.rawScore ?? 0) > 0 ||
        !!o.stageKey ||
        !!o.geographicLevel
    );
  }
  if (entry.outputs.length === 0) return false;
  return entry.outputs.some((o) => {
    if (o.rawScore != null && o.rawScore > 0) return true;
    if (o.stageKey) return true;
    if (o.geographicLevel) return true;
    if (o.fundAmount != null && o.fundAmount > 0) return true;
    if (o.deadline && o.submissionDate) return true;
    if ((o.percentageNumerator ?? 0) > 0 || (o.percentageDenominator ?? 0) > 0) return true;
    return false;
  });
}

export function computeSingleIndicatorRating(
  state: EvaluationState,
  entry: IndicatorEntryState
) {
  const rule = getIndicatorDef(entry.code);
  if (!rule || entry.applicabilityStatus !== "APPLICABLE") return null;
  if (!isIncludedInRatingPeriod(entry)) return null;

  const mapped = mapEntryForCompute(state, entry, rule);
  const periodTarget = getEffectivePeriodTarget(entry, rule, state.profile.rankCategory);
  return computeIndicatorRating(
    {
      code: rule.code,
      name: rule.name,
      measurementType: mapped.measurementType,
      scoringMode: rule.scoringMode,
      pointCap: rule.pointCap,
      authorshipAllocation: rule.authorshipAllocation,
      requiredOutputCount: rule.requiredOutputCount,
      rankCategory: state.profile.rankCategory,
      periodTarget: periodTarget && periodTarget > 0 ? periodTarget : undefined,
      holidays: PH_HOLIDAYS_2026,
    },
    mapped.outputs,
    mapped.manualRating
  );
}

export function getRatingProgress(state: EvaluationState) {
  const applicable = state.indicators.filter(
    (i) => i.applicabilityStatus === "APPLICABLE" && isIncludedInRatingPeriod(i)
  );
  let completed = 0;
  let mfo12Total = 0;
  let mfo12Completed = 0;

  for (const entry of applicable) {
    const rule = getIndicatorDef(entry.code);
    if (!rule) continue;
    const hasInput = hasIndicatorInput(entry, rule);
    if (hasInput) completed++;
    if (isMfo12Indicator(rule.mfoCode)) {
      mfo12Total++;
      if (hasInput) mfo12Completed++;
    }
  }

  const total = applicable.length;
  return {
    total,
    completed,
    percent: total > 0 ? Math.round((completed / total) * 100) : 0,
    mfo12Total,
    mfo12Completed,
    mfo12Percent: mfo12Total > 0 ? Math.round((mfo12Completed / mfo12Total) * 100) : 0,
  };
}

export function computePartialSummary(state: EvaluationState) {
  const ratings: number[] = [];
  let mfo12Sum = 0;
  let mfo12Count = 0;

  for (const entry of state.indicators) {
    if (entry.applicabilityStatus !== "APPLICABLE" || !isIncludedInRatingPeriod(entry)) continue;
    const result = computeSingleIndicatorRating(state, entry);
    if (!result) continue;
    const r = parseFloat(result.finalRating);
    if (r > 0) {
      ratings.push(r);
      const rule = getIndicatorDef(entry.code);
      if (rule && isMfo12Indicator(rule.mfoCode)) {
        mfo12Sum += r;
        mfo12Count++;
      }
    }
  }

  const avg = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
  const mfo12Avg = mfo12Count > 0 ? mfo12Sum / mfo12Count : 0;
  return { avgRating: avg, mfo12Avg, ratedCount: ratings.length };
}

export function hasTargetInput(target: TargetEntryState): boolean {
  return (
    target.periodTarget > 0 &&
    target.actualAccomplishment != null &&
    !Number.isNaN(target.actualAccomplishment)
  );
}

export function hasDeliverableRatingInput(item: {
  qualityRating?: number;
  efficiencyRating?: number;
  timelinessRating?: number;
}): boolean {
  return [item.qualityRating, item.efficiencyRating, item.timelinessRating].some(
    (r) => r != null && r > 0
  );
}

export function buildComputeInput(state: EvaluationState) {
  const indMap = new Map(INDICATOR_SEEDS.map((i) => [i.code, i]));

  return {
    profile: {
      rankCategory: state.profile.rankCategory,
      appointmentType: state.profile.appointmentType,
      hasSupportFunctions: state.profile.hasSupportFunctions,
      hasDesignation: state.profile.hasDesignation,
      deloadedUnits: state.profile.deloadedUnits,
      teachingLoadUnits: TEACHING_LOAD_UNITS,
      officeOrderVerified: state.profile.officeOrderVerified,
    },
    indicators: state.indicators
      .filter((e) => e.applicabilityStatus === "APPLICABLE")
      .map((entry) => {
        const rule = indMap.get(entry.code)!;
        const mapped = mapEntryForCompute(state, entry, rule);
        return {
          code: entry.code,
          name: rule.name,
          mfoCode: rule.mfoCode,
          measurementType: mapped.measurementType,
          scoringMode: rule.scoringMode,
          pointCap: rule.pointCap,
          applicabilityStatus: entry.applicabilityStatus,
          includedInRatingPeriod: isIncludedInRatingPeriod(entry),
          ratingPeriodTarget: entry.ratingPeriodTarget,
          outputs: mapped.outputs,
          manualRating: mapped.manualRating,
          rule: {
            code: rule.code,
            name: rule.name,
            measurementType: mapped.measurementType,
            scoringMode: rule.scoringMode,
            pointCap: rule.pointCap,
            authorshipAllocation: rule.authorshipAllocation,
            requiredOutputCount: rule.requiredOutputCount,
            rankCategory: state.profile.rankCategory,
          },
        };
      }),
    strategicTargets: state.strategicTargets
      .filter(hasTargetInput)
      .map((t) => ({
      accomplishment: t.actualAccomplishment ?? 0,
      target: t.periodTarget,
      unit: t.unitOfMeasure,
    })),
    priorityTargets: state.priorityTargets
      .filter(hasTargetInput)
      .map((t) => ({
      accomplishment: t.actualAccomplishment ?? 0,
      target: t.periodTarget,
      unit: t.unitOfMeasure,
    })),
    supportFunctions: state.supportFunctions
      .filter(hasDeliverableRatingInput)
      .map((sf) => ({
      qualityRating: sf.qualityRating ?? 0,
      efficiencyRating: sf.efficiencyRating ?? 0,
      timelinessRating: sf.timelinessRating ?? 0,
    })),
    designationDeliverables: state.designationDeliverables
      .filter(hasDeliverableRatingInput)
      .map((dd) => ({
      qualityRating: dd.qualityRating ?? 0,
      efficiencyRating: dd.efficiencyRating ?? 0,
      timelinessRating: dd.timelinessRating ?? 0,
    })),
    holidays: PH_HOLIDAYS_2026,
  };
}

export function computeLiveEvaluation(state: EvaluationState) {
  return computeFullEvaluation(buildComputeInput(state));
}

export function computeEvaluation(state: EvaluationState) {
  return computeLiveEvaluation(state);
}

export function computeTargetEntryRating(target: TargetEntryState): number | null {
  if (!hasTargetInput(target)) return null;
  const pct = d(target.actualAccomplishment!).div(d(target.periodTarget)).times(100);
  const { rating } = percentageToRating(pct);
  return round(rating).toNumber();
}

export function computeTargetsSectionRating(
  targets: TargetEntryState[]
): { rating: number; pct: number } | null {
  const valid = targets.filter(hasTargetInput);
  if (valid.length === 0) return null;
  const result = consolidateStrategicPriority(
    valid.map((t) => ({
      accomplishment: d(t.actualAccomplishment!),
      target: d(t.periodTarget),
      unit: t.unitOfMeasure || "unit",
    })),
    []
  );
  return {
    rating: round(result.rating).toNumber(),
    pct: round(result.pct, 2).toNumber(),
  };
}

export function computeDeliverableComposite(item: {
  qualityRating?: number;
  efficiencyRating?: number;
  timelinessRating?: number;
}): number | null {
  const ratings = [item.qualityRating, item.efficiencyRating, item.timelinessRating].filter(
    (r): r is number => r != null && r > 0
  );
  if (ratings.length === 0) return null;
  return ratings.reduce((a, b) => a + b, 0) / ratings.length;
}

export function computeDeliverablesSectionRating(
  items: { qualityRating?: number; efficiencyRating?: number; timelinessRating?: number }[]
): number | null {
  const composites = items
    .map(computeDeliverableComposite)
    .filter((r): r is number => r != null && r > 0);
  if (composites.length === 0) return null;
  return composites.reduce((a, b) => a + b, 0) / composites.length;
}

export function computeSupportFunctionsLive(state: EvaluationState): number | null {
  return computeDeliverablesSectionRating(state.supportFunctions);
}

export function computeDesignationLive(state: EvaluationState): number | null {
  return computeDeliverablesSectionRating(state.designationDeliverables);
}

export function saveSession(state: EvaluationState) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  }
}

export function normalizeIndicatorEntry(
  entry: IndicatorEntryState,
  rankCategory: RankCategory
): IndicatorEntryState {
  const periodTarget = defaultRatingPeriodTarget(entry.code, rankCategory);
  const ratingPeriodTarget =
    periodTarget != null ? (entry.ratingPeriodTarget ?? periodTarget) : entry.ratingPeriodTarget;

  let includedInRatingPeriod = entry.includedInRatingPeriod !== false;
  if (ratingPeriodTarget === 0) includedInRatingPeriod = false;

  return {
    ...entry,
    includedInRatingPeriod,
    ratingPeriodTarget,
  };
}

export function loadSession(): EvaluationState | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const state = JSON.parse(raw) as EvaluationState;
    return {
      ...state,
      profile: { ...state.profile, teachingLoadUnits: TEACHING_LOAD_UNITS },
      indicators: state.indicators.map((e) =>
        normalizeIndicatorEntry(e, state.profile.rankCategory)
      ),
    };
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window !== "undefined") sessionStorage.removeItem(SESSION_KEY);
}

export function getIndicatorDef(code: string) {
  return INDICATOR_SEEDS.find((i) => i.code === code);
}
