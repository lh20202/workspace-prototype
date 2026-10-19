import { describe, expect, it } from "vitest";
import { germanTranslationLayers } from "./translate";

describe("German translation layers", () => {
  it("do not define conflicting translations for the same English source", () => {
    const definitions = new Map<string, { value: string; layer: number }>();
    const conflicts: string[] = [];

    germanTranslationLayers.forEach((dictionary, layer) => {
      for (const [source, value] of Object.entries(dictionary)) {
        const previous = definitions.get(source);
        if (previous && previous.value !== value) {
          conflicts.push(
            `${JSON.stringify(source)}: ${JSON.stringify(previous.value)} / ${JSON.stringify(value)} (layers ${previous.layer}, ${layer})`,
          );
        } else {
          definitions.set(source, { value, layer });
        }
      }
    });

    expect(conflicts).toEqual([]);
  });
});
