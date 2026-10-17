import PocAnnotation from "./PocAnnotation";
import { LanguageToggle } from "../i18n/Language";
import { staff, resolveStaffPerson, rememberStaff } from "../intranet/catalog";
import { teamsPreviewHrefForStaff } from "../teams/navigation";
import { withExplicitStaff } from "../utils/staffNavigation";
import { usePreviewRoleContext } from "./PreviewRoleContext";
import "./preview-role.css";
export default function PrototypeNavigator() {
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
          <a href={withExplicitStaff("/")}>← All workspaces</a>
          <a
            href={withExplicitStaff("/architecture")}
            aria-current={
              location.pathname === "/architecture" ? "page" : undefined
            }
          >
            Architecture
          </a>
        </div>
        <PocAnnotation
          title="Fictional names and content"
          className="poc-control-caveat"
          label="Proof of concept: fictional names and data"
        />
        <div className="prototype-utilities">
          <div className="preview-role-control">
            <label className="demo-persona" htmlFor="preview-role">
              Preview role
              <select
                id="preview-role"
                ref={preview?.roleSelectorRef}
                className={
                  preview?.roleSelectorHighlighted
                    ? "preview-role-highlighted"
                    : undefined
                }
                aria-label="Preview role"
                title={`${person.role} — ${person.name}`}
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
                    location.assign(
                      `${next.pathname}${next.search}${next.hash}`,
                    );
                  }
                }}
              >
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.role} — {s.name}
                  </option>
                ))}
              </select>
            </label>
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
    </div>
  );
}
