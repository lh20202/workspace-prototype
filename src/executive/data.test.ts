import { describe, it, expect } from "vitest";
import {
  canAccess,
  roles,
  visibleFiles,
  files,
  visibleDecisions,
  decisionView,
  views,
  visibleInitiatives,
  executiveCalendar,
} from "./data";
import { governanceVisible } from "./governanceData";
import {
  initialIncidents,
  createIncident,
  updateIncident,
  addParticipant,
  closeIncident,
} from "./incidentData";
import { prototypeForPath } from "../utils/routes";
describe("executive authority boundaries", () => {
  it("separates three restricted working areas from shared coordination", () => {
    for (const role of roles) {
      for (const shared of ["home", "coordination", "decisions", "calendar"])
        expect(canAccess(shared, role.id)).toBe(true);
    }
    for (const area of ["leadership", "oversight", "initiatives"])
      expect(canAccess(area, "base")).toBe(false);
    expect(canAccess("leadership", "oversight")).toBe(false);
    expect(canAccess("oversight", "leadership")).toBe(false);
    expect(canAccess("initiatives", "leadership")).toBe(false);
    expect(canAccess("leadership", "initiative")).toBe(false);
  });
  it("filters search, files and every saved decision view by participation", () => {
    for (const role of roles) {
      const permitted = visibleDecisions(role.id);
      for (const view of views)
        expect(
          decisionView(permitted, view).every((d) => permitted.includes(d)),
        ).toBe(true);
      expect(visibleFiles(role.id).every((f) => files.includes(f))).toBe(true);
    }
    expect(visibleFiles("base").every((f) => f.audience === "base")).toBe(true);
    expect(
      visibleFiles("oversight").some((f) => f.audience === "leadership"),
    ).toBe(false);
    expect(
      visibleDecisions("base").find((d) => d.id === "ED-105"),
    ).toBeUndefined();
  });
  it("limits initiative participants to their own initiative", () => {
    expect(visibleInitiatives("base")).toEqual([]);
    expect(visibleInitiatives("leadership")).toEqual([]);
    expect(visibleInitiatives("initiative").map((x) => x.id)).toEqual([
      "SI-01",
    ]);
    expect(visibleInitiatives("initiative-review")).toHaveLength(5);
  });
  it("never feeds incident or formal committee material into executive shared work", () => {
    expect(
      files.some((f) =>
        /incident|situation|impact assessment|formal minutes|member information/i.test(
          f.name,
        ),
      ),
    ).toBe(false);
    expect(
      executiveCalendar.some((e) =>
        /incident|response|INC-/.test(e.name + e.href),
      ),
    ).toBe(false);
    expect(
      visibleDecisions("base").some((d) =>
        /INC-|Critical Service|Safety Response/.test(JSON.stringify(d)),
      ),
    ).toBe(false);
  });
  it("uses separate routes and independent governance roles", () => {
    expect(prototypeForPath("/executive/leadership")).toBe("executive");
    expect(prototypeForPath("/governance/oversight")).toBe("governance");
    expect(prototypeForPath("/emergency-response/incidents/INC-104")).toBe(
      "emergency",
    );
    expect(governanceVisible("leadership")).toEqual([]);
    expect(governanceVisible("base")).toEqual([]);
    expect(
      governanceVisible("committee").every((r) => r.audience === "committee"),
    ).toBe(true);
    expect(
      governanceVisible("members").every((r) => r.audience === "members"),
    ).toBe(true);
  });
});
describe("incident-specific temporary collaboration", () => {
  it("gives every response its own protected files and participant objects", () => {
    const ids = new Set<string>();
    for (const i of initialIncidents) {
      for (const f of i.files) {
        expect(f.incidentId).toBe(i.id);
        expect(ids.has(f.id)).toBe(false);
        ids.add(f.id);
      }
    }
    expect(initialIncidents[0].participants).not.toBe(
      initialIncidents[1].participants,
    );
  });
  it("creates a private response context without adding it to other responses", () => {
    const next = createIncident(
      "INC-113",
      "Synthetic response",
      "Drew Ellis",
      [{ name: "Jordan Lee", role: "Operational specialist" }],
      "Significant",
      "2026-10-16T11:00",
    );
    expect(next.participants).toHaveLength(2);
    expect(next.timeline[0].time).toBe("11:00");
    expect(next.files.every((f) => f.incidentId === "INC-113")).toBe(true);
    expect(initialIncidents.some((i) => i.id === "INC-113")).toBe(false);
  });
  it("adds a specialist to the selected incident only", () => {
    const original = initialIncidents[0];
    const result = updateIncident(initialIncidents, original.id, (i) =>
      addParticipant(i, { name: "Taylor Lane", role: "Privacy specialist" }),
    );
    expect(result[0].participants).toHaveLength(
      original.participants.length + 1,
    );
    expect(result[1]).toBe(initialIncidents[1]);
    expect(original.participants.some((p) => p.name === "Taylor Lane")).toBe(
      false,
    );
    expect(
      addParticipant(result[0], {
        name: "Taylor Lane",
        role: "Privacy specialist",
      }).participants,
    ).toHaveLength(result[0].participants.length);
  });
  it("archives closure evidence and rejects later edits to the response", () => {
    const closed = closeIncident(
      initialIncidents[0],
      "Assigned follow-up",
      "Reviewed",
      true,
    );
    expect(closed.status).toBe("Archived");
    expect(closed.closure?.records).toBe(true);
    expect(closed.timeline.at(-1)?.text).toMatch(/read-only/);
    const edited = updateIncident([closed], closed.id, (i) => ({
      ...i,
      title: "Should not change",
    }));
    expect(edited[0]).toBe(closed);
    expect(
      addParticipant(closed, { name: "Test", role: "IT specialist" }),
    ).toBe(closed);
  });
});
