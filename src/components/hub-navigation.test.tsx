import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import HubNavigation from "./HubNavigation";
import EnvironmentIcon from "./EnvironmentIcon";
import { getHubNavigationModel } from "./hubNavigationModel";
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
  it("keeps Sales workspaces separate from the Wiki and Portal in their agreed order", () => {
    const workspaces = [
      ["Audience Research & Marketing Insight", "/audience-innovation"],
      ["Creative & Editorial Studio", "/content-delivery"],
      ["Acquisition & Activation Logistics", "/logistics"],
      ["Customer Care & Relations", "/customer-relations"],
    ];
    const related = [
      ["Sales & Marketing Wiki", "/sales-marketing/wiki"],
      ["Frontline Sales Portal", "/frontline-sales"],
    ];
    for (const [, pathname] of [...workspaces, ...related]) {
      const model = getHubNavigationModel({ pathname })!;
      expect(
        model.workspaces.map(({ title, destinationHref }) => [
          title,
          destinationHref,
        ]),
      ).toEqual(workspaces);
      expect(
        model.related.map(({ title, destinationHref }) => [
          title,
          destinationHref,
        ]),
      ).toEqual(related);
      expect(
        [...model.workspaces, ...model.related]
          .filter((item) => item.isCurrent)
          .map((item) => item.href),
      ).toEqual([pathname]);
      expect(model.intranetHref).toBe("/architecture");
    }
  });

  it("renders one collapsed Workspaces control instead of a crowded row of destination links", () => {
    for (const hub of hubDefinitions) {
      for (const environment of environmentsForHub(hub.id)) {
        const html = renderToStaticMarkup(
          <HubNavigation
            workspaceId={environment.id}
            pathname={environment.href}
          />,
        );
        expect(html).toContain("Workspaces");
        expect(html).toContain('aria-haspopup="menu"');
        expect(html).not.toContain('aria-expanded="true"');
        expect(html).not.toContain('role="menu"');
        expect(links(html)).toEqual([
          { href: "/architecture", label: "Company intranet", current: false },
        ]);
      }
    }
  });

  it("keeps the same ordered environment destinations across every sibling", () => {
    for (const hub of hubDefinitions) {
      const environments = environmentsForHub(hub.id);
      for (const environment of environments) {
        const model = getHubNavigationModel({
          workspaceId: environment.id,
          pathname: environment.href,
        })!;
        expect(
          [...model.workspaces, ...model.related].map(({ id }) => id),
        ).toEqual(environments.map(({ id }) => id));
        expect(
          [...model.workspaces, ...model.related]
            .filter((item) => item.isCurrent)
            .map((item) => item.href),
        ).toEqual([environment.href]);
        expect(
          model.workspaces.every(
            (item) => item.environmentType === "workspace",
          ),
        ).toBe(true);
        expect(
          model.related.every((item) => item.environmentType !== "workspace"),
        ).toBe(true);
      }
    }
  });

  it("resolves nested site routes while keeping local pages out of the shared menu", () => {
    const model = getHubNavigationModel({
      pathname: "/digital-tech/protected/privileged-access",
    })!;
    expect(model.workspaces.find((item) => item.isCurrent)?.href).toBe(
      "/digital-tech",
    );
    expect(model.workspaces.map((item) => item.href)).not.toContain(
      "/digital-tech/protected/privileged-access",
    );
    expect(model.intranetHref).toBe("/architecture");
  });

  it("keeps standalone finance intentionally simple", () => {
    expect(workspaceById.get("finance")?.hubId).toBeUndefined();
    const model = getHubNavigationModel({
      pathname: "/financial-operations/treasury",
    })!;
    expect(
      model.workspaces.map(({ title, destinationHref, isCurrent }) => ({
        title,
        destinationHref,
        isCurrent,
      })),
    ).toEqual([
      {
        title: "Income & Financial Operations",
        destinationHref: "/financial-operations",
        isCurrent: true,
      },
    ]);
    expect(model.related).toEqual([]);
    expect(model.intranetHref).toBe("/architecture");
  });

  it("preserves only the explicit staff identity across every menu destination and intranet link", () => {
    const model = getHubNavigationModel({
      pathname: "/logistics/operations",
      search: "?staff=maya&folder=Central&file=OP-004&tab=Files&preview=admin",
    })!;
    for (const href of [...model.workspaces, ...model.related]
      .map((item) => item.destinationHref)
      .concat(model.intranetHref)) {
      const url = new URL(href, "https://example.test");
      expect([...url.searchParams]).toEqual([["staff", "maya"]]);
    }
    const html = renderToStaticMarkup(
      <HubNavigation
        pathname="/logistics/operations"
        search="?staff=maya&file=OP-004"
      />,
    );
    expect(links(html)[0]?.href).toBe("/architecture?staff=maya");
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
      expect(getHubNavigationModel({ pathname })).toBeNull();
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
    expect(html).toContain("Workspaces");
    expect(links(html)).toEqual([
      { href: "/architecture", label: "Company intranet", current: false },
    ]);
  });
});
