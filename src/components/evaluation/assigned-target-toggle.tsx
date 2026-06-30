"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
        checked ? "bg-primary" : "bg-muted"
      )}
    >
      <span
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

export function AssignedTargetToggle({
  checked,
  onChange,
  sectionLabel,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  sectionLabel: string;
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="flex items-center gap-3">
        <ToggleSwitch checked={checked} onChange={onChange} />
        <div>
          <Label className="text-sm font-medium">Has assigned target for rating period</Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Turn this on only when {sectionLabel} has an assigned target for this rating period.
            When off, this section is excluded from IPCR computation.
          </p>
        </div>
      </div>
    </div>
  );
}
