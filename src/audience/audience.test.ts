import { isSensitivityLabel } from "../sharepoint/sensitivity";
import { describe, it, expect } from "vitest";
import {
  initiatives,
  initiativeById,
  files,
  filesById,
  decisions,
  queryInitiatives,
  queryFiles,
  segments,
  journey,
  calendarItems,
  currentIds,
  latestAnalysis,
  updateStage,
  pipelineStage,
  fileHref,
} from "./data";
import { prototypeForPath, pageTitle } from "../utils/routes";
describe("Audience R&D connected working data", () => {
  it("adds the workspace without changing existing routes", () => {
    for (const p of [
      "/audience-innovation",
      "/audience-innovation/research",
      "/audience-innovation/audiences",
      "/audience-innovation/experiments",
      "/audience-innovation/analytics",
      "/audience-innovation/decisions",
      "/audience-innovation/calendar",
    ])
      expect(prototypeForPath(p)).toBe("audience");
    expect(pageTitle("/audience-innovation")).toBe("Research Lab");
    expect(prototypeForPath("/services")).toBe("services");
    expect(prototypeForPath("/logistics/teams")).toBe("logistics");
    expect(prototypeForPath("/planning")).toBe("planning");
  });
  it("reuses initiative instances in saved views and home references", () => {
    const web = initiativeById.get("RD-103")!;
    expect(queryInitiatives(initiatives, "Website & UX")).toContain(web);
    expect(queryInitiatives(initiatives, "Experiments Running")).toContain(web);
    expect(currentIds).toContain(web.id);
    expect(new Set(initiatives.map((i) => i.id)).size).toBe(initiatives.length);
    for (const f of files)
      expect(initiativeById.has(f.initiativeId)).toBe(true);
  });
  it("filters register views, stage, status and questions against the same data", () => {
    expect(
      queryInitiatives(initiatives, "Completed & Learned").map((i) => i.id),
    ).toEqual(["EXP-205"]);
    expect(
      queryInitiatives(initiatives, "Awaiting Decision").map((i) => i.id),
    ).toEqual(["EXP-202"]);
    expect(
      queryInitiatives(initiatives, "All Initiatives", "disengagement").map(
        (i) => i.id,
      ),
    ).toEqual(["RD-104"]);
    expect(
      queryInitiatives(
        initiatives,
        "All Initiatives",
        "",
        "Design",
        "Blocked",
      ).map((i) => i.id),
    ).toEqual(["EXP-204"]);
  });
  it("moves stages and statuses coherently without mutating seed data", () => {
    const web = initiativeById.get("RD-103")!;
    const completed = updateStage(web, "Completed");
    const items = initiatives.map((i) => (i.id === web.id ? completed : i));
    expect(queryInitiatives(items, "Experiments Running")).not.toContain(
      completed,
    );
    expect(queryInitiatives(items, "Completed & Learned")).toContain(completed);
    expect(completed.status).toBe("Completed");
    expect(web.stage).toBe("Testing");
    expect(updateStage(completed, "Analysis").status).toBe("Active");
    expect(updateStage(web, "Awaiting decision").status).toBe(
      "Ready for review",
    );
    expect(pipelineStage(completed)).toBe("Decide");
  });
  it("links decisions and analysis to canonical source files", () => {
    expect(new Set(files.map((f) => f.id)).size).toBe(files.length);
    for (const d of decisions) {
      const f = filesById.get(d.evidence)!;
      expect(f).toBe(files.find((f) => f.id === d.evidence));
      expect(f.initiativeId).toBe(d.initiativeId);
      expect(fileHref(f)).toContain(`file=${f.id}`);
    }
    for (const id of latestAnalysis) expect(filesById.has(id)).toBe(true);
    expect(queryFiles("research", initiatives, "Website & UX")).toContain(
      filesById.get("signup-results"),
    );
  });
  it("keeps library views functional and participant material out of ordinary files", () => {
    expect(
      queryFiles(
        "research",
        initiatives,
        "All Working Files",
        "",
        "Website Usability Study",
      ),
    ).toHaveLength(2);
    expect(
      queryFiles("research", initiatives, "Awaiting Decision").every(
        (f) => f.initiativeId === "EXP-202",
      ),
    ).toBe(true);
    expect(
      queryFiles("research", initiatives, "All Working Files", "participant"),
    ).toHaveLength(0);
    expect(
      files.every(
        (f) =>
          isSensitivityLabel(f.sensitivity) &&
          f.recordState === "Working information",
      ),
    ).toBe(true);
  });
  it("uses aggregate segmentation, evidence-linked journey stages and dated session references", () => {
    expect(segments).toHaveLength(5);
    expect(segments.reduce((n, s) => n + parseInt(s.size), 0)).toBe(100);
    expect(journey.map((j) => j.stage)).toEqual([
      "Awareness",
      "Consideration",
      "First response",
      "Conversion",
      "Early experience",
      "Ongoing relationship",
      "Retention",
    ]);
    for (const j of journey) expect(filesById.has(j.file)).toBe(true);
    for (const c of calendarItems) {
      expect(initiativeById.has(c.initiativeId)).toBe(true);
      expect(new Date(c.date + "T12:00:00").getMonth()).toBe(9);
    }
  });
});
