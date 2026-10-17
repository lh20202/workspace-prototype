import { canAccessWorkspace, canAccessArea } from "../access/policy";
import PublishingReviewRegister from "./PublishingReviewRegister";
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
import NavigationIcon, {
  type NavigationKind,
} from "../components/NavigationIcon";
import TeamsHomePanel from "../components/TeamsHomePanel";
import SimulationMessage from "../components/SimulationMessage";
import StaffLink from "../components/StaffLink";
import { withExplicitStaff } from "../utils/staffNavigation";
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
import WelfareWorkspace from "./WelfareWorkspace";
import "../services/styles.css";
import "./styles.css";

const networks = [
  "Black, Indigenous & People of Colour Network",
  "LGBTQIA+ Network",
  "Disability & Neurodiversity Network",
  "Parents & Carers Network",
  "Women & Gender Equity Network",
];

const archiveNavigationKinds: Record<string, NavigationKind> = {
  collections: "archive",
  "legacy-drive": "library",
  global: "archive",
  retention: "list",
  transfer: "list",
  cataloguing: "list",
  preservation: "list",
  access: "list",
  projects: "list",
};

export default function FunctionalApp({ id }: { id?: string }) {
  if (
    id === "welfare" ||
    location.pathname.startsWith("/welfare-representation")
  )
    return <WelfareWorkspace />;
  return <StandardFunctionalApp id={id} />;
}

function StandardFunctionalApp({ id: providedId }: { id?: string }) {
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
    page === "actions" ||
    (["quality", "publishing"].includes(workspace.id) && page === "reviews");
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
  const workspaceAllowed = canAccessWorkspace(contextStaff, workspace.id);
  const subjectAllowed =
    !!subject && canAccessArea(contextStaff, workspace.id, subject.id);
  const safeItems = items.filter((item) =>
    canAccessArea(contextStaff, workspace.id, item.area),
  );
  const safeFiles = config.files.filter((file) =>
    canAccessArea(contextStaff, workspace.id, file.area),
  );
  const deniedWorkingArea =
    !subject &&
    (area && !canAccessArea(contextStaff, workspace.id, area.id)
      ? area.id
      : requestedFileArea());
  function requestedFileArea() {
    const id = new URLSearchParams(location.search).get("file");
    const file = config.files.find((candidate) => candidate.id === id);
    if (file && !canAccessArea(contextStaff, workspace.id, file.area))
      return file.area;
    if (
      library &&
      library.areas.every(
        (id) => !canAccessArea(contextStaff, workspace.id, id),
      )
    )
      return library.areas[0];
    return undefined;
  }

  // An explicit preview colleague must survive internal links without changing
  // the identity selected for other workspaces in this browser session.
  function preserveEmploymentPerson(destination: string) {
    const carried = withExplicitStaff(destination);
    if (!/^\/employment-admin(?:[/?#]|$)/.test(carried)) return carried;
    const target = new URL(carried, location.href);
    target.searchParams.set("staff", contextStaffId);
    return `${target.pathname}${target.search}${target.hash}`;
  }
  const homeHref = preserveEmploymentPerson(workspace.href);
  const href = (destination: string) =>
    preserveEmploymentPerson(`${workspace.href}/${destination}`);
  const libraryFiles = (library: FunctionalLibrary) =>
    functionalLibraryDocuments(config, library).filter((file) =>
      safeFiles.some((candidate) => candidate.id === file.id),
    );
  const initialLibraryFolder =
    area && library
      ? config.files
          .find(
            (file) =>
              file.documentLibrary === library.id && file.area === area.id,
          )
          ?.folder.split("/")[0]
      : undefined;
  const fileHref = (fileId: string) =>
    preserveEmploymentPerson(functionalFileHref(config, fileId));
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
    ? preserveEmploymentPerson(
        functionalFileHref(movedFileOwner, requestedFileId),
      )
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
              <StaffLink
                key={id}
                href={
                  id === "freshservice"
                    ? "/service-desk/it-support"
                    : href(`systems/${id}`)
                }
              >
                Open in {t.name} ↗
              </StaffLink>
            );
          })}
          {workspace.id === "services" && l?.areas.includes("purchasing") && (
            <>
              <StaffLink href="/legal-compliance/contracts">
                Contract review ↗
              </StaffLink>
              <StaffLink href="/financial-operations/payments">
                Payments ↗
              </StaffLink>
            </>
          )}
          {workspace.id === "quality" && l?.areas.includes("process") && (
            <StaffLink href="/projects">Project Control & Support ↗</StaffLink>
          )}
          {workspace.id === "customer" && l?.areas.includes("quality") && (
            <StaffLink href="/quality-monitoring/process">
              Process improvement ↗
            </StaffLink>
          )}
          {workspace.id === "digital" && l?.areas.includes("web-crm") && (
            <>
              <StaffLink href="/content-delivery/digital">
                Content requirements ↗
              </StaffLink>
              <StaffLink href="/audience-innovation/automation">
                Marketing automation concepts ↗
              </StaffLink>
            </>
          )}
          {workspace.id === "digital" &&
            l?.areas.includes("information-architecture") && (
              <StaffLink href="/archives/retention">
                Retention requirements ↗
              </StaffLink>
            )}
          {workspace.id === "people" && l?.areas.includes("communications") && (
            <StaffLink href="/digital-tech/m365">
              Publishing platform support ↗
            </StaffLink>
          )}
          {workspace.id === "people" && l?.areas.includes("frameworks") && (
            <StaffLink href="/welfare-representation/approved-consultation">
              Approved consultation outputs ↗
            </StaffLink>
          )}
          {protectedLinks.map((s) => (
            <StaffLink key={s.id} href={href(`${s.area}/${s.id}`)}>
              <LockClosed20Regular />
              {s.name}
            </StaffLink>
          ))}
        </div>
      </details>
    ) : null;
  }
  function actionList() {
    const rows = safeItems.filter(
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
  if (!workspaceAllowed)
    return (
      <div className="app-shell services-app functional-app">
        <StaffLink className="skip-link" href="#functional-main">
          Skip to workspace
        </StaffLink>
        <WorkspaceHeader
          title={workspace.title}
          userName={actor}
          userRole={contextStaff.role}
          searchFiles={[]}
          onOpen={() => {}}
          onMessage={setNotice}
          helpText="Access is limited to authorised participants and remains separate for each protected area."
        />
        <main className="services-main functional-main" id="functional-main">
          {notice && (
            <p role="status" className="functional-notice">
              <SimulationMessage message={notice} />
              <button onClick={() => setNotice("")}>Dismiss</button>
            </p>
          )}
          <AccessBoundary
            workspaceId={workspace.id}
            resource={
              subject
                ? {
                    kind: "area",
                    workspaceId: workspace.id,
                    areaId: subject.id,
                  }
                : deniedWorkingArea
                  ? {
                      kind: "area",
                      workspaceId: workspace.id,
                      areaId: deniedWorkingArea,
                    }
                  : page === "home" || library || area || tool || isList
                    ? { kind: "workspace", workspaceId: workspace.id }
                    : undefined
            }
            area={subject?.name || workspace.title}
            personId={contextStaffId}
            strict={
              subject?.strict ||
              workspace.accessLevel === "strictly-confidential"
            }
            returnHref="/architecture"
            returnLabel="Back to all workspaces"
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
            <StaffLink href="/content-delivery/digital">
              Content requirements ↗
            </StaffLink>
          </p>
          <StaffLink href="/digital-tech/web-crm">
            Leave partner preview →
          </StaffLink>
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
    ? workspace.id === "publishing"
      ? "Environment Review Register"
      : workspace.id === "quality"
        ? "Actions & Reviews"
        : "Follow-up"
    : isCommunityPage
      ? "Staff communities"
      : library?.name || area?.name;
  return (
    <div
      className={`app-shell services-app functional-app ${workspace.id === "archives" ? "archives-app" : ""}`}
      data-workspace={workspace.id}
    >
      <StaffLink className="skip-link" href="#functional-main">
        Skip to workspace
      </StaffLink>
      <WorkspaceHeader
        title={workspace.title}
        userName={actor}
        userRole={contextStaff.role}
        searchFiles={safeFiles}
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
            <StaffLink
              href={homeHref}
              aria-current={page === "home" ? "page" : undefined}
            >
              <NavigationIcon kind="home" />
              Home
            </StaffLink>
            {workspace.id === "archives"
              ? config.areas.map((a) => (
                  <StaffLink
                    key={a.id}
                    href={href(a.id)}
                    aria-current={page === a.id ? "page" : undefined}
                  >
                    <NavigationIcon
                      kind={archiveNavigationKinds[a.id] || "page"}
                    />
                    {a.name}
                  </StaffLink>
                ))
              : siteLibraries.map((l) => (
                  <StaffLink
                    key={l.id}
                    href={href(l.id)}
                    aria-current={
                      library?.id === l.id && !isList && !isCommunityPage
                        ? "page"
                        : undefined
                    }
                  >
                    <NavigationIcon kind="library" />
                    {l.name}
                  </StaffLink>
                ))}
            {workspace.id === "archives" && (
              <StaffLink
                href={href("archive-practice")}
                aria-current={
                  library?.id === "archive-practice" ? "page" : undefined
                }
              >
                <NavigationIcon kind="library" />
                Archive Practice & Transfers
              </StaffLink>
            )}
            {workspace.id === "publishing" && (
              <StaffLink
                href={href("reviews")}
                aria-current={isList ? "page" : undefined}
              >
                <NavigationIcon kind="list" />
                Environment Review Register
              </StaffLink>
            )}
            {workspace.id === "quality" && (
              <StaffLink
                href={href("actions")}
                aria-current={isList ? "page" : undefined}
              >
                <NavigationIcon kind="list" />
                Actions & Reviews
              </StaffLink>
            )}
            {workspace.id === "customer" && (
              <StaffLink
                href={href("actions")}
                aria-current={isList ? "page" : undefined}
              >
                <NavigationIcon kind="list" />
                Follow-up
              </StaffLink>
            )}
            {workspace.id === "people" && (
              <StaffLink
                href={href("communities")}
                aria-current={isCommunityPage && !subject ? "page" : undefined}
              >
                <NavigationIcon kind="page" />
                Staff communities
              </StaffLink>
            )}
            {workspace.id === "employment" && (
              <StaffLink
                href={href("protected/employee-records")}
                aria-current={
                  subject?.id === "employee-records" ? "page" : undefined
                }
              >
                <LockClosed20Regular />
                Employment Records & Contracts
              </StaffLink>
            )}
            {protectedNavigation[workspace.id] && (
              <StaffLink
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
              </StaffLink>
            )}
          </nav>
        </aside>
        <main className="services-main functional-main" id="functional-main">
          <div className="functional-breadcrumb">
            <StaffLink href={homeHref}>Workspace</StaffLink> /{" "}
            {subject
              ? subjectAllowed
                ? subject.name
                : "Access required"
              : tool?.name || (page === "home" ? "Home" : heading)}
          </div>
          {notice && (
            <p role="status" className="functional-notice">
              <SimulationMessage message={notice} />
              <button onClick={() => setNotice("")}>Dismiss</button>
            </p>
          )}
          {(subject && !subjectAllowed) || deniedWorkingArea || !known ? (
            <AccessBoundary
              workspaceId={workspace.id}
              area={
                subject?.name ||
                config.areas.find((a) => a.id === deniedWorkingArea)?.name ||
                "Unavailable location"
              }
              resource={
                subject || deniedWorkingArea
                  ? {
                      kind: "area",
                      workspaceId: workspace.id,
                      areaId: subject?.id || deniedWorkingArea || "",
                    }
                  : undefined
              }
              strict={subject?.strict}
              personId={contextStaffId}
              returnHref={homeHref}
            />
          ) : subject && subjectAllowed ? (
            <section>
              <h1>{subject.name}</h1>
              <p className="functional-intro">
                Controlled working methods for authorised participants.
              </p>
              <p>
                Individual records, credentials and live system data are not
                held in this demonstration.
              </p>
              <DocumentLibrary
                title="Administration working methods"
                headingLevel={2}
                readOnly
                files={config.files
                  .filter((file) =>
                    subject.area === "protected"
                      ? workspace.id === "digital"
                        ? ["operations", "m365"].includes(file.area)
                        : ["employment", "hiring"].includes(file.area)
                      : file.area === subject.area,
                  )
                  .slice(0, 2)
                  .map((file) => ({
                    id: file.id,
                    name: file.name,
                    folder: "Working methods",
                    modified: file.modified,
                    owner: file.owner,
                    status: file.status,
                  }))}
              />
            </section>
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
              <StaffLink href={homeHref}>Back to workspace</StaffLink>
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
                        safeItems.find((item) => item.area === areaId),
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
                    {safeFiles
                      .filter((file) => home.areas.includes(file.area))
                      .sort((a, b) => b.modified.localeCompare(a.modified))
                      .slice(0, 4)
                      .map((file) => (
                        <StaffLink
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
                        </StaffLink>
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
                  {workspace.id === "publishing" && (
                    <PublishingReviewRegister compact />
                  )}
                  <section>
                    <h2>{home.handoffsHeading || "Frequent tasks"}</h2>
                    <div className="functional-home-handoffs">
                      {home.handoffs.map((link) => (
                        <StaffLink
                          key={link.href}
                          href={preserveEmploymentPerson(link.href)}
                        >
                          {link.label}
                          <span aria-hidden="true"> →</span>
                        </StaffLink>
                      ))}
                    </div>
                  </section>
                </aside>
              </div>
            </>
          ) : isList ? (
            <>
              <h1>{heading}</h1>
              {workspace.id === "publishing" ? (
                <PublishingReviewRegister />
              ) : (
                actionList()
              )}
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
                <StaffLink href={href("communities/network-membership")}>
                  <LockClosed20Regular />
                  Private community collaboration
                </StaffLink>
              </p>
              <StaffLink href={href("workforce-documents")}>
                Company event documents →
              </StaffLink>
            </>
          ) : page === "protected" ? (
            <>
              <h1>{protectedHeading[workspace.id] || "Controlled Access"}</h1>
              <div className="functional-protected-links">
                {config.protected.map((s) => (
                  <StaffLink key={s.id} href={href(`${s.area}/${s.id}`)}>
                    <LockClosed20Regular />
                    {s.name}
                  </StaffLink>
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
