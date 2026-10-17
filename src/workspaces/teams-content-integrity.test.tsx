import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { peopleDirectory } from "../intranet/catalog";
import { initialIncidents } from "../executive/incidentData";
import { germanOneDriveTechnical } from "../i18n/de-onedrive-technical";
import { germanAdvisory } from "../i18n/de-advisory";
import { germanTeamsTechnical } from "../i18n/de-teams-technical";
import { technicalPosts, gitHref } from "./technicalTeams";
import { publishingPosts } from "./publishingTeams";
import TechnicalConversation from "./TechnicalConversation";

const conversations = [...technicalPosts, ...publishingPosts];

describe("technical and moderation conversation integrity", () => {
  it("uses retained colleagues and translates every seeded message and reply", () => {
    const colleagues = new Set(peopleDirectory.map((person) => person.name));
    for (const post of conversations) {
      expect(colleagues.has(post.author)).toBe(true);
      expect(
        {
          ...germanTeamsTechnical,
          ...germanAdvisory,
          ...germanOneDriveTechnical,
        }[post.text.replace(/\s+/g, " ")],
      ).toBeTruthy();
      for (const reply of post.replies || []) {
        expect(colleagues.has(reply.author)).toBe(true);
        expect(
          {
            ...germanTeamsTechnical,
            ...germanAdvisory,
            ...germanOneDriveTechnical,
          }[reply.text],
        ).toBeTruthy();
      }
    }
  });

  it("retains the exact Company Git references and their simulated destination", () => {
    expect(
      technicalPosts
        .filter((post) => post.repo)
        .map((post) => [post.repo, post.kind, post.ref]),
    ).toEqual([
      ["service-integrations", "issue", "214"],
      ["company-web", "pr", "476"],
      ["m365-extensions", "repository", ""],
      ["internal-ai", "pr", "482"],
      ["chatbot-platform", "issue", "193"],
      ["customer-platform", "release", "2026.10"],
      ["m365-extensions", "pr", "318"],
      ["service-integrations", "repository", ""],
      ["service-integrations", "issue", "217"],
      ["company-web", "issue", "229"],
      ["service-integrations", "issue", "231"],
    ]);
    for (const post of technicalPosts.filter((message) => message.repo)) {
      const href = new URL(
        gitHref(post.repo!, post.kind, post.ref),
        "https://example.test",
      );
      expect(href.pathname).toBe("/digital-tech/systems/github");
      expect(href.searchParams.get("repo")).toBe(post.repo);
      expect(href.searchParams.get("ref")).toBe(post.ref);
    }
  });

  it("renders varied existing reply stacks without inventing a default reaction count", () => {
    expect(
      new Set(conversations.map((post) => post.replies?.length || 0)),
    ).toEqual(new Set([0, 1, 2, 3]));
    const general = renderToStaticMarkup(
      createElement(TechnicalConversation, { channel: "General" }),
    );
    expect(general).not.toContain('class="m365-teams-reply"');
    expect(general).not.toContain("👍");
    const engineering = renderToStaticMarkup(
      createElement(TechnicalConversation, { channel: "Engineering" }),
    );
    expect(engineering.match(/class="m365-teams-reply"/g)).toHaveLength(2);
    expect(engineering).toContain("10:26");
    expect(engineering).toContain("10:41");
  });

  it("keeps incident authors inside their response and preserves the executive decision reference", () => {
    for (const incident of initialIncidents) {
      const participants = new Set(
        incident.participants.map((person) => person.name),
      );
      for (const post of incident.posts) {
        expect(participants.has(post.author)).toBe(true);
        expect(
          {
            ...germanTeamsTechnical,
            ...germanAdvisory,
            ...germanOneDriveTechnical,
          }[post.text.replace(/\s+/g, " ")],
        ).toBeTruthy();
      }
      expect(
        incident.files.every((file) => file.incidentId === incident.id),
      ).toBe(true);
    }
    expect(initialIncidents[0].decisions[0]).toMatchObject({
      reference: "ED-105",
      maker: "Avery Quinn",
      time: "10:40",
    });
  });
});
