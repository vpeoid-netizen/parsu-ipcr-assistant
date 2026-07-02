import { describe, expect, it } from "vitest";
import {
  computeBaseIpcr,
  computePerformanceResults,
  d,
  getMfoWeights,
  round,
} from "./decimal";

describe("getMfoWeights", () => {
  it.each([
    { rank: "INSTRUCTOR", mfo12: 80, mfo3: 15, mfo4: 5 },
    { rank: "ASSISTANT_PROFESSOR", mfo12: 70, mfo3: 20, mfo4: 10 },
    { rank: "ASSOCIATE_PROFESSOR", mfo12: 60, mfo3: 30, mfo4: 10 },
    { rank: "PROFESSOR", mfo12: 45, mfo3: 50, mfo4: 5 },
  ])("matches official MFO crediting for $rank", ({ rank, mfo12, mfo3, mfo4 }) => {
    const weights = getMfoWeights(rank, "PERMANENT");
    expect(round(weights.mfo1_2.times(100), 2).toNumber()).toBe(mfo12);
    expect(round(weights.mfo3.times(100), 2).toNumber()).toBe(mfo3);
    expect(round(weights.mfo4.times(100), 2).toNumber()).toBe(mfo4);
  });

  it("uses 100% MFO 1 & 2 for COS appointment", () => {
    const weights = getMfoWeights("INSTRUCTOR", "COS");
    expect(round(weights.mfo1_2).toNumber()).toBe(1);
    expect(round(weights.mfo3).toNumber()).toBe(0);
    expect(round(weights.mfo4).toNumber()).toBe(0);
  });
});

describe("computePerformanceResults", () => {
  it("weights MFO 1 & 2, MFO 3, and MFO 4 by rank crediting", () => {
    const weights = getMfoWeights("INSTRUCTOR", "PERMANENT");
    const { rating } = computePerformanceResults(d(4), d(3), d(5), weights);
    expect(round(rating).toNumber()).toBe(3.9);
  });

  it("uses only MFO 1 & 2 for COS performance results", () => {
    const weights = getMfoWeights("INSTRUCTOR", "COS");
    const { rating } = computePerformanceResults(d(4.25), d(0), d(0), weights);
    expect(round(rating).toNumber()).toBe(4.25);
  });
});

describe("computeBaseIpcr", () => {
  it("applies Section 7.1 weights without support functions", () => {
    const { rating } = computeBaseIpcr(d(4), d(5), d(0), false, true);
    expect(round(rating).toNumber()).toBe(4.15);
  });

  it("reallocates Strategic/Priority weight when no targets are assigned", () => {
    const { rating } = computeBaseIpcr(d(4), d(0), d(0), false, false);
    expect(round(rating).toNumber()).toBe(4);
  });

  it("applies Section 7.2 weights with support functions", () => {
    const { rating } = computeBaseIpcr(d(4), d(5), d(3), true, true);
    expect(round(rating).toNumber()).toBe(4);
  });

  it("reallocates Strategic/Priority weight for support-function faculty without targets", () => {
    const { rating } = computeBaseIpcr(d(4), d(0), d(3), true, false);
    expect(round(rating).toNumber()).toBe(3.9);
  });
});
