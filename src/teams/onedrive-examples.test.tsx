import { describe, expect, it } from "vitest";
import { departments } from "../coordination/data";
import { technicalPosts } from "../workspaces/technicalTeams";
import { germanOneDrive } from "../i18n/de-onedrive";
import { translateText } from "../i18n/translate";

describe("personal OneDrive link correction", () => {
  it("keeps one functional Team example separate from Department upload corrections", () => {
    const technicalExamples = technicalPosts.filter(
      (post) => post.fileLink?.correctedFrom === "onedrive",
    );
    expect(technicalExamples).toHaveLength(1);
    expect(technicalExamples[0].replies?.[0].moderator).toBe(true);
    expect(JSON.stringify(technicalExamples[0])).not.toMatch(
      /attachment|Department/,
    );
    for (const department of departments)
      expect(JSON.stringify(department.posts)).not.toMatch(/onedrive/i);
  });
  it("translates the human replies while preserving English", () => {
    for (const [english, german] of Object.entries(germanOneDrive)) {
      expect(translateText(english, "en")).toBe(english);
      expect(translateText(english, "de")).toBe(german);
    }
  });
});
