export const technicalChannels = [
  "General",
  "Engineering",
  "Innovators",
  "AI Lab",
  "Web & CRM DevOps",
  "M365 & SPFx",
  "Architecture & Governance",
  "Platform Operations",
  "Security Engineering",
];
export const technicalPosts = [
  {
    channel: "Security Engineering",
    author: "Devon Park",
    text: "The privileged-access review is ready for peer review. Please confirm service owners against approved change references; credentials and vulnerability details remain in their separately controlled systems.",
    reply:
      "Ari Morgan: I’ll check the review checklist and the recorded approval references before the change window.",
  },
  {
    channel: "Innovators",
    author: "Devon Park",
    text: "For the Company Data API proof of concept, I’d keep the boundary explicit: TypeScript request validation at the edge, Python workers for the batch jobs. Anyone see a reason to put the whole pipeline behind one synchronous endpoint?",
    reply:
      "Casey Blake: Separate failure domains look easier to test. Can we capture the retry and idempotency trade-off in the ADR before choosing?",
    repo: "service-integrations",
    kind: "issue",
    ref: "214",
  },
  {
    channel: "Innovators",
    author: "Riley Chen",
    text: "The containerised preview build is finally reproducible. I’ve left the CI/CD job deliberately boring: typecheck, contract tests, image build, then an approval before deployment. Could use another pair of eyes on the edge-function timeout handling.",
    reply:
      "Devon Park: Nice. Let’s review the API contract tests separately from the deployment wiring so the PR stays readable.",
    repo: "company-web",
    kind: "pr",
    ref: "476",
  },
  {
    channel: "Innovators",
    author: "Ari Morgan",
    text: "SPFx experiment: rendering the compact search results with React is straightforward; the awkward bit is Graph throttling. I’ve isolated the adapter so we can test backoff without a tenant dependency.",
    reply:
      "Riley Chen: Good call. Keep the local fixture synthetic and put the adapter limitation in the review notes.",
    repo: "m365-extensions",
    kind: "repository",
    ref: "",
  },
  {
    channel: "AI Lab",
    author: "Devon Park",
    text: "Has anyone compared Qwen3 and Mistral Small for structured extraction locally? In our fictional fixture, schema constraints improved JSON consistency, but inference latency still needs work. I’ve kept licence review as a separate acceptance gate.",
    reply:
      "Ari Morgan: Let’s compare classification and long-context cases separately. The smaller model may be fine for one and unreliable for the other; the evaluation set needs to show both.",
    repo: "internal-ai",
    kind: "pr",
    ref: "482",
  },
  {
    channel: "AI Lab",
    author: "Riley Chen",
    text: "For the chatbot proof of concept I’d keep embeddings local and test Qdrant before a hosted vector service. The RAG harness now separates retrieval quality from answer quality, with no real customer data in the test set.",
    reply:
      "Devon Park: Added a review task for privacy-preserving fixtures, prompt changes and model licence notes. Let’s use the same run manifest when comparing local inference settings.",
    repo: "chatbot-platform",
    kind: "issue",
    ref: "193",
  },
  {
    channel: "Web & CRM DevOps",
    author: "Devon Park",
    text: "CRM webhook retry handling is ready for contract review. The delivery checklist links content acceptance from Creative & Editorial Studio; deployment and runtime checks stay with this engineering release.",
    reply:
      "Riley Chen: Please include the synthetic event replay result with the review, not a copy of CRM customer records.",
    repo: "customer-platform",
    kind: "release",
    ref: "2026.10",
  },
  {
    channel: "M365 & SPFx",
    author: "Ari Morgan",
    text: "Metadata provisioning change is ready for review. Business taxonomy comes from the functional owners; retention requirements come from Archives. This PR implements the configuration and migration mapping.",
    reply:
      "Devon Park: I’ll review the rollback path and Graph permission scope. No tenant credentials in the working notes.",
    repo: "m365-extensions",
    kind: "pr",
    ref: "318",
  },
  {
    channel: "General",
    author: "Devon Park",
    text: "This week’s reviews: customer platform integration, local classification evaluation and M365 search. Please link the repository issue and the working design so we can review the same context.",
    reply:
      "Ari Morgan: I’ve linked the release review and design notes in Shared.",
    repo: "service-integrations",
    kind: "repository",
    ref: "",
  },
  {
    channel: "Engineering",
    author: "Riley Chen",
    text: "Company Data API contract review is open. Looking for feedback on pagination, error semantics and event versioning before we lock the first consumer interface.",
    reply:
      "Devon Park: Added a small Python consumer fixture to test the contract boundary.",
    repo: "service-integrations",
    kind: "issue",
    ref: "217",
  },
  {
    channel: "Architecture & Governance",
    author: "Ari Morgan",
    text: "The architecture review compares managed hosting and container deployment for the new service. Please record operational ownership and failure recovery trade-offs in the decision note.",
    reply:
      "Riley Chen: Agreed. Keep the investment decision linked to executive oversight rather than copying their paper.",
    repo: "company-web",
    kind: "issue",
    ref: "229",
  },
  {
    channel: "Platform Operations",
    author: "Devon Park",
    text: "Change review is open for the service workflow. Freshservice holds the request and operational approvals; Shared has our implementation checklist.",
    reply:
      "Ari Morgan: I’ll confirm the authorised account and device handoff with the new-starter owner.",
    repo: "service-integrations",
    kind: "issue",
    ref: "231",
  },
];
export const gitHref = (repo: string, kind = "repository", ref = "") =>
  `/digital-tech/systems/github?${new URLSearchParams({ repo, kind, ref })}`;
