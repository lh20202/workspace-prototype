/** All workspace entrances use the same mark in the architecture directory. */
export default function ArchitectureWorkspaceIcon() {
  return (
    <span
      className="architecture-workspace-icon"
      aria-hidden="true"
    >
      <img
        src="/images/workspaces/workspace-chunky.png"
        alt=""
        width={28}
        height={28}
        draggable={false}
      />
    </span>
  );
}
