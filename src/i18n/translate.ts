import { germanMessages } from "./de";
import { germanContent } from "./de-content";
import { germanFiles } from "./de-files";
import { germanFrontline } from "./de-frontline";
import { germanWiki } from "./de-wiki";
import { germanAccessUpdate } from "./de-access-update";
import { germanPublishing } from "./de-publishing";
import { germanPersonnelSignposting } from "./de-personnel-signposting";
import { germanTeamsLogistics } from "./de-teams-logistics";
import { germanTeamsStudio } from "./de-teams-studio";
import { germanTeamsTechnical } from "./de-teams-technical";
import { germanTeamsDepartments } from "./de-teams-departments";
import { germanOrientation } from "./de-orientation";
import { germanSimplifiedNames } from "./de-simplified-names";
import { germanDirectoryRedesign } from "./de-directory-redesign";
import { germanAdvisory } from "./de-advisory";
import { germanOneDrive } from "./de-onedrive";
import { canonicalBrandText } from "../environments/catalog";
import { germanExternalEnvironments } from "./de-external-environments";
import { germanWikiRefinement } from "./de-wiki-refinement";
import { germanTeamsHistory } from "./de-teams-history";
import { germanArchivesRefinement } from "./de-archives-refinement";
import { germanPlanningPersonnelRefinement } from "./de-planning-personnel-refinement";
import { germanFinanceRefinement } from "./de-finance-refinement";
import { germanFAQRolesSensitivity } from "./de-faq-roles-sensitivity";
import { germanPlanningReporting } from "./de-planning-reporting";
import { germanWorkspaceFAQ } from "./de-workspace-faq";
import {
  germanAdministration,
  germanAdministrationLabel,
} from "./de-administration";

export type Language = "en" | "de";
const messages = {
  ...germanMessages,
  ...germanContent,
  ...germanFiles,
  ...germanFrontline,
  ...germanWiki,
  ...germanAccessUpdate,
  ...germanPublishing,
  ...germanPersonnelSignposting,
  ...germanTeamsLogistics,
  ...germanTeamsStudio,
  ...germanTeamsTechnical,
  ...germanTeamsDepartments,
  ...germanOrientation,
  ...germanSimplifiedNames,
  ...germanDirectoryRedesign,
  ...germanAdvisory,
  ...germanOneDrive,
  ...germanExternalEnvironments,
  ...germanWikiRefinement,
  ...germanTeamsHistory,
  ...germanArchivesRefinement,
  ...germanPlanningPersonnelRefinement,
  ...germanFinanceRefinement,
  ...germanFAQRolesSensitivity,
  ...germanPlanningReporting,
  ...germanWorkspaceFAQ,
  ...germanAdministration,
};
const englishMonths = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const germanMonths = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];
const shortMonths = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const germanShortMonths = [
  "Jan.",
  "Feb.",
  "März",
  "Apr.",
  "Mai",
  "Juni",
  "Juli",
  "Aug.",
  "Sept.",
  "Okt.",
  "Nov.",
  "Dez.",
];

function dateText(text: string): string | undefined {
  const fullMonth = englishMonths.indexOf(text);
  if (fullMonth >= 0) return germanMonths[fullMonth];
  const shortMonth = shortMonths.indexOf(text);
  if (shortMonth >= 0) return germanShortMonths[shortMonth];
  const date = text.match(/^(\d{1,2})\s+([A-Za-z]+)(?:\s+(\d{4}))?$/);
  if (date) {
    const month = englishMonths.indexOf(date[2]);
    const short = shortMonths.indexOf(date[2]);
    if (month >= 0 || short >= 0)
      return `${date[1]}. ${month >= 0 ? germanMonths[month] : germanShortMonths[short]}${date[3] ? ` ${date[3]}` : ""}`;
  }
  const month = text.match(/^([A-Za-z]+) (\d{4})$/);
  if (month && englishMonths.includes(month[1]))
    return `${germanMonths[englishMonths.indexOf(month[1])]} ${month[2]}`;
  return undefined;
}

/** Translate display strings only. Canonical routes, IDs, field values and records stay English. */
export function translateText(source: string, language: Language): string {
  return canonicalBrandText(interpretText(source, language));
}

function interpretText(source: string, language: Language): string {
  if (language === "en" || !source.trim()) return source;
  const leading = source.match(/^\s*/)?.[0] || "";
  const trailing = source.match(/\s*$/)?.[0] || "";
  const text = source.trim().replace(/\s+/g, " ");
  const direct = messages[text];
  if (direct) return leading + direct + trailing;
  const administration = germanAdministrationLabel(text, (part) =>
    translateText(part, language),
  );
  if (administration) return leading + administration + trailing;
  const date = dateText(text);
  if (date) return leading + date + trailing;
  const accessDraft = text.match(/^I need access to (.+)\.$/);
  if (accessDraft)
    return `${leading}Ich benötige Zugriff auf den Bereich „${translateText(accessDraft[1], language)}“.${trailing}`;
  const urgentReason = text.match(
    /^Access to (.+) is time-sensitive and the workspace focal point is unavailable\.$/,
  );
  if (urgentReason)
    return `${leading}Der Zugriff auf „${translateText(urgentReason[1], language)}“ ist zeitkritisch. Die zuständige Ansprechperson des Arbeitsbereichs ist nicht erreichbar.${trailing}`;
  const signedIn = text.match(/^Signed in as (.+)$/);
  if (signedIn) return `${leading}Angemeldet als ${signedIn[1]}${trailing}`;
  const illustrated = text.match(/^Illustrated avatar of (.+)$/);
  if (illustrated)
    return `${leading}Illustrierter Avatar von ${illustrated[1]}${trailing}`;
  const destination = text.match(/^Open destination:\s*(.+)$/);
  if (destination)
    return `${leading}Ziel öffnen: ${translateText(destination[1], language)}${trailing}`;
  const fileType = text.match(/^(docx|xlsx|pptx|pdf|doc|xls|ppt) file$/i);
  if (fileType)
    return `${leading}${fileType[1].toUpperCase()}-Datei${trailing}`;
  const week = text.match(/^Week (\d+)$/);
  if (week) return `${leading}Woche ${week[1]}${trailing}`;
  const searchLabel = text.match(/^Search (.+)$/);
  if (searchLabel)
    return `${leading}${translateText(searchLabel[1], language)} durchsuchen${trailing}`;
  const documentTable = text.match(/^(.+) documents$/);
  if (documentTable && !/^\d+$/.test(documentTable[1]))
    return `${leading}Dokumente – ${translateText(documentTable[1], language)}${trailing}`;
  const selectLabel = text.match(/^Select (.+)$/);
  if (selectLabel)
    return `${leading}${translateText(selectLabel[1], language)} auswählen${trailing}`;
  const replyLabel = text.match(/^(Moderator reply from|Reply from) (.+)$/);
  if (replyLabel)
    return `${leading}${replyLabel[1].startsWith("Moderator") ? "Moderation: " : ""}Antwort von ${replyLabel[2]}${trailing}`;
  const postOptions = text.match(/^Post options for (.+)$/);
  if (postOptions)
    return `${leading}Beitragsoptionen für ${postOptions[1]}${trailing}`;
  const likePost = text.match(/^Like post by (.+)$/);
  if (likePost)
    return `${leading}Beitrag von ${likePost[1]} mit „Gefällt mir“ markieren${trailing}`;
  const replyTo = text.match(/^Reply to (.+)$/);
  if (replyTo) return `${leading}${replyTo[1]} antworten${trailing}`;
  const reaction = text.match(/^(.+) reaction$/);
  if (reaction)
    return `${leading}Reaktion: ${translateText(reaction[1], language)}${trailing}`;
  const navigation = text.match(/^(.+) navigation$/);
  if (navigation)
    return `${leading}${translateText(navigation[1], language)} – Navigation${trailing}`;
  const folderGroup = text.match(/^(.+) folders$/);
  if (folderGroup)
    return `${leading}Ordner – ${translateText(folderGroup[1], language)}${trailing}`;
  const statusLabel = text.match(/^Status for (.+)$/);
  if (statusLabel)
    return `${leading}Status für ${translateText(statusLabel[1], language)}${trailing}`;
  const moreActions = text.match(/^More actions for (.+)$/);
  if (moreActions)
    return `${leading}Weitere Aktionen für ${translateText(moreActions[1], language)}${trailing}`;
  const counted = text.match(
    /^(\d+) (documents?|files?|folders?|members?|replies|reply|channels?|items?|results?|open items?)$/i,
  );
  if (counted) {
    const one = counted[1] === "1";
    const noun: Record<string, string> = {
      document: one ? "Dokument" : "Dokumente",
      file: one ? "Datei" : "Dateien",
      folder: one ? "Ordner" : "Ordner",
      member: one ? "Mitglied" : "Mitglieder",
      reply: one ? "Antwort" : "Antworten",
      channel: one ? "Kanal" : "Kanäle",
      item: one ? "Eintrag" : "Einträge",
      result: one ? "Ergebnis" : "Ergebnisse",
      "open item": one ? "offener Eintrag" : "offene Einträge",
    };
    const key =
      counted[2] === "replies" ? "reply" : counted[2].replace(/s$/, "");
    if (noun[key]) return `${leading}${counted[1]} ${noun[key]}${trailing}`;
  }
  // Compound bylines and locations keep names and canonical identifiers intact.
  if (text.includes("/") && !text.startsWith("/") && !/^https?:/i.test(text))
    return (
      leading +
      text
        .split("/")
        .map((part) => translateText(part, language))
        .join("/") +
      trailing
    );
  if (text.includes(", ") && !/[.!?]/.test(text))
    return (
      leading +
      text
        .split(", ")
        .map((part) => translateText(part, language))
        .join(", ") +
      trailing
    );
  if (/\s[·|/→]\s/.test(text)) {
    const parts = text.split(/(\s[·|/→]\s)/);
    return (
      leading +
      parts
        .map((part, i) => (i % 2 ? part : translateText(part, language)))
        .join("") +
      trailing
    );
  }
  const today = text.match(/^(Today|Yesterday)(,?\s+.+)$/);
  if (today)
    return (
      leading +
      (today[1] === "Today" ? "Heute" : "Gestern") +
      today[2] +
      trailing
    );
  const parenthetical = text.match(/^(.+?)(\s*\([^()]+\))$/);
  if (parenthetical && messages[parenthetical[1]])
    return leading + messages[parenthetical[1]] + parenthetical[2] + trailing;
  const file = text.match(
    /^(.+?)(\.(?:docx?|xlsx?|pptx?|pdf|png|jpg|csv|mp4|txt))$/i,
  );
  if (file && messages[file[1]])
    return leading + messages[file[1]] + file[2] + trailing;
  const suffix = text.match(/^(.+?)([:…])$/);
  if (suffix && messages[suffix[1]])
    return leading + messages[suffix[1]] + suffix[2] + trailing;
  return source;
}
