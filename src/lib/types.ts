export type RankCategory =
  | "INSTRUCTOR"
  | "ASSISTANT_PROFESSOR"
  | "ASSOCIATE_PROFESSOR"
  | "PROFESSOR";

export type AppointmentType = "PERMANENT" | "TEMPORARY" | "COS";

export type EvaluationMode = "SELF_EVALUATION" | "VALIDATION";

export type Dimension = "QUALITY" | "EFFICIENCY" | "TIMELINESS";

export type MeasurementType =
  | "NUMERIC_RATING"
  | "WORKING_DAY_TIMELINESS"
  | "STAGE_CUMULATIVE"
  | "STAGE_NON_CUMULATIVE"
  | "PERCENTAGE_TARGET"
  | "PERCENTAGE_NUM_DEN"
  | "FUND_AMOUNT"
  | "GEOGRAPHIC_LEVEL"
  | "GENERAL_STANDARD"
  | "MANUAL";

export interface IndicatorOutputEntry {
  id: string;
  title?: string;
  stageKey?: string;
  stageLabel?: string;
  deadline?: string;
  submissionDate?: string;
  geographicLevel?: string;
  fundAmount?: number;
  percentageNumerator?: number;
  percentageDenominator?: number;
  rawScore?: number;
  numberOfAuthors?: number;
  isMainAuthor?: boolean;
  numberOfMembers?: number;
  isProjectLeader?: boolean;
  isMainContributor?: boolean;
}

export interface IndicatorEntryState {
  code: string;
  applicabilityStatus: "APPLICABLE" | "NOT_APPLICABLE";
  /** When false, excluded from indicator and MFO averaging for this rating period. */
  includedInRatingPeriod?: boolean;
  /** Professor MFO3 target count (0–2) for the rating period. */
  ratingPeriodTarget?: number;
  actualAccomplishment?: string;
  validatedAccomplishment?: string;
  facultyRemarks?: string;
  evaluatorRemarks?: string;
  evaluatorRating?: number;
  overrideReason?: string;
  outputs: IndicatorOutputEntry[];
}

export interface TargetEntryState {
  id: string;
  targetStatement: string;
  unitOfMeasure: string;
  periodTarget: number;
  actualAccomplishment?: number;
  validatedAccomplishment?: number;
  facultyRemarks?: string;
  evaluatorRemarks?: string;
}

export interface SupportFunctionState {
  id: string;
  role: string;
  expectedOutput: string;
  actualOutput?: string;
  qualityRating?: number;
  efficiencyRating?: number;
  timelinessRating?: number;
  evaluatorComments?: string;
}

export interface DesignationDeliverableState {
  id: string;
  deliverable: string;
  actualOutput?: string;
  qualityRating?: number;
  efficiencyRating?: number;
  timelinessRating?: number;
  evaluatorComments?: string;
}

export interface EvaluationProfile {
  facultyName: string;
  academicRankTitle: string;
  rankCategory: RankCategory;
  collegeCode: string;
  collegeName: string;
  appointmentType: AppointmentType;
  evaluationYear: number;
  ratingPeriod: string;
  department?: string;
  supervisorName?: string;
  teachingLoadUnits: number;
  hasSupportFunctions: boolean;
  hasDesignation: boolean;
  designationTitle?: string;
  officeOrderNo?: string;
  officeOrderDate?: string;
  deloadedUnits: number;
  officeOrderVerified: boolean;
}

export interface EvaluationState {
  mode: EvaluationMode;
  currentStep: number;
  profile: EvaluationProfile;
  indicators: IndicatorEntryState[];
  strategicTargets: TargetEntryState[];
  priorityTargets: TargetEntryState[];
  /** COS Instructor: strategic results have an assigned target for the rating period. */
  strategicHasAssignedTarget?: boolean;
  /** COS Instructor: priority results have an assigned target for the rating period. */
  priorityHasAssignedTarget?: boolean;
  supportFunctions: SupportFunctionState[];
  designationDeliverables: DesignationDeliverableState[];
}
