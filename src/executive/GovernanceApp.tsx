import StaffLink from "../components/StaffLink";
import { canAccessArea } from "../access/policy";
import { resolveStaffPerson } from "../intranet/catalog";
import { withExplicitStaff } from "../utils/staffNavigation";
import { useState } from "react";
import AccessBoundary from "../access/AccessBoundary";
import NavigationIcon from "../components/NavigationIcon";
import PocAnnotation from "../components/PocAnnotation";
import {
  LockClosed20Regular,
  ShieldCheckmark24Regular,
} from "@fluentui/react-icons";
import "./styles.css";
const links = [
  { id: "approved", name: "Approved governance outcomes" },
  { id: "oversight", name: "Oversight Committee" },
  { id: "members", name: "Members Assembly" },
  { id: "calendar", name: "Governance Calendar" },
  { id: "decisions", name: "Formal Decisions" },
  { id: "papers", name: "Meeting Papers" },
  { id: "mandates", name: "Mandates & Appointments" },
  { id: "information", name: "Member Information" },
  { id: "records", name: "Governance Records" },
];
import { governanceRecords } from "./governanceData";
export default function GovernanceApp() {
  const page = location.pathname.split("/")[2] || "home";
  const person = resolveStaffPerson(
    new URLSearchParams(location.search).get("staff"),
  );
  const permitted = canAccessArea(person, "governance", page);
  const role: string = "liaison";
  const [record, setRecord] = useState("");
  const visible = permitted
    ? governanceRecords.filter((record) => record.id === "GOV-2026-04")
    : [];
  return (
    <div className="governance-app">
      <header className="governance-header">
        <ShieldCheckmark24Regular />
        <div>
          <strong>Governance & Members Portal</strong>
          <span>Formal governance · Separate controlled environment</span>
        </div>
        <StaffLink href={withExplicitStaff("/executive")}>
          Return to executive workspace ↗
        </StaffLink>
      </header>
      <div className="governance-layout">
        <nav aria-label="Governance navigation">
          <StaffLink href={withExplicitStaff("/governance")}>
            <NavigationIcon kind="home" />
            Portal home
          </StaffLink>
          {links.map((l) => (
            <StaffLink
              key={l.id}
              aria-current={page === l.id ? "page" : undefined}
              href={withExplicitStaff(`/governance/${l.id}`)}
            >
              <LockClosed20Regular />
              {l.name}
            </StaffLink>
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
          <p className="governance-access-context">
            Executive workspace membership does not grant access. Each
            governance body has its own audience.
          </p>
          {!permitted ? (
            <AccessBoundary
              workspaceId="governance"
              personId={person.id}
              resource={{
                kind: "area",
                workspaceId: "governance",
                areaId: page,
              }}
              area={
                links.find((link) => link.id === page)?.name ||
                "Governance participation"
              }
              headingLevel={2}
              returnHref="/executive"
              returnLabel="Return to executive workspace"
              strict
            />
          ) : (
            <>
              <PocAnnotation title="Fictional participation" variant="inline">
                {person.name}. No personal member records.
              </PocAnnotation>
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
                      <PocAnnotation title="Fictional record" variant="inline">
                        Fictional low-detail governance example. No confidential
                        paper text or member deliberation is reproduced.
                      </PocAnnotation>
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
            <StaffLink href="/executive/oversight">
              Executive-side preparation and follow-up ↗
            </StaffLink>
          </section>
        </main>
      </div>
    </div>
  );
}
