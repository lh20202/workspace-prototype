/** Access boundaries only. Individual records are never included in fixtures. */
export const employmentProtectedSubjects: [string, string, string, boolean][] =
  [
    [
      "payroll-inputs",
      "Individual Payroll & Benefits Inputs",
      "protected",
      true,
    ],
    [
      "absence-administration",
      "Individual Absence Administration",
      "protected",
      true,
    ],
    ["employee-master-data", "Employee Master Data", "protected", true],
    ["candidate-applications", "Candidate Applications", "hiring", true],
    ["candidate-assessments", "Candidate Assessments", "hiring", true],
    ["references", "Candidate References", "hiring", true],
    ["offers", "Offer Decisions", "hiring", true],
    ["placement", "Health / Placement Circumstances", "hiring", true],
    ["employee-records", "Employee Records & Contracts", "protected", true],
    ["employment-changes", "Employment Changes", "protected", true],
    ["compensation", "Individual Compensation", "protected", true],
  ];

export const employmentProtectedIds = new Set(
  employmentProtectedSubjects.map(([id]) => id),
);

/** Old record URLs must land at an existing denied boundary, never a guessed ID. */
export function legacyEmploymentBoundary(path: string, recruitment: boolean) {
  const requested = path.split("/")[3];
  const id = employmentProtectedIds.has(requested)
    ? requested
    : recruitment
      ? "candidate-assessments"
      : "employment-changes";
  return `/employment-admin/protected/${id}`;
}
