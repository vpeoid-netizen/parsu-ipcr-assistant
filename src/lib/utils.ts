import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { EvaluationMode } from "@/lib/types";

export type { EvaluationMode };

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRating(value: number | string | null | undefined, decimals = 3): string {
  if (value === null || value === undefined) return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num) || num < 0) return "—";
  if (num === 0) return (0).toFixed(decimals);
  return num.toFixed(decimals);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
}

export const RANK_CATEGORY_LABELS: Record<string, string> = {
  INSTRUCTOR: "Instructor",
  ASSISTANT_PROFESSOR: "Assistant Professor",
  ASSOCIATE_PROFESSOR: "Associate Professor",
  PROFESSOR: "Professor",
};

export const APPOINTMENT_LABELS: Record<string, string> = {
  PERMANENT: "Permanent",
  TEMPORARY: "Temporary",
  COS: "Contract of Service (COS)",
};

export const EVALUATION_STEPS = [
  { id: 1, label: "Faculty Information", key: "profile" },
  { id: 2, label: "Applicability", key: "applicability" },
  { id: 3, label: "MFO 1 & 2", key: "mfo12" },
  { id: 4, label: "MFO 3 — Research", key: "mfo3" },
  { id: 5, label: "MFO 4 — Extension", key: "mfo4" },
  { id: 6, label: "Strategic Results", key: "strategic" },
  { id: 7, label: "Priority Results", key: "priority" },
  { id: 8, label: "Support Functions", key: "support" },
  { id: 9, label: "Designation Rating", key: "designation" },
  { id: 10, label: "Rating Summary", key: "summary" },
  { id: 11, label: "Preview & Export", key: "export" },
];

export const EVALUATION_MODE_LABELS: Record<EvaluationMode, string> = {
  SELF_EVALUATION: "Self-Evaluation Mode",
  VALIDATION: "Validation Mode",
};

export const EVALUATION_MODE_DESCRIPTIONS: Record<EvaluationMode, string> = {
  SELF_EVALUATION:
    "Enter accomplishments and factual details to determine a preliminary or proposed rating.",
  VALIDATION:
    "Review entered accomplishments, apply prescribed criteria, and determine or validate the appropriate rating.",
};

export const DIMENSION_LABELS: Record<string, string> = {
  QUALITY: "Quality",
  EFFICIENCY: "Efficiency",
  TIMELINESS: "Timeliness",
};
