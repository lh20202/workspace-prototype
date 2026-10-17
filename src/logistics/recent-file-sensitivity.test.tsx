import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import LogisticsApp from "./LogisticsApp";
import { filesById } from "./data";

afterEach(() => vi.unstubAllGlobals());

describe("Logistics recent file classifications", () => {
  it("renders the canonical sensitivity on every recent operational file card", () => {
    vi.stubGlobal(
      "location",
      new URL("https://example.test/logistics?staff=maya"),
    );
    vi.stubGlobal("sessionStorage", { getItem: () => "maya" });
    const html = renderToStaticMarkup(createElement(LogisticsApp));
    const section =
      html.match(/<section class="recent">[\s\S]*?<\/section>/)?.[0] || "";
    const cards =
      section
        .match(/<button[^>]*>[\s\S]*?<\/button>/g)
        ?.filter((card) => card.includes('class="recent-name"')) || [];
    expect(cards.length).toBeGreaterThan(0);
    for (const card of cards) {
      const canonical = [...filesById.values()].find((file) =>
        card.includes(file.name),
      );
      expect(canonical).toBeDefined();
      expect(card).toContain(
        `aria-label="Sensitivity: ${canonical!.sensitivity}"`,
      );
      expect(card.match(/class="sensitivity-label /g)).toHaveLength(1);
    }
  });
});
