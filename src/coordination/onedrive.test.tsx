import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import DepartmentChannel from "./DivisionChannel";
import { departments } from "./data";
import { staff } from "../intranet/catalog";
import { files, filesById } from "../audience/data";
import { libraryFor } from "../audience/libraries";
import { canAccessArea } from "../access/policy";
import { canSeeDepartment } from "../teams/visibility";

afterEach(() => vi.unstubAllGlobals());

const department = departments.find((item) => item.id === "marketing-growth")!;
const post = department.posts.find(
  (item) => item.id === "marketing-growth-onedrive",
)!;
const taylor = staff.find((person) => person.id === "taylor")!;

describe("occasional Department OneDrive correction", () => {
  it("keeps one removed source reference and links to the unique shared working file", () => {
    expect(
      departments
        .flatMap((item) => item.posts)
        .filter((item) => item.upload?.source === "onedrive"),
    ).toEqual([post]);
    const canonical = filesById.get("seg-model")!;
    expect(files.filter((file) => file.name === canonical.name)).toEqual([
      canonical,
    ]);
    expect(post.upload).toMatchObject({
      source: "onedrive",
      removed: true,
      name: canonical.name,
      destination: `/audience-innovation/${libraryFor(canonical)}?file=${canonical.id}`,
    });
    expect(post.replies?.[0].link).toEqual({
      href: post.upload!.destination,
      label: canonical.name,
    });
    expect(post.replies?.[1].moderator).toBe(true);
    expect(
      department.library.some((file) => file.name === canonical.name),
    ).toBe(false);
    expect(canAccessArea(taylor, "audience", canonical.area)).toBe(true);
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

  it("renders the system source note separately before the human moderator thread", () => {
    vi.stubGlobal(
      "location",
      new URL(
        "/teams?staff=taylor&department=MCG&tab=Posts",
        "https://example.test",
      ),
    );
    vi.stubGlobal("sessionStorage", { getItem: () => "taylor" });
    const html = renderToStaticMarkup(
      createElement(DepartmentChannel, {
        department: { ...department, posts: [post] },
        person: taylor,
        tab: "Posts",
        onTabChange: () => {},
      }),
    );
    expect(html).toContain('class="coord-attachment coord-attachment-removed"');
    expect(html).toContain('class="teams-source-note"');
    expect(html.indexOf('class="teams-source-note"')).toBeLessThan(
      html.indexOf('aria-label="Moderator reply from Priya Shah"'),
    );
    expect(html).toContain("OneDrive source · access may be limited");
    expect(html).toContain(
      'href="/audience-innovation/research?file=seg-model&amp;staff=taylor"',
    );
    expect(html.match(/class="coord-moderator-badge"/g)).toHaveLength(2);
    expect(html).not.toMatch(/<button[^>]*class="coord-attachment"/);
  });
});
