"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  computeLiveEvaluation,
  createInitialState,
  loadSession,
  refreshIndicatorsForProfile,
  saveSession,
} from "@/lib/evaluation-client";
import type { EvaluationState } from "@/lib/types";

interface EvaluationContextValue {
  state: EvaluationState | null;
  setState: React.Dispatch<React.SetStateAction<EvaluationState | null>>;
  startEvaluation: () => void;
  resetEvaluation: () => void;
  updateProfile: (patch: Partial<EvaluationState["profile"]>) => void;
  computation: ReturnType<typeof computeLiveEvaluation> | null;
}

const EvaluationContext = createContext<EvaluationContextValue | null>(null);

export function EvaluationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<EvaluationState | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = loadSession();
    if (saved) setState(saved);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && state) saveSession(state);
  }, [state, hydrated]);

  const startEvaluation = useCallback(() => {
    setState(createInitialState());
  }, []);

  const resetEvaluation = useCallback(() => {
    setState(null);
    if (typeof window !== "undefined") sessionStorage.removeItem("parsu-ipcr-session");
  }, []);

  const updateProfile = useCallback((patch: Partial<EvaluationState["profile"]>) => {
    setState((prev) => {
      if (!prev) return prev;
      const profile = { ...prev.profile, ...patch };
      let next = { ...prev, profile };
      if (patch.rankCategory || patch.appointmentType) {
        next = refreshIndicatorsForProfile(next);
      }
      return next;
    });
  }, []);

  const computation = useMemo(
    () => (state ? computeLiveEvaluation(state) : null),
    [state]
  );

  return (
    <EvaluationContext.Provider
      value={{ state, setState, startEvaluation, resetEvaluation, updateProfile, computation }}
    >
      {children}
    </EvaluationContext.Provider>
  );
}

export function useEvaluation() {
  const ctx = useContext(EvaluationContext);
  if (!ctx) throw new Error("useEvaluation must be used within EvaluationProvider");
  return ctx;
}
