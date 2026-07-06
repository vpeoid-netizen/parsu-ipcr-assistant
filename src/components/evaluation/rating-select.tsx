"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const RATING_OPTIONS = [0, 1, 2, 3, 4, 5] as const;

function clampRating(value: number): number {
  return Math.min(5, Math.max(0, value));
}

export function RatingSelect({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value?: number;
  onChange: (value: number | undefined) => void;
  disabled?: boolean;
}) {
  return (
    <div className={disabled ? "opacity-50" : undefined}>
      <Label className="text-xs">{label}</Label>
      <Select
        value={value !== undefined ? String(value) : undefined}
        onValueChange={(v) => onChange(clampRating(parseInt(v, 10)))}
        disabled={disabled}
      >
        <SelectTrigger className="h-9">
          <SelectValue placeholder="0–5" />
        </SelectTrigger>
        <SelectContent>
          {RATING_OPTIONS.map((n) => (
            <SelectItem key={n} value={String(n)}>
              {n}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
