import { useEffect, useRef, useState } from "react";
import {
  ChevronDown16Regular,
  ChevronUp16Regular,
  Info16Regular,
} from "@fluentui/react-icons";
import PocAnnotation from "./PocAnnotation";
import BetaBadge from "./BetaBadge";
import DemoInfo, { demoUserInfoText, roleAccessInfoText } from "./DemoInfo";
import { useTranslation } from "../i18n/Language";
import { staff, resolveStaffPerson } from "../intranet/catalog";
import WorkspaceFAQ from "./WorkspaceFAQ";
import { defaultPreviewRoleId, previewRoleGroups } from "../access/policy";
import { withExplicitStaff } from "../utils/staffNavigation";
import { isStandaloneDemo } from "../utils/demoMode";
import { usePreviewRoleContext } from "./PreviewRoleContext";
import "./preview-role.css";
import {
  changePreviewRole,
  consumeWelcomeEntry,
  revealDemoControlsEvent,
} from "./demoControls";
import "./demo-controls.css";
export default function PrototypeNavigator({
  allowWelcomeInvitation = true,
}: {
  allowWelcomeInvitation?: boolean;
}) {
  const { t } = useTranslation();
  const emergency = location.pathname.startsWith("/emergency-response");
  const person = resolveStaffPerson(
    new URLSearchParams(location.search).get("staff"),
  );
  const isDemoUser = person.id === defaultPreviewRoleId;
  const preview = usePreviewRoleContext();
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
            {!isStandaloneDemo() && (
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
            <div className="preview-role-control">
              <div className="preview-role-heading">
                <label htmlFor="preview-role">Preview role</label>
                <span className="preview-role-cue">
                  Switch roles to explore access
                </span>
                <DemoInfo label="About role access">
                  {isDemoUser ? demoUserInfoText : roleAccessInfoText}
                </DemoInfo>
              </div>
              <div className="preview-role-selection">
                <select
                  id="preview-role"
                  ref={preview?.roleSelectorRef}
                  className={
                    preview?.roleSelectorHighlighted
                      ? "preview-role-highlighted"
                      : undefined
                  }
                  aria-label="Preview role"
                  aria-describedby={
                    isDemoUser ? "preview-role-description" : undefined
                  }
                  title={`${t(person.role)} — ${person.name}`}
                  value={person.id}
                  onChange={(e) => changePreviewRole(e.target.value)}
                >
                  {previewRoleGroups.map((group) => (
                    <optgroup key={group.label} label={t(group.label)}>
                      {group.roleIds.map((id) => {
                        const member = staff.find(
                          (candidate) => candidate.id === id,
                        )!;
                        return (
                          <option key={member.id} value={member.id}>
                            {t(member.role)}
                          </option>
                        );
                      })}
                    </optgroup>
                  ))}
                </select>
                {isDemoUser && (
                  <p
                    id="preview-role-description"
                    className="preview-role-description"
                  >
                    {t(demoUserInfoText)}
                  </p>
                )}
              </div>
            </div>
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
        <div className="demo-fictional-status" role="note">
          <Info16Regular aria-hidden="true" />
          <span>Fictional names &amp; content</span>
          <span className="demo-fictional-support">No company data used</span>
        </div>
      </div>
    </div>
  );
}
