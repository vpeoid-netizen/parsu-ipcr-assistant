"use client";

import { EvaluationProvider, useEvaluation } from "@/components/evaluation/evaluation-context";
import { WelcomeScreen } from "@/components/evaluation/welcome-screen";
import { EvaluationWorkspace } from "@/components/evaluation/evaluation-workspace";

function EvaluationAppInner() {
  const { state, hydrated } = useEvaluation();

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center text-sm text-muted-foreground">
        Loading saved evaluation…
      </div>
    );
  }

  return state ? <EvaluationWorkspace /> : <WelcomeScreen />;
}

export function EvaluationApp() {
  return (
    <EvaluationProvider>
      <EvaluationAppInner />
    </EvaluationProvider>
  );
}
