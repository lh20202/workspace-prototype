import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import PrototypeNavigator from "./PrototypeNavigator";
import { changePreviewRole } from "./demoControls";
import { translateText } from "../i18n/translate";

afterEach(() => vi.unstubAllGlobals());

describe("outer demo navigation", () => {
  it.each([
    "/planning",
    "/teams",
    "/sales-marketing/wiki",
    "/frontline-sales",
    "/architecture",
    "/emergency-response/incidents/INC-104",
  ])("keeps demo navigation separate from role selection on %s", (pathname) => {
    vi.stubGlobal("location", new URL(pathname, "https://example.test"));
    vi.stubGlobal("sessionStorage", { getItem: () => null });
    const html = renderToStaticMarkup(createElement(PrototypeNavigator));
    expect(html).toContain('aria-label="Proof of concept navigation"');
    expect(html).toContain('aria-label="Demo controls"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain("Workspace FAQ");
    expect(html).not.toContain('aria-label="Preview role"');
    expect(html).not.toContain("Switch roles to explore access");
    expect(html).not.toContain("Try another preview role");
    expect(html).not.toContain("Preview role");
  });

  it("preserves the selected demo identity on Welcome and architecture links", () => {
    vi.stubGlobal(
      "location",
      new URL("/planning?staff=jamie", "https://example.test"),
    );
    vi.stubGlobal("sessionStorage", { getItem: () => null });
    const html = renderToStaticMarkup(createElement(PrototypeNavigator));
    expect(html).toContain('href="/?staff=jamie"');
    expect(html).toContain('href="/architecture?staff=jamie"');
  });

  it("keeps fictional-content guidance outside the navigation actions", () => {
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
  });

  it("keeps role switching inert when the internal fixture helper runs outside a browser", () => {
    vi.stubGlobal("window", undefined);
    vi.stubGlobal("location", {
      href: "https://example.test/planning?staff=taylor",
      pathname: "/planning",
      search: "?staff=taylor",
      assign: vi.fn(),
    });
    expect(() => changePreviewRole("jamie")).not.toThrow();
  });

  it("updates internal fixture identity and removes an open settings destination", () => {
    const events: string[] = [];
    const window = new EventTarget();
    window.addEventListener("workspace:preview-role-changing", () =>
      events.push("close transient panels"),
    );
    const assign = vi.fn((href: string) => events.push(href));
    const setItem = vi.fn();
    vi.stubGlobal("window", window);
    vi.stubGlobal("location", {
      href: "https://example.test/planning?staff=elliot&siteSettings=permissions",
      pathname: "/planning",
      search: "?staff=elliot&siteSettings=permissions",
      assign,
    });
    vi.stubGlobal("sessionStorage", { getItem: () => null, setItem });

    changePreviewRole("taylor");

    expect(setItem).toHaveBeenCalledWith("workspace-preview-staff", "taylor");
    expect(events).toEqual([
      "close transient panels",
      "/planning?staff=taylor",
    ]);
  });

  it.each([
    ["/teams?staff=devon&workspace=digital&channel=AI+Lab", "/teams?"],
    ["/logistics/teams?staff=maya&channel=central-city", "/logistics/teams?"],
    [
      "/projects/PRJ-2026-014/teams?staff=devon",
      "/projects/PRJ-2026-014/teams?",
    ],
    [
      "/emergency-response/incidents/INC-104?staff=devon",
      "/emergency-response/incidents/INC-104?",
    ],
  ])(
    "retains contextual channel routing for internal fixture %s",
    (path, prefix) => {
      const current = new URL(path, "https://example.test");
      const assign = vi.fn();
      vi.stubGlobal("window", new EventTarget());
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

      changePreviewRole("jamie");

      expect(assign).toHaveBeenCalledOnce();
      expect(assign.mock.calls[0][0]).toContain(prefix);
      const destination = new URL(assign.mock.calls[0][0], current.origin);
      expect(destination.searchParams.get("staff")).toBe("jamie");
      if (current.searchParams.has("channel"))
        expect(destination.searchParams.get("channel")).toBe(
          current.searchParams.get("channel"),
        );
    },
  );

  it("translates current demo and restricted-content labels into German", () => {
    for (const source of [
      "Demo controls",
      "Fictional names & content",
      "No company data used",
      "Reveal restricted content",
      "Your role determines whether you can see this content. For this demo, you can reveal it here.",
    ]) {
      expect(translateText(source, "de"), source).not.toBe(source);
      expect(translateText(source, "en"), source).toBe(source);
    }
  });
});
