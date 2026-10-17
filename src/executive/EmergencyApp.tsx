import { canAccessEmergency } from "../access/policy";
import { useState, useEffect } from "react";
import AccessBoundary from "../access/AccessBoundary";
import PocAnnotation from "../components/PocAnnotation";
import {
  Button,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@fluentui/react-components";
import { LockClosed20Regular } from "@fluentui/react-icons";
import TeamsShell, { TeamsComposer } from "../teams/TeamsShell";
import { teamsGroups } from "../teams/navigation";
import { resolveStaffPerson } from "../intranet/catalog";
import DocumentLibrary from "../sharepoint/DocumentLibrary";
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
import "./emergency-teams.css";
export default function EmergencyApp() {
  const requestedStaff = new URLSearchParams(location.search).get("staff");
  const requestedPerson = resolveStaffPerson(requestedStaff);
  const [incidents, setIncidents] = useState(initialIncidents),
    [tab, setTab] = useState("Posts"),
    [post, setPost] = useState("");
  const initialId = location.pathname.split("/")[3];
  const [selectedId, setSelectedId] = useState(initialId || "");
  const incident = incidents.find((i) => i.id === selectedId),
    archived = incident?.status === "Archived";
  const responseLead =
    !!incident &&
    incident.lead === requestedPerson.name &&
    canAccessEmergency(requestedPerson, incident.id);
  const visibleIncidents = incidents.filter((item) =>
    canAccessEmergency(requestedPerson, item.id),
  );
  const responseAccess = incident
    ? visibleIncidents.includes(incident)
    : !initialId && visibleIncidents.length > 0;
  const baseGroups = teamsGroups(requestedPerson).filter(
    (group) => group.id !== "emergency",
  );
  const groups = [
    ...baseGroups,
    ...(visibleIncidents.length
      ? [
          {
            id: "emergency",
            label: "Emergency Response",
            initials: "ER",
            channels: visibleIncidents.map((i) => ({
              id: `emergency:${i.id}`,
              label: `${i.id} · ${i.title}`,
              private: true,
              onSelect: () => openIncident(i.id),
            })),
          },
        ]
      : []),
  ];
  useEffect(() => {
    const back = () => {
      setSelectedId(location.pathname.split("/")[3] || "");
      setTab("Posts");
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
    history.pushState(
      {},
      "",
      `/emergency-response/incidents/${id}${requestedPerson ? `?staff=${requestedPerson.id}` : ""}`,
    );
    window.dispatchEvent(new Event("workspace:navigation"));
  }
  function submitFlow() {
    if (!responseLead) return;
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
      <TeamsShell
        userName={requestedPerson?.name || incident?.lead || "Drew Ellis"}
        teamName="Emergency Response"
        channelName={
          responseAccess && incident
            ? `${incident.id} · ${incident.title}`
            : "Incident responses"
        }
        groups={groups}
        selectedChannelId={`emergency:${selectedId}`}
        activeTab={tab === "Files" ? "Shared" : tab}
        onTabChange={(next) => setTab(next === "Shared" ? "Files" : next)}
        tabs={
          incident && responseAccess
            ? [
                "Posts",
                "Shared",
                "Actions",
                "Timeline",
                "Decisions",
                "Participants",
              ]
            : ["Posts"]
        }
        privateChannel={!!incident}
        onChannelInfo={
          incident && responseAccess ? () => setTab("Participants") : undefined
        }
        headerActions={
          incident && !archived && responseLead ? (
            <Button
              appearance="subtle"
              onClick={() => {
                setError("");
                setRecordsCaptured(false);
                setFlow("close");
              }}
            >
              Close response
            </Button>
          ) : undefined
        }
        navigationFooter={
          <>
            {responseLead && (
              <Button
                appearance="subtle"
                onClick={() => {
                  setError("");
                  setFlow("create");
                }}
              >
                Create incident response
              </Button>
            )}
          </>
        }
      >
        <div className="emergency-channel-surface">
          <div className="emergency-channel-content">
            {requestedPerson && !responseAccess ? (
              <AccessBoundary
                workspaceId="emergency"
                area="Private incident response"
                resource={
                  initialId
                    ? { kind: "emergency", incidentId: initialId }
                    : undefined
                }
                personId={requestedPerson.id}
                headingLevel={2}
                compact
                strict
                returnHref={`/teams?staff=${requestedPerson.id}`}
                returnLabel="Open your Teams view"
              />
            ) : !incident ? (
              <>
                {initialId && <h2>Response not available</h2>}
                {visibleIncidents.map((i) => (
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
                <div className="emergency-incident-context">
                  <strong>Strictly confidential</strong>
                  <span>Lead: {incident.lead}</span>
                  <span>{incident.severity}</span>
                  <span>{incident.started.replace("T", " ")}</span>
                  <span className="incident-status">{incident.status}</span>
                </div>
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
                    <div className="m365-teams-feed emergency-posts">
                      {incident.posts.map((p, index) => (
                        <article className="m365-teams-post" key={index}>
                          <header className="m365-teams-post-header">
                            <span className="m365-teams-avatar">
                              {p.author
                                .split(" ")
                                .slice(0, 2)
                                .map((n) => n[0])
                                .join("")}
                            </span>
                            <div>
                              <strong>{p.author}</strong>
                              <small>
                                <time>{p.time}</time>
                              </small>
                            </div>
                          </header>
                          <p data-no-translate={p.time === "Now" || undefined}>
                            {p.text}
                          </p>
                        </article>
                      ))}
                      <TeamsComposer
                        value={post}
                        onChange={setPost}
                        placeholder={
                          archived ? "This channel is archived" : "Start a post"
                        }
                        disabled={archived}
                        onSend={() => {
                          if (!post.trim() || archived) return;
                          change((i) => ({
                            ...i,
                            posts: [
                              ...i.posts,
                              {
                                author: i.lead,
                                text: post.trim(),
                                time: "Now",
                              },
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
                      />
                    </div>
                  </>
                ) : tab === "Files" ? (
                  <section>
                    <DocumentLibrary
                      key={incident.id}
                      title="Documents"
                      headingLevel={2}
                      readOnly={archived}
                      files={incident.files.map((f) => ({
                        id: f.id,
                        name: f.name,
                        folder: "",
                        owner: incident.lead,
                        modified: incident.started.slice(0, 10),
                        status: archived ? "Archived" : "Working",
                        metadata: { Sensitivity: "Strictly confidential" },
                      }))}
                    />
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
                    {!archived && responseLead && (
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
                              {
                                time: "Now",
                                text: "Response decision recorded",
                              },
                            ],
                          }));
                          setDecisionName("");
                          setDecisionRationale("");
                        }}
                      >
                        <h3>Record a decision</h3>
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
                            onChange={(e) =>
                              setDecisionRationale(e.target.value)
                            }
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
                    {incident.participants.map((p) => (
                      <div className="incident-participant" key={p.name}>
                        <div>
                          <strong>{p.name}</strong>
                          <small>{p.role} · This incident only</small>
                        </div>
                        {p.name !== incident.lead && responseLead && (
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
                      disabled={archived || !responseLead}
                      onClick={() => {
                        setError("");
                        setFlow("participant");
                      }}
                    >
                      Add participant
                    </Button>
                  </section>
                )}
              </>
            )}
          </div>
        </div>
      </TeamsShell>
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
                <PocAnnotation title="Simulation only" variant="inline">
                  Use fictional, low-detail values. No channel or membership is
                  created outside this browser.
                </PocAnnotation>
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
