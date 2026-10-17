import { migratedPublishingFiles } from "./publishing";

export const moderatorChannel = "Workspace & Wiki Moderators";

/** Compatibility only: the former site and Team have no second content store. */
export function publishingLegacyHref(pathname: string, search = "") {
  const params = new URLSearchParams(search);
  const legacySite = /^\/workspace-publishing(?:\/|$)/.test(pathname);
  const legacyTeam =
    pathname === "/teams" && params.get("workspace") === "publishing";
  if (!legacySite && !legacyTeam) return undefined;
  const fileId = params.get("file") || params.get("document");
  const file = migratedPublishingFiles.find(
    (candidate) => candidate.id === fileId,
  );
  if (legacyTeam || /\/teams(?:\/|$)/.test(pathname)) {
    params.set("workspace", "digital");
    params.set("channel", moderatorChannel);
    if (file) {
      params.set("file", file.id);
      params.set("documentLibrary", "architecture-documents");
      params.set("folder", file.folder);
    }
    return `/teams?${params}`;
  }
  params.delete("workspace");
  if (file) {
    params.set("file", file.id);
    params.delete("document");
    params.set("folder", file.folder);
    params.set("library", "Architecture & Decisions");
  } else if (params.has("folder")) {
    // Early preview links may carry the former migration grouping prefix.
    params.set(
      "folder",
      params.get("folder")!.replace(/^Workspace coordination\//, ""),
    );
    if (params.get("folder") === "Workspace coordination")
      params.delete("folder");
    params.set("library", "Architecture & Decisions");
  } else {
    params.delete("library");
  }
  const destination = "/digital-tech/architecture-documents";
  return params.size ? `${destination}?${params}` : destination;
}
