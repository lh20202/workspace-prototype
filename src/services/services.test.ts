import { describe, expect, it } from "vitest";
import {
  areas,
  documents,
  filesById,
  matters,
  matterHref,
  sharedReferences,
  handoffs,
  directory,
  systems,
  queryDocuments,
} from "./data";
import {
  prototypeForPath,
  pageTitle,
  accessRequestHref,
} from "../utils/routes";
describe("Organisation Services architecture", () => {
  it("adds services routes while preserving existing surfaces", () => {
    for (const path of [
      "/services",
      ...areas.map((a) => `/services/${a.id}`),
      ...matters.map(matterHref),
    ])
      expect(prototypeForPath(path)).toBe("services");
    expect(prototypeForPath("/")).toBe("launcher");
    expect(prototypeForPath("/planning/cycles")).toBe("planning");
    expect(prototypeForPath("/logistics/teams")).toBe("logistics");
    expect(pageTitle("/services")).toBe("Organisation Services");
    expect(accessRequestHref()).toContain("Restricted+Planning");
  });
  it("keeps one canonical document for cross-service references and scenario steps", () => {
    expect(new Set(documents.map((d) => d.id)).size).toBe(documents.length);
    for (const ids of Object.values(sharedReferences))
      for (const id of ids)
        expect(documents.find((d) => d.id === id)).toBe(filesById.get(id));
    for (const h of handoffs)
      for (const step of h.steps) expect(filesById.has(step.file)).toBe(true);
  });
  it("protects matters inside business topics without putting their content in shared files", () => {
    expect(new Set(matters.map((m) => m.area))).toEqual(
      new Set(["legal", "procurement", "technology", "hiring", "workplace"]),
    );
    for (const m of matters) {
      expect(matterHref(m)).toContain(`/services/${m.area}/`);
      expect(documents.some((d) => d.id === m.id)).toBe(false);
    }
    for (const a of areas)
      expect(
        queryDocuments(a.id, "", "All Documents", "candidate assessment"),
      ).toHaveLength(0);
    expect(
      documents
        .filter((d) => d.area === "hiring")
        .every((d) => d.sensitivity === "Internal"),
    ).toBe(true);
  });
  it("keeps shared resources reusable and makes saved views selective", () => {
    expect(
      queryDocuments("resources", "", "All Documents", "").every(
        (d) => d.area === "resources",
      ),
    ).toBe(true);
    expect(
      queryDocuments("legal", "", "Templates", "").every(
        (d) => d.workType === "Template",
      ),
    ).toBe(true);
    expect(
      queryDocuments(
        "technology",
        "Accounts & access",
        "All Documents",
        "",
      ).map((d) => d.id),
    ).toEqual(["account-access"]);
    expect(
      queryDocuments("hiring", "", "Items Requiring Handover", "").map(
        (d) => d.id,
      ),
    ).toContain("offer-handover");
  });
  it("connects every directory service and external reference to an existing system", () => {
    for (const d of directory) {
      expect(areas.some((a) => a.id === d.area)).toBe(true);
      expect(systems.some((s) => s.id === d.system)).toBe(true);
    }
    for (const h of handoffs)
      for (const r of h.refs)
        expect(systems.some((s) => s.id === r.system)).toBe(true);
  });
  it("limits recruitment setup handoffs to approved service material", () => {
    const scenario = handoffs.find((h) => h.id === "SERV-118")!;
    expect(scenario.steps.map((s) => s.file)).toEqual([
      "offer-handover",
      "account-access",
      "office-access",
    ]);
    expect(scenario.summary).toContain(
      "Candidate assessments and references remain",
    );
  });
});
