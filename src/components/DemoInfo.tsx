import { useId, useRef, useState, type ReactNode } from "react";
import {
  Popover,
  PopoverSurface,
  PopoverTrigger,
} from "@fluentui/react-components";
import { Info16Regular } from "@fluentui/react-icons";
import "./demo-info.css";

export const proofOfConceptInfoText =
  "A proof of concept is a simple way to try out an idea and see whether it works. It lets people explore, ask questions and suggest improvements before anything is final.";
/** Small, non-interactive guidance, available on hover, keyboard focus and tap. */
export function DemoInfo({
  label,
  children,
  buttonText,
  className = "",
}: {
  label: string;
  children: ReactNode;
  buttonText?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const descriptionId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <span className={`demo-info ${className}`.trim()}>
      <Popover
        open={open}
        openOnHover
        mouseLeaveDelay={180}
        unstable_disableAutoFocus
        positioning="below-end"
        onOpenChange={(event, data) => {
          // A click/tap must reveal the information even if hover or focus just opened it.
          const triggerClick =
            event.type === "click" &&
            trigger.current?.contains(event.target as Node);
          setOpen(triggerClick ? true : data.open);
        }}
      >
        <PopoverTrigger disableButtonEnhancement>
          <button
            ref={trigger}
            type="button"
            className={`demo-info-trigger${buttonText ? " demo-info-text-trigger" : ""}`}
            aria-label={label}
            aria-describedby={open ? descriptionId : undefined}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
          >
            {buttonText && <span>{buttonText}</span>}
            <Info16Regular aria-hidden="true" />
          </button>
        </PopoverTrigger>
        <PopoverSurface
          className="demo-info-surface"
          role="tooltip"
          id={descriptionId}
        >
          {children}
        </PopoverSurface>
      </Popover>
    </span>
  );
}
export default DemoInfo;
