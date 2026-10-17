import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import PrototypeNavigator from "./PrototypeNavigator";
import { PreviewRoleProvider } from "./PreviewRoleContext";
import type { AccessResource } from "../access/policy";
import { germanAccessUpdate } from "../i18n/de-access-update";
import { translateText } from "../i18n/translate";

const hint = vi.hoisted(() => ({
  value: null as null | {
    deniedArea: { owner: string; resource: AccessResource };
    helperDismissed: boolean;
    dismissHelper: () => void;
  },
}));
vi.mock("./PreviewRoleContext", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./PreviewRoleContext")>()),
  usePreviewRoleContext: () => hint.value,
}));

afterEach(() => {
  hint.value = null;
  vi.unstubAllGlobals();
});

describe("external role-preview controls", () => {
  it.each([
    "/planning",
    "/teams",
    "/sales-marketing/wiki",
    "/frontline-sales",
    "/architecture",
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

  it("shows the external role hint only for a genuinely available alternative", () => {
    vi.stubGlobal(
      "location",
      new URL("/executive?staff=taylor", "https://example.test"),
    );
    vi.stubGlobal("sessionStorage", { getItem: () => null });
    hint.value = {
      deniedArea: {
        owner: "boundary",
        resource: { kind: "workspace", workspaceId: "executive" },
      },
      helperDismissed: false,
      dismissHelper: vi.fn(),
    };
    const html = renderToStaticMarkup(createElement(PrototypeNavigator));
    expect(html).toContain("Try another preview role to see authorised access");
    expect(html).toContain('aria-label="Dismiss preview role hint"');
    hint.value.helperDismissed = true;
    expect(
      renderToStaticMarkup(createElement(PrototypeNavigator)),
    ).not.toContain("Try another preview role");
  });

  it.each<AccessResource>([
    { kind: "area", workspaceId: "welfare", areaId: "employee-representation" },
    {
      kind: "area",
      workspaceId: "digital",
      areaId: "nonexistent-private-area",
    },
    { kind: "department", departmentId: "people-culture" },
  ])("does not imply alternative entitlement for $kind $areaId", (resource) => {
    vi.stubGlobal(
      "location",
      new URL("/welfare-representation?staff=taylor", "https://example.test"),
    );
    vi.stubGlobal("sessionStorage", { getItem: () => null });
    hint.value = {
      deniedArea: { owner: "boundary", resource },
      helperDismissed: false,
      dismissHelper: vi.fn(),
    };
    expect(
      renderToStaticMarkup(createElement(PrototypeNavigator)),
    ).not.toContain("Try another preview role");
  });

  it("provides professional German for the new external and access-control labels", () => {
    for (const source of [
      "Preview role",
      "General Staff Member",
      "Frontline Sales Adviser",
      "Executive Director",
      "Personnel Administrator",
      "Technology & Engineering Administrator",
      "Try another preview role to see authorised access",
      "Dismiss preview role hint",
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
