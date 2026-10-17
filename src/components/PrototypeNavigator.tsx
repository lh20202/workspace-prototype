import PocAnnotation from "./PocAnnotation";
import { LanguageToggle } from "../i18n/Language";
import { staff, resolveStaffPerson, rememberStaff } from "../intranet/catalog";
import { teamsPreviewHrefForStaff } from "../teams/navigation";
export default function PrototypeNavigator() {
  const teams =
    location.pathname === "/teams" || location.pathname.includes("/teams");
  const person = resolveStaffPerson(
    new URLSearchParams(location.search).get("staff"),
  );
  const emergency = location.pathname.startsWith("/emergency-response");
  return (
    <div className="demo-control-frame">
      <nav
        className="prototype-navigator poc-controls"
        aria-label="Proof of concept navigation"
      >
        <div className="prototype-links">
          <a href="/">← All workspaces</a>
          <a
            href="/architecture"
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
          {teams && (
            <label className="demo-persona">
              Preview as
              <select
                aria-label="Teams staff preview"
                value={person.id}
                onChange={(e) => {
                  rememberStaff(e.target.value);
                  const nextPerson = staff.find(
                    (member) => member.id === e.target.value,
                  )!;
                  location.assign(
                    teamsPreviewHrefForStaff(
                      nextPerson,
                      location.pathname,
                      location.search,
                    ),
                  );
                }}
              >
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} · {s.role}
                  </option>
                ))}
              </select>
            </label>
          )}
          {emergency && (
            <div className="response-preview">
              <a href="/executive">Leave response</a>
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
