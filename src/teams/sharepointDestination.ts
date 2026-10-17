import { workspaceById } from "../workspaces/registry";
import { configById } from "../workspaces/config";
import {
  libraryForFile,
  functionalLibraryDocuments,
  functionalFileHref,
} from "../workspaces/siteArchitecture";
import { files as audienceFiles } from "../audience/data";
import {
  documentFor as audienceDocument,
  libraryFor as audienceLibrary,
} from "../audience/libraries";
import { files as contentFiles } from "../content/data";
import {
  documentFor as contentDocument,
  libraryFor as contentLibrary,
} from "../content/libraries";
import { files as financeFiles } from "../finance/data";
import {
  financialDocument,
  libraries as financeLibraries,
} from "../finance/libraries";
import { visibleFiles as executiveFiles } from "../executive/data";
import { executiveDocument } from "../executive/libraries";
import { documents as planningFiles } from "../data/workspace";
import { planningPath } from "../utils/routes";

/** Old Teams links still open the same public working document in its owning site. */
export function sharepointDestination(
  workspaceId: string,
  fileId?: string | null,
) {
  const workspace = workspaceById.get(workspaceId);
  if (!workspace) return "/architecture";
  if (!fileId) return workspace.href;
  if (workspaceId === "people") {
    const employment = configById.get("employment");
    if (employment?.files.some((file) => file.id === fileId))
      return functionalFileHref(employment, fileId);
  }
  const config = configById.get(workspaceId);
  if (config) {
    const library = libraryForFile(config, fileId);
    const file =
      library &&
      functionalLibraryDocuments(config, library).find(
        (item) => item.id === fileId,
      );
    if (file)
      return `${workspace.href}/${library!.id}?${new URLSearchParams({ file: file.id, folder: file.folder })}`;
  }
  if (workspaceId === "planning") {
    const file = planningFiles.find(
      (item) => item.id === fileId && item.library !== "restricted",
    );
    if (file)
      return `${planningPath(file.library)}?${new URLSearchParams({ document: file.id, folder: file.folderPath })}`;
  }
  if (workspaceId === "audience") {
    const file = audienceFiles.find((item) => item.id === fileId);
    if (file)
      return `${workspace.href}/${audienceLibrary(file)}?${new URLSearchParams({ file: file.id, folder: audienceDocument(file).folder })}`;
  }
  if (workspaceId === "content") {
    const file = contentFiles.find((item) => item.id === fileId);
    if (file)
      return `${workspace.href}/${contentLibrary(file)}?${new URLSearchParams({ file: file.id, folder: contentDocument(file).folder })}`;
  }
  if (workspaceId === "finance") {
    const file = financeFiles.find((item) => item.id === fileId);
    const library =
      file && financeLibraries.find((item) => item.areas.includes(file.folder));
    if (file && library)
      return `${workspace.href}/${library.id}?${new URLSearchParams({ file: file.id, folder: financialDocument(file).folder })}`;
  }
  if (workspaceId === "executive") {
    const file = executiveFiles("base").find((item) => item.id === fileId);
    if (file)
      return `${workspace.href}/coordination?${new URLSearchParams({ file: file.id, folder: executiveDocument(file).folder })}`;
  }
  // Unknown IDs and protected files are never carried into a normal document route.
  return workspace.href;
}
