import {
  computeBaseIpcr,
  computeDesignationRating,
  computeFinalIpcr,
  computeMfoRating,
  computePerformanceResults,
  computeSupportFunctionsRating,
  consolidateStrategicPriorityRatings,
  d,
  getAdjectivalRating,
  getMfoWeights,
  round,
  type ComputationTrace,
  createTrace,
} from "./decimal";
import { computeIndicatorRating, type IndicatorOutputInput, type IndicatorRuleInput } from "./indicators";

export interface EvaluationProfile {
  rankCategory: string;
  appointmentType: string;
  hasSupportFunctions: boolean;
  hasDesignation: boolean;
  deloadedUnits: number;
  teachingLoadUnits: number;
}

export interface IndicatorEntry {
  code: string;
  name: string;
  mfoCode: string;
  measurementType: string;
  scoringMode: string;
  pointCap: number;
  applicabilityStatus: string;
  includedInRatingPeriod?: boolean;
  ratingPeriodTarget?: number;
  outputs: IndicatorOutputInput[];
  manualRating?: number;
  selfRating?: number;
  validatedRating?: number;
  rule: IndicatorRuleInput;
}

export interface StrategicTargetInput {
  rating: number;
}

export interface SupportFunctionInput {
  qualityRating?: number;
  efficiencyRating?: number;
  timelinessRating?: number;
}

export interface DesignationDeliverableInput {
  qualityRating: number;
  efficiencyRating: number;
  timelinessRating: number;
}

export interface FullEvaluationInput {
  profile: EvaluationProfile;
  indicators: IndicatorEntry[];
  strategicTargets: StrategicTargetInput[];
  priorityTargets: StrategicTargetInput[];
  supportFunctions: SupportFunctionInput[];
  designationDeliverables: DesignationDeliverableInput[];
  hasStrategicOrPriority?: boolean;
  holidays?: { date: string; name: string }[];
}

export interface FullEvaluationResult {
  indicatorRatings: Record<string, ComputationTrace & { rating: number }>;
  mfoRatings: Record<string, { rating: number; trace: ComputationTrace }>;
  mfo1_2Rating: number;
  performanceResults: { rating: number; trace: ComputationTrace };
  consolidatedStratPri: { rating: number; trace: ComputationTrace };
  supportFunctionsRating: { rating: number; trace: ComputationTrace };
  designationRating: { rating: number; trace: ComputationTrace };
  baseIpcr: { rating: number; trace: ComputationTrace };
  finalIpcr: { rating: number; trace: ComputationTrace };
  adjectivalRating: string;
  warnings: string[];
}

function avgRatings(ratings: number[]): number {
  const valid = ratings.filter((r) => r > 0);
  if (valid.length === 0) return 0;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

function supportFunctionComposite(sf: SupportFunctionInput): number {
  const ratings = [sf.qualityRating, sf.efficiencyRating, sf.timelinessRating].filter(
    (r): r is number => r != null && !Number.isNaN(r)
  );
  if (ratings.length === 0) return 0;
  return ratings.reduce((a, b) => a + b, 0) / ratings.length;
}

function designationComposite(item: DesignationDeliverableInput): number {
  return avgRatings([item.qualityRating, item.efficiencyRating, item.timelinessRating]);
}

export function computeFullEvaluation(input: FullEvaluationInput): FullEvaluationResult {
  const warnings: string[] = [];
  const { profile } = input;

  // 1. Compute individual indicator ratings
  const indicatorRatings: Record<string, ComputationTrace & { rating: number }> = {};
  const mfoIndicatorMap: Record<string, { code: string; rating: number; applicable: boolean }[]> = {};

  for (const ind of input.indicators) {
    const included =
      ind.applicabilityStatus === "APPLICABLE" && ind.includedInRatingPeriod !== false;

    if (!included) {
      indicatorRatings[ind.code] = {
        ...createTrace([], d(0), ["Not included in rating period"]),
        rating: 0,
        indicatorCode: ind.code,
        indicatorName: ind.name,
      };
      if (!mfoIndicatorMap[ind.mfoCode]) mfoIndicatorMap[ind.mfoCode] = [];
      mfoIndicatorMap[ind.mfoCode].push({ code: ind.code, rating: 0, applicable: false });
      continue;
    }

    const periodTarget =
      ind.ratingPeriodTarget != null && ind.ratingPeriodTarget > 0
        ? ind.ratingPeriodTarget
        : undefined;

    const trace = computeIndicatorRating(
      {
        ...ind.rule,
        rankCategory: profile.rankCategory,
        holidays: input.holidays,
        periodTarget,
      },
      ind.outputs,
      ind.manualRating
    );
    const rating = parseFloat(trace.finalRating);
    indicatorRatings[ind.code] = { ...trace, rating, indicatorCode: ind.code, indicatorName: ind.name };

    if (!mfoIndicatorMap[ind.mfoCode]) mfoIndicatorMap[ind.mfoCode] = [];
    mfoIndicatorMap[ind.mfoCode].push({ code: ind.code, rating, applicable: true });
  }

  // 2. Compute MFO ratings
  const mfoRatings: Record<string, { rating: number; trace: ComputationTrace }> = {};
  for (const [mfoCode, indicators] of Object.entries(mfoIndicatorMap)) {
    const { rating, trace } = computeMfoRating(
      indicators.map((i) => ({ ...i, rating: d(i.rating) }))
    );
    mfoRatings[mfoCode] = { rating: round(rating).toNumber(), trace: createTrace(trace, rating) };
  }

  const mfo3Rating = d(mfoRatings["MFO3"]?.rating ?? 0);
  const mfo4Rating = d(mfoRatings["MFO4"]?.rating ?? 0);

  // Recompute MFO1&2 as average of MFO1 and MFO2 indicators combined
  const mfo12Indicators = [...(mfoIndicatorMap["MFO1"] ?? []), ...(mfoIndicatorMap["MFO2"] ?? [])];
  const mfo12Result = computeMfoRating(
    mfo12Indicators.map((i) => ({ ...i, rating: d(i.rating) }))
  );

  // 3. Performance Results
  const weights = getMfoWeights(profile.rankCategory, profile.appointmentType);
  const perfResult = computePerformanceResults(
    mfo12Result.rating,
    mfo3Rating,
    mfo4Rating,
    weights,
    {
      mfo1: d(mfoRatings["MFO1"]?.rating ?? 0),
      mfo2: d(mfoRatings["MFO2"]?.rating ?? 0),
    }
  );

  // 4. Strategic/Priority consolidation
  const hasStrategicOrPriority =
    input.hasStrategicOrPriority ??
    (input.strategicTargets.length > 0 || input.priorityTargets.length > 0);
  const stratPriResult = consolidateStrategicPriorityRatings(
    input.strategicTargets.map((t) => t.rating),
    input.priorityTargets.map((t) => t.rating)
  );

  // 5. Support Functions
  const sfRatings = input.supportFunctions.map((sf) => ({
    compositeRating: d(supportFunctionComposite(sf)),
  }));
  const sfResult = computeSupportFunctionsRating(sfRatings);

  // 6. Designation
  const desigRatings = input.designationDeliverables.map((dd) => ({
    compositeRating: d(designationComposite(dd)),
  }));
  const desigResult = computeDesignationRating(desigRatings);

  // 7. Base IPCR
  const baseResult = computeBaseIpcr(
    perfResult.rating,
    stratPriResult.rating,
    sfResult.rating,
    profile.hasSupportFunctions,
    hasStrategicOrPriority
  );

  // 8. Final IPCR
  const finalResult = computeFinalIpcr(
    baseResult.rating,
    desigResult.rating,
    d(profile.deloadedUnits),
    d(profile.teachingLoadUnits),
    profile.hasDesignation
  );

  const finalRating = round(finalResult.rating).toNumber();
  const adjectival = getAdjectivalRating(finalResult.rating);

  return {
    indicatorRatings,
    mfoRatings,
    mfo1_2Rating: round(mfo12Result.rating).toNumber(),
    performanceResults: { rating: round(perfResult.rating).toNumber(), trace: createTrace(perfResult.trace, perfResult.rating) },
    consolidatedStratPri: {
      rating: round(stratPriResult.rating).toNumber(),
      trace: createTrace(stratPriResult.trace, stratPriResult.rating),
    },
    supportFunctionsRating: { rating: round(sfResult.rating).toNumber(), trace: createTrace(sfResult.trace, sfResult.rating) },
    designationRating: { rating: round(desigResult.rating).toNumber(), trace: createTrace(desigResult.trace, desigResult.rating) },
    baseIpcr: { rating: round(baseResult.rating).toNumber(), trace: createTrace(baseResult.trace, baseResult.rating) },
    finalIpcr: { rating: finalRating, trace: createTrace(finalResult.trace, finalResult.rating) },
    adjectivalRating: adjectival,
    warnings,
  };
}
