import { architectureSections, hubById } from "../workspaces/registry";
import { adminPlatformsForHub, type AdminHubId } from "../environments/catalog";
import { currentProjects } from "../projects/data";
import {
  architectureDestinationById,
  destinationsForHub,
  financeJumpLinks,
  orgCentralGroups,
  type ArchitectureDestination,
} from "./architectureDestinations";

export const architectureLayoutOptions = [
  { value: "workspaces-first", label: "Layout 1" },
  { value: "classic", label: "Layout 2" },
  { value: "directory", label: "Layout 3" },
] as const;
export type ArchitectureLayout =
  (typeof architectureLayoutOptions)[number]["value"];
export const architectureLayoutStorageKey = "architecture-layout-session";

export function readArchitectureLayout(): ArchitectureLayout {
  try {
    const stored = sessionStorage.getItem(architectureLayoutStorageKey);
    return (
      architectureLayoutOptions.find(({ value }) => value === stored)?.value ??
      "workspaces-first"
    );
  } catch {
    return "workspaces-first";
  }
}

export function saveArchitectureLayout(layout: ArchitectureLayout) {
  try {
    sessionStorage.setItem(architectureLayoutStorageKey, layout);
  } catch {
    // Presentation switching still works when browser storage is unavailable.
  }
}

export type LayoutDestination = ArchitectureDestination & {
  description?: string;
  controlledMark?: boolean;
};

/** Brief explanations for the stacked layout, without renaming any destination. */
export const destinationDescriptions: Record<string, string> = {
  audience: "Research & analysis",
  content: "Creative development",
  logistics: "Campaign operations",
  customer: "Customers & clients",
  "sales-wiki": "Open knowledge base",
  "frontline-sales": "Local crew resources",
  "media-library": "Approved media assets",
  executive: "Executive coordination",
  planning: "Strategy & planning",
  quality: "Standards & improvement",
  legal: "Advice & compliance",
  digital: "Technology & development",
  services: "Office support",
  members: "Member resources",
  archives: "Historical records",
  "people-culture": "Culture & inclusion",
  "people-learning": "Learning & development",
  employment: "Employment administration",
  "workers-union": "Employee representation",
  welfare: "Support & safeguarding",
  taskforce: "Global crew resources",
  "/financial-operations/income": "Income & booking",
  "/financial-operations/reconciliation": "Payments & reconciliation",
  "/financial-operations/planning": "Value for money",
  "/financial-operations/treasury": "Cash & treasury",
};
export interface ArchitectureHubView {
  id: AdminHubId;
  label: string;
  href?: string;
  primary: LayoutDestination[];
  knowledge: LayoutDestination[];
  secondary: LayoutDestination[];
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
          // Architecture signposting does not change the underlying Finance permissions.
          controlledMark: true,
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

/** Concise directory copy; product identities and routes still come from the tool registry. */
const toolDescriptions: Record<string, string> = {
  framevia: "Media editing",
  slotline: "Social media planning",
  relovia: "CRM",
  teralink: "IT support",
  recorda: "Invoice approvals",
  pathory: "Project management",
  metriva: "Data analytics",
  peopleharbour: "HR & recruitment",
  velora: "Financial administration",
};

export const architectureTools = [
  ...new Map(
    architectureHubViews
      .flatMap(({ id }) => adminPlatformsForHub(id))
      .map((tool) => [tool.id, tool]),
  ).values(),
].map((tool) => ({
  tool,
  description: toolDescriptions[tool.id] ?? tool.category,
}));

export function architectureToolsForHub(hubId: AdminHubId) {
  return adminPlatformsForHub(hubId).map((tool) => ({
    tool,
    description: toolDescriptions[tool.id] ?? tool.category,
  }));
}
