import { translateText, type Language } from "./translate";
import { formatPublicTerminology } from "./publicTerminology";
import { formatDisplayPunctuation } from "./displayPunctuation";

/** One display boundary for translated copy, public terminology and punctuation. */
export function displayText(source: string, language: Language): string {
  return formatDisplayPunctuation(
    formatPublicTerminology(translateText(source, language), language),
    language,
  );
}
