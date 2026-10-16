import { useState, useEffect, type MouseEvent } from "react";
import {
  Button,
  Input,
  Drawer,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerBody,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@fluentui/react-components";
import {
  Home24Regular,
  Folder24Regular,
  ArrowRight20Regular,
  ArrowUpRight20Regular,
  Dismiss20Regular,
  LockClosed20Regular,
  Search20Regular,
  ChevronLeft20Regular,
  ChevronRight20Regular,
} from "@fluentui/react-icons";
import WorkspaceHeader from "../logistics/WorkspaceHeader";
import DocumentIcon from "../components/DocumentIcon";
import {
  title,
  description,
  navigation,
  packages as initialPackages,
  files,
  filesById,
  tools,
  quickToolIds,
  packageHref,
  fileHref,
  toolHref,
  pipelineViews,
  queryPackages,
  stages,
  rightsStatuses,
  updateStage,
  partnerShares,
  sharedFiles,
  protectedTopics,
  protectedHref,
  teamChannels,
  filesForChannel,
  calendarEntries,
  digitalSteps,
  recentIds,
  type Package,
  type ContentFile,
  type Rights,
} from "./data";
import "../services/styles.css";
import "./styles.css";
const base = "/content-delivery";
const date = (s: string) =>
  new Date(s + "T12:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
export default function ContentApp() {
  const [url, setUrl] = useState(location.pathname + location.search);
  const [packages, setPackages] = useState(initialPackages);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);
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
    const t = setTimeout(() => setMessage(""), 5000);
    return () => clearTimeout(t);
  }, [message]);
  const parsed = new URL(url, location.origin);
  const params = parsed.searchParams;
  const parts = parsed.pathname.split("/").filter(Boolean);
  const page = parts[1] || "home";
  const pkg = (id: string) => packages.find((p) => p.id === id)!;
  const routePackage =
    parts[1] === "packages"
      ? packages.find((p) => p.id === parts[2])
      : undefined;
  const share =
    parts[3] === "shared"
      ? partnerShares.find((s) => s.packageId === routePackage?.id)
      : undefined;
  const topic = protectedTopics.find(
    (t) => protectedHref(t) === parsed.pathname,
  );
  const tool =
    page === "tools" ? tools.find((t) => t.id === parts[2]) : undefined;
  const valid =
    page === "home" ||
    navigation.some((n) => n.id === page) ||
    (page === "tools" && (!parts[2] || tool)) ||
    page === "teams" ||
    !!topic ||
    !!share;
  const navigate = (href: string, replace = false) => {
    if (replace) history.replaceState({}, "", href);
    else history.pushState({}, "", href);
    setUrl(location.pathname + location.search);
  };
  const intercept = (e: MouseEvent<HTMLDivElement>) => {
    const href = (e.target as HTMLElement).closest("a")?.getAttribute("href");
    if (
      href?.startsWith(base) &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.shiftKey &&
      !e.altKey
    ) {
      e.preventDefault();
      navigate(href);
    }
  };
  const setParams = (values: Record<string, string>, replace = false) => {
    const next = new URLSearchParams(params);
    Object.entries(values).forEach(([k, v]) =>
      v ? next.set(k, v) : next.delete(k),
    );
    navigate(
      parsed.pathname + (next.size ? "?" + next.toString() : ""),
      replace,
    );
  };
  const selected = packages.find((p) => p.id === params.get("package"));
  const candidateFile = filesById.get(params.get("file") || "");
  const selectedFile = share
    ? sharedFiles(share.packageId).find((f) => f.id === candidateFile?.id)
    : candidateFile;
  const search = params.get("search") || "";
  const view = pipelineViews.includes(params.get("view") || "")
    ? params.get("view")!
    : "All Packages";
  const channel = params.get("channel") || "";
  const format = params.get("format") || "";
  const rows = queryPackages(packages, view, search, channel, format);
  const teamChannel =
    teamChannels.find((c) => c.id === channel) || teamChannels[0];
  const patch = (id: string, changes: Partial<Package>) =>
    setPackages(packages.map((p) => (p.id === id ? { ...p, ...changes } : p)));
  const openPackage = (id: string) => setParams({ package: id, file: "" });
  const openFile = (f: ContentFile) => setParams({ file: f.id, package: "" });
  const changeStage = (p: Package, value: string) => {
    const next = updateStage(p, value);
    if (next.blockers.length)
      setMessage("Not ready: " + next.blockers.join("; "));
    else {
      setPackages(packages.map((x) => (x.id === p.id ? next.package : x)));
      setMessage(
        "Package updated locally; pipeline, reviews and calendar use the same record.",
      );
    }
  };
  const copy = async (href: string) => {
    try {
      await navigator.clipboard.writeText(location.origin + href);
      setMessage("Link copied.");
    } catch {
      setMessage("Use the browser address to copy this link.");
    }
  };
  const refs = (p: Package) => (
    <div className="content-reference-list">
      {p.refs.map((r) => (
        <a key={r.tool + r.id} href={toolHref(r.tool, p.id, r.id)}>
          {tools.find((t) => t.id === r.tool)!.name} · {r.id}
          <ArrowUpRight20Regular />
        </a>
      ))}
    </div>
  );
  const fileList = (data: ContentFile[], scoped = false) => (
    <div className="content-file-list">
      {data.map((f) => (
        <button key={f.id} onClick={() => openFile(f)}>
          <DocumentIcon name={f.name} />
          <span>
            {f.name}
            <small>{scoped ? f.workType : `${f.campaign} · ${f.review}`}</small>
          </span>
          <ArrowRight20Regular />
        </button>
      ))}
    </div>
  );
  const packageList = (data: Package[], reviews = false) => (
    <div className="content-package-list">
      {data.map((p) => (
        <button key={p.id} onClick={() => openPackage(p.id)}>
          <span>
            <strong>{p.name}</strong>
            <small>
              {reviews
                ? `${p.reviews
                    .filter((r) => r.status === "Pending")
                    .map((r) => r.type)
                    .join(", ")} review · due ${date(p.reviewDue)}`
                : `${p.lead} · ${p.formats.join(" + ")}`}
            </small>
          </span>
          <span className="content-status">
            {p.stage}
            <small>{p.status}</small>
          </span>
          <ArrowRight20Regular />
        </button>
      ))}
    </div>
  );
  const pipeline = () => (
    <section className="service-section">
      <h3>Content Pipeline</h3>
      <div className="service-library-toolbar">
        <label>
          Saved view
          <select
            aria-label="Pipeline saved view"
            value={view}
            onChange={(e) => setParams({ view: e.target.value })}
          >
            {pipelineViews.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <Input
          contentBefore={<Search20Regular />}
          aria-label="Search content pipeline"
          placeholder="Search packages or lead"
          value={search}
          onChange={(_, d) => setParams({ search: d.value }, true)}
        />
      </div>
      <div className="table-scroll">
        <table className="service-table content-pipeline">
          <thead>
            <tr>
              {[
                "Content package / purpose",
                "Audience",
                "Format / channel",
                "Lead",
                "Stage / status",
                "Review due",
                "Release",
                "External partner",
                "Rights / external reference",
              ].map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td>
                  <button onClick={() => openPackage(p.id)}>{p.name}</button>
                  <small>{p.purpose}</small>
                </td>
                <td>{p.audience}</td>
                <td>
                  {p.formats.join(" + ")}
                  <small>{p.channels.join(" · ")}</small>
                </td>
                <td>{p.lead}</td>
                <td>
                  <span className="content-status">{p.stage}</span>
                  <small>{p.status}</small>
                </td>
                <td>{date(p.reviewDue)}</td>
                <td>{date(p.releaseDate)}</td>
                <td>{p.partner || "Internal production"}</td>
                <td>
                  {p.rights}
                  <small>
                    {p.refs.map((r) => (
                      <a key={r.id} href={toolHref(r.tool, p.id, r.id)}>
                        {r.id}{" "}
                      </a>
                    ))}
                  </small>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && (
          <p className="empty-state">No packages match this view.</p>
        )}
      </div>
    </section>
  );
  const material = () => {
    const source = files.filter(
      (f) =>
        f.area === page &&
        (!params.get("folder") || f.packageId === params.get("folder")) &&
        `${f.name} ${f.campaign} ${f.workType}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    );
    return (
      <section className="service-section">
        <h3>Current working material</h3>
        <div className="service-library-toolbar">
          <label>
            Content package
            <select
              aria-label="Working package filter"
              value={params.get("folder") || ""}
              onChange={(e) => setParams({ folder: e.target.value })}
            >
              <option value="">All packages</option>
              {packages
                .filter((p) =>
                  files.some((f) => f.packageId === p.id && f.area === page),
                )
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </label>
          <Input
            contentBefore={<Search20Regular />}
            aria-label="Search working material"
            placeholder="Search working material"
            value={search}
            onChange={(_, d) => setParams({ search: d.value }, true)}
          />
        </div>
        <div className="table-scroll">
          <table className="service-table">
            <thead>
              <tr>
                {[
                  "Name",
                  "Content package",
                  "Work type",
                  "Review / co-authors",
                  "Rights",
                  "Modified",
                ].map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {source.map((f) => (
                <tr key={f.id}>
                  <td>
                    <button onClick={() => openFile(f)}>
                      <DocumentIcon name={f.name} />
                      {f.name}
                    </button>
                  </td>
                  <td>
                    <button onClick={() => openPackage(f.packageId)}>
                      {f.campaign}
                    </button>
                  </td>
                  <td>{f.workType}</td>
                  <td>
                    {f.review}
                    <small>
                      {f.owner} ·{" "}
                      {f.owner === "Maya Chen" ? "Alex Morgan" : "Maya Chen"}
                    </small>
                  </td>
                  <td>{pkg(f.packageId).rights}</td>
                  <td>16 Oct 2026</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!source.length && (
            <p className="empty-state">No working files match.</p>
          )}
        </div>
      </section>
    );
  };
  const milestoneItems = calendarEntries(packages);
  return (
    <div
      className={`app-shell services-app content-app ${share ? "content-partner-preview" : ""}`}
      onClick={intercept}
    >
      {!share ? (
        <>
          <a className="skip-link" href="#content-main">
            Skip to content
          </a>
          <WorkspaceHeader
            title={title}
            searchFiles={files}
            memberCount={24}
            helpText={description}
            onOpen={(f) => navigate(fileHref(filesById.get(f.id)!))}
            onTeams={() => navigate(`${base}/teams`)}
            onMessage={setMessage}
          />
        </>
      ) : (
        <header className="content-scoped-header">
          <img
            src="/images/sharepoint-logo.svg"
            alt="SharePoint"
            width="34"
            height="34"
          />
          <div>
            <strong>{routePackage!.name}</strong>
            <small>Shared production area · {routePackage!.partner}</small>
          </div>
          <span>Partner preview</span>
        </header>
      )}
      <div className="workspace">
        {!share && (
          <aside className="sidebar services-sidebar">
            <nav aria-label="Content workspace navigation">
              <a
                href={base}
                aria-current={page === "home" ? "page" : undefined}
              >
                <Home24Regular />
                Home
              </a>
              <span className="service-nav-label">CONTENT PRODUCTION</span>
              {navigation.map((n) => (
                <a
                  href={`${base}/${n.id}`}
                  key={n.id}
                  aria-current={page === n.id ? "page" : undefined}
                >
                  <Folder24Regular />
                  {n.name}
                </a>
              ))}
            </nav>
          </aside>
        )}
        <main id="content-main" className="services-main">
          <div className="breadcrumb">
            {share ? (
              <span>Package-scoped collaboration</span>
            ) : (
              <>
                <a href={base}>Workspace</a>
                {page !== "home" && (
                  <>
                    {" "}
                    /{" "}
                    {navigation.find((n) => n.id === page)?.name ||
                      (page === "tools"
                        ? "External tools"
                        : page === "teams"
                          ? "Team collaboration"
                          : "Content package")}
                  </>
                )}
              </>
            )}
          </div>
          {!valid ? (
            <>
              <h2>Page not found</h2>
              <a href={base}>Return to Content Creation & Delivery</a>
            </>
          ) : topic ? (
            <section className="service-restricted">
              <LockClosed20Regular />
              <span className="library-label">Protected package component</span>
              <h2>{topic.name}</h2>
              <p>{pkg(topic.packageId).name}</p>
              <p>
                This component has a narrower access group because it requires
                restricted handling. Ordinary production files remain available
                in the content package.
              </p>
              <p>
                No participant, medical, security, distribution or commercial
                records are shown here.
              </p>
              <a
                href={
                  "/service-desk/access-request?" +
                  new URLSearchParams({
                    workspace: title,
                    area: pkg(topic.packageId).name,
                    location: `${title} / ${pkg(topic.packageId).name} / ${topic.name}`,
                  })
                }
              >
                Request access through Freshservice <ArrowRight20Regular />
              </a>
              <a href={packageHref(topic.packageId)}>
                Return to shared package
              </a>
            </section>
          ) : share ? (
            <>
              <span className="content-boundary-label">
                NARROW EXTERNAL COLLABORATION
              </span>
              <h2>{share.name}</h2>
              <p>{share.note}</p>
              <p className="service-muted">
                This preview contains only approved shared working material.
                Internal notes, protected components and other packages are
                outside this area.
              </p>
              {fileList(sharedFiles(share.packageId), true)}
              <section className="service-section">
                <h3>Delivery coordination</h3>
                <p>
                  Review due {date(routePackage!.reviewDue)} · planned delivery{" "}
                  {date(routePackage!.releaseDate)} · owner {routePackage!.lead}
                </p>
                <p>
                  Review comments: please address the agreed feedback before
                  preparing the next delivery.
                </p>
              </section>
              <a href={packageHref(share.packageId)}>
                Leave preview and return to internal package
              </a>
              {candidateFile && !selectedFile && (
                <p role="status">
                  That file is not included in this shared area.
                </p>
              )}
            </>
          ) : tool ? (
            <section className="system-destination">
              <span className="external-system-label">
                <ArrowUpRight20Regular /> EXTERNAL PRODUCTION SYSTEM · SIMULATED
                DESTINATION
              </span>
              <h2>{tool.name}</h2>
              <p>{tool.purpose}.</p>
              {selected && <p>Content package: {selected.name}</p>}
              {params.get("reference") && (
                <p>
                  External reference: <strong>{params.get("reference")}</strong>
                </p>
              )}
              <p className="service-muted">
                This would open the specialist platform. No authoritative
                records are copied here, no login is opened and no data is
                transmitted.
              </p>
              {selected && (
                <a href={packageHref(selected.id)}>Back to content package</a>
              )}
              <a href={`${base}/tools`}>All tools</a>
              {["piwik", "vwo", "semrush", "brandwatch"].includes(tool.id) && (
                <a href="/audience-innovation/analytics">
                  Go to Audience Insight & Innovation R&D for deeper analysis
                </a>
              )}
            </section>
          ) : page === "tools" ? (
            <>
              <h2>All tools</h2>
              <p className="service-muted">
                A fictional production ecosystem using real market products.
                Each opens a lightweight simulated destination.
              </p>
              <Input
                aria-label="Search tools"
                placeholder="Find a production tool"
                value={search}
                onChange={(_, d) => setParams({ search: d.value }, true)}
              />
              <div className="content-all-tools">
                {tools
                  .filter((t) =>
                    `${t.name} ${t.purpose}`
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                  )
                  .map((t) => (
                    <a key={t.id} href={toolHref(t.id)}>
                      <strong>{t.name}</strong>
                      <small>{t.purpose}</small>
                      <ArrowUpRight20Regular />
                    </a>
                  ))}
              </div>
            </>
          ) : (
            <>
              <div className="library-heading">
                <div>
                  <h2>
                    {page === "home"
                      ? title
                      : page === "teams"
                        ? "Team collaboration"
                        : navigation.find((n) => n.id === page)!.name}
                  </h2>
                  <p>
                    {page === "home"
                      ? description
                      : page === "pipeline"
                        ? "One working package across production, review, rights clearance and release."
                        : page === "editorial"
                          ? "Develop briefs, messages, narrative, headlines and channel-ready editorial drafts together."
                          : page === "creative"
                            ? "Graphics, photography, video, audio, illustration, print and presentation reviews tied to content purpose."
                            : page === "channels"
                              ? "Adapt packages across channels and evolve recurring content formats without splitting their working context."
                              : page === "digital"
                                ? "Content requirements, UX copy, acceptance and technical handoffs for digital delivery."
                                : page === "partners"
                                  ? "Package-specific collaboration with agencies, production partners and external developers."
                                  : page === "calendar"
                                    ? "Collaborative milestones only. Detailed channel scheduling remains in Planable."
                                    : "Durable production channels with the same shared working files as SharePoint."}
                  </p>
                </div>
              </div>
              {page === "home" ? (
                <div className="services-home-layout">
                  <div>
                    <section className="service-section">
                      <div className="service-section-heading">
                        <h3>In production</h3>
                        <a href={`${base}/pipeline?view=In+Production`}>
                          Full pipeline <ArrowRight20Regular />
                        </a>
                      </div>
                      {packageList(
                        packages
                          .filter((p) => !["Live", "Closed"].includes(p.stage))
                          .slice(0, 6),
                      )}
                    </section>
                    <section className="service-section">
                      <h3>Needs review</h3>
                      {packageList(
                        packages
                          .filter((p) => p.status === "Needs review")
                          .slice(0, 4),
                        true,
                      )}
                    </section>
                    <section className="service-section">
                      <div className="service-section-heading">
                        <h3>Quick access</h3>
                        <a href={`${base}/tools`}>All tools</a>
                      </div>
                      <div className="content-tool-links">
                        {quickToolIds.map((id) => {
                          const t = tools.find((t) => t.id === id)!;
                          return (
                            <a href={toolHref(id)} key={id}>
                              <strong>{t.name}</strong>
                              <small>{t.purpose}</small>
                              <ArrowUpRight20Regular />
                            </a>
                          );
                        })}
                      </div>
                    </section>
                  </div>
                  <aside className="services-home-aside">
                    <section>
                      <h3>Upcoming releases</h3>
                      {packages
                        .filter((p) => p.releaseDate >= "2026-10-16")
                        .sort((a, b) =>
                          a.releaseDate.localeCompare(b.releaseDate),
                        )
                        .slice(0, 4)
                        .map((p) => (
                          <a href={packageHref(p.id)} key={p.id}>
                            <strong>
                              {date(p.releaseDate)} · {p.name}
                            </strong>
                            <small>
                              {p.formats.join(" + ")} · {p.stage} · {p.lead}
                            </small>
                          </a>
                        ))}
                    </section>
                    <section>
                      <h3>External handoffs</h3>
                      {partnerShares.slice(0, 2).map((s) => (
                        <a key={s.packageId} href={packageHref(s.packageId)}>
                          {pkg(s.packageId).name}
                          <small>
                            {pkg(s.packageId).partner} · scoped collaboration
                          </small>
                        </a>
                      ))}
                    </section>
                    <section>
                      <h3>Recent working files</h3>
                      {fileList(recentIds.map((id) => filesById.get(id)!))}
                    </section>
                    <section>
                      <h3>Research informing production</h3>
                      <a href="/audience-innovation/audiences?initiative=RD-102">
                        New Customer Journey Study → Customer Welcome Series
                      </a>
                      <a href="/audience-innovation/analytics?initiative=RD-103">
                        Website friction evidence → Mobile Sign-up Experience
                      </a>
                    </section>
                  </aside>
                </div>
              ) : page === "pipeline" ? (
                pipeline()
              ) : page === "editorial" || page === "creative" ? (
                <>
                  {material()}
                  <a href={`${base}/pipeline?view=Needs+Review`}>
                    Review packages needing input and clearance{" "}
                    <ArrowRight20Regular />
                  </a>
                </>
              ) : page === "channels" ? (
                <>
                  <div className="service-library-toolbar">
                    <label>
                      Channel
                      <select
                        aria-label="Channel filter"
                        value={channel}
                        onChange={(e) => setParams({ channel: e.target.value })}
                      >
                        <option value="">All channels</option>
                        {[...new Set(packages.flatMap((p) => p.channels))].map(
                          (c) => (
                            <option key={c}>{c}</option>
                          ),
                        )}
                      </select>
                    </label>
                    <label>
                      Format
                      <select
                        aria-label="Format filter"
                        value={format}
                        onChange={(e) => setParams({ format: e.target.value })}
                      >
                        <option value="">All formats</option>
                        {[...new Set(packages.flatMap((p) => p.formats))].map(
                          (c) => (
                            <option key={c}>{c}</option>
                          ),
                        )}
                      </select>
                    </label>
                  </div>
                  {packageList(rows)}
                  <section className="service-section">
                    <h3>Evolving formats & content products</h3>
                    <div className="table-scroll">
                      <table className="service-table">
                        <thead>
                          <tr>
                            <th>Format / product</th>
                            <th>Audience need</th>
                            <th>Production model</th>
                            <th>Testing / review cycle</th>
                          </tr>
                        </thead>
                        <tbody>
                          {packages
                            .filter(
                              (p) =>
                                ![
                                  "PKG-107",
                                  "PKG-108",
                                  "PKG-109",
                                  "PKG-110",
                                  "PKG-111",
                                ].includes(p.id),
                            )
                            .map((p) => (
                              <tr key={p.id}>
                                <td>
                                  <button onClick={() => openPackage(p.id)}>
                                    {p.product}
                                  </button>
                                </td>
                                <td>{p.purpose}</td>
                                <td>{p.productionModel}</td>
                                <td>
                                  {p.testing}
                                  <small>
                                    Review with each release; feed evaluation
                                    into the next brief.
                                  </small>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                  {material()}
                </>
              ) : page === "digital" ? (
                <>
                  <section className="service-section">
                    <h3>Mobile Sign-up Experience — delivery handoff</h3>
                    <p>
                      From audience evidence to content acceptance, release and
                      measurement.
                    </p>
                    <ol className="content-digital-flow">
                      {digitalSteps.map((s, index) => (
                        <li key={s.name}>
                          <strong>
                            {index + 1}. {s.name}
                          </strong>
                          {s.file && (
                            <a href={fileHref(filesById.get(s.file)!)}>
                              {filesById.get(s.file)!.name}
                            </a>
                          )}
                          {s.research && (
                            <a href={s.research}>
                              Open source audience evidence
                            </a>
                          )}
                          {s.tool && (
                            <a
                              href={toolHref(
                                s.tool,
                                "PKG-105",
                                pkg("PKG-105").refs.find(
                                  (r) => r.tool === s.tool,
                                )?.id || "",
                              )}
                            >
                              Open {tools.find((t) => t.id === s.tool)!.name}
                              <ArrowUpRight20Regular />
                            </a>
                          )}
                        </li>
                      ))}
                    </ol>
                    <p className="service-muted">
                      Source code and implementation records stay in GitHub. CMS
                      content remains in Contentful; experiment detail in VWO;
                      measurement in Piwik PRO.
                    </p>
                  </section>
                  {material()}
                </>
              ) : page === "partners" ? (
                <>
                  <section className="service-section">
                    <h3>External production engagements</h3>
                    {packages
                      .filter((p) => p.partner)
                      .map((p) => (
                        <section key={p.id} className="content-partner-row">
                          <h4>
                            <a href={packageHref(p.id)}>{p.name}</a>
                          </h4>
                          <p>
                            {p.partner} · {p.partnerType}
                          </p>
                          <p>
                            Lead: {p.lead} · review {date(p.reviewDue)} ·{" "}
                            {p.status}
                          </p>
                          {partnerShares.some((s) => s.packageId === p.id) ? (
                            <a href={`${base}/packages/${p.id}/shared`}>
                              Open scoped partner collaboration{" "}
                              <ArrowRight20Regular />
                            </a>
                          ) : (
                            <p className="service-muted">
                              Engagement is being prepared. No external material
                              has been shared.
                            </p>
                          )}
                        </section>
                      ))}
                  </section>
                </>
              ) : page === "teams" ? (
                <>
                  <div className="content-team-heading">
                    <img
                      src="/images/teams-logo.svg"
                      alt="Microsoft Teams"
                      width="36"
                      height="36"
                    />
                    <strong>{title}</strong>
                  </div>
                  <div
                    className="content-channel-tabs"
                    role="group"
                    aria-label="Team channels"
                  >
                    {teamChannels.map((c) => (
                      <Button
                        key={c.id}
                        appearance={
                          teamChannel.id === c.id ? "primary" : "secondary"
                        }
                        onClick={() =>
                          setParams({ channel: c.id, file: "", package: "" })
                        }
                      >
                        {c.name}
                      </Button>
                    ))}
                  </div>
                  <section className="service-section">
                    <h3>{teamChannel.name} · Shared working files</h3>
                    <p className="service-muted">
                      Maya Chen · Please use the current package files and
                      record review decisions in the package before handoff.
                    </p>
                    {fileList(filesForChannel(teamChannel.id))}
                  </section>
                  {teamChannel.id === "digital" && (
                    <a href={`${base}/packages/PKG-105/shared`}>
                      Mobile Sign-up Experience — scoped external development
                      collaboration
                    </a>
                  )}
                </>
              ) : page === "calendar" ? (
                <ProductionCalendar
                  month={month}
                  setMonth={setMonth}
                  day={day}
                  setDay={setDay}
                  entries={milestoneItems}
                  packages={packages}
                  openPackage={openPackage}
                />
              ) : null}
            </>
          )}
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
              <span className="library-label">
                {selected.id} · {selected.status}
              </span>
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
                <a
                  href={toolHref(
                    "salesforce",
                    selected.id,
                    selected.rightsReference,
                  )}
                >
                  {selected.rightsReference}
                </a>
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
              <p className="service-muted">
                Demonstration only. Local changes reset on reload; no content is
                published.
              </p>
              <h4>Working files</h4>
              {fileList(files.filter((f) => f.packageId === selected.id))}
              <h4>Specialist systems</h4>
              {refs(selected)}
              <h4>Source research & evaluation</h4>
              <a href={selected.research}>
                Open related audience research <ArrowRight20Regular />
              </a>
              <p>
                <a href="/audience-innovation/analytics">
                  Return performance evidence to Audience Insight & Innovation
                  R&D
                </a>
              </p>
              {selected.id === "PKG-102" && (
                <p>
                  Headline test A / B · primary measure: completion rate · VWO
                  reference EXP-118.
                </p>
              )}
              <h4>Format / product development</h4>
              <p>
                <strong>{selected.product}</strong>
                <br />
                {selected.productionModel}
              </p>
              <p>{selected.testing}</p>
              {partnerShares
                .filter((s) => s.packageId === selected.id)
                .map((s) => (
                  <p key={s.packageId}>
                    <a href={`${base}/packages/${s.packageId}/shared`}>
                      {s.name} — {selected.partner}
                    </a>
                  </p>
                ))}
              {protectedTopics
                .filter((t) => t.packageId === selected.id)
                .map((t) => (
                  <p key={t.id}>
                    <a
                      className="content-protected-link"
                      href={protectedHref(t)}
                    >
                      <LockClosed20Regular />
                      {t.name} · narrower access group
                    </a>
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
      <Drawer
        open={!!selectedFile}
        position="end"
        size="medium"
        modalType="modal"
        onOpenChange={(_, d) => {
          if (!d.open) setParams({ file: "" });
        }}
      >
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <Button
                appearance="subtle"
                icon={<Dismiss20Regular />}
                aria-label="Close file details"
                onClick={() => setParams({ file: "" })}
              />
            }
          >
            Working file details
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
          {selectedFile && (
            <>
              <DocumentIcon name={selectedFile.name} />
              <h3>{selectedFile.name}</h3>
              <p>{selectedFile.campaign}</p>
              <p>
                {selectedFile.workType} · {selectedFile.review}
              </p>
              <p className="service-muted">
                Co-authors: {selectedFile.owner} ·{" "}
                {selectedFile.owner === "Maya Chen"
                  ? "Alex Morgan"
                  : "Maya Chen"}
                <br />
                Modified 16 Oct 2026 · Working information
              </p>
              <Button appearance="primary" onClick={() => setPreview(true)}>
                Open
              </Button>{" "}
              <Button
                onClick={() =>
                  copy(
                    share
                      ? parsed.pathname + "?file=" + selectedFile.id
                      : fileHref(selectedFile),
                  )
                }
              >
                Copy link
              </Button>
              {!share && (
                <>
                  <p>Rights: {pkg(selectedFile.packageId).rights}</p>
                  <a href={packageHref(selectedFile.packageId)}>
                    Open connected content package <ArrowRight20Regular />
                  </a>
                </>
              )}
            </>
          )}
        </DrawerBody>
      </Drawer>
      <Dialog open={preview} onOpenChange={(_, d) => setPreview(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{selectedFile?.name}</DialogTitle>
            <DialogContent>
              Fictional working document preview. No Office document, production
              asset, video or personal record is stored here. Review the linked
              package and specialist-system references for the production
              context.
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPreview(false)}>Close</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
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
        <a href={toolHref("planable")}>
          Open in Planable <ArrowUpRight20Regular />
        </a>
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
                  <a href={toolHref("planable", p.id, ref?.id || "")}>
                    Open in Planable {ref?.id}
                  </a>
                </div>
              );
            })}
          {!entries.some((e) => e.date === day) && (
            <p>No milestones on this date.</p>
          )}
        </section>
      )}
      <p className="service-muted">
        Fictional milestones · October 2026. Detailed channel timing and
        publishing approvals remain in Planable.
      </p>
    </>
  );
}
