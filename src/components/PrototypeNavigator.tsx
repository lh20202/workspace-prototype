import { useEffect, useRef, useState } from "react";
import {
  ChevronDown16Regular,
  ChevronUp16Regular,
} from "@fluentui/react-icons";
import PocAnnotation from "./PocAnnotation";
import BetaBadge from "./BetaBadge";
import { useTranslation } from "../i18n/Language";
import WorkspaceFAQ from "./WorkspaceFAQ";
import { withExplicitStaff } from "../utils/staffNavigation";
import { isStandaloneDemo } from "../utils/demoMode";
import IllustrativeContentLabel from "./IllustrativeContentLabel";
import { consumeWelcomeEntry, revealDemoControlsEvent } from "./demoControls";
import "./demo-controls.css";
export default function PrototypeNavigator({
  allowWelcomeInvitation = true,
}: {
  allowWelcomeInvitation?: boolean;
}) {
  const { t } = useTranslation();
  const standalone = isStandaloneDemo();
  const emergency = location.pathname.startsWith("/emergency-response");
  const [expanded, setExpanded] = useState(false);
  const [intro, setIntro] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  const hovered = useRef(false);
  const openedByHover = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const pointerExpanded = useRef<boolean | undefined>(undefined);
  const invited = useRef(false);
  function cancelClose() {
    clearTimeout(closeTimer.current);
  }
  function scheduleClose() {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      if (
        !hovered.current &&
        !frame.current?.contains(document.activeElement)
      ) {
        setExpanded(false);
        openedByHover.current = false;
        setIntro(false);
      }
    }, 450);
  }
  useEffect(() => {
    const reveal = () => setExpanded(true);
    window.addEventListener(revealDemoControlsEvent, reveal);
    let invitation: ReturnType<typeof setTimeout> | undefined;
    if (!invited.current)
      invited.current = allowWelcomeInvitation && consumeWelcomeEntry();
    if (invited.current) {
      // This is a session invitation, not a product onboarding tour.
      invitation = setTimeout(() => {
        setIntro(true);
        setExpanded(true);
        closeTimer.current = setTimeout(() => {
          if (
            !hovered.current &&
            !frame.current?.contains(document.activeElement)
          )
            setExpanded(false);
          setIntro(false);
        }, 4200);
      }, 0);
    }
    return () => {
      clearTimeout(invitation);
      clearTimeout(closeTimer.current);
      window.removeEventListener(revealDemoControlsEvent, reveal);
    };
  }, [allowWelcomeInvitation]);
  return (
    <>
      <div
        ref={frame}
        className={`demo-control-frame demo-controls-reveal${intro ? " demo-controls-intro" : ""}`}
        data-expanded={expanded}
        onPointerEnter={(event) => {
          if (event.pointerType !== "mouse") return;
          hovered.current = true;
          cancelClose();
          if (!expanded) openedByHover.current = true;
          setExpanded(true);
        }}
        onPointerLeave={(event) => {
          if (event.pointerType !== "mouse") return;
          hovered.current = false;
          scheduleClose();
        }}
        onFocusCapture={() => {
          cancelClose();
          setExpanded(true);
        }}
        onBlurCapture={scheduleClose}
      >
        <button
          type="button"
          className="demo-controls-handle"
          aria-label={t("Demo controls")}
          title={t("Demo controls")}
          aria-expanded={expanded}
          aria-controls="demo-controls-panel"
          onPointerDown={() => {
            pointerExpanded.current = expanded;
          }}
          onClick={() => {
            setExpanded(
              openedByHover.current || !(pointerExpanded.current ?? expanded),
            );
            openedByHover.current = false;
            pointerExpanded.current = undefined;
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setExpanded(false);
              event.stopPropagation();
            }
          }}
        >
          {expanded ? <ChevronUp16Regular /> : <ChevronDown16Regular />}
        </button>
        <div
          id="demo-controls-panel"
          className="demo-controls-panel"
          hidden={!expanded}
          onKeyDown={(event) => {
            if (
              event.key === "Escape" &&
              !(event.target as Element).closest("select")
            ) {
              frame.current
                ?.querySelector<HTMLButtonElement>(".demo-controls-handle")
                ?.focus();
              setExpanded(false);
            }
          }}
        >
          <nav
            className="prototype-navigator poc-controls"
            aria-label="Proof of concept navigation"
          >
            <div className="prototype-links">
              <a href={withExplicitStaff("/")}>← Welcome</a>
              {!standalone && (
                <span className="prototype-workspaces-link">
                  <a
                    href={withExplicitStaff("/architecture")}
                    aria-current={
                      location.pathname.replace(/\/+$/, "") === "/architecture"
                        ? "page"
                        : undefined
                    }
                  >
                    All workspaces
                  </a>
                  <BetaBadge compact />
                </span>
              )}
              <WorkspaceFAQ />
            </div>
            <div className="prototype-utilities">
              {emergency && (
                <div className="response-preview">
                  <a href={withExplicitStaff("/executive")}>Leave response</a>
                  <PocAnnotation title="Response preview" variant="inline">
                    Selected response lead
                  </PocAnnotation>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
      <IllustrativeContentLabel />
    </>
  );
}
