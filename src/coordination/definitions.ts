/** Canonical Department and unit identities without policy or view imports. */
export const departmentDefinitions: [
  string,
  string,
  "Organisation-wide" | "Department-only",
  string,
  string,
  string,
  string[],
][] = [
  [
    "marketing-growth",
    "MCG Department",
    "Organisation-wide",
    "Priya Shah",
    "Marketing Department Assistant",
    "#e5eafa",
    [
      "Acquisition & Direct Engagement",
      "Customer Care",
      "Strategic Accounts",
      "Partnerships & Business Development",
      "Income Administration",
      "Marketing Insight & Performance",
      "Marketing Operations",
    ],
  ],
  [
    "communications",
    "CPA Department",
    "Organisation-wide",
    "Morgan Lee",
    "Communications Department Assistant",
    "#e1eee8",
    [
      "Editorial & Content",
      "Media Relations",
      "Public Affairs",
      "Brand & Creative",
      "Digital Channels",
    ],
  ],
  [
    "finance-services",
    "FCS Department",
    "Department-only",
    "Hannah Weber",
    "Finance Department Assistant",
    "#eee5f2",
    [
      "Accounting & Control",
      "Planning & Analysis",
      "Treasury & Payments",
      "Procurement & Supplier Services",
      "Legal & Assurance",
      "Workplace & Travel",
    ],
  ],
  [
    "strategy-technology",
    "STT Department",
    "Organisation-wide",
    "Theo Walker",
    "Strategy & Technology Department Assistant",
    "#e2edf2",
    [
      "Strategy & Performance",
      "Digital Strategy & Architecture",
      "IT Services",
      "Data & Analytics",
      "Information & Knowledge Management",
      "Project & Change Office",
    ],
  ],
  [
    "people-culture",
    "PAC Department",
    "Department-only",
    "Clara Jensen",
    "PAC Department Assistant",
    "#f4e8dd",
    [
      "People Operations",
      "Talent & Hiring",
      "Learning & Capability",
      "Organisation & Culture",
      "Reward & Employment",
      "People Systems & Analytics",
    ],
  ],
  [
    "executive-office",
    "EAO Department",
    "Department-only",
    "Jamie Reed",
    "Executive Office Coordinator",
    "#e8e8e8",
    ["CEO Office", "Governance Coordination", "Strategic Initiatives Support"],
  ],
];
export const unitId = (name: string) =>
  name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
export const unitOnly = new Set([
  "Strategic Accounts",
  "Income Administration",
  "Public Affairs",
  "Treasury & Payments",
  "People Operations",
  "Reward & Employment",
  "CEO Office",
  "Legal & Assurance",
  "People Systems & Analytics",
]);
