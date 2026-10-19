import { describe, expect, it } from "vitest";
import { posts } from "../logistics/data";
import { displayText } from "./displayText";

describe("Pet photos German copy", () => {
  it("translates channel posts and replies while preserving the science hashtag", () => {
    const channelPosts = posts.filter((post) => post.channel === "pets");
    for (const post of channelPosts) {
      if (post.text === "#science") {
        expect(displayText(post.text, "de")).toBe("#science");
      } else {
        expect(displayText(post.text, "de")).not.toBe(post.text);
      }
      for (const reply of post.replies ?? []) {
        if (reply.text === "#science") {
          expect(displayText(reply.text, "de")).toBe("#science");
        } else {
          expect(displayText(reply.text, "de")).not.toBe(reply.text);
        }
      }
    }
  });

  it("localises the channel description and poll without changing the joke phrase", () => {
    expect(displayText("& Other Animals", "de")).toBe("& andere Tiere");
    expect(
      displayText("Vote — make Pet photos more inclusive of goats", "de"),
    ).toBe("Abstimmung: Haustierfotos auch für Ziegen öffnen");
    expect(
      displayText("Rename channel to “Pet Photos & Other Animals”", "de"),
    ).toBe("Kanal in „Haustierfotos & andere Tiere“ umbenennen");
    expect(displayText("Raise a ticket to request a new", "de")).toBe(
      "Ticket für eine neue",
    );
    expect(displayText(": “Goat Appreciation Society”", "de")).toBe(
      "anfordern: „Goat Appreciation Society“",
    );
    expect(
      `${displayText("Raise a ticket to request a new", "de")} SharePoint site ${displayText(": “Goat Appreciation Society”", "de")}`,
    ).toBe(
      "Ticket für eine neue SharePoint site anfordern: „Goat Appreciation Society“",
    );
  });
});
