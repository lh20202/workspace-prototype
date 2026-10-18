import { resolveDepartment } from "../coordination/data";
import { hasWorkspaceTeams } from "../workspaces/registry";
import { allProjects } from "../projects/data";
import { initialIncidents } from "../executive/incidentData";

export type ChannelEntryContext = {
  kind: "workspace" | "department" | "project" | "incident";
  id: string;
};

function validatedContext(
  kind: string,
  id: string,
): ChannelEntryContext | undefined {
  if (kind === "workspace" && hasWorkspaceTeams(id)) return { kind, id };
  if (kind === "department") {
    const department = resolveDepartment(id);
    if (department) return { kind, id: department.id };
  }
  if (kind === "project" && allProjects.some((project) => project.code === id))
    return { kind, id };
  if (
    kind === "incident" &&
    initialIncidents.some((incident) => incident.id === id)
  )
    return { kind, id };
  return undefined;
}

/** Deliberate entry is URL state; no history, referrer or stored membership inference. */
export function readChannelEntryContext(
  pathname: string,
  search: string,
): ChannelEntryContext | undefined {
  const params = new URLSearchParams(search);
  const explicit = params.get("context");
  if (explicit === "global") return undefined;
  if (explicit) {
    const separator = explicit.indexOf(":");
    return separator > 0
      ? validatedContext(
          explicit.slice(0, separator),
          explicit.slice(separator + 1),
        )
      : undefined;
  }
  // Existing bookmarked destinations also carry a deliberate, deterministic origin.
  const department =
    params.get("departmentPreview") ||
    params.get("department") ||
    params.get("division");
  if (department) return validatedContext("department", department);
  const workspace = params.get("workspace");
  if (workspace) return validatedContext("workspace", workspace);
  const project = pathname.match(
    /^\/projects\/(?:archive\/)?(PRJ-[^/]+)\/teams(?:\/|$)/,
  )?.[1];
  if (project) return validatedContext("project", project);
  const incident = pathname.match(
    /^\/emergency-response\/incidents\/([^/]+)/,
  )?.[1];
  if (incident) return validatedContext("incident", incident);
  if (/^\/logistics\/teams(?:\/|$)/.test(pathname)) {
    const companyIds = [
      "important",
      "bulletin",
      "office",
      "pets",
      "learning",
      "socials",
    ];
    if (!companyIds.includes(params.get("channel") || "general"))
      return { kind: "workspace", id: "logistics" };
  }
  return undefined;
}

export const channelContextValue = (
  context: ChannelEntryContext | undefined,
) => (context ? `${context.kind}:${context.id}` : "global");
