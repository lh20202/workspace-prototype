import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
} from "@fluentui/react-components";
import { Open16Regular } from "@fluentui/react-icons";
import { adminLoginSystems, type AdminLoginSystem } from "./adminLoginPlatforms";
import "./admin-logins.css";

/** Third-party products deliberately use their own brands, not workspace marks. */
export default function AdminLogins() {
  const [system, setSystem] = useState<AdminLoginSystem>();
  return (
    <section
      className="directory-admin-logins"
      aria-labelledby="admin-logins-heading"
    >
      <h2 id="admin-logins-heading">Admin logins</h2>
      <div className="directory-admin-list">
        {adminLoginSystems.map((entry) => (
          <button
            type="button"
            key={entry.id}
            onClick={() => setSystem(entry)}
            aria-haspopup="dialog"
          >
            <img src={entry.logo} alt="" width="34" height="34" />
            <span data-no-translate>{entry.name}</span>
            <Open16Regular aria-hidden="true" />
          </button>
        ))}
      </div>
      <Dialog
        open={!!system}
        onOpenChange={(_, data) => {
          if (!data.open) setSystem(undefined);
        }}
      >
        <DialogSurface className="admin-system-simulation">
          {system && (
            <DialogBody>
              <DialogTitle>
                <span className="admin-system-brand">
                  <img src={system.logo} alt="" width="40" height="40" />
                  <span data-no-translate>{system.name}</span>
                </span>
              </DialogTitle>
              <DialogContent>
                <p className="admin-system-purpose">{system.purpose}</p>
                <div className="admin-system-demo-note">
                  Fictional external system. No live connection or sign-in.
                </div>
                <h3>{system.queue}</h3>
                <ul className="admin-system-queue">
                  {system.items.map((item) => (
                    <li key={item}>
                      <span>{item}</span>
                      <small>Demo item</small>
                    </li>
                  ))}
                </ul>
              </DialogContent>
              <DialogActions>
                <Button
                  appearance="primary"
                  onClick={() => setSystem(undefined)}
                >
                  Close
                </Button>
              </DialogActions>
            </DialogBody>
          )}
        </DialogSurface>
      </Dialog>
    </section>
  );
}
