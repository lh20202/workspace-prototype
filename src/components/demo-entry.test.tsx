import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import Launcher from "../intranet/Launcher";
import PrototypeNavigator from "./PrototypeNavigator";
import HubNavigation from "./HubNavigation";
import TeamsHomePanel from "./TeamsHomePanel";
import TeamsShell from "../teams/TeamsShell";
import WorkspaceDenied from "../access/WorkspaceDenied";
import { resolveStaffPerson } from "../intranet/catalog";
import {
  channelNavigationFor,
  teamsPreviewHrefForStaff,
} from "../teams/navigation";
import { withExplicitStaff } from "../utils/staffNavigation";
import { PreviewRoleProvider } from "./PreviewRoleContext";
import AccessBoundary from "../access/AccessBoundary";
import { changePreviewRole } from "./demoControls";

afterEach(() => vi.unstubAllGlobals());

function visit(path: string) {
  vi.stubGlobal("location", new URL(path, "https://example.test"));
  vi.stubGlobal("sessionStorage", { getItem: () => null });
}

describe("standalone workspace demos and the beta entry", () => {
  it("returns to Welcome from a standalone access boundary without offering the beta", () => {
    visit("/planning?staff=taylor&demo=standalone");
    const html = renderToStaticMarkup(
      <WorkspaceDenied workspaceId="planning" />,
    );
    expect(html).not.toContain("/architecture");
    expect(html).toContain('href="/?staff=taylor"');
    const urgentLink = html.match(/href="([^"]+)">Raise urgent access request/);
    expect(urgentLink?.[1]).toContain("demo=standalone");
  });
  it.each(["standalone", "beta"])(
    "Welcome offers an explicit fresh choice after a %s visit",
    (mode) => {
      visit(`/?staff=taylor&demo=${mode}`);
      const html = renderToStaticMarkup(<Launcher />);
      expect(html).toContain(
        'href="/planning?demo=standalone&amp;staff=taylor"',
      );
      expect(html).toContain(
        'href="/logistics?demo=standalone&amp;staff=taylor"',
      );
      expect(html).toContain('href="/architecture?demo=beta&amp;staff=taylor"');
    },
  );

  it.each(["planning", "logistics"])(
    "keeps the standalone %s demo's controls without beta navigation",
    (workspace) => {
      visit(`/${workspace}?staff=taylor&demo=standalone`);
      const controls = renderToStaticMarkup(<PrototypeNavigator />);
      expect(controls).toContain('href="/?staff=taylor"');
      expect(controls).toContain("Workspace FAQ");
      expect(controls).not.toContain('id="preview-role"');
      expect(controls).not.toContain("Switch roles");
      expect(controls).not.toContain("/architecture");
      expect(controls).not.toContain("BETA");
      expect(
        renderToStaticMarkup(<HubNavigation workspaceId={workspace} />),
      ).toBe("");
    },
  );

  it.each(["planning", "logistics"])(
    "retains beta navigation without offering role selection in %s",
    (workspace) => {
      visit(`/${workspace}?staff=taylor&demo=beta`);
      const controls = renderToStaticMarkup(<PrototypeNavigator />);
      expect(controls).not.toContain('id="preview-role"');
      expect(controls).toContain(
        'href="/architecture?staff=taylor&amp;demo=beta"',
      );
      expect(controls).toContain("BETA");
      const hub = renderToStaticMarkup(
        <HubNavigation workspaceId={workspace} />,
      );
      expect(hub).toContain("Workspaces");
      expect(hub).toContain("Company intranet");
    },
  );

  it("keeps the chosen mode in ordinary links, even without a role or with a destination role", () => {
    expect(
      withExplicitStaff(
        "/planning/planning?folder=2027#files",
        "?demo=standalone&tab=Shared",
      ),
    ).toBe("/planning/planning?folder=2027&demo=standalone#files");
    expect(
      withExplicitStaff("/teams?staff=alex", "?staff=taylor&demo=standalone"),
    ).toBe("/teams?staff=alex&demo=standalone");
    expect(withExplicitStaff("/planning", "?demo=unrecognised")).toBe(
      "/planning",
    );
    expect(withExplicitStaff("https://example.test/", "?demo=standalone")).toBe(
      "https://example.test/",
    );
  });

  it.each(["/planning", "/logistics", "/teams?workspace=planning"])(
    "does not change the preview role from the standalone demo at %s",
    (path) => {
      const url = new URL(path, "https://example.test");
      url.searchParams.set("demo", "standalone");
      url.searchParams.set("staff", "taylor");
      const assign = vi.fn();
      const setItem = vi.fn();
      vi.stubGlobal("location", {
        pathname: url.pathname,
        search: url.search,
        href: url.href,
        assign,
      });
      vi.stubGlobal("sessionStorage", { getItem: () => "taylor", setItem });
      changePreviewRole("nadia");
      expect(assign).not.toHaveBeenCalled();
      expect(setItem).not.toHaveBeenCalled();
    },
  );

  it.each(["standalone", "beta"])(
    "offers the same page-local reveal at restricted destinations in %s mode",
    (mode) => {
      visit(`/planning/restricted?staff=taylor&demo=${mode}`);
      const html = renderToStaticMarkup(
        <PreviewRoleProvider>
          <AccessBoundary
            workspaceId="planning"
            area="Restricted Planning"
            personId="taylor"
            resource={{
              kind: "area",
              workspaceId: "planning",
              areaId: "restricted",
            }}
          />
        </PreviewRoleProvider>,
      );
      expect(html).toContain("Reveal restricted content");
      expect(html).toContain("Access to this content depends on your role.");
      expect(html).not.toContain("Try another preview role");
      expect(html).toContain("Contact focal point");
    },
  );

  it("keeps channel shortcuts and channel switches in the standalone demo", () => {
    visit("/planning?demo=standalone");
    const html = renderToStaticMarkup(
      <TeamsHomePanel
        description="Planning conversations"
        channels={[
          { name: "Planning & Reporting", href: "/teams?workspace=planning" },
        ]}
        openHref="/teams?workspace=planning"
      />,
    );
    expect(
      html.match(/href="\/teams\?workspace=planning&amp;demo=standalone"/g),
    ).toHaveLength(2);
    const assign = vi.fn();
    vi.stubGlobal("location", { search: "?demo=standalone", assign });
    const navigation = channelNavigationFor({
      person: resolveStaffPerson("taylor"),
      entryContext: { kind: "workspace", id: "planning" },
    });
    for (const group of navigation.groups) {
      for (const channel of group.channels) channel.onSelect();
    }
    expect(assign).toHaveBeenCalled();
    for (const [href] of assign.mock.calls) {
      const url = new URL(href, "https://example.test");
      expect(url.searchParams.get("demo")).toBe("standalone");
      expect(url.searchParams.get("context")).toBe("workspace:planning");
    }
  });

  it.each(["standalone", "beta"])(
    "keeps %s mode when changing the preview role in channels",
    (mode) => {
      const person = resolveStaffPerson("alex");
      for (const context of [
        "",
        "&workspace=planning&context=workspace:planning&channel=Planning",
      ]) {
        const href = teamsPreviewHrefForStaff(
          person,
          "/teams",
          `?staff=taylor&demo=${mode}${context}`,
        );
        const url = new URL(href, "https://example.test");
        expect(url.searchParams.get("demo")).toBe(mode);
        expect(url.searchParams.get("staff")).toBe(person.id);
      }
    },
  );

  it.each(["standalone", "beta"])(
    "keeps channel guidance out of the conversation sidebar in %s mode",
    (mode) => {
      visit(
        `/teams?demo=${mode}&workspace=planning&context=workspace:planning`,
      );
      const html = renderToStaticMarkup(
        <TeamsShell
          userName="Demo User"
          teamName="Planning"
          channelName="Planning & Reporting"
          groups={[]}
          selectedChannelId="planning"
          activeTab="Posts"
          onTabChange={() => {}}
        >
          Conversation
        </TeamsShell>,
      );
      expect(html).not.toContain("Open your channel view");
      expect(html).not.toContain("View channels for this role");
      expect(html).toContain("Conversation");
      const controls = renderToStaticMarkup(<PrototypeNavigator />);
      expect(controls).not.toContain("View channels for this role");
      expect(controls).not.toContain('aria-label="Preview role"');
    },
  );
});
