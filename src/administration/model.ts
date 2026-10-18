import { workspaceDisplayName } from "../workspaces/presentation";
import {
  canAccessArea,
  canAccessWorkspace,
  canManageSiteSettings,
  canAccessWikiArea,
  canAccessProject,
  canAccessProjectSecurityReview,
  canAccessEmergency,
  type PolicyPerson,
} from "../access/policy";
import { environmentRegistry, hubById } from "../workspaces/registry";
import { configById } from "../workspaces/config";
import {
  functionalLibraries,
  functionalLibraryDocuments,
} from "../workspaces/siteArchitecture";
import {
  documents as planningDocuments,
  libraries as planningLibraries,
} from "../data/workspace";
import { planningPath } from "../utils/routes";
import {
  libraries as contentLibraries,
  definitions as contentDefinitions,
  documentFor as contentDocument,
  libraryFor as contentLibrary,
} from "../content/libraries";
import {
  files as contentFiles,
  packages as contentPackages,
  pipelineViews,
  protectedTopics,
  protectedHref,
} from "../content/data";
import {
  libraries as logisticsLibraries,
  files as logisticsFiles,
  permits,
} from "../logistics/data";
import {
  savedViews as logisticsViews,
  locationViews,
} from "../logistics/query";
import {
  libraries as audienceLibraries,
  definitions as audienceDefinitions,
  documentFor as audienceDocument,
  libraryFor as audienceLibrary,
} from "../audience/libraries";
import { files as audienceFiles } from "../audience/data";
import {
  libraries as financeLibraries,
  definitions as financeDefinitions,
  libraryFiles as financialDocuments,
} from "../finance/libraries";
import { protectedSubjects as financeProtectedSubjects } from "../finance/data";
import { areas as financeAreas } from "../finance/data";
import { navigation as executiveNavigation } from "../executive/data";
import { regions } from "../workspaces/archiveData";
import {
  wikiArticles,
  wikiBase,
  wikiFiles,
  wikiLibrary,
  resolveWikiPath,
} from "../wiki/content";
import { libraryFields, libraryViewDefinitions } from "../sharepoint/library";
import type {
  LibraryColumn,
  LibraryContentType,
  LibraryDefinition,
  LibraryDocument,
  LibraryViewDefinition,
} from "../sharepoint/library";
import type { SensitivityLabel } from "../sharepoint/sensitivity";

export interface AdminContent {
  id: string;
  name: string;
  kind: "library" | "list" | "page";
  href: string;
  description?: string;
  items: number;
  modified?: string;
  definition?: LibraryDefinition;
  documents?: LibraryDocument[];
  columns: LibraryColumn[];
  views: LibraryViewDefinition[];
  permissionMode: "inherited" | "unique";
  defaultSensitivity?: SensitivityLabel;
}

export interface SiteAdminModel {
  id: string;
  title: string;
  description: string;
  href: string;
  hubId?: string;
  hubName?: string;
  contents: AdminContent[];
  current?: AdminContent;
  canAccess: boolean;
  canManage: boolean;
  columns: LibraryColumn[];
  contentTypes: LibraryContentType[];
}

const latest = (documents: LibraryDocument[]) =>
  documents
    .map((file) => file.modified || "")
    .sort()
    .at(-1) || undefined;
const columns = (definition?: LibraryDefinition): LibraryColumn[] =>
  libraryFields(definition);
const home = (href: string): AdminContent => ({
  id: "home",
  name: "Home",
  kind: "page",
  href,
  items: 1,
  columns: [],
  views: [],
  permissionMode: "inherited",
});
function libraryContent(
  definition: LibraryDefinition,
  documents: LibraryDocument[],
  href: string,
  permissionMode: AdminContent["permissionMode"] = "inherited",
): AdminContent {
  return {
    id: definition.id,
    name: definition.name,
    description: definition.purpose,
    kind: "library",
    href,
    definition,
    documents,
    items: documents.length,
    modified: latest(documents),
    columns: columns(definition),
    views: libraryViewDefinitions(definition),
    permissionMode,
    defaultSensitivity: definition.defaultSensitivity,
  };
}
const column = (
  key: string,
  label = key,
  type: LibraryColumn["type"] = "text",
): LibraryColumn => ({ key, label, type });

function planningContents(person: PolicyPerson): AdminContent[] {
  const views = [
    "All Documents",
    "Current Planning Cycle",
    "In Review",
    "Approved",
    "By Department",
  ].map((name) => ({ id: name, name }));
  return planningLibraries
    .filter((library) =>
      canAccessArea(
        person,
        "planning",
        library.id === "reporting" ? "performance" : library.id,
      ),
    )
    .map((library) => {
      const documents = planningDocuments
        .filter((file) => file.library === library.id)
        .map((file): LibraryDocument => ({
          id: file.id,
          name: file.name,
          sensitivity: file.sensitivity,
          folder: file.folderPath,
          modified: file.modified,
          owner: file.owner,
          status: file.status,
          versions: file.versions,
          metadata: {
            Cycle: file.cycle,
            type: file.type,
            area: file.area,
            "Record state": file.recordState,
          },
        }));
      const definition: LibraryDefinition = {
        id: library.id,
        name: library.name,
        purpose: library.description,
        columns: [
          column("name", "Name"),
          column("type", "Document type"),
          column("area", "Department"),
          column("status", "Status"),
          column("owner", "Owner"),
          column("sensitivity", "Sensitivity"),
          column("modified", "Modified", "date"),
        ],
        fields: [column("Cycle"), column("Record state")],
        views,
      };
      return libraryContent(
        definition,
        documents,
        planningPath(library.id),
        library.id === "restricted" ? "unique" : "inherited",
      );
    });
}

function logisticsContents(): AdminContent[] {
  const libraries = logisticsLibraries.map((library) =>
    libraryContent(
      {
        id: library.id,
        name: library.name,
        purpose: library.description,
        columns: [
          column("name", "Name"),
          column("campaign", "Campaign"),
          column("type", "Document type"),
          column("status", "Status"),
          column("owner", "Owner"),
          column("sensitivity", "Sensitivity"),
          column("modified", "Modified", "date"),
        ],
        fields: [
          column("Operation"),
          column("Location"),
          column("Valid from", "Valid from", "date"),
          column("Valid to", "Valid to", "date"),
        ],
        views: logisticsViews.map((name) => ({ id: name, name })),
      },
      logisticsFiles
        .filter((file) => file.library === library.id)
        .map((file) => ({
          ...file,
          metadata: {
            campaign: file.campaign,
            type: file.type,
            Operation: file.operation,
            Location: file.location,
            "Valid from": file.validFrom,
            "Valid to": file.validTo,
          },
        })),
      `/logistics/${library.id}`,
    ),
  );
  return [
    ...libraries,
    {
      id: "locations",
      name: "Locations & Permits",
      kind: "list" as const,
      href: "/logistics/locations",
      items: permits.length,
      columns: [
        column("location", "Location"),
        column("campaign", "Campaign"),
        column("region", "City/region"),
        column("date", "Date", "date"),
        column("permit", "Permit status"),
        column("status", "Operational status"),
        column("lead", "Team lead"),
        column("notes", "Notes"),
      ],
      views: locationViews.map((name) => ({ id: name, name })),
      permissionMode: "inherited" as const,
    },
  ];
}

function contentContents(): AdminContent[] {
  return [
    ...contentLibraries.map((library) =>
      libraryContent(
        contentDefinitions[library.id],
        contentFiles
          .filter((file) => contentLibrary(file) === library.id)
          .map(contentDocument),
        `/content-delivery/${library.id}`,
      ),
    ),
    {
      id: "production-register",
      name: "Production Register",
      kind: "list" as const,
      href: "/content-delivery/production-register",
      items: contentPackages.length,
      columns: [
        column("name", "Production"),
        column("lead", "Lead"),
        column("stage", "Stage"),
        column("reviewDue", "Review due", "date"),
        column("releaseDate", "Release", "date"),
      ],
      views: pipelineViews.map((name) => ({ id: name, name })),
      permissionMode: "inherited" as const,
    },
  ];
}

/** Resolves the existing site and its permitted canonical contents. */
export function getSiteAdminModel(
  person: PolicyPerson,
  pathname: string,
  search: string,
): SiteAdminModel | undefined {
  if (pathname.split("/").includes("teams")) return undefined;
  const site = environmentRegistry
    .filter(
      (entry) =>
        pathname === entry.href || pathname.startsWith(`${entry.href}/`),
    )
    .sort((a, b) => b.href.length - a.href.length)[0];
  if (!site || site.environmentType === "portal") return undefined;
  const wiki = site.id === "sales-wiki";
  const workspaceId = wiki ? "audience" : site.id;
  const allowed = canAccessWorkspace(person, workspaceId);
  const params = new URLSearchParams(search);
  const parts = pathname.slice(site.href.length).split("/").filter(Boolean);
  const page = parts[0] || "home";
  const fileId = params.get("document") || params.get("file");
  let denied = !allowed;
  let contents: AdminContent[] = [];
  if (allowed) {
    if (site.id === "planning") {
      contents = planningContents(person);
      denied =
        parts.length > 1 ||
        ![
          "home",
          "cycles",
          ...planningLibraries.map((library) => library.id),
        ].includes(page) ||
        (page === "restricted" &&
          !canAccessArea(person, "planning", "restricted")) ||
        !!planningDocuments.find(
          (file) =>
            file.id === fileId &&
            file.library === "restricted" &&
            !canAccessArea(person, "planning", "restricted"),
        );
    } else if (site.id === "content") {
      contents = contentContents();
      const subject = protectedTopics.find(
        (topic) => protectedHref(topic) === pathname,
      );
      const scopedShare =
        parts.length === 3 &&
        parts[0] === "packages" &&
        parts[2] === "shared" &&
        contentPackages.some((pkg) => pkg.id === parts[1]);
      denied = subject
        ? !canAccessArea(person, "content", subject.id)
        : !scopedShare &&
          (parts.length > 1 ||
            ![
              "home",
              "pipeline",
              "channels",
              "partners",
              "digital",
              "tools",
              "calendar",
              "production-register",
              ...contentLibraries.map((library) => library.id),
            ].includes(page));
    } else if (site.id === "logistics") {
      contents = logisticsContents();
      denied =
        parts.length > 1 ||
        ![
          "home",
          "locations",
          "rota",
          "calendar",
          ...logisticsLibraries.map((library) => library.id),
        ].includes(page);
    } else if (site.id === "audience") {
      contents = audienceLibraries.map((library) =>
        libraryContent(
          audienceDefinitions[library.id],
          audienceFiles
            .filter((file) => audienceLibrary(file) === library.id)
            .map(audienceDocument),
          `${site.href}/${library.id}`,
        ),
      );
      denied =
        pathname ===
        `${site.href}/research/website-usability/participant-administration`
          ? !canAccessArea(person, "audience", "participant-administration")
          : parts.length > 1 ||
            ![
              "home",
              "audiences",
              "decisions",
              "register",
              "automation",
              "calendar",
              ...audienceLibraries.map((library) => library.id),
            ].includes(page);
    } else if (site.id === "finance") {
      contents = financeLibraries.map((library) =>
        libraryContent(
          financeDefinitions[library.id],
          financialDocuments(library),
          `${site.href}/${library.id}`,
        ),
      );
      const subject = financeProtectedSubjects[page]?.find(
        ([id]) => parts.length === 2 && id === parts[1],
      );
      denied = subject
        ? !canAccessArea(person, "finance", subject[0])
        : parts.length > 1 ||
          ![
            "home",
            "calendar",
            "close-checklist",
            "reconciliation-issues",
            "restricted",
            ...financeLibraries.map((library) => library.id),
            ...financeAreas.map((area) => area.id),
          ].includes(page);
    } else if (wiki) {
      denied = !resolveWikiPath(pathname).valid;
      contents = [
        libraryContent(
          wikiLibrary,
          wikiFiles.filter((file) => {
            const article = wikiArticles.find(
              (item) => item.sourceId === file.id,
            );
            return !!article && canAccessWikiArea(person, article.areaId);
          }),
          `${wikiBase}/a-z`,
        ),
      ];
    } else if (site.id === "executive") {
      denied =
        parts.length > 1 ||
        !["home", ...executiveNavigation.map((area) => area.id)].includes(
          page,
        ) ||
        !canAccessArea(person, "executive", page);
    } else {
      const config = configById.get(site.id);
      if (config) {
        contents = (functionalLibraries[site.id] || [])
          .filter((library) =>
            library.areas.some((area) => canAccessArea(person, site.id, area)),
          )
          .map((library) =>
            libraryContent(
              library,
              functionalLibraryDocuments(
                config,
                library,
                typeof person === "string" ? person : person.id,
              ).filter((file) => {
                const source = config.files.find((item) => item.id === file.id);
                return !!source && canAccessArea(person, site.id, source.area);
              }),
              `${site.href}/${library.id}`,
            ),
          );
        const subject = config.protected.find(
          (item) =>
            (parts.length === 1 && item.id === page) ||
            (parts.length === 2 &&
              item.id === parts[1] &&
              (page === "protected" || page === item.area)),
        );
        const area = config.areas.find((item) => item.id === page);
        const requested = config.files.find((file) => file.id === fileId);
        const library = (functionalLibraries[site.id] || []).find(
          (item) =>
            item.id === page ||
            item.aliases?.includes(page) ||
            item.areas.includes(page),
        );
        const validRoute =
          !!subject ||
          (parts.length <= 1 &&
            (page === "home" ||
              !!area ||
              !!library ||
              ["protected", "actions"].includes(page))) ||
          (site.id === "archives" &&
            parts.length === 2 &&
            page === "global" &&
            regions.some((region) => region.id === parts[1]));
        denied = !!(
          !validRoute ||
          (page === "protected" && parts.length > 1 && !subject) ||
          (page === "protected" &&
            !canAccessArea(person, site.id, subject?.id || "protected")) ||
          (subject && !canAccessArea(person, site.id, subject.id)) ||
          (area && !canAccessArea(person, site.id, area.id)) ||
          (requested && !canAccessArea(person, site.id, requested.area))
        );
      }
    }
    if (site.id === "projects" && page !== "home") {
      const projectPage = parts[page === "archive" ? 2 : 1] || "home";
      const projectId = page === "archive" ? parts[1] : page;
      denied = ["control", "support", "reviews"].includes(page)
        ? parts.length !== 1 || !canAccessArea(person, "projects", page)
        : page === "current" || (page === "archive" && !parts[1])
          ? parts.length !== 1
          : parts.length > (page === "archive" ? 3 : 2) ||
            (projectPage === "security"
              ? !canAccessProjectSecurityReview(person, projectId)
              : ![
                  "home",
                  "documents",
                  "plan",
                  "decisions",
                  "risks",
                  "handover",
                ].includes(projectPage) ||
                !canAccessProject(person, projectId));
    }
    if (site.id === "emergency" && page !== "home")
      denied = !canAccessEmergency(person, page);
  }
  if (
    fileId &&
    !contents.some((entry) =>
      entry.documents?.some((file) => file.id === fileId),
    )
  )
    denied = true;
  if (!denied) contents.unshift(home(site.href));
  else contents = [];
  const selectedByFile = fileId
    ? contents.find((entry) =>
        entry.documents?.some((file) => file.id === fileId),
      )
    : undefined;
  const aliases: Record<string, string> =
    site.id === "planning"
      ? { cycles: "planning" }
      : site.id === "content"
        ? {
            pipeline: params.has("view") ? "production-register" : "production",
            digital: "production",
            channels: "creative",
            partners: "creative",
          }
        : site.id === "audience"
          ? { audiences: "research", decisions: "analytics" }
          : wiki
            ? { "a-z": wikiLibrary.id }
            : {};
  const areaLibrary = functionalLibraries[site.id]?.find(
    (library) =>
      library.aliases?.includes(page) || library.areas.includes(page),
  );
  const financeLibrary =
    site.id === "finance"
      ? financeLibraries.find((library) => library.areas.includes(page))
      : undefined;
  const currentId =
    aliases[page] || areaLibrary?.id || financeLibrary?.id || page;
  const current = denied
    ? undefined
    : selectedByFile || contents.find((entry) => entry.id === currentId);
  const uniqueColumns = new Map<string, LibraryColumn>();
  const uniqueTypes = new Map<string, LibraryContentType>();
  for (const content of contents) {
    content.columns.forEach((field) => uniqueColumns.set(field.key, field));
    content.definition?.contentTypes?.forEach((type) =>
      uniqueTypes.set(type.id, type),
    );
  }
  return {
    id: site.id,
    title: workspaceDisplayName(site.id, site.title),
    description: site.description,
    href: site.href,
    hubId: site.hubId,
    hubName: site.hubId ? hubById.get(site.hubId)?.name : undefined,
    contents,
    current,
    canAccess: !denied,
    canManage: !denied && canManageSiteSettings(person, workspaceId),
    columns: [...uniqueColumns.values()],
    contentTypes: [...uniqueTypes.values()],
  };
}

export const resolveAdminContext = getSiteAdminModel;
