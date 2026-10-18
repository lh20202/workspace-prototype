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
        onOpenSharePoint={() => {}}
      >
        Current department conversation
      </TeamsShell>,
    );
    expect(html).not.toContain("Unjoined functional Team");
    expect(html).toContain('aria-current="page"');
    expect(html).toContain("Current department conversation");
    expect(html).toContain('aria-label="Search channels"');
    expect(html).toContain('aria-label="Digital workplace apps"');
    expect(html).toContain('aria-label="Show channels"');
    expect(html).toContain('aria-label="Open workspace"');
    expect(html).toContain('title="Open workspace"');
    expect(html).toContain('src="/images/channels-mark.svg"');
    expect(html).toContain('src="/images/site-mark.svg"');
    const displayedCopy = [
      html.replace(/<[^>]*>/g, " "),
      ...Array.from(
        html.matchAll(/(?:aria-label|title|alt|placeholder)="([^"]*)"/g),
        (match) => match[1],
      ),
    ].join(" ");
    expect(displayedCopy).not.toMatch(/\b(?:Teams|SharePoint|Microsoft|M365)\b/);
  });
});
