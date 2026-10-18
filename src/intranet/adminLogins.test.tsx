import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import AdminLogins from "./AdminLogins";
import Directory from "./Directory";
import WorkspaceIcon from "../components/WorkspaceIcon";
import {
  adminPlatforms,
  adminPlatformsForHub,
  externalEnvironmentForTool,
  externalPreviewHref,
  canonicalBrandText,
} from "../environments/catalog";
import {
  architectureDestinationById,
  destinationsForHub,
} from "./architectureDestinations";

afterEach(() => vi.unstubAllGlobals());

describe("canonical environment and vendor identities", () => {
  it("uses a single outlined workspace mark with a restrained S badge", () => {
    const html = renderToStaticMarkup(createElement(WorkspaceIcon));
    expect(html).toContain('class="workspace-icon"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain(">S</text>");
    expect(html).not.toContain("img");
  });

  it("keeps admin systems subordinate to each hub with the requested product counts", () => {
    vi.stubGlobal("location", new URL("https://example.test/architecture"));
    const counts = [
      ["sales-marketing", 3],
      ["infrastructure", 4],
      ["personnel", 1],
      ["finance", 2],
    ] as const;
    for (const [hubId, count] of counts) {
      const platforms = adminPlatformsForHub(hubId);
      expect(platforms).toHaveLength(count);
      const html = renderToStaticMarkup(createElement(AdminLogins, { hubId }));
      expect(html).toContain(`id="admin-logins-${hubId}"`);
      expect(html.match(/data-brand=/g)).toHaveLength(count);
      expect(html).not.toMatch(
        /aria-haspopup|<button|<dialog|target="_blank"|workspace-icon/,
      );
      for (const system of platforms) {
        expect(html).toContain(`href="${externalPreviewHref(system.id)}"`);
        expect(html).toContain(system.logo);
        expect(html).toContain(system.name);
      }
    }
    expect(adminPlatforms).toHaveLength(9);
    expect(new Set(adminPlatforms.map(({ id }) => id)).size).toBe(9);
  });

  it("reuses exactly one CRM identity across Sales, finance and customer references", () => {
    const sales = adminPlatformsForHub("sales-marketing").find(
      ({ id }) => id === "relovia",
    );
    const finance = adminPlatformsForHub("finance").find(
      ({ id }) => id === "relovia",
    );
    expect(sales).toBe(finance);
    for (const id of [
      "salesforce",
      "hubspot",
      "gainsight",
      "quorum",
      "zendesk",
    ])
      expect(externalEnvironmentForTool(id)).toBe(sales);
    expect(
      canonicalBrandText("Salesforce → HubSpot CRM → Oracle NetSuite"),
    ).toBe("Relovia → Relovia → Velora");
  });

  it("uses local category-specific transparent vector marks, including a document rather than money motif for Recorda", () => {
    const logos = adminPlatforms.map((system) =>
      readFileSync(`public${system.logo}`, "utf8"),
    );
    expect(new Set(logos).size).toBe(9);
    for (const logo of logos) {
      expect(logo).toContain("linearGradient");
      expect(logo).toContain("feDropShadow");
      expect(logo).not.toMatch(/<image|<text|https?:\/\/(?!www.w3.org)|[€$£]/);
    }
  });

  it("places all new external environments in their correct hub without workspace marks", () => {
    vi.stubGlobal("location", new URL("https://example.test/architecture"));
    const html = renderToStaticMarkup(createElement(Directory));
    const entries = [
      ["sales-marketing", "media-library", "Media Library"],
      ["infrastructure", "members", "Membership Portal"],
      ["personnel", "taskforce", "Global Crew Portal"],
    ] as const;
    for (const [hub, id, label] of entries) {
      const destination = architectureDestinationById.get(id)!;
      expect(destinationsForHub(hub)).toContainEqual(destination);
      expect(destination).toMatchObject({ type: "portal", label });
      const escapedHref = destination.href.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
      );
      const anchor = html.match(
        new RegExp(`<a[^>]*href="${escapedHref}"[^>]*>[\\s\\S]*?<\\/a>`),
      )?.[0];
      expect(anchor).toBeTruthy();
      expect(anchor).toContain("environment-icon-portal");
      expect(anchor).not.toContain("workspace-icon");
    }
    expect(html).not.toContain('id="admin-logins-heading"');
    expect(html.match(/class="directory-admin-logins"/g)).toHaveLength(4);
  });
});
