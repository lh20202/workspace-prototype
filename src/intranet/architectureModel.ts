import { architectureSections, hubById } from "../workspaces/registry";
import type { AdminHubId } from "../environments/catalog";
import { currentProjects } from "../projects/data";
import {
  architectureDestinationById,
  destinationsForHub,
  financeJumpLinks,
  orgCentralGroups,
  type ArchitectureDestination,
} from "./architectureDestinations";

export type DirectoryDestination = ArchitectureDestination & {
  description?: string;
};

export interface ArchitectureHubView {
  id: AdminHubId;
  label: string;
  href?: string;
  primary: DirectoryDestination[];
  knowledge: DirectoryDestination[];
  secondary: DirectoryDestination[];
}

/** Presentation grouping only. Names, routes and access still belong to their registries. */
export const architectureHubViews: ArchitectureHubView[] =
  architectureSections.map((section) => {
    if (section.type === "workspace") {
      const site = architectureDestinationById.get(section.id)!;
      return {
        id: "finance",
        label: site.label,
        href: site.href,
        primary: financeJumpLinks.map((link) => ({
          ...site,
          ...link,
          id: link.href,
          type: "workspace-section",
          parentWorkspaceId: site.id,
        })),
        knowledge: [],
        secondary: [],
      };
    }
    const hub = hubById.get(section.id)!;
    const destinations = destinationsForHub(hub.id);
    const primary =
      hub.id === "infrastructure"
        ? orgCentralGroups
            .flatMap(({ ids }) => ids)
            .filter((id) => id !== "projects" && id !== "archives")
            .map((id) => architectureDestinationById.get(id)!)
        : destinations.filter(
            ({ type }) => type !== "wiki" && type !== "portal",
          );
    const secondary = destinations.filter(({ type }) => type === "portal");
    if (hub.id === "infrastructure") {
      secondary.push({
        ...architectureDestinationById.get("archives")!,
        type: "archive",
      });
    }
    return {
      id: hub.id,
      label: hub.name,
      primary,
      knowledge: destinations.filter(({ type }) => type === "wiki"),
      secondary,
    };
  });

/** Existing open projects provide useful discovery without surfacing restricted project details. */
export const architectureProjects = currentProjects
  .filter(({ access }) => access === "Open Internal")
  .slice(0, 5);
