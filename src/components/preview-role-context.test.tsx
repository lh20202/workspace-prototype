import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  PreviewRoleProvider,
  usePreviewRoleContext,
} from "./PreviewRoleContext";
import { readFileSync } from "node:fs";

const helperStyles = readFileSync(
  new URL("./preview-role.css", import.meta.url),
  "utf8",
);

afterEach(() => vi.unstubAllGlobals());

describe("a bounded, browser-local role signpost", () => {
  it("remembers dismissal without changing product access or sending a message", () => {
    const storage = new Map<string, string>();
    vi.stubGlobal("sessionStorage", {
      getItem: (key: string) => storage.get(key) || null,
      setItem: (key: string, value: string) => storage.set(key, value),
    });
    let captured: ReturnType<typeof usePreviewRoleContext> = null;
    function Probe() {
      captured = usePreviewRoleContext();
      return null;
    }
    renderToStaticMarkup(
      createElement(PreviewRoleProvider, null, createElement(Probe)),
    );
    expect(captured!.helperDismissed).toBe(false);
    captured!.dismissHelper();
    expect(storage.get("workspace-preview-role-helper-dismissed")).toBe("true");
    expect(storage.has("workspace-preview-staff")).toBe(false);
    renderToStaticMarkup(
      createElement(PreviewRoleProvider, null, createElement(Probe)),
    );
    expect(captured!.helperDismissed).toBe(true);
  });

  it("limits motion to three small nudges and requires no reduced-motion preference", () => {
    expect(helperStyles).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*no-preference\)/,
    );
    expect(helperStyles).toMatch(
      /animation:\s*preview-role-cue\s+900ms\s+ease-out\s+3/,
    );
    expect(helperStyles).not.toContain("infinite");
    expect(helperStyles).toContain("translateY(-2px)");
  });
});
