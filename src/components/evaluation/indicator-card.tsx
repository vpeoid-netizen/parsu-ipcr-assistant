"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MovGuidance } from "@/components/evaluation/mov-guidance";
import { IndicatorPeriodControls } from "@/components/evaluation/indicator-period-controls";
import { IndicatorRatingBar } from "@/components/evaluation/rating-bar";
import { useEvaluation } from "@/components/evaluation/evaluation-context";
import {
  computeSingleIndicatorRating,
  getIndicatorDef,
  hasIndicatorInput,
  uid,
} from "@/lib/evaluation-client";
import { isIncludedInRatingPeriod } from "@/lib/indicator-period";
import {
  GEOGRAPHIC_LEVELS_ENGAGEMENT,
  GEOGRAPHIC_LEVELS_PRESENTATION,
  GEOGRAPHIC_LEVELS_TRAINING,
} from "@/data/reference";
import {
  getRatingScaleOptions,
  isMfo4PercentageDropdown,
  usesRatingScaleDropdown,
  type RatingScaleOption,
} from "@/lib/rating-scales";
import { DIMENSION_LABELS, formatRating, cn } from "@/lib/utils";
import type { IndicatorDefinition } from "@/data/indicators";
import type { IndicatorEntryState } from "@/lib/types";

const STAGE_RATINGS: Record<string, number> = {
  AC_ENDORSED: 5,
  UNIV_IMDC_ENDORSED: 4,
  UNIV_IMDC_SUBMITTED: 3,
  COLLEGE_IMDC_ENDORSED: 2,
  COLLEGE_IMDC_DRAFT: 1,
};

function RatingScaleSelect({
  options,
  value,
  onChange,
  placeholder = "Select rating",
  disabled = false,
  className,
}: {
  options: RatingScaleOption[];
  value: number | undefined;
  onChange: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  const selected = value != null ? String(value) : "";

  return (
    <Select
      value={selected}
      onValueChange={(v) => onChange(parseInt(v, 10))}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={String(o.value)}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function useLiveRating(state: ReturnType<typeof useEvaluation>["state"], entry: IndicatorEntryState) {
  return useMemo(() => {
    if (!state) return { rating: 0, steps: [] as { label: string; value: string; formula?: string }[] };
    const result = computeSingleIndicatorRating(state, entry);
    const rating = result ? parseFloat(result.finalRating) || 0 : 0;
    return { rating, steps: result?.steps ?? [] };
  }, [state, entry]);
}

export function IndicatorCard({ entry }: { entry: IndicatorEntryState }) {
  const { state, setState } = useEvaluation();
  const [expanded, setExpanded] = useState(true);
  const def = getIndicatorDef(entry.code);
  const { rating: liveRating, steps } = useLiveRating(state, entry);

  if (!def || !state) return null;

  const useDropdown = usesRatingScaleDropdown(def);
  const scaleOptions = getRatingScaleOptions(def);
  const included = isIncludedInRatingPeriod(entry);
  const hasInput = hasIndicatorInput(entry, def);
  const showRating = included && hasInput && (liveRating > 0 || isMfo4PercentageDropdown(def));

  const updateEntry = (patch: Partial<IndicatorEntryState>) => {
    setState((s) => {
      if (!s) return s;
      return {
        ...s,
        indicators: s.indicators.map((i) => (i.code === entry.code ? { ...i, ...patch } : i)),
      };
    });
  };

  const updateOutput = (outputId: string, patch: Record<string, unknown>) => {
    updateEntry({
      outputs: entry.outputs.map((o) => (o.id === outputId ? { ...o, ...patch } : o)),
    });
  };

  const addEntry = () => {
    updateEntry({
      outputs: [...entry.outputs, { id: uid(), title: `Entry ${entry.outputs.length + 1}` }],
    });
  };

  const removeOutput = (outputId: string) => {
    updateEntry({ outputs: entry.outputs.filter((o) => o.id !== outputId) });
  };

  const setSingleRawScore = (rawScore: number) => {
    const id = entry.outputs[0]?.id ?? uid();
    updateEntry({ outputs: [{ id, rawScore }] });
  };

  const handleStageSelect = (outputId: string, ratingValue: number, indicator: IndicatorDefinition) => {
    const stage = indicator.stageMovRequirements?.find(
      (s) => (STAGE_RATINGS[s.stageKey] ?? 0) === ratingValue
    );
    updateOutput(outputId, {
      rawScore: ratingValue,
      stageKey: stage?.stageKey,
      stageLabel: stage?.stageLabel,
    });
  };

  const handleGeographicSelect = (
    outputId: string,
    ratingValue: number,
    indicator: IndicatorDefinition
  ) => {
    const levels =
      indicator.code === "MFO2-Q02"
        ? GEOGRAPHIC_LEVELS_ENGAGEMENT
        : indicator.code === "MFO3-Q02"
          ? GEOGRAPHIC_LEVELS_PRESENTATION
          : GEOGRAPHIC_LEVELS_TRAINING;
    const level = levels.find((g) => {
      const match = g.label.match(/\((\d)\)/);
      return match && parseInt(match[1], 10) === ratingValue;
    });
    updateOutput(outputId, {
      rawScore: ratingValue,
      geographicLevel: level?.value,
    });
  };

  const geoLevels =
    def.code === "MFO2-Q02"
      ? GEOGRAPHIC_LEVELS_ENGAGEMENT
      : def.code === "MFO3-Q02"
        ? GEOGRAPHIC_LEVELS_PRESENTATION
        : GEOGRAPHIC_LEVELS_TRAINING;

  const stages = def.stageMovRequirements ?? [];
  const isNumericInput = def.measurementType === "NUMERIC_RATING";
  const isSingleDropdown =
    useDropdown &&
    (def.measurementType === "WORKING_DAY_TIMELINESS" || isMfo4PercentageDropdown(def));
  const isMultiDropdown =
    useDropdown &&
    !isSingleDropdown &&
    (def.allowMultipleOutputs || def.measurementType === "STAGE_CUMULATIVE" || stages.length > 0);

  return (
    <div
      className={cn(
        "rounded-lg border bg-card mb-4 overflow-hidden",
        !included && "opacity-75"
      )}
    >
      <button
        type="button"
        className={cn(
          "w-full flex items-center justify-between p-4 text-left border-b",
          included
            ? "bg-primary/10 hover:bg-primary/15 border-primary/10"
            : "bg-muted hover:bg-muted/80 border-border"
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0 pr-3">
          <p className="text-xs text-muted-foreground">
            {def.mfoCode} &bull; {DIMENSION_LABELS[def.dimension]}
          </p>
          <p className="font-semibold text-sm">{def.name}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {!included && (
            <span className="text-xs text-muted-foreground">Not in period</span>
          )}
          <span
            className={cn(
              "rounded px-2 py-1 text-sm font-mono",
              showRating ? "field-computed" : "text-muted-foreground"
            )}
          >
            {showRating ? formatRating(liveRating) : "—"}
          </span>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t p-4 space-y-4">
          <IndicatorPeriodControls
            entry={entry}
            def={def}
            rankCategory={state.profile.rankCategory}
            onUpdate={updateEntry}
          />

          {hasInput && included && <IndicatorRatingBar rating={liveRating} compact />}

          <p className="text-xs text-muted-foreground">{def.ruleExplanation}</p>
          <MovGuidance indicator={def} />

          <fieldset disabled={!included} className={cn("space-y-4", !included && "pointer-events-none opacity-60")}>
          {isNumericInput && (
            <div>
              <Label>Teaching evaluation rating (1.00–5.00)</Label>
              <Input
                type="number"
                step="0.01"
                min={1}
                max={5}
                value={entry.outputs[0]?.rawScore ?? ""}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  const id = entry.outputs[0]?.id ?? uid();
                  updateEntry({
                    outputs: [{ id, rawScore: isNaN(val) ? undefined : val }],
                  });
                }}
              />
            </div>
          )}

          {isSingleDropdown && (
            <div>
              <Label>Rating</Label>
              <RatingScaleSelect
                options={scaleOptions}
                value={entry.outputs[0]?.rawScore}
                onChange={setSingleRawScore}
              />
            </div>
          )}

          {isMultiDropdown && (
            <div className="space-y-3">
              {entry.outputs.map((output) => (
                <div key={output.id} className="rounded border p-3 space-y-2 bg-muted/20">
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground font-medium">Entry</span>
                    {entry.outputs.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeOutput(output.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {stages.length > 0 && (
                    <div>
                      <Label className="text-xs">Rating (stage / level)</Label>
                      <RatingScaleSelect
                        options={scaleOptions}
                        value={output.rawScore}
                        onChange={(v) => handleStageSelect(output.id, v, def)}
                      />
                    </div>
                  )}

                  {def.measurementType === "GEOGRAPHIC_LEVEL" && stages.length === 0 && (
                    <div>
                      <Label className="text-xs">Rating (scope / level)</Label>
                      <RatingScaleSelect
                        options={scaleOptions}
                        value={output.rawScore}
                        onChange={(v) => handleGeographicSelect(output.id, v, def)}
                      />
                    </div>
                  )}

                  {def.authorshipAllocation && (
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        type="number"
                        min={1}
                        placeholder="# authors/members"
                        value={output.numberOfAuthors ?? output.numberOfMembers ?? ""}
                        onChange={(e) => {
                          const n = parseInt(e.target.value, 10) || 1;
                          updateOutput(output.id, {
                            numberOfAuthors: n,
                            numberOfMembers: n,
                          });
                        }}
                      />
                      <label className="flex items-center gap-1 text-xs col-span-2">
                        <input
                          type="checkbox"
                          checked={output.isMainAuthor || output.isProjectLeader || false}
                          onChange={(e) =>
                            updateOutput(output.id, {
                              isMainAuthor: e.target.checked,
                              isProjectLeader: e.target.checked,
                            })
                          }
                        />
                        Main author / project leader
                      </label>
                    </div>
                  )}
                </div>
              ))}

              <Button variant="outline" size="sm" onClick={addEntry}>
                <Plus className="h-4 w-4" />
                Add Entry
              </Button>
            </div>
          )}

          {!useDropdown && !isNumericInput && (
            <div className="space-y-3">
              {entry.outputs.map((output) => (
                <div key={output.id} className="rounded border p-3 space-y-2 bg-muted/20">
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground font-medium">Entry</span>
                    {entry.outputs.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeOutput(output.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {stages.length > 0 && (
                    <Select
                      value={output.stageKey ?? ""}
                      onValueChange={(v) => {
                        const stage = stages.find((s) => s.stageKey === v);
                        updateOutput(output.id, { stageKey: v, stageLabel: stage?.stageLabel });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage / level" />
                      </SelectTrigger>
                      <SelectContent>
                        {stages.map((s) => (
                          <SelectItem key={s.stageKey} value={s.stageKey}>
                            {s.stageLabel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {def.measurementType === "GEOGRAPHIC_LEVEL" && (
                    <Select
                      value={output.geographicLevel ?? ""}
                      onValueChange={(v) => updateOutput(output.id, { geographicLevel: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Scope / level" />
                      </SelectTrigger>
                      <SelectContent>
                        {geoLevels.map((g) => (
                          <SelectItem key={g.value} value={g.value}>
                            {g.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {def.measurementType === "FUND_AMOUNT" && (
                    <Input
                      type="number"
                      placeholder="Fund amount (PHP)"
                      value={output.fundAmount ?? ""}
                      onChange={(e) =>
                        updateOutput(output.id, { fundAmount: parseFloat(e.target.value) || 0 })
                      }
                    />
                  )}

                  {(def.measurementType === "PERCENTAGE_TARGET" ||
                    def.measurementType === "PERCENTAGE_NUM_DEN") && (
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder={
                          def.measurementType === "PERCENTAGE_TARGET" ? "Actual" : "Numerator"
                        }
                        value={output.percentageNumerator ?? ""}
                        onChange={(e) =>
                          updateOutput(output.id, {
                            percentageNumerator: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                      <Input
                        type="number"
                        placeholder={
                          def.measurementType === "PERCENTAGE_TARGET" ? "Target" : "Denominator"
                        }
                        value={output.percentageDenominator ?? ""}
                        onChange={(e) =>
                          updateOutput(output.id, {
                            percentageDenominator: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  )}

                  {def.authorshipAllocation && (
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        type="number"
                        min={1}
                        placeholder="# authors/members"
                        value={output.numberOfAuthors ?? output.numberOfMembers ?? ""}
                        onChange={(e) => {
                          const n = parseInt(e.target.value, 10) || 1;
                          updateOutput(output.id, {
                            numberOfAuthors: n,
                            numberOfMembers: n,
                          });
                        }}
                      />
                      <label className="flex items-center gap-1 text-xs col-span-2">
                        <input
                          type="checkbox"
                          checked={output.isMainAuthor || output.isProjectLeader || false}
                          onChange={(e) =>
                            updateOutput(output.id, {
                              isMainAuthor: e.target.checked,
                              isProjectLeader: e.target.checked,
                            })
                          }
                        />
                        Main author / project leader
                      </label>
                    </div>
                  )}
                </div>
              ))}

              {(def.allowMultipleOutputs ||
                def.measurementType === "STAGE_CUMULATIVE" ||
                def.measurementType === "GEOGRAPHIC_LEVEL" ||
                def.measurementType === "FUND_AMOUNT" ||
                def.measurementType === "PERCENTAGE_TARGET" ||
                def.measurementType === "PERCENTAGE_NUM_DEN") && (
                <Button variant="outline" size="sm" onClick={addEntry}>
                  <Plus className="h-4 w-4" />
                  Add Entry
                </Button>
              )}
            </div>
          )}
          </fieldset>

          {steps.length > 0 && showRating && (
            <details className="text-xs">
              <summary className="cursor-pointer font-medium text-primary">
                How was this rating computed?
              </summary>
              <ul className="mt-2 space-y-1 pl-2 border-l-2 border-primary/30">
                {steps.map((step, i) => (
                  <li key={i}>
                    <span className="font-medium">{step.label}:</span> {step.value}
                    {step.formula && (
                      <span className="text-muted-foreground"> ({step.formula})</span>
                    )}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
