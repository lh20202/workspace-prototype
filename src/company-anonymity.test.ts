import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";

const root = fileURLToPath(new URL("../", import.meta.url));
const organisationName =
  /\b(?:msf|medecins\s+sans\s+frontieres|(?:a|ae)rzte\s+ohne\s+grenzen)\b/i;
const obsoleteDriveName =
  /\bk[\s:‐‑–—-]*(?:drive|laufwerk)\b|\bk:\s*[\\/]|\blaufwerk\s+k\b/i;

function filesUnder(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

it("keeps production copy and public assets anonymous and free of obsolete drive names", () => {
  const files = [
    ...filesUnder(join(root, "src")).filter(
      (path) => !/\.test\.[cm]?[jt]sx?$/.test(path),
    ),
    ...filesUnder(join(root, "public")),
    join(root, "index.html"),
  ];
  const matches = files.filter((path) => {
    // Scan text formats; compressed image pixels can coincidentally contain any bytes.
    const text = (
      /\.(?:[cm]?[jt]sx?|json|html|css|svg|txt|md|xml|csv|webmanifest)$/i.test(
        path,
      )
        ? readFileSync(path, "utf8")
        : ""
    )
      .normalize("NFKD")
      .replace(/\p{M}/gu, "");
    return (
      organisationName.test(text) ||
      organisationName.test(relative(root, path)) ||
      obsoleteDriveName.test(text) ||
      obsoleteDriveName.test(relative(root, path))
    );
  });
  expect(matches.map((path) => relative(root, path))).toEqual([]);
});
