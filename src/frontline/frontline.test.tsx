import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import FrontlineApp from "./FrontlineApp";
import { germanFrontline } from "../i18n/de-frontline";

afterEach(() => vi.unstubAllGlobals());

function render(query = "", sessionPerson = "maya") {
  vi.stubGlobal(
    "location",
    new URL(`/frontline-sales${query}`, "https://example.test"),
  );
  vi.stubGlobal("sessionStorage", { getItem: () => sessionPerson });
  return renderToStaticMarkup(createElement(FrontlineApp));
}

describe("Frontline Sales Portal stays focused on immediate execution", () => {
  it("presents briefing, shift, conversation and handover tasks without workspace or wiki chrome", () => {
    const html = render();
    for (const text of [
      "Frontline Sales Portal",
      "Today's briefing",
      "Check in for this shift",
      "Current welcome offer",
      "Add a handover note",
    ])
      expect(html).toContain(text.replaceAll("'", "&#x27;"));
    expect(html).toContain('id="frontline-main"');
    expect(html).toContain('class="frontline-portal"');
    expect(html).not.toContain('class="m365-header"');
    expect(html).not.toContain('class="sidebar');
    expect(html).not.toContain("sp-document-library");
    expect(html).not.toMatch(
      /External site|Leaving SharePoint|Third-party system|CRM record/,
    );
  });

  it("links to the actual operational and reference owners with the explicit colleague intact", () => {
    const html = render("?staff=jordan");
    expect(html).toContain("Jordan Lee");
    expect(html).toContain('href="/logistics?staff=jordan"');
    expect(html).toContain('href="/customer-relations?staff=jordan"');
    expect(html).toContain('href="/sales-marketing/wiki?staff=jordan"');
    expect(html).not.toContain("/employment-admin");
    expect(html).not.toContain("/infrastructure/wiki");
  });

  it("uses the remembered colleague when no explicit staff parameter was provided", () => {
    const html = render("", "taylor");
    expect(html).toContain("Taylor Brooks");
    expect(html).toContain('href="/logistics?staff=taylor"');
  });

  it("provides professional German for every portal label and transient task outcome", () => {
    expect(germanFrontline["Frontline Sales Portal"]).toBe(
      "Frontline Sales Portal",
    );
    expect(germanFrontline["Current welcome offer"]).toBe(
      "Aktuelles Einstiegsangebot",
    );
    for (const source of [
      "Confirm briefing",
      "Briefing confirmed",
      "Briefing confirmed for this session.",
      "Check in for this shift",
      "Checked in",
      "Check-in recorded for this session.",
      "Open conversation checklist",
      "Close conversation checklist",
      "Add a handover note",
      "Close handover note",
      "Coverage note",
      "Save for this session",
      "Saved for this session. No update is sent.",
      "Availability or cover only; no customer details.",
    ])
      expect(germanFrontline[source]).toBeTruthy();
    for (const [source, translation] of Object.entries(germanFrontline)) {
      expect(translation.trim()).toBe(translation);
      if (source !== "Frontline Sales Portal")
        expect(translation).not.toBe(source);
    }
  });
});
