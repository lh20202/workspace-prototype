export const governanceRecords = [
  {
    id: "GOV-2026-04",
    name: "Approved planning timetable resolution",
    body: "Oversight Committee",
    audience: "committee",
    state: "Approved formal record",
    date: "2026-10-14",
  },
  {
    id: "GOV-2026-05",
    name: "21 October committee meeting paper index",
    body: "Oversight Committee",
    audience: "committee",
    state: "Controlled meeting material",
    date: "2026-10-21",
  },
  {
    id: "GOV-M-2026-02",
    name: "Members Assembly — Approved Agenda",
    body: "Members Assembly",
    audience: "members",
    state: "Approved meeting record",
    date: "2026-11-12",
  },
].map((record) => ({ ...record, sensitivity: "Confidential" as const }));
export function governanceVisible(role: string) {
  return governanceRecords.filter((r) => r.audience === role);
}
