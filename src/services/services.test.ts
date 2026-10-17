import { describe, it, expect } from "vitest";
import { areas, documents, filesById, systems } from "./data";
import { resolveLegacy } from "../workspaces/registry";
import { configById } from "../workspaces/config";
describe("Organisation Services has four operational purposes", () => {
  it("contains only office, purchasing, travel and reception", () => {
    expect(areas.map((a) => a.name)).toEqual([
      "Office Maintenance & Equipment",
      "Purchasing & Suppliers",
      "Travel Services",
      "Reception",
    ]);
    expect(documents.every((f) => areas.some((a) => a.id === f.area))).toBe(
      true,
    );
  });
  it("keeps IT, hiring, legal and improvement files out of Services search and Teams", () => {
    expect(
      documents.some((f) =>
        /candidate|hiring|legal|api|tenant|project intake|technical|freshservice/i.test(
          f.name,
        ),
      ),
    ).toBe(false);
    expect(systems.map((s) => s.name)).toEqual([
      "MaintainX",
      "Coupa",
      "TravelPerk",
      "Envoy",
    ]);
  });
  it("resolves shared files to one canonical instance", () => {
    for (const f of documents) expect(filesById.get(f.id)).toBe(f);
    expect(configById.get("services")?.files).toBe(documents);
  });
  it("moves legacy ordinary and protected routes to their owners", () => {
    expect(resolveLegacy("/services/technology")).toBe("/digital-tech");
    expect(resolveLegacy("/services/projects")).toBe("/projects");
    expect(resolveLegacy("/services/hiring")).toBe(
      "/employment-admin/recruitment-administration",
    );
    expect(resolveLegacy("/services/legal/matters/INV-008")).toBe(
      "/legal-compliance/protected/formal-cases",
    );
    expect(resolveLegacy("/services/hiring/recruitment/REC-221")).toBe(
      "/employment-admin/protected/candidate-assessments",
    );
    expect(resolveLegacy("/services/procurement/matters/TEND-102")).toBe(
      "/services/purchasing/live-tender",
    );
  });
});
