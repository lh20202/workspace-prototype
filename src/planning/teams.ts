import {
  documents,
  currentCycle,
  departmentSubmissionsFolder,
} from "../data/workspace";
import { planningPath } from "../utils/routes";
import { sharepointDestination } from "../teams/sharepointDestination";

export const planningReportingChannel = "Planning & Reporting";
export const logframeDocument = documents.find(
  (file) => file.id === "planning-11",
)!;
export const departmentSubmissionsHref = `${planningPath("planning")}?${new URLSearchParams({ folder: departmentSubmissionsFolder })}`;
export const awayDayRegistrationHref = "/planning?event=strategy-away-day";
export const logframeHref = `${sharepointDestination("planning", logframeDocument.id)}&mode=guided`;
export const planningTeamsHref = (staff: string, tab = "Posts") =>
  `/teams?${new URLSearchParams({ staff, workspace: "planning", context: "workspace:planning", channel: planningReportingChannel, tab })}`;

/** References to the existing working files; there are no channel-owned copies. */
export const planningChannelFiles = documents.filter(
  (file) =>
    (file.library === "planning" &&
      file.cycle === currentCycle &&
      (file.type === "Submission" ||
        ["planning-0", logframeDocument.id].includes(file.id))) ||
    file.id === "reporting-8",
);

export interface PlanningAuthor {
  name: string;
  role: string;
}
interface PlanningReply {
  author: PlanningAuthor;
  time: string;
  text: string;
}
export interface PlanningPost {
  id: string;
  author: PlanningAuthor;
  time: string;
  text: string;
  link?: { label: string; href: string; documentId?: string };
  replies?: PlanningReply[];
  reactions?: { emoji: string; people: string[] }[];
  local?: boolean;
}
const financialPartner = {
  name: "Amina Reed",
  role: "Financial Planning Partner",
};
const coordinator = { name: "Jordan Ellis", role: "Planning Coordinator" };
const financeContributor = {
  name: "Sam Patel",
  role: "Finance Operations Specialist",
};

export const planningPosts: PlanningPost[] = [
  {
    id: "planning-budget-submissions",
    author: financialPartner,
    time: "16 October 2026, 14:05",
    text: "Quick reminder: department budget submissions close on Friday 30 October. The submissions view is up to date, and we're running short drop-ins on Tuesday and Thursday if you'd like to check anything before you submit.",
    link: { label: "Department submissions", href: departmentSubmissionsHref },
    replies: [
      {
        author: financeContributor,
        time: "16 October, 14:12",
        text: "Can we still update the figures after we've submitted?",
      },
      {
        author: financialPartner,
        time: "16 October, 14:18",
        text: "Yep, until the deadline. After that, message me if something needs reopening.",
      },
    ],
    reactions: [{ emoji: "👍", people: ["Robin Avery", "Sam Patel"] }],
  },
  {
    id: "planning-outcomes-targets",
    author: { name: "Owen Clarke", role: "CEO Support Officer" },
    time: "16 October 2026, 09:20",
    text: "For anyone finishing department plans this week: please check the outcomes, indicators and targets before you mark your submission complete. If you're unsure where something belongs, bring it to Thursday's drop-in and we'll work through it together.",
    link: {
      label: "Open the Logframe",
      href: logframeHref,
      documentId: logframeDocument.id,
    },
    reactions: [{ emoji: "👍", people: ["Jordan Ellis"] }],
  },
  {
    id: "planning-logframe-view",
    author: coordinator,
    time: "15 October 2026, 10:10",
    text: "The updated Logframe view is ready. Same content and deadlines, but it's easier to work through one outcome at a time and spot missing fields before you submit. Anything you've already entered is still there.",
    link: {
      label: "Open the Logframe",
      href: logframeHref,
      documentId: logframeDocument.id,
    },
    replies: [
      {
        author: {
          name: "Sofia Bennett",
          role: "Department planning contributor",
        },
        time: "15 October, 10:24",
        text: "Do we need to move anything we've already started?",
      },
      {
        author: coordinator,
        time: "15 October, 10:31",
        text: "No — it's the same information underneath. The new view just makes it easier to work through.",
      },
    ],
    reactions: [
      { emoji: "👍", people: ["Sam Patel", "Owen Clarke", "Sofia Bennett"] },
    ],
  },
  {
    id: "planning-strategy-away-day",
    author: { name: "Nina Foster", role: "Network Coordinator" },
    time: "14 October 2026, 14:10",
    text: "The strategy away day is nearly booked. If you're joining, please send any dietary or accessibility requirements by Friday so we can confirm the venue arrangements. Please use the registration form rather than adding anything personal here.",
    link: {
      label: "Strategy away-day registration",
      href: awayDayRegistrationHref,
    },
    reactions: [{ emoji: "👍", people: ["Robin Avery", "Jordan Ellis"] }],
  },
  {
    id: "planning-reporting-template",
    author: coordinator,
    time: "12 October 2026, 09:30",
    text: "Small update: October reporting is due on 29 October, a day later than planned. The reporting template has the current dates. No need to resend anything you've already completed.",
    link: {
      label: "Performance reporting template 2027.xlsx",
      href: sharepointDestination("planning", "reporting-8"),
      documentId: "reporting-8",
    },
    reactions: [{ emoji: "👍", people: ["Sam Patel"] }],
  },
];
