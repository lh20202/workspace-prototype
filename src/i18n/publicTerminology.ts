import type { Language } from "./translate";

/** Audited display aliases. Stored channel names, file references and routes are unchanged. */
export const publicTerminologyAliases = {
  en: {
    "personal OneDrive": "personal drive",
    "OneDrive link": "personal drive link",
    "The Microsoft-style screens are simulations — they aren't connected to live SharePoint, Teams or business systems.":
      "The simulated screens are not connected to live workspaces, channels or business systems.",
    "SharePoint, SPFx, Graph, tenant changes, provisioning, Teams and search engineering.":
      "Sites, SPFx, Graph, tenant changes, provisioning, channels and search engineering.",
    "Not every workspace needs its own Team":
      "Not every workspace needs its own channel group",
    "Microsoft 365 Engineering": "Digital Workplace Engineering",
    "M365 Engineer": "Workplace Platforms Engineer",
    "m365-extensions": "Workplace extensions",
    "M365 Search Improvements": "Digital Workplace Search Improvements",
    "M365 search rollout":
      "rollout of search across digital workplace platforms",
    "M365 search": "search across digital workplace platforms",
    "M365 implementation": "Digital workplace platform implementation",
    "M365 & SPFx": "Workplace platforms & SPFx",
    "M365 und SPFx": "Workplace platforms & SPFx",
    "Microsoft 365 app launcher": "Workplace app launcher",
    "Microsoft 365 apps": "Digital workplace apps",
    "Microsoft Lists": "Shared list",
    "Department Teams": "Department channels",
    "Teams and channels": "Channels",
    "teams and channels": "channels",
    "Teams shows the channels relevant to your role; access to protected work is granted separately.":
      "Your channel view shows the conversations relevant to your role; access to protected work is granted separately.",
    "Teams coordination": "Channel coordination",
    "Team coordination": "Channel coordination",
    "Technical coordination in Teams": "Technical channel coordination",
    "Moderator coordination in Teams": "Moderator channel coordination",
    "Your work, connected in Teams": "Your work, connected through channels",
    "Open Microsoft Teams channels": "Open channels",
    "Open Teams channels": "Open channels",
    "Open in Teams": "Open channel",
    "Open Teams view": "Open channel view",
    "Open your Teams view": "Open your channel view",
    "Open studio in Teams": "Open studio channels",
    "Open my Teams": "Open my channels",
    "Open Teams": "Open channels",
    "Opening Teams": "Opening channels",
    "Search Teams": "Search channels",
    "Clear Teams search": "Clear channel search",
    "Teams exchange": "Channel exchange",
    "Teams demo": "Channel demo",
    "Teams preview": "Channel preview",
    "Teams staff preview": "Channel role preview",
    "Teams administration": "Channel administration",
    "Manage teams": "Manage channel groups",
    "Expand teams": "Expand channel groups",
    "Collapse teams": "Collapse channel groups",
    "full Teams application": "full collaboration application",
    "Microsoft Teams connection": "Channel connection",
    "Teams connection": "channel connection",
    "Microsoft Teams channels": "channels",
    "Teams channels": "channels",
    "Teams channel": "channel",
    "Team channel": "Channel",
    "Teams conversations": "channel conversations",
    "Teams conversation": "channel conversation",
    "Teams Shared": "Shared",
    "Teams files": "channel files",
    "Teams apps": "Channel apps",
    "Teams app": "Channel app",
    "in Teams": "in channels",
    "Open in SharePoint": "Open workspace",
    "Close SharePoint documents": "Close workspace documents",
    "SharePoint metadata implementation": "Site metadata implementation",
    "SharePoint workspace": "workspace",
    "SharePoint site": "site",
    "SharePoint library": "library",
    "SharePoint page": "page",
    "SharePoint list": "list",
    "SharePoint settings": "site settings",
    "SharePoint documents": "workspace documents",
    "SharePoint files": "workspace files",
    "SharePoint contains shared coordination methods":
      "the workspace contains shared coordination methods",
    "in SharePoint": "in the workspace",
  },
  de: {
    "deinem persönlichen OneDrive": "deinem persönlichen Speicherbereich",
    "OneDrive-Links": "Links zum persönlichen Speicherbereich",
    "OneDrive-Link": "Link zum persönlichen Speicherbereich",
    "OneDrive-Dateien": "Dateien im persönlichen Speicherbereich",
    "OneDrive-Datei": "Datei im persönlichen Speicherbereich",
    "OneDrive-Ordner": "Ordner im persönlichen Speicherbereich",
    "zu OneDrive": "zum persönlichen Speicherbereich",
    "aus OneDrive": "aus dem persönlichen Speicherbereich",
    "in OneDrive": "im persönlichen Speicherbereich",
    // These are ordinary groups of people, not the channel product.
    "Beide Teams sind heute im Einsatz.":
      "Beide Einsatzgruppen sind heute im Einsatz.",
    "statt drei Teams hinterherlaufen zu lassen":
      "statt drei Arbeitsgruppen hinterherlaufen zu lassen",
    "über Teams und Kanäle hinweg": "über Arbeitsgruppen und Kanäle hinweg",
    "der Teams im direkten Kundenkontakt":
      "der Beschäftigten im direkten Kundenkontakt",
    "Die an Microsoft angelehnten Oberflächen sind Simulationen – sie sind nicht mit produktivem SharePoint, Teams oder anderen Unternehmenssystemen verbunden.":
      "Die nachgebildeten Oberflächen sind Simulationen. Sie sind nicht mit produktiven Arbeitsbereichen, Kanälen oder anderen Unternehmenssystemen verbunden.",
    "SharePoint, SPFx, Graph, tenant changes, provisioning, Teams and search engineering.":
      "Sites, SPFx, Graph, Mandantenänderungen, Bereitstellung, Kanäle und Suchfunktionen.",
    "Nicht jeder Arbeitsbereich braucht ein eigenes Team":
      "Nicht jeder Arbeitsbereich braucht eine eigene Kanalgruppe",
    "M365 & SPFx": "Plattformen & SPFx",
    "M365 und SPFx": "Plattformen & SPFx",
    "M365 und SPFx/Search rollout": "Plattformen & SPFx/Einführung der Suche",
    "M365 & SPFx/Search rollout": "Plattformen & SPFx/Einführung der Suche",
    "Microsoft 365 Engineering":
      "Entwicklung für digitale Arbeitsplatzplattformen",
    "Microsoft 365-Entwicklung":
      "Entwicklung für digitale Arbeitsplatzplattformen",
    "M365 Engineer":
      "Technische Fachkraft für digitale Arbeitsplatzplattformen",
    "m365-extensions": "Erweiterungen für Arbeitsplatzplattformen",
    "M365-Suche": "Suche in digitalen Arbeitsplatzplattformen",
    "M365 Search Improvements":
      "Verbesserungen der Suche am digitalen Arbeitsplatz",
    "M365 search": "Suche in digitalen Arbeitsplatzplattformen",
    "Technische Umsetzung in M365":
      "Technische Umsetzung für digitale Arbeitsplatzplattformen",
    "Microsoft 365-App-Launcher": "Appstartfeld",
    "Der Microsoft 365-App-Launcher": "Das Appstartfeld",
    "Microsoft 365-Apps": "Apps für den digitalen Arbeitsplatz",
    "Microsoft Lists": "Gemeinsame Liste",
    Abteilungsteams: "Abteilungskanäle",
    "Teams zeigt die für Ihre Rolle relevanten Kanäle. Geschützte Arbeit wird separat berechtigt.":
      "Die Kanalansicht zeigt die für Ihre Rolle relevanten Kanäle. Der Zugriff auf geschützte Inhalte wird gesondert freigegeben.",
    "Ihre Arbeit, vernetzt in Teams": "Ihre Arbeit, über Kanäle vernetzt",
    "Technische Koordination in Teams": "Technische Kanalabstimmung",
    "Abstimmung der Moderation in Teams": "Abstimmung der Kanalmoderation",
    "Teams und Kanäle": "Kanäle",
    "Kanäle in Microsoft Teams": "Kanäle",
    "Kanälen in Teams": "Kanälen",
    "Kanäle in Teams": "Kanäle",
    "Kanals in Teams": "Kanals",
    "Kanal in Teams": "Kanal",
    "Ansichten in Teams": "Kanalansichten",
    "Ansicht in Teams": "Kanalansicht",
    "Unterhaltungen in Teams": "Kanalunterhaltungen",
    "Unterhaltung in Teams": "Kanalunterhaltung",
    "Suche in Teams": "Kanalsuche",
    "Apps in Teams": "Kanalapps",
    "Verwaltung von Teams": "Kanalverwaltung",
    "Verbindung zu Teams": "Kanalverbindung",
    "Personalvorschau in Teams": "Kanalvorschau nach Rolle",
    "Vorschau in Teams": "Kanalvorschau",
    "Demo von Teams": "Kanaldemo",
    "Teams-Personalvorschau": "Kanalvorschau nach Rolle",
    "Teams-Administration": "Kanalverwaltung",
    "Microsoft Teams-Verbindung": "Kanalverbindung",
    "Teams-Verbindung": "Kanalverbindung",
    "Microsoft Teams-Kanäle": "Kanäle",
    "Teams-Kanälen": "Kanälen",
    "Teams-Kanäle": "Kanäle",
    "Teams-Kanals": "Kanals",
    "Teams-Kanal": "Kanal",
    "Teams-Ansichten": "Kanalansichten",
    "Teams-Ansicht": "Kanalansicht",
    "Teams-Unterhaltungen": "Kanalunterhaltungen",
    "Teams-Unterhaltung": "Kanalunterhaltung",
    "Teams-Suche": "Kanalsuche",
    "Teams-Apps": "Apps",
    "Teams-Vorschau": "Kanalvorschau",
    "Teams-Demo": "Kanaldemo",
    "In Teams öffnen": "Kanal öffnen",
    "Studio in Teams öffnen": "Studiokanäle öffnen",
    "Meine Teams öffnen": "Meine Kanäle öffnen",
    "Teams durchsuchen": "Kanäle durchsuchen",
    "Teams verwalten": "Kanalgruppen verwalten",
    "Teams aufklappen": "Kanalgruppen aufklappen",
    "Teams zuklappen": "Kanalgruppen zuklappen",
    "Teams wird geöffnet": "Kanäle werden geöffnet",
    "Studio wird in Teams geöffnet": "Die Studiokanäle werden geöffnet",
    "Kreativstudio wird in Teams geöffnet": "Die Studiokanäle werden geöffnet",
    "Kreativ- und Redaktionsstudio wird in Teams geöffnet":
      "Die Studiokanäle werden geöffnet",
    "Unterhaltung in Teams wird geladen": "Kanalunterhaltung wird geladen",
    "in Teams": "in den Kanälen",
    "zu Teams": "zu den Kanälen",
    "In SharePoint öffnen": "Arbeitsbereich öffnen",
    "SharePoint wird geöffnet": "Arbeitsbereich wird geöffnet",
    "SharePoint-Dokumente": "Arbeitsbereichsdokumente",
    "SharePoint-Dateien": "Arbeitsbereichsdateien",
    "SharePoint-Arbeitsbereichen": "Arbeitsbereichen",
    "SharePoint-Arbeitsbereiche": "Arbeitsbereiche",
    "SharePoint-Arbeitsbereichs": "Arbeitsbereichs",
    "SharePoint-Arbeitsbereich": "Arbeitsbereich",
    "in SharePoint": "im Arbeitsbereich",
    "SharePoint enthält gemeinsame Koordinationsverfahren":
      "Der Arbeitsbereich enthält gemeinsame Koordinationsverfahren",
    "Nur für Berechtigte; SharePoint enthält gemeinsame Koordinationsverfahren.":
      "Nur für Berechtigte; der Arbeitsbereich enthält gemeinsame Koordinationsverfahren.",
    "SharePoint metadata implementation":
      "Umsetzung der Metadaten im Arbeitsbereich",
    "mit produktivem Microsoft 365":
      "mit produktiven digitalen Arbeitsplatzplattformen",
    "mit Microsoft 365": "mit digitalen Arbeitsplatzplattformen",
    "von Microsoft 365": "der digitalen Arbeitsplatzplattformen",
    "für Microsoft 365": "für digitale Arbeitsplatzplattformen",
    "in Microsoft 365": "in digitalen Arbeitsplatzplattformen",
  },
} satisfies Record<Language, Record<string, string>>;

const protectedToken = new RegExp(
  [
    /(?:https?:\/\/|mailto:|tel:|www\.)[^\s<>"“”]+/.source,
    /\b(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+(?:com|org|net|io|dev|de|test|local|co\.uk)(?::\d+)?(?:\/[^\s<>"“”]*)?\b/
      .source,
    /[\p{L}\p{N}.!#$%&'*+/=?^_`{|}~-]+@[\p{L}\p{N}](?:[\p{L}\p{N}.-]*[\p{L}\p{N}])?\.[\p{L}]{2,}/u
      .source,
    /(?<![\p{L}\p{N}])(?:[A-Za-z]:[\\/]|\.{0,2}\/)[^\s<>"“”]+/u.source,
  ].join("|"),
  "gu",
);

/** User-facing display copy only; run after translation and before punctuation formatting. */
export function formatPublicTerminology(
  source: string,
  language: Language,
): string {
  if (
    !/\b(?:SharePoint|Microsoft|M365|OneDrive)\b/i.test(source) &&
    !/\b(?:Teams|Team|TEAMS)\b|Abteilungsteams/.test(source)
  )
    return source;
  const protectedValues: string[] = [];
  let text = source.replace(protectedToken, (value) => {
    const index = protectedValues.push(value) - 1;
    return `\uE010${index}\uE011`;
  });
  for (const [phrase, replacement] of Object.entries(
    publicTerminologyAliases[language],
  ).sort(([a], [b]) => b.length - a.length)) {
    text = text.replaceAll(phrase, replacement);
  }
  // Residual brand labels are context-free headings or product nouns, not data keys.
  text = text
    .replace(/\bMicrosoft Teams\b/gi, language === "de" ? "Kanäle" : "Channels")
    .replace(/\bMicrosoft SharePoint\b/gi, "Site")
    .replace(
      /\b(?:Microsoft 365|M365)\b/gi,
      language === "de"
        ? "digitale Arbeitsplatzplattformen"
        : "digital workplace platforms",
    )
    .replace(/\bSharePoint\b/gi, "Site")
    .replace(/\b(?:Teams|TEAMS)\b/g, language === "de" ? "Kanäle" : "Channels")
    .replace(
      /\bOneDrive\b/gi,
      language === "de" ? "persönlicher Speicherbereich" : "personal drive",
    )
    .replace(
      /\bMicrosoft\b/gi,
      language === "de"
        ? "digitale Arbeitsplatzplattformen"
        : "digital workplace platforms",
    );
  return text.replace(
    /\uE010(\d+)\uE011/g,
    (_, index: string) => protectedValues[Number(index)],
  );
}
