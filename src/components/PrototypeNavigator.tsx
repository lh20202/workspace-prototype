import { resolveDepartment } from "../coordination/data";
import { Warning16Regular } from "@fluentui/react-icons";
import { staff, selectedStaffId, rememberStaff } from "../intranet/catalog";
import { channels } from "../logistics/data";
import {
  canSeeDepartment,
  canSeeLogisticsChannel,
  canSeeProject,
  canSeeWorkspaceChannel,
} from "../teams/visibility";
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
          Full architecture <small>POC</small>
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
                const nextPerson = staff.find(
                  (member) => member.id === e.target.value,
                )!;
                params.set("staff", nextPerson.id);
                let keepContext = true;
                if (location.pathname === "/teams") {
                  const departmentId =
                    params.get("department") || params.get("division");
                  keepContext = departmentId
                    ? canSeeDepartment(
                        nextPerson,
                        resolveDepartment(departmentId)?.id || departmentId,
                      )
                    : canSeeWorkspaceChannel(
                        nextPerson,
                        params.get("workspace") || person.workspace,
                        params.get("channel") || "General",
                      );
                } else if (location.pathname === "/logistics/teams") {
                  const channel = channels.find(
                    (item) => item.id === params.get("channel"),
                  );
                  if (channel && !canSeeLogisticsChannel(nextPerson, channel)) {
                    params.set("channel", "important");
                    params.set("tab", "Posts");
                  }
                } else if (location.pathname.startsWith("/projects/")) {
                  keepContext = canSeeProject(
                    nextPerson,
                    location.pathname
                      .split("/")
                      .find((part) => part.startsWith("PRJ-")) || "",
                  );
                } else if (location.pathname.startsWith("/emergency-response"))
                  keepContext = false;
                location.assign(
                  keepContext
                    ? `${location.pathname}?${params}`
                    : `/teams?staff=${nextPerson.id}`,
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
            <strong>Fictional names & data</strong>
            <small>Changes stay in this browser</small>
          </div>
        </aside>
      </nav>
    </div>
  );
}
