import { canAccessWorkspace } from "../access/policy";
import WorkspaceDenied from "../access/WorkspaceDenied";
import { teamsStaffForWorkspace } from "../teams/navigation";
import { resolveStaffPerson } from "../intranet/catalog";
import StaffLink from "../components/StaffLink";
import { withExplicitStaff } from "../utils/staffNavigation";
import { useState, useEffect, type MouseEvent } from "react";
import {
  Button,
  Input,
  Drawer,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerBody,
} from "@fluentui/react-components";
import {
  Home24Regular,
  Folder24Regular,
  Calendar24Regular,
  ArrowRight20Regular,
  ArrowUpRight20Regular,
  Dismiss20Regular,
  LockClosed20Regular,
  Search20Regular,
  ChevronLeft20Regular,
  ChevronRight20Regular,
} from "@fluentui/react-icons";
import WorkspaceHeader from "../logistics/WorkspaceHeader";
import DocumentLibrary from "../sharepoint/DocumentLibrary";
import TeamsHomePanel from "../components/TeamsHomePanel";
import AccessBoundary from "../access/AccessBoundary";
import PocAnnotation from "../components/PocAnnotation";
import {
  title,
  description,
  packages as initialPackages,
  files,
  filesById,
  tools,
  packageHref,
  toolHref,
  queryPackages,
  stages,
  rightsStatuses,
  updateStage,
  partnerShares,
  sharedFiles,
  protectedTopics,
  protectedHref,
  calendarEntries,
  type Package,
  type ContentFile,
  type Rights,
} from "./data";
import "../services/styles.css";
import "./styles.css";
import { contentTeamsHref, visibleContentChannels } from "./channels";
const base = "/content-delivery";
const date = (value: string) =>
  new Date(value + "T12:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
import {
  libraries,
  libraryFor,
  documentFor,
  definitions,
  searchableContentFiles,
} from "./libraries";
const fileLink = (file: ContentFile) =>
  `${base}/${libraryFor(file)}?file=${file.id}`;
export default function ContentApp() {
  const [url, setUrl] = useState(location.pathname + location.search);
  const [packages, setPackages] = useState(initialPackages);
  const [message, setMessage] = useState("");
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Record<string, string[]>>({});
  const [month, setMonth] = useState(new Date(2026, 9, 1));
  const [day, setDay] = useState<string | null>(null);
  useEffect(() => {
    const pop = () => setUrl(location.pathname + location.search);
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, []);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 5000);
    return () => clearTimeout(timer);
  }, [message]);
  const parsed = new URL(url, location.origin);
  const params = parsed.searchParams;
  const parts = parsed.pathname.split("/").filter(Boolean);
  const page = parts[1] || "home";
  useEffect(() => {
    const source = new URL(url, location.origin);
    if (source.pathname !== "/content-delivery/teams") return;
    const requestedPerson = source.searchParams.get("staff");
    const personId = requestedPerson
      ? resolveStaffPerson(requestedPerson).id
      : teamsStaffForWorkspace("content");
    const target = new URL(
      contentTeamsHref(
        personId,
        source.searchParams.get("channel") || undefined,
      ),
      location.origin,
    );
    const file = filesById.get(source.searchParams.get("file") || "");
    if (file) {
      target.searchParams.set("tab", "Shared");
      target.searchParams.set("file", file.id);
      target.searchParams.set("documentLibrary", libraryFor(file));
      target.searchParams.set("folder", documentFor(file).folder);
    }
    location.replace(target.pathname + target.search);
  }, [url]);
  const pkg = (id: string) => packages.find((item) => item.id === id)!;
  const routePackage =
    page === "packages"
      ? packages.find((item) => item.id === parts[2])
      : undefined;
  const share =
    parts[3] === "shared"
      ? partnerShares.find((item) => item.packageId === routePackage?.id)
      : undefined;
  const topic = protectedTopics.find(
    (item) => protectedHref(item) === parsed.pathname,
  );
  const tool =
    page === "tools" ? tools.find((item) => item.id === parts[2]) : undefined;
  const candidateFile = filesById.get(params.get("file") || "");
  const libraryId =
    candidateFile && !share
      ? libraryFor(candidateFile)
      : page === "pipeline"
        ? "production"
        : page === "channels" || page === "partners"
          ? "creative"
          : page === "digital"
            ? "production"
            : page;
  const activeLibrary = libraries.find((library) => library.id === libraryId);
  const register =
    page === "production-register" ||
    (page === "pipeline" && !!params.get("view"));
  const valid =
    page === "home" ||
    !!activeLibrary ||
    !!topic ||
    !!share ||
    !!tool ||
    ["tools", "teams", "calendar", "production-register"].includes(page);
  const navigate = (href: string, replace = false) => {
    history[replace ? "replaceState" : "pushState"](
      {},
      "",
      withExplicitStaff(href, parsed.search),
    );
    setUrl(location.pathname + location.search);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };
  const intercept = (event: MouseEvent<HTMLDivElement>) => {
    const href = (event.target as HTMLElement)
      .closest("a")
      ?.getAttribute("href");
    if (
      href?.startsWith(base) &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey
    ) {
      event.preventDefault();
      navigate(href);
    }
  };
  const setParams = (values: Record<string, string>, replace = false) => {
    const next = new URLSearchParams(params);
    Object.entries(values).forEach(([key, value]) =>
      value ? next.set(key, value) : next.delete(key),
    );
    navigate(
      parsed.pathname + (next.size ? "?" + next.toString() : ""),
      replace,
    );
  };
  const selected = packages.find((item) => item.id === params.get("package"));
  const search = params.get("search") || "";
  const requestedView = params.get("view") || "All Packages";
  const views = ["All Packages", "In Production", "Needs Review", "Completed"];
  const view = views.includes(requestedView) ? requestedView : "All Packages";
  const rows = queryPackages(
    packages,
    requestedView,
    search,
    params.get("channel") || "",
    params.get("format") || "",
  );
  const patch = (id: string, changes: Partial<Package>) =>
    setPackages(
      packages.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    );
  const openPackage = (id: string) => setParams({ package: id, file: "" });
  const changeStage = (item: Package, value: string) => {
    const next = updateStage(item, value);
    if (next.blockers.length)
      setMessage("Not ready: " + next.blockers.join("; "));
    else
      setPackages(
        packages.map((current) =>
          current.id === item.id ? next.package : current,
        ),
      );
  };
  const refs = (item: Package) => (
    <div className="content-reference-list">
      {item.refs.map((reference) => (
        <StaffLink
          key={reference.tool + reference.id}
          href={toolHref(reference.tool, item.id, reference.id)}
        >
          {tools.find((tool) => tool.id === reference.tool)!.name} ·{" "}
          {reference.id}
          <ArrowUpRight20Regular />
        </StaffLink>
      ))}
    </div>
  );
  const fileList = (source: ContentFile[]) => (
    <div className="content-simple-links">
      {source.map((file) => (
        <StaffLink key={file.id} href={fileLink(file)}>
          {file.name}
        </StaffLink>
      ))}
    </div>
  );
  const legacyFolder = packages.find(
    (item) => item.id === params.get("folder"),
  );
  const initialFolder = params.get("library")
    ? ""
    : legacyFolder
      ? legacyFolder.name
      : page === "digital"
        ? pkg("PKG-105").name
        : "";
  const milestoneItems = calendarEntries(packages);
  const packageContext =
    selected || packages.find((item) => initialFolder === item.name);
  const teamsPerson = teamsStaffForWorkspace(
    "content",
    params.get("staff") || undefined,
  );
  const homeChannels = visibleContentChannels(teamsPerson)
    .filter((channel) => channel.lifecycle === "Active")
    .slice(0, 4);
  if (!canAccessWorkspace(resolveStaffPerson(teamsPerson), "content"))
    return (
      <WorkspaceDenied
        workspaceId="content"
        known={!!valid}
        resource={
          topic
            ? { kind: "area", workspaceId: "content", areaId: topic.id }
            : undefined
        }
      />
    );
  return (
    <div
      className={`app-shell services-app content-app ${share ? "content-partner-preview" : ""}`}
      onClick={intercept}
    >
      {!share ? (
        <>
          <StaffLink className="skip-link" href="#content-main">
            Skip to content
          </StaffLink>
          <WorkspaceHeader
            title={title}
            searchFiles={searchableContentFiles}
            memberCount={24}
            helpText={description}
            onOpen={(file) => navigate(fileLink(filesById.get(file.id)!))}
            userName={resolveStaffPerson(teamsPerson).name}
            userRole={resolveStaffPerson(teamsPerson).role}
            onTeams={
              homeChannels.length
                ? () => location.assign(contentTeamsHref(teamsPerson))
                : undefined
            }
            onMessage={setMessage}
          />
        </>
      ) : (
        <header className="content-scoped-header">
          <img
            src="/images/sharepoint-logo.svg"
            alt="SharePoint"
            width="32"
            height="32"
          />
          <div>
            <strong>{routePackage!.name}</strong>
            <small>Shared production area · {routePackage!.partner}</small>
          </div>
          <PocAnnotation title="PARTNER PREVIEW" variant="inline" />
        </header>
      )}
      <div className="workspace">
        {!share && (
          <aside className="sidebar services-sidebar">
            <nav aria-label="Content workspace navigation">
              <StaffLink
                href={base}
                aria-current={page === "home" ? "page" : undefined}
              >
                <Home24Regular />
                Home
              </StaffLink>
              {libraries.map((library) => (
                <StaffLink
                  key={library.id}
                  href={`${base}/${library.id}`}
                  aria-current={
                    !register && activeLibrary?.id === library.id
                      ? "page"
                      : undefined
                  }
                >
                  <Folder24Regular />
                  {library.title}
                </StaffLink>
              ))}
              <StaffLink
                href={`${base}/calendar`}
                aria-current={page === "calendar" ? "page" : undefined}
              >
                <Calendar24Regular />
                Production Calendar
              </StaffLink>
            </nav>
          </aside>
        )}
        <main id="content-main" className="services-main">
          <div className="breadcrumb">
            {share ? (
              "Shared production area"
            ) : (
              <>
                <StaffLink href={base}>Workspace</StaffLink>
                {page !== "home" && (
                  <>
                    {" "}
                    /{" "}
                    {register
                      ? "Production Register"
                      : activeLibrary?.title ||
                        (topic
                          ? "Protected component"
                          : tool?.name ||
                            (page === "calendar"
                              ? "Production Calendar"
                              : page === "teams"
                                ? "Team collaboration"
                                : "Production links"))}
                  </>
                )}
              </>
            )}
          </div>
          {!valid ? (
            <>
              <h2>Page not found</h2>
              <StaffLink href={base}>Return to workspace</StaffLink>
            </>
          ) : topic ? (
            <AccessBoundary
              workspaceId="content"
              area={topic.name}
              personId={teamsPerson}
              resource={{
                kind: "area",
                workspaceId: "content",
                areaId: topic.id,
              }}
              location={`${title} / ${pkg(topic.packageId).name} / ${topic.name}`}
              strict={
                topic.id === "participant-administration" ||
                topic.id === "commercial-proposal"
              }
              returnHref={packageHref(topic.packageId)}
              returnLabel="Back to shared production files"
            />
          ) : share ? (
            <>
              <DocumentLibrary
                title={share.name}
                files={sharedFiles(share.packageId).map((file) => ({
                  ...documentFor(file),
                  folder: "",
                }))}
                readOnly
              />
              <p>
                Review due {date(routePackage!.reviewDue)} · delivery{" "}
                {date(routePackage!.releaseDate)} · {routePackage!.lead}
              </p>
              <p>
                <StaffLink href={packageHref(share.packageId)}>
                  Leave partner preview
                </StaffLink>
              </p>
              {candidateFile &&
                !sharedFiles(share.packageId).some(
                  (file) => file.id === candidateFile.id,
                ) && (
                  <p role="status">
                    That file is not included in this shared area.
                  </p>
                )}
            </>
          ) : tool ? (
            <section className="system-destination">
              <PocAnnotation title="SYSTEM PREVIEW" variant="inline">
                No data is transmitted.
              </PocAnnotation>
              <h2>{tool.name}</h2>
              <p>{tool.purpose}.</p>
              {selected && <p>{selected.name}</p>}
              {params.get("reference") && (
                <p>Reference: {params.get("reference")}</p>
              )}
              <StaffLink
                href={
                  selected ? packageHref(selected.id) : `${base}/production`
                }
              >
                Back to production
              </StaffLink>
            </section>
          ) : page === "tools" ? (
            <section>
              <h2>Production links</h2>
              <p>
                Use a production record to open its related specialist system.
              </p>
              <StaffLink href={`${base}/production-register`}>
                Production Register
              </StaffLink>
            </section>
          ) : page === "home" ? (
            <>
              <div className="content-room-home-grid">
                <div>
                  <header className="content-room-home-heading">
                    <h1>{title}</h1>
                    <p>{description}</p>
                  </header>
                  <section className="content-room-production">
                    <h2>Active production</h2>
                    {[
                      ["PKG-108", "In production"],
                      ["PKG-103", "Review"],
                      ["PKG-101", "Review scheduled"],
                    ].map(([id, status]) => (
                      <StaffLink
                        key={id}
                        href={`${base}/production?${new URLSearchParams({ folder: pkg(id).name })}`}
                      >
                        <span>
                          <strong>{pkg(id).name}</strong>
                          <small>
                            {id === "PKG-108"
                              ? "Public-information copy and channel adaptations"
                              : id === "PKG-103"
                                ? "Captions, review cut and delivery checks"
                                : "Email sequence and landing-page content"}
                          </small>
                        </span>
                        <span className="content-room-stage">{status}</span>
                        <ArrowRight20Regular />
                      </StaffLink>
                    ))}
                  </section>
                  <DocumentLibrary
                    title="Recent production files"
                    files={files
                      .filter((file) =>
                        [
                          "welcome-message",
                          "video-roughcut",
                          "rapid-copy",
                        ].includes(file.id),
                      )
                      .map(documentFor)}
                    embedded
                    onOpen={(file) =>
                      navigate(fileLink(filesById.get(file.id)!))
                    }
                  />
                  <div className="content-room-handoffs">
                    <StaffLink href={`${base}/tools/planable`}>
                      Publishing approvals in Planable <ArrowUpRight20Regular />
                    </StaffLink>
                    <StaffLink href="/audience-innovation/research">
                      Audience evidence <ArrowRight20Regular />
                    </StaffLink>
                    <StaffLink href="/digital-tech/web-crm">
                      CMS engineering in Digital & Technology{" "}
                      <ArrowRight20Regular />
                    </StaffLink>
                  </div>
                </div>
                <TeamsHomePanel
                  heading="Live studio coordination"
                  description="Join a desk or coverage conversation. Production files stay in SharePoint."
                  channels={homeChannels.map((channel) => ({
                    name: channel.name,
                    href: contentTeamsHref(teamsPerson, channel.id),
                    cue:
                      channel.kind === "temporary"
                        ? "Temporary coverage"
                        : undefined,
                  }))}
                  openHref={contentTeamsHref(teamsPerson)}
                  openLabel="Open studio in Teams"
                />
              </div>
            </>
          ) : register ? (
            <section className="service-section">
              <h2>Production Register</h2>
              <div className="service-library-toolbar">
                <label>
                  View
                  <select
                    aria-label="Production register view"
                    value={view}
                    onChange={(event) =>
                      setParams({ view: event.target.value })
                    }
                  >
                    {views.map((view) => (
                      <option key={view}>{view}</option>
                    ))}
                  </select>
                </label>
                <Input
                  contentBefore={<Search20Regular />}
                  aria-label="Search production register"
                  placeholder="Search production"
                  value={search}
                  onChange={(_, data) =>
                    setParams({ search: data.value }, true)
                  }
                />
              </div>
              <div className="table-scroll">
                <table className="service-table">
                  <thead>
                    <tr>
                      {[
                        "Production",
                        "Lead",
                        "Stage",
                        "Review due",
                        "Release",
                      ].map((label) => (
                        <th key={label}>{label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <button onClick={() => openPackage(item.id)}>
                            {item.name}
                          </button>
                        </td>
                        <td>{item.lead}</td>
                        <td>{item.stage}</td>
                        <td>{date(item.reviewDue)}</td>
                        <td>{date(item.releaseDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!rows.length && (
                  <p className="empty-state">
                    No production matches this view.
                  </p>
                )}
              </div>
            </section>
          ) : page === "teams" ? (
            <p role="status">Opening Creative & Editorial Studio in Teams…</p>
          ) : page === "calendar" ? (
            <>
              <h2>Production Calendar</h2>
              <ProductionCalendar
                month={month}
                setMonth={setMonth}
                day={day}
                setDay={setDay}
                entries={milestoneItems}
                packages={packages}
                openPackage={openPackage}
              />
            </>
          ) : activeLibrary ? (
            <>
              <DocumentLibrary
                key={activeLibrary.id + initialFolder}
                title={activeLibrary.title}
                definition={definitions[activeLibrary.id]}
                files={files
                  .filter((file) => libraryFor(file) === activeLibrary.id)
                  .map(documentFor)}
                initialFolder={initialFolder}
                readOnly={activeLibrary.id === "published"}
              />
              <div className="content-simple-links">
                <StaffLink href={`${base}/production-register`}>
                  Production Register
                </StaffLink>
                {page === "digital" && (
                  <StaffLink href="/digital-tech/web-crm">
                    Digital & Technology
                  </StaffLink>
                )}
                {packageContext &&
                  partnerShares
                    .filter((share) => share.packageId === packageContext.id)
                    .map((share) => (
                      <StaffLink
                        href={`${base}/packages/${share.packageId}/shared`}
                        key={share.packageId}
                      >
                        Partner collaboration · {packageContext.partner}
                      </StaffLink>
                    ))}
              </div>
            </>
          ) : null}
        </main>
      </div>
      <Drawer
        open={!!selected && !tool && !share}
        position="end"
        size="medium"
        modalType="modal"
        onOpenChange={(_, d) => {
          if (!d.open) setParams({ package: "" });
        }}
      >
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <Button
                appearance="subtle"
                icon={<Dismiss20Regular />}
                aria-label="Close package"
                onClick={() => setParams({ package: "" })}
              />
            }
          >
            Content package
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
          {selected && (
            <>
              <h3>{selected.name}</h3>
              <p>{selected.purpose}</p>
              <dl className="service-properties">
                {[
                  ["Audience", selected.audience],
                  ["Lead", selected.lead],
                  ["Formats", selected.formats.join(" + ")],
                  ["Channels", selected.channels.join(" · ")],
                  ["Review due", date(selected.reviewDue)],
                  ["Release date", date(selected.releaseDate)],
                  [
                    "External partner",
                    selected.partner || "Internal production",
                  ],
                  ["Modified", "16 Oct 2026"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <label className="content-edit-label">
                Stage
                <select
                  aria-label="Package stage"
                  value={selected.stage}
                  onChange={(e) => changeStage(selected, e.target.value)}
                >
                  {stages.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <h4>Rights & release conditions</h4>
              <label className="content-edit-label">
                Rights status
                <select
                  aria-label="Rights status"
                  value={selected.rights}
                  onChange={(e) =>
                    patch(selected.id, {
                      rights: e.target.value as Rights,
                      status: "Needs review",
                    })
                  }
                >
                  {rightsStatuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <p className="content-rights-note">{selected.condition}</p>
              <p className="service-muted">
                Permitted channels: {selected.permitted.join(" · ")}
                <br />
                Rights reference:{" "}
                <StaffLink
                  href={toolHref(
                    "salesforce",
                    selected.id,
                    selected.rightsReference,
                  )}
                >
                  {selected.rightsReference}
                </StaffLink>
                {selected.embargo && (
                  <>
                    <br />
                    Embargo until: {date(selected.embargo)}
                  </>
                )}
              </p>
              <h4>Review & clearance</h4>
              {selected.reviews.map((r) => (
                <label className="content-edit-label" key={r.type}>
                  {r.type}
                  <select
                    aria-label={`${r.type} review`}
                    value={r.status}
                    onChange={(e) =>
                      patch(selected.id, {
                        reviews: selected.reviews.map((x) =>
                          x.type === r.type
                            ? { ...x, status: e.target.value }
                            : x,
                        ),
                      })
                    }
                  >
                    <option>Pending</option>
                    <option>Approved</option>
                    <option>Changes requested</option>
                  </select>
                </label>
              ))}
              <h4>Working files</h4>
              {fileList(files.filter((f) => f.packageId === selected.id))}
              <h4>Related systems</h4>
              {refs(selected)}
              <h4>Audience research</h4>
              <StaffLink href={selected.research}>
                Open related audience research <ArrowRight20Regular />
              </StaffLink>
              <p>
                <StaffLink href="/audience-innovation/analytics">
                  Return performance evidence to Audience Research & Marketing
                  Insight
                </StaffLink>
              </p>
              {selected.id === "PKG-102" && (
                <p>
                  Headline test A / B · primary measure: completion rate · VWO
                  reference EXP-118.
                </p>
              )}
              {partnerShares
                .filter((s) => s.packageId === selected.id)
                .map((s) => (
                  <p key={s.packageId}>
                    <StaffLink href={`${base}/packages/${s.packageId}/shared`}>
                      {s.name} — {selected.partner}
                    </StaffLink>
                  </p>
                ))}
              {protectedTopics
                .filter((t) => t.packageId === selected.id)
                .map((t) => (
                  <p key={t.id}>
                    <StaffLink
                      className="content-protected-link"
                      href={protectedHref(t)}
                    >
                      <LockClosed20Regular />
                      {t.name} · narrower access group
                    </StaffLink>
                  </p>
                ))}
              <h4>Review conversation</h4>
              <p className="content-review-note">
                <strong>{selected.lead}</strong> · 16 Oct
                <br />
                Please confirm outstanding review and rights conditions before
                the next handoff.
              </p>
              {comments[selected.id]?.map((text, index) => (
                <p className="content-review-note" key={index}>
                  <strong>Maya Chen</strong> · Just now
                  <br />
                  {text}
                </p>
              ))}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (comment.trim()) {
                    setComments({
                      ...comments,
                      [selected.id]: [
                        ...(comments[selected.id] || []),
                        comment.trim(),
                      ],
                    });
                    setComment("");
                  }
                }}
              >
                <Input
                  aria-label="Review comment"
                  placeholder="Add a production review comment"
                  value={comment}
                  onChange={(_, d) => setComment(d.value)}
                />
                <Button disabled={!comment.trim()} type="submit">
                  Add comment
                </Button>
              </form>
            </>
          )}
        </DrawerBody>
      </Drawer>
      {message && (
        <div className="toast" role="status">
          {message}
        </div>
      )}
    </div>
  );
}
function ProductionCalendar({
  month,
  setMonth,
  day,
  setDay,
  entries,
  packages,
  openPackage,
}: {
  month: Date;
  setMonth: (d: Date) => void;
  day: string | null;
  setDay: (d: string | null) => void;
  entries: ReturnType<typeof calendarEntries>;
  packages: Package[];
  openPackage: (id: string) => void;
}) {
  const key = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (start.getDay() + 6) % 7;
  start.setDate(1 - offset);
  const weeks = Math.ceil(
    (offset +
      new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()) /
      7,
  );
  const days = Array.from(
    { length: weeks * 7 },
    (_, i) =>
      new Date(start.getFullYear(), start.getMonth(), start.getDate() + i),
  );
  return (
    <>
      <div className="sp-calendar-toolbar">
        <Button
          aria-label="Previous production month"
          icon={<ChevronLeft20Regular />}
          onClick={() => {
            setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1));
            setDay(null);
          }}
        />
        <Button
          aria-label="Next production month"
          icon={<ChevronRight20Regular />}
          onClick={() => {
            setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));
            setDay(null);
          }}
        />
        <h3>
          {month.toLocaleDateString("en-GB", {
            month: "long",
            year: "numeric",
          })}
        </h3>
        <StaffLink href={toolHref("planable")}>
          Open in Planable <ArrowUpRight20Regular />
        </StaffLink>
      </div>
      <div className="sp-calendar-scroll">
        <table className="sp-month-calendar" aria-label="Production calendar">
          <thead>
            <tr>
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].map((d) => (
                <th key={d}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: weeks }, (_, w) => (
              <tr key={w}>
                {days.slice(w * 7, w * 7 + 7).map((d) => {
                  const date = key(d);
                  const events = entries.filter((e) => e.date === date);
                  return (
                    <td
                      key={date}
                      className={
                        d.getMonth() !== month.getMonth() ? "outside-month" : ""
                      }
                    >
                      <button
                        className="calendar-day-number"
                        onClick={() => setDay(date)}
                        aria-label={d.toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                        })}
                      >
                        {d.getDate()}
                      </button>
                      {events.slice(0, 2).map((e) => (
                        <button
                          className="calendar-event"
                          key={e.id}
                          title={`${e.name} · ${packages.find((p) => p.id === e.packageId)!.name}`}
                          onClick={() => setDay(date)}
                        >
                          {e.name} ·{" "}
                          {packages.find((p) => p.id === e.packageId)!.name}
                        </button>
                      ))}
                      {events.length > 2 && (
                        <button
                          className="calendar-more"
                          onClick={() => setDay(date)}
                        >
                          +{events.length - 2} more
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {day && (
        <section className="service-section">
          <h3>{date(day)} · Production milestones</h3>
          {entries
            .filter((e) => e.date === day)
            .map((e) => {
              const p = packages.find((p) => p.id === e.packageId)!;
              const ref = p.refs.find((r) => r.tool === "planable");
              return (
                <div className="content-calendar-item" key={e.id}>
                  <strong>
                    {e.name} · {p.name}
                  </strong>
                  <p>
                    {p.lead} · {p.stage} · {p.status}
                  </p>
                  <Button onClick={() => openPackage(p.id)}>
                    Open package
                  </Button>{" "}
                  <StaffLink href={toolHref("planable", p.id, ref?.id || "")}>
                    Open in Planable {ref?.id}
                  </StaffLink>
                </div>
              );
            })}
          {!entries.some((e) => e.date === day) && (
            <p>No milestones on this date.</p>
          )}
        </section>
      )}
      <p className="service-muted">
        Detailed channel timing and publishing approvals remain in Planable.
      </p>
    </>
  );
}
