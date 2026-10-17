import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import TeamsPreview from "../intranet/TeamsPreview";
import TeamsShell from "./TeamsShell";
import { staff } from "../intranet/catalog";
import { defaultTeamsContext, teamsPreviewHrefForStaff } from "./navigation";

afterEach(() => vi.unstubAllGlobals());

describe("role-specific Teams landing and shell", () => {
  it("opens each ordinary role in its own valid collaboration context", () => {
    for (const [id, team, channel] of [
      ["taylor", "MCG Department", "General"],
      ["robin", "EAO Department", "General"],
      ["jamie", "PAC Department", "General"],
      ["devon", "Tech &amp; Digital", "Engineering"],
    ]) {
      vi.stubGlobal(
        "location",
        new URL(`/teams?staff=${id}`, "https://example.test"),
      );
      vi.stubGlobal("sessionStorage", { getItem: () => id });
      const html = renderToStaticMarkup(<TeamsPreview />);
      expect(html).toContain(`${team}</span><h1>${channel}</h1>`);
      expect(html).not.toContain("Access required");
      expect(html).not.toContain("Acquisition &amp; Activation Logistics");
    }
    const maya = staff.find((person) => person.id === "maya")!;
    expect(defaultTeamsContext(maya)).toEqual({
      workspaceId: "logistics",
      departmentId: undefined,
      channel: "general",
    });
  });

  it("does not render empty Team groups even if a caller supplies one", () => {
    const html = renderToStaticMarkup(
      <TeamsShell
        userName="Taylor Brooks"
        teamName="MCG Department"
        channelName="General"
        groups={[
          { id: "empty", label: "Unjoined functional Team", channels: [] },
          {
            id: "department",
            label: "MCG Department",
            channels: [
              { id: "mcg:General", label: "General", onSelect: () => {} },
            ],
          },
        ]}
        selectedChannelId="mcg:General"
        activeTab="Posts"
        onTabChange={() => {}}
      >
        <p>Department conversation</p>
      </TeamsShell>,
    );
    expect(html).not.toContain("Unjoined functional Team");
    expect(html.match(/class="m365-teams-group"/g)).toHaveLength(1);
  });

  it("retains authorised company conversations when changing roles", () => {
    for (const person of staff) {
      const target = new URL(
        teamsPreviewHrefForStaff(
          person,
          "/logistics/teams",
          "?staff=taylor&channel=pets&tab=Posts",
        ),
        "https://example.test",
      );
      expect(target.pathname).toBe("/logistics/teams");
      expect(target.searchParams.get("staff")).toBe(person.id);
      expect(target.searchParams.get("channel")).toBe("pets");
    }
  });

  it("leaves trailing and nested Logistics routes when the new role is not a participant", () => {
    const devon = staff.find((person) => person.id === "devon")!;
    for (const path of ["/logistics/teams/", "/logistics/teams/legacy-path"]) {
      expect(
        teamsPreviewHrefForStaff(
          devon,
          path,
          "?staff=maya&channel=central-city&tab=Shared&file=central-deployment",
        ),
      ).toBe("/teams?staff=devon");
    }
  });
});
