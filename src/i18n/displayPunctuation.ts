import type { Language } from "./translate";
import { germanDisplayPunctuation } from "./germanDisplayPunctuation";

const englishPhraseRewrites: Record<string, string> = {
  "I work with lots of different tools and platforms — how do they fit in?":
    "I work with lots of different tools and platforms. How do they fit in?",
  "I already work in lots of sites and channels — will this add even more?":
    "I already work in lots of sites and channels. Will this add even more?",
  "If you're unsure, speak to your focal point — they may be able to solve the need within an existing workspace":
    "If you're unsure, speak to your focal point. They may be able to solve the need within an existing workspace",
};

const dash = "[-\\u2010-\\u2015\\u2212\\u2E3A\\u2E3B\\uFE58\\uFE63\\uFF0D]";
const longDash = "[\\u2012-\\u2015\\u2E3A\\u2E3B\\uFE58]";
const allDashes = new RegExp(dash, "g");
const tokens = new RegExp(
  [
    // Actual addresses and paths are meaningful copyable values, even in prose.
    /(?:https?:\/\/|mailto:|tel:|www\.)[^\s<>"“”]+/.source,
    /\b(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+(?:com|org|net|io|dev|de|test|local|co\.uk)(?::\d+)?(?:\/[^\s<>"“”]*)?\b/
      .source,
    /[\p{L}\p{N}.!#$%&'*+/=?^_`{|}~-]+@[\p{L}\p{N}](?:[\p{L}\p{N}.-]*[\p{L}\p{N}])?\.[\p{L}]{2,}/u
      .source,
    /(?<![\p{L}\p{N}])(?:[A-Za-z]:[\\/]|\.{0,2}\/)[^\s<>"“”]+/u.source,
    // Canonical record references, including lowercase file IDs, stay recognizable.
    /\b[A-Za-z][A-Za-z0-9]*(?:-[A-Za-z0-9]+)*-\d[A-Za-z0-9]*(?:-[A-Za-z0-9]+)*\b/
      .source,
    // Flags are syntax; normal compound words are not.
    /(?<!\S)-{1,2}[A-Za-z][A-Za-z0-9-]*(?:=[^\s,;]+)?/.source,
  ].join("|"),
  "gu",
);

function formatISODate(value: string, language: Language) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  const [, year, month, day] = match;
  const date = new Date(`${value}T12:00:00Z`);
  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() + 1 !== Number(month) ||
    date.getUTCDate() !== Number(day)
  )
    return value;
  return date.toLocaleDateString(language === "de" ? "de-DE" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Display copy only, after translation. Never apply to href, value, ID, source data
 * or code. Tokens inside readable copy remain byte-for-byte copyable.
 */
export function formatDisplayPunctuation(
  source: string,
  language: Language,
): string {
  if (
    !source ||
    !/[-\u00AD\u2010-\u2015\u2212\u2E3A\u2E3B\uFE58\uFE63\uFF0D]/.test(source)
  )
    return source;
  const protectedValues: string[] = [];
  const protect = (value: string) => {
    const index = protectedValues.push(value) - 1;
    return `\uE000${index}\uE001`;
  };
  let text = source.replace(tokens, protect);
  if (language === "de") text = germanDisplayPunctuation(text);
  else
    for (const [phrase, replacement] of Object.entries(englishPhraseRewrites))
      text = text.replaceAll(phrase, replacement);

  // Dates are readable labels here; the underlying ISO value is never changed.
  text = text.replace(
    /\b\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2})?Z?)?\b/g,
    (value) => {
      const [date, time] = value.split("T");
      const formatted = formatISODate(date, language);
      if (formatted === date) return protect(value);
      if (!time) return formatted;
      if (!/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?Z?$/.test(time))
        return protect(value);
      return `${formatted}, ${time.replace(/Z$/, " UTC")}`;
    },
  );
  const rangeWord = language === "de" ? "bis" : "to";
  text = text.replace(
    new RegExp(
      `([-\\u2212]?\\d+(?::\\d{2})?(?:[.,]\\d+)?(?:\\s?%)?)\\s*${dash}\\s*([-\\u2212]?\\d+(?::\\d{2})?(?:[.,]\\d+)?(?:\\s?%)?)`,
      "g",
    ),
    `$1 ${rangeWord} $2`,
  );
  // An unspaced en dash denotes a range, including A–Z and Monday–Friday.
  text = text.replace(
    /([\p{L}\p{N}])\u2013(?=[\p{L}\p{N}])/gu,
    `$1 ${rangeWord} `,
  );
  // Paired prose asides retain their relationship without introducing run-on text.
  text = text.replace(
    new RegExp(
      `\\s*${longDash}\\s*([^\\u2012-\\u2015\\u2E3A\\u2E3B\\uFE58\\n]+?)\\s*${longDash}\\s*`,
      "g",
    ),
    " ($1) ",
  );
  text = text.replace(/\s+-\s+([^\n]+?)\s+-\s+/g, " ($1) ");
  text = text.replace(/\u00AD/g, ""); // A discretionary line break is not a word boundary.
  text = text.replace(/-+>/g, "→").replace(/<-+/g, "←");
  text = text.replace(/([£€$])[-\u2212](?=\d)/g, "minus $1");
  text = text.replace(/(?<![\p{L}\p{N}])[-\u2212](?=[£€$]?\d)/gu, "minus ");
  // A missing-value marker should stay meaningful, rather than silently disappear.
  const absent = language === "de" ? "Keine Angabe" : "Not provided";
  if (new RegExp(`^\\s*${dash}+\\s*$`).test(text))
    text = source.trim() === source ? absent : ", ";
  else {
    text = text.replace(
      new RegExp(`([:=]\\s*)${dash}(?=\\s*$|[.;])`, "g"),
      `$1${absent}`,
    );
    text = text.replace(new RegExp(`\\s*${longDash}\\s*`, "g"), ", ");
    text = text.replace(/\s+-\s+/g, ", ");
    text = text.replace(allDashes, " ");
    // Avoid orphan punctuation where a dash introduced an explanation or byline.
    text = text.replace(/(^|\n)[ \t]*,[ \t]*/g, "$1");
    text = text.replace(/,[ \t]*([,;:.!?])/g, "$1");
    text = text.replace(/[ \t]+([,;:.!?])/g, "$1");
    text = text.replace(/,[ \t]*$/g, "");
    text = text.replace(/[ \t]{2,}/g, " ");
  }
  return text.replace(
    /\uE000(\d+)\uE001/g,
    (_, index: string) => protectedValues[Number(index)],
  );
}
