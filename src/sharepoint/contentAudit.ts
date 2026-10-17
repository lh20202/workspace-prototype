/** Development-only inventory. Not imported into the application. */
import {
  documents as planningFiles,
  libraries as planningLibraries,
} from "../data/workspace";
import { files as audienceFiles } from "../audience/data";
import {
  libraries as audienceLibraries,
  definitions as audienceDefinitions,
  libraryFor as audienceLibraryFor,
  documentFor as audienceDocument,
} from "../audience/libraries";
import { files as contentFiles } from "../content/data";
import {
  libraries as contentLibraries,
  definitions as contentDefinitions,
  libraryFor as contentLibraryFor,
  documentFor as contentDocument,
} from "../content/libraries";
import {
  libraries as financialLibraries,
  libraryFiles as financialFiles,
  definitions as financialDefinitions,
} from "../finance/libraries";
import { visibleFiles as executiveFiles } from "../executive/data";
import { executiveDocument, executiveDefinition } from "../executive/libraries";
import {
  files as logisticsFiles,
  libraries as logisticsLibraries,
} from "../logistics/data";
import {
  allProjects,
  projectFiles,
  projectTitle,
  projectLibraryDefinition,
} from "../projects/data";
import { functionalConfigs } from "../workspaces/config";
import {
  functionalLibraries,
  functionalLibraryDocuments,
} from "../workspaces/siteArchitecture";
import {
  auditLibraryFolders,
  type LibraryDefinition,
  type LibraryDocument,
} from "./library";

export interface LibraryAuditSource {
  workspace: string;
  library: string;
  definition?: LibraryDefinition;
  files: LibraryDocument[];
  folders?: string[];
}

/** Protected planning, executive and incident/board libraries are deliberately
 * absent: ordinary discovery must not aggregate their payloads. Their existing
 * role/access tests remain responsible for those boundary-specific surfaces. */
export function ordinaryLibraryAuditSources(): LibraryAuditSource[] {
  return [
    ...planningLibraries
      .filter((library) => library.id !== "restricted")
      .map((library) => ({
        workspace: "Planning",
        library: library.name,
        folders: library.folders,
        files: planningFiles
          .filter((file) => file.library === library.id)
          .map((file) => ({
            id: file.id,
            sensitivity: file.sensitivity,
            name: file.name,
            folder: file.folderPath,
            modified: file.modified,
            owner: file.modifiedBy,
            status: file.status,
            metadata: {
              "Document type": file.type,
              Period: file.cycle,
              Department: file.area,
            },
          })),
      })),
    ...functionalConfigs.flatMap((config) =>
      (functionalLibraries[config.id] ?? []).map((library) => ({
        workspace: config.id,
        library: library.name,
        definition: library,
        files: functionalLibraryDocuments(config, library),
      })),
    ),
    ...audienceLibraries.map((library) => ({
      workspace: "Audience",
      library: library.title,
      definition: audienceDefinitions[library.id],
      files: audienceFiles
        .filter((file) => audienceLibraryFor(file) === library.id)
        .map(audienceDocument),
    })),
    ...contentLibraries.map((library) => ({
      workspace: "Content",
      library: library.title,
      definition: contentDefinitions[library.id],
      files: contentFiles
        .filter((file) => contentLibraryFor(file) === library.id)
        .map(contentDocument),
    })),
    ...financialLibraries.map((library) => ({
      workspace: "Finance",
      library: library.name,
      definition: financialDefinitions[library.id],
      files: financialFiles(library),
    })),
    {
      workspace: "Executive",
      library: "Executive Coordination",
      definition: executiveDefinition("coordination"),
      files: executiveFiles("base").map(executiveDocument),
    },
    ...logisticsLibraries.map((library) => ({
      workspace: "Logistics",
      library: library.name,
      files: logisticsFiles.filter((file) => file.library === library.id),
    })),
    ...allProjects.map((project) => ({
      workspace: "Projects",
      library: projectTitle(project),
      definition: projectLibraryDefinition,
      files: projectFiles(project),
    })),
  ];
}

export function libraryContentAudit() {
  return ordinaryLibraryAuditSources().flatMap((source) =>
    auditLibraryFolders(source.files, source.folders).map((folder) => ({
      workspace: source.workspace,
      library: source.library,
      folder: folder.folder || "Library root",
      documents: folder.count,
      review: folder.flag ?? "",
    })),
  );
}

/** Reproducible review snapshot; thresholds are editorial prompts, not policy. */
export function libraryContentAuditMarkdown() {
  const sources = ordinaryLibraryAuditSources();
  const rows = libraryContentAudit();
  const files = sources.reduce(
    (total, source) => total + source.files.length,
    0,
  );
  const single = rows.filter((row) => row.review === "single").length;
  const empty = rows.filter((row) => row.review === "empty").length;
  const busy = rows.filter((row) => row.review === "busy").length;
  const summary = sources.map((source) => {
    const leaves = auditLibraryFolders(source.files, source.folders);
    const counts = leaves.map((leaf) => leaf.count);
    return `| ${source.workspace} | ${source.library} | ${source.files.length} | ${leaves.length} | ${counts.length ? `${Math.min(...counts)}–${Math.max(...counts)}` : "—"} | ${leaves.filter((leaf) => leaf.flag === "single").length} | ${leaves.filter((leaf) => leaf.flag === "empty").length} | ${leaves.filter((leaf) => leaf.flag === "busy").length} |`;
  });
  return [
    "# SharePoint library content audit",
    "",
    "Development snapshot of the fictional content fixtures. This report is not shown in the application.",
    "",
    `**${sources.length} library contexts · ${files} files · ${rows.length} leaf folders.** Review flags: ${single} single-file folders, ${empty} empty folders and ${busy} folders above 12 files.`,
    "",
    "Counts support a realism review; they are not acceptance quotas or requirements from ISO standards. A single-file folder can be appropriate. No files are generated automatically to satisfy a count.",
    "",
    "| Workspace | Library | Files | Leaf folders | Files per leaf | Single | Empty | Above 12 |",
    "| --- | --- | ---: | ---: | --- | ---: | ---: | ---: |",
    ...summary,
    "",
    "## Review decisions",
    "",
    "- Active functional work has related working sets with varied populations. Library-specific metadata, content types and views are checked separately from counts.",
    "- Planning keeps one current departmental submission per department where that is the actual business object. Historical strategy baselines and small approved/reference sets remain intentionally restrained.",
    "- Each project keeps the same six canonical files: three planning/delivery files, two handover files and one distinct stage-review file. Current and archived project contexts remain separate and membership controls remain in the application.",
    "- Small audience studies, executive coordination, logistics resources and older examples can retain a single focused file. The flags make these decisions visible without manufacturing filler.",
    "- Protected Planning, executive-role, governance and incident payloads are excluded from ordinary aggregated discovery. Protected functional and financial subjects remain access boundaries rather than synthetic personal/case/transaction files. Existing role/access tests continue to check those boundaries.",
    "- Version history represents document evolution. Version-labelled duplicate filenames are rejected by the audit.",
    "",
    "## Reproduce",
    "",
    "Use the project's supported Node 24 runtime:",
    "",
    "```sh",
    "CONTENT_AUDIT=1 CONTENT_AUDIT_REPORT=1 node node_modules/vitest/vitest.mjs run src/sharepoint/contentAudit.test.ts --silent=false --reporter=default",
    "```",
    "",
    "This runs the configuration/boundary checks, prints every leaf folder and refreshes this report. Sparse/busy flags are review information and do not fail the tests on their own.",
    "",
  ].join("\n");
}
