import {
  allocateAuthorship,
  allocateFundGeneration,
  averageByRequiredCount,
  cap,
  computeTimelinessRating,
  cumulativeWithCap,
  d,
  fundAmountToRating,
  geographicLevelToRating,
  highestOnly,
  percentageToRating,
  targetComparisonRating,
  type ComputationTrace,
  type ComputationStep,
  type D,
  createTrace,
  getRequiredOutputCount,
} from "./index";

export interface IndicatorOutputInput {
  stageKey?: string;
  stageLabel?: string;
  geographicLevel?: string;
  fundAmount?: number;
  percentageNumerator?: number;
  percentageDenominator?: number;
  deadline?: string;
  submissionDate?: string;
  numberOfAuthors?: number;
  isMainAuthor?: boolean;
  numberOfMembers?: number;
  isProjectLeader?: boolean;
  isMainContributor?: boolean;
  rawScore?: number;
  title?: string;
}

export interface IndicatorRuleInput {
  code: string;
  name: string;
  measurementType: string;
  scoringMode: string;
  pointCap: number;
  authorshipAllocation?: { mainAuthorPct: number; coAuthorPct: number };
  requiredOutputCount?: Record<string, number>;
  periodTarget?: number;
  rankCategory: string;
  holidays?: { date: string; name: string }[];
}

export function computeIndicatorRating(
  rule: IndicatorRuleInput,
  outputs: IndicatorOutputInput[],
  manualRating?: number
): ComputationTrace {
  const warnings: string[] = [];
  const allSteps: { label: string; formula?: string; value: string; detail?: string }[] = [];

  switch (rule.measurementType) {
    case "NUMERIC_RATING": {
      const value = outputs[0]?.rawScore ?? manualRating ?? 0;
      if (value < 1 || value > 5) {
        warnings.push("Teaching evaluation rating must be between 1.00 and 5.00");
        return createTrace(allSteps, d(0), warnings, false);
      }
      allSteps.push({ label: "Teaching evaluation rating", value: value.toFixed(3) });
      return createTrace(allSteps, d(value), warnings);
    }

    case "WORKING_DAY_TIMELINESS": {
      const output = outputs[0];
      if (!output?.deadline || !output?.submissionDate) {
        warnings.push("Deadline and submission date are required");
        return createTrace(allSteps, d(0), warnings, false);
      }
      const { rating, trace } = computeTimelinessRating(
        output.deadline,
        output.submissionDate,
        rule.holidays ?? []
      );
      allSteps.push(...trace);
      return createTrace(allSteps, rating, warnings);
    }

    case "STAGE_CUMULATIVE": {
      return computeStageCumulative(rule, outputs, allSteps, warnings);
    }

    case "STAGE_NON_CUMULATIVE": {
      return computeStageNonCumulative(rule, outputs, allSteps, warnings);
    }

    case "GEOGRAPHIC_LEVEL": {
      const scale =
        rule.code.includes("ENGAGEMENT") || rule.code === "MFO2-Q02"
          ? "engagement"
          : rule.code === "MFO3-Q02"
            ? "presentation"
            : "training";
      const scores = outputs.map((o) => {
        const rating = geographicLevelToRating(o.geographicLevel ?? "", scale);
        allSteps.push({
          label: o.title ?? "Activity",
          value: `${o.geographicLevel} → ${rating.toFixed(1)}`,
        });
        return rating;
      });

      if (rule.scoringMode === "AVERAGE_BY_COUNT") {
        const requiredCount =
          rule.periodTarget ??
          rule.requiredOutputCount?.[rule.rankCategory] ??
          getRequiredOutputCount(rule.rankCategory);
        const { rating, trace } = averageByRequiredCount(scores, requiredCount, d(rule.pointCap));
        allSteps.push(...trace);
        return createTrace(allSteps, rating, warnings);
      }

      if (rule.scoringMode === "CUMULATIVE") {
        const { rating, trace } = cumulativeWithCap(scores, d(rule.pointCap));
        allSteps.push(...trace);
        return createTrace(allSteps, rating, warnings);
      }
      const { rating, trace } = highestOnly(scores);
      allSteps.push(...trace);
      return createTrace(allSteps, rating, warnings);
    }

    case "FUND_AMOUNT": {
      const totalAmount = outputs.reduce((sum, o) => sum + (o.fundAmount ?? 0), 0);
      const { rating, trace } = fundAmountToRating(d(totalAmount));
      allSteps.push(...trace);

      // Apply co-contributor allocation if applicable
      if (outputs.length > 0 && outputs[0].isMainContributor !== undefined) {
        const { allocated, trace: allocTrace } = allocateFundGeneration(
          rating,
          outputs[0].isMainContributor ?? true
        );
        allSteps.push(...allocTrace);
        return createTrace(allSteps, allocated, warnings);
      }
      return createTrace(allSteps, rating, warnings);
    }

    case "PERCENTAGE_TARGET": {
      const output = outputs[0];
      if (!output) {
        warnings.push("Target and accomplishment data required");
        return createTrace(allSteps, d(0), warnings, false);
      }
      const actual = d(output.percentageNumerator ?? 0);
      const target = d(output.percentageDenominator ?? 0);
      const { rating, trace } = targetComparisonRating(actual, target);
      allSteps.push(...trace);
      return createTrace(allSteps, rating, warnings);
    }

    case "PERCENTAGE_NUM_DEN": {
      const output = outputs[0];
      const num = d(output?.percentageNumerator ?? 0);
      const den = d(output?.percentageDenominator ?? 0);
      const pct = den.gt(0) ? num.div(den).times(100) : d(0);
      allSteps.push({
        label: "Percentage",
        formula: `${num.toFixed(0)} ÷ ${den.toFixed(0)} × 100`,
        value: `${pct.toFixed(2)}%`,
      });
      const { rating, trace } = percentageToRating(pct);
      allSteps.push(...trace.slice(1));
      return createTrace(allSteps, rating, warnings);
    }

    case "GENERAL_STANDARD":
    case "MANUAL": {
      const rating = d(manualRating ?? 0);
      allSteps.push({ label: "Evaluator-assigned rating", value: rating.toFixed(3) });
      return createTrace(allSteps, cap(rating), warnings);
    }

    default:
      warnings.push(`Unknown measurement type: ${rule.measurementType}`);
      return createTrace(allSteps, d(0), warnings, false);
  }
}

const STAGE_RATINGS: Record<string, number> = {
  AC_ENDORSED: 5,
  UNIV_IMDC_ENDORSED: 4,
  UNIV_IMDC_SUBMITTED: 3,
  COLLEGE_IMDC_ENDORSED: 2,
  COLLEGE_IMDC_DRAFT: 1,
  TERMINAL_REPORT: 5,
  PERFORMANCE_REVIEWED: 4,
  IMPLEMENTED: 3,
  PROPOSAL_APPROVED: 2,
  PROPOSAL_SUBMITTED: 1,
  PUB_SCOPUS_JOURNAL: 5,
  PUB_SCOPUS_PROC: 4,
  PUB_INTL_JOURNAL: 3,
  PUB_INTL_PROC: 2,
  PUB_NATIONAL: 1,
  KP_R5_PATENT: 5,
  KP_R4_UTILITY: 4,
  KP_R3_DESIGN: 3,
  KP_R2_MONOGRAPH: 2,
  KP_R1_MANUSCRIPT: 1,
};

function getStageRating(stageKey: string): D {
  return d(STAGE_RATINGS[stageKey] ?? 0);
}

function allocateGroupCredit(
  rule: IndicatorRuleInput,
  output: IndicatorOutputInput,
  rawRating: D
): { allocated: D; trace: ComputationStep[] } {
  if (!rule.authorshipAllocation) {
    return { allocated: rawRating, trace: [] };
  }

  const numberInGroup = Math.max(output.numberOfAuthors ?? output.numberOfMembers ?? 1, 1);
  const isMain = Boolean(output.isMainAuthor ?? output.isProjectLeader);
  const { mainAuthorPct, coAuthorPct } = rule.authorshipAllocation;

  return allocateAuthorship(rawRating, isMain, numberInGroup, mainAuthorPct, coAuthorPct);
}

function computeStageCumulative(
  rule: IndicatorRuleInput,
  outputs: IndicatorOutputInput[],
  allSteps: { label: string; formula?: string; value: string; detail?: string }[],
  warnings: string[]
): ComputationTrace {
  const allocatedScores: D[] = [];

  for (const output of outputs) {
    const rawRating = getStageRating(output.stageKey ?? "");
    allSteps.push({
      label: output.title ?? output.stageLabel ?? "Output",
      value: `${output.stageLabel} → ${rawRating.toFixed(1)}`,
    });

    const { allocated, trace } = allocateGroupCredit(rule, output, rawRating);
    allSteps.push(...trace);
    allocatedScores.push(allocated);
  }

  // Check if average-by-count applies
  if (rule.scoringMode === "AVERAGE_BY_COUNT") {
    const requiredCount =
      rule.periodTarget ??
      rule.requiredOutputCount?.[rule.rankCategory] ??
      getRequiredOutputCount(rule.rankCategory);
    const { rating, trace } = averageByRequiredCount(allocatedScores, requiredCount, d(rule.pointCap));
    allSteps.push(...trace);
    return createTrace(allSteps, rating, warnings);
  }

  const { rating, trace } = cumulativeWithCap(allocatedScores, d(rule.pointCap));
  allSteps.push(...trace);
  return createTrace(allSteps, rating, warnings);
}

function computeStageNonCumulative(
  rule: IndicatorRuleInput,
  outputs: IndicatorOutputInput[],
  allSteps: { label: string; formula?: string; value: string; detail?: string }[],
  warnings: string[]
): ComputationTrace {
  const scores = outputs.map((output) => {
    const rawRating = getStageRating(output.stageKey ?? "");
    allSteps.push({
      label: output.title ?? output.stageLabel ?? "Output",
      value: `${output.stageLabel} → ${rawRating.toFixed(1)}`,
    });
    return rawRating;
  });

  if (rule.scoringMode === "AVERAGE_BY_COUNT") {
    const requiredCount =
      rule.periodTarget ??
      rule.requiredOutputCount?.[rule.rankCategory] ??
      getRequiredOutputCount(rule.rankCategory);
    const { rating, trace } = averageByRequiredCount(scores, requiredCount, d(rule.pointCap));
    allSteps.push(...trace);
    return createTrace(allSteps, rating, warnings);
  }

  const { rating, trace } = highestOnly(scores);
  allSteps.push(...trace);
  return createTrace(allSteps, rating, warnings);
}
