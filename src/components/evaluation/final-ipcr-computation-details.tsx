"use client";

import { useMemo } from "react";
import { useEvaluation } from "@/components/evaluation/evaluation-context";
import { buildFinalIpcrComputationBreakdown } from "@/lib/evaluation-client";

export function FinalIpcrComputationDetails() {
  const { state, computation } = useEvaluation();

  const sections = useMemo(() => {
    if (!state || !computation) return [];
    return buildFinalIpcrComputationBreakdown(state, computation);
  }, [state, computation]);

  if (!state || !computation) return null;

  return (
    <details className="rounded-lg border bg-muted/20 text-sm">
      <summary className="cursor-pointer font-medium text-primary px-4 py-3 select-none">
        How is the Final IPCR Rating computed?
      </summary>
      <div className="border-t px-4 py-3 space-y-4">
        {sections.map((section) => (
          <div key={section.title}>
            <div className="flex justify-between items-baseline gap-2 mb-1">
              <p className="font-medium text-foreground">{section.title}</p>
              {section.ratingLabel && (
                <span className="font-mono text-primary text-xs shrink-0">
                  {section.ratingLabel}
                </span>
              )}
            </div>
            {section.steps.length > 0 ? (
              <ul className="space-y-1 pl-2 border-l-2 border-primary/30 text-xs">
                {section.steps.map((step, i) => (
                  <li key={`${section.title}-${i}`}>
                    <span className="font-medium">{step.label}:</span> {step.value}
                    {step.formula && (
                      <span className="text-muted-foreground"> ({step.formula})</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground pl-2">No computation steps yet.</p>
            )}
          </div>
        ))}
      </div>
    </details>
  );
}
