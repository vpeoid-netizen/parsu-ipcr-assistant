import { describe, expect, it } from "vitest";
import { computeSupportFunctionsRating, d, round } from "./decimal";

describe("computeSupportFunctionsRating", () => {
  it("includes zero-rated support functions in the average divisor", () => {
    const { rating } = computeSupportFunctionsRating([
      { compositeRating: d(4) },
      { compositeRating: d(3) },
      { compositeRating: d(0) },
    ]);
    expect(round(rating).toNumber()).toBeCloseTo(7 / 3, 3);
  });

  it("returns zero when all identified support functions are zero", () => {
    const { rating } = computeSupportFunctionsRating([
      { compositeRating: d(0) },
      { compositeRating: d(0) },
    ]);
    expect(round(rating).toNumber()).toBe(0);
  });

  it("returns zero when there are no support functions", () => {
    const { rating } = computeSupportFunctionsRating([]);
    expect(round(rating).toNumber()).toBe(0);
  });
});
