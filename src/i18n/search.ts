import { translateText } from "./translate";

const normalize = (value: string) =>
  value.trim().replace(/\s+/g, " ").toLocaleLowerCase();

/** Search a permitted display field in either language; never changes the source record.
 * Join separate source fields with a newline so each named label can be translated intact.
 */
export function matchesDisplayText(source: string, query: string): boolean {
  const needle = normalize(query);
  if (!needle || normalize(source).includes(needle)) return true;
  const fields = source.split(/[\r\n\t]+/);
  const displayed = fields.map((field) => translateText(field, "de")).join(" ");
  if (normalize(displayed).includes(needle)) return true;
  // Folder paths and compound bylines contain separately displayed named chunks.
  return fields.some((field) =>
    field
      .split(/\s*[|/→]\s*|\s+[·—]\s+/)
      .some((part) => normalize(translateText(part, "de")).includes(needle)),
  );
}
