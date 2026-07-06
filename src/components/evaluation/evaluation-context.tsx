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
  isLocalStorageAvailable,
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
  storageAvailable: boolean;
  lastSavedAt: string | null;
  saveError: string | null;
  activeSessionId: string | null;
  activeSessionTitle: string | null;
  sessions: SessionSummary[];
  startEvaluation: () => void;
  openSession: (id: string) => void;
  closeSession: () => void;
  deleteSession: (id: string) => void;
  saveNow: () => boolean;
  updateProfile: (patch: Partial<EvaluationState["profile"]>) => void;
  computation: ReturnType<typeof computeLiveEvaluation> | null;
}

const EvaluationContext = createContext<EvaluationContextValue | null>(null);

export function EvaluationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<EvaluationState | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionIdState] = useState<string | null>(null);
  const [activeSessionTitle, setActiveSessionTitle] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);

  const refreshSessions = useCallback(() => {
    setSessions(listSessions());
  }, []);

  const persistActiveSession = useCallback(
    (nextState: EvaluationState, sessionId: string) => {
      const result = saveSessionById(sessionId, nextState);
      if (result.ok) {
        setLastSavedAt(result.savedAt);
        setSaveError(null);
        refreshSessions();
        const title = nextState.profile.facultyName?.trim() || "Untitled evaluation";
        setActiveSessionTitle(title);
        return true;
      }
      setSaveError(result.error);
      return false;
    },
    [refreshSessions]
  );

  useEffect(() => {
    setStorageAvailable(isLocalStorageAvailable());
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
      persistActiveSession(state, activeSessionId);
    }
  }, [state, hydrated, activeSessionId, persistActiveSession]);

  useEffect(() => {
    if (!state || !activeSessionId) return;

    const handleBeforeUnload = () => {
      saveSessionById(activeSessionId, state);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [state, activeSessionId]);

  const saveNow = useCallback(() => {
    if (!state || !activeSessionId) return false;
    return persistActiveSession(state, activeSessionId);
  }, [state, activeSessionId, persistActiveSession]);

  const startEvaluation = useCallback(() => {
    if (!isLocalStorageAvailable()) {
      setStorageAvailable(false);
      setSaveError(
        "Browser local storage is disabled or unavailable. Enable storage for this site to save evaluations."
      );
      return;
    }

    const initial = createInitialState();
    const id = createSession(initial);
    if (!id) {
      setSaveError("Could not create a new evaluation in browser local storage.");
      return;
    }
    setState(initial);
    setActiveSessionIdState(id);
    setActiveSessionTitle("Untitled evaluation");
    setLastSavedAt(new Date().toISOString());
    setSaveError(null);
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
      setSaveError(null);
      setActiveSessionId(id);
    },
    [refreshSessions]
  );

  const closeSession = useCallback(() => {
    if (state && activeSessionId) {
      persistActiveSession(state, activeSessionId);
    }
    setState(null);
    setActiveSessionIdState(null);
    setActiveSessionTitle(null);
    setLastSavedAt(null);
    setActiveSessionId(null);
    refreshSessions();
  }, [state, activeSessionId, persistActiveSession, refreshSessions]);

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
        storageAvailable,
        lastSavedAt,
        saveError,
        activeSessionId,
        activeSessionTitle,
        sessions,
        startEvaluation,
        openSession,
        closeSession,
        deleteSession,
        saveNow,
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
