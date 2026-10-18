import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import FunctionalApp from "./FunctionalApp";
import { personnelDestinations } from "../intranet/architectureDestinations";
import { configById, functionalConfigs } from "./config";
import {
  functionalLibraries,
  functionalLibraryDocuments,
} from "./siteArchitecture";
import { previewRoles } from "../access/policy";
import { translateText } from "../i18n/translate";
import { pageTitle } from "../utils/routes";
import { getHubNavigationModel } from "../components/hubNavigationModel";

afterEach(() => vi.unstubAllGlobals());

function render(path: string, person = "taylor") {
  vi.stubGlobal(
    "location",
    new URL(
      `${path}${path.includes("?") ? "&" : "?"}staff=${person}`,
      "https://example.test",
    ),
  );
  vi.stubGlobal("sessionStorage", { getItem: () => person });
  return renderToStaticMarkup(<FunctionalApp />);
}

function currentLinks(markup: string) {
  return [...markup.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)]
    .filter(([, attributes]) => attributes.includes('aria-current="page"'))
    .map(([, attributes]) => attributes.match(/href="([^"]+)"/)?.[1]);
}

function localNavigation(markup: string) {
  return (
    markup.match(
      /<nav aria-label="(?:Workforce|Edu|Workforce &amp; Edu) navigation">([\s\S]*?)<\/nav>/,
    )?.[1] || ""
  );
}

describe("People & Culture keeps functional entrances in one existing workspace", () => {
  it("opens every direct section with its own heading and local selection, while the hub keeps the shared workspace selected", () => {
    for (const destination of personnelDestinations.normal) {
      const markup = render(destination.href);
      const local = localNavigation(markup);
      expect(markup).toContain(
        `<h1>${destination.label.replaceAll("&", "&amp;")}</h1>`,
      );
      expect(pageTitle(destination.href)).toBe(destination.label);
      expect(markup).not.toContain("People &amp; Culture");
      expect(currentLinks(local)).toEqual([`${destination.href}?staff=taylor`]);
      expect(
        getHubNavigationModel({
          pathname: destination.href,
          search: "?staff=taylor",
        })!
          .workspaces.filter(({ isCurrent }) => isCurrent)
          .map(({ destinationHref }) => destinationHref),
      ).toEqual(["/people-culture?staff=taylor"]);
      for (const sibling of personnelDestinations.normal)
        expect(local).toContain(`href="${sibling.href}?staff=taylor"`);
      expect(markup).not.toContain('class="access-boundary');
    }
  });

  it("keeps Edu and Workforce names through library and file links without duplicate content headings", () => {
    for (const [section, title] of [
      ["learning-documents", "Edu"],
      ["workforce-documents", "Workforce"],
    ]) {
      const markup = render(`/people-culture/${section}`);
      expect(pageTitle(`/people-culture/${section}`)).toBe(title);
      expect(markup).not.toContain("People &amp; Culture");
      const main = markup.match(/<main[\s\S]*?<\/main>/)?.[0] || "";
      expect(main.match(new RegExp(`>${title}<\\/h[12]>`, "g"))).toHaveLength(
        1,
      );
    }
    expect(pageTitle("/people-culture")).toBe("Workforce & Edu");
  });

  it("uses the existing shared libraries with folder scopes, including both communications channels", () => {
    expect(render("/people-culture/workforce")).toContain("2027 contributions");
    expect(render("/people-culture/culture")).toContain("Pilot design");
    expect(render("/people-culture/frameworks")).toContain(
      "Organisation-wide design",
    );
    expect(render("/people-culture/learning")).toContain("Learning programmes");
    const communications = render("/people-culture/communications");
    expect(communications).toContain("All-staff meetings");
    expect(communications).toContain("Intranet &amp; Wiki");
    expect(render("/people-culture/communities")).toContain(
      "/people-culture/workforce-documents?library=Workforce&amp;folder=Company+events&amp;staff=taylor",
    );
    expect(functionalLibraries.people).toHaveLength(3);
  });

  it("keeps the selected function when opening a canonical file link", () => {
    for (const title of [
      "Workforce",
      "Workforce & Ethics",
      "Workforce & Culture",
    ]) {
      const markup = render(
        `/people-culture/workforce-documents?${new URLSearchParams({ file: "people-F2", library: title })}`,
      );
      expect(currentLinks(localNavigation(markup))).toEqual([
        "/people-culture/culture?staff=taylor",
      ]);
      expect(markup).toContain("Leadership Programme — Design Review.docx");
    }
  });

  it("keeps ordinary Personnel entrances available for all six roles without opening private areas", () => {
    for (const role of previewRoles) {
      for (const destination of personnelDestinations.normal)
        expect(render(destination.href, role.id)).not.toContain(
          'class="access-boundary',
        );
      expect(
        render("/people-culture/communities/network-membership", role.id),
      ).toContain("Access required");
    }
  });

  it("keeps existing canonical files and restrained Home rather than creating six libraries or copies", () => {
    const config = configById.get("people")!;
    const files = functionalLibraries.people.flatMap((library) =>
      functionalLibraryDocuments(config, library),
    );
    expect(new Set(files.map((file) => file.id)).size).toBe(
      config.files.length,
    );
    for (const file of files)
      expect(
        functionalConfigs
          .flatMap((workspace) => workspace.files)
          .filter((candidate) => candidate.id === file.id),
      ).toEqual([file]);
    const home = render("/people-culture");
    expect(home).toContain("Upcoming programme material");
    expect(home).not.toContain("directory-grid");
    expect(config.areas.some((area) => area.id === "wellbeing")).toBe(true);
    expect(
      config.files.every(
        (file) =>
          !/welfare-case|safeguarding|employee-representation/.test(file.area),
      ),
    ).toBe(true);
  });

  it("translates the two entrances and grouping labels without changing routes or canonical data", () => {
    expect(
      personnelDestinations.normal.map(({ label }) =>
        translateText(label, "de"),
      ),
    ).toEqual(["Belegschaft", "Edu"]);
    expect(translateText("Controlled environments", "de")).toBe(
      "Zugriffsbeschränkte Bereiche",
    );
    expect(translateText("People & organisation", "de")).toBe(
      "Personal & Organisation",
    );
  });
});
