"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { IndicatorOutputEntry } from "@/lib/types";

export function AuthorshipFields({
  output,
  onChange,
}: {
  output: IndicatorOutputEntry;
  onChange: (patch: Partial<IndicatorOutputEntry>) => void;
}) {
  const groupSize = output.numberOfAuthors ?? output.numberOfMembers ?? 1;

  return (
    <div className="space-y-2 rounded border border-primary/20 bg-primary/5 p-2">
      <p className="text-xs text-muted-foreground">
        Group output: main author receives 60% of the stage points; the remaining 40% is divided
        equally among co-authors. Sole author receives full points.
      </p>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-xs"># of faculty in group</Label>
          <Input
            type="number"
            min={1}
            value={groupSize}
            onChange={(e) => {
              const n = Math.max(parseInt(e.target.value, 10) || 1, 1);
              onChange({ numberOfAuthors: n, numberOfMembers: n });
            }}
          />
        </div>
        <label className="flex items-center gap-2 text-xs col-span-2 pt-5">
          <input
            type="checkbox"
            checked={output.isMainAuthor || output.isProjectLeader || false}
            onChange={(e) =>
              onChange({
                isMainAuthor: e.target.checked,
                isProjectLeader: e.target.checked,
              })
            }
            disabled={groupSize <= 1}
          />
          I am the main author / project leader
        </label>
      </div>
    </div>
  );
}
