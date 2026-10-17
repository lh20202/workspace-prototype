import { useEffect, useState } from "react";
import {
  Button,
  Drawer,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerBody,
} from "@fluentui/react-components";
import { Dismiss20Regular, LockClosed20Regular } from "@fluentui/react-icons";
import WorkspaceHeader from "../logistics/WorkspaceHeader";
import AccessBoundary from "../access/AccessBoundary";
import PocAnnotation, { PocPreviewControls } from "../components/PocAnnotation";
import DocumentLibrary from "../sharepoint/DocumentLibrary";
import DocumentIcon from "../components/DocumentIcon";
import TeamsHomePanel from "../components/TeamsHomePanel";
import SimulationMessage from "../components/SimulationMessage";
import { teamsStaffForWorkspace } from "../teams/navigation";
import { canSeeWorkspaceChannel } from "../teams/visibility";
import { staff } from "../intranet/catalog";
import { workspaceRegistry, workspaceById } from "./registry";
import { configById, functionalConfigs } from "./config";
import type { WorkingItem } from "./types";
import {
  functionalLibraries,
  functionalLibraryDocuments,
  functionalFolder,
  functionalFileHref,
  libraryForFile,
  functionalHomes,
  protectedNavigation,
  protectedHeading,
  type FunctionalLibrary,
} from "./siteArchitecture";
import ArchivePane from "./ArchivePane";
import "../services/styles.css";
import "./styles.css";

const networks = [
  "Black, Indigenous & People of Colour Network",
  "LGBTQIA+ Network",
  "Disability & Neurodiversity Network",
  "Parents & Carers Network",
  "Women & Gender Equity Network",
];

export default function FunctionalApp({ id: providedId }: { id?: string }) {
  const parts = location.pathname.split("/").filter(Boolean);
  const workspace =
    workspaceRegistry.find((w) => w.href === `/${parts[0]}`) ||
    workspaceById.get(providedId || "services")!;
  const config = configById.get(workspace.id)!;
  const page = parts[1] || "home";
  const area = config.areas.find((a) => a.id === page);
  const subject = config.protected.find(
    (s) =>
      (s.id === parts[2] && (page === "protected" || s.area === page)) ||
      (s.id === page && parts[1] !== "home"),
  );
  const tool =
    page === "systems"
      ? config.tools.find((t) => t.id === parts[2])
      : undefined;
  const siteLibraries = functionalLibraries[workspace.id] || [];
  const library = siteLibraries.find(
    (l) =>
      l.id === page ||
      l.aliases?.includes(page) ||
      (workspace.id !== "archives" && l.areas.includes(page)),
  );
  const home = functionalHomes[workspace.id];
  const isList =
    page === "actions" || (workspace.id === "quality" && page === "reviews");
  const isCommunityPage = workspace.id === "people" && page === "communities";
  const [items, setItems] = useState(config.items);
  const [selected, setSelected] = useState<WorkingItem>();
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("");
  const [view, setView] = useState(() => {
    const requested =
      new URLSearchParams(location.search).get("view") || "Current";
    return ["Current", "Needs review", "Complete", "All actions"].includes(
      requested,
    )
      ? requested
      : "Current";
  });
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Record<string, string[]>>({});
  const contextStaffId = teamsStaffForWorkspace(
    workspace.id,
    new URLSearchParams(location.search).get("staff") || undefined,
  );
  const contextStaff = staff.find((person) => person.id === contextStaffId)!;
  const actor = contextStaff.name;
  const href = (destination: string) => `${workspace.href}/${destination}`;
  const libraryFiles = (library: FunctionalLibrary) =>
    functionalLibraryDocuments(config, library);
  const initialLibraryFolder =
    area && library
      ? config.files
          .find(
            (file) =>
              file.documentLibrary === library.id && file.area === area.id,
          )
          ?.folder.split("/")[0]
      : undefined;
  const fileHref = (fileId: string) => functionalFileHref(config, fileId);
  function openSearchFile(id: string) {
    location.assign(fileHref(id));
  }
  const requestedFileId =
    new URLSearchParams(location.search).get("file") || "";
  const requestedFileLibrary = libraryForFile(config, requestedFileId);
  const requestedLibraryTitle = new URLSearchParams(location.search).get(
    "library",
  );
  const movedFileOwner =
    workspace.id === "people" &&
    requestedFileId &&
    !subject &&
    (page === "home" || !!library)
      ? functionalConfigs.find(
          (candidate) =>
            candidate.id === "employment" &&
            candidate.files.some((file) => file.id === requestedFileId),
        )
      : undefined;
  const legacyFileDestination = movedFileOwner
    ? functionalFileHref(movedFileOwner, requestedFileId)
    : parts.length === 2 &&
        library &&
        requestedFileLibrary &&
        (requestedFileLibrary.id !== library.id ||
          (requestedLibraryTitle && requestedLibraryTitle !== library.name))
      ? fileHref(requestedFileId)
      : "";
  useEffect(() => {
    if (legacyFileDestination) location.replace(legacyFileDestination);
  }, [legacyFileDestination]);
  function relatedLinks(l?: FunctionalLibrary) {
    const relevantAreas = area
      ? [area]
      : l
        ? config.areas.filter((a) => l.areas.includes(a.id))
        : [];
    const toolIds = [
      ...new Set(relevantAreas.map((a) => a.tool).filter(Boolean)),
    ];
    const protectedLinks = config.protected.filter(
      (s) => !l || l.areas.includes(s.area),
    );
    return toolIds.length > 0 ||
      protectedLinks.length > 0 ||
      (workspace.id === "people" &&
        l?.areas.some((id) => ["communications", "frameworks"].includes(id))) ||
      (workspace.id === "digital" &&
        l?.areas.some((id) =>
          ["web-crm", "information-architecture"].includes(id),
        )) ||
      (workspace.id === "customer" && l?.areas.includes("quality")) ||
      (workspace.id === "quality" && l?.areas.includes("process")) ||
      (workspace.id === "services" && l?.areas.includes("purchasing")) ? (
      <details>
        <summary>Systems & access</summary>
        <div className="functional-context-links">
          {toolIds.map((id) => {
            const t = config.tools.find((x) => x.id === id)!;
            return (
              <a
                key={id}
                href={
                  id === "freshservice"
                    ? "/service-desk/it-support"
                    : href(`systems/${id}`)
                }
              >
                Open in {t.name} ↗
              </a>
            );
          })}
          {workspace.id === "services" && l?.areas.includes("purchasing") && (
            <>
              <a href="/legal-compliance/contracts">Contract review ↗</a>
              <a href="/financial-operations/payments">Payments ↗</a>
            </>
          )}
          {workspace.id === "quality" && l?.areas.includes("process") && (
            <a href="/projects">Project Control & Support ↗</a>
          )}
          {workspace.id === "customer" && l?.areas.includes("quality") && (
            <a href="/quality-monitoring/process">Process improvement ↗</a>
          )}
          {workspace.id === "digital" && l?.areas.includes("web-crm") && (
            <>
              <a href="/content-delivery/digital">Content requirements ↗</a>
              <a href="/audience-innovation/automation">
                Marketing automation concepts ↗
              </a>
            </>
          )}
          {workspace.id === "digital" &&
            l?.areas.includes("information-architecture") && (
              <a href="/archives/retention">Retention requirements ↗</a>
            )}
          {workspace.id === "people" && l?.areas.includes("communications") && (
            <a href="/digital-tech/m365">Publishing platform support ↗</a>
          )}
          {workspace.id === "people" && l?.areas.includes("frameworks") && (
            <a href="/employee-council">Employee Representative Council ↗</a>
          )}
          {protectedLinks.map((s) => (
            <a key={s.id} href={href(`${s.area}/${s.id}`)}>
              <LockClosed20Regular />
              {s.name}
            </a>
          ))}
        </div>
      </details>
    ) : null;
  }
  function actionList() {
    const rows = items.filter(
      (x) =>
        (workspace.id === "quality"
          ? ["monitoring", "reviews"].includes(x.area)
          : ["relationships", "accounts", "meetings"].includes(x.area)) &&
        (view !== "Needs review" || x.status === "Needs review") &&
        (view !== "Complete" || x.status === "Complete") &&
        (view !== "Current" || x.status !== "Complete") &&
        `${x.name} ${x.owner}`.toLowerCase().includes(filter.toLowerCase()),
    );
    return (
      <>
        <div className="functional-toolbar">
          <select
            aria-label="Action view"
            value={view}
            onChange={(e) => setView(e.target.value)}
          >
            {["Current", "Needs review", "Complete", "All actions"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
          <input
            aria-label="Search actions"
            placeholder="Search this list"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className="functional-table">
          <table>
            <thead>
              <tr>
                {["Action", "Owner", "Status", "Due"].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((x) => (
                <tr key={x.id}>
                  <td>
                    <button
                      className="functional-text"
                      onClick={() => setSelected(x)}
                    >
                      {x.name}
                    </button>
                  </td>
                  <td>{x.owner}</td>
                  <td>
                    <select
                      aria-label={`Work status for ${x.name}`}
                      value={x.status}
                      onChange={(e) =>
                        setItems(
                          items.map((i) =>
                            i.id === x.id
                              ? { ...i, status: e.target.value }
                              : i,
                          ),
                        )
                      }
                    >
                      {[
                        "Awaiting input",
                        "In progress",
                        "Needs review",
                        "Approved",
                        "Complete",
                      ].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td>{x.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <p>No actions in this view.</p>}
        </div>
      </>
    );
  }
  if (location.pathname.startsWith("/employee-council"))
    return (
      <div className="council-boundary">
        <header>Employee Representative Council</header>
        <main>
          <AccessBoundary
            workspaceId="council"
            area="Council participation"
            strict
            returnHref="/people-culture/workforce-documents"
            returnLabel="Return to People & Culture"
            personId={contextStaffId}
          />
        </main>
      </div>
    );
  if (
    workspace.id === "digital" &&
    page === "web-crm" &&
    parts[2] === "partner-review"
  )
    return (
      <div className="technical-partner-preview">
        <PocPreviewControls title="Partner preview">
          <span>Digital &amp; Technology</span>
        </PocPreviewControls>
        <main>
          <h1>Web platform implementation review</h1>
          <DocumentLibrary
            title="Approved review documents"
            headingLevel={2}
            files={config.files
              .filter((f) =>
                [
                  "Deployment Checklist.docx",
                  "Integration Architecture.pptx",
                ].includes(f.name),
              )
              .map((f) => ({
                id: f.id,
                name: f.name,
                folder: "Implementation review/Approved material",
                modified: f.modified,
                owner: f.owner,
                status: f.status,
              }))}
            readOnly
          />
          <p>
            <a href="/content-delivery/digital">Content requirements ↗</a>
          </p>
          <a href="/digital-tech/web-crm">Leave partner preview →</a>
        </main>
      </div>
    );
  const known =
    page === "home" ||
    !!area ||
    !!library ||
    !!tool ||
    !!subject ||
    page === "protected" ||
    isList;
  const heading = isList
    ? workspace.id === "quality"
      ? "Actions & Reviews"
      : "Follow-up"
    : isCommunityPage
      ? "Staff communities"
      : library?.name || area?.name;
  return (
    <div
      className={`app-shell services-app functional-app ${workspace.id === "archives" ? "archives-app" : ""}`}
    >
      <a className="skip-link" href="#functional-main">
        Skip to workspace
      </a>
      <WorkspaceHeader
        title={workspace.title}
        userName={actor}
        userRole={contextStaff.role}
        searchFiles={config.files}
        onOpen={(f) => openSearchFile(f.id)}
        onTeams={
          workspace.teams
            ? () =>
                location.assign(
                  `/teams?${new URLSearchParams({ staff: contextStaffId, workspace: workspace.id })}`,
                )
            : undefined
        }
        onMessage={setNotice}
        helpText={workspace.purpose}
      />
      <div className="functional-layout">
        <aside className="sidebar services-sidebar">
          <nav aria-label={`${workspace.title} navigation`}>
            <a
              href={workspace.href}
              aria-current={page === "home" ? "page" : undefined}
            >
              Home
            </a>
            {workspace.id === "archives"
              ? config.areas.map((a) => (
                  <a
                    key={a.id}
                    href={href(a.id)}
                    aria-current={page === a.id ? "page" : undefined}
                  >
                    {a.name}
                  </a>
                ))
              : siteLibraries.map((l) => (
                  <a
                    key={l.id}
                    href={href(l.id)}
                    aria-current={
                      library?.id === l.id && !isList && !isCommunityPage
                        ? "page"
                        : undefined
                    }
                  >
                    {l.name}
                  </a>
                ))}
            {workspace.id === "archives" && (
              <a
                href={href("archive-practice")}
                aria-current={
                  library?.id === "archive-practice" ? "page" : undefined
                }
              >
                Archive Practice & Transfers
              </a>
            )}
            {workspace.id === "quality" && (
              <a
                href={href("actions")}
                aria-current={isList ? "page" : undefined}
              >
                Actions & Reviews
              </a>
            )}
            {workspace.id === "customer" && (
              <a
                href={href("actions")}
                aria-current={isList ? "page" : undefined}
              >
                Follow-up
              </a>
            )}
            {workspace.id === "people" && (
              <a
                href={href("communities")}
                aria-current={isCommunityPage && !subject ? "page" : undefined}
              >
                Staff communities
              </a>
            )}
            {workspace.id === "employment" && (
              <a
                href={href("protected/employee-records")}
                aria-current={
                  subject?.id === "employee-records" ? "page" : undefined
                }
              >
                <LockClosed20Regular />
                Employment Records & Contracts
              </a>
            )}
            {protectedNavigation[workspace.id] && (
              <a
                href={href(
                  workspace.id === "people"
                    ? "communities/network-membership"
                    : "protected",
                )}
                aria-current={
                  workspace.id === "people"
                    ? subject?.id === "network-membership"
                      ? "page"
                      : undefined
                    : page === "protected" && subject?.id !== "employee-records"
                      ? "page"
                      : undefined
                }
              >
                <LockClosed20Regular />
                {protectedNavigation[workspace.id]}
              </a>
            )}
          </nav>
        </aside>
        <main className="services-main functional-main" id="functional-main">
          <div className="functional-breadcrumb">
            <a href={workspace.href}>Workspace</a> /{" "}
            {subject
              ? "Access required"
              : tool?.name || (page === "home" ? "Home" : heading)}
          </div>
          {notice && (
            <p role="status" className="functional-notice">
              <SimulationMessage message={notice} />
              <button onClick={() => setNotice("")}>Dismiss</button>
            </p>
          )}
          {subject || !known ? (
            <AccessBoundary
              workspaceId={workspace.id}
              area={subject?.name || "Unavailable location"}
              strict={subject?.strict}
              personId={contextStaffId}
              returnHref={workspace.href}
            />
          ) : tool ? (
            <section className="functional-system">
              <h1>{tool.name}</h1>
              <p>{tool.purpose}</p>
              {tool.id === "github" && (
                <>
                  <h2>
                    {new URLSearchParams(location.search).get("repo") ||
                      "Company Git"}
                  </h2>
                  <p>
                    {new URLSearchParams(location.search).get("kind") ||
                      "Repository"}{" "}
                    {new URLSearchParams(location.search).get("ref") || ""}
                  </p>
                </>
              )}
              <PocAnnotation title="System preview" variant="inline">
                Simulated external destination
              </PocAnnotation>
              <a href={workspace.href}>Back to workspace</a>
            </section>
          ) : workspace.id === "archives" && !library ? (
            <>
              <h1>{page === "home" ? workspace.title : area?.name}</h1>
              <ArchivePane
                page={page}
                region={parts[2]}
                items={items}
                onItem={setSelected}
              />
            </>
          ) : page === "home" && home ? (
            <>
              <div className="functional-home-layout">
                <div>
                  <h1>{workspace.title}</h1>
                  <p className="functional-intro">{workspace.description}</p>
                  <section
                    className="functional-current-work"
                    aria-labelledby="current-work-title"
                  >
                    <h2 id="current-work-title">{home.heading}</h2>
                    <p>{home.context}</p>
                    {home.areas
                      .map((areaId) =>
                        items.find((item) => item.area === areaId),
                      )
                      .filter((item): item is WorkingItem => !!item)
                      .map((item) => (
                        <button
                          key={item.id}
                          className="functional-work-row"
                          onClick={() => setSelected(item)}
                        >
                          <strong>{item.name}</strong>
                          <span>{item.nextAction}</span>
                        </button>
                      ))}
                  </section>
                  <section
                    className="functional-recent"
                    aria-labelledby="recent-documents-title"
                  >
                    <h2 id="recent-documents-title">{home.recentHeading}</h2>
                    {config.files
                      .filter((file) => home.areas.includes(file.area))
                      .sort((a, b) => b.modified.localeCompare(a.modified))
                      .slice(0, 4)
                      .map((file) => (
                        <a
                          key={file.id}
                          className="functional-recent-file"
                          href={fileHref(file.id)}
                        >
                          <DocumentIcon name={file.name} />
                          <span>
                            {file.name}
                            <small>
                              {file.metadata?.Activity ||
                                file.metadata?.Programme ||
                                functionalFolder(file).split("/")[0]}{" "}
                              ·{" "}
                              {new Date(
                                `${file.modified}T12:00:00`,
                              ).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                              })}
                            </small>
                          </span>
                        </a>
                      ))}
                  </section>
                </div>
                <aside className="functional-home-aside">
                  {home.teams && workspace.teams && (
                    <TeamsHomePanel
                      heading={home.teams.heading}
                      description={home.teams.cue}
                      channels={home.teams.channels
                        .filter((channel) =>
                          canSeeWorkspaceChannel(
                            contextStaff,
                            workspace.id,
                            channel,
                          ),
                        )
                        .map((channel) => ({
                          name: channel,
                          href: `/teams?${new URLSearchParams({ staff: contextStaffId, workspace: workspace.id, channel })}`,
                        }))}
                      openHref={`/teams?${new URLSearchParams({ staff: contextStaffId, workspace: workspace.id })}`}
                    />
                  )}
                  <section>
                    <h2>{home.handoffsHeading || "Frequent tasks"}</h2>
                    <div className="functional-home-handoffs">
                      {home.handoffs.map((link) => (
                        <a key={link.href} href={link.href}>
                          {link.label}
                          <span aria-hidden="true"> →</span>
                        </a>
                      ))}
                    </div>
                  </section>
                </aside>
              </div>
            </>
          ) : isList ? (
            <>
              <h1>{heading}</h1>
              {actionList()}
            </>
          ) : isCommunityPage ? (
            <>
              <h1>Staff communities</h1>
              <p>
                Open events and announcements. Contact a network coordinator to
                join.
              </p>
              {networks.map((n) => (
                <p key={n}>{n}</p>
              ))}
              <p>
                <a href={href("communities/network-membership")}>
                  <LockClosed20Regular />
                  Private community collaboration
                </a>
              </p>
              <a href={href("workforce-documents")}>
                Company event documents →
              </a>
            </>
          ) : page === "protected" ? (
            <>
              <h1>{protectedHeading[workspace.id] || "Controlled Access"}</h1>
              <div className="functional-protected-links">
                {config.protected.map((s) => (
                  <a key={s.id} href={href(`${s.area}/${s.id}`)}>
                    <LockClosed20Regular />
                    {s.name}
                  </a>
                ))}
              </div>
            </>
          ) : library ? (
            <>
              <DocumentLibrary
                key={`${library.id}-${page}`}
                title={library.name}
                files={libraryFiles(library)}
                definition={library}
                folders={[
                  ...new Set(
                    libraryFiles(library).map((f) => f.folder.split("/")[0]),
                  ),
                ]}
                initialFolder={initialLibraryFolder}
              />
              {relatedLinks(library)}
            </>
          ) : null}
        </main>
      </div>
      <Drawer
        open={!!selected}
        onOpenChange={(_, d) => {
          if (!d.open) setSelected(undefined);
        }}
      >
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <Button
                icon={<Dismiss20Regular />}
                aria-label="Close action details"
                onClick={() => setSelected(undefined)}
              />
            }
          >
            Action details
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
          {selected && (
            <>
              <h2>{selected.name}</h2>
              <p>
                {selected.owner} · Due {selected.due}
              </p>
              <p>{selected.nextAction}</p>
              <h3>Notes</h3>
              {(comments[selected.id] || []).map((c, i) => (
                <p key={i}>
                  {actor}: {c}
                </p>
              ))}
              <label>
                Add a note
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </label>
              <Button
                disabled={!comment.trim()}
                onClick={() => {
                  setComments({
                    ...comments,
                    [selected.id]: [
                      ...(comments[selected.id] || []),
                      comment.trim(),
                    ],
                  });
                  setComment("");
                }}
              >
                Add note
              </Button>
            </>
          )}
        </DrawerBody>
      </Drawer>
    </div>
  );
}
