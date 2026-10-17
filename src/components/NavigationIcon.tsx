import {
  AppFolder20Regular,
  Archive20Regular,
  BookOpen20Regular,
  Calendar20Regular,
  DocumentOnePage20Regular,
  Folder20Regular,
  Home20Regular,
  List20Regular,
  LockClosed20Regular,
} from "@fluentui/react-icons";

export type NavigationKind =
  | "home"
  | "library"
  | "list"
  | "page"
  | "calendar"
  | "teams"
  | "restricted"
  | "wiki"
  | "portal"
  | "archive";

const icons = {
  home: Home20Regular,
  library: Folder20Regular,
  list: List20Regular,
  page: DocumentOnePage20Regular,
  calendar: Calendar20Regular,
  restricted: LockClosed20Regular,
  wiki: BookOpen20Regular,
  portal: AppFolder20Regular,
  archive: Archive20Regular,
};

/** Local navigation describes the destination type; the adjacent label names it. */
export default function NavigationIcon({ kind }: { kind: NavigationKind }) {
  const style = { width: 20, height: 20, flexShrink: 0 };
  if (kind === "teams")
    return <img src="/images/teams-logo.svg" alt="" style={style} />;
  const Icon = icons[kind];
  return <Icon aria-hidden="true" style={style} />;
}
