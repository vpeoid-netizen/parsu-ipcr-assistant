import { describe, expect, it } from "vitest";
import { computeFullEvaluation } from "./evaluation";

const profile = {
  rankCategory: "INSTRUCTOR",
  appointmentType: "PERMANENT",
  hasSupportFunctions: true,
  hasDesignation: false,
  deloadedUnits: 0,
  teachingLoadUnits: 18,
};

function evaluate(
  supportFunctions: {
    qualityRating?: number;
    efficiencyRating?: number;
    timelinessRating?: number;
  }[]
) {
  return computeFullEvaluation({
    profile,
    indicators: [],
    strategicTargets: [{ rating: 4 }],
    priorityTargets: [],
    supportFunctions,
    designationDeliverables: [],
    hasStrategicOrPriority: true,
  });
}

describe("support functions in the full evaluation", () => {
  it("uses only entered Q/E/T ratings, matching the Step 8 section rating", () => {
    const result = evaluate([{ qualityRating: 5 }]);
    expect(result.supportFunctionsRating.rating).toBe(5);
  });

  it("keeps an explicit zero in the support function composite and section divisor", () => {
    const partialZero = evaluate([{ qualityRating: 5, efficiencyRating: 0, timelinessRating: 0 }]);
    expect(partialZero.supportFunctionsRating.rating).toBeCloseTo(5 / 3, 3);

    const mixed = evaluate([{ qualityRating: 4, efficiencyRating: 4, timelinessRating: 4 }, { qualityRating: 0 }]);
    expect(mixed.supportFunctionsRating.rating).toBe(2);
  });

  it("applies the Step 8 support functions rating in the base IPCR", () => {
    const result = evaluate([{ qualityRating: 5, efficiencyRating: 5, timelinessRating: 5 }]);
    expect(result.supportFunctionsRating.rating).toBe(5);
    const supportLine = result.baseIpcr.trace.steps.find((step) =>
      step.label.startsWith("Support Functions")
    );
    expect(supportLine?.formula).toContain("5.000 × 10%");
    expect(supportLine?.value).toBe("0.500");
  });
});
