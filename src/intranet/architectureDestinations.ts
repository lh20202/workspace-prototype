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
  ["workforce", "Workforce & Organisation", "workforce"],
  ["culture", "Leadership, Culture & Inclusion", "leadership"],
  ["learning", "Learning & Capability", "learning"],
  [
    "communications",
    "Internal Communications & Staff Engagement",
    "communications",
  ],
  ["frameworks", "Reward & Working Conditions", "reward"],
  ["communities", "Staff Communities & Events", "communities"],
] as const;

const people = environmentRegistry.find(
  (environment) => environment.id === "people",
)!;

const peopleDestinations: ArchitectureDestination[] = peopleSections.map(
  ([sectionId, label, icon]) => ({
    id: `people-${sectionId}`,
    label,
    href: `${people.href}/${sectionId}`,
    icon,
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
    label:
      environment.id === "employment"
        ? environment.title
        : environment.hubLabel,
    href: environment.href,
    icon: environment.icon,
    hub: environment.hubId,
    type: environment.environmentType,
    accessLevel: environment.accessLevel,
  };
}

/** Presentation only: six entrances replace one broad People & Culture signpost. */
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
  controlled: ["employment", "welfare"].map((id) =>
    architectureDestinationById.get(id)!,
  ),
};

export function destinationsForHub(id: HubId): ArchitectureDestination[] {
  if (id === "personnel")
    return [
      ...personnelDestinations.normal,
      ...personnelDestinations.controlled,
    ];
  return environmentsForHub(id).map((environment) =>
    architectureDestinationById.get(environment.id)!,
  );
}
