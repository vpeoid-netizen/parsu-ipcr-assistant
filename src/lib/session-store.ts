import {
  normalizeEvaluationState,
  uid,
} from "@/lib/evaluation-client";
import type { EvaluationState } from "@/lib/types";

const SESSIONS_STORAGE_KEY = "parsu-ipcr-sessions";
const ACTIVE_SESSION_KEY = "parsu-ipcr-active-session";
const LEGACY_SESSION_KEY = "parsu-ipcr-session";
const STORAGE_VERSION = 2;

export interface SessionSummary {
  id: string;
  title: string;
  createdAt: string;
  savedAt: string;
  currentStep: number;
  facultyName: string;
  rankCategory: string;
}

export interface LoadedSession {
  id: string;
  state: EvaluationState;
  savedAt: string;
  title: string;
}

interface StoredSession {
  id: string;
  title: string;
  createdAt: string;
  savedAt: string;
  state: EvaluationState;
}

interface SessionStore {
  version: number;
  sessions: StoredSession[];
}

function deriveTitle(state: EvaluationState): string {
  const name = state.profile.facultyName?.trim();
  if (name) return name;
  return "Untitled evaluation";
}

function readStore(): SessionStore {
  if (typeof window === "undefined") {
    return { version: STORAGE_VERSION, sessions: [] };
  }

  migrateLegacyIfNeeded();

  const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
  if (!raw) return { version: STORAGE_VERSION, sessions: [] };

  try {
    const parsed = JSON.parse(raw) as SessionStore;
    if (parsed?.version === STORAGE_VERSION && Array.isArray(parsed.sessions)) {
      return parsed;
    }
  } catch {
    // fall through
  }
  return { version: STORAGE_VERSION, sessions: [] };
}

function writeStore(store: SessionStore): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
}

function parseLegacyPayload(raw: string): { state: EvaluationState; savedAt: string | null } | null {
  try {
    const parsed = JSON.parse(raw) as
      | { version?: number; savedAt?: string; state?: EvaluationState }
      | EvaluationState;

    if (
      parsed &&
      typeof parsed === "object" &&
      "state" in parsed &&
      parsed.state &&
      typeof parsed.state === "object"
    ) {
      return {
        state: normalizeEvaluationState(parsed.state),
        savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : null,
      };
    }
    if (parsed && typeof parsed === "object" && "profile" in parsed && "indicators" in parsed) {
      return {
        state: normalizeEvaluationState(parsed as EvaluationState),
        savedAt: null,
      };
    }
  } catch {
    return null;
  }
  return null;
}

function migrateLegacyIfNeeded() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(SESSIONS_STORAGE_KEY)) return;

  const legacyRaw =
    localStorage.getItem(LEGACY_SESSION_KEY) ?? sessionStorage.getItem(LEGACY_SESSION_KEY);
  if (!legacyRaw) return;

  const legacy = parseLegacyPayload(legacyRaw);
  if (!legacy) {
    localStorage.removeItem(LEGACY_SESSION_KEY);
    sessionStorage.removeItem(LEGACY_SESSION_KEY);
    return;
  }

  const now = new Date().toISOString();
  const id = uid();
  const store: SessionStore = {
    version: STORAGE_VERSION,
    sessions: [
      {
        id,
        title: deriveTitle(legacy.state),
        createdAt: legacy.savedAt ?? now,
        savedAt: legacy.savedAt ?? now,
        state: legacy.state,
      },
    ],
  };

  writeStore(store);
  localStorage.setItem(ACTIVE_SESSION_KEY, id);
  localStorage.removeItem(LEGACY_SESSION_KEY);
  sessionStorage.removeItem(LEGACY_SESSION_KEY);
}

function toSummary(session: StoredSession): SessionSummary {
  return {
    id: session.id,
    title: session.title,
    createdAt: session.createdAt,
    savedAt: session.savedAt,
    currentStep: session.state.currentStep,
    facultyName: session.state.profile.facultyName?.trim() ?? "",
    rankCategory: session.state.profile.rankCategory,
  };
}

export function listSessions(): SessionSummary[] {
  const store = readStore();
  return store.sessions
    .map(toSummary)
    .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
}

export function getActiveSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_SESSION_KEY);
}

export function setActiveSessionId(id: string | null) {
  if (typeof window === "undefined") return;
  if (id) localStorage.setItem(ACTIVE_SESSION_KEY, id);
  else localStorage.removeItem(ACTIVE_SESSION_KEY);
}

export function createSession(state: EvaluationState): string | null {
  const store = readStore();
  const now = new Date().toISOString();
  const id = uid();
  const normalized = normalizeEvaluationState(state);

  store.sessions.push({
    id,
    title: deriveTitle(normalized),
    createdAt: now,
    savedAt: now,
    state: normalized,
  });

  if (!writeStore(store)) return null;
  setActiveSessionId(id);
  return id;
}

export function loadSessionById(id: string): LoadedSession | null {
  const store = readStore();
  const session = store.sessions.find((s) => s.id === id);
  if (!session) return null;

  const state = normalizeEvaluationState(session.state);
  return {
    id: session.id,
    state,
    savedAt: session.savedAt,
    title: session.title,
  };
}

export function saveSessionById(id: string, state: EvaluationState): string | null {
  const store = readStore();
  const index = store.sessions.findIndex((s) => s.id === id);
  if (index < 0) return null;

  const savedAt = new Date().toISOString();
  const normalized = normalizeEvaluationState(state);
  const existing = store.sessions[index];

  store.sessions[index] = {
    ...existing,
    title: deriveTitle(normalized),
    savedAt,
    state: normalized,
  };

  if (!writeStore(store)) return null;
  return savedAt;
}

export function deleteSessionById(id: string): boolean {
  const store = readStore();
  const nextSessions = store.sessions.filter((s) => s.id !== id);
  if (nextSessions.length === store.sessions.length) return false;

  if (!writeStore({ ...store, sessions: nextSessions })) return false;

  if (getActiveSessionId() === id) setActiveSessionId(null);
  return true;
}

export function renameSessionById(id: string, title: string): boolean {
  const store = readStore();
  const index = store.sessions.findIndex((s) => s.id === id);
  if (index < 0) return false;

  const trimmed = title.trim();
  if (!trimmed) return false;

  store.sessions[index] = {
    ...store.sessions[index],
    title: trimmed,
  };

  return writeStore(store);
}
