import { describe, it, expect } from "vitest";
import { accessRequestHref, pageTitle, prototypeForPath } from "./utils/routes";
import { posts, filesById, permits } from "./logistics/data";
import {
  duties,
  resolveDuty,
  rotaRows,
  calendarEntries,
  queryCalendar,
} from "./logistics/schedule";
describe("launcher and service desk routes", () => {
  it("routes the simple launcher and access request", () => {
    expect(prototypeForPath("/")).toBe("launcher");
    expect(prototypeForPath("/service-desk/access-request")).toBe(
      "service-desk",
    );
  });
  it("sets distinct product and page titles", () => {
    expect(pageTitle("/")).toBe("Workspace prototypes");
    expect(prototypeForPath("/architecture")).toBe("architecture");
    expect(pageTitle("/logistics/teams")).toBe(
      "Acquisition & Activation Logistics | Teams",
    );
    expect(pageTitle("/service-desk/access-request")).toBe(
      "Access request | Service Desk",
    );
  });
  it("carries the attempted restricted path into the access form", () => {
    const url = new URL(
      accessRequestHref("Scenario reviews/Current cycle"),
      "https://example.test",
    );
    expect(url.pathname).toBe("/service-desk/access-request");
    expect(url.searchParams.get("location")).toBe(
      "Organisational Planning & Reporting / Restricted Planning / Scenario reviews/Current cycle",
    );
  });
});
describe("operational schedules share source records", () => {
  it("resolves shifts to the existing document instances", () => {
    for (const duty of duties)
      expect(resolveDuty(duty).file).toBe(filesById.get(duty.fileId));
  });
  it("uses permit location, lead and confirmation state", () => {
    const row = resolveDuty(duties.find((d) => d.id === "travel-sat")!);
    const permit = permits.find((p) => p.id === "permit-lakeside")!;
    expect(row.location).toBe(permit.location);
    expect(row.lead).toBe(permit.lead);
    expect(row.status).toBe("Awaiting confirmation");
  });
  it("separates rota types and periods", () => {
    expect(rotaRows("street")).toHaveLength(4);
    expect(rotaRows("telephone")).toHaveLength(2);
    expect(rotaRows("telephone", "Next week").map((r) => r.file.id)).toEqual([
      "welcome-script",
    ]);
  });
  it("combines coverage, training, permits and existing task deadlines", () => {
    const all = calendarEntries();
    expect(new Set(all.map((e) => e.id)).size).toBe(all.length);
    expect(all.some((e) => e.kind === "Training")).toBe(true);
    expect(all.some((e) => e.kind === "Coach coverage")).toBe(true);
    expect(all.some((e) => e.taskId === "task-script")).toBe(true);
    expect(
      queryCalendar("Next week", "Calling shift", "welcome").map((e) => e.id),
    ).toEqual(["welcome-mon"]);
  });
});
describe("Daisy content", () => {
  it("makes Daisy the first Pet photos post with the exact wording", () => {
    const first = posts.find((p) => p.channel === "pets")!;
    expect(first.text).toBe("important mews coming in live");
    expect(first.image).toEqual({
      src: "/images/daisy.jpg",
      alt: "Daisy the cat",
    });
  });
});
