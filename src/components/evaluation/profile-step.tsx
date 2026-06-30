"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEvaluation } from "@/components/evaluation/evaluation-context";
import { TEACHING_LOAD_UNITS } from "@/lib/evaluation-client";
import { ACADEMIC_RANKS, COLLEGES, RATING_PERIODS } from "@/data/reference";
import { APPOINTMENT_LABELS } from "@/lib/utils";
import type { AppointmentType } from "@/lib/types";

export function ProfileStep() {
  const { state, updateProfile } = useEvaluation();
  if (!state) return null;
  const p = state.profile;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-primary/5 p-4">
        <h3 className="font-semibold text-parsu-dark">Faculty and Evaluation Information</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Required before rating computation: Name, Academic Rank, College, Appointment, Year, and
          Rating Period.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="facultyName">Name of Faculty Member *</Label>
          <Input
            id="facultyName"
            value={p.facultyName}
            onChange={(e) => updateProfile({ facultyName: e.target.value })}
            placeholder="Full name"
          />
        </div>

        <div>
          <Label>Academic Rank *</Label>
          <Select
            value={p.academicRankTitle}
            onValueChange={(title) => {
              const rank = ACADEMIC_RANKS.find((r) => r.title === title);
              if (rank) updateProfile({ academicRankTitle: title, rankCategory: rank.category });
            }}
          >
            <SelectTrigger><SelectValue placeholder="Select rank" /></SelectTrigger>
            <SelectContent>
              {ACADEMIC_RANKS.map((r) => (
                <SelectItem key={r.title} value={r.title}>{r.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>College *</Label>
          <Select
            value={p.collegeCode}
            onValueChange={(code) => {
              const col = COLLEGES.find((c) => c.code === code);
              if (col) updateProfile({ collegeCode: code, collegeName: col.name });
            }}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-72">
              {COLLEGES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.name} — {c.campus}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Appointment Status *</Label>
          <Select
            value={p.appointmentType}
            onValueChange={(v) => updateProfile({ appointmentType: v as AppointmentType })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(APPOINTMENT_LABELS).map(([k, label]) => (
                <SelectItem key={k} value={k}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Evaluation Year *</Label>
          <Input
            type="number"
            value={p.evaluationYear}
            onChange={(e) => updateProfile({ evaluationYear: parseInt(e.target.value, 10) || 2026 })}
          />
        </div>

        <div>
          <Label>Rating Period *</Label>
          <Select value={p.ratingPeriod} onValueChange={(v) => updateProfile({ ratingPeriod: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {RATING_PERIODS.map((period) => (
                <SelectItem key={period} value={period}>{period}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Department / Program</Label>
          <Input
            value={p.department ?? ""}
            onChange={(e) => updateProfile({ department: e.target.value })}
          />
        </div>

        <div>
          <Label>Immediate Supervisor / College Dean</Label>
          <Input
            value={p.supervisorName ?? ""}
            onChange={(e) => updateProfile({ supervisorName: e.target.value })}
          />
        </div>

        <div>
          <Label>Total Teaching Load (units)</Label>
          <Input
            type="number"
            value={TEACHING_LOAD_UNITS}
            readOnly
            disabled
            className="bg-muted text-muted-foreground"
          />
        </div>

        <div className="sm:col-span-2 flex flex-wrap gap-6 pt-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={p.hasSupportFunctions}
              onChange={(e) => updateProfile({ hasSupportFunctions: e.target.checked })}
            />
            Has support functions
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={p.hasDesignation}
              onChange={(e) => updateProfile({ hasDesignation: e.target.checked })}
            />
            Has official designation with deloaded units
          </label>
        </div>

        {p.hasDesignation && (
          <>
            <div className="sm:col-span-2">
              <Label>Official Designation Title</Label>
              <Input
                value={p.designationTitle ?? ""}
                onChange={(e) => updateProfile({ designationTitle: e.target.value })}
              />
            </div>
            <div>
              <Label>Office Order No.</Label>
              <Input
                value={p.officeOrderNo ?? ""}
                onChange={(e) => updateProfile({ officeOrderNo: e.target.value })}
              />
            </div>
            <div>
              <Label>Deloaded Units</Label>
              <Input
                type="number"
                value={p.deloadedUnits}
                onChange={(e) => updateProfile({ deloadedUnits: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                checked={p.officeOrderVerified}
                onChange={(e) => updateProfile({ officeOrderVerified: e.target.checked })}
              />
              Office Order verified (required for designation weighting)
            </label>
          </>
        )}
      </div>
    </div>
  );
}
