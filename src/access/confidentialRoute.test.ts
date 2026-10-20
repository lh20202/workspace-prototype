import { describe, expect, it } from "vitest";
import { confidentialClassificationForRoute } from "./confidentialRoute";
import { revealDemoContent } from "./demoContentReveal";
import { afterEach, vi } from "vitest";

afterEach(() => vi.unstubAllGlobals());

describe("confidential route treatment", () => {
  it("uses canonical classification only when the current role can see controlled content", () => {
    expect(
      confidentialClassificationForRoute("/executive", "?staff=robin"),
    ).toBe("Strictly confidential");
    expect(
      confidentialClassificationForRoute("/executive", "?staff=taylor"),
    ).toBeUndefined();
    expect(
      confidentialClassificationForRoute("/planning", "?staff=taylor"),
    ).toBeUndefined();
  });

  it("retains a canonical label when a visitor reveals the restricted example", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };
    vi.stubGlobal("window", { sessionStorage: storage });
    vi.stubGlobal("sessionStorage", storage);
    expect(
      revealDemoContent(
        { kind: "workspace", workspaceId: "executive" },
        "taylor",
      ),
    ).toBe(true);
    expect(
      confidentialClassificationForRoute("/executive", "?staff=taylor"),
    ).toBe("Strictly confidential");
  });
});
