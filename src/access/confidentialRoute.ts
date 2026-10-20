import {
  controlledResourceAccess,
  controlledResourceInventory,
  type ControlledResourceDefinition,
} from "./controlledResources";
import { resolveStaffPerson } from "../intranet/catalog";
import { workspaceAccessLevels } from "../workspaces/accessClassification";
import { functionalConfigs } from "../workspaces/config";
import { restrictedLibraries } from "../audience/libraries";
import { strictlyConfidentialFinanceSubjects } from "../finance/protectedReviews";
import { allProjects } from "../projects/data";

function canonicalSensitivity(
  entry: ControlledResourceDefinition,
): "Confidential" | "Strictly confidential" | undefined {
  const resource = entry.resource;
  if (resource?.kind === "workspace")
    return workspaceAccessLevels[resource.workspaceId] ===
      "strictly-confidential"
      ? "Strictly confidential"
      : "Confidential";
  if (resource?.kind === "area") {
    if (resource.workspaceId === "finance")
      return strictlyConfidentialFinanceSubjects.has(resource.areaId)
        ? "Strictly confidential"
        : "Confidential";
    const library = restrictedLibraries.find(
      (item) => item.id === resource.areaId,
    );
    if (library) return library.sensitivity;
    const subject = functionalConfigs
      .find((config) => config.id === resource.workspaceId)
      ?.protected.find((item) => item.id === resource.areaId);
    if (subject)
      return subject.strict ? "Strictly confidential" : "Confidential";
  }
  if (
    resource?.kind === "project" ||
    resource?.kind === "project-team" ||
    resource?.kind === "project-security"
  ) {
    const project = allProjects.find(
      (item) => item.code === resource.projectId,
    );
    return project?.access === "Restricted" ? "Confidential" : undefined;
  }
  return undefined;
}

/** Resolve a restricted page from the canonical controlled-resource register and its classification source. */
export function confidentialClassificationForRoute(
  pathname: string,
  search: string,
  staffId?: string,
) {
  const person = resolveStaffPerson(
    staffId || new URLSearchParams(search).get("staff"),
  );
  const matches = controlledResourceInventory
    .filter((entry) => {
      const url = new URL(entry.href, "https://demo.invalid");
      if (
        url.pathname !== pathname &&
        !pathname.startsWith(url.pathname.replace(/\/$/, "") + "/")
      )
        return false;
      for (const [key, value] of url.searchParams)
        if (new URLSearchParams(search).get(key) !== value) return false;
      return true;
    })
    .sort((a, b) => b.href.length - a.href.length);
  const entry = matches.find(
    (candidate) =>
      canonicalSensitivity(candidate) &&
      controlledResourceAccess(person, candidate),
  );
  return entry ? canonicalSensitivity(entry) : undefined;
}
