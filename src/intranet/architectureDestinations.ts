import {
  environmentRegistry,
  environmentsForHub,
  type HubId,
  type WorkspaceAccessLevel,
  type WorkspaceDefinition,
} from "../workspaces/registry";

export type ArchitectureDestinationType =
  | "workspace"
  | "workspace-section"
  | "wiki"
  | "portal"
  | "archive"
  | "controlled-environment";

/** Task-oriented signposts; the workspace registry still defines actual sites. */
export interface ArchitectureDestination {
  id: string;
  label: string;
  href: string;
  icon: string;
  hub?: HubId;
  type: ArchitectureDestinationType;
  accessLevel: WorkspaceAccessLevel;
  parentWorkspaceId?: string;
}

const peopleSections = [
  ["culture", "Workforce"],
  ["learning", "Curriculum"],
] as const;

const people = environmentRegistry.find(
  (environment) => environment.id === "people",
)!;

const peopleDestinations: ArchitectureDestination[] = peopleSections.map(
  ([sectionId, label]) => ({
    id: `people-${sectionId}`,
    label,
    href: `${people.href}/${sectionId}`,
    icon: "workspace",
    hub: "personnel",
    type: "workspace-section",
    accessLevel: people.accessLevel,
    parentWorkspaceId: people.id,
  }),
);

function destinationForEnvironment(
  environment: WorkspaceDefinition,
): ArchitectureDestination {
  return {
    id: environment.id,
    label: environment.id === "finance" ? "South" : environment.hubLabel,
    href: environment.href,
    icon: environment.icon,
    hub: environment.hubId,
    type: environment.environmentType,
    accessLevel: environment.accessLevel,
  };
}

/** Signposts reuse existing canonical sites and sections; no copies of their content. */
export const architectureDestinations: ArchitectureDestination[] =
  environmentRegistry.flatMap((environment) =>
    environment.id === "people"
      ? peopleDestinations
      : [destinationForEnvironment(environment)],
  );

export const architectureDestinationById = new Map(
  architectureDestinations.map((destination) => [destination.id, destination]),
);

export const personnelDestinations = {
  normal: peopleDestinations,
  controlled: [
    {
      ...architectureDestinationById.get("employment")!,
      label: "Personnel",
    },
    {
      ...architectureDestinationById.get("welfare")!,
      id: "workers-union",
      label: "Workers' Union",
      href: "/welfare-representation/employee-representation",
      type: "controlled-environment" as const,
      parentWorkspaceId: "welfare",
    },
    {
      ...architectureDestinationById.get("welfare")!,
      label: "Welfare",
      href: "/welfare-representation/welfare-support",
      type: "controlled-environment" as const,
      parentWorkspaceId: "welfare",
    },
  ],
};

export const orgCentralGroups = [
  {
    label: "Direction & assurance",
    ids: ["executive", "planning", "projects", "quality", "legal"],
  },
  { label: "Shared services", ids: ["digital", "services", "archives"] },
];

export const financeJumpLinks = [
  { label: "-> $", href: "/financial-operations/income" },
  { label: "$ ->", href: "/financial-operations/reconciliation" },
  { label: "Value", href: "/financial-operations/planning" },
  { label: "Vault", href: "/financial-operations/treasury" },
];

export function destinationsForHub(id: HubId): ArchitectureDestination[] {
  if (id === "personnel")
    return [
      ...personnelDestinations.normal,
      ...personnelDestinations.controlled,
      ...environmentsForHub(id)
        .filter((environment) => environment.environmentType !== "workspace")
        .map((environment) => architectureDestinationById.get(environment.id)!),
    ];
  return environmentsForHub(id).map((environment) =>
    architectureDestinationById.get(environment.id)!,
  );
}
