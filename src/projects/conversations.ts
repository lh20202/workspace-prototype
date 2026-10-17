import type { Project } from "./data";

export interface ProjectConversation {
  text: string;
  time: string;
  replies: { author: string; text: string; time: string }[];
}

export interface ProjectHistoricalPost extends ProjectConversation {
  id: string;
  author: string;
}

/** A little prior context in one active Team; archived projects stay unchanged. */
export function projectHistory(
  project: Project,
  channel: string,
): ProjectHistoricalPost[] {
  if (
    project.archived ||
    project.code !== "PRJ-2026-014" ||
    channel !== "General"
  )
    return [];
  return [
    {
      id: "PRJ-2026-014-history-test-group",
      author: "Devon Park",
      time: "2 October 2026, 11:15",
      text: "We've agreed to start acceptance testing with a small adviser group. Maya, could you check who can join? We'll confirm dates once we know the numbers.",
      replies: [
        {
          author: "Maya Chen",
          time: "2 October 2026, 11:32",
          text: "Yes, I'll ask the team leads and bring a short list to the next check-in.",
        },
      ],
    },
  ];
}

// Keep channel copy beside its project context; attachments remain in ProjectsApp.
const currentMessages: Record<string, [string, string, string]> = {
  "PRJ-2026-014": [
    "Can we settle the acceptance-test dates tomorrow? They're the bit still holding up the customer platform plan.",
    "I've updated the delivery plan after today's call. The interface checks still need an owner before we can confirm the handover.",
    "Can we agree who signs off the customer acceptance results? I'd like to record that before testing starts.",
  ],
  "PRJ-2026-021": [
    "Can everyone check the move dates in the plan? I need to confirm them before we book equipment deliveries.",
    "The office-readiness dates are in the delivery plan now. Can someone check we've allowed enough time for equipment setup?",
    "Are we happy to confirm the phased move? If so, I'll record the decision and get the bookings started.",
  ],
  "PRJ-2026-027": [
    "The archive migration is on track. Before the next batch, can we confirm who checks the records that don't transfer cleanly?",
    "The next migration batch is in the plan. I don't want to confirm handover until we've checked the exceptions.",
    "Can we confirm the exception checks before approving the next migration batch? The decision and owner need to be clear.",
  ],
  "PRJ-2026-031": [
    "For the chatbot pilot, can we agree which questions we're testing first? The plan still has that down as an open point.",
    "I've kept the first pilot small in the delivery plan. Can Customer Care check whether the proposed review slot works?",
    "Are we happy with a limited pilot before we expand the test set? I'd like to settle the scope before we build more.",
  ],
  "PRJ-2026-034": [
    "Can we check the gap between hiring confirmation and day-one setup? It's the handoff I most want us to sort out for new starters.",
    "I've marked the hiring, office and IT handoffs in the delivery plan. Can each owner check their step before Thursday?",
    "Who should confirm that a new starter is ready for day one? Let's agree the handoff owner rather than leave three teams chasing it.",
  ],
  "PRJ-2026-038": [
    "The financial close changes are still at risk. Can we review the unresolved dependency before we promise a new date?",
    "I've updated the delivery plan with the outstanding close checks. We need those resolved before confirming the next handover.",
    "Can we decide whether to hold the next change until the close checks are complete? I'd like that recorded before we commit a date.",
  ],
  "PRJ-2026-042": [
    "We're nearly ready to hand the search upgrade over. Can the service owners check the remaining acceptance points in the plan?",
    "The delivery plan is updated for transition. @Devon, can you check the support handoff before we close the remaining actions?",
    "Can we confirm who owns search feedback after handover? That's the last decision I need before recommending closure.",
  ],
  "PRJ-2026-045": [
    "Supplier onboarding is still paused. Can we confirm what's needed to restart before we change any dates in the plan?",
    "I've left the delivery dates on hold. Once the restart decision is made, I'll check availability with Purchasing & Suppliers.",
    "What needs to be resolved before we restart? Let's capture the conditions here so we don't book time against a date we can't keep.",
  ],
};
const projectReplies: Record<
  string,
  Record<string, ProjectConversation["replies"]>
> = {
  "PRJ-2026-014": {
    General: [
      {
        author: "Maya Chen",
        text: "I can check adviser availability this afternoon. Would Tuesday morning work for the technical side?",
        time: "Today, 09:26",
      },
      {
        author: "Devon Park",
        text: "Tuesday works. Let me know the numbers and I'll confirm the slot.",
        time: "Today, 09:33",
      },
    ],
    "Project Delivery": [
      {
        author: "Devon Park",
        text: "I'll take the interface checks. I'll add the owner against that line in the plan.",
        time: "Today, 11:47",
      },
    ],
  },
  "PRJ-2026-027": {
    "Decisions & Actions": [
      {
        author: "Robin Avery",
        text: "Agreed. Bring the exception check back with a named owner before we approve the batch.",
        time: "Today, 14:18",
      },
    ],
  },
  "PRJ-2026-034": {
    General: [
      {
        author: "Jamie Ellis",
        text: "Yes. The admin handoff is clear, but we still need to confirm who checks office and IT readiness.",
        time: "Today, 09:42",
      },
    ],
    "Project Delivery": [
      {
        author: "Jamie Ellis",
        text: "I'll check the hiring step tomorrow. No individual starter details needed in this thread.",
        time: "Today, 12:06",
      },
      {
        author: "Elena Rossi",
        text: "Thanks. Just the handoff steps and owners is enough here.",
        time: "Today, 12:14",
      },
    ],
  },
  "PRJ-2026-042": {
    "Project Delivery": [
      {
        author: "Devon Park",
        text: "I'll check it after lunch. Support ownership needs to be clear before we close it.",
        time: "Today, 12:21",
      },
    ],
  },
};

export function projectConversation(
  project: Project,
  channel: string,
): ProjectConversation {
  const index =
    channel === "Project Delivery"
      ? 1
      : channel === "Decisions & Actions"
        ? 2
        : 0;
  if (project.archived) {
    return {
      text: [
        "We've handed this over and closed the project. The final delivery plan is linked below if you need the background.",
        "Delivery is complete. The final plan records the dates we handed over; any new work should go through the service owner.",
        "The final decisions and actions are recorded below. There are no further project reviews scheduled.",
      ][index],
      time: "30 June 2026, 16:20",
      replies: [],
    };
  }
  return {
    text: currentMessages[project.code][index],
    time: ["Today, 09:16", "Today, 11:38", "Today, 14:03"][index],
    replies: projectReplies[project.code]?.[channel] || [],
  };
}
