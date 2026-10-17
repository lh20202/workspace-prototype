import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import AdminLogins from "./AdminLogins";
import WorkspaceIcon from "../components/WorkspaceIcon";
import { adminLoginSystems } from "./adminLoginPlatforms";
import { germanDirectoryRedesign } from "../i18n/de-directory-redesign";

describe("distinct workspace and fictional admin-system environment marks", () => {
  it("uses a single outlined workspace mark with a restrained S badge", () => {
    const html = renderToStaticMarkup(createElement(WorkspaceIcon));
    expect(html).toContain('class="workspace-icon"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain(">S</text>");
    expect(html).not.toContain("img");
  });

  it("opens four lightweight fictional admin systems without external authentication links", () => {
    const html = renderToStaticMarkup(createElement(AdminLogins));
    expect(adminLoginSystems.map(({ name }) => name)).toEqual([
      "Teralink",
      "Velora",
      "PeopleHarbour",
      "Recorda",
    ]);
    expect(html.match(/aria-haspopup="dialog"/g)).toHaveLength(4);
    for (const system of adminLoginSystems) {
      expect(html).toContain(system.name);
      expect(html).toContain(system.logo);
      expect(system.items).toHaveLength(3);
      const logo = readFileSync(`public${system.logo}`, "utf8");
      expect(logo).toContain("linearGradient");
      expect(logo).not.toMatch(/<image|https?:\/\/(?!www.w3.org)/);
      expect(germanDirectoryRedesign[system.purpose]).toBeTruthy();
      for (const item of system.items)
        expect(germanDirectoryRedesign[item]).toBeTruthy();
    }
    expect(html).not.toContain('href="http');
    expect(html).not.toContain("workspace-icon");
  });
});
