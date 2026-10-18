/** Staff guidance describes the proposed approach, not deployed organisational processes. */
export const workspaceDemoStage =
  "These are early design examples, not final workspace structures. The organisation, access arrangements and functionality will be refined through further testing and consultation.";

export const creationExplanation =
  "This demo was built with AI-assisted coding. No company data was used, and nothing is connected to company tools or systems.";

export const workspaceFAQExampleNote =
  "This fictional exchange illustrates one way colleagues could help each other. It does not represent an agreed support process.";

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
        id: "existing-locations",
        question:
          "Is this replacing our existing sites, channels and K:Drive folders?",
        answer:
          "Not immediately. The proposed approach is to organise shared information around the work the company carries out, rather than simply reproducing departmental folder structures. Existing locations will be assessed as part of the preparation and migration process. The future arrangements will be introduced in stages.",
      },
      {
        id: "file-access",
        question: "Who can see my files?",
        answer:
          "Access will depend on the work people are involved in and their responsibilities, rather than simply which department they belong to. Information used across departments should be accessible to the relevant colleagues, while sensitive information will have additional restrictions. The detailed access arrangements are still being developed.",
      },
      {
        id: "personal-drives",
        question: "Where do personal drives fit in?",
        answer:
          "A personal drive can be useful for individual working files and drafts. Information that colleagues need to access, contribute to or maintain over time should be kept in an appropriate shared location.",
      },
      {
        id: "personal-drive-shared",
        question: "What if someone shares a personal drive file anyway?",
        answer:
          "You can share files from a personal drive, but ongoing access may depend on the individual account and sharing settings. For information used by a team or across departments, an agreed shared location is more reliable.",
      },
      {
        id: "role-changes",
        question: "What happens when someone joins, leaves or changes roles?",
        answer:
          "Their access should reflect their current responsibilities. Relevant access arrangements will need to be updated, and important shared information must remain accessible when colleagues change roles or leave. The administrative processes are still being defined.",
      },
      {
        id: "sensitivity",
        question: "How do I know how sensitive a document is?",
        answer:
          "The company's proposed classification framework distinguishes between Public, Internal, Confidential and Strictly Confidential information. Guidance will help staff recognise what requires additional protection and when to seek advice.",
      },
      {
        id: "protected-information",
        question:
          "Where do I save personal data or Strictly Confidential information?",
        answer:
          "Continue using the approved locations and procedures for that information. Personal data requires appropriate protection, but is not automatically Strictly Confidential. Decisions about which sensitive information can be stored on a site are still subject to security, legal and data protection requirements.",
      },
      {
        id: "sharing-copies",
        question:
          "Do I need to make a copy before sharing a document with another team?",
        answer:
          "Usually not. Where colleagues have the appropriate access, they should be able to work with the same document rather than create separate copies. This helps avoid duplication and conflicting versions.",
      },
      {
        id: "file-recovery",
        question:
          "What happens if I accidentally delete or overwrite something?",
        answer:
          "A site can retain earlier document versions and deleted files for a limited period, depending on its configuration. Contact IT support promptly if you cannot recover something yourself.",
      },
      {
        id: "finished-work",
        question:
          "What happens to files when a project or piece of work finishes?",
        answer:
          "Some information needs to be retained, some may be archived permanently, and other material can eventually be deleted. The company is developing the retention rules and procedures that will determine what happens to different types of information.",
      },
      {
        id: "shared-drive-migration",
        question: "What happens to files in our current shared drive?",
        answer:
          "The K:Drive and existing sites are being analysed to determine what needs to be retained, reorganised, migrated or removed. There will not be an immediate transfer of everything into the new workspaces. Any migration will require preparation, agreed destinations and appropriate safeguards.",
      },
      {
        id: "existing-links",
        question:
          "What happens to my existing links, bookmarks and synced folders?",
        answer:
          "Some may need updating when information moves to a new location. The implications for existing links and synchronisation will need to be assessed as part of migration planning, with instructions provided before changes take place.",
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
          "Yes, where collaboration and access have been authorised. The new structure is intended to make relevant information easier to find and connect across the company, while respecting existing access and information-sharing requirements.",
      },
      {
        id: "external-collaboration",
        question: "Can I work with people outside the company?",
        answer:
          "Where necessary and approved. External access and sharing must follow the applicable security, confidentiality and data protection requirements. The available options will depend on the information and systems involved.",
      },
      {
        id: "teams-workspace-difference",
        question: "What's the difference between channels and a workspace?",
        answer:
          "A workspace brings together information and collaboration around a particular area of work. Channels can be used within that environment to organise discussions, files and activities. Not every activity needs a separate workspace or channel.",
      },
      {
        id: "workspace-wiki-difference",
        question: "What's the difference between a Workspace and a Wiki?",
        answer:
          "Workspaces are where colleagues carry out work together, developing documents, sharing files and coordinating activities. Wikis provide organised, approved information that colleagues can refer to, such as procedures, guidance and other reusable knowledge.\n\nA Wiki may link to information maintained in a workspace or specialist system rather than storing another copy.",
      },
      {
        id: "specialist-tools",
        question:
          "I work with lots of different tools and platforms. How do they fit in?",
        answer:
          "The new structure is not intended to replace every system. Approved specialist tools will continue to serve their specific purposes. Workspaces and Wikis can help staff find and access information across these tools without unnecessarily duplicating it.",
      },
      {
        id: "fewer-places",
        question:
          "I already work in lots of sites and channels. Will this add even more?",
        answer:
          "The aim is the opposite: to reduce unnecessary duplication and make better use of shared environments. New workspace requirements will be assessed against existing options and the work they need to support, rather than automatically creating separate sites for every department, team or project.",
      },
    ],
  },
  {
    id: "getting-started",
    title: "GETTING STARTED & SUPPORT",
    questions: [
      {
        id: "focal-points",
        question: "Who are focal points?",
        answer:
          "Colleagues with specific responsibilities or expertise who help manage and improve how information is organised and used. Depending on their role, they may advise on business information, administer shared spaces, support colleagues or handle sensitive information. Different responsibilities may be assigned to different people.",
      },
      {
        id: "finding-the-right-place",
        question: "What if I don't know which workspace something belongs in?",
        answer:
          "Workspaces are organised around business activities, not necessarily departments. Guidance will help staff identify the appropriate location. During implementation, colleagues responsible for the relevant work and the IKM team can help resolve unclear cases.",
      },
      {
        id: "new-workspace",
        question: "How do I create a new workspace if I need one?",
        answer:
          "First, establish whether an existing workspace or working area can meet the need. Requests for new spaces will be assessed against their purpose, participants, information requirements and access needs. The request and approval process is still being defined.",
      },
      {
        id: "training",
        question: "Will my team and I get training?",
        answer:
          "Training and support will be developed alongside implementation. Different colleagues may need different levels of support, from basic navigation and everyday use to workspace administration or handling sensitive information.",
      },
      {
        id: "technical-settings",
        question: "Do I need to learn the technical settings?",
        answer:
          "No. Most staff will only need to understand where to work, how to organise and share information, and what to do when something requires additional protection. Configuration and more advanced administration will be handled by designated colleagues and IT support.",
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
