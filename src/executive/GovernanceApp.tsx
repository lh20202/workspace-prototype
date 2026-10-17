import { useState } from "react";
import {
  LockClosed20Regular,
  ShieldCheckmark24Regular,
} from "@fluentui/react-icons";
import "./styles.css";
const links = [
  { id: "oversight", name: "Oversight Committee" },
  { id: "members", name: "Members Assembly" },
  { id: "calendar", name: "Governance Calendar" },
  { id: "decisions", name: "Formal Decisions" },
  { id: "papers", name: "Meeting Papers" },
  { id: "mandates", name: "Mandates & Appointments" },
  { id: "information", name: "Member Information" },
  { id: "records", name: "Governance Records" },
];
import { governanceVisible } from "./governanceData";
export default function GovernanceApp() {
  const page = location.pathname.split("/")[2] || "home",
    role = new URLSearchParams(location.search).get("preview") || "none";
  const authorised = role === "committee" || role === "members";
  const permitted =
    authorised &&
    !(page === "oversight" && role !== "committee") &&
    !(page === "members" && role !== "members");
  const [record, setRecord] = useState("");
  const visible = governanceVisible(role);
  return (
    <div className="governance-app">
      <header className="governance-header">
        <ShieldCheckmark24Regular />
        <div>
          <strong>Governance & Members Portal</strong>
          <span>Formal governance · Separate controlled environment</span>
        </div>
        <a href="/executive">Return to executive workspace ↗</a>
      </header>
      <div className="governance-preview">
        <strong>GOVERNANCE ACCESS PREVIEW</strong>
        <label>
          Preview role
          <select
            aria-label="Governance preview role"
            value={authorised ? role : "none"}
            onChange={(e) =>
              location.assign(
                `/governance/${page === "home" ? "" : page}?preview=${e.target.value}`,
              )
            }
          >
            <option value="none">No governance membership</option>
            <option value="committee">Rowan Blake · Committee Member</option>
            <option value="members">Skyler Lane · Member Representative</option>
          </select>
        </label>
        <p>
          Executive workspace membership does not grant access. Each governance
          body has its own audience.
        </p>
      </div>
      <div className="governance-layout">
        <nav aria-label="Governance navigation">
          <a href={`/governance?preview=${role}`}>Portal home</a>
          {links.map((l) => (
            <a
              key={l.id}
              aria-current={page === l.id ? "page" : undefined}
              href={`/governance/${l.id}?preview=${role}`}
            >
              <LockClosed20Regular />
              {l.name}
            </a>
          ))}
        </nav>
        <main>
          <small>
            GOVERNANCE SECRETARIAT /{" "}
            {links.find((l) => l.id === page)?.name || "PORTAL HOME"}
          </small>
          <h1>
            {links.find((l) => l.id === page)?.name ||
              "Governance & Members Portal"}
          </h1>
          {!permitted ? (
            <section className="governance-boundary">
              <LockClosed20Regular />
              <h2>Governance participation required</h2>
              <p>
                Committee papers are restricted to authorised committee
                participants. Members Assembly materials have a separate
                audience. Choose an explicitly labelled fictional governance
                preview above to inspect the structure.
              </p>
              <p>
                No member personal records, appointments data or committee
                deliberations are available in this state.
              </p>
            </section>
          ) : (
            <>
              <p>
                Signed-in preview:{" "}
                {role === "committee"
                  ? "Rowan Blake · Committee Member"
                  : "Skyler Lane · Member Representative"}
                . All examples are fictional and contain no personal member
                records.
              </p>
              {page === "calendar" ? (
                <section>
                  <h2>Governance cycle · October / November 2026</h2>
                  <p>
                    {role === "committee"
                      ? "21 October · Oversight Committee meeting | 28 October · Executive submission deadline"
                      : "12 November · Members Assembly meeting | 5 November · Approved agenda circulation"}
                  </p>
                </section>
              ) : page === "mandates" || page === "information" ? (
                <section>
                  <h2>Controlled register structure</h2>
                  <p>
                    Governance Secretariat maintains mandates, appointments and
                    member information here. No personal or authentic member
                    data is seeded.
                  </p>
                </section>
              ) : (
                <section>
                  <h2>Authoritative governance records</h2>
                  <p>
                    Approved formal records and controlled meeting material
                    remain here; executive liaison links to references instead
                    of copying the papers.
                  </p>
                  {visible.map((r) => (
                    <button
                      className="governance-record"
                      key={r.id}
                      onClick={() => setRecord(r.id)}
                    >
                      <strong>{r.name}</strong>
                      <span>
                        {r.body} · {r.state} · {r.date}
                      </span>
                    </button>
                  ))}
                  {record && visible.some((r) => r.id === record) && (
                    <div className="governance-record-detail" role="status">
                      <h3>{visible.find((r) => r.id === record)?.name}</h3>
                      <p>Record held in the Governance & Members Portal.</p>
                      <p>
                        Fictional low-detail governance example. No confidential
                        paper text or member deliberation is reproduced.
                      </p>
                      <button onClick={() => setRecord("")}>
                        Close record
                      </button>
                    </div>
                  )}
                </section>
              )}
            </>
          )}
          <section>
            <h2>Approved outcomes and executive follow-up</h2>
            <p>
              Some approved outcomes can be shared through authorised
              references. Formal minutes, resolutions and committee/member
              records stay in this portal.
            </p>
            <a href="/executive/oversight">
              Executive-side preparation and follow-up ↗
            </a>
          </section>
        </main>
      </div>
    </div>
  );
}
