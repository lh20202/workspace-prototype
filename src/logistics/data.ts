export type LibraryId = "operations" | "resources" | "training" | "records";
export type OperationType =
  "Local in-person" | "Travelling in-person" | "Calling" | "Shared operations";
export type FileStatus =
  "Current" | "Draft" | "In review" | "Active" | "Completed" | "Superseded";
export interface OperationalFile {
  id: string;
  name: string;
  library: LibraryId;
  folder: string;
  campaign: string;
  operation: OperationType;
  location: string;
  type: string;
  status: FileStatus;
  owner: string;
  validFrom: string;
  validTo: string;
  modified: string;
  sensitivity: "Internal" | "Strictly confidential";
  recordState: "Working information" | "Current standard" | "Final record";
}
export const workspaceTitle = "Acquisition & Activation Logistics";
export const workspacePurpose =
  "Shared workspace for coordinating active in-person, travelling and calling campaigns.";
export const demoToday = "2026-10-14";
export const weekStart = "2026-10-12";
export const weekEnd = "2026-10-18";
export const libraries: { id: LibraryId; name: string; description: string }[] =
  [
    {
      id: "operations",
      name: "Campaign Operations",
      description:
        "Active deployment, campaign briefs and operational handovers.",
    },
    {
      id: "resources",
      name: "Shared Operations",
      description:
        "Current guides and templates used across campaigns. One shared copy of each guide.",
    },
    {
      id: "training",
      name: "Training & Onboarding",
      description:
        "Operational readiness, starter sessions and shared practice material.",
    },
    {
      id: "records",
      name: "Completed Campaign Records",
      description:
        "Selected final evidence from completed campaigns. Available to read.",
    },
  ];
export const campaigns = [
  {
    name: "Central City Campaign",
    status: "Active",
    channel: "central-city",
    operation: "Local in-person",
  },
  {
    name: "North City Campaign",
    status: "Active",
    channel: "north-city",
    operation: "Local in-person",
  },
  {
    name: "Autumn Travel Campaign",
    status: "Active",
    channel: "travel",
    operation: "Travelling in-person",
  },
  {
    name: "Member Renewal Calling",
    status: "Active",
    channel: "telephone",
    operation: "Calling",
  },
  {
    name: "New Supporter Welcome Calls",
    status: "Scheduled",
    channel: "telephone",
    operation: "Calling",
  },
];
type Seed = [
  string,
  string,
  LibraryId,
  string,
  string,
  OperationType,
  string,
  string,
  FileStatus,
  string,
];
const seeds: Seed[] = [
  [
    "central-deployment",
    "Central City deployment plan – Week 42.xlsx",
    "operations",
    "Central City Campaign",
    "Central City Campaign",
    "Local in-person",
    "Central Region",
    "Deployment plan",
    "Active",
    "Alex Morgan",
  ],
  [
    "central-schedule",
    "Central City location schedule – October.xlsx",
    "operations",
    "Central City Campaign",
    "Central City Campaign",
    "Local in-person",
    "Central Region",
    "Schedule",
    "Current",
    "Jamie Brooks",
  ],
  [
    "street-brief",
    "In-person campaign briefing – October.docx",
    "operations",
    "Central City Campaign",
    "Central City Campaign",
    "Local in-person",
    "Central Region",
    "Campaign brief",
    "Current",
    "Jamie Brooks",
  ],
  [
    "central-handover",
    "Daily campaign handover.docx",
    "operations",
    "Central City Campaign",
    "Central City Campaign",
    "Local in-person",
    "Central Region",
    "Handover",
    "Current",
    "Alex Morgan",
  ],
  [
    "north-schedule",
    "North City location schedule – October.xlsx",
    "operations",
    "North City Campaign",
    "North City Campaign",
    "Local in-person",
    "North Region",
    "Schedule",
    "Active",
    "Jordan Lee",
  ],
  [
    "north-handover",
    "North City handover.docx",
    "operations",
    "North City Campaign",
    "North City Campaign",
    "Local in-person",
    "North Region",
    "Handover",
    "Current",
    "Jordan Lee",
  ],
  [
    "travel-itinerary",
    "Autumn Travel itinerary – Week 3.xlsx",
    "operations",
    "Autumn Travel Campaign",
    "Autumn Travel Campaign",
    "Travelling in-person",
    "West Region",
    "Schedule",
    "Active",
    "Sam Patel",
  ],
  [
    "travel-equipment",
    "Travel equipment allocation.xlsx",
    "operations",
    "Autumn Travel Campaign",
    "Autumn Travel Campaign",
    "Travelling in-person",
    "West Region",
    "Equipment list",
    "In review",
    "Sam Patel",
  ],
  [
    "telephone-schedule",
    "Calling campaign schedule – October.xlsx",
    "operations",
    "Calling Campaigns",
    "Member Renewal Calling",
    "Calling",
    "Remote operations",
    "Schedule",
    "Active",
    "Maya Chen",
  ],
  [
    "renewal-brief",
    "Renewal calling brief.docx",
    "operations",
    "Calling Campaigns",
    "Member Renewal Calling",
    "Calling",
    "Remote operations",
    "Campaign brief",
    "Current",
    "Jordan Lee",
  ],
  [
    "welcome-script",
    "New supporter call script.docx",
    "operations",
    "Calling Campaigns",
    "New Supporter Welcome Calls",
    "Calling",
    "Remote operations",
    "Script",
    "Draft",
    "Maya Chen",
  ],
  [
    "telephone-handover",
    "Calling handover notes.docx",
    "operations",
    "Calling Campaigns",
    "Member Renewal Calling",
    "Calling",
    "Remote operations",
    "Handover",
    "Current",
    "Jordan Lee",
  ],
  [
    "issues",
    "Campaign issues log.xlsx",
    "operations",
    "Shared operations",
    "Shared operations",
    "Shared operations",
    "Across operations",
    "Issue log",
    "Current",
    "Jamie Brooks",
  ],
  [
    "on-call",
    "On-call rota.xlsx",
    "operations",
    "Shared operations",
    "Shared operations",
    "Shared operations",
    "Across operations",
    "Schedule",
    "Current",
    "Alex Morgan",
  ],
  [
    "coach-schedule",
    "Coach schedule.xlsx",
    "operations",
    "Shared operations",
    "Shared operations",
    "Shared operations",
    "Across operations",
    "Schedule",
    "Current",
    "Sam Patel",
  ],
  [
    "street-guide",
    "In-person conversation guide.docx",
    "resources",
    "",
    "Shared operations",
    "Local in-person",
    "All in-person locations",
    "Operational guide",
    "Current",
    "Jamie Brooks",
  ],
  [
    "telephone-guide",
    "Calling conversation guide.docx",
    "resources",
    "",
    "Shared operations",
    "Calling",
    "Remote operations",
    "Script",
    "Current",
    "Jordan Lee",
  ],
  [
    "setup-checklist",
    "Campaign setup checklist.docx",
    "resources",
    "",
    "Shared operations",
    "Shared operations",
    "Across operations",
    "Checklist",
    "Current",
    "Alex Morgan",
  ],
  [
    "team-lead-checklist",
    "Team lead checklist.docx",
    "resources",
    "",
    "Shared operations",
    "Shared operations",
    "Across operations",
    "Checklist",
    "Current",
    "Sam Patel",
  ],
  [
    "packing-list",
    "Equipment packing list.xlsx",
    "resources",
    "",
    "Shared operations",
    "Travelling in-person",
    "All in-person locations",
    "Equipment list",
    "Current",
    "Sam Patel",
  ],
  [
    "escalation-guide",
    "Incident escalation guide.docx",
    "resources",
    "",
    "Shared operations",
    "Shared operations",
    "Across operations",
    "Operational guide",
    "Current",
    "Jamie Brooks",
  ],
  [
    "handover-template",
    "Daily handover template.docx",
    "resources",
    "",
    "Shared operations",
    "Shared operations",
    "Across operations",
    "Handover",
    "Current",
    "Alex Morgan",
  ],
  [
    "starter-checklist",
    "New starter checklist.docx",
    "training",
    "",
    "Shared operations",
    "Shared operations",
    "Across operations",
    "Checklist",
    "Current",
    "Maya Chen",
  ],
  [
    "street-onboarding",
    "In-person fundraiser onboarding.docx",
    "training",
    "",
    "Shared operations",
    "Local in-person",
    "All in-person locations",
    "Operational guide",
    "Current",
    "Jamie Brooks",
  ],
  [
    "telephone-onboarding",
    "Calling operator onboarding.docx",
    "training",
    "",
    "Shared operations",
    "Calling",
    "Remote operations",
    "Operational guide",
    "Current",
    "Jordan Lee",
  ],
  [
    "coach-induction",
    "Team lead and coach induction.docx",
    "training",
    "",
    "Shared operations",
    "Shared operations",
    "Across operations",
    "Operational guide",
    "In review",
    "Sam Patel",
  ],
  [
    "central-record",
    "Central City Campaign – September completion report.pdf",
    "records",
    "",
    "Central City Campaign",
    "Local in-person",
    "Central Region",
    "Report",
    "Completed",
    "Jamie Brooks",
  ],
  [
    "travel-record",
    "Summer Travel Campaign – final operations report.pdf",
    "records",
    "",
    "Summer Travel Campaign",
    "Travelling in-person",
    "West Region",
    "Report",
    "Completed",
    "Sam Patel",
  ],
  [
    "telephone-record",
    "Calling Retention Campaign – completion summary.pdf",
    "records",
    "",
    "Calling Retention Campaign",
    "Calling",
    "Remote operations",
    "Report",
    "Completed",
    "Jordan Lee",
  ],
];
export const files: OperationalFile[] = seeds.map(
  ([
    id,
    name,
    library,
    folder,
    campaign,
    operation,
    location,
    type,
    status,
    owner,
  ]) => ({
    id,
    name,
    library,
    folder,
    campaign,
    operation,
    location,
    type,
    status,
    owner,
    validFrom:
      library === "records"
        ? "2026-09-01"
        : id === "welcome-script"
          ? "2026-10-19"
          : "2026-10-12",
    validTo:
      library === "records"
        ? "2026-09-30"
        : id === "welcome-script"
          ? "2026-10-31"
          : "2026-10-18",
    modified: library === "records" ? "2026-09-30" : "2026-10-14",
    sensitivity: "Internal",
    recordState:
      library === "records"
        ? "Final record"
        : library === "resources"
          ? "Current standard"
          : "Working information",
  }),
);
export const filesById = new Map(files.map((file) => [file.id, file]));
export const quickLinks = [
  { label: "Today's deployment plan", id: "central-deployment" },
  { label: "Current in-person campaign brief", id: "street-brief" },
  { label: "On-call rota", id: "on-call" },
  { label: "Current calling scripts", id: "telephone-guide" },
  { label: "New starter checklist", id: "starter-checklist" },
  { label: "Equipment & materials", id: "packing-list" },
  { label: "Operational issues", id: "issues" },
];
export interface Permit {
  id: string;
  location: string;
  campaign: string;
  region: string;
  date: string;
  permit: string;
  status: string;
  lead: string;
  notes: string;
}
export const permits: Permit[] = [
  {
    id: "permit-central",
    location: "Central Station Plaza",
    campaign: "Central City Campaign",
    region: "Central Region",
    date: "2026-10-18",
    permit: "Approved",
    status: "Confirmed",
    lead: "Jamie Brooks",
    notes: "East entrance confirmed. Use the updated deployment plan.",
  },
  {
    id: "permit-riverside",
    location: "Riverside Market",
    campaign: "Central City Campaign",
    region: "Central Region",
    date: "2026-10-19",
    permit: "Pending",
    status: "Awaiting confirmation",
    lead: "Jamie Brooks",
    notes: "Confirmation requested; alternative location held.",
  },
  {
    id: "permit-market",
    location: "Market Square",
    campaign: "Autumn Travel Campaign",
    region: "West Region",
    date: "2026-10-21",
    permit: "Approved",
    status: "Confirmed",
    lead: "Sam Patel",
    notes: "Equipment drop-off before the morning briefing.",
  },
  {
    id: "permit-north",
    location: "North Square",
    campaign: "North City Campaign",
    region: "North Region",
    date: "2026-10-16",
    permit: "Approved",
    status: "Confirmed",
    lead: "Jordan Lee",
    notes: "Meet at the north access point.",
  },
  {
    id: "permit-lakeside",
    location: "Lakeside Centre",
    campaign: "Autumn Travel Campaign",
    region: "West Region",
    date: "2026-10-17",
    permit: "Pending",
    status: "Awaiting confirmation",
    lead: "Sam Patel",
    notes: "Awaiting final site confirmation. Do not deploy yet.",
  },
];
export interface Channel {
  id: string;
  name: string;
  purpose: string;
  fileIds: string[];
  notes: string[];
  planner: boolean;
  team: "logistics" | "company";
}
export const channels: Channel[] = [
  {
    id: "general",
    name: "General",
    purpose: "Cross-operation announcements and major handovers.",
    fileIds: ["on-call", "issues", "escalation-guide"],
    notes: [
      "Next cross-operation check-in: Thursday at 09:00.",
      "Use the issues log for actions affecting more than one operation.",
    ],
    planner: true,
    team: "logistics",
  },
  {
    id: "street",
    name: "In-person Operations",
    purpose:
      "Common in-person coordination, equipment and operational changes.",
    fileIds: ["street-guide", "setup-checklist", "issues", "packing-list"],
    notes: [
      "Use the shared setup checklist before every deployment.",
      "Confirm site changes in Locations & Permits before briefing teams.",
    ],
    planner: true,
    team: "logistics",
  },
  {
    id: "central-city",
    name: "Central City",
    purpose: "Daily coordination, deployment and local handovers.",
    fileIds: [
      "central-deployment",
      "central-schedule",
      "street-brief",
      "central-handover",
      "street-guide",
    ],
    notes: [
      "Central Station Plaza: use the east entrance.",
      "Starter session uses the current October campaign brief.",
    ],
    planner: true,
    team: "logistics",
  },
  {
    id: "north-city",
    name: "North City",
    purpose: "North City locations, deployment questions and local handovers.",
    fileIds: ["north-schedule", "north-handover", "street-guide"],
    notes: [
      "North Square meeting point confirmed.",
      "Review the location schedule before the morning handover.",
    ],
    planner: true,
    team: "logistics",
  },
  {
    id: "travel",
    name: "Travel Campaigns",
    purpose: "Itineraries, locations, equipment and travelling handovers.",
    fileIds: [
      "travel-itinerary",
      "travel-equipment",
      "packing-list",
      "setup-checklist",
    ],
    notes: [
      "Lakeside Centre is awaiting permit confirmation.",
      "Keep packing requirements in the shared equipment list.",
    ],
    planner: true,
    team: "logistics",
  },
  {
    id: "telephone",
    name: "Calling Campaigns",
    purpose: "Calling schedules, current scripts, questions and handovers.",
    fileIds: [
      "telephone-schedule",
      "renewal-brief",
      "welcome-script",
      "telephone-handover",
      "telephone-guide",
    ],
    notes: [
      "Current campaign notes: renewal calling is active this week.",
      "Known operational issues: spare headset requested for the shared station.",
      "Handover points: welcome-call script remains a draft for next week.",
    ],
    planner: true,
    team: "logistics",
  },
  {
    id: "coaches",
    name: "Coaches & Team Leads",
    purpose: "Operational coaching schedules and team-lead coordination.",
    fileIds: ["coach-schedule", "team-lead-checklist", "escalation-guide"],
    notes: [
      "Keep discussions focused on operational readiness and shared handovers.",
      "Use the current induction guide for coaching sessions.",
    ],
    planner: true,
    team: "logistics",
  },
  {
    id: "onboarding",
    name: "Training & Onboarding",
    purpose:
      "Starter sessions, training coordination and shared guide questions.",
    fileIds: [
      "starter-checklist",
      "street-onboarding",
      "telephone-onboarding",
      "coach-induction",
    ],
    notes: [
      "Starter session: Thursday, 10:00.",
      "Bring questions about the shared conversation guides.",
    ],
    planner: true,
    team: "logistics",
  },
  {
    id: "important",
    name: "📢 Important updates",
    purpose: "Updates relevant to everyone.",
    fileIds: [],
    notes: [],
    planner: false,
    team: "company",
  },
  {
    id: "bulletin",
    name: "Bulletin",
    purpose: "A short weekly roundup.",
    fileIds: [],
    notes: [],
    planner: false,
    team: "company",
  },
  {
    id: "office",
    name: "Office news",
    purpose: "Everyday shared office information.",
    fileIds: [],
    notes: [],
    planner: false,
    team: "company",
  },
  {
    id: "pets",
    name: "🐾 Pet photos",
    purpose: "A little light relief from our fictional companions.",
    fileIds: [],
    notes: [],
    planner: false,
    team: "company",
  },
  {
    id: "learning",
    name: "Learning & Development",
    purpose: "Shared learning opportunities.",
    fileIds: [],
    notes: [],
    planner: false,
    team: "company",
  },
  {
    id: "socials",
    name: "Staff socials",
    purpose: "Optional social activities.",
    fileIds: [],
    notes: [],
    planner: false,
    team: "company",
  },
];
export interface Post {
  id: string;
  channel: string;
  author: string;
  time: string;
  title?: string;
  text: string;
  fileIds: string[];
  reply?: string;
  replyTime?: string;
  locationLink?: boolean;
  pet?: string;
  image?: { src: string; alt: string };
}
export const posts: Post[] = [
  {
    id: "post-general",
    channel: "general",
    author: "Jamie Brooks",
    time: "09:10",
    title: "This week’s operational handover",
    text: "Both teams are out today. I’ve attached the on-call rota — check who’s covering before you ring round.",
    fileIds: ["on-call"],
    replyTime: "09:17",
    reply:
      "Maya Chen: Got it. I’ve passed the handover on to the calling team.",
  },
  {
    id: "post-general2",
    channel: "general",
    author: "Alex Morgan",
    time: "Yesterday",
    text: "Here’s the escalation guide again — a few people were looking for it yesterday. This is the current copy.",
    fileIds: ["escalation-guide"],
  },
  {
    id: "post-street",
    channel: "street",
    author: "Sam Patel",
    time: "08:30",
    title: "Equipment checks before deployment",
    text: "Can everyone check their kit against the packing list before heading out? Log anything missing so we can sort the spares.",
    fileIds: ["packing-list", "issues"],
    replyTime: "08:39",
    reply: "Jamie Brooks: Spare materials are at the collection point now.",
  },
  {
    id: "post-central",
    channel: "central-city",
    author: "Alex Morgan",
    time: "08:42",
    text: "We’re at the east entrance of Central Station Plaza today because of the building work. I’ve updated the location tracker.",
    fileIds: ["central-deployment"],
    replyTime: "08:46",
    reply: "Jamie Brooks: Deployment sheet’s updated too. Same start time.",
    locationLink: true,
  },
  {
    id: "post-central2",
    channel: "central-city",
    author: "Jamie Brooks",
    time: "Yesterday",
    text: "Tomorrow’s starter session: use the October brief attached here. I’ve included the conversation guide as well.",
    fileIds: ["street-brief", "street-guide"],
  },
  {
    id: "post-north",
    channel: "north-city",
    author: "Jordan Lee",
    time: "08:55",
    text: "Friday at North Square is confirmed. Meeting point and handover time are in the attached schedule.",
    fileIds: ["north-schedule"],
    locationLink: true,
  },
  {
    id: "post-travel",
    channel: "travel",
    author: "Sam Patel",
    time: "09:05",
    text: "Week 3 itinerary is up. Still waiting on Lakeside Centre, so keep the alternative stop available for now.",
    fileIds: ["travel-itinerary", "packing-list"],
    locationLink: true,
  },
  {
    id: "post-phone",
    channel: "telephone",
    author: "Maya Chen",
    time: "09:15",
    title: "Renewal calling — current brief",
    text: "Renewal brief and calling guide attached for this week. Anything the next shift needs to know? Add it to the handover notes.",
    fileIds: ["renewal-brief", "telephone-guide"],
    replyTime: "09:26",
    reply:
      "Jordan Lee: One thing for next week: the welcome-call script is still in review. It’s not ready to use yet.",
  },
  {
    id: "post-phone2",
    channel: "telephone",
    author: "Jordan Lee",
    time: "Yesterday",
    text: "October call schedule is updated. If your headset’s playing up, add it to the issues log before the next shift.",
    fileIds: ["telephone-schedule", "issues"],
  },
  {
    id: "post-coach",
    channel: "coaches",
    author: "Sam Patel",
    time: "08:20",
    text: "This week’s coaching cover is in the schedule. @Jamie, can you check the afternoon slots? Handover checklist is attached too.",
    fileIds: ["coach-schedule", "team-lead-checklist"],
  },
  {
    id: "post-training",
    channel: "onboarding",
    author: "Jamie Brooks",
    time: "Yesterday",
    text: "Starter session is Thursday at 10:00. Bring the checklist and any questions you’ve picked up from the conversation guide.",
    fileIds: ["starter-checklist", "street-guide"],
  },
  {
    id: "post-important",
    channel: "important",
    author: "Jordan Lee",
    time: "Yesterday",
    title: "Office access maintenance this Saturday",
    text: "The main entrance will be closed for maintenance on Saturday, 09:00–12:00. Use the alternative entrance during that time.",
    fileIds: [],
  },
  {
    id: "post-bulletin",
    channel: "bulletin",
    author: "Alex Morgan",
    time: "Yesterday",
    text: "A few dates for the week: starter sessions Thursday, the optional learning session Friday, then our office check-in on Monday.",
    fileIds: [],
  },
  {
    id: "post-office",
    channel: "office",
    author: "Maya Chen",
    time: "Yesterday",
    text: "Meeting rooms have pens and paper again. Could the last person out give the table a quick tidy? Thanks!",
    fileIds: [],
  },
  {
    id: "post-daisy",
    channel: "pets",
    author: "Maya Chen",
    time: "10:20",
    text: "important mews coming in live",
    replyTime: "10:24",
    reply: "Alex Morgan: take me to your leader",
    fileIds: [],
    image: { src: "/images/daisy.jpg", alt: "Daisy the cat" },
  },
  {
    id: "post-miso",
    channel: "pets",
    author: "Maya Chen",
    time: "Yesterday",
    text: "This is Miso pretending not to sit on the keyboard.",
    fileIds: [],
    pet: "🐱",
  },
  {
    id: "post-learning",
    channel: "learning",
    author: "Sam Patel",
    time: "Yesterday",
    text: "Anyone joining the handover session on Friday at 11:00? Bring an example we can practise on, with any personal details removed.",
    fileIds: [],
  },
  {
    id: "post-social",
    channel: "socials",
    author: "Jamie Brooks",
    time: "Yesterday",
    text: "Board games at lunch on Friday? I’ll bring a couple. Drop in if you’re around.",
    fileIds: [],
  },
];
export type TaskState = "To do" | "In progress" | "Blocked" | "Done";
export interface Task {
  id: string;
  channel: string;
  title: string;
  owner: string;
  due: string;
  state: TaskState;
}
export const initialTasks: Task[] = [
  {
    id: "task-permit",
    channel: "central-city",
    title: "Confirm Central Station permit",
    owner: "Jamie Brooks",
    due: "16 Oct",
    state: "Done",
  },
  {
    id: "task-rota",
    channel: "central-city",
    title: "Publish next week’s deployment rota",
    owner: "Alex Morgan",
    due: "16 Oct",
    state: "In progress",
  },
  {
    id: "task-travel",
    channel: "travel",
    title: "Prepare travel campaign equipment",
    owner: "Sam Patel",
    due: "16 Oct",
    state: "To do",
  },
  {
    id: "task-lakeside",
    channel: "travel",
    title: "Confirm Lakeside Centre permit",
    owner: "Sam Patel",
    due: "17 Oct",
    state: "Blocked",
  },
  {
    id: "task-script",
    channel: "telephone",
    title: "Update calling script",
    owner: "Maya Chen",
    due: "19 Oct",
    state: "In progress",
  },
  {
    id: "task-headset",
    channel: "telephone",
    title: "Resolve headset issue",
    owner: "Jordan Lee",
    due: "15 Oct",
    state: "Blocked",
  },
  {
    id: "task-north",
    channel: "north-city",
    title: "Confirm Friday location handover",
    owner: "Jordan Lee",
    due: "16 Oct",
    state: "To do",
  },
  {
    id: "task-street",
    channel: "street",
    title: "Check shared campaign equipment",
    owner: "Sam Patel",
    due: "15 Oct",
    state: "In progress",
  },
  {
    id: "task-coach",
    channel: "coaches",
    title: "Confirm coaching cover",
    owner: "Sam Patel",
    due: "16 Oct",
    state: "To do",
  },
  {
    id: "task-starter",
    channel: "onboarding",
    title: "Prepare new starter session",
    owner: "Jamie Brooks",
    due: "15 Oct",
    state: "In progress",
  },
  {
    id: "task-general",
    channel: "general",
    title: "Publish cross-operation handover",
    owner: "Alex Morgan",
    due: "16 Oct",
    state: "To do",
  },
];
