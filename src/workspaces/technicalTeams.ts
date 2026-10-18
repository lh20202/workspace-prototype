import { publishingPosts } from "./publishingTeams";
import { configById } from "./config";
import { functionalFileHref } from "./siteArchitecture";

export interface ConversationReply {
  author: string;
  text: string;
  time: string;
  moderator?: boolean;
  link?: { href: string; label: string };
}
export interface ConversationMessage {
  id?: string;
  channel: string;
  author: string;
  text: string;
  time?: string;
  replies?: ConversationReply[];
  likes?: number;
  repo?: string;
  kind?: string;
  ref?: string;
  fileLink?: { fileId: string; correctedFrom?: "onedrive" };
}
export { technicalChannels } from "./technicalChannelDefinitions";
const provisioningFileHref = functionalFileHref(
  configById.get("digital")!,
  "digital-F17",
);
const provisioningFolderHref = (() => {
  const [path, search] = provisioningFileHref.split("?");
  const params = new URLSearchParams(search);
  params.delete("file");
  return `${path}?${params}`;
})();

export const technicalPosts: ConversationMessage[] = [
  {
    id: "digital-onedrive-review",
    channel: "M365 & SPFx",
    author: "Ari Morgan",
    time: "10:18",
    text: "Here's the provisioning review for Thursday. Could you take a quick look before the meeting?",
    fileLink: { fileId: "digital-F17", correctedFrom: "onedrive" },
    replies: [
      {
        author: "Devon Park",
        time: "10:26",
        moderator: true,
        text: "Thanks, Ari. That link points to your personal OneDrive. Could you move the working copy into the M365 & SPFx folder in Dev and share the link here?",
        link: {
          href: provisioningFolderHref,
          label: "Open M365 & SPFx working folder",
        },
      },
      {
        author: "Ari Morgan",
        time: "10:34",
        text: "Oops, I didn't realise I'd shared the OneDrive link! I've moved it into the shared folder and updated my original post. Here's the working copy.",
        link: {
          href: provisioningFileHref,
          label: "Provisioning Script Review.docx",
        },
      },
      {
        author: "Devon Park",
        time: "10:37",
        moderator: true,
        text: "No worries, thanks! We can all use the same link now.",
      },
    ],
  },
  {
    channel: "Workspace & Wiki Moderators",
    author: "Leonie Fischer",
    time: "09:12",
    text: "Quick heads-up: the new Policy content type is rolling out Thursday. It now includes Approval status, and the retention flow starts once a policy is approved.\n\n@Jordan @Elena — could you update the policy libraries you look after once it's live? Give me a shout if you want a hand.",
    replies: [
      {
        author: "Jordan Lee",
        time: "09:24",
        text: "Yep, will do. Does that apply to the archived policy library too?",
      },
      {
        author: "Leonie Fischer",
        time: "09:28",
        text: "No, just active libraries for now — archive stays as-is.",
      },
      {
        author: "Elena Rossi",
        time: "09:33",
        text: "Thanks, I'll update ours on Thursday.",
      },
    ],
  },
  ...publishingPosts.map((post) => ({
    ...post,
    channel: "Workspace & Wiki Moderators",
  })),
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
  {
    channel: "Engineering",
    author: "Devon Park",
    time: "1 October 2026, 16:10",
    text: "The pagination check now covers an empty page between results as well as the last page. That was the awkward case from Tuesday's review. Thanks, Ari, for the small repro.",
    likes: 2,
  },
];
export const gitHref = (repo: string, kind = "repository", ref = "") =>
  `/digital-tech/systems/github?${new URLSearchParams({ repo, kind, ref })}`;
