import { describe, it, expect } from "vitest";
import {
  items,
  files,
  protectedSubjects,
  selectItems,
  views,
  channelFiles,
  channels,
  systems,
  cycles,
  handoffs,
  lifecycle,
  calendar,
} from "./data";
import { prototypeForPath, pageTitle } from "../utils/routes";
import { staff, workspaces } from "../intranet/catalog";
describe("shared financial operating model", () => {
  it("keeps income and all six financial activities in the same routed workspace", () => {
    for (const area of [
      "income",
      "reconciliation",
      "payments",
      "planning",
      "accounting",
      "treasury",
    ]) {
      expect(items.some((x) => x.area === area)).toBe(true);
      expect(prototypeForPath(`/financial-operations/${area}`)).toBe("finance");
    }
    expect(pageTitle("/financial-operations")).toBe(
      "Income & Financial Operations",
    );
  });
  it("resolves home cycles, handoffs and milestones to canonical work records", () => {
    expect(new Set(items.map((x) => x.id)).size).toBe(items.length);
    for (const milestone of calendar)
      expect(items.find((x) => x.id === milestone.item)?.due).toBe(
        `2026-10-${milestone.day}`,
      );
    for (const id of [...cycles, ...handoffs, ...calendar.map((x) => x.item)])
      expect(items.find((x) => x.id === id)).toBeDefined();
    expect(lifecycle["INC-01"].join(" ")).toMatch(
      /PAY-8437.*SF-1842.*BL-1028.*NS-22041/,
    );
  });
  it("keeps specialist records as references rather than transaction copies", () => {
    expect(systems).toHaveLength(7);
    for (const x of items) {
      expect(systems.find((s) => s.id === x.system)).toBeDefined();
      expect(x.reference).toMatch(/^(SF|PAY|NS|BL|AP|TB|KY)-/);
    }
    expect(
      items.every(
        (x) =>
          !("customerName" in x) &&
          !("accountNumber" in x) &&
          !("bankAccount" in x),
      ),
    ).toBe(true);
  });
  it("seeds labels only for restricted subjects; no restricted files or payloads", () => {
    expect(Object.keys(protectedSubjects)).toEqual([
      "income",
      "payments",
      "planning",
      "accounting",
      "treasury",
    ]);
    expect(Object.values(protectedSubjects).flat().length).toBe(23);
    for (const f of files) {
      expect(f.sensitivity).toBe("Internal");
      expect(f.name).not.toMatch(
        /payroll|mandate|tax working|customer payment exception|draft management/i,
      );
    }
    expect(files).toHaveLength(10);
  });
  it("never broadens source visibility through saved views", () => {
    for (const view of views) {
      const result = selectItems(items, view);
      expect(
        result.every((x) => items.includes(x) && x.sensitivity === "Internal"),
      ).toBe(true);
    }
    expect(selectItems(items, "Recently Completed")).toEqual([]);
    const complete = { ...items[0], status: "Complete" };
    expect(selectItems([complete], "Recently Completed")).toEqual([complete]);
    expect(selectItems([complete], "Current Cycle")).toEqual([]);
  });
  it("Teams reuses canonical files and exposes no banking or payroll channel", () => {
    expect(channels.join(" ")).not.toMatch(/treasury|payroll|bank/i);
    for (const c of channels)
      for (const f of channelFiles(c)) expect(files.includes(f)).toBe(true);
    expect(
      channelFiles("Planning & Analysis").every((f) => f.folder === "planning"),
    ).toBe(true);
    expect(channelFiles("General")).toHaveLength(files.length);
  });
  it("every fictional staff preview belongs to a real existing workspace", () => {
    expect(workspaces).toHaveLength(7);
    expect(staff).toHaveLength(8);
    for (const s of staff)
      expect(workspaces.find((w) => w.id === s.workspace)).toBeDefined();
    expect(prototypeForPath("/teams")).toBe("teams");
  });
});
