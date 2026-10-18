import { germanFAQRolesSensitivity } from "../i18n/de-faq-roles-sensitivity";
import { germanExternalEnvironments } from "../i18n/de-external-environments";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import PrototypeNavigator from "./PrototypeNavigator";
import { PreviewRoleProvider } from "./PreviewRoleContext";
import { germanAccessUpdate } from "../i18n/de-access-update";
import { translateText } from "../i18n/translate";
import * as teamsNavigation from "../teams/navigation";
import { changePreviewRole, previewRoleChangingEvent } from "./demoControls";

const hint = vi.hoisted(() => ({
  value: null as null | {
    roleSelectorRef: { current: HTMLSelectElement | null };
    roleSelectorHighlighted: boolean;
    focusRoleSelector: () => void;
  },
}));
vi.mock("./PreviewRoleContext", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./PreviewRoleContext")>()),
  usePreviewRoleContext: () => hint.value,
}));
vi.mock("../i18n/Language", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../i18n/Language")>()),
  // The handler tests call the component directly to inspect its native select.
  useTranslation: () => ({ language: "en", t: (source: string) => source }),
}));

afterEach(() => {
  hint.value = null;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("external role-preview controls", () => {
  it("closes settings before switching roles and removes the administrative page query", () => {
    const events: string[] = [];
    const target = new EventTarget();
    target.addEventListener(previewRoleChangingEvent, () =>
      events.push("close"),
    );
    vi.stubGlobal("window", target);
    vi.stubGlobal("sessionStorage", { getItem: () => null, setItem: vi.fn() });
    vi.stubGlobal("location", {
      href: "https://example.test/planning?staff=elliot&siteSettings=permissions",
      pathname: "/planning",
      search: "?staff=elliot&siteSettings=permissions",
      assign: (href: string) => {
        events.push(href);
      },
    });
    changePreviewRole("taylor");
    expect(events).toEqual(["close", "/planning?staff=taylor"]);
  });
  it.each([
    "/planning",
    "/teams",
    "/sales-marketing/wiki",
    "/frontline-sales",
    "/architecture",
    "/emergency-response/incidents/INC-104",
  ])("offers the same nine role-first choices on %s", (pathname) => {
    vi.stubGlobal("location", new URL(pathname, "https://example.test"));
    vi.stubGlobal("sessionStorage", { getItem: () => null });
    const html = renderToStaticMarkup(
      createElement(
        PreviewRoleProvider,
        null,
        createElement(PrototypeNavigator),
      ),
    );
    expect(html).toContain('aria-label="Proof of concept navigation"');
    expect(html).toContain('aria-label="Preview role"');
    expect(html).toContain('aria-describedby="preview-role-description"');
    expect(html.match(/<option\b/g)).toHaveLength(9);
    expect(html).toContain('title="Demo User — Taylor Brooks"');
    expect(html).toMatch(
      /<option[^>]*value="taylor"[^>]*selected=""[^>]*>Demo User<\/option>/,
    );
    expect(html).toContain(
      "Explore the ordinary workspace experience. Restricted content still follows access rules.",
    );
    expect(html).not.toContain("General Staff Member");
    const options = [...html.matchAll(/<option\b[^>]*>(.*?)<\/option>/g)].map(
      (match) => match[1],
    );
    expect(options).toEqual([
      "Demo User",
      "Sales &amp; Marketing Specialist",
      "Frontline Sales Adviser",
      "Finance Operations Specialist",
      "Executive Director",
      "Personnel Administrator",
      "Technology &amp; Engineering Administrator",
      "Information Advisory Specialist",
      "Site Administrator",
    ]);
    expect(html).toContain('label="GENERAL / BUSINESS"');
    expect(html).toContain('label="SPECIALIST / ADMIN"');
    expect(html).toContain("Preview role");
    expect(html).toContain("Switch roles to explore access");
    expect(html).toContain('aria-label="About role access"');
    expect(html).not.toContain("Teams staff preview");
    expect(html).not.toContain("Preview as");
    expect(html).not.toContain("Try another preview role");
  });

  it("preserves the explicit selected role in proof-layer navigation", () => {
    vi.stubGlobal(
      "location",
      new URL("/planning?staff=jamie", "https://example.test"),
    );
    vi.stubGlobal("sessionStorage", { getItem: () => null });
    const html = renderToStaticMarkup(createElement(PrototypeNavigator));
    expect(html).toContain('href="/?staff=jamie"');
    expect(html).toContain('href="/architecture?staff=jamie"');
    expect(html).toMatch(
      /<option[^>]*value="jamie"[^>]*selected=""[^>]*>Personnel Administrator<\/option>/,
    );
  });

  it("preserves the remembered Demo User identity without changing the session key", () => {
    const readStoredRole = vi.fn(() => "taylor");
    vi.stubGlobal("location", new URL("/planning", "https://example.test"));
    vi.stubGlobal("sessionStorage", { getItem: readStoredRole });
    const html = renderToStaticMarkup(createElement(PrototypeNavigator));
    expect(readStoredRole).toHaveBeenCalledWith("workspace-preview-staff");
    expect(html).toMatch(
      /<option[^>]*value="taylor"[^>]*selected=""[^>]*>Demo User<\/option>/,
    );
    expect(html).toContain('href="/"');
    expect(html).toContain('title="Demo User — Taylor Brooks"');
  });

  it("keeps the longest role label intact and exposes its fictional person separately", () => {
    vi.stubGlobal(
      "location",
      new URL("/teams?staff=devon&workspace=digital", "https://example.test"),
    );
    vi.stubGlobal("sessionStorage", { getItem: () => null });
    const html = renderToStaticMarkup(createElement(PrototypeNavigator));
    expect(html).toMatch(
      /<option[^>]*value="devon"[^>]*selected=""[^>]*>Technology &amp; Engineering Administrator<\/option>/,
    );
    expect(html).toContain(
      'title="Technology &amp; Engineering Administrator — Devon Park"',
    );
  });

  it.each(["/planning", "/teams", "/sales-marketing/wiki", "/frontline-sales"])(
    "does not present outer navigation as the current product location on %s",
    (pathname) => {
      vi.stubGlobal("location", new URL(pathname, "https://example.test"));
      vi.stubGlobal("sessionStorage", { getItem: () => null });
      const html = renderToStaticMarkup(createElement(PrototypeNavigator));
      const nav = html.match(/<nav\b[\s\S]*?<\/nav>/)?.[0] ?? "";
      expect(nav).toContain('href="/"');
      expect(nav).toContain('href="/architecture"');
      expect(nav).not.toContain('aria-current="page"');
      expect(nav).not.toContain("Architecture");
    },
  );

  it("separates the noninteractive fictional-content note from the action navigation", () => {
    vi.stubGlobal("location", new URL("/architecture", "https://example.test"));
    vi.stubGlobal("sessionStorage", { getItem: () => null });
    const html = renderToStaticMarkup(createElement(PrototypeNavigator));
    const navEnd = html.indexOf("</nav>");
    const note = html.match(
      /<div[^>]*class="demo-fictional-status"[^>]*role="note"[^>]*>[\s\S]*?<\/div>/,
    )?.[0];
    expect(note).toBeTruthy();
    expect(html.indexOf(note!)).toBeGreaterThan(navEnd);
    expect(note).toContain("Fictional names &amp; content");
    expect(note).toContain("No company data used");
    expect(note).not.toMatch(/<(?:a|button|select)\b/);
    expect(note).not.toContain("Proof of concept");
  });

  it.each([
    "/teams?staff=devon&workspace=digital&channel=AI+Lab",
    "/logistics/teams?staff=maya&channel=central-city",
    "/projects/PRJ-2026-014/teams?staff=devon",
    "/emergency-response/incidents/INC-104?staff=devon",
  ])("uses membership-aware role switching from %s", (href) => {
    const current = new URL(href, "https://example.test");
    const assign = vi.fn();
    vi.stubGlobal("location", {
      href: current.href,
      pathname: current.pathname,
      search: current.search,
      assign,
    });
    vi.stubGlobal("sessionStorage", {
      getItem: () => null,
      setItem: vi.fn(),
    });
    const destination = vi
      .spyOn(teamsNavigation, "teamsPreviewHrefForStaff")
      .mockReturnValue("/teams?staff=jamie");

    changePreviewRole("jamie");

    expect(destination).toHaveBeenCalledWith(
      expect.objectContaining({ id: "jamie" }),
      current.pathname,
      current.search,
    );
    expect(assign).toHaveBeenCalledWith("/teams?staff=jamie");
  });

  it("highlights the selector when an access-page prompt points to it", () => {
    vi.stubGlobal(
      "location",
      new URL("/executive?staff=taylor", "https://example.test"),
    );
    vi.stubGlobal("sessionStorage", { getItem: () => null });
    hint.value = {
      roleSelectorRef: { current: null },
      roleSelectorHighlighted: true,
      focusRoleSelector: vi.fn(),
    };
    const html = renderToStaticMarkup(createElement(PrototypeNavigator));
    expect(html).toContain('class="preview-role-highlighted"');
    expect(html).not.toContain("Try another preview role");
    hint.value.roleSelectorHighlighted = false;
    expect(
      renderToStaticMarkup(createElement(PrototypeNavigator)),
    ).not.toContain('class="preview-role-highlighted"');
  });

  it("provides professional German for the new external and access-control labels", () => {
    expect(translateText("Demo User", "de")).toBe("Demo User");
    for (const source of [
      "Preview role",
      "Demo User",
      "Frontline Sales Adviser",
      "Executive Director",
      "Personnel Administrator",
      "Technology & Engineering Administrator",
      "Change your role to change your access permissions",
      "Are you frontline sales staff?",
      "Frontline sales focal point",
      "Contact workspace focal point",
      "Return to Wiki",
      "Controlled working methods for authorised participants.",
      "Individual records, credentials and live system data are not held in this demonstration.",
      "Administration working methods",
      "Working methods",
      "Frontline role required",
      "This portal supports colleagues in day-to-day frontline sales work.",
      "Approved governance outcomes",
    ]) {
      expect(germanAccessUpdate[source]).toBeTruthy();
      expect(translateText(source, "de")).toBe(
        germanFAQRolesSensitivity[source] ||
          germanExternalEnvironments[source] ||
          germanAccessUpdate[source],
      );
      expect(translateText(source, "en")).toBe(source);
    }
  });
});
