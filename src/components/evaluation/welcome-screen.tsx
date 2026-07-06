"use client";

import { Calculator, FileText, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParsuLogo } from "@/components/parsu-logo";
import { useEvaluation } from "@/components/evaluation/evaluation-context";
import { APP_DISPLAY_NAME, EVALUATION_STEPS, RANK_CATEGORY_LABELS } from "@/lib/utils";

function formatSavedAt(savedAt: string) {
  return new Date(savedAt).toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function WelcomeScreen() {
  const { sessions, startEvaluation, openSession, deleteSession, storageAvailable, saveError } =
    useEvaluation();

  const handleDelete = (id: string, title: string) => {
    const confirmed = window.confirm(
      `Delete "${title}"?\n\nThis evaluation will be permanently removed from local storage on this device.`
    );
    if (confirmed) deleteSession(id);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="text-center mb-10">
        <ParsuLogo size={80} className="h-20 w-20 object-contain mx-auto mb-4" />
        <h1 className="text-2xl sm:text-3xl font-bold text-parsu-dark">{APP_DISPLAY_NAME}</h1>
        <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
          FY 2026 rating computation tool for teaching personnel. Evaluations are saved to your
          browser&apos;s local storage — close anytime and reopen later with all details intact.
        </p>
      </div>

      {!storageAvailable && (
        <div className="mb-6 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          Browser local storage is unavailable. Enable storage for this site to save and resume
          evaluations on this device.
        </div>
      )}

      {saveError && (
        <div className="mb-6 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {saveError}
        </div>
      )}

      <div className="flex justify-center mb-6">
        <Button size="lg" className="px-8" onClick={startEvaluation}>
          <Plus className="h-4 w-4" />
          New Evaluation
        </Button>
      </div>

      {sessions.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Saved in local storage
          </h2>
          {sessions.map((session) => {
            const stepLabel =
              EVALUATION_STEPS.find((s) => s.id === session.currentStep)?.label ?? "In progress";
            const rankLabel = RANK_CATEGORY_LABELS[session.rankCategory] ?? session.rankCategory;

            return (
              <div
                key={session.id}
                className="rounded-lg border bg-card p-4 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{session.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {rankLabel} &bull; Step {session.currentStep}: {stepLabel}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last saved {formatSavedAt(session.savedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" onClick={() => openSession(session.id)}>
                    Open
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(session.id, session.title)}
                    aria-label={`Delete ${session.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border bg-card p-8 text-center shadow-sm">
          <Calculator className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">No saved evaluations yet</h2>
          <p className="text-sm text-muted-foreground">
            Start a new evaluation to compute your IPCR. Your work is saved automatically to local
            storage as you go. Means of Verification are shown as reference guidance only.
          </p>
        </div>
      )}
    </div>
  );
}
