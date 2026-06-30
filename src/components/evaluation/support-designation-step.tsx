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
  computeDeliverableComposite,
  computeDesignationLive,
  computeSupportFunctionsLive,
  uid,
} from "@/lib/evaluation-client";
import { formatRating } from "@/lib/utils";
import type { DesignationDeliverableState, SupportFunctionState } from "@/lib/types";

function RatingFields({
  item,
  onChange,
}: {
  item: {
    qualityRating?: number;
    efficiencyRating?: number;
    timelinessRating?: number;
  };
  onChange: (patch: {
    qualityRating?: number;
    efficiencyRating?: number;
    timelinessRating?: number;
  }) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {(["qualityRating", "efficiencyRating", "timelinessRating"] as const).map((field) => (
        <div key={field}>
          <Label className="text-xs capitalize">{field.replace("Rating", "")}</Label>
          <Input
            type="number"
            min={1}
            max={5}
            step="any"
            placeholder="1–5"
            value={item[field] ?? ""}
            onChange={(e) => {
              const v = e.target.value.trim();
              onChange({ [field]: v === "" ? undefined : parseFloat(v) });
            }}
          />
        </div>
      ))}
    </div>
  );
}

function DeliverableRatingHeader({ composite }: { composite: number | null }) {
  const hasInput = composite != null;
  return (
    <>
      <div className="flex justify-between items-start gap-2">
        {hasInput ? (
          <span className="text-sm font-mono font-semibold text-primary field-computed px-2 py-1 rounded">
            {formatRating(composite)}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </div>
      {hasInput && <IndicatorRatingBar rating={composite} label="Composite rating (Q+E+T avg)" compact />}
    </>
  );
}

export function SupportDesignationStep({ section }: { section: "support" | "designation" }) {
  const { state, setState } = useEvaluation();

  const supportRating = useMemo(
    () => (state ? computeSupportFunctionsLive(state) : null),
    [state]
  );
  const designationRating = useMemo(
    () => (state ? computeDesignationLive(state) : null),
    [state]
  );

  if (!state) return null;

  if (section === "support" && !state.profile.hasSupportFunctions) {
    return (
      <p className="text-sm text-muted-foreground p-4">
        Support Functions are not enabled. Check &quot;Has support functions&quot; in Faculty
        Information to add deliverables.
      </p>
    );
  }

  if (section === "designation" && !state.profile.hasDesignation) {
    return (
      <p className="text-sm text-muted-foreground p-4">
        Designation rating is not enabled. Check designation options in Faculty Information.
      </p>
    );
  }

  if (section === "support") {
    const list = state.supportFunctions;
    const update = (next: SupportFunctionState[]) => setState({ ...state, supportFunctions: next });

    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Rate each support function using Quality, Efficiency, and Timeliness (1–5).
        </p>

        {supportRating != null && (
          <div className="rounded-lg border bg-card p-4 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Support Functions rating</span>
              <span className="font-mono font-semibold text-primary">
                {formatRating(supportRating)}
              </span>
            </div>
            <IndicatorRatingBar rating={supportRating} label="Section rating" compact />
          </div>
        )}

        {list.map((sf) => {
          const composite = computeDeliverableComposite(sf);
          return (
            <div key={sf.id} className="rounded-lg border p-4 space-y-3">
              <div className="flex justify-end">
                <Button variant="ghost" size="icon" onClick={() => update(list.filter((x) => x.id !== sf.id))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <DeliverableRatingHeader composite={composite} />
              <Input
                placeholder="Role"
                value={sf.role}
                onChange={(e) => update(list.map((x) => (x.id === sf.id ? { ...x, role: e.target.value } : x)))}
              />
              <Textarea
                placeholder="Expected output"
                value={sf.expectedOutput}
                onChange={(e) =>
                  update(list.map((x) => (x.id === sf.id ? { ...x, expectedOutput: e.target.value } : x)))
                }
              />
              <Textarea
                placeholder="Actual output"
                value={sf.actualOutput ?? ""}
                onChange={(e) =>
                  update(list.map((x) => (x.id === sf.id ? { ...x, actualOutput: e.target.value } : x)))
                }
              />
              <RatingFields
                item={sf}
                onChange={(patch) =>
                  update(list.map((x) => (x.id === sf.id ? { ...x, ...patch } : x)))
                }
              />
            </div>
          );
        })}
        <Button
          variant="outline"
          onClick={() => update([...list, { id: uid(), role: "", expectedOutput: "" }])}
        >
          <Plus className="h-4 w-4" /> Add support function
        </Button>
      </div>
    );
  }

  const list = state.designationDeliverables;
  const update = (next: DesignationDeliverableState[]) =>
    setState({ ...state, designationDeliverables: next });

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Rate designation deliverables. Office Order must be verified for designation weighting.
      </p>

      {designationRating != null && (
        <div className="rounded-lg border bg-card p-4 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">Designation rating</span>
            <span className="font-mono font-semibold text-primary">
              {formatRating(designationRating)}
            </span>
          </div>
          <IndicatorRatingBar rating={designationRating} label="Section rating" compact />
        </div>
      )}

      {list.map((dd) => {
        const composite = computeDeliverableComposite(dd);
        return (
          <div key={dd.id} className="rounded-lg border p-4 space-y-3">
            <div className="flex justify-end">
              <Button variant="ghost" size="icon" onClick={() => update(list.filter((x) => x.id !== dd.id))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <DeliverableRatingHeader composite={composite} />
            <Textarea
              placeholder="Deliverable"
              value={dd.deliverable}
              onChange={(e) =>
                update(list.map((x) => (x.id === dd.id ? { ...x, deliverable: e.target.value } : x)))
              }
            />
            <Textarea
              placeholder="Actual output"
              value={dd.actualOutput ?? ""}
              onChange={(e) =>
                update(list.map((x) => (x.id === dd.id ? { ...x, actualOutput: e.target.value } : x)))
              }
            />
            <RatingFields
              item={dd}
              onChange={(patch) =>
                update(list.map((x) => (x.id === dd.id ? { ...x, ...patch } : x)))
              }
            />
          </div>
        );
      })}
      <Button variant="outline" onClick={() => update([...list, { id: uid(), deliverable: "" }])}>
        <Plus className="h-4 w-4" /> Add deliverable
      </Button>
    </div>
  );
}
