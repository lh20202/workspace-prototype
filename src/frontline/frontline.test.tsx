import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import FrontlineApp from "./FrontlineApp";

afterEach(() => vi.unstubAllGlobals());
describe("Frontline legacy entrance", () => {
  it.each(["maya", "taylor", "robin", "jamie", "devon", "leonie"])(
    "shows only the shared coming-soon preview for %s",
    (person) => {
      vi.stubGlobal(
        "location",
        new URL(
          `/frontline-sales/briefing?staff=${person}`,
          "https://example.test",
        ),
      );
      const html = renderToStaticMarkup(createElement(FrontlineApp));
      expect(html).toContain('data-environment="frontline"');
      expect(html).toContain("Crew portal");
      expect(html).toContain("COMING SOON");
      expect(html).toContain(
        "In development — a separate experience for frontline crew",
      );
      expect(html).toContain(`href="/architecture?staff=${person}"`);
      expect(html).not.toMatch(
        /frontline-main|Today&#x27;s briefing|Check in for this shift|hub-navigation|m365-header|governance-navigation/,
      );
    },
  );
});
