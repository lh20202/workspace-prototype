import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import BetaBadge, { betaInfoText } from "./BetaBadge";
import DemoInfo, { proofOfConceptInfoText } from "./DemoInfo";
import { translateText } from "../i18n/translate";

describe("small demo information controls", () => {
  it("starts with a named native button and hides the explanatory paragraph", () => {
    const html = renderToStaticMarkup(
      createElement(DemoInfo, {
        label: "Proof of concept info",
        children: proofOfConceptInfoText,
      }),
    );
    expect(html).toMatch(/<button[^>]*type="button"/);
    expect(html).toContain('aria-label="Proof of concept info"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain(proofOfConceptInfoText);
    expect(html).not.toMatch(/tabindex="-1"/);
  });

  it.each([
    { compact: false, text: "BETA TEST" },
    { compact: true, text: "BETA" },
  ])("labels the complete-demo state as $text", ({ compact, text }) => {
    const html = renderToStaticMarkup(createElement(BetaBadge, { compact }));
    expect(html).toContain(`<span>${text}</span>`);
    expect(html).toContain('aria-label="About beta test"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain(betaInfoText);
    expect(html).not.toContain("<a");
  });

  it("translates the actual shared explanations without changing the English source", () => {
    for (const text of [proofOfConceptInfoText, betaInfoText]) {
      expect(text.split(/\s+/).length).toBeLessThanOrEqual(50);
      expect(translateText(text, "de")).not.toBe(text);
      expect(translateText(text, "en")).toBe(text);
    }
    expect(proofOfConceptInfoText).toContain("try out an idea");
    expect(proofOfConceptInfoText).not.toMatch(
      /prototype|product-development|migration|access arrangements/i,
    );
    expect(proofOfConceptInfoText.match(/[.!?](?:\s|$)/g)).toHaveLength(2);
    expect(betaInfoText).not.toContain("proof of concept");
  });
});
