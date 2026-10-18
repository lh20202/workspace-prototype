import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import TeamsHomePanel from "./TeamsHomePanel";
import CompanyMark from "./CompanyMark";
import SimulationMessage from "./SimulationMessage";

describe("shared Teams Home panel", () => {
  it("omits the whole panel when no canonical channels are available", () => {
    expect(
      renderToStaticMarkup(
        <TeamsHomePanel
          description="Discuss current work."
          channels={[]}
          openHref="/teams?workspace=digital"
        />,
      ),
    ).toBe("");
  });
  it("identifies each channel with one neutral conversation mark", () => {
    const channels = [
      {
        name: "Engineering",
        href: "/teams?workspace=digital&channel=Engineering",
      },
      { name: "AI Lab", href: "/teams?workspace=digital&channel=AI+Lab" },
    ];
    const markup = renderToStaticMarkup(
      <TeamsHomePanel
        description="Discuss current work."
        channels={channels}
        openHref="/teams?workspace=digital"
      />,
    );
    expect(markup.match(/src="\/images\/channels-mark.svg"/g)).toHaveLength(
      channels.length + 1,
    );
    for (const channel of channels) {
      expect(markup).toContain(`<span>${channel.name}</span>`);
    }
    expect(markup).toContain("Open channels");
    expect(markup).toContain("Channel coordination");
    expect(markup).toContain('alt="Channels"');
    expect(markup).not.toMatch(
      /(?:alt|aria-label|title)="[^"]*(?:Teams|SharePoint|Microsoft|M365)/,
    );
    expect(markup).not.toContain("poc-annotation");
  });
  it("keeps semantic groups compact while exposing canonical lifecycle and private cues", () => {
    const html = renderToStaticMarkup(
      <TeamsHomePanel
        workspace={{ id: "digital", name: "Dev." }}
        description="Discuss working files."
        groups={[
          {
            id: "technical",
            label: "Channel desks",
            channels: [
              {
                id: "security",
                name: "Security Engineering",
                href: "/teams?workspace=digital&channel=Security+Engineering",
                privacy: "private",
              },
            ],
          },
          {
            id: "coverage",
            label: "Current coverage",
            channels: [
              {
                id: "coverage",
                name: "Current coverage",
                href: "/teams?workspace=content&channel=coverage",
                lifecycle: "Active",
                temporary: true,
              },
            ],
          },
        ]}
        openHref="/teams?workspace=digital"
      />,
    );
    expect(html).toContain('data-workspace="digital"');
    expect(html).toContain("<h3>Channel desks</h3>");
    expect(html).toContain("Private channel");
    expect(html).toContain("Temporary");
    expect(html).toContain('data-channel="security"');
    expect(html).not.toContain("Archived");
  });
  it("uses a real PNG organisation asset while keeping product logos separate", () => {
    const png = readFileSync(
      new URL("../../public/images/company-mark.png", import.meta.url),
    );
    expect([...png.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    const mark = renderToStaticMarkup(<CompanyMark />);
    expect(mark).toContain('src="/images/company-mark.png"');
    expect(mark).not.toMatch(/teams-logo|sharepoint-logo|<span/);
  });
  it("keeps business warnings separate from explicit test notifications", () => {
    for (const message of [
      "Access required",
      "Strictly confidential",
      "Private channel",
    ]) {
      expect(
        renderToStaticMarkup(<SimulationMessage message={message} />),
      ).not.toContain("poc-annotation");
    }
    expect(
      renderToStaticMarkup(
        <SimulationMessage message="Preview: no file is uploaded." />,
      ),
    ).toBe("Preview: no file is uploaded.");
  });
});
