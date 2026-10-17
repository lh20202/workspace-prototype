import { LockClosed16Regular } from "@fluentui/react-icons";

/** A single restrained lock cue for controlled destinations, independent of business warnings. */
export default function AccessLock({
  size = 16,
  className = "",
  labelled = true,
}: {
  size?: number;
  className?: string;
  labelled?: boolean;
}) {
  return (
    <span
      className={`access-lock ${className}`.trim()}
      role={labelled ? "img" : undefined}
      aria-label={labelled ? "Controlled access" : undefined}
      title={labelled ? "Controlled access" : undefined}
      aria-hidden={labelled ? undefined : true}
      style={{
        display: "inline-flex",
        flexShrink: 0,
        verticalAlign: "middle",
        color: "#626775",
      }}
    >
      <LockClosed16Regular
        aria-hidden="true"
        style={{ width: size, height: size }}
      />
    </span>
  );
}
