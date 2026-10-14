export type Role =
  "Workspace Member" | "Planning Coordinator" | "Executive Reviewer";
export type LibraryId =
  "planning" | "strategy" | "reporting" | "approved" | "restricted";
export type View =
  | "Current Planning Cycle"
  | "In Review"
  | "Approved"
  | "All Documents"
  | "By Planning Area";
export interface Document {
  id: string;
  library: LibraryId;
  name: string;
  cycle: string;
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
    folders: ["2027–2030 Strategy Refresh", "Strategic Priorities Review"],
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
    ["External environment scan.docx", "Analysis", "Organisation-wide"],
    [
      "Strategic priorities workshop notes.docx",
      "Supporting data",
      "Organisation-wide",
    ],
    [
      "Strategy options v2.pptx",
      "Presentation",
      "Organisation-wide",
      "In review",
    ],
    [
      "Strategic framework draft.docx",
      "Working draft",
      "Organisation-wide",
      "In review",
    ],
    ["Capability assumptions.xlsx", "Supporting data", "Human Resources"],
    ["Strategy decision log.xlsx", "Decision log", "Organisation-wide"],
    ["Consultation synthesis.docx", "Analysis", "Marketing"],
    [
      "Strategic priorities review.docx",
      "Review",
      "Organisation-wide",
      "Ready for review",
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
      "Organisational Strategy 2024–2027.pdf",
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
export const documents: Document[] = Object.entries(seeds).flatMap(
  ([lib, rows]) =>
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
            ? i === 7
              ? "Strategic Priorities Review"
              : "2027–2030 Strategy Refresh"
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
                      ? "2024–2027 Strategy"
                      : "2026 Annual Planning"
                : currentCycle;
      return {
        id: `${library}-${i}`,
        library,
        name,
        type,
        area,
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
export const departments = [
  "Marketing",
  "Manufacturing",
  "Finance",
  "Human Resources",
  "Digital & Technology",
  "Operations",
];
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
