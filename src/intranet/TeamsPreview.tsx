import { functionalConfigs, configById } from "../workspaces/config";
import { technicalChannels } from "../workspaces/technicalTeams";
import TechnicalConversation from "../workspaces/TechnicalConversation";
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
import DepartmentChannel from "../coordination/DivisionChannel";
import {
  departments,
  departmentHref,
  resolveDepartment,
} from "../coordination/data";
import "../coordination/styles.css";
import { currentProjects, projectHref, projectTitle } from "../projects/data";
const channelMap: Record<string, string[]> = {
  projects: ["General"],
  planning: ["General", "Planning coordination", "Reporting"],
  logistics: [
    "General",
    "In-person Operations",
    "Calling Campaigns",
    "Pet photos",
  ],
  services: [
    "General",
    "Office & Equipment",
    "Purchasing & Suppliers",
    "Travel",
    "Reception",
  ],
  audience: ["General", "Research coordination", "Audience learning"],
  content: [
    "General",
    "Editorial & Messaging",
    "Creative Production",
    "Digital Content & Experience",
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
for (const cfg of functionalConfigs) {
  channelMap[cfg.id] =
    cfg.id === "digital"
      ? technicalChannels
      : [
          "General",
          ...cfg.areas.filter((a) => a.id !== "protected").map((a) => a.name),
        ];
  sharedFiles[cfg.id] = cfg.files;
}
export default function TeamsPreview() {
  const person =
    staff.find(
      (s) => s.id === new URLSearchParams(location.search).get("staff"),
    ) ||
    staff.find((s) => s.id === selectedStaffId()) ||
    staff[0];
  useEffect(() => rememberStaff(person.id), [person.id]);
  const department = resolveDepartment(
    new URLSearchParams(location.search).get("department") ||
      new URLSearchParams(location.search).get("division"),
  );
  const workspace =
    workspaces.find(
      (w) => w.id === new URLSearchParams(location.search).get("workspace"),
    ) || workspaces.find((w) => w.id === person.workspace)!;
  const [channel, setChannel] = useState(
      new URLSearchParams(location.search).get("channel") || "General",
    ),
    [tab, setTab] = useState("Posts"),
    [file, setFile] = useState<OperationalFile>();
  const normalFiles =
    workspace.id === "finance"
      ? channelFiles(channel)
      : (sharedFiles[workspace.id] || []).filter((f) => {
          if (channel === "General" || !configById.has(workspace.id))
            return true;
          const channelArea =
            workspace.id === "digital"
              ? (
                  {
                    Engineering: "engineering",
                    Innovators: "engineering",
                    "AI Lab": "ai-automation",
                    "Web & CRM DevOps": "web-crm",
                    "M365 & SPFx": "m365",
                    "Architecture & Governance": "architecture",
                    "Platform Operations": "operations",
                  } as Record<string, string>
                )[channel]
              : configById
                  .get(workspace.id)
                  ?.areas.find((a) => a.name === channel)?.id;
          return (f as { area?: string }).area === channelArea;
        });
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
            {departments.find((d) => d.id === person.departmentId)?.name} ·{" "}
            {
              departments
                .find((d) => d.id === person.departmentId)
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
          {channelMap[workspace.id].map((c) => (
            <button
              key={c}
              className="staff-teams-channel"
              aria-current={channel === c ? "page" : undefined}
              onClick={() => {
                if (department)
                  location.assign(
                    `/teams?staff=${person.id}&workspace=${workspace.id}&channel=${encodeURIComponent(c)}`,
                  );
                else setChannel(c);
              }}
            >
              {c}
            </button>
          ))}
          <a href={workspace.href}>Open SharePoint workspace ↗</a>
          <a href="/architecture">Back to all workspaces</a>
          <details className="teams-functional-list">
            <summary>Other functional teams</summary>
            {workspaces
              .filter((w) => w.id !== workspace.id)
              .map((w) => (
                <a
                  key={w.id}
                  href={`/teams?staff=${person.id}&workspace=${w.id}`}
                >
                  {w.title}
                </a>
              ))}
          </details>
          <div className="coord-sidebar-team">
            <h3>Department Teams</h3>
            {departments.map((d) => (
              <a
                key={d.id}
                className="coord-sidebar-link"
                aria-current={department?.id === d.id ? "page" : undefined}
                href={departmentHref(person.id, d.id)}
              >
                {d.name}
                <small>{d.channelAccess}</small>
              </a>
            ))}
          </div>
        </aside>
        <main className="staff-teams-main">
          {department ? (
            <DepartmentChannel
              key={`${department.id}-${person.id}`}
              department={department}
              person={person}
            />
          ) : (
            <>
              {workspace.id === "projects" && (
                <section>
                  <h1>Projects</h1>
                  <p>Open the project’s Teams-connected delivery workspace.</p>
                  {currentProjects.map((p) => (
                    <p key={p.code}>
                      <a href={projectHref(p) + "/teams"}>
                        {projectTitle(p)} · {p.access}
                      </a>
                    </p>
                  ))}
                </section>
              )}
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
              {workspace.id === "digital" &&
              channel === "Security Engineering" ? (
                <section className="functional-denied strict">
                  <h2>Access denied</h2>
                  <p>
                    Security Engineering needs specific technical authorisation.
                    No security or production material is included.
                  </p>
                </section>
              ) : tab === "Posts" ? (
                <>
                  {workspace.id === "digital" ? (
                    <TechnicalConversation channel={channel} />
                  ) : (
                    <article className="staff-teams-post">
                      <strong>{person.name}</strong>
                      <p>Today’s coordination · {workspace.title}</p>
                      <p>
                        {workspace.id === "finance"
                          ? "Income matching, close dependencies and planning contributions are connected here. Use Shared for the same working files as SharePoint. Sensitive subjects require separate authorisation."
                          : "Keep working updates and handovers together here. The Shared tab opens the same working files as the SharePoint workspace."}
                      </p>
                      <a href={workspace.href}>Continue in the workspace →</a>
                    </article>
                  )}
                  {workspace.id === "logistics" && (
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
                  {workspace.id === "planning"
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
          <p>
            {file?.owner} · {file?.recordState}
          </p>
          <a
            href={
              workspace.id === "finance"
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
