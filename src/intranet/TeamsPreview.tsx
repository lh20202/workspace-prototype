import { useState, useEffect } from "react";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
} from "@fluentui/react-components";
import { Dismiss20Regular } from "@fluentui/react-icons";
import { workspaces, staff, rememberStaff, selectedStaffId } from "./catalog";
import {
  files as logisticsFiles,
  type OperationalFile,
} from "../logistics/data";
import { documents as serviceFiles } from "../services/data";
import { files as audienceFiles } from "../audience/data";
import { files as contentFiles } from "../content/data";
import {
  files as financialFiles,
  channels as financeChannels,
  channelFiles,
} from "../finance/data";
import { visibleFiles as executiveFiles } from "../executive/data";
import { documents as planningFiles } from "../data/workspace";
import "./styles.css";
import DivisionChannel from "../coordination/DivisionChannel";
import { divisions, divisionHref } from "../coordination/data";
import "../coordination/styles.css";
const channelMap: Record<string, string[]> = {
  planning: ["General", "Planning coordination", "Reporting"],
  logistics: [
    "General",
    "In-person Operations",
    "Calling Campaigns",
    "Pet photos",
  ],
  services: ["General", "Service coordination", "Purchasing & Suppliers"],
  audience: ["General", "Research coordination", "Audience learning"],
  content: [
    "General",
    "Editorial & Messaging",
    "Creative Production",
    "Digital Delivery",
    "Production Coordination",
  ],
  finance: financeChannels,
  executive: ["General", "Executive Coordination", "Approved Actions"],
};
export const sharedFiles: Record<string, OperationalFile[]> = {
  logistics: logisticsFiles,
  services: serviceFiles,
  audience: audienceFiles,
  content: contentFiles,
  finance: financialFiles,
  executive: executiveFiles("base"),
};
export default function TeamsPreview() {
  const person =
    staff.find(
      (s) => s.id === new URLSearchParams(location.search).get("staff"),
    ) ||
    staff.find((s) => s.id === selectedStaffId()) ||
    staff[0];
  useEffect(() => rememberStaff(person.id), [person.id]);
  const division = divisions.find(
    (d) => d.id === new URLSearchParams(location.search).get("division"),
  );
  const workspace = workspaces.find((w) => w.id === person.workspace)!;
  const [channel, setChannel] = useState(
      new URLSearchParams(location.search).get("channel") || "General",
    ),
    [tab, setTab] = useState("Posts"),
    [file, setFile] = useState<OperationalFile>();
  const normalFiles =
    person.workspace === "finance"
      ? channelFiles(channel)
      : sharedFiles[person.workspace] || [];
  return (
    <div className="staff-teams">
      <header className="staff-teams-header">
        <strong>
          <img
            src="/images/teams-logo.svg"
            alt="Teams"
            width="25"
            height="25"
          />{" "}
          Microsoft Teams
        </strong>
        <div className="staff-teams-persona">
          <label>
            Preview as
            <select
              aria-label="Teams staff preview"
              value={person.id}
              onChange={(e) => {
                rememberStaff(e.target.value);
                const p = new URLSearchParams(location.search);
                p.set("staff", e.target.value);
                location.assign(`/teams?${p}`);
              }}
            >
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.role}
                </option>
              ))}
            </select>
          </label>
          {person.name}
          <div className="staff-teams-role">
            {divisions.find((d) => d.id === person.divisionId)?.name} ·{" "}
            {
              divisions
                .find((d) => d.id === person.divisionId)
                ?.units.find((u) => u.id === person.unitId)?.name
            }{" "}
            · Fictional staff preview
          </div>
        </div>
      </header>
      <div className="staff-teams-layout">
        <aside className="staff-teams-sidebar">
          <strong>Teams and channels</strong>
          <h3>{workspace.title}</h3>
          {channelMap[person.workspace].map((c) => (
            <button
              key={c}
              className="staff-teams-channel"
              aria-current={channel === c ? "page" : undefined}
              onClick={() => {
                if (division)
                  location.assign(
                    `/teams?staff=${person.id}&channel=${encodeURIComponent(c)}`,
                  );
                else setChannel(c);
              }}
            >
              {c}
            </button>
          ))}
          <a href={workspace.href}>Open SharePoint workspace ↗</a>
          <a href="/">Back to all workspaces</a>
          <div className="coord-sidebar-team">
            <h3>Division Coordination</h3>
            {divisions.map((d) => (
              <a
                key={d.id}
                className="coord-sidebar-link"
                aria-current={division?.id === d.id ? "page" : undefined}
                href={divisionHref(person.id, d.id)}
              >
                {d.name}
                <small>{d.channelAccess}</small>
              </a>
            ))}
          </div>
        </aside>
        <main className="staff-teams-main">
          {division ? (
            <DivisionChannel
              key={`${division.id}-${person.id}`}
              division={division}
              person={person}
            />
          ) : (
            <>
              <h1>{channel}</h1>
              <nav>
                {["Posts", "Shared"].map((t) => (
                  <button
                    key={t}
                    className="finance-text-link"
                    aria-pressed={tab === t}
                    onClick={() => setTab(t)}
                  >
                    {t}
                  </button>
                ))}
              </nav>
              {tab === "Posts" ? (
                <>
                  <article className="staff-teams-post">
                    <strong>{person.name}</strong>
                    <p>Today’s coordination · {workspace.title}</p>
                    <p>
                      {person.workspace === "finance"
                        ? "Income matching, close dependencies and planning contributions are connected here. Use Shared for the same working files as SharePoint. Sensitive subjects require separate authorisation."
                        : "Keep working updates and handovers together here. The Shared tab opens the same working files as the SharePoint workspace."}
                    </p>
                    <a href={workspace.href}>Continue in the workspace →</a>
                  </article>
                  {person.workspace === "logistics" && (
                    <article className="staff-teams-post">
                      <h2>Explore the full Teams experience</h2>
                      <p>
                        Channels, conversations, shared files, planning and Pet
                        photos.
                      </p>
                      <a
                        href={`/logistics/teams?channel=${channel === "Pet photos" ? "pets" : "general"}&tab=Posts`}
                      >
                        Open interactive logistics Teams →
                      </a>
                    </article>
                  )}
                </>
              ) : (
                <div className="staff-teams-files">
                  <p>Shared files · Original SharePoint objects</p>
                  {person.workspace === "planning"
                    ? planningFiles
                        .filter((f) => f.library !== "restricted")
                        .slice(0, 6)
                        .map((f) => (
                          <a key={f.id} href="/planning">
                            {f.name}
                            <small>Open source workspace ↗</small>
                          </a>
                        ))
                    : normalFiles.slice(0, 8).map((f) => (
                        <button
                          key={f.id}
                          className="staff-teams-file"
                          onClick={() => setFile(f)}
                        >
                          {f.name}
                          <small>
                            {f.owner} · {f.recordState}
                          </small>
                        </button>
                      ))}
                </div>
              )}
              <p className="finance-muted">
                A role-relevant view of shared work. Changing the fictional
                staff preview does not grant access to protected subjects.
              </p>
            </>
          )}
        </main>
      </div>
      <Drawer
        open={!!file}
        onOpenChange={(_, d) => {
          if (!d.open) setFile(undefined);
        }}
      >
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <Button
                icon={<Dismiss20Regular />}
                aria-label="Close file"
                onClick={() => setFile(undefined)}
              />
            }
          >
            SharePoint working file
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
          <h2>{file?.name}</h2>
          <p>Original file ID: {file?.id}</p>
          <p>
            {file?.owner} · {file?.recordState}
          </p>
          <p>
            This is the same canonical working file shown in the SharePoint
            workspace.
          </p>
          <a
            href={
              person.workspace === "finance"
                ? `${workspace.href}/${file?.folder}`
                : workspace.href
            }
          >
            Open SharePoint source →
          </a>
        </DrawerBody>
      </Drawer>
    </div>
  );
}
