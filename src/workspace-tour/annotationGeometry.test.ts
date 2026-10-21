import { describe, expect, it } from "vitest";
import { annotationConnectorPath } from "./annotationGeometry";

describe("tour annotation arrows", () => {
  it("connects the label edge to the target edge using measured positions", () => {
    const path = annotationConnectorPath(
      { left: 0, top: 0, width: 100, height: 40 },
      { left: 200, top: 100, width: 40, height: 40 },
    );

    expect(path).toMatch(/^M 84 40 C /);
    expect(path.endsWith("200 108.23529411764706")).toBe(true);
  });
});
