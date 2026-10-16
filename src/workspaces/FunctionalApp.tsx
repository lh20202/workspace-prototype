import { useState } from "react";
import {
  Button,
  Drawer,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerBody,
} from "@fluentui/react-components";
import { Dismiss20Regular, LockClosed20Regular } from "@fluentui/react-icons";
import WorkspaceHeader from "../logistics/WorkspaceHeader";
import DocumentLibrary, {
  type LibraryDocument,
} from "../sharepoint/DocumentLibrary";
import { workspaceRegistry, workspaceById } from "./registry";
import { configById } from "./config";
import type { WorkingFile, WorkingItem } from "./types";
import ArchivePane from "./ArchivePane";
import "../services/styles.css";
import "./styles.css";

type SiteLibrary = { id: string; name: string; areas: string[] };
const libraries: Record<string, SiteLibrary[]> = {
  services: [
    {
      id: "documents",
      name: "Documents",
      areas: ["office", "purchasing", "travel", "reception"],
    },
  ],
  quality: [
    {
      id: "quality-documents",
      name: "Quality & Monitoring",
      areas: ["monitoring", "reviews"],
    },
    {
      id: "improvement-documents",
      name: "Process & Improvement",
      areas: ["process", "improvement"],
    },
    { id: "eco-documents", name: "Eco Practice", areas: ["eco"] },
  ],
  digital: [
    {
      id: "engineering-documents",
      name: "Engineering Work",
      areas: [
        "engineering",
        "web-crm",
        "systems-engineering",
        "ai-automation",
        "m365",
      ],
    },
    {
      id: "architecture-documents",
      name: "Architecture & Governance",
      areas: ["information-architecture", "architecture"],
    },
    {
      id: "operations-documents",
      name: "Platform Operations",
      areas: ["operations"],
    },
  ],
  legal: [
    {
      id: "legal-documents",
      name: "Legal & Compliance Work",
      areas: ["review", "compliance", "policy"],
    },
    {
      id: "privacy-documents",
      name: "Privacy & Assurance",
      areas: ["privacy", "risk", "audit"],
    },
    { id: "contract-documents", name: "Contract Review", areas: ["contracts"] },
  ],
  people: [
    {
      id: "workforce-documents",
      name: "Workforce & Culture",
      areas: [
        "workforce",
        "culture",
        "employment",
        "communities",
        "analytics",
        "wellbeing",
      ],
    },
    { id: "hiring-documents", name: "Hiring & Talent", areas: ["hiring"] },
    {
      id: "learning-documents",
      name: "Capability & Learning",
      areas: ["learning"],
    },
    {
      id: "communications-documents",
      name: "Internal Communications",
      areas: ["communications"],
    },
  ],
  archives: [
    {
      id: "working-documents",
      name: "Archive Working Documents",
      areas: [
        "retention",
        "transfer",
        "cataloguing",
        "preservation",
        "projects",
      ],
    },
  ],
  customer: [
    {
      id: "care-documents",
      name: "Customer Care & Quality",
      areas: ["care", "premium", "quality"],
    },
    {
      id: "relationship-documents",
      name: "Relationships & Accounts",
      areas: ["relationships", "accounts", "partnerships", "stakeholders"],
    },
    {
      id: "meeting-documents",
      name: "Meetings & Negotiations",
      areas: ["meetings"],
    },
  ],
};
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
  const siteLibraries = libraries[workspace.id] || [];
  const library = siteLibraries.find(
    (l) => l.id === page || l.areas.includes(page),
  );
  const primaryLibrary = siteLibraries[0];
  const isList =
    page === "actions" || (workspace.id === "quality" && page === "reviews");
  const isCommunityPage = workspace.id === "people" && page === "communities";
  const [items, setItems] = useState(config.items);
  const [selected, setSelected] = useState<WorkingItem>();
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("");
  const [view, setView] = useState("Current");
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Record<string, string[]>>({});
  const actor =
    workspace.id === "digital"
      ? "Devon Park"
      : workspace.id === "people"
        ? "Elena Rossi"
        : "Maya Chen";
  const href = (destination: string) => `${workspace.href}/${destination}`;
  const folderName = (areaId: string) => {
    const names: Record<string, Record<string, string>> = {
      quality: { monitoring: "Quality reviews", reviews: "Review notes" },
      legal: {
        review: "Advice coordination",
        compliance: "Compliance reviews",
        policy: "Policy changes",
        privacy: "Privacy assessments",
        risk: "Assurance",
        audit: "Audit coordination",
        contracts: "Supplier contracts",
      },
      digital: {
        architecture: "Decision records",
        operations: "Service changes",
      },
      people: {
        hiring: "Role & interview planning",
        learning: "Learning programmes",
      },
      customer: {
        care: "Care standards",
        premium: "Care continuity",
        quality: "Interaction quality",
        meetings: "Meeting preparation",
      },
    };
    return (
      names[workspace.id]?.[areaId] ||
      config.areas.find((a) => a.id === areaId)?.name ||
      "Documents"
    );
  };
  function documentFolder(f: WorkingFile) {
    if (workspace.id === "people" && f.area === "communications")
      return f.name.startsWith("Intranet")
        ? "Intranet & Wiki/Publishing"
        : "All-staff meetings/October 2026";
    if (workspace.id === "digital") {
      const digitalFolders: Record<string, string> = {
        engineering: "API Design",
        "web-crm": "Web & CRM",
        "systems-engineering": "Business Systems",
        "ai-automation": "AI & Automation",
        m365: "M365 & SPFx",
      };
      const subfolder =
        f.area === "web-crm"
          ? /Release|Deployment/.test(f.name)
            ? "Release planning"
            : /Incident|Debt/.test(f.name)
              ? "Reviews"
              : "Platform design"
          : f.area === "ai-automation"
            ? /Evaluation|Benchmark|Test/.test(f.name)
              ? "Evaluation"
              : "Design"
            : "Current work";
      return `${digitalFolders[f.area] || folderName(f.area)}/${subfolder}`;
    }
    return `${folderName(f.area)}/2026`;
  }
  function libraryFiles(l: SiteLibrary): LibraryDocument[] {
    return config.files
      .filter((f) => l.areas.includes(f.area))
      .map((f) => ({
        id: f.id,
        name: f.name,
        folder: documentFolder(f),
        modified: f.modified,
        owner: f.owner,
        status: f.status,
        metadata: { Period: "2026" },
      }));
  }
  function openSearchFile(id: string) {
    const f = config.files.find((x) => x.id === id);
    const l = siteLibraries.find((x) => x.areas.includes(f?.area || ""));
    if (l) location.assign(`${href(l.id)}?file=${encodeURIComponent(id)}`);
  }
  function relatedLinks(l?: SiteLibrary) {
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
      workspace.id === "people" ||
      workspace.id === "digital" ||
      workspace.id === "customer" ||
      workspace.id === "quality" ||
      (workspace.id === "services" && (!area || page === "purchasing")) ? (
      <details>
        <summary>Related links</summary>
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
          {workspace.id === "services" && (!area || page === "purchasing") && (
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
          {workspace.id === "people" && l?.areas.includes("employment") && (
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
                      aria-label={`Work status ${x.id}`}
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
          <LockClosed20Regular />
          <h1>Access denied</h1>
          <p>
            Council participation is independent of People & Culture membership.
          </p>
          <a href="/people-culture/employment">Return to People & Culture →</a>
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
        <header>Digital & Technology · Partner preview</header>
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
        userRole={
          workspace.id === "digital"
            ? "Platform Engineer"
            : workspace.id === "people"
              ? "Learning Partner"
              : "Workspace member"
        }
        searchFiles={config.files}
        onOpen={(f) => openSearchFile(f.id)}
        onTeams={() =>
          location.assign(
            `/teams?staff=${workspace.id === "people" ? "elena" : workspace.id === "digital" ? "devon" : "jordan"}&workspace=${workspace.id}`,
          )
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
                href={href("working-documents")}
                aria-current={page === "working-documents" ? "page" : undefined}
              >
                Working documents
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
                aria-current={isCommunityPage ? "page" : undefined}
              >
                Staff communities
              </a>
            )}
            {workspace.id !== "archives" && config.protected.length > 0 && (
              <a
                href={href("protected")}
                aria-current={page === "protected" ? "page" : undefined}
              >
                <LockClosed20Regular />
                Restricted
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
              {notice}
              <button onClick={() => setNotice("")}>Dismiss</button>
            </p>
          )}
          {subject || !known ? (
            <section
              className={`functional-denied ${subject?.strict ? "strict" : ""}`}
            >
              <LockClosed20Regular />
              {subject?.strict && (
                <span className="strict-label">
                  {workspace.id === "people"
                    ? "Strictly confidential"
                    : "Restricted"}
                </span>
              )}
              <h1>Access denied</h1>
              <h2>{subject?.name || "This location is unavailable"}</h2>
              <p>Specific authorisation is required.</p>
              <a
                href={`/service-desk/access-request?${new URLSearchParams({ workspace: workspace.title, area: subject?.name || "Restricted", location: `${workspace.title} / ${subject?.name || "Restricted"}` })}`}
              >
                Request access →
              </a>
              <p>
                <a href={workspace.href}>Return to workspace</a>
              </p>
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
              <p>Simulated external destination.</p>
              <a href={workspace.href}>Back to workspace</a>
            </section>
          ) : workspace.id === "archives" && page !== "working-documents" ? (
            <>
              <h1>{page === "home" ? workspace.title : area?.name}</h1>
              <ArchivePane
                page={page}
                region={parts[2]}
                items={items}
                onItem={setSelected}
              />
            </>
          ) : page === "home" ? (
            <>
              <h1>{workspace.title}</h1>
              <p className="functional-intro">{workspace.description}</p>
              <DocumentLibrary
                key={primaryLibrary.id}
                title={primaryLibrary.name}
                files={libraryFiles(primaryLibrary)}
                folders={[
                  ...new Set(
                    libraryFiles(primaryLibrary).map(
                      (f) => f.folder.split("/")[0],
                    ),
                  ),
                ]}
                embedded
              />
              <section>
                <h2>Quick links</h2>
                <div className="functional-context-links">
                  {siteLibraries.map((l) => (
                    <a key={l.id} href={href(l.id)}>
                      {l.name}
                    </a>
                  ))}
                  {workspace.id === "digital" && (
                    <a href="/teams?staff=devon&workspace=digital&channel=Innovators">
                      Engineering discussions in Teams ↗
                    </a>
                  )}
                  {workspace.id === "people" && (
                    <a href={href("communities")}>Staff communities</a>
                  )}
                  {config.protected.length > 0 && (
                    <a href={href("protected")}>
                      <LockClosed20Regular />
                      Restricted
                    </a>
                  )}
                </div>
              </section>
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
              <h1>Restricted</h1>
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
                folders={[
                  ...new Set(
                    libraryFiles(library).map((f) => f.folder.split("/")[0]),
                  ),
                ]}
                initialFolder={
                  area
                    ? documentFolder(
                        config.files.find((f) => f.area === area.id) ||
                          ({ area: area.id } as WorkingFile),
                      ).split("/")[0]
                    : undefined
                }
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
