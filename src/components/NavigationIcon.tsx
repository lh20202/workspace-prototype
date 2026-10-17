import EnvironmentIcon from "./EnvironmentIcon";
import TeamsMark from "./TeamsMark";
import AccessLock from "./AccessLock";
import {
  Archive20Regular,
  Calendar20Regular,
  DocumentOnePage20Regular,
  Folder20Regular,
  Home20Regular,
  List20Regular,
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
  archive: Archive20Regular,
};

/** Local navigation describes the destination type; the adjacent label names it. */
export default function NavigationIcon({ kind }: { kind: NavigationKind }) {
  const style = { width: 20, height: 20, flexShrink: 0 };
  if (kind === "teams") return <TeamsMark />;
  if (kind === "wiki" || kind === "portal")
    return <EnvironmentIcon type={kind} />;
  if (kind === "restricted") return <AccessLock size={20} labelled={false} />;
  const Icon = icons[kind];
  return <Icon aria-hidden="true" style={style} />;
}
