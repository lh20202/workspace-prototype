import type { SensitivityLabel } from "../sharepoint/sensitivity";
export interface Participant {
  name: string;
  role: string;
}
export interface IncidentFile {
  sensitivity: SensitivityLabel;
  id: string;
  incidentId: string;
  name: string;
}
export interface IncidentAction {
  id: string;
  name: string;
  owner: string;
  priority: string;
  due: string;
  status: string;
  dependency: string;
}
export interface Incident {
  id: string;
  title: string;
  lead: string;
  severity: string;
  started: string;
  status: "Active" | "Monitoring" | "Archived";
  participants: Participant[];
  files: IncidentFile[];
  posts: { author: string; text: string; time: string }[];
  actions: IncidentAction[];
  timeline: { time: string; text: string }[];
  decisions: {
    name: string;
    time: string;
    maker: string;
    rationale: string;
    action: string;
    status: string;
    reference?: string;
  }[];
  closure?: { followup: string; review: string; records: boolean };
}
export const specialistRoles = [
  "Executive lead",
  "Legal adviser",
  "Privacy specialist",
  "IT specialist",
  "People/welfare specialist",
  "Communications adviser",
  "Facilities lead",
  "Operational specialist",
];
export function createIncident(
  id: string,
  title: string,
  lead: string,
  participants: Participant[],
  severity: string,
  started: string,
): Incident {
  const startTime = started.slice(11, 16) || "Now";
  return {
    id,
    title,
    lead,
    severity,
    started,
    status: "Active",
    participants: [
      { name: lead, role: "Response lead" },
      ...participants.filter((p) => p.name !== lead),
    ],
    files: [
      "Initial Situation Brief.docx",
      "Response Actions.xlsx",
      "Decision Log.docx",
      "Impact Assessment.docx",
      "Closure Review.docx",
    ].map((name, i) => ({
      id: `${id}-F${i + 1}`,
      incidentId: id,
      name,
      sensitivity: "Strictly confidential",
    })),
    posts: [
      {
        author: lead,
        text: "The initial response group is in. Keep incident updates here so we have one record.",
        time: startTime,
      },
    ],
    actions: [
      {
        id: `${id}-A1`,
        name: "Confirm service impact",
        owner: lead,
        priority: "High",
        due: "11:30",
        status: "In progress",
        dependency: "Initial assessment",
      },
      {
        id: `${id}-A2`,
        name: "Prepare staff update",
        owner: lead,
        priority: "Normal",
        due: "12:00",
        status: "To do",
        dependency: "Impact confirmation",
      },
      {
        id: `${id}-A3`,
        name: "Review notification requirement",
        owner: lead,
        priority: "High",
        due: "12:30",
        status: "To do",
        dependency: "Specialist review",
      },
      {
        id: `${id}-A4`,
        name: "Confirm temporary operating arrangement",
        owner: lead,
        priority: "High",
        due: "13:00",
        status: "To do",
        dependency: "Executive decision",
      },
      {
        id: `${id}-A5`,
        name: "Document executive decision",
        owner: lead,
        priority: "Normal",
        due: "13:30",
        status: "To do",
        dependency: "Decision reference",
      },
    ],
    timeline: [
      { time: startTime, text: "Incident reported" },
      { time: startTime, text: "Response lead assigned" },
      { time: startTime, text: "Private response channel created" },
      { time: startTime, text: "Initial participants confirmed" },
    ],
    decisions: [],
  };
}
const first = createIncident(
  "INC-104",
  "Critical Service Disruption",
  "Drew Ellis",
  [
    { name: "Devon Park", role: "IT specialist" },
    { name: "Harper Cole", role: "Legal adviser" },
    { name: "Robin Avery", role: "Executive lead" },
  ],
  "Major",
  "2026-10-16T09:05",
);
first.posts.push(
  {
    author: "Devon Park",
    text: "Impact Assessment is in Files. I’ll update it as the service checks come back.",
    time: "10:10",
  },
  {
    author: "Harper Cole",
    text: "I’m checking the notification requirements. I’ll update here once they’re clear.",
    time: "10:20",
  },
  {
    author: "Robin Avery",
    text: "The temporary operating measure needs a decision. I’ll confirm the conditions before we implement it.",
    time: "10:30",
  },
);
first.timeline.push(
  { time: "10:10", text: "Impact assessment uploaded" },
  { time: "10:40", text: "Executive decision reference recorded" },
);
first.decisions.push({
  name: "Temporary operating measure",
  time: "10:40",
  maker: "Avery Quinn",
  rationale: "Maintain continuity while assessment continues.",
  action: "Confirm implementation with response lead",
  status: "Approved with conditions",
  reference: "ED-105",
});
const second = createIncident(
  "INC-107",
  "Safety Response",
  "Alex Rowan",
  [
    { name: "Jamie Ellis", role: "People/welfare specialist" },
    { name: "Cameron Bell", role: "Facilities lead" },
  ],
  "Significant",
  "2026-10-15T09:05",
);
second.status = "Monitoring";
const third = createIncident(
  "INC-099",
  "Closed Response",
  "Robin Avery",
  [{ name: "Jordan Lee", role: "Operational specialist" }],
  "Significant",
  "2026-10-12T09:05",
);
third.status = "Archived";
third.closure = {
  followup: "Approved follow-up assigned outside the temporary channel.",
  review: "Closure review captured.",
  records: true,
};
export const initialIncidents: Incident[] = [first, second, third];
export function updateIncident(
  records: Incident[],
  id: string,
  change: (incident: Incident) => Incident,
) {
  return records.map((x) =>
    x.id === id && x.status !== "Archived" ? change(x) : x,
  );
}
export function addParticipant(incident: Incident, participant: Participant) {
  return incident.status === "Archived" ||
    incident.participants.some((p) => p.name === participant.name)
    ? incident
    : {
        ...incident,
        participants: [...incident.participants, participant],
        timeline: [
          ...incident.timeline,
          { time: "Now", text: `${participant.role} added for this response` },
        ],
      };
}
export function closeIncident(
  incident: Incident,
  followup: string,
  review: string,
  records: boolean,
): Incident {
  return incident.status === "Archived"
    ? incident
    : {
        ...incident,
        status: "Archived",
        closure: { followup, review, records },
        timeline: [
          ...incident.timeline,
          {
            time: "Now",
            text: "Response closed · Channel read-only / archived",
          },
        ],
      };
}
