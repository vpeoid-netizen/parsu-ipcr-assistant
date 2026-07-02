export const RULESET_VERSION = "FY 2026 Teaching Personnel v1.0";

/** Official ParSU colleges — https://parsu.edu.ph/academics/colleges */
export const COLLEGES = [
  { code: "CAH", name: "College of Arts and Humanities", campus: "Goa" },
  { code: "CBM", name: "College of Business and Management", campus: "Goa" },
  { code: "CED", name: "College of Education", campus: "Goa" },
  { code: "CEC", name: "College of Engineering and Computational Science", campus: "Goa" },
  { code: "COS", name: "College of Science", campus: "Goa" },
  { code: "CSCE", name: "College of Sustainable Communities and Ecosystems", campus: "Caramoan" },
  { code: "CPSCH", name: "College of Public Safety and Community Health", campus: "Lagonoy" },
  { code: "CFMS", name: "College of Fisheries and Marine Science", campus: "Sagñay" },
  { code: "CACD", name: "College of Agribusiness and Community Development", campus: "Salogon" },
  { code: "CHTM", name: "College of Hospitality and Tourism Management", campus: "San Jose" },
  { code: "CESD", name: "College of Environmental Science and Design", campus: "Tinambac" },
] as const;

export const ACADEMIC_RANKS = [
  { title: "Instructor I", category: "INSTRUCTOR" as const },
  { title: "Instructor II", category: "INSTRUCTOR" as const },
  { title: "Instructor III", category: "INSTRUCTOR" as const },
  { title: "Assistant Professor I", category: "ASSISTANT_PROFESSOR" as const },
  { title: "Assistant Professor II", category: "ASSISTANT_PROFESSOR" as const },
  { title: "Assistant Professor III", category: "ASSISTANT_PROFESSOR" as const },
  { title: "Assistant Professor IV", category: "ASSISTANT_PROFESSOR" as const },
  { title: "Associate Professor I", category: "ASSOCIATE_PROFESSOR" as const },
  { title: "Associate Professor II", category: "ASSOCIATE_PROFESSOR" as const },
  { title: "Associate Professor III", category: "ASSOCIATE_PROFESSOR" as const },
  { title: "Associate Professor IV", category: "ASSOCIATE_PROFESSOR" as const },
  { title: "Associate Professor V", category: "ASSOCIATE_PROFESSOR" as const },
  { title: "Professor I", category: "PROFESSOR" as const },
  { title: "Professor II", category: "PROFESSOR" as const },
  { title: "Professor III", category: "PROFESSOR" as const },
  { title: "Professor IV", category: "PROFESSOR" as const },
  { title: "Professor V", category: "PROFESSOR" as const },
  { title: "Professor VI", category: "PROFESSOR" as const },
];

/** Standard full teaching load (units) for designation deloading weights. */
export const TOTAL_TEACHING_LOAD_UNITS = 18;

/** Allowed deloaded units per designation weighting table. */
export const DELOADED_UNIT_OPTIONS = [3, 6, 9, 12, 15] as const;

export const PH_HOLIDAYS_2026 = [
  { date: "2026-01-01", name: "New Year's Day" },
  { date: "2026-02-17", name: "Chinese New Year" },
  { date: "2026-02-25", name: "EDSA People Power Revolution Anniversary" },
  { date: "2026-04-02", name: "Maundy Thursday" },
  { date: "2026-04-03", name: "Good Friday" },
  { date: "2026-04-09", name: "Araw ng Kagitingan" },
  { date: "2026-05-01", name: "Labor Day" },
  { date: "2026-06-12", name: "Independence Day" },
  { date: "2026-08-31", name: "National Heroes Day" },
  { date: "2026-11-01", name: "All Saints' Day" },
  { date: "2026-11-30", name: "Bonifacio Day" },
  { date: "2026-12-25", name: "Christmas Day" },
  { date: "2026-12-30", name: "Rizal Day" },
  { date: "2026-12-31", name: "Last Day of the Year" },
];

export const RATING_PERIODS = ["January–June", "July–December"];

export const GEOGRAPHIC_LEVELS_TRAINING = [
  { value: "INTERNATIONAL", label: "International (5)" },
  { value: "NATIONAL", label: "National (4)" },
  { value: "REGIONAL", label: "Regional / Provincial / District / Municipal (3)" },
  { value: "UNIVERSITY", label: "University-Level (2)" },
  { value: "COLLEGE", label: "College-Level (1)" },
];

export const GEOGRAPHIC_LEVELS_ENGAGEMENT = [
  { value: "INTERNATIONAL", label: "International (5)" },
  { value: "NATIONAL", label: "National (4)" },
  { value: "REGIONAL", label: "Regional / Provincial / District / Municipal (3)" },
  { value: "UNIVERSITY_WIDE", label: "University-Wide (2)" },
  { value: "COLLEGE_WIDE", label: "College-Wide (1)" },
];

export const GEOGRAPHIC_LEVELS_PRESENTATION = [
  { value: "INTERNATIONAL", label: "International (5)" },
  { value: "NATIONAL", label: "National (4)" },
  { value: "REGIONAL", label: "Regional (3)" },
  { value: "AGENCY_INHOUSE", label: "Agency in-house review (2)" },
  { value: "COLLEGE", label: "College (1)" },
];
