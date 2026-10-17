export interface ConversationReply {
  author: string;
  text: string;
  time: string;
}
export interface ConversationMessage {
  channel: string;
  author: string;
  text: string;
  time?: string;
  replies?: ConversationReply[];
  likes?: number;
  repo?: string;
  kind?: string;
  ref?: string;
}
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
export const technicalPosts: ConversationMessage[] = [
  {
    channel: "Security Engineering",
    author: "Devon Park",
    time: "08:42",
    text: "Privileged-access review is ready. @Ari can you check the service owners against the approved changes before the window? Credentials and vulnerability details are still in their separate systems.",
    replies: [
      {
        author: "Ari Morgan",
        text: "On it. I’ll check the approval references as well.",
        time: "09:06",
      },
    ],
  },
  {
    channel: "Innovators",
    author: "Devon Park",
    time: "09:17",
    text: "Company Data API: I’d validate requests in TypeScript at the edge and keep the batch workers in Python. Is there a good reason to put the whole pipeline behind one synchronous endpoint?",
    replies: [
      {
        author: "Ari Morgan",
        text: "Separate failure domains would be easier to test. What does that mean for retries and idempotency?",
        time: "09:31",
      },
      {
        author: "Devon Park",
        text: "That’s the trade-off I want to settle. I’ll add both options to the Architecture Decision Record before we choose.",
        time: "09:54",
      },
    ],
    repo: "service-integrations",
    kind: "issue",
    ref: "214",
  },
  {
    channel: "Innovators",
    author: "Riley Chen",
    time: "11:08",
    text: "Container preview builds are reproducible now. CI/CD runs typecheck, contract tests and the image build, then waits for deployment approval. Could someone check the edge-function timeout handling in this PR?",
    replies: [
      {
        author: "Devon Park",
        text: "I’ll take the timeout handling. Can we review the API contract tests separately from the deploy wiring?",
        time: "11:23",
      },
    ],
    likes: 1,
    repo: "company-web",
    kind: "pr",
    ref: "476",
  },
  {
    channel: "Innovators",
    author: "Ari Morgan",
    time: "14:36",
    text: "Compact search results render fine in React/SPFx. Graph throttling is the awkward part. I’ve split out the adapter so we can test backoff without a tenant.",
    replies: [
      {
        author: "Riley Chen",
        text: "I can look at the adapter. Let’s keep the local fixture synthetic and note the tenant limitation in the review.",
        time: "15:02",
      },
    ],
    repo: "m365-extensions",
    kind: "repository",
    ref: "",
  },
  {
    channel: "AI Lab",
    author: "Devon Park",
    time: "10:24",
    text: "Has anyone tried Qwen3 and Mistral Small locally for structured extraction? Schema constraints helped JSON consistency on our synthetic test set, but latency still needs work. Licence review is still a separate gate.",
    replies: [
      {
        author: "Ari Morgan",
        text: "Were classification and long-context cases in the same run? I’d split those out before we draw conclusions about the smaller model.",
        time: "10:51",
      },
      {
        author: "Devon Park",
        text: "Good point. I’ll separate the results in Model Evaluation.xlsx.",
        time: "11:04",
      },
    ],
    repo: "internal-ai",
    kind: "pr",
    ref: "482",
  },
  {
    channel: "AI Lab",
    author: "Riley Chen",
    time: "13:47",
    text: "I’d try Qdrant locally before paying for a hosted vector store for the chatbot. Embeddings can stay local too. The RAG harness now scores retrieval and answers separately; the test set has no real customer data.",
    replies: [
      {
        author: "Devon Park",
        text: "Added privacy-safe fixtures, prompt changes and licence notes to the issue. Can we keep the run manifest the same when we compare inference settings?",
        time: "14:19",
      },
    ],
    repo: "chatbot-platform",
    kind: "issue",
    ref: "193",
  },
  {
    channel: "Web & CRM DevOps",
    author: "Devon Park",
    time: "09:38",
    text: "CRM webhook retries are ready for contract review in release 2026.10. Content acceptance from Creative & Editorial is linked in the Deployment Checklist; deploy and runtime checks are still ours.",
    replies: [
      {
        author: "Riley Chen",
        text: "Can you add the synthetic event replay result to the release review? We don’t need any CRM customer records there.",
        time: "10:02",
      },
    ],
    repo: "customer-platform",
    kind: "release",
    ref: "2026.10",
  },
  {
    channel: "M365 & SPFx",
    author: "Ari Morgan",
    time: "15:14",
    text: "Metadata provisioning PR is up: configuration and migration mapping. I’ve used the functional owners’ taxonomy and Archives’ retention requirements. @Devon, could you check the rollback path?",
    replies: [
      {
        author: "Devon Park",
        text: "Yes, and I’ll check the Graph permission scope. Keep tenant credentials out of the review notes.",
        time: "15:43",
      },
    ],
    likes: 2,
    repo: "m365-extensions",
    kind: "pr",
    ref: "318",
  },
  {
    channel: "General",
    author: "Devon Park",
    time: "08:56",
    text: "Reviews this week: customer platform integration, local classification evals and M365 search. Bring the repo issue and working design to each review so we’re looking at the same version.",
    repo: "service-integrations",
    kind: "repository",
    ref: "",
  },
  {
    channel: "Engineering",
    author: "Riley Chen",
    time: "10:07",
    text: "API contract review is open. Can someone check pagination, error semantics and event versioning before we lock the first consumer interface?",
    replies: [
      {
        author: "Devon Park",
        text: "I’ve added a small Python consumer fixture to test the contract boundary.",
        time: "10:26",
      },
      {
        author: "Riley Chen",
        text: "Thanks. I’ll use that for the pagination check.",
        time: "10:41",
      },
    ],
    likes: 1,
    repo: "service-integrations",
    kind: "issue",
    ref: "217",
  },
  {
    channel: "Architecture & Governance",
    author: "Ari Morgan",
    time: "11:32",
    text: "Managed hosting or containers for the new service? I’ve put the trade-offs in the Architecture Decision Record. We still need to agree who runs it and how we recover if it fails.",
    replies: [
      {
        author: "Riley Chen",
        text: "Agreed. I’ll keep the investment decision linked to the executive paper rather than copying it into the record.",
        time: "12:09",
      },
    ],
    repo: "company-web",
    kind: "issue",
    ref: "229",
  },
  {
    channel: "Platform Operations",
    author: "Devon Park",
    time: "13:18",
    text: "Service workflow change is ready for review. Request and approvals are in Freshservice; the Service Change — Handoff Checklist is in Shared.",
    replies: [
      {
        author: "Ari Morgan",
        text: "I’ll check the authorised account and device handoff with the new-starter owner.",
        time: "13:52",
      },
    ],
    repo: "service-integrations",
    kind: "issue",
    ref: "231",
  },
];
export const gitHref = (repo: string, kind = "repository", ref = "") =>
  `/digital-tech/systems/github?${new URLSearchParams({ repo, kind, ref })}`;
