import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { departments } from "../coordination/data";
import { technicalPosts } from "../workspaces/technicalTeams";
import OneDriveSourceNote from "../components/OneDriveSourceNote";
import { germanOneDrive } from "../i18n/de-onedrive";
import { translateText } from "../i18n/translate";

describe("occasional personal OneDrive examples", () => {
  it("has exactly two examples across distinct ordinary Teams contexts", () => {
    const departmentExamples = departments.flatMap((department) =>
      department.posts.filter((post) => post.upload?.source === "onedrive"),
    );
    const technicalExamples = technicalPosts.filter(
      (post) => post.attachment?.source === "onedrive",
    );
    expect(departmentExamples).toHaveLength(1);
    expect(technicalExamples).toHaveLength(1);
    expect(departmentExamples[0].upload?.removed).toBe(true);
    expect(technicalExamples[0].attachment?.removed).toBe(true);
  });
  it("renders a quiet provenance note without turning it into a moderator post", () => {
    const html = renderToStaticMarkup(createElement(OneDriveSourceNote));
    expect(html).toContain('class="teams-source-note"');
    expect(html).toContain("OneDrive source · access may be limited");
    expect(html).not.toMatch(/role="alert"|MODERATOR|<article/);
  });
  it("translates the new system note and human replies while preserving English", () => {
    for (const [english, german] of Object.entries(germanOneDrive)) {
      expect(translateText(english, "en")).toBe(english);
      expect(translateText(english, "de")).toBe(german);
    }
  });
});
