import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  canAccessChannel,
  canAccessProjectTeam,
  previewRoles,
} from "../access/policy";
import { peopleDirectory } from "../intranet/catalog";
import { channels, filesById, posts } from "../logistics/data";
import { departments } from "../coordination/data";
import { studioPosts } from "../content/conversations";
import {
  contentFilesForChannel,
  resolveContentChannel,
} from "../content/channels";
import {
  technicalChannels,
  technicalPosts,
} from "../workspaces/technicalTeams";
import { allProjects, currentProjects } from "../projects/data";
import { projectHistory } from "../projects/conversations";
import ProjectHistory from "../projects/ProjectHistory";
import { translateText } from "../i18n/translate";

const companyHistory = posts.filter((post) => post.id.startsWith("history-"));
const departmentHistory = departments.flatMap((department) =>
  department.posts
    .filter((post) => post.id.includes("-history-"))
    .map((post) => ({ ...post, department })),
);
const digitalHistory = technicalPosts.filter((post) =>
  /2026,/.test(post.time || ""),
);
const creativeHistory = Object.entries(studioPosts).flatMap(
  ([channel, thread]) =>
    thread
      .filter((post) => post.id.includes("-history-"))
      .map((post) => ({ ...post, channel })),
);
const project = currentProjects.find((item) => item.code === "PRJ-2026-014")!;
const projectPosts = projectHistory(project, "General");
const allHistory = [
  ...companyHistory,
  ...departmentHistory,
  ...digitalHistory,
  ...creativeHistory,
  ...projectPosts,
];
const replyText = (reply: string) => reply.slice(reply.indexOf(":") + 1).trim();

describe("modest Teams conversation history", () => {
  it("adds ten dated older posts selectively, without adding channels or archived-project chatter", () => {
    expect(allHistory).toHaveLength(10);
    expect(companyHistory.map((post) => post.channel).sort()).toEqual(
      ["important", "bulletin", "office", "learning", "socials", "pets"].sort(),
    );
    expect(departmentHistory.map((post) => post.department.id)).toEqual([
      "marketing-growth",
    ]);
    expect(digitalHistory.map((post) => post.channel)).toEqual(["Engineering"]);
    expect(creativeHistory.map((post) => post.channel)).toEqual(["web"]);
    for (const post of allHistory) {
      const ageInDays =
        (Date.parse("2026-10-17T23:59:59Z") - Date.parse(post.time!)) /
        86_400_000;
      expect(ageInDays).toBeGreaterThanOrEqual(7);
      expect(ageInDays).toBeLessThanOrEqual(21);
    }
    for (const item of allProjects)
      for (const channel of [
        "General",
        "Project Delivery",
        "Decisions & Actions",
      ])
        expect(projectHistory(item, channel).length).toBe(
          !item.archived && item.code === project.code && channel === "General"
            ? 1
            : 0,
        );
  });

  it("keeps known authors inside existing Team memberships and reuses canonical files", () => {
    const colleagues = new Map(
      peopleDirectory.map((person) => [person.name, person]),
    );
    for (const post of allHistory)
      expect(colleagues.has(post.author)).toBe(true);
    for (const post of companyHistory) {
      expect(
        channels.find((channel) => channel.id === post.channel)?.team,
      ).toBe("company");
      const names = [
        post.author,
        ...(post.reply ? [post.reply.split(":")[0]] : []),
      ];
      for (const name of names) {
        expect(colleagues.has(name)).toBe(true);
        const role = previewRoles.find((person) => person.name === name);
        if (role)
          expect(canAccessChannel(role, "company", post.channel)).toBe(true);
      }
      for (const id of post.fileIds) expect(filesById.has(id)).toBe(true);
      const channelPosts = posts.filter(
        (item) => item.channel === post.channel,
      );
      expect(channelPosts.at(-1)?.id).toBe(post.id);
    }
    for (const post of departmentHistory) {
      expect(colleagues.get(post.author)?.departmentId).toBe(
        post.department.id,
      );
      expect(
        post.department.library.some((file) => file.id === post.attachmentId),
      ).toBe(true);
      for (const reply of post.replies || [])
        expect(colleagues.get(reply.author)?.departmentId).toBe(
          post.department.id,
        );
    }
    for (const post of digitalHistory) {
      expect(technicalChannels).toContain(post.channel);
      const role = previewRoles.find((person) => person.name === post.author)!;
      expect(canAccessChannel(role, "digital", post.channel)).toBe(true);
    }
    for (const post of creativeHistory) {
      expect(resolveContentChannel(post.channel)).toBeDefined();
      expect(colleagues.get(post.author)?.departmentId).toBe("communications");
      expect(
        contentFilesForChannel(post.channel).some(
          (file) => file.id === post.attachment,
        ),
      ).toBe(true);
    }
    for (const post of projectPosts)
      for (const name of [
        post.author,
        ...post.replies.map((reply) => reply.author),
      ]) {
        const role = previewRoles.find((person) => person.name === name)!;
        expect(canAccessProjectTeam(role, project.code)).toBe(true);
      }
  });

  it("renders the project history as an ordinary dated thread without a competing file copy", () => {
    const html = renderToStaticMarkup(<ProjectHistory posts={projectPosts} />);
    expect(html).toContain('class="teams-post"');
    expect(html).toContain("2 October 2026, 11:15");
    expect(html).toContain('aria-label="Reply from Maya Chen"');
    expect(html).toContain("2 October 2026, 11:32");
    expect(html).not.toContain("teams-project-attachment");
    expect(html).not.toContain("MODERATOR");
  });

  it("provides German for the final historical messages without changing dates or canonical identifiers", () => {
    const copy = [
      ...companyHistory.flatMap((post) => [
        post.title,
        post.text,
        post.reply && replyText(post.reply),
      ]),
      ...departmentHistory.flatMap((post) => [
        post.text,
        ...(post.replies || []).map((reply) => reply.text),
      ]),
      ...digitalHistory.map((post) => post.text),
      ...creativeHistory.map((post) => post.text),
      ...projectPosts.flatMap((post) => [
        post.text,
        ...post.replies.map((reply) => reply.text),
      ]),
    ].filter((text): text is string => !!text);
    for (const text of copy)
      expect(translateText(text, "de"), text).not.toBe(text);
    for (const post of allHistory)
      expect(translateText(post.time!, "de")).toMatch(/2026/);
    for (const channel of channels.filter((item) => item.team === "company"))
      expect(translateText(channel.name, "de")).not.toBe(channel.name);
    expect(translateText("Security Engineering", "de")).toBe("IT-Sicherheit");
    const interfaceReview = technicalPosts.find((post) =>
      post.text.startsWith("CRM webhook retries"),
    )!;
    expect(translateText(interfaceReview.text, "de")).toContain(
      "Schnittstellenvertrags",
    );
    expect(translateText(interfaceReview.text, "de")).not.toContain(
      "Vertragsprüfung",
    );
  });
});
