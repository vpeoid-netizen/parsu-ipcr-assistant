"use client";

import { Calculator, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEvaluation } from "@/components/evaluation/evaluation-context";
import { ProfileStep } from "@/components/evaluation/profile-step";
import { MfoIndicatorsStep } from "@/components/evaluation/mfo-indicators-step";
import { TargetsStep } from "@/components/evaluation/targets-step";
import { SupportDesignationStep } from "@/components/evaluation/support-designation-step";
import { SummaryStep } from "@/components/evaluation/summary-step";
import { ExportStep } from "@/components/evaluation/export-step";
import { SummaryPanel } from "@/components/evaluation/summary-panel";
import {
  EVALUATION_STEPS,
  cn,
  formatRating,
} from "@/lib/utils";

const MFO_STEP_MAP: Record<number, string[]> = {
  3: ["MFO1", "MFO2"],
  4: ["MFO3"],
  5: ["MFO4"],
};

export function EvaluationWorkspace() {
  const { state, setState, resetEvaluation, computation } = useEvaluation();
  if (!state) return null;

  const step = state.currentStep;
  const totalSteps = EVALUATION_STEPS.length;
  const progress = (step / totalSteps) * 100;

  const goTo = (n: number) => setState((s) => (s ? { ...s, currentStep: n } : s));

  const renderStep = () => {
    switch (step) {
      case 1:
        return <ProfileStep />;
      case 2:
        return (
          <div className="text-sm text-muted-foreground p-4">
            Applicable indicators are assigned automatically based on academic rank and appointment
            type. Proceed to enter ratings for each MFO section.
          </div>
        );
      case 3:
      case 4:
      case 5:
        return <MfoIndicatorsStep mfoCodes={MFO_STEP_MAP[step] ?? []} />;
      case 6:
        return <TargetsStep type="strategic" />;
      case 7:
        return <TargetsStep type="priority" />;
      case 8:
        return <SupportDesignationStep section="support" />;
      case 9:
        return <SupportDesignationStep section="designation" />;
      case 10:
        return <SummaryStep />;
      case 11:
        return <ExportStep />;
      default:
        return null;
    }
  };

  const currentLabel = EVALUATION_STEPS.find((s) => s.id === step)?.label ?? "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-xs text-primary font-semibold uppercase tracking-wide">
            FY 2026 IPCR Evaluation
          </p>
          <h2 className="text-xl font-bold">{currentLabel}</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={resetEvaluation}>
            <RotateCcw className="h-4 w-4" />
            New Evaluation
          </Button>
        </div>
      </div>

      <Progress value={progress} className="mb-4 h-2" />

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {EVALUATION_STEPS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => goTo(s.id)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-medium border transition-colors",
              step === s.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-white text-muted-foreground hover:bg-secondary"
            )}
          >
            {s.id}. {s.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Step {step}: {currentLabel}
            </CardTitle>
          </CardHeader>
          <CardContent>{renderStep()}</CardContent>
          <div className="flex justify-between border-t p-4">
            <Button variant="outline" disabled={step <= 1} onClick={() => goTo(step - 1)}>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button disabled={step >= totalSteps} onClick={() => goTo(step + 1)}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        <SummaryPanel />
      </div>

      {computation && computation.finalIpcr.rating > 0 && (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Current final IPCR:{" "}
          <span className="font-mono font-semibold text-foreground">
            {formatRating(computation.finalIpcr.rating)}
          </span>{" "}
          ({computation.adjectivalRating})
        </p>
      )}
    </div>
  );
}
