import { describe, expect, it } from "vitest";
import {
  computeFinalIpcr,
  d,
  getDeloadingWeights,
  round,
} from "./decimal";

describe("getDeloadingWeights", () => {
  const cases = [
    { deloaded: 15, designationPct: 83.33, ipcrPct: 16.67 },
    { deloaded: 12, designationPct: 66.67, ipcrPct: 33.33 },
    { deloaded: 9, designationPct: 50, ipcrPct: 50 },
    { deloaded: 6, designationPct: 33.33, ipcrPct: 66.67 },
    { deloaded: 3, designationPct: 16.67, ipcrPct: 83.33 },
  ];

  it.each(cases)(
    "matches official table for $deloaded deloaded units",
    ({ deloaded, designationPct, ipcrPct }) => {
      const weights = getDeloadingWeights(deloaded, 18);
      expect(round(weights.designationPct, 2).toNumber()).toBe(designationPct);
      expect(round(weights.ipcrPct, 2).toNumber()).toBe(ipcrPct);
    }
  );
});

describe("computeFinalIpcr", () => {
  it("blends designation and base IPCR using deloaded-unit weights", () => {
    const base = d(4);
    const designation = d(5);
    const { rating } = computeFinalIpcr(base, designation, d(9), d(18), true);
    expect(round(rating).toNumber()).toBe(4.5);
  });

  it("applies 83.33% designation weight for 15 deloaded units", () => {
    const base = d(4);
    const designation = d(5);
    const { rating } = computeFinalIpcr(base, designation, d(15), d(18), true);
    expect(round(rating).toNumber()).toBe(4.833);
  });

  it("applies 16.67% designation weight for 3 deloaded units", () => {
    const base = d(4);
    const designation = d(5);
    const { rating } = computeFinalIpcr(base, designation, d(3), d(18), true);
    expect(round(rating).toNumber()).toBe(4.167);
  });

  it("skips weighting when designation is not enabled", () => {
    const base = d(4.25);
    const { rating } = computeFinalIpcr(base, d(5), d(9), d(18), false);
    expect(round(rating).toNumber()).toBe(4.25);
  });
});
