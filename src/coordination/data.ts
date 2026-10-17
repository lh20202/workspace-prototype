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
}
export interface CoordinationPost {
  id: string;
  author: string;
  text: string;
  time: string;
  attachmentId?: string;
  upload?: ThreadUpload;
  moderatorReply?: string;
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
    text: "Latest website conversion analysis is here — interesting drop-off around step three.",
    upload: {
      id: "UP-MKT-01",
      name: "Website Conversion Analysis — October.pptx",
      kind: "Misplaced business upload",
      destination: "/audience-innovation/analytics",
      destinationName:
        "Audience Research & Marketing Insight → Measurement & Analytics",
    },
    reply:
      "Thanks, Jamie — this is the working website conversion analysis. Could you move the file to Measurement & Analytics and link it here? The discussion can stay in this thread, so everyone on the study uses the same working copy. Give me a shout if you need a hand.",
  },
  communications: {
    author: "Alex Morgan",
    text: "Storyboard from today’s review attached — comments welcome.",
    upload: {
      id: "UP-COM-01",
      name: "Service Explainer — Storyboard.pptx",
      kind: "Misplaced business upload",
      destination: "/content-delivery/creative",
      destinationName: "Content Room → Creative & Multimedia",
    },
    reply:
      "Nice one, Alex — this is the storyboard production colleagues are actively reviewing. Could you keep the working version in Creative Production and link it back here? We can carry on discussing it here. Happy to help move it.",
  },
  "finance-services": {
    author: "Sam Patel",
    text: "Updated Q4 scenario assumptions after today’s discussion.",
    upload: {
      id: "UP-FIN-01",
      name: "Q4 Forecast Assumptions.xlsx",
      kind: "Misplaced business upload",
      destination: "/financial-operations/planning",
      destinationName: "Income & Financial Operations → Planning & Analysis",
    },
    reply:
      "Thanks, Sam. As these are the actual Q4 forecast working assumptions, could you move the file to Planning & Analysis rather than department admin? Keep a link in this thread so the conversation stays connected to the working version. Happy to help with the move.",
  },
  "strategy-technology": {
    author: "Casey Blake",
    text: "Updated supplier onboarding checklist from the project discussion.",
    upload: {
      id: "UP-STT-01",
      name: "Supplier Onboarding Checklist.docx",
      kind: "Misplaced business upload",
      destination: "/services/purchasing",
      destinationName: "Organisation Services → Purchasing & Suppliers",
    },
    reply:
      "Thanks, Casey — this is the shared supplier onboarding checklist, rather than our local project meeting admin. Could you move the working file to Purchasing & Suppliers and link it here? Colleagues handling suppliers can then use the same copy. Let me know if you want a hand.",
  },
  "people-culture": {
    author: "Elena Rossi",
    text: "Pilot feedback from the manager capability sessions is attached.",
    upload: {
      id: "UP-PC-01",
      name: "Manager Capability Programme — Pilot Feedback.xlsx",
      kind: "Misplaced business upload",
      destination: "/people-culture/learning",
      destinationName: "People & Culture → Capability & Learning",
    },
    reply:
      "Thanks, Elena — this is the programme evaluation the learning colleagues are working on. Could you move the working file to Capability & Learning and link it here? We can keep the department discussion in this thread. Happy to help with the move.",
  },
  "executive-office": {
    author: "Robin Avery",
    text: "Stage review paper from today’s initiative discussion attached.",
    upload: {
      id: "UP-EX-01",
      name: "PRJ-2026-014 · Customer Platform Renewal — Stage Review.pptx",
      kind: "Misplaced business upload",
      destination: "/projects/PRJ-2026-014/decisions",
      destinationName: "Projects → PRJ-2026-014 · Customer Platform Renewal",
    },
    reply:
      "Thanks, Robin — this is the project stage-review paper. Could you keep the working version in PRJ-2026-014 · Customer Platform Renewal and link its decision reference to Strategic Initiatives? Our meeting coordination can stay in this thread. Happy to help route it to the initiative owner.",
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
        text: "Reminder that unit inputs for the planning cycle are due Friday. The local tracker in Files has been updated.",
        time: "09:10",
        attachmentId: byFolder("Planning Cycle Coordination"),
      },
      {
        id: `${id}-P2`,
        author: colleague,
        text:
          id === "communications"
            ? "Friday lunch is booked for 13:00. Anyone else joining?"
            : "Anyone joining the department lunch on Thursday? I’ve booked a table for 12:30.",
        time: "09:30",
      },
      {
        id: `${id}-P3`,
        author: coordinatorName,
        text: "Agenda for Tuesday’s Unit Directors meeting is up — please add anything you want covered.",
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
        text: "Quick heads-up that a few colleagues are away next week. Cover arrangements are updated.",
        time: "10:25",
        attachmentId: byFolder("Workload & Capacity"),
      },
      {
        id: `${id}-P5`,
        author: coordinatorName,
        text: "Retreat venue shortlist is in Away Days. Please vote by Wednesday.",
        time: "11:00",
        attachmentId: byFolder("Retreats & Away Days"),
      },
      {
        id: `${id}-P6`,
        author: coordinatorName,
        text: "Expense submissions from the conference are due at the end of the week. The submission checklist is in Files.",
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
        text: "The candidate-workflow administration checklist is ready for a process review. It contains no candidate information.",
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
          "Thanks — the shared candidate-workflow administration belongs in Employment & Hiring Administration. Please keep the process checklist there and link it here. Applications, assessments, references and individual decisions must stay in their separately authorised locations. Leadership and culture programmes remain in People & Culture.",
      });
    if (id === "strategy-technology")
      posts.splice(5, 0, {
        id: `${id}-engineering-handoff`,
        author: "Devon Park",
        text: "Shared the next HR-platform interface review notes for the technical release discussion.",
        time: "10:55",
        upload: {
          id: "UP-STT-02",
          name: "HR Platform Interface — Technical Review.docx",
          kind: "Misplaced business upload",
          destination: "/digital-tech/systems-engineering",
          destinationName: "Digital & Technology → Engineering Delivery",
        },
        moderatorReply:
          "Thanks, Devon — the API, authentication and integration work belongs in Digital & Technology. Please keep the technical review there and link it here. Employment & Hiring Administration owns the business process and individual employment records, with their separate access controls.",
      });
    posts.push({
      id: `${id}-P7`,
      author: coordinatorName,
      text: "Summer picnic poll: courtyard or park? Add your activity ideas to the shared note.",
      time: "12:05",
      attachmentId: byFolder("Social & Team Activities"),
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
  return (
    department.channelAccess === "Organisation-wide" ||
    person.departmentId === department.id
  );
}
export function canOpenUnit(
  department: Department,
  unit: Unit,
  person: CoordinationPerson,
) {
  return (
    canOpenDepartment(department, person) &&
    person.departmentId === department.id &&
    (unit.access === "Department-wide" || person.unitId === unit.id)
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
  const q = query.trim().toLowerCase();
  return {
    files: accessibleFiles(department, person).filter((f) =>
      f.name.toLowerCase().includes(q),
    ),
    posts: department.posts.filter((p) =>
      `${p.text} ${p.author}`.toLowerCase().includes(q),
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
