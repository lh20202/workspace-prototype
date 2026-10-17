/** Staff-facing explanations remain separate from the simulated product. */
export const creationExplanation =
  "This demo was built with AI-assisted coding. No company data was used, and nothing is connected to live Microsoft 365 or business systems.";

export interface WorkspaceFAQQuestion {
  id: string;
  question: string;
  answer: string;
}
export interface WorkspaceFAQGroup {
  id: string;
  title: string;
  questions: readonly WorkspaceFAQQuestion[];
}

export const workspaceFAQGroups: readonly WorkspaceFAQGroup[] = [
  {
    id: "files-access",
    title: "FILES & ACCESS",
    questions: [
      {
        id: "file-access",
        question: "Who can see my files?",
        answer:
          "Access to files is linked to your role and the work you're involved in. Most shared work is available to the people who need it, while confidential areas are limited to specific participants.",
      },
      {
        id: "personal-drives",
        question: "Where do personal drives fit in?",
        answer:
          "Personal drives aren't part of the shared-working model shown here. Shared business documents live in workspaces so the right people can find, access and maintain the same copy.",
      },
      {
        id: "personal-drive-shared",
        question: "What if someone shares a personal drive file anyway?",
        answer:
          "It happens. Workspace focal points are trained to spot personal drive links, help move the working file into the right workspace and update the shared link.",
      },
      {
        id: "access-management",
        question: "Who manages access and permissions?",
        answer:
          "Workspace focal points help decide and confirm who needs business access. Site administrators or technical support apply the access, while urgent requests can be escalated when the focal point is unavailable.",
      },
      {
        id: "role-changes",
        question: "What happens when someone joins, leaves or changes roles?",
        answer:
          "Their access is reviewed against the work they now need to do. Relevant access is added and access they no longer need is removed, rather than everything simply following them forever.",
      },
      {
        id: "sensitivity",
        question: "How do I know how sensitive a document is?",
        answer:
          "Every file has a sensitivity label: Public, Internal, Confidential or Strictly confidential. The label helps show how the information should be handled, while more sensitive work is kept in protected areas with narrower access.",
      },
      {
        id: "protected-information",
        question:
          "Where do I save personal data or Strictly confidential information?",
        answer:
          "Only use the approved protected workspace area or specialist system intended for that information. Don't place it in an ordinary shared folder or general Teams conversation if the people there don't need access.",
      },
      {
        id: "sharing-copies",
        question:
          "Do I need to make a copy before sharing a document with another team?",
        answer:
          "Usually not. Keep the working document in its workspace and share the link, so everyone works from the same version.",
      },
      {
        id: "file-recovery",
        question:
          "What happens if I accidentally delete or overwrite something?",
        answer:
          "Workspace files keep version history, so an earlier version can often be restored. If something has been deleted or you can't recover it yourself, contact your workspace focal point.",
      },
      {
        id: "finished-work",
        question:
          "What happens to files when a project or piece of work finishes?",
        answer:
          "Useful final records stay in the appropriate workspace or archive. Temporary working material can then be closed, cleaned up or removed in line with its retention needs.",
      },
      {
        id: "shared-drive-migration",
        question: "What happens to files in our current shared drive?",
        answer:
          "Existing shared-drive files will be reviewed as work moves into the new setup. Useful information will move to the right workspace or archive; material that is no longer needed doesn't have to be carried forward. You won't be expected to work out all of the destinations on your own.",
      },
      {
        id: "existing-links",
        question:
          "What happens to my existing links, bookmarks and synced folders?",
        answer:
          "Switch-over support will include updating important links and bookmarks and reviewing old synced folders. We'll make it clear what needs changing rather than expecting you to discover broken links yourself.",
      },
    ],
  },
  {
    id: "working-with-others",
    title: "WORKING WITH OTHERS",
    questions: [
      {
        id: "international-colleagues",
        question: "Can I work with colleagues in other countries?",
        answer:
          "Yes. If colleagues are part of the same work, they can collaborate in the relevant workspace regardless of where they're based, subject to the same access and sensitivity rules.",
      },
      {
        id: "external-collaboration",
        question: "Can I work with people outside the company?",
        answer:
          "Yes, where external collaboration is needed. Access is limited to the specific shared area or material they need rather than opening up the wider workspace.",
      },
      {
        id: "teams-workspace-difference",
        question: "What's the difference between a channel and a workspace?",
        answer:
          "A channel is mainly for conversations and day-to-day coordination. The workspace is where the shared files and structured working information live.",
      },
      {
        id: "specialist-tools",
        question:
          "I work with lots of different tools and platforms — how do they fit in?",
        answer:
          "Workspaces bring the shared documents and collaboration around the work together. Specialist systems still do the jobs they're designed for, and the workspace links you to them instead of trying to duplicate everything.",
      },
      {
        id: "fewer-places",
        question:
          "I already work in lots of sites and Teams channels — will this add even more?",
        answer:
          "The aim is the opposite: fewer, clearer places to work. Not every workspace needs its own Team, and your normal Teams view should only show the conversations that are useful for your role.",
      },
    ],
  },
  {
    id: "getting-started",
    title: "GETTING STARTED & SUPPORT",
    questions: [
      {
        id: "finding-the-right-place",
        question: "What if I don't know which workspace something belongs in?",
        answer:
          "Ask your workspace or department focal point. They can help you find the right place without you needing to understand the whole setup.",
      },
      {
        id: "new-workspace",
        question: "How do I create a new workspace if I need one?",
        answer:
          "In most cases, the existing workspaces should already cover the work you need to do. If you're unsure, speak to your focal point — they may be able to solve the need within an existing workspace and can escalate it if a genuinely new space is required.",
      },
      {
        id: "training",
        question: "Will my team and I get training?",
        answer:
          "Yes — everyone will be introduced to the workspaces they use, with support for the new setup, updating important links and bookmarks, and safely creating, sharing and receiving information. Workspace focal points will receive additional training so they can help with structure, access, day-to-day questions and good working practices.",
      },
      {
        id: "technical-settings",
        question: "Do I need to learn the technical settings?",
        answer:
          "It depends on your role. Most people only need to know how to use their workspaces day to day; focal points, people who regularly handle personal or sensitive information, and technical or administrative roles will receive the extra training relevant to their responsibilities.",
      },
    ],
  },
];

/** Stable question IDs keep inline examples attached when the FAQ is regrouped. */
export const workspaceFAQQuestions = workspaceFAQGroups.flatMap(
  (group) => group.questions,
);

/** Ordinary explicit Preview Role routing opens an existing authorised conversation. */
export const workspaceFAQExampleHref =
  "/teams?staff=devon&workspace=digital&channel=M365%20%26%20SPFx&tab=Posts&post=digital-onedrive-review";
