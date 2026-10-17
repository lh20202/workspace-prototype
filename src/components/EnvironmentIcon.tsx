import type { CSSProperties } from "react";
import { Open20Regular, Globe20Regular } from "@fluentui/react-icons";
import "./EnvironmentIcon.css";

/** A compact environment mark, used beside its visible Wiki or Portal name. */
export default function EnvironmentIcon({
  type,
  size = 20,
}: {
  type: "wiki" | "portal";
  size?: number;
}) {
  return (
    <span
      className={`environment-icon environment-icon-${type}`}
      aria-hidden="true"
      style={{ "--environment-icon-size": `${size}px` } as CSSProperties}
    >
      {type === "wiki" ? (
        <>
          <Globe20Regular />
          <span className="environment-icon-letter" data-no-translate>
            W
          </span>
        </>
      ) : (
        <Open20Regular />
      )}
    </span>
  );
}
