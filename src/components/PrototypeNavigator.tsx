import { Info16Regular } from "@fluentui/react-icons";
import PocAnnotation from "./PocAnnotation";
import BetaBadge from "./BetaBadge";
import DemoInfo, { roleAccessInfoText } from "./DemoInfo";
import { LanguageToggle, useTranslation } from "../i18n/Language";
import { staff, resolveStaffPerson, rememberStaff } from "../intranet/catalog";
import { teamsPreviewHrefForStaff } from "../teams/navigation";
import { withExplicitStaff } from "../utils/staffNavigation";
import { usePreviewRoleContext } from "./PreviewRoleContext";
import "./preview-role.css";
export default function PrototypeNavigator() {
  const { t } = useTranslation();
  const emergency = location.pathname.startsWith("/emergency-response");
  const teams =
    location.pathname === "/teams" ||
    location.pathname.includes("/teams") ||
    emergency;
  const person = resolveStaffPerson(
    new URLSearchParams(location.search).get("staff"),
  );
  const preview = usePreviewRoleContext();
  return (
    <div className="demo-control-frame">
      <nav
        className="prototype-navigator poc-controls"
        aria-label="Proof of concept navigation"
      >
        <div className="prototype-links">
          <a href={withExplicitStaff("/")}>← Welcome</a>
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
        </div>
        <div className="prototype-utilities">
          <div className="preview-role-control">
            <div className="preview-role-heading">
              <label htmlFor="preview-role">Explore as</label>
              <span className="preview-role-cue">
                Switch roles to explore access
              </span>
              <DemoInfo label="About role access">
                {roleAccessInfoText}
              </DemoInfo>
            </div>
            <select
              id="preview-role"
              ref={preview?.roleSelectorRef}
              className={
                preview?.roleSelectorHighlighted
                  ? "preview-role-highlighted"
                  : undefined
              }
              aria-label="Preview role"
              title={`${t(person.role)} — ${person.name}`}
              value={person.id}
              onChange={(e) => {
                rememberStaff(e.target.value);
                const nextPerson = staff.find(
                  (member) => member.id === e.target.value,
                )!;
                if (teams) {
                  location.assign(
                    teamsPreviewHrefForStaff(
                      nextPerson,
                      location.pathname,
                      location.search,
                    ),
                  );
                } else {
                  const next = new URL(location.href);
                  next.searchParams.set("staff", nextPerson.id);
                  // Historical per-product role previews cannot override the selected role.
                  next.searchParams.delete("preview");
                  location.assign(`${next.pathname}${next.search}${next.hash}`);
                }
              }}
            >
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {t(s.role)}
                </option>
              ))}
            </select>
          </div>
          {emergency && (
            <div className="response-preview">
              <a href={withExplicitStaff("/executive")}>Leave response</a>
              <PocAnnotation title="Response preview" variant="inline">
                Selected response lead
              </PocAnnotation>
            </div>
          )}
          <LanguageToggle />
        </div>
      </nav>
      <div className="demo-fictional-status" role="note">
        <Info16Regular aria-hidden="true" />
        <span>Fictional names &amp; content</span>
        <span className="demo-fictional-support">No company data used</span>
      </div>
    </div>
  );
}
