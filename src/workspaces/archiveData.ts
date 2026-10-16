export interface ArchiveRecord {
  id: string;
  name: string;
  collection: string;
  series: string;
  year: string;
  creator: string;
  area: string;
  description: string;
  format: string;
  access: string;
  preservation: string;
  region?: string;
}
export const archiveRecords: ArchiveRecord[] = [
  {
    id: "ARC-PRJ-2024-018",
    name: "PRJ-2024-018 · Digital Workplace Programme — Final Closure Report",
    collection: "Project Memory",
    series: "Closed projects",
    year: "2026",
    creator: "Project Control",
    area: "Strategy & Transformation",
    description:
      "Selected approved final closure report transferred after appraisal. Project working drafts remain in the closed project workspace.",
    format: "PDF",
    access: "Open internally",
    preservation: "Preservation copy verified",
  },
  {
    id: "ARC-001",
    name: "Annual Report 1998",
    collection: "Company History",
    series: "Annual reports",
    year: "1998",
    creator: "Corporate Reporting",
    area: "Organisation-wide",
    description:
      "Approved final annual report preserved as institutional memory.",
    format: "PDF",
    access: "Open internally",
    preservation: "Preservation copy verified",
  },
  {
    id: "ARC-002",
    name: "Company Milestones 2005",
    collection: "Company History",
    series: "Corporate history",
    year: "2005",
    creator: "Executive Office",
    area: "Executive Office",
    description: "Published chronology and approved historical photographs.",
    format: "PDF",
    access: "Open internally",
    preservation: "Described",
  },
  {
    id: "ARC-003",
    name: "Campaign Posters 2010",
    collection: "Campaign Heritage",
    series: "Published campaigns",
    year: "2010",
    creator: "Marketing & Customer Growth",
    area: "Marketing",
    description: "Final published posters and collection-level context.",
    format: "Image",
    access: "Open internally",
    preservation: "Format review due",
  },
  {
    id: "ARC-004",
    name: "Completed Programme Review 2018",
    collection: "Project Memory",
    series: "Closed projects",
    year: "2018",
    creator: "Project & Change Office",
    area: "Strategy & Transformation",
    description: "Approved closure review selected for long-term preservation.",
    format: "PDF",
    access: "Open internally",
    preservation: "Preserved",
  },
  {
    id: "ARC-MX-01",
    name: "Mexico City — Published Annual Review",
    collection: "Mexico City Archive",
    series: "Branch annual reviews",
    year: "2012",
    creator: "Mexico City Office",
    area: "Organisation-wide",
    description: "Final published branch review with catalogue description.",
    format: "PDF",
    access: "Open internally",
    preservation: "Preservation copy verified",
    region: "mexico-city",
  },
  {
    id: "ARC-JP-01",
    name: "Tokyo — Historical Event Programme",
    collection: "Tokyo Archive",
    series: "Published events",
    year: "2014",
    creator: "Tokyo Office",
    area: "Communications",
    description: "Published programme selected for historical context.",
    format: "PDF",
    access: "Open internally",
    preservation: "Described",
    region: "tokyo",
  },
  {
    id: "ARC-US-01",
    name: "Washington — Approved Public Briefing",
    collection: "Washington Archive",
    series: "Published briefings",
    year: "2016",
    creator: "Washington Office",
    area: "Communications",
    description: "Final public briefing and creator context.",
    format: "PDF",
    access: "Open internally",
    preservation: "Preserved",
    region: "washington",
  },
  {
    id: "ARC-ZA-01",
    name: "Cape Town — Historical Exhibition Guide",
    collection: "Cape Town Archive",
    series: "Cultural collections",
    year: "2019",
    creator: "Cape Town Office",
    area: "Organisation-wide",
    description:
      "Approved historical exhibition guide and descriptive metadata.",
    format: "PDF",
    access: "Open internally",
    preservation: "Described",
    region: "cape-town",
  },
];
export const regions = [
  { id: "mexico-city", name: "Mexico City Archive" },
  { id: "tokyo", name: "Tokyo Archive" },
  { id: "washington", name: "Washington Archive" },
  { id: "cape-town", name: "Cape Town Archive" },
];
export const retentionSchedule = [
  {
    series: "Approved annual reports",
    activity: "Formal reporting",
    trigger: "Publication",
    period: "Permanent after appraisal",
    action: "Transfer to archive",
    review: "Required",
    owner: "Records specialist",
    status: "Approved",
    basis: "Fictional institutional-memory schedule",
  },
  {
    series: "Closed project working papers",
    activity: "Project delivery",
    trigger: "Closure",
    period: "Review after 6 years",
    action: "Appraise / dispose if authorised",
    review: "Required",
    owner: "Records specialist",
    status: "Under review",
    basis: "Fictional accountability schedule",
  },
  {
    series: "Published campaign material",
    activity: "Public communications",
    trigger: "Campaign closes",
    period: "Select final material for preservation",
    action: "Appraise",
    review: "Required",
    owner: "Archivist",
    status: "Draft",
    basis: "Fictional historical-value criteria",
  },
  {
    series: "Legacy administrative duplicates",
    activity: "Administration",
    trigger: "Superseded",
    period: "Owner and records review",
    action: "Authorised disposition",
    review: "Required",
    owner: "Records specialist",
    status: "Superseded",
    basis: "Fictional duplicate-control schedule",
  },
];
export const transferStages = [
  "Proposed",
  "Appraisal",
  "Owner Review",
  "Transfer Approved",
  "Description",
  "Preservation",
  "Available",
  "Disposed",
];
export function searchArchive(query: string, filters: Record<string, string>) {
  return archiveRecords.filter(
    (r) =>
      `${r.name} ${r.description} ${r.creator} ${r.id}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      Object.entries(filters).every(
        ([k, v]) => !v || r[k as keyof ArchiveRecord] === v,
      ),
  );
}
export const legacyFolders = [
  "Company",
  "Marketing",
  "Finance",
  "People",
  "Executive",
  "Projects",
  "Historical",
  "Shared",
];
