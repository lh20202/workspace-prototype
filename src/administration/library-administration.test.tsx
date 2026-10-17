import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getSiteAdminModel } from "./model";
import LibraryAdministration, {
  readLibraryPreview,
  validateLibraryPreview,
} from "./LibraryAdministration";

const store = new Map<string, string>();
function at(staff = "leonie", path = "/content-delivery/production") {
  vi.stubGlobal(
    "location",
    new URL(`${path}?staff=${staff}`, "https://example.test"),
  );
  vi.stubGlobal("sessionStorage", {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, value: string) => store.set(key, value),
  });
  return getSiteAdminModel(staff, path, location.search)!;
}
const callbacks = { onBack: () => {}, onClose: () => {}, onMessage: () => {} };
afterEach(() => {
  store.clear();
  vi.unstubAllGlobals();
});

describe("canonical library administration previews", () => {
  it("gives both elevated roles the same modern library controls without a custom dashboard", () => {
    for (const role of ["leonie", "elliot"]) {
      const site = at(role);
      const content = site.current!;
      expect(content.kind).toBe("library");
      const html = renderToStaticMarkup(
        createElement(LibraryAdministration, { site, content, ...callbacks }),
      );
      expect(html).toContain("Library settings");
      expect(html).toContain('aria-label="Name"');
      expect(html).toContain('aria-label="Description"');
      expect(html).toContain("More library settings");
      expect(html).toContain("Default sensitivity labels");
      expect(html).toContain("Existing files are not relabelled");
      expect(html).not.toMatch(
        /Admin dashboard|Tenant settings|Global administrator/,
      );
    }
  });
  it("does not turn ordinary readers or a denied business route into library administrators", () => {
    const elevated = at();
    const content = elevated.current!;
    const ordinary = at("taylor");
    expect(ordinary.canManage).toBe(false);
    expect(
      renderToStaticMarkup(
        createElement(LibraryAdministration, {
          site: ordinary,
          content,
          ...callbacks,
        }),
      ),
    ).toBe("");
    const denied = at("leonie", "/planning/restricted");
    expect(denied.canManage).toBe(false);
    expect(
      renderToStaticMarkup(
        createElement(LibraryAdministration, {
          site: denied,
          content,
          ...callbacks,
        }),
      ),
    ).toBe("");
  });
  it("offers a default label only on a genuinely configured example", () => {
    const site = at("leonie", "/digital-tech/m365");
    const content = site.current!;
    expect(content.definition?.defaultSensitivity).toBeUndefined();
    const html = renderToStaticMarkup(
      createElement(LibraryAdministration, { site, content, ...callbacks }),
    );
    expect(html).not.toContain("Default sensitivity labels");
    store.set(
      `library-administration-preview:${site.id}:${content.id}`,
      JSON.stringify({ defaultSensitivity: "Strictly confidential" }),
    );
    expect(readLibraryPreview(site.id, content).defaultSensitivity).toBe("");
  });
  it("restores scoped preview settings without changing canonical files, permissions, columns or views", () => {
    const site = at();
    const content = site.current!;
    const original = JSON.stringify(content);
    const column = content.columns[0];
    const view = content.views[0];
    const key = `library-administration-preview:${site.id}:${content.id}`;
    store.set(
      key,
      JSON.stringify({
        name: "Production preview",
        defaultSensitivity: "Confidential",
        majorVersions: 750,
        expirationDays: 365,
        permissionMode: "unique",
        documents: [{ id: "replacement" }],
        requiredColumns: { [column.key]: true, "unknown-field": true },
        viewColumns: {
          [view.id]: [column.key, "unknown-field"],
          "unknown-view": [column.key],
        },
      }),
    );
    const restored = readLibraryPreview(site.id, content);
    expect(restored.name).toBe("Production preview");
    expect(restored.defaultSensitivity).toBe("Confidential");
    expect(restored.majorVersions).toBe(750);
    expect(restored.expirationDays).toBe(365);
    expect(restored.requiredColumns).toEqual({ [column.key]: true });
    expect(restored.viewColumns).toEqual({ [view.id]: [column.key] });
    expect(restored).not.toHaveProperty("documents");
    expect(restored).not.toHaveProperty("permissionMode");
    expect(JSON.stringify(content)).toBe(original);
    expect(readLibraryPreview("another-site", content).name).toBe(content.name);
  });
  it("validates native library version limits and does not apply document-only features to list previews", () => {
    const site = at();
    const content = site.current!;
    const value = readLibraryPreview(site.id, content);
    expect(validateLibraryPreview(value)).toBe("");
    expect(validateLibraryPreview({ ...value, majorVersions: 99 })).toContain(
      "100",
    );
    expect(
      validateLibraryPreview({ ...value, majorVersions: 50001 }),
    ).toContain("50,000");
    expect(validateLibraryPreview({ ...value, expirationDays: 29 })).toContain(
      "30 days",
    );
    expect(
      validateLibraryPreview({
        ...value,
        majorVersions: 500,
        expirationDays: 30,
      }),
    ).toBe("");
    expect(validateLibraryPreview({ ...value, name: " " })).toBe(
      "Enter a name.",
    );
    const listSite = at("leonie", "/logistics/locations");
    const list = listSite.current!;
    expect(list.kind).toBe("list");
    store.set(
      `library-administration-preview:${listSite.id}:${list.id}`,
      JSON.stringify({
        versionMode: "major-minor",
        limitMode: "automatic",
        requireCheckout: true,
        expirationDays: 365,
      }),
    );
    const listPreview = readLibraryPreview(listSite.id, list);
    expect(listPreview.versionMode).toBe("major");
    expect(listPreview.limitMode).toBe("manual");
    expect(listPreview.expirationDays).toBe(0);
    expect(listPreview.requireCheckout).toBe(false);
    expect(
      validateLibraryPreview({ ...listPreview, majorVersions: 50 }, "list"),
    ).toBe("");
  });
  it("falls back safely when session storage is malformed or unavailable", () => {
    const site = at();
    const content = site.current!;
    store.set(
      `library-administration-preview:${site.id}:${content.id}`,
      "{invalid-json",
    );
    expect(readLibraryPreview(site.id, content).name).toBe(content.name);
    vi.stubGlobal("sessionStorage", {
      getItem: () => {
        throw new Error("Unavailable");
      },
    });
    expect(readLibraryPreview(site.id, content).majorVersions).toBe(500);
  });
});
