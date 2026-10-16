import { useState } from "react";
import {
  Button,
  Drawer,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerBody,
} from "@fluentui/react-components";
import {
  Dismiss20Regular,
  LockClosed20Regular,
  LeafTwo24Regular,
} from "@fluentui/react-icons";
import WorkspaceHeader from "../logistics/WorkspaceHeader";
import {
  workspaceRegistry,
  crossWorkspaceHandoffs,
  workspaceById,
} from "./registry";
import { configById } from "./config";
import type { WorkingFile, WorkingItem } from "./types";
import ArchivePane from "./ArchivePane";
import DocumentIcon from "../components/DocumentIcon";
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
  const parts = location.pathname.split("/").filter(Boolean),
    workspace =
      workspaceRegistry.find((w) => w.href === `/${parts[0]}`) ||
      workspaceById.get(providedId || "services")!,
    config = configById.get(workspace.id)!;
  const page = parts[1] || "home",
    area = config.areas.find((a) => a.id === page),
    subject = config.protected.find(
      (s) =>
        (s.id === parts[2] && (page === "protected" || s.area === page)) ||
        (s.id === page && parts[1] !== "home"),
    ),
    tool =
      page === "systems"
        ? config.tools.find((t) => t.id === parts[2])
        : undefined;
  const [items, setItems] = useState(config.items),
    [selected, setSelected] = useState<WorkingItem>(),
    [file, setFile] = useState<WorkingFile>(),
    [notice, setNotice] = useState(""),
    [filter, setFilter] = useState(""),
    [view, setView] = useState("Current work"),
    [comment, setComment] = useState(""),
    [comments, setComments] = useState<Record<string, string[]>>({});
  const scope = page === "home" ? items : items.filter((x) => x.area === page),
    visible = scope.filter(
      (x) =>
        `${x.name} ${x.owner} ${x.status}`
          .toLowerCase()
          .includes(filter.toLowerCase()) &&
        (view !== "Needs review" || x.status === "Needs review") &&
        (view !== "Awaiting input" || x.status === "Awaiting input") &&
        (view !== "Completed" || x.status === "Complete") &&
        (view !== "Current work" || x.status !== "Complete"),
    );
  const relevantHandoffs = crossWorkspaceHandoffs
    .filter((h) => h.steps.some((s) => s.href.startsWith(workspace.href)))
    .slice(0, 2);
  const href = (area: string) => `${workspace.href}/${area}`;
  const toolsLink = (toolId: string, label?: string) => {
    const t = config.tools.find((t) => t.id === toolId);
    return t ? (
      <a
        href={
          toolId === "freshservice"
            ? "/service-desk/it-support"
            : `${workspace.href}/systems/${toolId}`
        }
      >
        {label || `Open ${t.name}`} ↗
      </a>
    ) : null;
  };
  function fileList(list: WorkingFile[]) {
    return (
      <div className="functional-files">
        {list.map((f) => (
          <button key={f.id} onClick={() => setFile(f)}>
            <DocumentIcon name={f.name} />
            <span>
              {f.name}
              <small>
                {f.owner} · {f.modified}
              </small>
            </span>
          </button>
        ))}
      </div>
    );
  }
  function register() {
    return (
      <>
        <div className="functional-toolbar">
          <select
            aria-label="Work view"
            value={view}
            onChange={(e) => setView(e.target.value)}
          >
            {[
              "Current work",
              "Needs review",
              "Awaiting input",
              "Completed",
              "All work",
            ].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
          <input
            aria-label="Filter work"
            placeholder="Filter this working queue"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className="functional-table">
          <table>
            <thead>
              <tr>
                {[
                  "Work / review",
                  "Owner",
                  "Status",
                  "Next action / handoff",
                  "Due",
                ].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((x) => (
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
                  <td>{x.nextAction}</td>
                  <td>{x.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visible.length && <p>No matching work in this view.</p>}
        </div>
      </>
    );
  }
  if (location.pathname.startsWith("/employee-council"))
    return (
      <div className="council-boundary">
        <header>
          Employee Representative Council · Separate controlled environment
        </header>
        <main>
          <LockClosed20Regular />
          <h1>Access denied</h1>
          <p>
            Council participation is independent of People & Culture membership.
            Internal deliberations and member records are not included in this
            preview.
          </p>
          <a href="/people-culture/employment">
            Return to approved consultation coordination →
          </a>
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
        <header>Digital & Technology · Scoped technical collaboration</header>
        <main>
          <small>EXPLICIT EXTERNAL PARTNER PREVIEW</small>
          <h1>Web platform implementation review</h1>
          <p>Approved technical review material for this engagement only.</p>
          {fileList(
            config.files.filter((f) =>
              [
                "Deployment Checklist.docx",
                "Integration Architecture.pptx",
              ].includes(f.name),
            ),
          )}
          <p>
            <a href="/content-delivery/digital">
              Source content requirements and acceptance ↗
            </a>
          </p>
          <a href="/digital-tech/web-crm">
            Leave preview and return to internal technical work →
          </a>
        </main>
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
                  aria-label="Close partner file"
                  onClick={() => setFile(undefined)}
                >
                  Close
                </Button>
              }
            >
              Approved technical review
            </DrawerHeaderTitle>
          </DrawerHeader>
          <DrawerBody>
            <h2>{file?.name}</h2>
            <p>
              Synthetic engagement-scoped working review. No production
              credentials or environment details.
            </p>
          </DrawerBody>
        </Drawer>
      </div>
    );
  const known =
    page === "home" || !!area || !!tool || !!subject || page === "protected";
  return (
    <div
      className={`app-shell services-app functional-app ${workspace.id === "archives" ? "archives-app" : ""}`}
    >
      <a className="skip-link" href="#functional-main">
        Skip to workspace
      </a>
      <WorkspaceHeader
        title={workspace.title}
        userName={
          workspace.id === "digital"
            ? "Devon Park"
            : workspace.id === "people"
              ? "Elena Rossi"
              : "Maya Chen"
        }
        userRole={
          workspace.id === "digital"
            ? "Platform Engineer"
            : workspace.id === "people"
              ? "Learning Partner"
              : "Workspace member and contributor"
        }
        searchFiles={config.files}
        onOpen={(f) => setFile(config.files.find((x) => x.id === f.id))}
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
            {config.areas.map((a) => (
              <a
                key={a.id}
                href={href(a.id)}
                aria-current={page === a.id ? "page" : undefined}
              >
                {a.id === "eco" && <LeafTwo24Regular />}
                {a.name}
              </a>
            ))}
          </nav>
        </aside>
        <main className="services-main functional-main" id="functional-main">
          <div className="functional-breadcrumb">
            <a href={workspace.href}>{workspace.title}</a> /{" "}
            {subject ? "Access required" : tool?.name || area?.name || "Home"}
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
                    ? "STRICTLY CONFIDENTIAL"
                    : "STRICTLY RESTRICTED"}
                </span>
              )}
              <h1>Access denied</h1>
              <h2>{subject?.name || "This location is unavailable"}</h2>
              <p>
                This subject requires specific authorised participation. No
                underlying records or sensitive metadata are included.
              </p>
              <a href={workspace.href}>Return to shared workspace →</a>
            </section>
          ) : tool ? (
            <section className="functional-system">
              <small>AUTHORITATIVE SYSTEM · SIMULATED DESTINATION</small>
              <h1>{tool.name}</h1>
              <p>{tool.purpose}</p>
              {tool.id === "github" ? (
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
                  <p>
                    Fictional repository reference. No genuine company
                    repository or source code is exposed.
                  </p>
                </>
              ) : (
                <p>
                  Working context remains in this workspace; the specialist
                  platform owns its detailed records.
                </p>
              )}
              <a href={workspace.href}>Back to current work →</a>
            </section>
          ) : (
            <>
              <h1>{page === "home" ? workspace.title : area?.name}</h1>
              {page === "home" && workspace.id !== "archives" && (
                <p className="functional-intro">{workspace.description}</p>
              )}
              {workspace.id === "archives" ? (
                <ArchivePane
                  page={page}
                  region={parts[2]}
                  items={items}
                  onItem={setSelected}
                />
              ) : page === "home" ? (
                <>
                  <section>
                    <h2>
                      {workspace.id === "services"
                        ? "Current service requests"
                        : "Active work"}
                    </h2>
                    {(workspace.id === "services"
                      ? [
                          ...config.areas.map((a) =>
                            items.find((x) => x.area === a.id)!,
                          ),
                          items[1],
                        ]
                      : items.slice(0, 5)
                    ).map((x) => (
                      <button
                        className="functional-work-row"
                        key={x.id}
                        onClick={() => setSelected(x)}
                      >
                        <strong>{x.name}</strong>
                        <span>
                          {x.status} · {x.nextAction}
                        </span>
                      </button>
                    ))}
                  </section>
                  <div className="functional-two-columns">
                    <section>
                      <h2>Needs review</h2>
                      {items
                        .filter((x) => x.status === "Needs review")
                        .slice(0, 3)
                        .map((x) => (
                          <a
                            className="functional-simple-row"
                            key={x.id}
                            href={href(x.area)}
                          >
                            {x.name}
                            <span>{x.due}</span>
                          </a>
                        ))}
                    </section>
                    <section>
                      <h2>Continue the work</h2>
                      {config.areas
                        .filter((a) => a.id !== "protected")
                        .slice(0, 5)
                        .map((a) => (
                          <a
                            className="functional-simple-row"
                            key={a.id}
                            href={href(a.id)}
                          >
                            {a.id === "eco" && <LeafTwo24Regular />}
                            {a.name} →
                          </a>
                        ))}
                    </section>
                  </div>
                  <section>
                    <h2>Connected handoffs</h2>
                    {relevantHandoffs.map((h) => (
                      <div key={h.id} className="functional-handoff">
                        <strong>{h.name}</strong>
                        <div>
                          {h.steps.map((s) => (
                            <a key={s.href} href={s.href}>
                              {s.name} →
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                    {workspace.id === "customer" && (
                      <a href="/quality-monitoring/process">
                        Systemic process improvement handoff →
                      </a>
                    )}
                    {workspace.id === "quality" && (
                      <a href="/customer-relations/quality">
                        Customer interaction quality stays with Customer Care →
                      </a>
                    )}
                  </section>
                </>
              ) : (
                <>
                  <p className="functional-intro">{area?.summary}</p>
                  {area?.tool && (
                    <p className="functional-context-tool">
                      {toolsLink(area.tool)}
                    </p>
                  )}
                  {config.id === "quality" && page === "improvement" && (
                    <p>
                      <a href="/projects">
                        Formal project initiation, control and support →
                        Projects
                      </a>
                    </p>
                  )}
                  {config.id === "digital" && page === "web-crm" && (
                    <p>
                      <a href="/projects/PRJ-2026-014">
                        PRJ-2026-014 · Customer Platform Renewal → Delivery
                        coordination
                      </a>
                    </p>
                  )}
                  {config.id === "people" && page === "hiring" && (
                    <p>
                      <a href="/projects/PRJ-2026-034">
                        PRJ-2026-034 · New Starter Experience Redesign → Project
                        coordination
                      </a>
                    </p>
                  )}
                  {page !== "protected" && register()}
                  {workspace.id === "digital" && (
                    <section className="functional-context-links">
                      <a href="/teams?staff=devon&workspace=digital&channel=Innovators">
                        Innovators · Engineering discussions →
                      </a>
                      <a href="/teams?staff=devon&workspace=digital&channel=AI+Lab">
                        AI Lab · Evaluation discussions →
                      </a>
                      {page === "web-crm" && (
                        <>
                          <a href="/content-delivery/digital">
                            Content requirements and acceptance ↗
                          </a>
                          {toolsLink("datadog")}
                          {toolsLink("contentful")}
                        </>
                      )}
                      {page === "systems-engineering" && (
                        <a href="/people-culture/workforce">
                          People process and employment ownership ↗
                        </a>
                      )}
                      {page === "information-architecture" && (
                        <a href="/archives/retention">
                          Records-owned retention requirements ↗
                        </a>
                      )}
                      {page === "ai-automation" && (
                        <a href="/audience-innovation/automation">
                          Business hypothesis and evaluation ↗
                        </a>
                      )}
                      {page === "m365" && (
                        <a href="/people-culture/communications">
                          Internal publishing ownership ↗
                        </a>
                      )}
                    </section>
                  )}
                  {workspace.id === "people" && page === "communications" && (
                    <section>
                      <h2>Company All-Staff Meeting · Monthly cycle</h2>
                      <p>
                        Agenda → speakers → slide deck → run of show → questions
                        & follow-up → recording and publication.
                      </p>
                      <a href="/digital-tech/m365">
                        Technical intranet and wiki platform support ↗
                      </a>
                    </section>
                  )}
                  {workspace.id === "people" && page === "communities" && (
                    <section>
                      <h2>Staff Communities</h2>
                      {networks.map((n) => (
                        <div className="functional-community" key={n}>
                          <strong>{n}</strong>
                          <p>
                            Staff-led, opt-in community. Open events and public
                            announcements are shared here. To join, contact the
                            network coordinator; participation is voluntary.
                          </p>
                          <a href="/people-culture/communities/network-membership">
                            Private community collaboration →
                          </a>
                        </div>
                      ))}
                      <a href="/services/reception">
                        Company event rooms, catering and setup handoff ↗
                      </a>
                    </section>
                  )}
                  {workspace.id === "people" && page === "employment" && (
                    <a href="/employee-council">
                      Employee Representative Council · Separate controlled
                      environment ↗
                    </a>
                  )}
                  {workspace.id === "services" && page === "purchasing" && (
                    <section className="functional-context-links">
                      <a href="/legal-compliance/contracts">
                        Legal and privacy contract review ↗
                      </a>
                      <a href="/financial-operations/payments">
                        Approved obligation → payment and accounting ↗
                      </a>
                      <a href="/quality-monitoring/process">
                        Supplier process improvement ↗
                      </a>
                    </section>
                  )}
                  {workspace.id === "customer" && page === "quality" && (
                    <a href="/quality-monitoring/process">
                      Escalate systemic handoff issue to Process Management ↗
                    </a>
                  )}
                  {config.files.some((f) => f.area === page) && (
                    <section>
                      <h2>Working material</h2>
                      {fileList(config.files.filter((f) => f.area === page))}
                    </section>
                  )}
                  {config.protected.filter(
                    (s) => s.area === page || page === "protected",
                  ).length > 0 && (
                    <section>
                      <h2>Controlled subjects</h2>
                      <div className="functional-protected-links">
                        {config.protected
                          .filter(
                            (s) => s.area === page || page === "protected",
                          )
                          .map((s) => (
                            <a
                              key={s.id}
                              href={`${workspace.href}/${s.area}/${s.id}`}
                            >
                              <LockClosed20Regular />
                              {s.name}
                              {s.strict && workspace.id === "people" && (
                                <small>STRICTLY CONFIDENTIAL</small>
                              )}
                            </a>
                          ))}
                      </div>
                    </section>
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>
      <Drawer
        open={!!selected || !!file}
        onOpenChange={(_, d) => {
          if (!d.open) {
            setSelected(undefined);
            setFile(undefined);
            setComment("");
          }
        }}
      >
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <Button
                icon={<Dismiss20Regular />}
                aria-label="Close working details"
                onClick={() => {
                  setSelected(undefined);
                  setFile(undefined);
                }}
              />
            }
          >
            {selected ? "Work & review" : "Working material"}
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
          {selected ? (
            <>
              <h2>{selected.name}</h2>
              <p>
                {selected.owner} ·{" "}
                {items.find((x) => x.id === selected.id)?.status} · Due{" "}
                {selected.due}
              </p>
              <h3>Next action</h3>
              <p>{selected.nextAction}</p>
              <a href={href(selected.area)}>
                Continue in{" "}
                {config.areas.find((a) => a.id === selected.area)?.name} →
              </a>
              <h3>Review discussion</h3>
              {(comments[selected.id] || []).map((c, i) => (
                <p key={i}>Maya Chen: {c}</p>
              ))}
              <label>
                Add a working review note
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
                Add review note
              </Button>
            </>
          ) : (
            file && (
              <>
                <h2>{file.name}</h2>
                <p>
                  {file.owner} · {file.modified}
                </p>
                <p>
                  Working review and handoff context ·{" "}
                  {config.areas.find((a) => a.id === file.area)?.name}
                </p>
                <a href={href(file.area)}>Open canonical working area →</a>
              </>
            )
          )}
        </DrawerBody>
      </Drawer>
    </div>
  );
}
