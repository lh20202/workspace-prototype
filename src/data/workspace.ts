import { divisions as organisationDivisions } from "../coordination/data";
export type Role =
  "Workspace Member" | "Planning Coordinator" | "Executive Reviewer";
export type LibraryId =
  "planning" | "strategy" | "reporting" | "approved" | "restricted";
export type View =
  | "Current Planning Cycle"
  | "In Review"
  | "Approved"
  | "All Documents"
  | "By Division";
export interface Document {
  id: string;
  library: LibraryId;
  name: string;
  cycle: string;
  folderPath: string;
  type: string;
  area: string;
  status: string;
  owner: string;
  sensitivity: string;
  recordState: string;
  modified: string;
  modifiedBy: string;
  approvedDate?: string;
  recordCategory?: string;
}
export const roles: Role[] = [
  "Workspace Member",
  "Planning Coordinator",
  "Executive Reviewer",
];
export const currentCycle = "2027 Annual Planning";
export const libraries: {
  id: LibraryId;
  name: string;
  description: string;
  folders: string[];
}[] = [
  {
    id: "planning",
    name: "Planning Cycles",
    description:
      "Active annual planning and review. Contribute, coordinate and develop the next organisational plan.",
    folders: [currentCycle, "2026 Mid-Year Review", "2026 Year-End Review"],
  },
  {
    id: "strategy",
    name: "Strategy Development",
    description: "Develop and review our longer-term organisational direction.",
    folders: ["Current strategy · 2025–2030", "Archive"],
  },
  {
    id: "reporting",
    name: "Performance & Reporting",
    description:
      "Bring together progress inputs, review performance and prepare consolidated reporting.",
    folders: ["2026 Mid-Year Review", "2026 Year-End Review", currentCycle],
  },
  {
    id: "approved",
    name: "Approved Plans & Reports",
    description:
      "Authoritative approved outputs. Read the agreed plans, strategy and reporting baselines.",
    folders: [],
  },
  {
    id: "restricted",
    name: "Restricted Planning",
    description:
      "Sensitive planning scenarios for a specifically authorised review group.",
    folders: [],
  },
];
type Seed = [string, string, string, string?];
const seeds: Record<LibraryId, Seed[]> = {
  planning: [
    [
      "Planning guidance 2027.docx",
      "Guidance",
      "Organisation-wide",
      "Approved",
    ],
    [
      "Operations submission 2027.xlsx",
      "Submission",
      "Operations",
      "Ready for review",
    ],
    [
      "Human Resources submission 2027.docx",
      "Submission",
      "Human Resources",
      "In progress",
    ],
    [
      "Digital & Technology submission 2027.pptx",
      "Submission",
      "Digital & Technology",
      "In review",
    ],
    ["Marketing submission 2027.docx", "Submission", "Marketing", "Draft"],
    [
      "Financial assumptions 2027.xlsx",
      "Supporting data",
      "Finance",
      "In review",
    ],
    [
      "Consolidated organisational plan draft v3.docx",
      "Working draft",
      "Organisation-wide",
      "In review",
    ],
    [
      "Planning decision log.xlsx",
      "Decision log",
      "Organisation-wide",
      "In progress",
    ],
    [
      "Cross-area dependency review.xlsx",
      "Review",
      "Organisation-wide",
      "Ready for review",
    ],
    [
      "Mid-year planning review 2026.docx",
      "Review",
      "Organisation-wide",
      "Approved",
    ],
    [
      "Year-end planning lessons 2026.docx",
      "Analysis",
      "Organisation-wide",
      "Draft",
    ],
    [
      "Organisation-wide Logframe 2027.xlsx",
      "Plan",
      "Organisation-wide",
      "In review",
    ],
    [
      "Budget and staffing submission 2027.xlsx",
      "Submission",
      "Finance",
      "In progress",
    ],
    [
      "Manufacturing submission 2027.xlsx",
      "Submission",
      "Manufacturing",
      "Draft",
    ],
  ],
  strategy: [
    [
      "Organisational strategy working framework 2025–2030.docx",
      "Working draft",
      "Organisation-wide",
      "In review",
    ],
    [
      "Annual strategy priorities 2027.docx",
      "Plan",
      "Organisation-wide",
      "Draft",
    ],
    [
      "Multi-year strategy delivery plan 2025–2030.xlsx",
      "Plan",
      "Organisation-wide",
      "In progress",
    ],
    ["Operations roadmap 2025–2030.xlsx", "Plan", "Operations", "In review"],
    [
      "Digital & Technology roadmap 2025–2030.pptx",
      "Presentation",
      "Digital & Technology",
      "Draft",
    ],
    [
      "Organisational strategy 2020–2024.pdf",
      "Plan",
      "Organisation-wide",
      "Superseded",
    ],
    [
      "Organisational strategy 2015–2019.pdf",
      "Plan",
      "Organisation-wide",
      "Superseded",
    ],
  ],
  reporting: [
    [
      "Performance reporting guidance.docx",
      "Guidance",
      "Organisation-wide",
      "Approved",
    ],
    ["Operations progress input.xlsx", "Submission", "Operations"],
    ["Human Resources progress input.docx", "Submission", "Human Resources"],
    [
      "Digital & Technology progress input.xlsx",
      "Submission",
      "Digital & Technology",
    ],
    [
      "Risk and dependency review.xlsx",
      "Review",
      "Organisation-wide",
      "In review",
    ],
    [
      "Organisational progress narrative draft.docx",
      "Working draft",
      "Organisation-wide",
      "In review",
    ],
    [
      "Cross-area performance summary.pptx",
      "Presentation",
      "Organisation-wide",
    ],
    ["Reporting decision log.xlsx", "Decision log", "Organisation-wide"],
    [
      "Performance reporting template 2027.xlsx",
      "Guidance",
      "Organisation-wide",
      "Approved",
    ],
  ],
  approved: [
    ["Organisational Plan 2026.pdf", "Plan", "Organisation-wide", "Approved"],
    [
      "Mid-Year Performance Report 2026.pdf",
      "Performance report",
      "Organisation-wide",
      "Approved",
    ],
    [
      "Organisational Strategy 2025–2030.pdf",
      "Plan",
      "Organisation-wide",
      "Approved",
    ],
    [
      "Year-End Performance Report 2025.pdf",
      "Performance report",
      "Organisation-wide",
      "Approved",
    ],
    ["Strategic Priorities 2026.pdf", "Plan", "Organisation-wide", "Approved"],
  ],
  restricted: [
    ["Operating model scenario A.docx", "Analysis", "Organisation-wide"],
    ["Workforce scenario options.xlsx", "Analysis", "Human Resources"],
    ["Financial sensitivity assumptions.xlsx", "Supporting data", "Finance"],
    [
      "Organisational change impact assessment.docx",
      "Review",
      "Organisation-wide",
      "In review",
    ],
    [
      "Executive planning assumptions.docx",
      "Working draft",
      "Organisation-wide",
      "In review",
    ],
  ],
};
const owners = [
  "Alex Morgan",
  "Jamie Ellis",
  "Taylor Reed",
  "Casey Blake",
  "Robin Avery",
];
const allDocuments: Document[] = Object.entries(seeds).flatMap(([lib, rows]) =>
  rows.map(([name, type, area, status], i) => {
    const library = lib as LibraryId;
    const cycle =
      library === "planning"
        ? i === 9
          ? "2026 Mid-Year Review"
          : i === 10
            ? "2026 Year-End Review"
            : currentCycle
        : library === "strategy"
          ? i === 5
            ? "2020–2024 Strategy"
            : i === 6
              ? "2015–2019 Strategy"
              : "2025–2030 Strategy"
          : library === "reporting"
            ? name === "Performance reporting template 2027.xlsx"
              ? currentCycle
              : i < 4
                ? "2026 Mid-Year Review"
                : "2026 Year-End Review"
            : library === "approved"
              ? i === 1
                ? "2026 Mid-Year Review"
                : i === 3
                  ? "2025 Year-End Review"
                  : i === 2
                    ? "2025–2030 Strategy"
                    : "2026 Annual Planning"
              : currentCycle;
    return {
      id: `${library}-${i}`,
      library,
      name: name
        .replace(/^Operations /, "Executive Office ")
        .replace(/^Manufacturing /, "Communications & Public Affairs ")
        .replace(/^Human Resources /, "People & Culture ")
        .replace(
          /^Digital & Technology /,
          "Strategy, Technology & Transformation ",
        )
        .replace(/^Marketing /, "Marketing & Customer Growth "),
      folderPath: "",
      type,
      area:
        (
          {
            Marketing: organisationDivisions[0].fullName,
            Manufacturing: organisationDivisions[1].fullName,
            Finance: organisationDivisions[2].fullName,
            "Digital & Technology": organisationDivisions[3].fullName,
            "Human Resources": organisationDivisions[4].fullName,
            Operations: organisationDivisions[5].fullName,
          } as Record<string, string>
        )[area] || area,
      status: status ?? "In progress",
      cycle,
      owner: owners[i % owners.length],
      modifiedBy: owners[(i + 1) % owners.length],
      modified: `2026-10-${String(14 - (i % 9)).padStart(2, "0")}`,
      sensitivity: library === "restricted" ? "Restricted" : "Internal",
      recordState:
        library === "approved"
          ? "Final record"
          : type === "Guidance"
            ? "Working reference"
            : "Working information",
      ...(library === "approved"
        ? {
            approvedDate: i === 1 ? "2026-07-30" : "2026-01-28",
            recordCategory: "Organisational planning record",
          }
        : {}),
    };
  }),
);
export const milestones = [
  ["Guidance issued", "6 Oct 2026"],
  ["Business-area inputs due", "30 Oct 2026"],
  ["Consolidation", "2–13 Nov 2026"],
  ["Leadership review", "18 Nov 2026"],
  ["Final approval", "30 Nov 2026"],
];

export const currentUser: { name: string; role: Role } = {
  name: "Maya Chen",
  role: "Workspace Member",
};
export const divisions = organisationDivisions.map((d) => d.fullName);
export const quickLinks = [
  { label: "Logframe", name: "Organisation-wide Logframe 2027.xlsx" },
  {
    label: "Budget & staffing submission",
    name: "Budget and staffing submission 2027.xlsx",
  },
  { label: "Planning guidance", name: "Planning guidance 2027.docx" },
  {
    label: "Reporting template",
    name: "Performance reporting template 2027.xlsx",
  },
  { label: "Decision log", name: "Planning decision log.xlsx" },
];

const strategyPaths = [
  "Current strategy · 2025–2030/Organisational strategy",
  "Current strategy · 2025–2030/Annual strategy",
  "Current strategy · 2025–2030/Multi-year strategy",
  "Current strategy · 2025–2030/Division roadmaps",
  "Current strategy · 2025–2030/Division roadmaps",
  "Archive/2020–2024",
  "Archive/2015–2019",
];
const omitted = new Set([
  "planning-5",
  "planning-8",
  "reporting-1",
  "reporting-2",
  "reporting-3",
  "reporting-6",
  "reporting-7",
  "approved-3",
  "approved-4",
  "restricted-1",
  "restricted-2",
  "restricted-4",
]);
export const documents: Document[] = allDocuments
  .filter((d) => !omitted.has(d.id))
  .map((d) => {
    let folderPath = d.cycle;
    if (d.library === "planning")
      folderPath =
        d.cycle !== currentCycle
          ? d.cycle
          : d.type === "Submission"
            ? `${currentCycle}/Division submissions/${d.area}`
            : ["Guidance", "Decision log"].includes(d.type)
              ? `${currentCycle}/Guidance & decisions`
              : `${currentCycle}/Organisational plan`;
    if (d.library === "strategy")
      folderPath = strategyPaths[Number(d.id.split("-")[1])];
    if (d.library === "reporting")
      folderPath =
        d.type === "Guidance"
          ? `${d.cycle}/Guidance & templates`
          : `${d.cycle}/Review & reporting`;
    if (d.library === "approved" || d.library === "restricted") folderPath = "";
    return {
      ...d,
      folderPath,
      recordState:
        d.library === "strategy" && d.status === "Superseded"
          ? "Working reference"
          : d.recordState,
    };
  });
export const accessContact = "Jordan Ellis";
