export type RankCategory =
  | "INSTRUCTOR"
  | "ASSISTANT_PROFESSOR"
  | "ASSOCIATE_PROFESSOR"
  | "PROFESSOR";

export type AppointmentType = "PERMANENT" | "TEMPORARY" | "COS";

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

type ScoringMode =
  | "NON_CUMULATIVE"
  | "CUMULATIVE"
  | "HIGHEST_ONLY"
  | "AVERAGE_BY_COUNT";

type ApplicabilityType = "MANDATORY" | "OPTIONAL";

export interface IndicatorDefinition {
  code: string;
  name: string;
  description: string;
  mfoCode: string;
  dimension: Dimension;
  measurementType: MeasurementType;
  scoringMode: ScoringMode;
  pointCap: number;
  ruleExplanation: string;
  sortOrder: number;
  allowedRankCategories: RankCategory[];
  allowedAppointments: AppointmentType[];
  applicabilityType: ApplicabilityType;
  requiresCollegeTarget?: boolean;
  requiresOfficeOrder?: boolean;
  allowMultipleOutputs?: boolean;
  requiredOutputCount?: Record<string, number>;
  authorshipAllocation?: { mainAuthorPct: number; coAuthorPct: number };
  movRequirements: { name: string; description?: string; isRequired?: boolean }[];
  stageMovRequirements?: { stageKey: string; stageLabel: string; movItems: string[] }[];
}

const ALL_RANKS: RankCategory[] = [
  "INSTRUCTOR",
  "ASSISTANT_PROFESSOR",
  "ASSOCIATE_PROFESSOR",
  "PROFESSOR",
];

const SENIOR_RANKS: RankCategory[] = ["ASSOCIATE_PROFESSOR", "PROFESSOR"];

const PERM_TEMP: AppointmentType[] = ["PERMANENT", "TEMPORARY"];
const ALL_APPOINTMENTS: AppointmentType[] = ["PERMANENT", "TEMPORARY", "COS"];

const IMDC_STAGES = [
  {
    stageKey: "COLLEGE_IMDC_DRAFT",
    stageLabel: "Draft submitted to College-Level IMDC",
    movItems: ["Copy of instructional material", "Proof of submission to College-Level IMDC"],
  },
  {
    stageKey: "COLLEGE_IMDC_ENDORSED",
    stageLabel: "Reviewed and endorsed by College-Level IMDC",
    movItems: ["Front page", "Table of contents", "Certificate of review"],
  },
  {
    stageKey: "UNIV_IMDC_SUBMITTED",
    stageLabel: "Submitted to University-Level IMDC",
    movItems: ["Front page", "Table of contents", "Proof of submission to University-Level IMDC"],
  },
  {
    stageKey: "UNIV_IMDC_ENDORSED",
    stageLabel: "Reviewed and endorsed by University-Level IMDC to Academic Council",
    movItems: [
      "Front page",
      "Table of contents",
      "Certificate of review",
      "Letter of endorsement",
    ],
  },
  {
    stageKey: "AC_ENDORSED",
    stageLabel: "Endorsed for implementation/utilization by Academic Council",
    movItems: [
      "Front page",
      "Table of contents",
      "Academic Council resolution or certification of endorsement",
    ],
  },
];

const RESEARCH_STAGES = [
  {
    stageKey: "PROPOSAL_SUBMITTED",
    stageLabel: "Submitted and/or presented research proposal",
    movItems: ["Acknowledged submission or transmittal", "Copy of research proposal"],
  },
  {
    stageKey: "PROPOSAL_APPROVED",
    stageLabel: "Approved research proposal",
    movItems: ["Approval letter", "Copy of approved proposal"],
  },
  {
    stageKey: "IMPLEMENTED",
    stageLabel: "Research implemented within approved timeline",
    movItems: ["Notice to proceed", "Proof of implementation"],
  },
  {
    stageKey: "PERFORMANCE_REVIEWED",
    stageLabel: "Research performance reviewed/monitored within approved timeline",
    movItems: ["Monitoring proof", "Performance review documentation"],
  },
  {
    stageKey: "TERMINAL_REPORT",
    stageLabel: "Approved completed research terminal report",
    movItems: ["Terminal report receipt", "Approved terminal report"],
  },
];

const EXTENSION_STAGES = [
  {
    stageKey: "PROPOSAL_SUBMITTED",
    stageLabel: "Submitted and/or presented extension proposal",
    movItems: ["Acknowledged submission", "Copy of extension proposal"],
  },
  {
    stageKey: "PROPOSAL_APPROVED",
    stageLabel: "Approved extension proposal",
    movItems: ["Approval letter", "Copy of approved proposal"],
  },
  {
    stageKey: "IMPLEMENTED",
    stageLabel: "Extension program/project implemented within approved timeline",
    movItems: ["Notice to proceed", "Proof of implementation"],
  },
  {
    stageKey: "PERFORMANCE_REVIEWED",
    stageLabel: "Extension performance reviewed within approved timeline",
    movItems: ["Performance review proof"],
  },
  {
    stageKey: "TERMINAL_REPORT",
    stageLabel: "Approved completed extension terminal report",
    movItems: ["Received terminal report", "Approved terminal report"],
  },
];

const TIMELINESS_RULE =
  "5 = at least 3 working days before deadline; 4 = 1–2 working days early; 3 = on deadline; 2 = 1–2 working days late; 1 = at least 3 working days late. Weekends and configured holidays are excluded.";

const PROF_OUTPUT_COUNT = { PROFESSOR: 2, INSTRUCTOR: 1, ASSISTANT_PROFESSOR: 1, ASSOCIATE_PROFESSOR: 1 };

export const INDICATOR_SEEDS: IndicatorDefinition[] = [
  // ─── 9.1 MFO 1 & 2 ───────────────────────────────────────────────────────
  {
    code: "MFO1-Q01",
    name: "Teaching Effectiveness",
    description: "Rating equals the actual rating received using the teaching evaluation instrument (1.00–5.00).",
    mfoCode: "MFO1",
    dimension: "QUALITY",
    measurementType: "NUMERIC_RATING",
    scoringMode: "NON_CUMULATIVE",
    pointCap: 5,
    ruleExplanation: "Enter the official teaching evaluation rating. Must be between 1.00 and 5.00.",
    sortOrder: 1,
    allowedRankCategories: ALL_RANKS,
    allowedAppointments: ALL_APPOINTMENTS,
    applicabilityType: "MANDATORY",
    movRequirements: [{ name: "Duly signed teaching evaluation result", isRequired: true }],
  },
  {
    code: "MFO1-E01",
    name: "Instructional Materials Produced",
    description: "Highest stage per material; cumulative across outputs capped at 5.",
    mfoCode: "MFO1",
    dimension: "EFFICIENCY",
    measurementType: "STAGE_CUMULATIVE",
    scoringMode: "CUMULATIVE",
    pointCap: 5,
    ruleExplanation:
      "5=AC endorsed; 4=Univ IMDC endorsed; 3=Univ IMDC submitted; 2=College IMDC endorsed; 1=College IMDC draft. Main author 60%, co-authors share 40%.",
    sortOrder: 2,
    allowedRankCategories: ALL_RANKS,
    allowedAppointments: ALL_APPOINTMENTS,
    applicabilityType: "MANDATORY",
    allowMultipleOutputs: true,
    authorshipAllocation: { mainAuthorPct: 60, coAuthorPct: 40 },
    movRequirements: [],
    stageMovRequirements: IMDC_STAGES,
  },
  {
    code: "MFO1-T01",
    name: "Submission of Test Questions and Table of Specifications",
    description: "Timeliness of test questions and TOS submission relative to official deadline.",
    mfoCode: "MFO1",
    dimension: "TIMELINESS",
    measurementType: "WORKING_DAY_TIMELINESS",
    scoringMode: "NON_CUMULATIVE",
    pointCap: 5,
    ruleExplanation: TIMELINESS_RULE,
    sortOrder: 3,
    allowedRankCategories: ALL_RANKS,
    allowedAppointments: ALL_APPOINTMENTS,
    applicabilityType: "MANDATORY",
    movRequirements: [
      { name: "Certification from Department Chairperson indicating timeliness", isRequired: true },
    ],
  },
  {
    code: "MFO1-T02",
    name: "Submission of Syllabi",
    description: "Timeliness of syllabi submission relative to official deadline.",
    mfoCode: "MFO1",
    dimension: "TIMELINESS",
    measurementType: "WORKING_DAY_TIMELINESS",
    scoringMode: "NON_CUMULATIVE",
    pointCap: 5,
    ruleExplanation: TIMELINESS_RULE,
    sortOrder: 4,
    allowedRankCategories: ALL_RANKS,
    allowedAppointments: ALL_APPOINTMENTS,
    applicabilityType: "MANDATORY",
    movRequirements: [
      { name: "Certification from Department Chairperson indicating timeliness", isRequired: true },
    ],
  },
  {
    code: "MFO2-T01",
    name: "Submission of Course Outline",
    description: "Timeliness of course outline submission relative to official deadline.",
    mfoCode: "MFO2",
    dimension: "TIMELINESS",
    measurementType: "WORKING_DAY_TIMELINESS",
    scoringMode: "NON_CUMULATIVE",
    pointCap: 5,
    ruleExplanation: TIMELINESS_RULE,
    sortOrder: 1,
    allowedRankCategories: ALL_RANKS,
    allowedAppointments: ALL_APPOINTMENTS,
    applicabilityType: "MANDATORY",
    movRequirements: [
      { name: "Certification from Department Chairperson indicating timeliness", isRequired: true },
    ],
  },
  {
    code: "MFO2-T02",
    name: "Submission of Grading Sheet",
    description: "Timeliness of grading sheet submission relative to official deadline.",
    mfoCode: "MFO2",
    dimension: "TIMELINESS",
    measurementType: "WORKING_DAY_TIMELINESS",
    scoringMode: "NON_CUMULATIVE",
    pointCap: 5,
    ruleExplanation: TIMELINESS_RULE,
    sortOrder: 2,
    allowedRankCategories: ALL_RANKS,
    allowedAppointments: ALL_APPOINTMENTS,
    applicabilityType: "MANDATORY",
    movRequirements: [
      {
        name: "Certification from Department Chairperson indicating timeliness of grading-sheet submission",
        isRequired: true,
      },
    ],
  },
  {
    code: "MFO2-Q01",
    name: "Trainings, Seminars, and Workshops Attended",
    description: "Highest valid geographic level; non-cumulative.",
    mfoCode: "MFO2",
    dimension: "QUALITY",
    measurementType: "GEOGRAPHIC_LEVEL",
    scoringMode: "HIGHEST_ONLY",
    pointCap: 5,
    ruleExplanation:
      "5=International; 4=National; 3=Regional/Provincial/District/Municipal; 2=University-Level; 1=College-Level. Evaluator must confirm substantive professional-development content.",
    sortOrder: 3,
    allowedRankCategories: ALL_RANKS,
    allowedAppointments: ALL_APPOINTMENTS,
    applicabilityType: "MANDATORY",
    allowMultipleOutputs: true,
    movRequirements: [{ name: "Certificate of attendance or participation", isRequired: true }],
  },
  {
    code: "MFO2-Q02",
    name: "Engagement as Technical Speaker, Lecturer, Evaluator, Peer Reviewer, Judge, Trainer, Overall Activity Coordinator, or AACCUP Accreditor",
    description: "Applicable to Associate Professors and Professors only. Cumulative, capped at 5.",
    mfoCode: "MFO2",
    dimension: "QUALITY",
    measurementType: "GEOGRAPHIC_LEVEL",
    scoringMode: "CUMULATIVE",
    pointCap: 5,
    ruleExplanation:
      "5=International; 4=National; 3=Regional/Provincial/District/Municipal; 2=University-Wide; 1=College-Wide. Requires relevant expertise confirmation.",
    sortOrder: 4,
    allowedRankCategories: SENIOR_RANKS,
    allowedAppointments: PERM_TEMP,
    applicabilityType: "MANDATORY",
    allowMultipleOutputs: true,
    movRequirements: [
      { name: "Request or invitation letter", isRequired: true },
      { name: "Certification of engagement from sponsoring institution", isRequired: true },
    ],
  },
  // ─── 9.2 MFO 3 ───────────────────────────────────────────────────────────
  {
    code: "MFO3-Q01",
    name: "Research Productivity",
    description: "Stage-based research outputs with leader/member allocation and required-count averaging.",
    mfoCode: "MFO3",
    dimension: "QUALITY",
    measurementType: "STAGE_CUMULATIVE",
    scoringMode: "AVERAGE_BY_COUNT",
    pointCap: 5,
    ruleExplanation:
      "5=Terminal report; 4=Performance reviewed; 3=Implemented; 2=Proposal approved; 1=Proposal submitted. Leader 60%, members share 40%. Professors need 2 outputs.",
    sortOrder: 1,
    allowedRankCategories: ALL_RANKS,
    allowedAppointments: PERM_TEMP,
    applicabilityType: "MANDATORY",
    allowMultipleOutputs: true,
    requiredOutputCount: PROF_OUTPUT_COUNT,
    authorshipAllocation: { mainAuthorPct: 60, coAuthorPct: 40 },
    movRequirements: [],
    stageMovRequirements: RESEARCH_STAGES,
  },
  {
    code: "MFO3-Q02",
    name: "Research Presentation",
    description: "Geographic level of research presentations; non-cumulative per set with required-count averaging.",
    mfoCode: "MFO3",
    dimension: "QUALITY",
    measurementType: "GEOGRAPHIC_LEVEL",
    scoringMode: "AVERAGE_BY_COUNT",
    pointCap: 5,
    ruleExplanation:
      "5=International; 4=National; 3=Regional; 2=Agency in-house; 1=College. Professors need 2 presentations for full points.",
    sortOrder: 2,
    allowedRankCategories: ALL_RANKS,
    allowedAppointments: PERM_TEMP,
    applicabilityType: "MANDATORY",
    allowMultipleOutputs: true,
    requiredOutputCount: PROF_OUTPUT_COUNT,
    movRequirements: [
      { name: "Acceptance letter", isRequired: true },
      { name: "Certificate of presentation", isRequired: true },
    ],
  },
  {
    code: "MFO3-E01",
    name: "Research Fund Generation",
    description: "Total externally funded research amount granted to the University.",
    mfoCode: "MFO3",
    dimension: "EFFICIENCY",
    measurementType: "FUND_AMOUNT",
    scoringMode: "NON_CUMULATIVE",
    pointCap: 5,
    ruleExplanation:
      "5≥PHP 1M; 4>PHP 750K; 3>PHP 500K; 2>PHP 250K; 1>0 up to PHP 250K. Main contributor full points; co-contributor half.",
    sortOrder: 3,
    allowedRankCategories: SENIOR_RANKS,
    allowedAppointments: PERM_TEMP,
    applicabilityType: "MANDATORY",
    allowMultipleOutputs: true,
    movRequirements: [
      { name: "Approved proposal", isRequired: true },
      { name: "Duly signed MOA indicating transfer of funding to the University", isRequired: true },
      { name: "Validated LDDAP-ADA (when available)", isRequired: false },
    ],
  },
  {
    code: "MFO3-E02",
    name: "Research Publication",
    description: "Publication tier ratings with authorship allocation and required-count averaging.",
    mfoCode: "MFO3",
    dimension: "EFFICIENCY",
    measurementType: "STAGE_CUMULATIVE",
    scoringMode: "AVERAGE_BY_COUNT",
    pointCap: 5,
    ruleExplanation:
      "5=Scopus/WoS journal; 4=Scopus/WoS proceedings; 3=Intl refereed journal; 2=Intl refereed proceedings; 1=National journal. Main author 60%.",
    sortOrder: 4,
    allowedRankCategories: SENIOR_RANKS,
    allowedAppointments: PERM_TEMP,
    applicabilityType: "MANDATORY",
    allowMultipleOutputs: true,
    requiredOutputCount: PROF_OUTPUT_COUNT,
    authorshipAllocation: { mainAuthorPct: 60, coAuthorPct: 40 },
    movRequirements: [
      { name: "Copy of published article", isRequired: true },
      {
        name: "Journal/proceedings information (title, publisher, frequency, editorial board, index)",
        isRequired: true,
      },
    ],
    stageMovRequirements: [
      { stageKey: "PUB_SCOPUS_JOURNAL", stageLabel: "Scopus/WoS journal", movItems: ["Published article", "Index proof"] },
      { stageKey: "PUB_SCOPUS_PROC", stageLabel: "Scopus/WoS proceedings", movItems: ["Published article", "Index proof"] },
      { stageKey: "PUB_INTL_JOURNAL", stageLabel: "Internationally refereed journal", movItems: ["Published article"] },
      { stageKey: "PUB_INTL_PROC", stageLabel: "Internationally refereed proceedings", movItems: ["Published article"] },
      { stageKey: "PUB_NATIONAL", stageLabel: "Journal of national circulation", movItems: ["Published article"] },
    ],
  },
  {
    code: "MFO3-E03",
    name: "Knowledge Production",
    description: "Creative and IP outputs with tiered ratings; cumulative capped at 5.",
    mfoCode: "MFO3",
    dimension: "EFFICIENCY",
    measurementType: "STAGE_CUMULATIVE",
    scoringMode: "CUMULATIVE",
    pointCap: 5,
    ruleExplanation:
      "Tiered outputs from patented invention (5) to copyrighted manuscript (1). Main author/producer 60%, co-authors share 40%.",
    sortOrder: 5,
    allowedRankCategories: SENIOR_RANKS,
    allowedAppointments: PERM_TEMP,
    applicabilityType: "MANDATORY",
    allowMultipleOutputs: true,
    authorshipAllocation: { mainAuthorPct: 60, coAuthorPct: 40 },
    movRequirements: [
      { name: "Copyright certificate and recordation (when applicable)", isRequired: false },
      { name: "IP registration certificate (when applicable)", isRequired: false },
      { name: "Proof of national circulation or festival acceptance (when applicable)", isRequired: false },
    ],
    stageMovRequirements: [
      { stageKey: "KP_R5_PATENT", stageLabel: "Patented invention / research-based book / policy translation / novel / feature film", movItems: ["IP registration", "Proof of acceptance"] },
      { stageKey: "KP_R4_UTILITY", stageLabel: "Utility model / software / musical composition / choreography / script / short film", movItems: ["Registration certificate"] },
      { stageKey: "KP_R3_DESIGN", stageLabel: "Industrial design / software update / visual arts / short story (national)", movItems: ["Registration or publication proof"] },
      { stageKey: "KP_R2_MONOGRAPH", stageLabel: "Monograph / novel / poetry or essay (national circulation)", movItems: ["Copyright certificate", "Publication proof"] },
      { stageKey: "KP_R1_MANUSCRIPT", stageLabel: "Copyrighted research manuscript / literary work", movItems: ["Copyright certificate"] },
    ],
  },
  // ─── 9.3 MFO 4 ───────────────────────────────────────────────────────────
  {
    code: "MFO4-E01",
    name: "Provision of Extension and Community Services",
    description: "Stage-based extension programs; cumulative capped at 5.",
    mfoCode: "MFO4",
    dimension: "EFFICIENCY",
    measurementType: "STAGE_CUMULATIVE",
    scoringMode: "CUMULATIVE",
    pointCap: 5,
    ruleExplanation:
      "5=Terminal report; 4=Performance reviewed; 3=Implemented; 2=Proposal approved; 1=Proposal submitted. Leader 60%, members share 40%.",
    sortOrder: 1,
    allowedRankCategories: ALL_RANKS,
    allowedAppointments: PERM_TEMP,
    applicabilityType: "MANDATORY",
    allowMultipleOutputs: true,
    authorshipAllocation: { mainAuthorPct: 60, coAuthorPct: 40 },
    movRequirements: [],
    stageMovRequirements: EXTENSION_STAGES,
  },
  {
    code: "MFO4-E02",
    name: "Number of Persons Trained Weighted by Length of Training",
    description: "Compare actual accomplishment with faculty target from college target.",
    mfoCode: "MFO4",
    dimension: "EFFICIENCY",
    measurementType: "PERCENTAGE_TARGET",
    scoringMode: "NON_CUMULATIVE",
    pointCap: 5,
    ruleExplanation:
      "5=>115%; 4=>100% and ≤115%; 3=100%; 2=>85% and <100%; 1=≤85% and >0; 0=zero.",
    sortOrder: 2,
    allowedRankCategories: ALL_RANKS,
    allowedAppointments: PERM_TEMP,
    applicabilityType: "MANDATORY",
    requiresCollegeTarget: true,
    movRequirements: [
      { name: "Certification from College Extension Coordinator", isRequired: true },
    ],
  },
  {
    code: "MFO4-E03",
    name: "Percentage of Trainees Who Rated the Training as Good or Better",
    description: "Percentage of trainees rating training as good or better.",
    mfoCode: "MFO4",
    dimension: "EFFICIENCY",
    measurementType: "PERCENTAGE_NUM_DEN",
    scoringMode: "NON_CUMULATIVE",
    pointCap: 5,
    ruleExplanation: "5=100%; 4=>90%; 3=>80%; 2=>70%; 1=≤70% and >0; 0=no valid result.",
    sortOrder: 3,
    allowedRankCategories: ALL_RANKS,
    allowedAppointments: PERM_TEMP,
    applicabilityType: "MANDATORY",
    movRequirements: [
      { name: "Certification from College Extension Coordinator", isRequired: true },
    ],
  },
  {
    code: "MFO4-E04",
    name: "Percentage of Requests Provided with Technical Advice",
    description: "Percentage of technical advice requests responded to.",
    mfoCode: "MFO4",
    dimension: "EFFICIENCY",
    measurementType: "PERCENTAGE_NUM_DEN",
    scoringMode: "NON_CUMULATIVE",
    pointCap: 5,
    ruleExplanation: "5=100%; 4=>90%; 3=>80%; 2=>70%; 1=≤70% and >0; 0=no valid response.",
    sortOrder: 4,
    allowedRankCategories: ALL_RANKS,
    allowedAppointments: PERM_TEMP,
    applicabilityType: "MANDATORY",
    movRequirements: [
      { name: "Request letter", isRequired: true },
      { name: "Faculty response letter", isRequired: true },
      {
        name: "Tabulated report of requests, responses, and technical advice signed by College Extension Coordinator",
        isRequired: true,
      },
    ],
  },
];
