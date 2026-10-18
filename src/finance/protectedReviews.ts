/** Controlled review scope, separate from ordinary contribution documents. */
export const protectedReviewSummaries: Record<string, string> = {
  "payment-exceptions":
    "Review unmatched customer receipts and agree the correction needed before reconciliation can close.",
  "refund-chargeback":
    "Review the reason, supporting evidence and reconciliation impact of a refund or chargeback exception.",
  "high-value-payment":
    "Confirm the additional evidence and review needed for a high value receipt before it is matched.",
  "payment-data-correction":
    "Check the proposed payment reference or classification correction and retain its review trail.",
  "disputed-supplier-payment":
    "Review the disputed obligation with Purchasing and confirm the evidence needed before settlement.",
  "draft-scenarios":
    "Compare the draft forecast assumptions and contribution gaps before management review.",
  "workforce-cost":
    "Review aggregated workforce cost assumptions and capacity scenarios for the 2027 plan. Individual salaries and employee records are outside this review.",
  "investment-affordability":
    "Review the timing, cost assumptions and affordability of the proposed technology investment.",
  "external-audit":
    "Prepare the financial close evidence and unresolved questions for the authorised external audit review.",
  "pre-issue-statements":
    "Review statement preparation, close dependencies and outstanding adjustments before issue.",
  "liquidity-stress":
    "Review aggregate cash forecast assumptions and stress conditions. Bank mandates and transfer instructions remain separately controlled.",
  "restructuring-cost":
    "Review the confidential management scenario and its aggregate cost assumptions before a restructuring decision.",
  "pre-decision":
    "Compare the financial assumptions and decision conditions for the confidential management options.",
};

/** These routes contain individual, pre-decision or highly sensitive controls. */
export const strictlyConfidentialFinanceSubjects = new Set([
  "payroll-settlement",
  "employee-reimbursements",
  "exceptional-authorisation",
  "restructuring-cost",
  "pre-decision",
  "accounting-investigation",
  "sensitive-adjustment",
  "bank-mandates",
  "signatories",
  "transfer-authorisation",
  "banking-security",
]);

/** Existing canonical work rows that provide context without duplicating files. */
export const protectedReviewItemIds: Record<string, string[]> = {
  "payment-exceptions": ["INC-01", "INC-08"],
  "refund-chargeback": ["PAY-02"],
  "high-value-payment": ["INC-08"],
  "payment-data-correction": ["INC-01", "PAY-03"],
  "disputed-supplier-payment": ["PAY-01"],
  "draft-scenarios": ["PLAN-02"],
  "workforce-cost": ["PLAN-05"],
  "investment-affordability": ["PLAN-04"],
  "external-audit": ["ACC-01"],
  "pre-issue-statements": ["ACC-01"],
  "liquidity-stress": ["REC-03"],
  "restructuring-cost": ["PLAN-03"],
  "pre-decision": ["PLAN-03"],
};
