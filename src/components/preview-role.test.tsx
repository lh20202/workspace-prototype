import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement, isValidElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import PrototypeNavigator from "./PrototypeNavigator";
import { PreviewRoleProvider } from "./PreviewRoleContext";
import { germanAccessUpdate } from "../i18n/de-access-update";
import { translateText } from "../i18n/translate";
import * as teamsNavigation from "../teams/navigation";

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

afterEach(() => {
  hint.value = null;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function findRoleSelector(node: ReactNode):
  | {
      onChange: (event: { target: { value: string } }) => void;
    }
  | undefined {
  if (!isValidElement<{ id?: string; children?: ReactNode }>(node))
    return undefined;
  if (node.props.id === "preview-role")
    return node.props as ReturnType<typeof findRoleSelector>;
  for (const child of [node.props.children].flat()) {
    const match = findRoleSelector(child);
    if (match) return match;
  }
  return undefined;
}

describe("external role-preview controls", () => {
  it.each([
    "/planning",
    "/teams",
    "/sales-marketing/wiki",
    "/frontline-sales",
    "/architecture",
    "/emergency-response/incidents/INC-104",
  ])("offers the same five role-first choices on %s", (pathname) => {
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
    expect(html.match(/<option\b/g)).toHaveLength(5);
    expect(html).toContain("General Staff Member — Taylor Brooks");
    expect(html).toContain("Frontline Sales Adviser — Maya Chen");
    expect(html).toContain("Executive Director — Robin Avery");
    expect(html).toContain("Personnel Administrator — Jamie Ellis");
    expect(html).toContain(
      "Technology &amp; Engineering Administrator — Devon Park",
    );
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

    findRoleSelector(PrototypeNavigator())!.onChange({
      target: { value: "jamie" },
    });

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
    for (const source of [
      "Preview role",
      "General Staff Member",
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
      expect(translateText(source, "de")).toBe(germanAccessUpdate[source]);
      expect(translateText(source, "en")).toBe(source);
    }
  });
});
