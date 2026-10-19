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
    expect(pageTitle("/")).toBe("Welcome | Digital Workspace demo site");
    expect(pageTitle("/architecture")).toBe(
      "All workspaces | Digital Workspace demo site",
    );
    expect(prototypeForPath("/architecture")).toBe("architecture");
    expect(pageTitle("/welfare-representation/employee-representation")).toBe(
      "Council",
    );
    expect(pageTitle("/digital-tech")).toBe("Dev.");
    expect(pageTitle("/logistics/teams")).toBe("Acquisitions | Teams");
    expect(pageTitle("/service-desk/access-request")).toBe(
      "Access request | Service Desk",
    );
  });
  it("welcomes people with two examples and a clearly labelled complete demo", () => {
    const launcher = renderToStaticMarkup(createElement(Launcher));
    expect(launcher).toContain(
      "<h1>Welcome to the Digital Workspace demo site!</h1>",
    );
    expect(launcher).toContain(
      "Explore what your new Digital Workspaces could look and feel like.",
    );
    expect(launcher).not.toMatch(/Switch roles|role switching|change.*role/i);
    expect(launcher.match(/Explore workspace/g)).toHaveLength(2);
    expect(launcher.match(/class="workspace-icon"/g)).toHaveLength(2);
    expect(launcher).toContain('alt="Workspace"');
    expect(launcher).toContain('src="/images/site-mark.svg"');
    expect(launcher).toContain("Explore all workspaces &amp; wikis");
    expect(launcher).toContain("Browse all company workspaces and wikis.");
    expect(launcher).toContain("What is a workspace?");
    expect(launcher).toContain("Interactive tour");
    expect(launcher).not.toContain(">Tour</a>");
    expect(launcher).toContain("BETA TEST");
    expect(launcher).toContain('aria-label="About beta test"');
    expect(launcher).toContain('aria-label="Proof of concept"');
    expect(launcher).toContain("How was this created?");
    expect(launcher).toContain(
      "No company data was used to create this demo site.",
    );
    expect(launcher).not.toContain("Full Architecture Proof of Concept");
    expect(launcher).not.toContain("Reference proof of concept");
    expect(launcher).not.toContain("Reference prototype");
    expect(launcher.replace(/<[^>]*>/g, "")).not.toContain("POC");
    expect(launcher).not.toContain("Work in progress · expect rough edges");
    expect(launcher).toContain('href="/planning?demo=standalone"');
    expect(launcher).toContain('href="/logistics?demo=standalone"');
    expect(launcher).toContain('href="/workspace-tour?demo=standalone"');
    expect(launcher).toContain('href="/architecture?demo=beta"');
    for (const anchor of launcher.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)) {
      expect(anchor[0]).not.toContain("<button");
    }
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
      expect(controls).toContain("← Welcome");
      expect(controls).toContain("All workspaces");
      expect(controls).not.toContain("Fictional names &amp; content");
      expect(directory).toContain("Fictional names &amp; content");
      expect(directory).toContain("No company data used");
      expect(controls).not.toContain("Architecture");
      expect(controls).toMatch(
        /<a[^>]*href="\/architecture"[^>]*aria-current="page"/,
      );
      expect(controls).toContain("BETA");
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
      "Planning / Restricted Planning / Scenario reviews/Current cycle",
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
      src: "/images/pets/daisy.jpg",
      alt: "Daisy the cat",
      width: 960,
      height: 640,
    });
  });
});
