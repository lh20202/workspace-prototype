import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import DepartmentChannel from "./DivisionChannel";
import { departments } from "./data";
import { staff } from "../intranet/catalog";
import { canSeeDepartment } from "../teams/visibility";

afterEach(() => vi.unstubAllGlobals());

const department = departments.find((item) => item.id === "marketing-growth")!;
const taylor = staff.find((person) => person.id === "taylor")!;

describe("Department uploads remain separate from personal OneDrive links", () => {
  it("removes the mixed OneDrive/upload example while retaining ordinary misplaced-upload threads", () => {
    for (const item of departments) {
      expect(JSON.stringify(item.posts)).not.toMatch(/onedrive/i);
      expect(
        item.posts.some((post) => post.upload && post.moderatorReply),
      ).toBe(true);
    }
  });

  it("retains Department membership boundaries", () => {
    expect(canSeeDepartment(taylor, department.id)).toBe(true);
    expect(
      canSeeDepartment(
        staff.find((person) => person.id === "maya")!,
        department.id,
      ),
    ).toBe(true);
    expect(
      canSeeDepartment(
        staff.find((person) => person.id === "devon")!,
        department.id,
      ),
    ).toBe(false);
  });

  it("keeps the existing Department attachment correction without calling it a OneDrive link", () => {
    vi.stubGlobal(
      "location",
      new URL(
        "/teams?staff=taylor&department=MCG&tab=Posts",
        "https://example.test",
      ),
    );
    vi.stubGlobal("sessionStorage", { getItem: () => "taylor" });
    const post = department.posts.find(
      (item) => item.id === "marketing-growth-misfiled",
    )!;
    const html = renderToStaticMarkup(
      createElement(DepartmentChannel, {
        department: { ...department, posts: [post] },
        person: taylor,
        tab: "Posts",
        onTabChange: () => {},
      }),
    );
    expect(html).toContain("Website Conversion Analysis — October.pptx");
    expect(html).toContain('aria-label="Moderator reply from Priya Shah"');
    expect(html).not.toContain("OneDrive");
    expect(html).toContain(
      'href="/audience-innovation/analytics?staff=taylor"',
    );
    expect(html).toMatch(/<button[^>]*class="coord-attachment"/);
  });
});
