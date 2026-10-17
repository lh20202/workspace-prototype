import { describe, expect, it } from "vitest";
import { peopleDirectory, staff } from "../intranet/catalog";
import { posts, filesById } from "../logistics/data";
import { studioPosts } from "../content/conversations";
import { technicalPosts } from "../workspaces/technicalTeams";
import { publishingPosts } from "../workspaces/publishingTeams";
import { departments } from "../coordination/data";
import { currentProjects, archivedProjects } from "../projects/data";
import { projectConversation } from "../projects/conversations";
import { initialIncidents } from "../executive/incidentData";
import { canAccessChannel, canAccessDepartment } from "../access/policy";

const colleagues = new Set(peopleDirectory.map((person) => person.name));
const previewByName = new Map(staff.map((person) => [person.name, person]));

describe("Teams editorial fixture integrity", () => {
  it("retains ordinary colleagues without expanding selectable identities", () => {
    expect(staff).toHaveLength(5);
    const authors = [
      ...posts.flatMap((post) => [
        post.author,
        ...(post.reply ? [post.reply.split(":")[0]] : []),
      ]),
      ...Object.values(studioPosts).flatMap((thread) =>
        thread.flatMap((post) => [
          post.author,
          ...(post.reply ? [post.reply.author] : []),
        ]),
      ),
      ...[...technicalPosts, ...publishingPosts].flatMap((post) => [
        post.author,
        ...(post.replies || []).map((reply) => reply.author),
      ]),
      ...departments.flatMap((department) => [
        department.coordinator.name,
        ...department.posts.flatMap((post) => [
          post.author,
          ...(post.replies || []).map((reply) => reply.author),
        ]),
      ]),
      ...[...currentProjects, ...archivedProjects].flatMap((project) => [
        project.lead,
        ...["General", "Project Delivery", "Decisions & Actions"].flatMap(
          (channel) =>
            projectConversation(project, channel).replies.map(
              (reply) => reply.author,
            ),
        ),
      ]),
      ...initialIncidents.flatMap((incident) =>
        incident.posts.map((post) => post.author),
      ),
    ];
    for (const author of authors)
      expect(colleagues.has(author), author).toBe(true);
  });

  it("keeps current selectable authors inside their existing channel memberships", () => {
    for (const post of posts) {
      const group = [
        "important",
        "bulletin",
        "office",
        "pets",
        "learning",
        "socials",
      ].includes(post.channel)
        ? "company"
        : "logistics";
      for (const name of [
        post.author,
        ...(post.reply ? [post.reply.split(":")[0]] : []),
      ]) {
        const role = previewByName.get(name);
        if (role)
          expect(
            canAccessChannel(role, group, post.channel),
            `${name}: ${post.channel}`,
          ).toBe(true);
      }
    }
    for (const [workspace, messages] of [
      ["digital", technicalPosts],
      ["publishing", publishingPosts],
    ] as const) {
      for (const post of messages)
        for (const name of [
          post.author,
          ...(post.replies || []).map((reply) => reply.author),
        ]) {
          const role = previewByName.get(name);
          if (role)
            expect(
              canAccessChannel(role, workspace, post.channel),
              `${name}: ${post.channel}`,
            ).toBe(true);
        }
    }
    for (const department of departments)
      for (const post of department.posts) {
        for (const name of [
          post.author,
          ...(post.replies || []).map((reply) => reply.author),
        ]) {
          const role = previewByName.get(name);
          if (role)
            expect(
              canAccessDepartment(role, department.id),
              `${name}: ${department.id}`,
            ).toBe(true);
        }
      }
  });

  it("keeps operational attachments canonical and reply times after their posts", () => {
    for (const post of posts) {
      for (const id of post.fileIds) expect(filesById.has(id), id).toBe(true);
      if (post.replyTime && /^\d\d:\d\d$/.test(post.time))
        expect(post.replyTime > post.time).toBe(true);
    }
    expect(posts.find((post) => post.id === "post-daisy")?.text).toBe(
      "important mews coming in live",
    );
    expect(posts.find((post) => post.id === "post-daisy")?.reply).toContain(
      "take me to your leader",
    );
  });
});
