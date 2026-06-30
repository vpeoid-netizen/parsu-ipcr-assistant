"use client";

import { IndicatorCard } from "@/components/evaluation/indicator-card";
import { useEvaluation } from "@/components/evaluation/evaluation-context";
import { INDICATOR_SEEDS } from "@/data/indicators";

export function MfoIndicatorsStep({ mfoCodes }: { mfoCodes: string[] }) {
  const { state } = useEvaluation();
  if (!state) return null;

  const codes = new Set(
    INDICATOR_SEEDS.filter((i) => mfoCodes.includes(i.mfoCode)).map((i) => i.code)
  );
  const entries = state.indicators.filter((e) => codes.has(e.code));

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground p-4">
        No indicators apply for this MFO section given the current rank and appointment type.
      </p>
    );
  }

  return (
    <div>
      {entries.map((entry) => (
        <IndicatorCard key={entry.code} entry={entry} />
      ))}
    </div>
  );
}
