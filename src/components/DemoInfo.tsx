import { useId, useRef, useState, type ReactNode } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Popover,
  PopoverSurface,
  PopoverTrigger,
} from "@fluentui/react-components";
import { Info16Regular } from "@fluentui/react-icons";
import { useTranslation } from "../i18n/Language";
import "./demo-info.css";

export const proofOfConceptInfoText =
  "A proof of concept is a simple way to try out an idea and see whether it works. It lets people explore, ask questions and suggest improvements before anything is final.";
/** Small, non-interactive guidance, available on hover, keyboard focus and tap. */
export function DemoInfo({
  label,
  children,
  buttonText,
  className = "",
  displayAsDialog = false,
}: {
  label: string;
  children: ReactNode;
  buttonText?: string;
  className?: string;
  displayAsDialog?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const descriptionId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation();
  if (displayAsDialog) {
    return (
      <span className={`demo-info ${className}`.trim()}>
        <Dialog>
          <DialogTrigger disableButtonEnhancement>
            <button
              type="button"
              className={`demo-info-trigger demo-info-text-trigger${buttonText ? "" : " demo-info-icon-trigger"}`}
              aria-label={t(label)}
              aria-haspopup="dialog"
            >
              {buttonText && <span>{t(buttonText)}</span>}
              <Info16Regular aria-hidden="true" />
            </button>
          </DialogTrigger>
          <DialogSurface className="demo-info-dialog">
            <DialogBody>
              <DialogTitle>{t(buttonText || label)}</DialogTitle>
              <DialogContent>
                <p data-no-translate>
                  {typeof children === "string" ? t(children) : children}
                </p>
              </DialogContent>
              <DialogActions>
                <DialogTrigger disableButtonEnhancement>
                  <Button>{t("Close")}</Button>
                </DialogTrigger>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      </span>
    );
  }
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
