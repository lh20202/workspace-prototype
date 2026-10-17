import type { ConversationMessage } from "./technicalTeams";

export const publishingChannels = [
  "General",
  "Workspace Moderation",
  "Intranet Moderation",
  "Wiki Moderation",
  "Publishing & Ownership",
  "Navigation & Findability",
];

export const publishingPosts: ConversationMessage[] = [
  {
    channel: "General",
    author: "Jordan Lee",
    time: "08:49",
    text: "This week’s reviews are in the register. Can we settle the owner and audience before sending the changes to Digital? It’ll save another round of questions.",
  },
  {
    channel: "Workspace Moderation",
    author: "Jordan Lee",
    time: "09:23",
    text: "Customer Care asked for another private library. This looks like it might already fit in their protected relationship area. Can someone check with them before we set anything up?",
    replies: [
      {
        author: "Elena Rossi",
        text: "I’ll ask the owner what’s missing and who needs access. Added it to the register so we don’t lose it.",
        time: "09:46",
      },
    ],
  },
  {
    channel: "Workspace Moderation",
    author: "Casey Blake",
    time: "14:08",
    text: "Two closed projects are still showing in Current Projects. I’ve linked the view in the review register — are we waiting for final handover on those?",
    replies: [
      {
        author: "Devon Park",
        text: "I’ll check the view once the project owners confirm the closure status.",
        time: "14:31",
      },
      {
        author: "Casey Blake",
        text: "Thanks, I’ll ask them and come back here.",
        time: "14:43",
      },
    ],
  },
  {
    channel: "Intranet Moderation",
    author: "Casey Blake",
    time: "10:16",
    text: "Planning’s approved reporting view has changed. Could someone check the intranet link? I think it still opens the old location.",
    replies: [
      {
        author: "Elena Rossi",
        text: "I’ll check it with the page owner today.",
        time: "10:52",
      },
    ],
    likes: 1,
  },
  {
    channel: "Wiki Moderation",
    author: "Elena Rossi",
    time: "11:41",
    text: "Three Sales & Marketing Wiki pages are due for review this month. Owners are in the register. Do we have dates from everyone yet?",
    replies: [
      {
        author: "Jordan Lee",
        text: "Not yet. I’ve asked them to confirm before the next publishing handoff.",
        time: "12:18",
      },
    ],
  },
  {
    channel: "Publishing & Ownership",
    author: "Elena Rossi",
    time: "13:29",
    text: "The updated guidance is waiting for the page owner’s approval. Can we link the working draft from its workspace here? I’d rather not start a second copy.",
    replies: [
      {
        author: "Jordan Lee",
        text: "Done — the handoff checklist now links to the owner’s file.",
        time: "13:44",
      },
    ],
    likes: 1,
  },
  {
    channel: "Navigation & Findability",
    author: "Devon Park",
    time: "15:06",
    text: "Yesterday’s search feedback: people find the published policy but miss the working procedure. I’ve added both routes to today’s navigation review. Could the page titles be the problem?",
    replies: [
      {
        author: "Harper Cole",
        text: "I’ll look at the wording with the procedure owner first. If search configuration needs changing, I’ll bring it back to Digital.",
        time: "15:39",
      },
    ],
  },
];
