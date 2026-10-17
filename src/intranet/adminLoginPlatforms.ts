/** Fictional brands with lightweight local simulations, never external authentication. */
export const adminLoginSystems = [
  {
    id: "teralink",
    name: "Teralink",
    logo: "/images/admin-logins/teralink.svg",
    purpose: "IT & service support",
    queue: "Service requests",
    items: ["Account setup", "Workplace equipment", "Application support"],
  },
  {
    id: "velora",
    name: "Velora",
    logo: "/images/admin-logins/velora.svg",
    purpose: "Financial administration",
    queue: "Administration queue",
    items: ["Payment review", "Monthly reconciliation", "Booking validation"],
  },
  {
    id: "peopleharbour",
    name: "PeopleHarbour",
    logo: "/images/admin-logins/peopleharbour.svg",
    purpose: "Recruitment & personnel",
    queue: "Recruitment administration",
    items: [
      "Hiring request",
      "Interview coordination",
      "Onboarding preparation",
    ],
  },
  {
    id: "recorda",
    name: "Recorda",
    logo: "/images/admin-logins/recorda.svg",
    purpose: "Document workflow & records",
    queue: "Document workflows",
    items: ["Policy approval", "Retention review", "Archive transfer"],
  },
] as const;

export type AdminLoginSystem = (typeof adminLoginSystems)[number];
