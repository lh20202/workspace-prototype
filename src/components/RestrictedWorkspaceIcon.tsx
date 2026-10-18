import { LockClosed12Filled } from "@fluentui/react-icons";
import WorkspaceIcon from "./WorkspaceIcon";
import "./RestrictedWorkspaceIcon.css";

/** One controlled-workspace mark; this is a signpost, never an access decision. */
export default function RestrictedWorkspaceIcon() {
  return (
    <span
      className="restricted-workspace-icon"
      role="img"
      aria-label="Controlled access"
    >
      <WorkspaceIcon size={20} />
      <LockClosed12Filled
        className="restricted-workspace-badge"
        aria-hidden="true"
      />
    </span>
  );
}
