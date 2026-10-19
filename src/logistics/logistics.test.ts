import { describe, it, expect } from "vitest";
import {
  files,
  filesById,
  channels,
  posts,
  postReplies,
  quickLinks,
  campaigns,
  permits,
  weekStart,
  weekEnd,
} from "./data";
import {
  queryFiles,
  emptyFilters,
  filesForChannel,
  queryPermits,
  fileHref,
} from "./query";
import { planningPath, planningPage, prototypeForPath } from "../utils/routes";
describe("one shared document model", () => {
  it("keeps identifiers unique", () =>
    expect(new Set(files.map((f) => f.id)).size).toBe(files.length));
  it("resolves every channel and post reference", () => {
    for (const ref of [
      ...channels.flatMap((c) => c.fileIds),
      ...posts.flatMap((p) => p.fileIds),
    ])
      expect(filesById.has(ref)).toBe(true);
  });
  it("returns the identical objects used by SharePoint", () => {
    const channel = channels.find((c) => c.id === "central-city")!;
    expect(
      filesForChannel(channel).find((f) => f.id === "central-deployment"),
    ).toBe(filesById.get("central-deployment"));
    expect(filesForChannel(channel).find((f) => f.id === "street-guide")).toBe(
      files.find((f) => f.id === "street-guide"),
    );
  });
  it.each(quickLinks)("resolves $label", (link) => {
    expect(filesById.has(link.id)).toBe(true);
  });
  it.each(campaigns)("finds operational files for $name", (c) =>
    expect(
      queryFiles(
        files.filter((f) => f.library === "operations"),
        "All Documents",
        "",
        { ...emptyFilters, campaign: c.name },
      ).length,
    ).toBeGreaterThan(0),
  );
  it("generates SharePoint links to the same item", () => {
    const f = filesById.get("central-deployment")!;
    const url = new URL(fileHref(f), "https://example.test");
    expect(url.pathname).toBe("/logistics/operations");
    expect(url.searchParams.get("document")).toBe(f.id);
    expect(url.searchParams.get("folder")).toBe(f.folder);
  });
});
describe("Pet photos threads", () => {
  const petPosts = posts.filter((post) => post.channel === "pets");
  const byId = (id: string) => petPosts.find((post) => post.id === id)!;

  it("keeps the existing post order and photo assets", () => {
    expect(petPosts.map((post) => post.id)).toEqual([
      "post-daisy",
      "post-miso",
      "post-puppy",
      "post-goats",
      "post-goat-poll",
      "post-greyhound",
      "post-pingu",
      "post-metaverse",
      "post-garden-cat",
      "post-judgement",
      "post-serenade",
      "history-pets-chair",
    ]);
    expect(
      petPosts.filter((post) => post.image).map((post) => post.image?.src),
    ).toEqual([
      "/images/pets/daisy.jpg",
      "/images/pets/louis.jpg",
      "/images/pets/dachshund.jpg",
      "/images/pets/goats.jpg",
      "/images/pets/greyhound-glowing-eyes.jpg",
      "/images/pets/hypotenoot.jpg",
      "/images/pets/metaverse.jpg",
      "/images/pets/garden-cat.jpg",
      "/images/pets/judgement.jpg",
      "/images/pets/greyhound-serenade.jpg",
    ]);
  });

  it("adds the requested replies to the existing threads", () => {
    expect(byId("post-daisy").text).toBe("Look into my eyes");
    expect(postReplies(byId("post-daisy")).map(({ text }) => text)).toEqual([
      "take me to your leader",
      "I feel her staring into the depths of my soul.",
    ]);
    expect(postReplies(byId("post-miso")).map(({ text }) => text)).toEqual([
      "He looks like he wants to discuss my mortgage.",
      "Sophisticated, dignified and refined.",
    ]);
    expect(postReplies(byId("post-goats")).map(({ text }) => text)).toEqual([
      "Thank you for bringing this important information to our attention.",
      "+1 we need more goats",
    ]);
    expect(byId("post-goat-poll")).toMatchObject({
      author: "Jordan Lee",
      poll: {
        question: "Vote — make Pet photos more inclusive of goats",
        options: [
          { label: "Rename channel to “Pets & Goats”", votes: 4 },
          {
            label: "Rename channel to “Pet Photos & Other Animals”",
            votes: 9,
          },
          {
            label:
              "Raise a ticket to request a new SharePoint site: “Goat Appreciation Society”",
            votes: 6,
          },
        ],
      },
    });
    expect(postReplies(byId("post-goat-poll")).map(({ text }) => text)).toEqual(
      ["Finally, justice."],
    );
    expect(postReplies(byId("post-greyhound")).map(({ text }) => text)).toEqual(
      [
        "And apparently sleeps on the good pillows.",
        "What's wrong with your chicken? Call a vet.",
      ],
    );
    expect(postReplies(byId("post-pingu")).map(({ text }) => text)).toEqual([
      "#science",
    ]);
    expect(byId("post-metaverse").text).toBe(
      "Focus on what you're naturally drawn to. Use that simple clue to cut through the noise and find your rhythm. The frequency is there...",
    );
    expect(postReplies(byId("post-metaverse")).map(({ text }) => text)).toEqual(
      ["I am naturally drawn to closing my laptop.", "Is that a raw chicken?"],
    );
    expect(
      postReplies(byId("post-garden-cat")).map(({ text }) => text),
    ).toEqual([
      "I've been refused entry to my own house.",
      "Firm but fair policy.",
    ]);
    expect(byId("post-judgement").text).toBe(
      "Performance review came back. It's not that she dislikes you, she just judges you and your life choices.",
    );
    expect(postReplies(byId("post-serenade")).map(({ text }) => text)).toEqual([
      "Have you checked the battery in your dog?",
      "Have you tried a manual reboot? Boop the snoot and hold for 3 seconds. If it still doesn't work, raise a ticket through Snuffles@IT.service.",
    ]);
  });

  it("shows small dachshund reactions and keeps legacy single replies readable", () => {
    expect(byId("post-puppy").reactions).toEqual([
      { emoji: "❤️", count: 5 },
      { emoji: "😍", count: 4 },
      { emoji: "🐶", count: 3 },
      { emoji: "😭", count: 2 },
    ]);
    expect(
      postReplies(posts.find((post) => post.id === "post-general")!),
    ).toEqual([
      {
        author: "Maya Chen",
        text: "Got it. I’ve passed the handover on to the calling team.",
        time: "09:17",
      },
    ]);
  });
});
describe("operational views and lists", () => {
  it("filters in-person, calling and travelling operations", () => {
    expect(
      queryFiles(files, "Calling Operations", "", emptyFilters).every(
        (f) => f.operation === "Calling",
      ),
    ).toBe(true);
    expect(
      queryFiles(files, "In-person Operations", "", emptyFilters).every((f) =>
        f.operation.includes("in-person"),
      ),
    ).toBe(true);
    expect(
      queryFiles(files, "Travel Campaign", "", emptyFilters).every(
        (f) => f.operation === "Travelling in-person",
      ),
    ).toBe(true);
  });
  it("uses validity dates for this week and excludes drafts", () => {
    const result = queryFiles(files, "Current This Week", "", emptyFilters);
    expect(result.length).toBeGreaterThan(0);
    expect(
      result.every(
        (f) =>
          f.validFrom <= weekEnd &&
          f.validTo >= weekStart &&
          ["Current", "Active"].includes(f.status),
      ),
    ).toBe(true);
    expect(result.some((f) => f.id === "welcome-script")).toBe(false);
  });
  it("combines filters, folder and search", () => {
    expect(
      queryFiles(
        files,
        "All Documents",
        "DEPLOYMENT",
        { ...emptyFilters, campaign: "Central City Campaign" },
        "Central City Campaign",
      ).map((f) => f.id),
    ).toEqual(["central-deployment"]);
  });
  it("separates selected final records from working files", () => {
    const result = queryFiles(files, "Completed Campaigns", "", emptyFilters);
    expect(result).toHaveLength(3);
    expect(
      result.every(
        (f) => f.library === "records" && f.recordState === "Final record",
      ),
    ).toBe(true);
  });
  it("filters permit views and campaign metadata", () => {
    const pending = queryPermits(permits, "Awaiting Permits", "", "", "");
    expect(pending).toHaveLength(2);
    expect(pending.every((p) => p.permit === "Pending")).toBe(true);
    expect(
      queryPermits(
        permits,
        "All Locations",
        "station",
        "Central City Campaign",
        "Approved",
      ).map((p) => p.id),
    ).toEqual(["permit-central"]);
    expect(
      queryPermits(permits, "This Week", "", "", "").every(
        (p) => p.date >= weekStart && p.date <= weekEnd,
      ),
    ).toBe(true);
  });
});
describe("prototype routing", () => {
  it("distinguishes the launcher from workspace routes", () => {
    expect(prototypeForPath("/")).toBe("launcher");
    expect(prototypeForPath("/planning")).toBe("planning");
    expect(prototypeForPath("/logistics/teams")).toBe("logistics");
  });
  it("preserves planning library and home locations", () => {
    expect(planningPath("home")).toBe("/planning");
    expect(planningPath("planning")).toBe("/planning/cycles");
    expect(planningPage("/planning")).toBe("home");
    expect(planningPage("/planning/cycles")).toBe("planning");
    expect(planningPage("/planning/strategy")).toBe("strategy");
    expect(planningPage("/strategy")).toBe("strategy");
  });
});
