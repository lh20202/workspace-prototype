import { describe, it, expect, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Launcher from "./intranet/Launcher";
import Directory from "./intranet/Directory";
import PocAnnotation from "./components/PocAnnotation";
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
    expect(pageTitle("/")).toBe("Digital workspace proof of concept");
    expect(pageTitle("/architecture")).toBe(
      "Full Architecture Proof of Concept | Exploratory",
    );
    expect(prototypeForPath("/architecture")).toBe("architecture");
    expect(pageTitle("/logistics/teams")).toBe(
      "Acquisition & Activation Logistics | Teams",
    );
    expect(pageTitle("/service-desk/access-request")).toBe(
      "Access request | Service Desk",
    );
  });
  it("distinguishes two reference proofs of concept from the exploratory architecture", () => {
    const launcher = renderToStaticMarkup(createElement(Launcher));
    expect(launcher.match(/Reference proof of concept/g)).toHaveLength(2);
    expect(launcher).toContain("Full Architecture Proof of Concept");
    expect(launcher).toContain("Digital workspace proof of concept");
    expect(launcher).toContain("BETA TEST");
    expect(launcher).toContain('class="launcher-build-label"');
    expect(launcher).not.toContain("Reference prototype");
    expect(launcher.replace(/<[^>]*>/g, "")).not.toContain("POC");
    expect(launcher).toContain("Work in progress · expect rough edges");
    expect(launcher).toContain('href="/planning"');
    expect(launcher).toContain('href="/logistics"');
    expect(launcher).toContain('href="/architecture"');
  });
  it("separates preview navigation from disabled intranet context", () => {
    vi.stubGlobal("location", { pathname: "/architecture", search: "" });
    vi.stubGlobal("sessionStorage", { getItem: () => null });
    try {
      const directory = renderToStaticMarkup(createElement(Directory));
      const controls =
        directory.match(
          /<nav[^>]*aria-label="Proof of concept navigation"[\s\S]*?<\/nav>/,
        )?.[0] || "";
      const intranet =
        directory.match(
          /<nav[^>]*aria-label="Intranet navigation"[\s\S]*?<\/nav>/,
        )?.[0] || "";
      expect(controls).toContain("← All workspaces");
      expect(controls).toContain("Architecture");
      expect(controls).toContain("Fictional names and content");
      expect(controls).not.toContain("Preview controls");
      expect(controls).toContain('class="prototype-utilities"');
      expect(intranet.match(/<button[^>]*disabled=""/g)).toHaveLength(4);
      expect(intranet).toContain('href="/architecture" aria-current="page"');
      expect(intranet).not.toContain("aria-haspopup");
      expect(intranet).not.toContain("POC menu");
      expect(directory).not.toContain("Illustrative intranet navigation");
      expect(directory.replace(/<[^>]*>/g, "")).not.toContain("POC");
    } finally {
      vi.unstubAllGlobals();
    }
  });
  it("uses one annotation family for build tags, fictional data and simulation notes", () => {
    const variants = ["tag", "sticker", "inline"] as const;
    for (const variant of variants) {
      const annotation = renderToStaticMarkup(
        createElement(
          PocAnnotation,
          { title: "TEST DATA", variant },
          "Fictional names & content",
        ),
      );
      expect(annotation).toContain('class="poc-annotation ');
      expect(annotation).toContain(`data-poc-annotation="${variant}"`);
      expect(annotation).toContain('role="note"');
    }
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
