import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import TeamsShell from "./TeamsShell";

describe("Teams navigation shell", () => {
  it("omits a Team with no accessible channels", () => {
    const html = renderToStaticMarkup(
      <TeamsShell
        userName="Taylor Brooks"
        teamName="MCG Department"
        channelName="General"
        groups={[
          { id: "unjoined", label: "Unjoined functional Team", channels: [] },
          {
            id: "department",
            label: "MCG Department",
            channels: [
              { id: "department:General", label: "General", onSelect() {} },
            ],
          },
        ]}
        selectedChannelId="department:General"
        activeTab="Posts"
        onTabChange={() => {}}
      >
        Current department conversation
      </TeamsShell>,
    );
    expect(html).not.toContain("Unjoined functional Team");
    expect(html).toContain('aria-current="page"');
    expect(html).toContain("Current department conversation");
  });
});
