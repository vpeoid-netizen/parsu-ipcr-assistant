"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  computeLiveEvaluation,
  createInitialState,
  refreshIndicatorsForProfile,
} from "@/lib/evaluation-client";
import {
  createSession,
  deleteSessionById,
  getActiveSessionId,
  listSessions,
  loadSessionById,
  saveSessionById,
  setActiveSessionId,
  type SessionSummary,
} from "@/lib/session-store";
import type { EvaluationState } from "@/lib/types";

interface EvaluationContextValue {
  state: EvaluationState | null;
  setState: React.Dispatch<React.SetStateAction<EvaluationState | null>>;
  hydrated: boolean;
  lastSavedAt: string | null;
  activeSessionId: string | null;
  activeSessionTitle: string | null;
  sessions: SessionSummary[];
  startEvaluation: () => void;
  openSession: (id: string) => void;
  closeSession: () => void;
  deleteSession: (id: string) => void;
  updateProfile: (patch: Partial<EvaluationState["profile"]>) => void;
  computation: ReturnType<typeof computeLiveEvaluation> | null;
}

const EvaluationContext = createContext<EvaluationContextValue | null>(null);

export function EvaluationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<EvaluationState | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionIdState] = useState<string | null>(null);
  const [activeSessionTitle, setActiveSessionTitle] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);

  const refreshSessions = useCallback(() => {
    setSessions(listSessions());
  }, []);

  useEffect(() => {
    refreshSessions();
    const activeId = getActiveSessionId();
    if (activeId) {
      const loaded = loadSessionById(activeId);
      if (loaded) {
        setState(loaded.state);
        setActiveSessionIdState(activeId);
        setActiveSessionTitle(loaded.title);
        setLastSavedAt(loaded.savedAt);
      } else {
        setActiveSessionId(null);
      }
    }
    setHydrated(true);
  }, [refreshSessions]);

  useEffect(() => {
    if (hydrated && state && activeSessionId) {
      const savedAt = saveSessionById(activeSessionId, state);
      if (savedAt) {
        setLastSavedAt(savedAt);
        refreshSessions();
        const title = state.profile.facultyName?.trim() || "Untitled evaluation";
        setActiveSessionTitle(title);
      }
    }
  }, [state, hydrated, activeSessionId, refreshSessions]);

  const startEvaluation = useCallback(() => {
    const initial = createInitialState();
    const id = createSession(initial);
    if (!id) return;
    setState(initial);
    setActiveSessionIdState(id);
    setActiveSessionTitle("Untitled evaluation");
    setLastSavedAt(new Date().toISOString());
    refreshSessions();
  }, [refreshSessions]);

  const openSession = useCallback(
    (id: string) => {
      const loaded = loadSessionById(id);
      if (!loaded) {
        refreshSessions();
        return;
      }
      setState(loaded.state);
      setActiveSessionIdState(id);
      setActiveSessionTitle(loaded.title);
      setLastSavedAt(loaded.savedAt);
      setActiveSessionId(id);
    },
    [refreshSessions]
  );

  const closeSession = useCallback(() => {
    setState(null);
    setActiveSessionIdState(null);
    setActiveSessionTitle(null);
    setLastSavedAt(null);
    setActiveSessionId(null);
    refreshSessions();
  }, [refreshSessions]);

  const deleteSession = useCallback(
    (id: string) => {
      deleteSessionById(id);
      if (activeSessionId === id) {
        setState(null);
        setActiveSessionIdState(null);
        setActiveSessionTitle(null);
        setLastSavedAt(null);
      }
      refreshSessions();
    },
    [activeSessionId, refreshSessions]
  );

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
      value={{
        state,
        setState,
        hydrated,
        lastSavedAt,
        activeSessionId,
        activeSessionTitle,
        sessions,
        startEvaluation,
        openSession,
        closeSession,
        deleteSession,
        updateProfile,
        computation,
      }}
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
