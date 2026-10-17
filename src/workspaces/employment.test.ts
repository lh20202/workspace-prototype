import { describe, expect, it } from "vitest";
import { configById, functionalConfigs } from "./config";
import {
  workspaceById,
  resolveLegacy,
  crossWorkspaceHandoffs,
  primaryDestinations,
} from "./registry";
import {
  functionalFileHref,
  functionalLibraries,
  functionalHomes,
  functionalLibraryDocuments,
} from "./siteArchitecture";
import { prototypeForPath, pageTitle } from "../utils/routes";
import { queryLibrary } from "../sharepoint/library";
import { departments } from "../coordination/data";

const people = configById.get("people")!;
const employment = configById.get("employment")!;

describe("employment administration has a separate business owner", () => {
  it("registers real routes for employment operations without relabelling People & Culture", () => {
    expect(workspaceById.get("employment")?.href).toBe("/employment-admin");
    expect(pageTitle("/employment-admin/protected/employee-records")).toBe(
      "Employment & Hiring Administration",
    );
    for (const page of [
      "",
      "/recruitment-administration",
      "/employment-operations",
      "/protected/employee-records",
      "/systems/workday",
    ])
      expect(prototypeForPath(`/employment-admin${page}`)).toBe("functional");
    expect(workspaceById.get("people")?.title).toBe("People & Culture");
    expect(workspaceById.get("content")?.title).toBe("Content Room");
  });

  it("keeps programme and framework design in People and moves administrative activities out", () => {
    expect(people.areas.map((area) => area.id)).toEqual([
      "workforce",
      "culture",
      "learning",
      "frameworks",
      "communications",
      "communities",
      "analytics",
      "wellbeing",
    ]);
    expect(
      people.files.some((file) =>
        ["hiring", "employment", "inputs", "protected"].includes(file.area),
      ),
    ).toBe(false);
    expect(
      people.items.some((item) => ["hiring", "employment"].includes(item.area)),
    ).toBe(false);
    expect(
      people.files.filter((file) => file.area === "frameworks"),
    ).toHaveLength(2);
    expect(people.protected.map((subject) => subject.id)).toEqual([
      "network-membership",
    ]);
    expect(
      functionalLibraries.employment.map((library) => library.name),
    ).toEqual(["Recruitment Administration", "Employment Operations"]);
  });

  it("retains each moved file ID exactly once and resolves it to its new library and folder", () => {
    for (const id of [
      "people-F3",
      "people-F4",
      "people-F7",
      "people-R05",
      "people-R06",
      "people-R07",
      "people-R12",
    ]) {
      const copies = functionalConfigs.flatMap((config) =>
        config.files.filter((file) => file.id === id),
      );
      expect(copies).toHaveLength(1);
      expect(employment.files).toContain(copies[0]);
      expect(people.files).not.toContain(copies[0]);
      const target = new URL(
        functionalFileHref(employment, id),
        "https://example.test",
      );
      expect(target.pathname).toMatch(
        /^\/employment-admin\/(recruitment-administration|employment-operations)$/,
      );
      expect(target.searchParams.get("file")).toBe(id);
      expect(target.searchParams.get("folder")).toBe(copies[0].folder);
      expect(copies[0].campaign).toBe("Employment & Hiring Administration");
    }
    // Programme files keep their pre-split identities too.
    expect(people.files.find((file) => file.id === "people-F5")?.name).toBe(
      "Manager Capability Programme — Pilot Feedback.xlsx",
    );
    expect(people.files.find((file) => file.id === "people-F8")?.name).toBe(
      "Company All-Staff Meeting — Agenda.docx",
    );
  });

  it("routes former People/Services administration and systems to the new owner", () => {
    const redirects = {
      "/people-culture/hiring": "/employment-admin/recruitment-administration",
      "/people-culture/hiring-documents":
        "/employment-admin/recruitment-administration",
      "/people-culture/employment": "/employment-admin/employment-operations",
      "/people-culture/protected": "/employment-admin/protected",
      "/services/hiring": "/employment-admin/recruitment-administration",
      "/services/systems/recruitment": "/employment-admin/systems/greenhouse",
      "/people-culture/systems/greenhouse":
        "/employment-admin/systems/greenhouse",
      "/people-culture/systems/workday": "/employment-admin/systems/workday",
    };
    for (const [previous, destination] of Object.entries(redirects))
      expect(resolveLegacy(previous)).toBe(destination);
    expect(
      resolveLegacy("/people-culture/protected/network-membership"),
    ).toBeUndefined();
    expect(resolveLegacy("/services/hiring/recruitment/REC-221")).toBe(
      "/employment-admin/protected/candidate-assessments",
    );
    expect(resolveLegacy("/people-culture/hiring/references")).toBe(
      "/employment-admin/protected/references",
    );
    expect(resolveLegacy("/people-culture/protected/employee-records")).toBe(
      "/employment-admin/protected/employee-records",
    );
  });

  it("protects separate candidate, employee and individual-change subjects without seeding their records", () => {
    const subjectIds = new Set(
      employment.protected.map((subject) => subject.id),
    );
    for (const id of [
      "candidate-applications",
      "candidate-assessments",
      "references",
      "offers",
      "placement",
      "employee-records",
      "employment-changes",
      "compensation",
      "absence-administration",
      "employee-master-data",
      "payroll-inputs",
      "employee-relations",
    ])
      expect(subjectIds.has(id)).toBe(true);
    expect(employment.protected.every((subject) => subject.strict)).toBe(true);
    const publicFiles = functionalLibraries.employment.flatMap((library) =>
      functionalLibraryDocuments(employment, library),
    );
    expect(publicFiles.every((file) => !subjectIds.has(file.id))).toBe(true);
    expect(employment.files.every((file) => file.area !== "protected")).toBe(
      true,
    );
    for (const query of [
      "candidate assessment",
      "employment contract",
      "absence reason",
      "salary",
      "health",
      "personnel record",
    ])
      expect(
        queryLibrary(publicFiles, {
          folder: "",
          search: query,
          view: "recent",
        }),
      ).toEqual([]);
  });

  it("uses authoritative HR tools while retaining technical platform configuration in Digital", () => {
    expect(employment.tools.map((tool) => tool.id).sort()).toEqual([
      "greenhouse",
      "workday",
    ]);
    expect(people.tools.map((tool) => tool.id)).not.toContain("greenhouse");
    const technicalWork = configById
      .get("digital")!
      .items.find((item) => item.name === "People Platform Integration")!;
    expect(technicalWork.area).toBe("systems-engineering");
    expect(technicalWork.nextAction).toContain(
      "Employment & Hiring Administration",
    );
    expect(
      crossWorkspaceHandoffs.find((handoff) => handoff.id === "starter")
        ?.steps[0].href,
    ).toBe("/employment-admin/recruitment-administration");
    expect(primaryDestinations["Candidate assessment"]).toBe(
      "/employment-admin/protected/candidate-assessments",
    );
    expect(
      functionalHomes.employment.handoffs.map((link) => link.href),
    ).toContain("/employment-admin/systems/workday");
  });

  it("moderates administration, programme design, production and engineering to implemented owners", () => {
    const uploads = departments.flatMap((department) =>
      department.posts.flatMap((post) => (post.upload ? [post.upload] : [])),
    );
    expect(
      uploads.some(
        (upload) =>
          upload.destination === "/employment-admin/recruitment-administration",
      ),
    ).toBe(true);
    expect(
      uploads.some(
        (upload) => upload.destination === "/people-culture/learning",
      ),
    ).toBe(true);
    expect(
      uploads.some(
        (upload) => upload.destination === "/digital-tech/systems-engineering",
      ),
    ).toBe(true);
    expect(
      uploads.find((upload) =>
        upload.destination.startsWith("/content-delivery"),
      )?.destinationName,
    ).toContain("Content Room");
  });
});
