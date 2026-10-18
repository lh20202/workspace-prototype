import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import BetaBadge, { betaInfoText } from "./BetaBadge";
import DemoInfo, {
  proofOfConceptInfoText,
  roleAccessInfoText,
  demoUserInfoText,
} from "./DemoInfo";
import { translateText } from "../i18n/translate";

describe("small demo information controls", () => {
  it("starts with a named native button and hides the explanatory paragraph", () => {
    const html = renderToStaticMarkup(
      createElement(DemoInfo, {
        label: "About role access",
        children: roleAccessInfoText,
      }),
    );
    expect(html).toMatch(/<button[^>]*type="button"/);
    expect(html).toContain('aria-label="About role access"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain(roleAccessInfoText);
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
    for (const text of [
      proofOfConceptInfoText,
      betaInfoText,
      roleAccessInfoText,
      demoUserInfoText,
    ]) {
      expect(text.split(/\s+/).length).toBeLessThanOrEqual(50);
      expect(translateText(text, "de")).not.toBe(text);
      expect(translateText(text, "en")).toBe(text);
    }
    expect(proofOfConceptInfoText).toContain("not real MSF Germany files");
    expect(proofOfConceptInfoText).not.toMatch(
      /prototype|product-development/i,
    );
    expect(proofOfConceptInfoText).toContain(
      "do not represent completed migrations or confirmed access arrangements",
    );
    expect(demoUserInfoText).toBe(
      "Explore the ordinary workspace experience. Restricted content still follows access rules.",
    );
    expect(roleAccessInfoText).toContain(
      "Ordinary workspace areas stay available.",
    );
    expect(roleAccessInfoText).not.toMatch(
      /\b(?:Teams|SharePoint|Microsoft|M365)\b/,
    );
    expect(betaInfoText).not.toContain("proof of concept");
  });
});
