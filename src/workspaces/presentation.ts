/** Display names for shared sites and their section entrances.
 * Canonical site identities, routes and access decisions remain separate.
 */
export function workspaceDisplayName(
  id: string,
  title: string,
  section?: string,
) {
  if (id === "people") {
    if (section === "learning" || section === "learning-documents")
      return "Edu";
    if (
      [
        "culture",
        "workforce",
        "workforce-documents",
        "frameworks",
        "analytics",
        "wellbeing",
      ].includes(section || "")
    )
      return "Workforce";
    return "Workforce & Edu";
  }
  if (id === "welfare" && section === "employee-representation")
    return "Council";
  return title;
}
