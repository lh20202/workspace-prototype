import { Warning16Regular } from "@fluentui/react-icons";
import { staff, selectedStaffId, rememberStaff } from "../intranet/catalog";
export default function PrototypeNavigator() {
  const teams =
    location.pathname === "/teams" || location.pathname.includes("/teams");
  const person =
    staff.find(
      (s) => s.id === new URLSearchParams(location.search).get("staff"),
    ) ||
    staff.find((s) => s.id === selectedStaffId()) ||
    staff[0];
  const emergency = location.pathname.startsWith("/emergency-response");
  return (
    <div className="demo-control-frame">
      <nav
        className="prototype-navigator demo-controls"
        aria-label="Demo controls"
      >
        <span>DEMO CONTROLS</span>
        <a href="/">Home</a>
        <a href="/architecture">
          Full architecture <small>EXPLORATORY BETA</small>
        </a>
        {teams && (
          <label className="demo-persona">
            Preview as
            <select
              aria-label="Teams staff preview"
              value={person.id}
              onChange={(e) => {
                rememberStaff(e.target.value);
                const params = new URLSearchParams(location.search);
                params.set("staff", e.target.value);
                location.assign(`${location.pathname}?${params}`);
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
          <>
            <a href="/executive">Leave response</a>
            <small className="demo-response-note">
              Confidential response simulation · Previewing the selected
              response lead
            </small>
          </>
        )}
        <aside className="demo-caveat" aria-label="Demonstration caveat">
          <Warning16Regular aria-hidden="true" />
          <div>
            <strong>Fictional workspace titles</strong>
            <small>Fictional data · Changes stay in this browser</small>
          </div>
        </aside>
      </nav>
    </div>
  );
}
