import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ExecutiveApp from "./ExecutiveApp";
import FunctionalApp from "../workspaces/FunctionalApp";
import { configById } from "../workspaces/config";

afterEach(() => vi.unstubAllGlobals());

function render(
  path: string,
  app: ComponentType<{ id?: string }> = ExecutiveApp,
  remembered = "taylor",
) {
  vi.stubGlobal("location", new URL(path, "https://example.test"));
  vi.stubGlobal("sessionStorage", { getItem: () => remembered });
  return renderToStaticMarkup(createElement(app, {}));
}

describe("the selected role controls rendered business boundaries", () => {
  it("switches the same CEO destination from Demo User denial to Executive Director access", () => {
    const denied = render("/executive/leadership?staff=taylor");
    expect(denied).toContain("Access required");
    expect(denied).not.toContain('aria-label="Executive workspace navigation"');
    const allowed = render("/executive/leadership?staff=robin");
    expect(allowed).not.toContain("Access required");
    expect(allowed).toContain('aria-label="Executive workspace navigation"');
    expect(allowed).toContain("Leadership Team");
  });

  it.each(["maya", "jamie", "devon", "casey", "unknown"])(
    "does not let %s use a historical executive preview parameter to gain CEO access",
    (id) => {
      const html = render(
        `/executive/leadership?staff=${id}&preview=leadership`,
        ExecutiveApp,
        "robin",
      );
      expect(html).toContain("Access required");
      expect(html).not.toContain('aria-label="Executive workspace navigation"');
    },
  );

  it("switches protected technical administration only to the technology role", () => {
    const denied = render(
      "/digital-tech/protected/security?staff=taylor",
      FunctionalApp,
    );
    expect(denied).toContain("Access required");
    const allowed = render(
      "/digital-tech/protected/security?staff=devon",
      FunctionalApp,
    );
    expect(allowed).not.toContain("Access required");
    expect(allowed).toContain("Security Engineering");
    expect(allowed).toContain(
      "Controlled working methods for authorised participants.",
    );
    const executive = render(
      "/digital-tech/protected/security?staff=robin",
      FunctionalApp,
    );
    expect(executive).toContain("Access required");
  });

  it("opens selected employment administration for Personnel while denying executive and technology roles", () => {
    const subject = configById
      .get("employment")!
      .protected.find((item) => item.id === "employee-records")!;
    const allowed = render(
      `/employment-admin/protected/${subject.id}?staff=jamie`,
      FunctionalApp,
    );
    expect(allowed).not.toContain("Access required");
    expect(allowed).toContain(
      "Controlled working methods for authorised participants.",
    );
    for (const id of ["taylor", "maya", "robin", "devon"]) {
      const denied = render(
        `/employment-admin/protected/${subject.id}?staff=${id}`,
        FunctionalApp,
      );
      expect(denied).toContain("Access required");
      expect(denied).not.toContain(
        "Controlled working methods for authorised participants.",
      );
    }
  });

  it("leaves independent representation closed to every selectable role", () => {
    for (const id of ["taylor", "maya", "robin", "jamie", "devon"]) {
      const denied = render(
        `/welfare-representation/employee-representation?staff=${id}`,
        FunctionalApp,
      );
      expect(denied).toContain("Access required");
      expect(denied).toContain("Skyler Lane");
      expect(denied).not.toContain("Administration working methods");
      expect(denied).not.toContain("Try another preview role");
    }
  });
});
