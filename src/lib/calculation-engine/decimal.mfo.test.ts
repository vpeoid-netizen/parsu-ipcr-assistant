import { describe, expect, it } from "vitest";
import { computeMfoRating, d, round } from "./decimal";

describe("computeMfoRating", () => {
  it("includes zero-rated applicable indicators in the MFO average divisor (MFO 4)", () => {
    const { rating } = computeMfoRating([
      { code: "MFO4-E01", rating: d(5), applicable: true },
      { code: "MFO4-E02", rating: d(4), applicable: true },
      { code: "MFO4-E03", rating: d(3), applicable: true },
      { code: "MFO4-E04", rating: d(0), applicable: true },
    ]);
    expect(round(rating).toNumber()).toBe(3);
  });

  it("includes zero-rated applicable indicators for MFO 1, 2, and 3", () => {
    const mfo1 = computeMfoRating([
      { code: "MFO1-Q01", rating: d(4), applicable: true },
      { code: "MFO1-Q02", rating: d(0), applicable: true },
    ]);
    expect(round(mfo1.rating).toNumber()).toBe(2);

    const mfo2 = computeMfoRating([
      { code: "MFO2-E01", rating: d(5), applicable: true },
      { code: "MFO2-E02", rating: d(0), applicable: true },
    ]);
    expect(round(mfo2.rating).toNumber()).toBe(2.5);

    const mfo3 = computeMfoRating([
      { code: "MFO3-Q01", rating: d(3), applicable: true },
      { code: "MFO3-E01", rating: d(0), applicable: true },
    ]);
    expect(round(mfo3.rating).toNumber()).toBe(1.5);
  });

  it("excludes indicators not included in the rating period", () => {
    const { rating } = computeMfoRating([
      { code: "MFO4-E01", rating: d(4), applicable: true },
      { code: "MFO4-E02", rating: d(0), applicable: false },
    ]);
    expect(round(rating).toNumber()).toBe(4);
  });

  it("returns zero when all applicable indicators are zero", () => {
    const { rating } = computeMfoRating([
      { code: "MFO4-E01", rating: d(0), applicable: true },
      { code: "MFO4-E02", rating: d(0), applicable: true },
    ]);
    expect(round(rating).toNumber()).toBe(0);
  });
});
