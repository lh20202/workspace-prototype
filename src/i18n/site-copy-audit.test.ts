import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { expect, it } from "vitest";
import { displayText } from "./displayText";

const productName =
  /\b(?:Microsoft|SharePoint|M365|OneDrive)\b|\b(?:Teams|TEAMS)\b/;

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(path) && !/\.test\./.test(path) ? [path] : [];
  });
}

it("removes vendor product names from display text across every production source file", () => {
  const copy = new Set<string>();
  for (const path of sourceFiles(
    fileURLToPath(new URL("../", import.meta.url)),
  )) {
    const source = ts.createSourceFile(
      path,
      readFileSync(path, "utf8"),
      ts.ScriptTarget.Latest,
      true,
    );
    const visit = (node: ts.Node) => {
      if (ts.isStringLiteralLike(node) || ts.isJsxText(node))
        copy.add(node.text.trim());
      if (ts.isTemplateExpression(node)) {
        copy.add(node.head.text.trim());
        for (const span of node.templateSpans)
          copy.add(span.literal.text.trim());
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
  const namedCopy = [...copy].filter(
    (text) => productName.test(text) && !/^(?:[@./]|https?:)/.test(text),
  );
  expect(namedCopy.length).toBeGreaterThan(100);
  for (const source of namedCopy)
    for (const language of ["en", "de"] as const)
      expect(
        displayText(source, language),
        `${language}: ${source}`,
      ).not.toMatch(productName);
});
