import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { germanAdministration } from "./de-administration";
import { displayText } from "./displayText";
import { translateText } from "./translate";
import { getSiteAdminModel } from "../administration/model";
import {
  SiteInformation,
  SiteNavigation,
  SiteRegional,
  SiteAdvanced,
} from "../administration/SitePanels";
import LibraryAdministration from "../administration/LibraryAdministration";
import { environmentRegistry } from "../workspaces/registry";

afterEach(() => vi.unstubAllGlobals());
const german = (source: string) => displayText(source, "de");

describe("German administration terminology reviewed after English completion", () => {
  it("uses the established German site, library and list terminology", () => {
    const expected = {
      "Site information": "Websiteinformationen",
      "Site permissions": "Websiteberechtigungen",
      "Change the look": "Aussehen ändern",
      "Apply a site template": "Websitevorlage anwenden",
      "Site contents": "Websiteinhalte",
      "Site usage": "Websitenutzung",
      "View all site settings": "Alle Websiteeinstellungen anzeigen",
      "Site columns": "Websitespalten",
      "Site content types": "Websiteinhaltstypen",
      "Library settings": "Bibliothekseinstellungen",
      "List settings": "Listeneinstellungen",
      "Versioning settings": "Versionsverwaltungseinstellungen",
    };
    for (const [source, value] of Object.entries(expected))
      expect(german(source)).toBe(value);
  });

  it("retains reviewed copy precedence without changing canonical English values", () => {
    for (const [source, translated] of Object.entries(germanAdministration)) {
      expect(translateText(source, "de"), source).toBe(translated);
      expect(translateText(source, "en"), source).toBe(source);
    }
  });

  it("keeps inherited permissions, classification and preview safety distinct", () => {
    expect(["Full Control", "Edit", "Read"].map(german)).toEqual([
      "Vollzugriff",
      "Bearbeiten",
      "Lesen",
    ]);
    expect(german("Inherits permissions from this site")).toBe(
      "Erbt Berechtigungen von dieser Website",
    );
    expect(german("Unique permissions")).toBe("Eigene Berechtigungen");
    expect(german("Default sensitivity labels")).toBe(
      "Standardvertraulichkeitsbezeichnungen",
    );
    expect(german("None")).toBe("Keine");
    expect(
      german(
        "Applies to new or edited files. Existing files are not relabelled in this preview.",
      ),
    ).toContain(
      "Vorhandene Dateien werden in dieser Vorschau nicht neu gekennzeichnet",
    );
    expect(
      german(
        "Access remains controlled by the site's groups and separately authorised areas. This preview does not grant access.",
      ),
    ).toContain("Diese Vorschau vergibt keine Zugriffsrechte");
    expect(
      german("Require documents to be checked out before they can be edited?"),
    ).toContain("ausgecheckt");
  });

  it("translates dynamic accessible names and settings titles without changing routes", () => {
    expect(german("Navigation label 2")).toBe(
      "Beschriftung für Navigationslink 2",
    );
    expect(german("Show Home in navigation")).toBe(
      "Startseite in der Navigation anzeigen",
    );
    expect(german("Move navigation link 3 up")).toBe(
      "Navigationslink 3 nach oben verschieben",
    );
    expect(german("Current Production: Library settings")).toBe(
      "Aktuelle Produktion: Bibliothekseinstellungen",
    );
    expect(german("Locations & Permits: List settings")).toBe(
      "Standorte und Genehmigungen: Listeneinstellungen",
    );
    const route = "/digital-tech?staff=leonie&siteSettings=site-columns";
    expect(german(route)).toBe(route);
  });

  it("translates the actual canonical site and library names and descriptions used in form inputs", () => {
    for (const path of environmentRegistry.map((site) => site.href)) {
      const site = getSiteAdminModel("leonie", path, "")!;
      if (!site?.canManage) continue;
      for (const copy of [
        site.title,
        site.description,
        ...site.contents.flatMap((content) => [
          content.name,
          content.description || "",
        ]),
      ].filter(Boolean)) {
        if (copy === "Sales & Marketing Wiki")
          expect(german(copy)).toBe(copy); // Preserve the established Wiki brand.
        else expect.soft(german(copy), `${path}: ${copy}`).not.toBe(copy);
      }
    }
  });

  it("covers rendered form labels, metadata navigation and library configuration", () => {
    vi.stubGlobal(
      "location",
      new URL("https://example.test/content-delivery/production?staff=leonie"),
    );
    vi.stubGlobal("sessionStorage", { getItem: () => null });
    const site = getSiteAdminModel(
      "leonie",
      location.pathname,
      location.search,
    )!;
    const props = {
      site,
      onSurface: () => {},
      onClose: () => {},
      onMessage: () => {},
    };
    const html =
      [SiteInformation, SiteNavigation, SiteRegional, SiteAdvanced]
        .map((component) =>
          renderToStaticMarkup(createElement(component, props)),
        )
        .join("") +
      renderToStaticMarkup(
        createElement(LibraryAdministration, {
          site,
          content: site.current!,
          onBack: () => {},
          onClose: () => {},
          onMessage: () => {},
        }),
      );
    const attributes = Array.from(
      html.matchAll(/(?:aria-label|title|placeholder)="([^"]*)"/g),
      (match) => german(match[1]),
    );
    expect(attributes).toContain("Websitename");
    expect(attributes).toContain("Beschreibung der Website");
    expect(attributes).toContain("Beschriftung für Navigationslink 1");
    expect(attributes).toContain("Zeitzone");
    expect(attributes).toContain("Bibliothekseinstellungen schließen");
    expect(attributes).toContain("Standardvertraulichkeitsbezeichnungen");
    expect(html).toContain('<option value="">None</option>');
    for (const label of [
      "Public",
      "Internal",
      "Confidential",
      "Strictly confidential",
    ])
      expect(html).toContain(`value="${label}"`);
    for (const [value, label] of [
      ["English (United Kingdom)", "Englisch (Vereinigtes Königreich)"],
      ["German (Germany)", "Deutsch (Deutschland)"],
    ]) {
      expect(html).toContain(`value="${value}"`);
      expect(german(value)).toBe(label);
    }
    expect(html).toContain('value="private"');
    expect(html).toContain('value="public"');
    expect(attributes.join(" ")).not.toMatch(
      /\b(?:SharePoint|Microsoft|M365|Teams)\b/,
    );
  });
});
