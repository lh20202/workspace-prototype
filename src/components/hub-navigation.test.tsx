import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import HubNavigation from "./HubNavigation";
import EnvironmentIcon from "./EnvironmentIcon";
import WorkspaceHeader from "../logistics/WorkspaceHeader";
import {
  environmentsForHub,
  hubDefinitions,
  workspaceById,
} from "../workspaces/registry";

afterEach(() => vi.unstubAllGlobals());

function links(html: string) {
  return [...html.matchAll(/<a\b([^>]*)>(.*?)<\/a>/g)].map(
    ([, attributes, label]) => ({
      href: attributes.match(/href="([^"]+)"/)?.[1],
      current: attributes.includes('aria-current="page"'),
      label: (
        label.match(/<span class="hub-navigation-label">(.*?)<\/span>/)?.[1] ||
        label
      ).replaceAll("&amp;", "&"),
    }),
  );
}

describe("shared SharePoint hub navigation", () => {
  it("keeps the full Sales family in its agreed order on workspaces, Wiki and Portal", () => {
    const expected = [
      ["Research & Insight", "/audience-innovation"],
      ["Creative & Editorial", "/content-delivery"],
      ["Acquisition", "/logistics"],
      ["Customer Care", "/customer-relations"],
      ["Sales & Marketing Wiki", "/sales-marketing/wiki"],
      ["Frontline Sales Portal", "/frontline-sales"],
      ["Company intranet", "/architecture"],
    ];
    for (const [, pathname] of expected.slice(0, -1)) {
      const html = renderToStaticMarkup(<HubNavigation pathname={pathname} />);
      const result = links(html);
      expect(result.map(({ label, href }) => [label, href])).toEqual(expected);
      expect(
        result.filter((link) => link.current).map((link) => link.href),
      ).toEqual([pathname]);
      expect(html).toContain('data-environment="wiki"');
      expect(html).toContain('data-environment="portal"');
    }
  });

  it("keeps the same ordered hub destinations and intranet link across every sibling", () => {
    for (const hub of hubDefinitions) {
      const environments = environmentsForHub(hub.id);
      const expected = [
        ...environments.map(({ href, hubLabel }) => ({
          href,
          label: hubLabel,
        })),
        { href: "/architecture", label: "Company intranet" },
      ];
      for (const environment of environments) {
        const result = links(
          renderToStaticMarkup(
            <HubNavigation
              workspaceId={environment.id}
              pathname={environment.href}
            />,
          ),
        );
        expect(result.map(({ href, label }) => ({ href, label }))).toEqual(
          expected,
        );
        expect(
          result.filter((link) => link.current).map((link) => link.href),
        ).toEqual([environment.href]);
      }
    }
  });

  it("resolves nested site routes while keeping local pages out of the hub bar", () => {
    const result = links(
      renderToStaticMarkup(
        <HubNavigation pathname="/digital-tech/protected/privileged-access" />,
      ),
    );
    expect(result.find((link) => link.current)?.href).toBe("/digital-tech");
    expect(result.map((link) => link.href)).not.toContain(
      "/digital-tech/protected/privileged-access",
    );
    expect(result.at(-1)).toEqual({
      href: "/architecture",
      label: "Company intranet",
      current: false,
    });
  });

  it("keeps standalone finance intentionally simple", () => {
    expect(workspaceById.get("finance")?.hubId).toBeUndefined();
    expect(
      links(
        renderToStaticMarkup(
          <HubNavigation pathname="/financial-operations/treasury" />,
        ),
      ),
    ).toEqual([
      {
        href: "/financial-operations",
        label: "Income & Financial Operations",
        current: true,
      },
      { href: "/architecture", label: "Company intranet", current: false },
    ]);
  });

  it("preserves only the explicit staff identity across hub destinations", () => {
    const result = links(
      renderToStaticMarkup(
        <HubNavigation
          pathname="/logistics/operations"
          search="?staff=maya&folder=Central&file=OP-004&tab=Files&preview=admin"
        />,
      ),
    );
    expect(result.length).toBeGreaterThan(1);
    for (const { href } of result) {
      const url = new URL(href!, "https://example.test");
      expect([...url.searchParams]).toEqual([["staff", "maya"]]);
    }
    expect(result.at(-1)?.href).toBe("/architecture?staff=maya");
  });

  it("uses distinct compact marks for the Wiki and Portal environments", () => {
    for (const type of ["wiki", "portal"] as const) {
      const html = renderToStaticMarkup(<EnvironmentIcon type={type} />);
      expect(html).toContain(
        `class="environment-icon environment-icon-${type}"`,
      );
      expect(html).toContain('aria-hidden="true"');
      expect(html.includes('class="environment-icon-letter"')).toBe(
        type === "wiki",
      );
    }
  });

  it("does not add hub chrome to Teams or unrelated product contexts", () => {
    for (const pathname of [
      "/teams",
      "/logistics/teams",
      "/content-delivery/teams",
      "/projects/PRJ-2026-014/teams",
      "/governance",
      "/emergency-response",
      "/architecture",
    ]) {
      expect(renderToStaticMarkup(<HubNavigation pathname={pathname} />)).toBe(
        "",
      );
    }
  });

  it("places the shared bar between Microsoft 365 and the current site header", () => {
    vi.stubGlobal(
      "location",
      new URL("https://example.test/logistics/operations"),
    );
    const html = renderToStaticMarkup(
      <WorkspaceHeader onOpen={() => {}} onMessage={() => {}} />,
    );
    expect(html.indexOf('class="m365-header"')).toBeLessThan(
      html.indexOf('class="hub-navigation"'),
    );
    expect(html.indexOf('class="hub-navigation"')).toBeLessThan(
      html.indexOf('class="site-header"'),
    );
    expect(links(html).find((link) => link.current)?.label).toBe("Acquisition");
  });
});
