import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  PreviewRoleProvider,
  usePreviewRoleContext,
} from "./PreviewRoleContext";

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function capturePreview() {
  let captured: ReturnType<typeof usePreviewRoleContext> = null;
  function Probe() {
    captured = usePreviewRoleContext();
    return null;
  }
  renderToStaticMarkup(
    createElement(PreviewRoleProvider, null, createElement(Probe)),
  );
  return captured!;
}

describe("the access-page role signpost", () => {
  it("focuses and reveals the selector without changing identity or permissions", () => {
    vi.useFakeTimers();
    const storageWrite = vi.fn();
    vi.stubGlobal("sessionStorage", { setItem: storageWrite });
    const preview = capturePreview();
    const selector = {
      value: "maya",
      focus: vi.fn(),
      scrollIntoView: vi.fn(),
    };
    preview.roleSelectorRef.current = selector as unknown as HTMLSelectElement;
    preview.focusRoleSelector();
    expect(selector.focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(selector.scrollIntoView).toHaveBeenCalledWith({
      block: "center",
      behavior: "auto",
    });
    expect(selector.value).toBe("maya");
    expect(storageWrite).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(1);
    // Repeated clicks restart one finite highlight rather than accumulating timers.
    preview.focusRoleSelector();
    expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(2500);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("does nothing when no selector is mounted", () => {
    vi.useFakeTimers();
    expect(() => capturePreview().focusRoleSelector()).not.toThrow();
    expect(vi.getTimerCount()).toBe(0);
  });
});
