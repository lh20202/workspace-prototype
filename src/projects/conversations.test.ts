import { describe, expect, it } from "vitest";
import { allProjects, projectFiles } from "./data";
import { projectConversation } from "./conversations";
import { projectChannels } from "../teams/visibility";
import { peopleDirectory, staff } from "../intranet/catalog";
import { germanTeamsDepartments } from "../i18n/de-teams-departments";

describe("project conversation fixtures", () => {
  it("covers every existing project channel without changing canonical plan identity", () => {
    const colleagues = new Set(
      [...peopleDirectory, ...staff].map((person) => person.name),
    );
    for (const project of allProjects) {
      expect(colleagues.has(project.lead)).toBe(true);
      expect(
        projectFiles(project).find((file) => file.id === `${project.code}-F1`)
          ?.name,
      ).toBe("Delivery Plan.xlsx");
      for (const channel of projectChannels) {
        const conversation = projectConversation(project, channel);
        expect(conversation.text).toBeTruthy();
        expect(germanTeamsDepartments[conversation.text]).toBeTruthy();
        for (const reply of conversation.replies) {
          expect(colleagues.has(reply.author)).toBe(true);
          expect(germanTeamsDepartments[reply.text]).toBeTruthy();
        }
        if (project.archived) {
          expect(conversation.time).not.toContain("Today");
          expect(conversation.replies).toEqual([]);
        }
      }
    }
  });
});
