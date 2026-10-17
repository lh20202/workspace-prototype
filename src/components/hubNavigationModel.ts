import {
  environmentsForHub,
  environmentById,
  environmentRegistry,
  type WorkspaceDefinition,
} from "../workspaces/registry";
import { withExplicitStaff } from "../utils/staffNavigation";

export interface HubNavigationDestination extends WorkspaceDefinition {
  destinationHref: string;
  isCurrent: boolean;
}

/** Keep the shared menu at environment level, independently of local sections. */
export function getHubNavigationModel({
  workspaceId,
  pathname,
  search = "",
}: {
  workspaceId?: string;
  pathname: string;
  search?: string;
}) {
  // Teams has its own navigation even when its route belongs to a workspace.
  if (pathname.split("/").includes("teams")) return null;
  const current = workspaceId
    ? environmentById.get(workspaceId)
    : environmentRegistry
        .filter(
          (environment) =>
            pathname === environment.href ||
            pathname.startsWith(`${environment.href}/`),
        )
        .sort((a, b) => b.href.length - a.href.length)[0];
  if (!current) return null;
  const siblings = current.hubId
    ? environmentsForHub(current.hubId)
    : [current];
  const destinations = siblings.map((environment) => ({
    ...environment,
    destinationHref: withExplicitStaff(environment.href, search),
    isCurrent: environment.id === current.id,
  }));
  return {
    current,
    workspaces: destinations.filter(
      (environment) => environment.environmentType === "workspace",
    ),
    related: destinations.filter(
      (environment) => environment.environmentType !== "workspace",
    ),
    intranetHref: withExplicitStaff("/architecture", search),
  };
}
