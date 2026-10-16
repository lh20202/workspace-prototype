import { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@fluentui/react-components";
import {
  ShieldLock24Regular,
  LockClosed20Regular,
} from "@fluentui/react-icons";
import DocumentIcon from "../components/DocumentIcon";
import {
  initialIncidents,
  createIncident,
  updateIncident,
  addParticipant,
  closeIncident,
  specialistRoles,
  type Incident,
} from "./incidentData";
import "./styles.css";
export default function EmergencyApp() {
  const [incidents, setIncidents] = useState(initialIncidents),
    [tab, setTab] = useState("Posts"),
    [post, setPost] = useState(""),
    [file, setFile] = useState("");
  const initialId = location.pathname.split("/")[3];
  const [selectedId, setSelectedId] = useState(initialId || "");
  const incident = incidents.find((i) => i.id === selectedId),
    archived = incident?.status === "Archived";
  useEffect(() => {
    const back = () => {
      setSelectedId(location.pathname.split("/")[3] || "");
      setTab("Posts");
      setFile("");
      setPost("");
    };
    window.addEventListener("popstate", back);
    return () => window.removeEventListener("popstate", back);
  }, []);
  const [flow, setFlow] = useState<"" | "create" | "participant" | "close">("");
  const [newId, setNewId] = useState("INC-113"),
    [newTitle, setNewTitle] = useState("Demonstration response"),
    [lead, setLead] = useState("Drew Ellis"),
    [severity, setSeverity] = useState("Significant"),
    [started, setStarted] = useState("2026-10-16T11:00"),
    [initialRole, setInitialRole] = useState("IT specialist");
  const [participantName, setParticipantName] = useState("Jordan Lee"),
    [participantRole, setParticipantRole] = useState("Operational specialist"),
    [followup, setFollowup] = useState(
      "Confirm assigned operational follow-up.",
    ),
    [review, setReview] = useState("Synthetic closure review completed."),
    [recordsCaptured, setRecordsCaptured] = useState(false),
    [error, setError] = useState("");
  const [decisionName, setDecisionName] = useState(
      "Confirm temporary operating arrangement",
    ),
    [decisionRationale, setDecisionRationale] = useState(
      "Maintain continuity while assessment continues.",
    );
  function change(fn: (i: Incident) => Incident) {
    if (incident)
      setIncidents((records) => updateIncident(records, incident.id, fn));
  }
  function openIncident(id: string) {
    setSelectedId(id);
    setPost("");
    setDecisionName("Confirm temporary operating arrangement");
    setDecisionRationale("Maintain continuity while assessment continues.");
    setError("");
    setTab("Posts");
    setFile("");
    history.pushState({}, "", `/emergency-response/incidents/${id}`);
    window.dispatchEvent(new Event("workspace:navigation"));
  }
  function submitFlow() {
    setError("");
    if (flow === "create") {
      if (
        !/^INC-\d{3,6}$/.test(newId) ||
        incidents.some((i) => i.id === newId) ||
        !newTitle.trim() ||
        !lead.trim()
      ) {
        setError(
          "Use a unique synthetic INC- number, working title and response lead.",
        );
        return;
      }
      const next = createIncident(
        newId,
        newTitle.trim(),
        lead.trim(),
        [{ name: "Jordan Lee", role: initialRole }],
        severity,
        started,
      );
      setIncidents([...incidents, next]);
      openIncident(next.id);
      setNewId(
        `INC-${Math.max(...incidents.map((i) => Number(i.id.slice(4))), Number(newId.slice(4))) + 1}`,
      );
    } else if (flow === "participant") {
      if (!participantName.trim()) {
        setError("Enter a fictional participant name.");
        return;
      }
      change((i) =>
        addParticipant(i, {
          name: participantName.trim(),
          role: participantRole,
        }),
      );
    } else if (flow === "close") {
      if (!followup.trim() || !review.trim() || !recordsCaptured) {
        setError(
          "Record follow-up, closure review and evidence capture before closing.",
        );
        return;
      }
      change((i) =>
        closeIncident(i, followup.trim(), review.trim(), recordsCaptured),
      );
    }
    setFlow("");
  }
  return (
    <div className="emergency-app">
      <header className="emergency-header">
        <ShieldLock24Regular />
        <div>
          <strong>Emergency Response</strong>
          <small>Private, incident-specific coordination</small>
        </div>
        <a href="/executive">Leave response environment ↗</a>
      </header>
      <div className="emergency-preview">
        <strong>
          <ShieldLock24Regular />
          STRICTLY CONFIDENTIAL · DEMO PREVIEW
        </strong>
        <p>
          This prototype is showing the structure of the response environment
          for demonstration purposes. In normal use, only authorised incident
          participants would have access.
        </p>
        <small>
          Fictional demonstration data · Previewing each selected response as
          its authorised response lead. Membership in one channel does not grant
          access to another.
        </small>
      </div>
      <div className="emergency-layout">
        <aside>
          <h2>Teams</h2>
          <strong>Emergency Response</strong>
          <p className="emergency-private">
            <LockClosed20Regular />
            Incident-specific membership
          </p>
          {incidents.map((i) => (
            <button
              className="incident-channel"
              key={i.id}
              aria-current={selectedId === i.id ? "page" : undefined}
              onClick={() => openIncident(i.id)}
            >
              <LockClosed20Regular />
              <span>
                {i.id} · {i.title}
                <small>PRIVATE · {i.status}</small>
              </span>
            </button>
          ))}
          <Button
            onClick={() => {
              setError("");
              setFlow("create");
            }}
          >
            Create incident response
          </Button>
        </aside>
        <main>
          {!incident ? (
            <>
              <h1>
                {initialId ? "Response not available" : "Incident responses"}
              </h1>
              <p>
                Each serious incident receives a temporary private channel, its
                own participants and protected file area. No common open
                incident library is created.
              </p>
              <p>
                Select a fictional response to preview its authorised
                coordination structure.
              </p>
              {incidents.map((i) => (
                <button
                  className="incident-overview"
                  key={i.id}
                  onClick={() => openIncident(i.id)}
                >
                  <LockClosed20Regular />
                  <strong>
                    {i.id} · {i.title}
                  </strong>
                  <span>{i.status} · Private response</span>
                </button>
              ))}
            </>
          ) : (
            <>
              <div className="incident-heading">
                <div>
                  <small>
                    <LockClosed20Regular />
                    PRIVATE CHANNEL · {incident.participants.length} authorised
                    participants
                  </small>
                  <h1>
                    {incident.id} · {incident.title}
                  </h1>
                  <p>
                    Response lead: {incident.lead} · Severity:{" "}
                    {incident.severity} · Started{" "}
                    {incident.started.replace("T", " ")}
                  </p>
                </div>
                <span className="incident-status">{incident.status}</span>
              </div>
              <nav
                className="incident-tabs"
                aria-label="Private incident channel tabs"
              >
                {[
                  "Posts",
                  "Files",
                  "Actions",
                  "Timeline",
                  "Decisions",
                  "Participants",
                ].map((t) => (
                  <button
                    key={t}
                    aria-current={tab === t ? "page" : undefined}
                    onClick={() => setTab(t)}
                  >
                    {t}
                  </button>
                ))}
              </nav>
              {archived && (
                <section className="incident-closure">
                  <strong>Response closed · Read-only / archived</strong>
                  <p>
                    Final status: Closed. Outstanding actions:{" "}
                    {
                      incident.actions.filter((a) => a.status !== "Complete")
                        .length
                    }{" "}
                    retained for follow-up.
                  </p>
                  <p>Required follow-up: {incident.closure?.followup}</p>
                  <p>Closure review: {incident.closure?.review}</p>
                  <p>
                    Records captured:{" "}
                    {incident.closure?.records
                      ? "Confirmed · Retained under applicable governance / records controls"
                      : "Pending"}
                  </p>
                </section>
              )}
              {tab === "Posts" ? (
                <>
                  <div className="incident-posts">
                    {incident.posts.map((p, index) => (
                      <article key={index}>
                        <div className="incident-avatar">
                          {p.author
                            .split(" ")
                            .slice(0, 2)
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <strong>{p.author}</strong>
                          <small>{p.time}</small>
                          <p>{p.text}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!post.trim() || archived) return;
                      change((i) => ({
                        ...i,
                        posts: [
                          ...i.posts,
                          { author: i.lead, text: post.trim(), time: "Now" },
                        ],
                        timeline: [
                          ...i.timeline,
                          {
                            time: "Now",
                            text: "Response lead posted an update",
                          },
                        ],
                      }));
                      setPost("");
                    }}
                  >
                    <label htmlFor="response-post">
                      Post a synthetic coordination update
                    </label>
                    <textarea
                      id="response-post"
                      value={post}
                      onChange={(e) => setPost(e.target.value)}
                      disabled={archived}
                      placeholder="Fictional low-detail update only"
                    />
                    <Button type="submit" disabled={archived || !post.trim()}>
                      Post update
                    </Button>
                  </form>
                </>
              ) : tab === "Files" ? (
                <section>
                  <h2>Protected Files · {incident.id}</h2>
                  <p>
                    These files belong only to this private response. They are
                    excluded from executive search, recent work and calendar.
                  </p>
                  {incident.files.map((f) => (
                    <button
                      className="incident-file"
                      key={f.id}
                      onClick={() => setFile(f.id)}
                    >
                      <DocumentIcon name={f.name} />
                      <span>
                        {f.name}
                        <small>
                          {f.id} · {f.incidentId} · Strictly confidential
                        </small>
                      </span>
                    </button>
                  ))}
                  {file && incident.files.some((f) => f.id === file) && (
                    <div className="incident-file-preview" role="status">
                      <h3>{incident.files.find((f) => f.id === file)?.name}</h3>
                      <p>
                        Protected source: private channel {incident.id}.
                        Synthetic structural preview only; no real incident
                        evidence is included.
                      </p>
                      <button onClick={() => setFile("")}>
                        Close file preview
                      </button>
                    </div>
                  )}
                </section>
              ) : tab === "Actions" ? (
                <section>
                  <h2>Live Action Register</h2>
                  <div className="incident-table">
                    <table>
                      <thead>
                        <tr>
                          {[
                            "Action",
                            "Owner",
                            "Priority",
                            "Due",
                            "Status",
                            "Dependency",
                          ].map((h) => (
                            <th key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {incident.actions.map((a) => (
                          <tr key={a.id}>
                            <td>{a.name}</td>
                            <td>{a.owner}</td>
                            <td>{a.priority}</td>
                            <td>{a.due}</td>
                            <td>
                              <select
                                disabled={archived}
                                aria-label={`Action status ${a.name}`}
                                value={a.status}
                                onChange={(e) =>
                                  change((i) => ({
                                    ...i,
                                    actions: i.actions.map((x) =>
                                      x.id === a.id
                                        ? { ...x, status: e.target.value }
                                        : x,
                                    ),
                                  }))
                                }
                              >
                                {[
                                  "To do",
                                  "In progress",
                                  "Blocked",
                                  "Complete",
                                ].map((s) => (
                                  <option key={s}>{s}</option>
                                ))}
                              </select>
                            </td>
                            <td>{a.dependency}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ) : tab === "Timeline" ? (
                <section>
                  <h2>Response timeline</h2>
                  <ol className="incident-timeline">
                    {incident.timeline.map((t, index) => (
                      <li key={index}>
                        <time>{t.time}</time>
                        <span>{t.text}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              ) : tab === "Decisions" ? (
                <section>
                  <h2>Restricted Decision Log</h2>
                  <div className="incident-table">
                    <table>
                      <thead>
                        <tr>
                          {[
                            "Decision",
                            "Time",
                            "Decision maker",
                            "Rationale",
                            "Action",
                            "Status",
                          ].map((h) => (
                            <th key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {incident.decisions.map((d, index) => (
                          <tr key={index}>
                            <td>
                              {d.name}
                              {d.reference && (
                                <p>
                                  <a href="/executive/leadership">
                                    {d.reference} · Separate Leadership Team
                                    permission ↗
                                  </a>
                                </p>
                              )}
                            </td>
                            <td>{d.time}</td>
                            <td>{d.maker}</td>
                            <td>{d.rationale}</td>
                            <td>{d.action}</td>
                            <td>{d.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {!archived && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!decisionName.trim() || !decisionRationale.trim())
                          return;
                        change((i) => ({
                          ...i,
                          decisions: [
                            ...i.decisions,
                            {
                              name: decisionName.trim(),
                              time: "Now",
                              maker: i.lead,
                              rationale: decisionRationale.trim(),
                              action: "Assign follow-up to response lead",
                              status: "Recorded",
                            },
                          ],
                          timeline: [
                            ...i.timeline,
                            { time: "Now", text: "Response decision recorded" },
                          ],
                        }));
                        setDecisionName("");
                        setDecisionRationale("");
                      }}
                    >
                      <h3>Record a synthetic response decision</h3>
                      <label>
                        Decision
                        <input
                          value={decisionName}
                          onChange={(e) => setDecisionName(e.target.value)}
                        />
                      </label>
                      <label>
                        Rationale
                        <textarea
                          value={decisionRationale}
                          onChange={(e) => setDecisionRationale(e.target.value)}
                        />
                      </label>
                      <Button
                        type="submit"
                        disabled={
                          !decisionName.trim() || !decisionRationale.trim()
                        }
                      >
                        Record decision
                      </Button>
                    </form>
                  )}
                </section>
              ) : (
                <section>
                  <h2>Current response group · {incident.id}</h2>
                  <p>
                    Participants are added only for the needs of this incident.
                    This is not a company-wide directory.
                  </p>
                  {incident.participants.map((p) => (
                    <div className="incident-participant" key={p.name}>
                      <div>
                        <strong>{p.name}</strong>
                        <small>{p.role} · This incident only</small>
                      </div>
                      {p.name !== incident.lead && (
                        <Button
                          disabled={archived}
                          onClick={() =>
                            change((i) => ({
                              ...i,
                              participants: i.participants.filter(
                                (x) => x.name !== p.name,
                              ),
                              timeline: [
                                ...i.timeline,
                                {
                                  time: "Now",
                                  text: `${p.role} participation ended`,
                                },
                              ],
                            }))
                          }
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    disabled={archived}
                    onClick={() => {
                      setError("");
                      setFlow("participant");
                    }}
                  >
                    Add participant
                  </Button>
                </section>
              )}
              {!archived && (
                <div className="incident-close-action">
                  <Button
                    onClick={() => {
                      setError("");
                      setRecordsCaptured(false);
                      setFlow("close");
                    }}
                  >
                    Close response
                  </Button>
                  <small>
                    Capture evidence and follow-up, then archive this private
                    channel.
                  </small>
                </div>
              )}
            </>
          )}
        </main>
      </div>
      <Dialog
        open={!!flow}
        onOpenChange={(_, d) => {
          if (!d.open) setFlow("");
        }}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>
              {flow === "create"
                ? "Create incident response"
                : flow === "participant"
                  ? "Add incident-specific participant"
                  : "Close response"}
            </DialogTitle>
            <DialogContent>
              <div className="incident-flow">
                <p>
                  Simulation only. Use fictional, low-detail values. No channel
                  or membership is created outside this browser.
                </p>
                {flow === "create" ? (
                  <>
                    <label>
                      Incident ID
                      <input
                        value={newId}
                        onChange={(e) => setNewId(e.target.value)}
                      />
                    </label>
                    <label>
                      Short working title
                      <input
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                      />
                    </label>
                    <label>
                      Response lead
                      <input
                        value={lead}
                        onChange={(e) => setLead(e.target.value)}
                      />
                    </label>
                    <label>
                      Initial participant · Jordan Lee
                      <select
                        value={initialRole}
                        onChange={(e) => setInitialRole(e.target.value)}
                      >
                        {specialistRoles.map((r) => (
                          <option key={r}>{r}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Severity
                      <select
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value)}
                      >
                        <option>Significant</option>
                        <option>Major</option>
                        <option>Critical</option>
                      </select>
                    </label>
                    <label>
                      Start time
                      <input
                        type="datetime-local"
                        value={started}
                        onChange={(e) => setStarted(e.target.value)}
                      />
                    </label>
                  </>
                ) : flow === "participant" ? (
                  <>
                    <label>
                      Fictional participant name
                      <input
                        value={participantName}
                        onChange={(e) => setParticipantName(e.target.value)}
                      />
                    </label>
                    <label>
                      Required response role
                      <select
                        value={participantRole}
                        onChange={(e) => setParticipantRole(e.target.value)}
                      >
                        {specialistRoles.map((r) => (
                          <option key={r}>{r}</option>
                        ))}
                      </select>
                    </label>
                    <p>
                      Access applies to {incident?.id} only and ends when
                      participation is removed.
                    </p>
                  </>
                ) : (
                  <>
                    <p>Final status: Closed · Channel read-only / archived</p>
                    <p>
                      Outstanding actions:{" "}
                      {
                        incident?.actions.filter((a) => a.status !== "Complete")
                          .length
                      }
                    </p>
                    <label>
                      Required follow-up
                      <textarea
                        value={followup}
                        onChange={(e) => setFollowup(e.target.value)}
                      />
                    </label>
                    <label>
                      Closure review
                      <textarea
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                      />
                    </label>
                    <label className="incident-check">
                      <input
                        type="checkbox"
                        checked={recordsCaptured}
                        onChange={(e) => setRecordsCaptured(e.target.checked)}
                      />
                      Required evidence captured under applicable records
                      controls
                    </label>
                  </>
                )}
                {error && <p role="alert">{error}</p>}
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setFlow("")}>Cancel</Button>
              <Button appearance="primary" onClick={submitFlow}>
                {flow === "create"
                  ? "Create private response channel"
                  : flow === "participant"
                    ? "Add to this incident"
                    : "Confirm closure & archive"}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
}
