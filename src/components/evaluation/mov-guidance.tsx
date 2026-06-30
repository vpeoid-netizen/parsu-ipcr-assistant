"use client";

import { Info } from "lucide-react";
import type { IndicatorDefinition } from "@/data/indicators";

export function MovGuidance({ indicator }: { indicator: IndicatorDefinition }) {
  const hasStage = indicator.stageMovRequirements && indicator.stageMovRequirements.length > 0;
  const hasGeneral = indicator.movRequirements.length > 0;

  if (!hasStage && !hasGeneral) return null;

  return (
    <div className="rounded-md border border-dashed border-muted-foreground/30 bg-muted/30 p-3 text-xs">
      <p className="font-semibold flex items-center gap-1 text-muted-foreground mb-2">
        <Info className="h-3.5 w-3.5" />
        Required Means of Verification (reference only)
      </p>
      {hasGeneral && (
        <ul className="list-disc pl-4 space-y-0.5 mb-2">
          {indicator.movRequirements.map((m) => (
            <li key={m.name}>
              {m.name}
              {!m.isRequired && " (when applicable)"}
            </li>
          ))}
        </ul>
      )}
      {hasStage && (
        <div className="space-y-2">
          {indicator.stageMovRequirements!.map((s) => (
            <div key={s.stageKey}>
              <p className="font-medium">{s.stageLabel}</p>
              <ul className="list-disc pl-4">
                {s.movItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
