import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import PrototypeNavigator from "./PrototypeNavigator";
import { consumeWelcomeEntry, markWelcomeEntry } from "./demoControls";

afterEach(() => vi.unstubAllGlobals());
describe("the unobtrusive external demo controls", () => {
  it("invites exploration only on the first departure from Welcome per session", () => {
    const memory = new Map<string, string>();
    vi.stubGlobal("sessionStorage", {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => memory.set(key, value),
      removeItem: (key: string) => memory.delete(key),
    });
    expect(consumeWelcomeEntry()).toBe(false);
    markWelcomeEntry();
    expect(consumeWelcomeEntry()).toBe(true);
    expect(consumeWelcomeEntry()).toBe(false);
    markWelcomeEntry();
    expect(consumeWelcomeEntry()).toBe(false);
  });
  it("keeps direct visits collapsed with a keyboard-accessible reveal handle", () => {
    vi.stubGlobal("location", new URL("https://example.test/architecture"));
    vi.stubGlobal("sessionStorage", { getItem: () => null });
    const html = renderToStaticMarkup(createElement(PrototypeNavigator));
    expect(html).toContain('class="demo-control-frame demo-controls-reveal"');
    expect(html).toMatch(
      /<button[^>]*aria-label="Demo controls"[^>]*aria-expanded="false"[^>]*aria-controls="demo-controls-panel"/,
    );
    expect(html).toMatch(/id="demo-controls-panel"[^>]*hidden=""/);
    expect(html).toContain('id="preview-role"');
  });
  it("still leaves the handle usable when session storage is unavailable", () => {
    vi.stubGlobal("sessionStorage", {
      getItem: () => {
        throw new Error("unavailable");
      },
    });
    expect(() => markWelcomeEntry()).not.toThrow();
    expect(consumeWelcomeEntry()).toBe(false);
  });
});
