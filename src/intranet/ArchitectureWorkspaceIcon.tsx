import { LockClosed16Regular } from "@fluentui/react-icons";

/** The directory's PNG workspace marks; the lock communicates existing access rules. */
export default function ArchitectureWorkspaceIcon({
  controlled = false,
}: {
  controlled?: boolean;
}) {
  return (
    <span
      className="architecture-workspace-icon"
      data-access={controlled ? "controlled" : "ordinary"}
      role={controlled ? "img" : undefined}
      aria-label={controlled ? "Controlled access" : undefined}
      aria-hidden={controlled ? undefined : true}
    >
      <img
        src={`/images/workspaces/workspace-chunky${controlled ? "-red" : ""}.png`}
        alt=""
        width={28}
        height={28}
        draggable={false}
      />
      {controlled && (
        <LockClosed16Regular
          className="architecture-workspace-lock"
          aria-hidden="true"
        />
      )}
    </span>
  );
}
