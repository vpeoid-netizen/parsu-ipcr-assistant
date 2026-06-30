"use client";

import { Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IndicatorRatingBar } from "@/components/evaluation/rating-bar";
import { useEvaluation } from "@/components/evaluation/evaluation-context";
import {
  computeTargetEntryRating,
  computeTargetsSectionRating,
  hasTargetInput,
  uid,
} from "@/lib/evaluation-client";
import { formatRating } from "@/lib/utils";
import type { TargetEntryState } from "@/lib/types";

function parseDecimalInput(value: string): number | undefined {
  const trimmed = value.trim();
  if (trimmed === "") return undefined;
  const n = parseFloat(trimmed);
  return Number.isNaN(n) ? undefined : n;
}

function formatNumberField(value: number | undefined): string {
  if (value == null || Number.isNaN(value)) return "";
  return String(value);
}

export function TargetsStep({ type }: { type: "strategic" | "priority" }) {
  const { state, setState } = useEvaluation();
  if (!state) return null;

  const key = type === "strategic" ? "strategicTargets" : "priorityTargets";
  const targets = state[key];
  const title = type === "strategic" ? "Strategic Results" : "Priority Results";
  const movNote =
    type === "strategic"
      ? "Certification by College Planning and Development Coordinator"
      : "Proof certified by the College Dean";

  const sectionRating = useMemo(() => computeTargetsSectionRating(targets), [targets]);

  const update = (list: TargetEntryState[]) => setState({ ...state, [key]: list });

  const add = () =>
    update([
      ...targets,
      {
        id: uid(),
        targetStatement: "",
        unitOfMeasure: "",
        periodTarget: 0,
      },
    ]);

  const patch = (id: string, p: Partial<TargetEntryState>) =>
    update(targets.map((t) => (t.id === id ? { ...t, ...p } : t)));

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {title} — enter assigned targets and accomplishments. Required MOV (reference): {movNote}.
      </p>

      {sectionRating != null && (
        <div className="rounded-lg border bg-card p-4 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">{title} rating</span>
            <span className="font-mono font-semibold text-primary">
              {formatRating(sectionRating.rating)}
            </span>
          </div>
          <IndicatorRatingBar rating={sectionRating.rating} label="Section rating" compact />
          <p className="text-xs text-muted-foreground">
            Consolidated achievement: {sectionRating.pct.toFixed(2)}%
          </p>
        </div>
      )}

      {targets.map((t) => {
        const entryRating = computeTargetEntryRating(t);
        const hasInput = hasTargetInput(t);

        return (
          <div key={t.id} className="rounded-lg border p-4 space-y-3">
            <div className="flex justify-between items-start gap-2">
              {hasInput && entryRating != null ? (
                <span className="text-sm font-mono font-semibold text-primary field-computed px-2 py-1 rounded">
                  {formatRating(entryRating)}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => update(targets.filter((x) => x.id !== t.id))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {hasInput && entryRating != null && (
              <IndicatorRatingBar rating={entryRating} label="Target rating" compact />
            )}

            <div>
              <Label>Target statement</Label>
              <Textarea
                value={t.targetStatement}
                onChange={(e) => patch(t.id, { targetStatement: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label>Unit of measure</Label>
                <Input
                  value={t.unitOfMeasure}
                  onChange={(e) => patch(t.id, { unitOfMeasure: e.target.value })}
                />
              </div>
              <div>
                <Label>Period target</Label>
                <Input
                  type="number"
                  step="any"
                  min={0}
                  value={t.periodTarget > 0 ? formatNumberField(t.periodTarget) : ""}
                  onChange={(e) =>
                    patch(t.id, { periodTarget: parseDecimalInput(e.target.value) ?? 0 })
                  }
                />
              </div>
              <div>
                <Label>Actual accomplishment</Label>
                <Input
                  type="number"
                  step="any"
                  min={0}
                  value={formatNumberField(t.actualAccomplishment)}
                  onChange={(e) =>
                    patch(t.id, { actualAccomplishment: parseDecimalInput(e.target.value) })
                  }
                />
              </div>
            </div>
          </div>
        );
      })}
      <Button variant="outline" onClick={add}>
        <Plus className="h-4 w-4" />
        Add {type === "strategic" ? "strategic" : "priority"} target
      </Button>
    </div>
  );
}
