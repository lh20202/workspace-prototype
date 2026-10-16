import { useState } from "react";
import "./integrations.css";
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@fluentui/react-components";
import { Settings20Regular } from "@fluentui/react-icons";
import { staff, type StaffPerson } from "../intranet/catalog";
import type { TeamsGroup } from "./TeamsShell";
import {
  canSeeDepartment,
  canSeeProject,
  canSeeWorkspace,
  isInformationManager,
} from "./visibility";

export default function TeamsAdministration({
  person,
  groups,
}: {
  person: StaffPerson;
  groups: TeamsGroup[];
}) {
  const [open, setOpen] = useState(false);
  const [teamId, setTeamId] = useState(groups[0]?.id || "company");
  const [allowPosts, setAllowPosts] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState("");
  if (!isInformationManager(person)) return null;
  const team = groups.find((g) => g.id === teamId) || groups[0];
  const members = staff.filter((s) =>
    team.id === "company" || team.id === "logistics"
      ? true
      : team.id.startsWith("PRJ-")
        ? canSeeProject(s, team.id)
        : team.id === "emergency"
          ? isInformationManager(s)
          : canSeeDepartment(s, team.id) || canSeeWorkspace(s, team.id),
  );
  return (
    <>
      <button className="m365-teams-admin-button" onClick={() => setOpen(true)}>
        <Settings20Regular /> Manage teams
      </button>
      <Dialog open={open} onOpenChange={(_, data) => setOpen(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Teams administration</DialogTitle>
            <DialogContent>
              <label className="m365-teams-admin-field">
                Team
                <select
                  value={team.id}
                  onChange={(e) => {
                    setTeamId(e.target.value);
                    setSaved("");
                  }}
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </label>
              <h3>Channels</h3>
              <ul className="m365-teams-admin-list">
                {team.channels.map((c) => (
                  <li key={c.id}>
                    <span>{c.label}</span>
                    <small>{c.private ? "Private" : "Standard"}</small>
                  </li>
                ))}
              </ul>
              <h3>Membership</h3>
              <ul className="m365-teams-admin-list">
                {members.map((s) => (
                  <li key={s.id}>
                    <span>{s.name}</span>
                    <small>
                      {isInformationManager(s) ? "Administrator" : "Member"}
                    </small>
                  </li>
                ))}
              </ul>
              <h3>Team settings</h3>
              <label>
                <input
                  type="checkbox"
                  checked={allowPosts[team.id] ?? true}
                  onChange={(e) => {
                    setAllowPosts({
                      ...allowPosts,
                      [team.id]: e.target.checked,
                    });
                    setSaved("");
                  }}
                />{" "}
                Allow members to start conversations
              </label>
              <p>
                Channel administration does not grant access to protected
                records.
              </p>
              {saved && <p role="status">{saved}</p>}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpen(false)}>Close</Button>
              <Button
                appearance="primary"
                onClick={() =>
                  setSaved("Team settings saved for this browser session.")
                }
              >
                Save settings
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
}
