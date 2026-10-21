import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import FunctionalApp from "../workspaces/FunctionalApp";
import AudienceApp from "../audience/AudienceApp";
import ContentApp from "../content/ContentApp";
import AccessBoundary from "./AccessBoundary";
import { PreviewRoleProvider } from "../components/PreviewRoleContext";
import { isDemoContentRevealed, revealDemoContent } from "./demoContentReveal";
import type { AccessResource } from "./policy";

afterEach(() => vi.unstubAllGlobals());
const revealAction = "Reveal restricted content";
const explanation = "Access to this content depends on your role.";

function renderBoundary(resource: AccessResource, area = "Protected area") {
  return renderToStaticMarkup(
    <PreviewRoleProvider>
      <AccessBoundary
        workspaceId="digital"
        area={area}
        personId="taylor"
        resource={resource}
      />
    </PreviewRoleProvider>,
  );
}

describe("page-local restricted-content reveal", () => {
  it.each([
    ["/digital-tech/protected/credentials?staff=taylor", "credentials"],
    ["/digital-tech/protected/security?staff=taylor", "security"],
    ["/employment-admin/protected/payroll-inputs?staff=taylor", "payroll"],
    ["/employment-admin/protected/employee-records?staff=taylor", "records"],
  ])(
    "shows the reveal action at the protected destination %s",
    (path, area) => {
      vi.stubGlobal("location", new URL(path, "https://example.test"));
      vi.stubGlobal("sessionStorage", { getItem: () => "taylor" });
      const html = renderToStaticMarkup(
        <PreviewRoleProvider>
          <FunctionalApp />
        </PreviewRoleProvider>,
      );
      expect(html).toContain("Access required");
      expect(html).toContain(revealAction);
      expect(html).toContain(explanation);
      expect(html.toLowerCase()).not.toContain(`${area} details`);
    },
  );

  it.each([
    [
      "/audience-innovation/research/website-usability/participant-administration?staff=maya",
      AudienceApp,
    ],
    [
      "/content-delivery/packages/PKG-107/protected/participant-administration?staff=maya",
      ContentApp,
    ],
  ] as const)(
    "keeps specialist membership separate from the page-local reveal at %s",
    (path, App) => {
      vi.stubGlobal("location", new URL(path, "https://example.test"));
      vi.stubGlobal("sessionStorage", { getItem: () => "maya" });
      const html = renderToStaticMarkup(
        <PreviewRoleProvider>
          <App />
        </PreviewRoleProvider>,
      );
      expect(html).toContain("Access required");
      expect(html).toContain(revealAction);
      expect(html).not.toContain("Try another preview role");
    },
  );

  it("places the demo reveal in a separate sticky beside the access message", () => {
    vi.stubGlobal("location", new URL("https://example.test/executive"));
    vi.stubGlobal("sessionStorage", { getItem: () => null });
    const html = renderBoundary({
      kind: "workspace",
      workspaceId: "executive",
    });
    const boundary = html.match(
      /<section class="access-boundary[\s\S]*?<\/section>/,
    )?.[0];
    expect(boundary).toBeTruthy();
    expect(boundary).not.toContain(revealAction);
    expect(boundary).toContain(explanation);
    expect(boundary).not.toContain("RESTRICTED ACCESS");
    expect(html).toContain('class="access-demo-sticky demo-paper-surface"');
    expect(html).toContain(revealAction);
    expect(html).toContain("RESTRICTED ACCESS");
    expect(
      html.match(
        /<button[^>]*class="[^"]*access-boundary-reveal"[^>]*>[\s\S]*?<svg/,
      )?.[0],
    ).toBeTruthy();
    expect(html).not.toContain("access-boundary-reveal-arrow");
    expect(boundary).not.toContain("preview-role");
  });

  it("does not offer a reveal for a location without a real restricted resource", () => {
    vi.stubGlobal("location", new URL("https://example.test/"));
    vi.stubGlobal("sessionStorage", { getItem: () => null });
    const html = renderToStaticMarkup(
      <PreviewRoleProvider>
        <AccessBoundary
          workspaceId="digital"
          area="Unavailable location"
          personId="taylor"
        />
      </PreviewRoleProvider>,
    );
    expect(html).toContain("This location is unavailable.");
    expect(html).not.toContain(revealAction);
  });

  it("scopes a session reveal to the same person and exact destination", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };
    vi.stubGlobal("window", { sessionStorage: storage });
    vi.stubGlobal("sessionStorage", storage);
    const security: AccessResource = {
      kind: "area",
      workspaceId: "digital",
      areaId: "security",
    };
    const credentials: AccessResource = {
      kind: "area",
      workspaceId: "digital",
      areaId: "credentials",
    };

    expect(isDemoContentRevealed(security, "taylor")).toBe(false);
    expect(revealDemoContent(security, "taylor")).toBe(true);
    expect(isDemoContentRevealed(security, "taylor")).toBe(true);
    expect(isDemoContentRevealed(credentials, "taylor")).toBe(false);
    expect(isDemoContentRevealed(security, "maya")).toBe(false);
  });

  it("keeps the boundary closed when browser storage cannot save a reveal", () => {
    const storage = {
      getItem: () => null,
      setItem: () => {
        throw new Error("storage unavailable");
      },
    };
    vi.stubGlobal("window", { sessionStorage: storage });
    vi.stubGlobal("sessionStorage", storage);
    expect(
      revealDemoContent(
        { kind: "workspace", workspaceId: "executive" },
        "taylor",
      ),
    ).toBe(false);
    expect(
      isDemoContentRevealed(
        { kind: "workspace", workspaceId: "executive" },
        "taylor",
      ),
    ).toBe(false);
  });
});
