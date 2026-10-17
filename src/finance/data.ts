import type { OperationalFile } from "../logistics/data";
export const title = "Income & Financial Operations";
export const description =
  "Shared workspace for administering incoming revenue, reconciling transactions, processing financial obligations, maintaining accounts, planning finances and managing cash.";
export const areas = [
  { id: "income", name: "Income Administration" },
  { id: "reconciliation", name: "Reconciliation & Close" },
  { id: "payments", name: "Payments & Settlement" },
  { id: "planning", name: "Planning & Analysis" },
  { id: "accounting", name: "Accounting & Reporting" },
  { id: "treasury", name: "Treasury & Banking" },
  { id: "calendar", name: "Financial Calendar" },
];
export const systems = [
  {
    id: "salesforce",
    name: "Salesforce Sales Cloud",
    purpose: "Customer/account and incoming-payment relationship context",
    ref: "SF-1842",
  },
  {
    id: "stripe",
    name: "Stripe",
    purpose: "Payment transactions, refunds and provider settlements",
    ref: "PAY-8437",
  },
  {
    id: "netsuite",
    name: "Oracle NetSuite",
    purpose:
      "Authoritative accounting transactions, general ledger and payables",
    ref: "NS-22041",
  },
  {
    id: "blackline",
    name: "BlackLine",
    purpose: "Reconciliation and close workflow",
    ref: "BL-1028",
  },
  {
    id: "adaptive",
    name: "Workday Adaptive Planning",
    purpose: "Authoritative budget, forecast and scenario models",
    ref: "AP-271",
  },
  {
    id: "tableau",
    name: "Tableau",
    purpose: "Detailed analysis and management reporting",
    ref: "TB-394",
  },
  {
    id: "kyriba",
    name: "Kyriba",
    purpose: "Liquidity, cash, banking and treasury transactions",
    ref: "KY-881",
  },
];
export interface FinancialItem {
  id: string;
  name: string;
  area: string;
  owner: string;
  status: string;
  stage: string;
  due: string;
  handoff: string;
  system: string;
  reference: string;
  source: string;
  method: string;
  issue: string;
  target: string;
  openItems: number;
  reviewer: string;
  scenario: string;
  contributors: string;
  baseline: string;
  period: string;
  sensitivity: "Internal";
  recordState: string;
}
const seed: [string, string, string, string, string, string, string, string][] =
  [
    [
      "INC-01",
      "Unmatched card payment",
      "income",
      "Maya Chen",
      "Awaiting classification",
      "stripe",
      "Individual customer payments",
      "Validate missing reference → reconciliation",
    ],
    [
      "INC-02",
      "Duplicate recurring payment",
      "income",
      "Sam Patel",
      "Needs action",
      "stripe",
      "Subscription / recurring payments",
      "Validate duplicate → refund approval",
    ],
    [
      "INC-03",
      "Refund requiring review",
      "income",
      "Sam Patel",
      "Approval required",
      "stripe",
      "Business account payments",
      "Payments → processor execution → reconciliation",
    ],
    [
      "INC-04",
      "Incorrect income allocation",
      "income",
      "Maya Chen",
      "In progress",
      "netsuite",
      "Institutional funding",
      "Correct classification → accounting",
    ],
    [
      "INC-05",
      "Missing customer reference",
      "income",
      "Maya Chen",
      "Needs action",
      "salesforce",
      "Partner income",
      "Validate context → match payment",
    ],
    [
      "INC-06",
      "Returned bank payment",
      "income",
      "Sam Patel",
      "In review",
      "netsuite",
      "Other operating income",
      "Confirm return → income follow-up",
    ],
    [
      "INC-07",
      "Receipt correction",
      "income",
      "Maya Chen",
      "Prepared",
      "salesforce",
      "Individual customer payments",
      "Review confirmation → income handover",
    ],
    [
      "INC-08",
      "Payment-provider settlement mismatch",
      "income",
      "Sam Patel",
      "Exception resolution",
      "blackline",
      "Business account payments",
      "Provider review → reconciliation",
    ],
    [
      "REC-01",
      "Card processor → ERP",
      "reconciliation",
      "Sam Patel",
      "In progress",
      "blackline",
      "Stripe",
      "Income → classify and match → accounting",
    ],
    [
      "REC-02",
      "CRM receipts → ERP",
      "reconciliation",
      "Sam Patel",
      "Reconciling",
      "blackline",
      "Salesforce",
      "Income → accounting",
    ],
    [
      "REC-03",
      "Bank → general ledger",
      "reconciliation",
      "Robin Wells",
      "Review",
      "blackline",
      "Kyriba",
      "Treasury → accounting",
    ],
    [
      "REC-04",
      "Recurring payments → ERP",
      "reconciliation",
      "Sam Patel",
      "Exception resolution",
      "blackline",
      "Stripe",
      "Income → accounting",
    ],
    [
      "REC-05",
      "Supplier payments → bank",
      "reconciliation",
      "Robin Wells",
      "Prepared",
      "blackline",
      "Oracle NetSuite",
      "Payments → treasury",
    ],
    [
      "REC-06",
      "Payroll settlement → ledger",
      "reconciliation",
      "Robin Wells",
      "Not started",
      "blackline",
      "Authorised settlement confirmation",
      "Restricted owner supplies completion only",
    ],
    [
      "PAY-01",
      "Supplier payment run",
      "payments",
      "Robin Wells",
      "Scheduled",
      "netsuite",
      "Staff Service Operations",
      "Purchasing → validate obligation → settle",
    ],
    [
      "PAY-02",
      "Refund exception",
      "payments",
      "Sam Patel",
      "Approval required",
      "stripe",
      "Income Administration",
      "Authorise → execute externally → record in NetSuite",
    ],
    [
      "PAY-03",
      "Returned payment correction",
      "payments",
      "Robin Wells",
      "Needs action",
      "netsuite",
      "Reconciliation",
      "Resolve exception → reconcile confirmation",
    ],
    [
      "PAY-04",
      "Intercompany obligation",
      "payments",
      "Robin Wells",
      "Awaiting review",
      "netsuite",
      "Treasury",
      "Validate obligation → accounting",
    ],
    [
      "PLAN-01",
      "2027 Annual Budget",
      "planning",
      "Jamie Reed",
      "Department inputs due",
      "adaptive",
      "Annual budget",
      "Business inputs → review → approved baseline",
    ],
    [
      "PLAN-02",
      "Q4 Forecast",
      "planning",
      "Jamie Reed",
      "Scenario review",
      "adaptive",
      "Rolling forecast",
      "Contributors → model owner review",
    ],
    [
      "PLAN-03",
      "Three-Year Outlook",
      "planning",
      "Jamie Reed",
      "In progress",
      "adaptive",
      "Multi-year outlook",
      "Capacity and income assumptions → review",
    ],
    [
      "PLAN-04",
      "Technology Investment Scenario",
      "planning",
      "Jamie Reed",
      "Inputs requested",
      "adaptive",
      "Investment analysis",
      "Services cost inputs → authorised model owner",
    ],
    [
      "PLAN-05",
      "Workforce Cost Scenario",
      "planning",
      "Jamie Reed",
      "Restricted model review",
      "adaptive",
      "Capacity analysis",
      "Summary milestones only; detailed model protected",
    ],
    [
      "PLAN-06",
      "Operational Cost Review",
      "planning",
      "Jamie Reed",
      "Awaiting review",
      "tableau",
      "Cost analysis",
      "Business explanation → management reporting",
    ],
    [
      "ACC-01",
      "Monthly financial close",
      "accounting",
      "Robin Wells",
      "Reconciliation",
      "blackline",
      "Close dependencies",
      "Two open items → approved actuals → FP&A / Tableau",
    ],
    [
      "ACC-02",
      "2026 Annual Financial Statements",
      "accounting",
      "Robin Wells",
      "Working papers",
      "netsuite",
      "Annual close",
      "Working papers → draft → audit → adjustments → approval → final",
    ],
    [
      "ACC-03",
      "Journal and accounting correction review",
      "accounting",
      "Robin Wells",
      "In review",
      "netsuite",
      "General ledger coordination",
      "Review → approved formal record",
    ],
    [
      "TRE-01",
      "Liquidity review",
      "treasury",
      "Morgan Ellis",
      "Ready for approval",
      "kyriba",
      "Cash forecast",
      "Payment capacity → authorised treasury reviewer",
    ],
    [
      "TRE-02",
      "Inter-entity transfer confirmation",
      "treasury",
      "Morgan Ellis",
      "Awaiting accounting confirmation",
      "kyriba",
      "Inter-entity funding",
      "Treasury → accounting confirmation",
    ],
  ];
export const items: FinancialItem[] = seed.map((s, i) => ({
  id: s[0],
  name: s[1],
  area: s[2],
  owner: s[3],
  status: s[4],
  stage: s[4],
  system: s[5],
  reference: systems.find((x) => x.id === s[5])!.ref,
  source: s[6],
  handoff: s[7],
  due: `2026-10-${String(19 + (i % 12)).padStart(2, "0")}`,
  method:
    i % 3 === 0 ? "Card / online" : i % 3 === 1 ? "Recurring" : "Bank transfer",
  issue: s[1],
  target:
    s[2] === "reconciliation"
      ? i === 12
        ? "Bank"
        : "Oracle NetSuite"
      : "Linked financial process",
  openItems: i % 3,
  reviewer: "Robin Wells",
  scenario: i % 2 ? "Baseline" : "Cost pressure",
  contributors: "Business owners · Income · Services",
  baseline: "2026 approved baseline · AP-270",
  period: "October 2026",
  sensitivity: "Internal",
  recordState: "Working information",
}));
export const scenarios = [
  "Baseline",
  "Growth",
  "Cost pressure",
  "Delayed investment",
  "Accelerated investment",
  "Staffing expansion",
  "Supplier cost increase",
  "Revenue downside",
];
export const closeStages = [
  "Not started",
  "Prepared",
  "Reconciling",
  "Exception resolution",
  "Review",
  "Complete",
];
export const checklist = [
  "Incoming revenue reconciled",
  "Payables complete",
  "Bank reconciliation complete",
  "Payroll posted",
  "Intercompany balances checked",
  "Accruals reviewed",
  "Tax entries reviewed",
  "Management actuals released",
];
export const views = [
  "Current Cycle",
  "Needs Action",
  "Reconciliation Exceptions",
  "Close Items",
  "Payments Pending",
  "Planning Inputs",
  "Variance Explanations",
  "Awaiting Review",
  "Recently Completed",
];
export function selectItems(records: FinancialItem[], view: string) {
  return records.filter((x) =>
    view === "Recently Completed"
      ? x.status === "Complete"
      : view === "Reconciliation Exceptions"
        ? x.area === "reconciliation" && x.openItems > 0
        : view === "Close Items"
          ? x.area === "reconciliation" || x.id === "ACC-01"
          : view === "Payments Pending"
            ? x.area === "payments" && x.status !== "Complete"
            : view === "Planning Inputs" || view === "Variance Explanations"
              ? x.area === "planning"
              : view === "Awaiting Review"
                ? /review|approval/i.test(x.status)
                : view === "Needs Action"
                  ? /action|classification|due|required|resolution/i.test(
                      x.status,
                    )
                  : x.status !== "Complete",
  );
}
export const protectedSubjects: Record<string, [string, string][]> = {
  income: [
    ["payment-exceptions", "Customer Payment Exceptions"],
    ["refund-chargeback", "Refund & Chargeback Review"],
    ["high-value-payment", "High-Value Payment Review"],
    ["payment-data-correction", "Payment Data Correction"],
  ],
  payments: [
    ["payroll-settlement", "Payroll Settlement"],
    ["employee-reimbursements", "Employee Reimbursements — Sensitive Cases"],
    ["disputed-supplier-payment", "Disputed Supplier Payment"],
    ["exceptional-authorisation", "Exceptional Payment Authorisation"],
  ],
  planning: [
    ["draft-scenarios", "Draft Management Forecast"],
    ["workforce-cost", "Workforce Cost Scenario"],
    ["restructuring-cost", "Restructuring Cost Scenario"],
    ["investment-affordability", "Investment Affordability Review"],
    ["pre-decision", "Pre-Decision Financial Scenario"],
  ],
  accounting: [
    ["tax-working-papers", "Tax Working Papers"],
    ["external-audit", "External Audit Working Papers"],
    ["accounting-investigation", "Unresolved Accounting Investigation"],
    ["pre-issue-statements", "Pre-Issue Financial Statements"],
    ["sensitive-adjustment", "Sensitive Accounting Adjustment"],
  ],
  treasury: [
    ["bank-mandates", "Bank Account & Mandate Administration"],
    ["signatories", "Authorised Signatories"],
    ["liquidity-stress", "Liquidity Stress Scenario"],
    ["transfer-authorisation", "Transfer Authorisation"],
    ["banking-security", "Banking Security Review"],
  ],
};
export const fileSeeds: [string, string, string][] = [
  ["FIN-01", "October Reconciliation Notes.docx", "reconciliation"],
  ["FIN-02", "Q4 Forecast Assumptions.xlsx", "planning"],
  ["FIN-03", "Close Issues Log.xlsx", "accounting"],
  ["FIN-04", "Supplier Payment Review.docx", "payments"],
  ["FIN-05", "2027 Budget Commentary.docx", "planning"],
  ["FIN-06", "Income Matching Guidance.docx", "income"],
  ["FIN-07", "Receipt Correction Checklist.docx", "income"],
  ["FIN-08", "Close Coordination Checklist.xlsx", "reconciliation"],
  ["FIN-09", "Financial Reporting Schedule.docx", "accounting"],
  ["FIN-10", "Cash Forecast Contribution Guide.docx", "treasury"],
  ["FIN-11", "October Matching Review Checklist.xlsx", "reconciliation"],
  ["FIN-12", "Reconciliation Handover Notes.docx", "reconciliation"],
  ["FIN-13", "Payment Reference Standards.docx", "income"],
  ["FIN-14", "Income Classification Examples.xlsx", "income"],
  ["FIN-15", "Payment Run Readiness Checklist.xlsx", "payments"],
  ["FIN-16", "Supplier Payment Process Notes.docx", "payments"],
  ["FIN-17", "Budget Contribution Guidance.docx", "planning"],
  ["FIN-18", "Budget Submission Review Checklist.xlsx", "planning"],
  ["FIN-19", "Forecast Commentary Guide.docx", "planning"],
  ["FIN-20", "Scenario Review Questions.docx", "planning"],
  ["FIN-21", "Reporting Pack Preparation Checklist.xlsx", "accounting"],
  ["FIN-22", "Close Review Meeting Agenda.docx", "accounting"],
  ["FIN-23", "Cash Forecast Methods.docx", "treasury"],
  ["FIN-24", "Forecast Submission Calendar.xlsx", "treasury"],
];
export const files: OperationalFile[] = fileSeeds.map(
  ([id, name, area], index) => ({
    id,
    name,
    library: "operations",
    folder: area,
    campaign: title,
    operation: "Shared operations",
    location: "Shared coordination",
    type: name.endsWith("xlsx") ? "Excel" : "Word",
    status: "Current",
    owner: area === "planning" ? "Jamie Reed" : "Sam Patel",
    validFrom: "2026-10-01",
    validTo: "2026-10-31",
    modified:
      id === "FIN-06"
        ? "2026-10-16"
        : `2026-10-${String(3 + ((index * 3) % 14)).padStart(2, "0")}`,
    sensitivity: "Internal",
    recordState: "Working information",
  }),
);
export const fileContext: Record<string, string> = {
  "FIN-02":
    "Shared contribution guidance only. Draft management forecasts and financial models remain in the protected subject and Adaptive Planning.",
  "FIN-10":
    "Contribution methods only. No bank accounts, mandates, liquidity amounts or transfer instructions.",
};
export const cycles = [
  "REC-01",
  "ACC-01",
  "PLAN-01",
  "PLAN-02",
  "TRE-01",
  "PAY-01",
];
export const handoffs = [
  "INC-01",
  "PAY-02",
  "PAY-01",
  "PLAN-06",
  "ACC-01",
  "TRE-02",
];
export const channels = [
  "General",
  "Income & Reconciliation",
  "Financial Operations",
  "Planning & Analysis",
  "Close Coordination",
];
export function channelFiles(channel: string) {
  return files.filter((f) =>
    channel === "General"
      ? true
      : channel === "Income & Reconciliation"
        ? ["income", "reconciliation"].includes(f.folder)
        : channel === "Financial Operations"
          ? f.folder === "payments"
          : channel === "Planning & Analysis"
            ? f.folder === "planning"
            : ["accounting", "reconciliation"].includes(f.folder),
  );
}
export const variance = [
  { area: "Incoming revenue", budget: 1200, actual: 1170, owner: "Maya Chen" },
  { area: "Operational costs", budget: 840, actual: 860, owner: "Jamie Reed" },
  { area: "Technology", budget: 320, actual: 310, owner: "Jordan Lee" },
  { area: "Content delivery", budget: 210, actual: 205, owner: "Alex Morgan" },
];
export const lifecycle: Record<string, string[]> = {
  "INC-01": [
    "Payment received · Stripe PAY-8437",
    "Customer/payment reference validated · Salesforce SF-1842",
    "Exception corrected and income classified",
    "Payment matched and reconciled · BlackLine BL-1028",
    "Accounting actual created externally · NetSuite NS-22041",
    "Approved actual feeds reporting, planning and liquidity",
  ],
  "PAY-02": [
    "Income validates duplicate / refund context",
    "Authorised payments reviewer approves in source system",
    "Stripe executes refund externally · PAY-8437",
    "NetSuite records accounting entry · NS-22041",
    "Reconciliation confirms settlement · BL-1028",
  ],
  "PLAN-01": [
    "Business owners submit commentary",
    "FP&A consolidates inputs in Adaptive Planning AP-271",
    "Authorised reviewers assess protected scenarios",
    "Decision recorded by budget owner",
    "Approved baseline released for broader authorised use",
  ],
  "ACC-01": [
    "Income, payments and bank reconciliation dependencies",
    "Resolve open items and accounting adjustments",
    "Close review in BlackLine BL-1028",
    "Approved actuals released by NetSuite NS-22041",
    "FP&A commentary and Tableau TB-394 reporting",
  ],
};
export const calendar = [
  { day: 19, title: "Income reconciliation review", item: "REC-01" },
  { day: 21, title: "Supplier payment run", item: "PAY-01" },
  { day: 23, title: "Forecast contribution deadline", item: "PLAN-02" },
  { day: 26, title: "Budget submissions", item: "PLAN-01" },
  { day: 27, title: "Audit and tax coordination milestone", item: "ACC-02" },
  { day: 28, title: "Liquidity and transfer review", item: "TRE-01" },
  { day: 30, title: "Month-end close and reporting", item: "ACC-01" },
];

// Milestones and registers share one deadline per financial work item.
for (const milestone of calendar) {
  const item = items.find((x) => x.id === milestone.item);
  if (item) item.due = `2026-10-${milestone.day}`;
}
