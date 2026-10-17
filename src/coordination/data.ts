import { matchesDisplayText } from "../i18n/search";
import { canAccessDepartment, canAccessUnit } from "../access/policy";
import { configById } from "../workspaces/config";
import { functionalFileHref } from "../workspaces/siteArchitecture";
import { filesById as audienceFilesById } from "../audience/data";
import { libraryFor as audienceLibraryFor } from "../audience/libraries";

export interface CoordinationPerson {
  id: string;
  name: string;
  role: string;
  departmentId: string;
  unitId: string;
}
export const departmentFolders = [
  "Department Meetings",
  "Leadership & Unit Directors",
  "Planning Cycle Coordination",
  "Budget Administration",
  "Travel & Expense Coordination",
  "Workload & Capacity",
  "Retreats & Away Days",
  "Social & Team Activities",
  "Unit Coordination",
];
export const unitFolders = [
  "Unit Meetings",
  "Local Planning",
  "Workload & Cover",
  "Workshops & Retrospectives",
  "Team Activities",
  "Absence & Cover Calendar",
];
export interface AdminFile {
  id: string;
  departmentId: string;
  unitId?: string;
  folder: string;
  name: string;
  owner: string;
  kind: "Local administration";
}
export interface Unit {
  id: string;
  name: string;
  access: "Department-wide" | "Unit-only";
  files: AdminFile[];
  calendarItems: {
    person: string;
    availability: string;
    dates: string;
    cover: string;
  }[];
}
export interface ThreadUpload {
  id: string;
  name: string;
  kind: "Misplaced business upload";
  destination: string;
  destinationName: string;
  removed?: boolean;
  source?: "onedrive";
}
export interface CoordinationReply {
  author: string;
  text: string;
  time: string;
  moderator?: boolean;
  link?: { href: string; label: string };
}
export interface CoordinationPost {
  id: string;
  author: string;
  text: string;
  time: string;
  attachmentId?: string;
  upload?: ThreadUpload;
  moderatorReply?: string;
  replies?: CoordinationReply[];
  moderatorLikedBy?: string[];
}
export interface Department {
  id: string;
  name: string;
  fullName: string;
  channelAccess: "Organisation-wide" | "Department-only";
  icon: string;
  coordinator: { name: string; role: string; colour: string };
  units: Unit[];
  library: AdminFile[];
  posts: CoordinationPost[];
}
const definitions: [
  string,
  string,
  Department["channelAccess"],
  string,
  string,
  string,
  string[],
][] = [
  [
    "marketing-growth",
    "MCG Department",
    "Organisation-wide",
    "Priya Shah",
    "Marketing Department Assistant",
    "#e5eafa",
    [
      "Acquisition & Direct Engagement",
      "Customer Care",
      "Strategic Accounts",
      "Partnerships & Business Development",
      "Income Administration",
      "Marketing Insight & Performance",
      "Marketing Operations",
    ],
  ],
  [
    "communications",
    "CPA Department",
    "Organisation-wide",
    "Morgan Lee",
    "Communications Department Assistant",
    "#e1eee8",
    [
      "Editorial & Content",
      "Media Relations",
      "Public Affairs",
      "Brand & Creative",
      "Digital Channels",
    ],
  ],
  [
    "finance-services",
    "FCS Department",
    "Department-only",
    "Hannah Weber",
    "Finance Department Assistant",
    "#eee5f2",
    [
      "Accounting & Control",
      "Planning & Analysis",
      "Treasury & Payments",
      "Procurement & Supplier Services",
      "Legal & Assurance",
      "Workplace & Travel",
    ],
  ],
  [
    "strategy-technology",
    "STT Department",
    "Organisation-wide",
    "Theo Walker",
    "Strategy & Technology Department Assistant",
    "#e2edf2",
    [
      "Strategy & Performance",
      "Digital Strategy & Architecture",
      "IT Services",
      "Data & Analytics",
      "Information & Knowledge Management",
      "Project & Change Office",
    ],
  ],
  [
    "people-culture",
    "PAC Department",
    "Department-only",
    "Clara Jensen",
    "PAC Department Assistant",
    "#f4e8dd",
    [
      "People Operations",
      "Talent & Hiring",
      "Learning & Capability",
      "Organisation & Culture",
      "Reward & Employment",
      "People Systems & Analytics",
    ],
  ],
  [
    "executive-office",
    "EAO Department",
    "Department-only",
    "Jamie Reed",
    "Executive Office Coordinator",
    "#e8e8e8",
    ["CEO Office", "Governance Coordination", "Strategic Initiatives Support"],
  ],
];
export const unitId = (name: string) =>
  name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const unitOnly = new Set([
  "Strategic Accounts",
  "Income Administration",
  "Public Affairs",
  "Treasury & Payments",
  "People Operations",
  "Reward & Employment",
  "CEO Office",
  "Legal & Assurance",
  "People Systems & Analytics",
]);
const folderFiles: Record<string, string[]> = {
  "Department Meetings": ["Department Meeting — 20 October.docx"],
  "Leadership & Unit Directors": ["Unit Directors — Agenda.docx"],
  "Planning Cycle Coordination": [
    "Planning Cycle Submission Tracker.xlsx",
    "Planning Workshop Schedule.docx",
    "Unit Input Checklist.xlsx",
  ],
  "Budget Administration": [
    "Budget Input Deadline.docx",
    "Cost Centre Submission Tracker.xlsx",
    "Budget Meeting Agenda.docx",
  ],
  "Travel & Expense Coordination": [
    "Travel Overview.xlsx",
    "Conference Attendees.docx",
    "Expense Submission Checklist.docx",
  ],
  "Workload & Capacity": [
    "Weekly Capacity View.xlsx",
    "Cover Plan — October.docx",
  ],
  "Retreats & Away Days": [
    "Department Retreat 2027 — Agenda.docx",
    "Venue Comparison.xlsx",
  ],
  "Social & Team Activities": ["Summer Picnic — Activity Ideas.docx"],
};
const misfiled: Record<
  string,
  { author: string; text: string; upload: ThreadUpload; reply: string }
> = {
  "marketing-growth": {
    author: "Jamie Brooks",
    text: "I've attached October's conversion analysis. There's a bigger drop-off at step three than I expected — has anyone else seen this?",
    upload: {
      id: "UP-MKT-01",
      name: "Website Conversion Analysis — October.pptx",
      kind: "Misplaced business upload",
      destination: "/audience-innovation/analytics",
      destinationName: "Research & Insight → Measurement & Analytics",
    },
    reply:
      "Could you pop the working file into Measurement & Analytics and link it back here? That'll keep everyone on the same copy. Happy to help with the move.",
  },
  communications: {
    author: "Alex Morgan",
    text: "Here's the storyboard from this morning. Does the opening scene get the point across quickly enough?",
    upload: {
      id: "UP-COM-01",
      name: "Service Explainer — Storyboard.pptx",
      kind: "Misplaced business upload",
      destination: "/content-delivery/creative",
      destinationName: "Creative Studio → Creative & Multimedia",
      removed: true,
    },
    reply:
      "Looks like this is the live storyboard. Can you keep it in Creative & Multimedia and drop the link here? Saves us reviewing two versions.",
  },
  "finance-services": {
    author: "Sam Patel",
    text: "Q4 assumptions attached, with the changes from today's call. Can someone check the timing in the second scenario?",
    upload: {
      id: "UP-FIN-01",
      name: "Q4 Forecast Assumptions.xlsx",
      kind: "Misplaced business upload",
      destination: "/financial-operations/planning",
      destinationName: "Income & Financial Operations → Planning & Analysis",
    },
    reply:
      "Ah, this one's part of the Q4 forecast. Can you put it in Planning & Analysis and link it here? Fine to keep the discussion in this thread.",
  },
  "strategy-technology": {
    author: "Casey Blake",
    text: "I've updated the supplier checklist after the project call. Have I missed anything before we send it back?",
    upload: {
      id: "UP-STT-01",
      name: "Supplier Onboarding Checklist.docx",
      kind: "Misplaced business upload",
      destination: "/services/purchasing",
      destinationName: "Purchasing & Office → Purchasing & Suppliers",
      removed: true,
    },
    reply:
      "Can we keep this in Purchasing & Suppliers and link it back? They'll need the latest copy too. Give me a shout if you want a hand moving it.",
  },
  "people-culture": {
    author: "Elena Rossi",
    text: "Feedback from the manager sessions is attached. The shorter exercise seems to have worked better — worth keeping for the next round?",
    upload: {
      id: "UP-PC-01",
      name: "Manager Capability Programme — Pilot Feedback.xlsx",
      kind: "Misplaced business upload",
      destination: "/people-culture/learning",
      destinationName: "People & Culture → Capability & Learning",
      removed: true,
    },
    reply:
      "Could you keep the feedback in Capability & Learning and post the link here? Then the learning team can add to the same copy.",
  },
  "executive-office": {
    author: "Robin Avery",
    text: "Stage review attached after today's discussion. I'd like to settle the outstanding handover point before Tuesday.",
    upload: {
      id: "UP-EX-01",
      name: "PRJ-2026-014 · Customer Platform Renewal — Stage Review.pptx",
      kind: "Misplaced business upload",
      destination: "/projects/PRJ-2026-014/decisions",
      destinationName: "Projects → PRJ-2026-014 · Customer Platform Renewal",
    },
    reply:
      "Can we keep the paper with PRJ-2026-014 and link the decision reference to Strategic Initiatives? I'll help get it to the initiative owner; we can sort Tuesday's agenda here.",
  },
};
const departmentConversation: Record<string, string[]> = {
  "marketing-growth": [
    "Unit planning inputs are due Friday. I've updated the tracker — could each unit check its line before then?",
    "Anyone coming for lunch on Thursday? I've booked for 12:30 and can still add a couple of seats.",
    "Tuesday's Unit Directors agenda is up. Anything we need to add before I send it round?",
    "A few of us are away next week. I've updated the capacity view; can someone cover the Thursday check-in?",
    "I've started the 2027 retreat agenda. What would make the day useful for your team?",
    "Still got conference expenses to submit? The checklist's attached — Friday is the deadline.",
    "Planning ahead for next summer: courtyard or park for the picnic? Add any activity ideas to the note.",
  ],
  communications: [
    "Friday is the deadline for unit planning inputs. The tracker is up to date now; two lines still need owners.",
    "Friday lunch is booked for 13:00. Anyone else joining?",
    "I've added the unit updates to Tuesday's agenda. Can we leave ten minutes for the publishing schedule?",
    "Next week's capacity view is attached. Who can cover the morning check-in while I'm away?",
    "Retreat agenda attached. I'd like to keep the afternoon for something we can actually work on together — any suggestions?",
    "Last call for conference expenses this week. I've attached the checklist in case it's useful.",
    "Any ideas for next summer's picnic? I've started a note so we don't lose the suggestions.",
  ],
  "finance-services": [
    "Unit planning inputs are due on Friday. Can each unit check the tracker? I'd like to catch any gaps before the deadline.",
    "Thursday lunch, 12:30 — anyone joining? I need numbers for the booking by this afternoon.",
    "Tuesday's Unit Directors agenda is ready. Is there anything on month-end cover we should add?",
    "I've updated next week's capacity view. Can anyone spare an hour on Thursday if the close runs over?",
    "The 2027 retreat agenda is attached. Could we make room for a session on the handoffs that keep slowing us down?",
    "Conference expenses need to be in by Friday. The checklist covers what to include with the claim.",
    "We're collecting ideas for next summer's picnic. Courtyard would be easier, but happy to hear other suggestions.",
  ],
  "strategy-technology": [
    "Unit planning inputs are due Friday. I've refreshed the tracker — let me know if your unit needs help getting its line finished.",
    "Lunch on Thursday at 12:30? I've booked a table; reply here if you'd like a seat.",
    "Tuesday's agenda is attached. @Devon, do you need a slot for next week's release cover?",
    "A few people are away next week. Capacity view is updated; please check we haven't left any support gaps.",
    "First pass at the retreat agenda is up. I'd rather leave some room for discussion than fill it with updates.",
    "Quick reminder: conference expenses are due Friday. Checklist attached.",
    "For next summer's picnic, would people prefer the courtyard or the park? Activity ideas can go in the note.",
  ],
  "people-culture": [
    "Friday's the deadline for unit planning inputs. I've updated the tracker; can you check your unit's entry?",
    "Anyone free for lunch on Thursday? Table's booked for 12:30, and there's room for a few more.",
    "Agenda for Tuesday is up. Can we add a short slot on cover for the next round of workshops?",
    "Next week's capacity view is attached. We're a bit stretched on Thursday — is anyone able to help with the workshop setup?",
    "I've drafted the 2027 retreat agenda. What would you like us to spend more time on this year?",
    "Conference expenses are due by Friday. I've attached the checklist for anyone still putting their claim together.",
    "Next summer's picnic: courtyard or park? I've added a few activity ideas — feel free to add yours.",
  ],
  "executive-office": [
    "Unit planning inputs are due Friday. I've updated the tracker. Please check the outstanding entries before tomorrow's check-in.",
    "I'm booking Thursday lunch for 12:30. Let me know by this afternoon if you'd like to join.",
    "Tuesday's Unit Directors agenda is attached. Are there any decisions we need to allow more time for?",
    "I've updated next week's capacity view. We still need cover for the Thursday morning briefing.",
    "Draft retreat agenda attached. I'd welcome suggestions for the afternoon discussion.",
    "Conference expenses need to be submitted by Friday. The checklist is attached.",
    "I've opened the ideas note for next summer's picnic. Any preference between the courtyard and the park?",
  ],
};
const departmentReplies: Record<
  string,
  Record<string, NonNullable<CoordinationPost["replies"]>>
> = {
  "marketing-growth": {
    onedrive: [
      {
        author: "Taylor Brooks",
        text: "Oops, sorry — didn't realise I'd shared the OneDrive copy. I've moved it into the shared folder now — here's the link.",
        time: "12:21",
        link: {
          href: `/audience-innovation/${audienceLibraryFor(audienceFilesById.get("seg-model")!)}?file=seg-model`,
          label: audienceFilesById.get("seg-model")!.name,
        },
      },
      {
        author: "Priya Shah",
        text: "No worries! Could you update your original post with that link too? I've removed the old OneDrive attachment here.",
        time: "12:23",
        moderator: true,
      },
    ],
    P1: [
      {
        author: "Taylor Brooks",
        text: "Ours is nearly there. I'll add the final figures tomorrow morning.",
        time: "09:18",
      },
    ],
    P2: [
      {
        author: "Taylor Brooks",
        text: "Yes please, one more for lunch.",
        time: "09:32",
      },
      {
        author: "Priya Shah",
        text: "Me too, if there's still space.",
        time: "10:06",
      },
      {
        author: "Maya Chen",
        text: "Both added. I'll confirm the numbers at 11.",
        time: "10:14",
      },
    ],
    P4: [
      {
        author: "Taylor Brooks",
        text: "I can cover Thursday. Send me the invite.",
        time: "10:31",
      },
    ],
  },
  communications: {
    misfiled: [
      {
        author: "Alex Morgan",
        text: "Thanks, Morgan — I've moved it to Creative & Multimedia. Here's the working copy.",
        time: "10:52",
        link: {
          href: "/content-delivery/production?file=video-storyboard",
          label: "Service Explainer — Storyboard.pptx",
        },
      },
      {
        author: "Morgan Lee",
        text: "Perfect, thanks. I've removed the old upload here — let's keep reviewing through that link.",
        time: "10:56",
        moderator: true,
      },
    ],
    P4: [
      {
        author: "Morgan Lee",
        text: "I can do Monday and Tuesday. Anyone free on Wednesday?",
        time: "10:29",
      },
      {
        author: "Alex Morgan",
        text: "Wednesday works for me — thanks.",
        time: "10:42",
      },
    ],
  },
  "finance-services": {
    P2: [
      {
        author: "Jordan Lee",
        text: "Count me in. I can get there just after 12:30.",
        time: "09:34",
      },
    ],
    P4: [
      {
        author: "Jordan Lee",
        text: "I can help after 14:00. Shall I keep that hour free?",
        time: "10:28",
      },
      {
        author: "Sam Patel",
        text: "Yes please. That should give us enough cover.",
        time: "10:36",
      },
    ],
  },
  "strategy-technology": {
    misfiled: [
      {
        author: "Casey Blake",
        text: "Ooh, thanks for the reminder! I've reuploaded it there — here's the new link.",
        time: "10:49",
        link: {
          href: functionalFileHref(configById.get("services")!, "services-F3"),
          label: "Supplier Onboarding Checklist.docx",
        },
      },
      {
        author: "Theo Walker",
        text: "No worries! Can you also edit your original post to use the new link, just so we don't end up with two versions floating around? I'll remove the attachment from this channel's files. Thanks so much.",
        time: "10:53",
        moderator: true,
      },
    ],
    P3: [
      {
        author: "Devon Park",
        text: "Five minutes should do it. I'll bring the gaps rather than run through the whole rota.",
        time: "10:11",
      },
    ],
  },
  "people-culture": {
    misfiled: [
      {
        author: "Elena Rossi",
        text: "Done — the feedback is in Capability & Learning now. I've updated the link in my post too.",
        time: "10:51",
        link: {
          href: functionalFileHref(configById.get("people")!, "people-F5"),
          label: "Manager Capability Programme — Pilot Feedback.xlsx",
        },
      },
      {
        author: "Clara Jensen",
        text: "Thanks, Elena. I've removed the old upload from our channel files.",
        time: "10:58",
        moderator: true,
      },
    ],
    P4: [
      {
        author: "Jamie Ellis",
        text: "I can help with setup before 10, then I need to get back to the admin queue.",
        time: "10:33",
      },
      {
        author: "Clara Jensen",
        text: "That would be great. Setup should be done by 09:45.",
        time: "10:39",
      },
    ],
  },
  "executive-office": {
    P4: [
      {
        author: "Robin Avery",
        text: "I can take the briefing. Please send me the latest agenda.",
        time: "10:38",
      },
    ],
  },
};
export const departments: Department[] = definitions.map(
  ([id, name, channelAccess, coordinatorName, , colour, unitNames]) => {
    const library: AdminFile[] = Object.entries(folderFiles).flatMap(
      ([folder, names], folderIndex) =>
        names.map((name, i) => ({
          id: `${id}-D${folderIndex}-${i}`,
          departmentId: id,
          folder,
          name,
          owner: coordinatorName,
          kind: "Local administration" as const,
        })),
    );
    const units: Unit[] = unitNames.map((name) => {
      const uid = unitId(name);
      const files: AdminFile[] = [
        { folder: "Unit Meetings", name: "Weekly Meeting — 19 October.docx" },
        { folder: "Workload & Cover", name: "Q4 Workload Overview.xlsx" },
        {
          folder: "Workshops & Retrospectives",
          name:
            name === "Marketing Insight & Performance"
              ? "Research Team Retro — October.docx"
              : "Unit Retrospective — October.docx",
        },
        ...(name === "Marketing Insight & Performance"
          ? [
              {
                folder: "Workshops & Retrospectives",
                name: "Workshop Agenda — Journey Mapping.docx",
              },
            ]
          : []),
      ].map((f, i) => ({
        ...f,
        id: `${id}-${uid}-U${i}`,
        departmentId: id,
        unitId: uid,
        owner: coordinatorName,
        kind: "Local administration",
      }));
      return {
        id: uid,
        name,
        access: unitOnly.has(name) ? "Unit-only" : "Department-wide",
        files,
        calendarItems: [
          {
            person:
              id === "marketing-growth"
                ? "Maya"
                : id === "communications"
                  ? "Alex"
                  : id === "finance-services"
                    ? "Sam"
                    : id === "people-culture"
                      ? "Elena"
                      : id === "executive-office"
                        ? "Robin"
                        : "Casey",
            availability: "Away",
            dates: "22–23 Oct",
            cover: id === "marketing-growth" ? "Taylor" : "Unit coordinator",
          },
        ],
      };
    });
    const byFolder = (folder: string) =>
      library.find((f) => f.folder === folder)!.id;
    const colleague = (
      {
        "marketing-growth": "Maya Chen",
        communications: "Alex Morgan",
        "finance-services": "Sam Patel",
        "strategy-technology": "Casey Blake",
        "people-culture": "Elena Rossi",
        "executive-office": "Robin Avery",
      } as Record<string, string>
    )[id];
    const posts: CoordinationPost[] = [
      {
        id: `${id}-P1`,
        author: coordinatorName,
        text: departmentConversation[id][0],
        time: "09:10",
        attachmentId: byFolder("Planning Cycle Coordination"),
      },
      {
        id: `${id}-P2`,
        author: colleague,
        text: departmentConversation[id][1],
        time: "09:30",
      },
      {
        id: `${id}-P3`,
        author: coordinatorName,
        text: departmentConversation[id][2],
        time: "10:05",
        attachmentId: byFolder("Leadership & Unit Directors"),
      },
      {
        id: `${id}-P4`,
        author:
          id === "finance-services"
            ? "Sam Patel"
            : id === "marketing-growth"
              ? "Maya Chen"
              : coordinatorName,
        text: departmentConversation[id][3],
        time: "10:25",
        attachmentId: byFolder("Workload & Capacity"),
      },
      {
        id: `${id}-P5`,
        author: coordinatorName,
        text: departmentConversation[id][4],
        time: "11:00",
        attachmentId: byFolder("Retreats & Away Days"),
      },
      {
        id: `${id}-P6`,
        author: coordinatorName,
        text: departmentConversation[id][5],
        time: "11:25",
        attachmentId: library.find(
          (f) => f.name === "Expense Submission Checklist.docx",
        )!.id,
      },
    ];
    const example = misfiled[id];
    if (example)
      posts.splice(4, 0, {
        id: `${id}-misfiled`,
        author: example.author,
        text: example.text,
        time: "10:40",
        upload: example.upload,
        moderatorReply: example.reply,
      });
    if (id === "people-culture")
      posts.splice(5, 0, {
        id: `${id}-recruitment-handoff`,
        author: "Clara Jensen",
        text: "The recruitment handoff checklist is ready for a quick process check. It's just the steps, with no candidate details.",
        time: "10:50",
        upload: {
          id: "UP-PC-02",
          name: "Recruitment Workflow — Administration Handoff.docx",
          kind: "Misplaced business upload",
          destination: "/employment-admin/recruitment-administration",
          destinationName:
            "Employment & Hiring Administration → Recruitment Administration",
        },
        moderatorReply:
          "Could you put this in Employment & Hiring Administration → Recruitment Administration and link it here? Let's keep candidate details in the restricted recruitment areas.",
      });
    if (id === "strategy-technology")
      posts.splice(5, 0, {
        id: `${id}-engineering-handoff`,
        author: "Devon Park",
        text: "HR-platform interface notes attached. Can someone check the authentication changes before the release review?",
        time: "10:55",
        upload: {
          id: "UP-STT-02",
          name: "HR Platform Interface — Technical Review.docx",
          kind: "Misplaced business upload",
          destination: "/digital-tech/systems-engineering",
          destinationName: "Tech & Digital → Engineering Delivery",
        },
        moderatorReply:
          "Devon, can you keep the API and authentication review in Engineering Delivery and link it here? I'll leave the process questions with Employment & Hiring Administration.",
      });
    posts.push({
      id: `${id}-P7`,
      author: coordinatorName,
      text: departmentConversation[id][6],
      time: "12:05",
      attachmentId: byFolder("Social & Team Activities"),
    });
    if (id === "marketing-growth") {
      const canonical = audienceFilesById.get("seg-model")!;
      posts.push({
        id: `${id}-onedrive`,
        author: "Taylor Brooks",
        text: "Here's the segmentation model for tomorrow's planning session. Could you check the audience labels?",
        time: "12:15",
        upload: {
          id: "UP-MKT-OD-01",
          name: canonical.name,
          kind: "Misplaced business upload",
          destination: `/audience-innovation/${audienceLibraryFor(canonical)}?file=${canonical.id}`,
          destinationName: "Research & Insight → Audience Segmentation",
          source: "onedrive",
          removed: true,
        },
        moderatorReply:
          "Thanks, Taylor. Could you move the working copy into Research & Insight and link it here? Then everyone working on it can use the same version.",
      });
    }
    for (const post of posts) {
      const key = post.id.slice(id.length + 1);
      post.replies = departmentReplies[id]?.[key];
      if (
        post.moderatorReply &&
        !post.replies?.length &&
        post.author !== coordinatorName
      )
        post.moderatorLikedBy = [post.author];
    }
    if (id === "marketing-growth")
      posts.push({
        id: `${id}-history-cover`,
        author: "Priya Shah",
        time: "29 September 2026, 14:30",
        text: "October cover is agreed now. Thanks for sorting the overlaps so quickly. If your dates change, update the capacity view and let the person covering know.",
        attachmentId: byFolder("Workload & Capacity"),
        replies: [
          {
            author: "Taylor Brooks",
            time: "29 September 2026, 14:42",
            text: "Mine are confirmed. I've sent Maya the handover for the Thursday check-in.",
          },
        ],
      });
    return {
      id,
      name,
      fullName: name,
      channelAccess,
      icon: id,
      coordinator: { name: coordinatorName, role: `${name} Assistant`, colour },
      units,
      library,
      posts,
    };
  },
);
export function canOpenDepartment(
  department: Department,
  person: CoordinationPerson,
) {
  return canAccessDepartment(person, department.id);
}
export function canOpenUnit(
  department: Department,
  unit: Unit,
  person: CoordinationPerson,
) {
  return canAccessUnit(
    person,
    department.id,
    unit.id,
    unit.access === "Unit-only",
  );
}
export function accessibleFiles(
  department: Department,
  person: CoordinationPerson,
) {
  if (!canOpenDepartment(department, person)) return [];
  return [
    ...department.library,
    ...department.units
      .filter((u) => canOpenUnit(department, u, person))
      .flatMap((u) => u.files),
  ];
}
export function searchCoordination(
  department: Department,
  person: CoordinationPerson,
  query: string,
) {
  if (!canOpenDepartment(department, person)) return { files: [], posts: [] };
  return {
    files: accessibleFiles(department, person).filter((f) =>
      matchesDisplayText(f.name, query),
    ),
    posts: department.posts.filter((p) =>
      matchesDisplayText([p.text, p.author].join("\n"), query),
    ),
  };
}
export function departmentHref(
  staffId: string,
  departmentId: string,
  tab = "Posts",
) {
  return `/teams?${new URLSearchParams({ staff: staffId, department: departmentCodes[departmentId] || departmentId, tab })}`;
}

const availabilityNames: Record<string, string> = {
  "acquisition-and-direct-engagement": "Maya",
  "marketing-insight-and-performance": "Taylor",
  "editorial-and-content": "Alex",
  "planning-and-analysis": "Sam",
  "procurement-and-supplier-services": "Jordan",
  "strategy-and-performance": "Casey",
  "ceo-office": "Robin",
  "learning-and-capability": "Elena",
};
for (const department of departments)
  for (const unit of department.units)
    unit.calendarItems = unit.calendarItems.map((c) => ({
      ...c,
      person: availabilityNames[unit.id] || "Unit colleague",
      cover:
        (availabilityNames[unit.id] || "Unit colleague") === c.cover
          ? "Maya"
          : c.cover,
    }));

export const departmentCodes: Record<string, string> = {
  "marketing-growth": "mcg",
  communications: "cpa",
  "finance-services": "fcs",
  "strategy-technology": "stt",
  "people-culture": "pac",
  "executive-office": "eao",
};
export function resolveDepartment(value: string | null) {
  return departments.find(
    (d) => d.id === value || departmentCodes[d.id] === value,
  );
}
