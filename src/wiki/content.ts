import type { LibraryDefinition, LibraryDocument } from "../sharepoint/library";

type Copy = readonly [string, string];
export const wikiTranslations: Record<string, string> = {};
function c([english, german]: Copy) {
  wikiTranslations[english] = german;
  return english;
}
export const wikiBase = "/sales-marketing/wiki";
export interface WikiSection {
  heading: string;
  points: string[];
}
export interface WikiArticle {
  id: string;
  areaId: string;
  title: string;
  introduction: string;
  sections: WikiSection[];
  owner: string;
  reviewed: string;
  sourceId: string;
}
export interface WikiArea {
  id: string;
  title: string;
}
export const wikiAreas: WikiArea[] = [
  ["foundations", c(["Foundations", "Grundlagen"])],
  ["messaging", c(["Messaging & Creative", "Botschaften & Kreation"])],
  ["insight", c(["Insight & Performance", "Erkenntnisse & Wirkung"])],
  ["standards", c(["Legal & Standards", "Recht & Standards"])],
  ["learning", c(["Learning", "Lernen"])],
  ["tools", c(["Tools & How-tos", "Werkzeuge & Anleitungen"])],
  ["contacts", c(["Who to Ask", "Ansprechpersonen"])],
  ["a-z", c(["A–Z Directory", "A–Z-Verzeichnis"])],
].map(([id, title]) => ({ id, title }));

const articles: WikiArticle[] = [];
const owners: Record<string, string> = {
  foundations: "Taylor Brooks",
  messaging: "Alex Morgan",
  insight: "Taylor Brooks",
  standards: "Harper Cole",
  learning: "Elena Rossi",
  tools: "Maya Chen",
  contacts: "Maya Chen",
};
function article(
  areaId: string,
  id: string,
  title: Copy,
  introduction: Copy,
  sections: readonly (readonly [Copy, ...Copy[]])[],
) {
  articles.push({
    id,
    areaId,
    title: c(title),
    introduction: c(introduction),
    sections: sections.map(([heading, ...points]) => ({
      heading: c(heading),
      points: points.map(c),
    })),
    owner: owners[areaId],
    reviewed: "2026-10-12",
    sourceId: `WIKI-${id.toUpperCase()}`,
  });
}

article(
  "foundations",
  "brand-vision",
  ["Brand & Vision", "Marke & Vision"],
  [
    "Our shared starting point for consistent, useful customer communication.",
    "Unser gemeinsamer Ausgangspunkt für eine einheitliche und hilfreiche Kundenkommunikation.",
  ],
  [
    [
      ["What we stand for", "Wofür wir stehen"],
      [
        "Make the benefit clear before describing a product or process.",
        "Machen Sie den Nutzen deutlich, bevor Sie ein Produkt oder einen Ablauf beschreiben.",
      ],
      [
        "Use specific evidence and plain language. People should understand what they can expect.",
        "Nutzen Sie konkrete Belege und klare Sprache. Menschen sollen verstehen, was sie erwarten können.",
      ],
    ],
    [
      ["Put it into practice", "In der Praxis"],
      [
        "Start a brief with the audience need, the intended outcome and one central message.",
        "Beginnen Sie ein Briefing mit dem Bedarf der Zielgruppe, dem gewünschten Ergebnis und einer zentralen Botschaft.",
      ],
      [
        "Use the approved identity assets. Creative production and review stay in the Studio workspace.",
        "Verwenden Sie die freigegebenen Gestaltungselemente. Produktion und Abstimmung finden im Arbeitsbereich Studio statt.",
      ],
    ],
  ],
);
article(
  "foundations",
  "strategic-development",
  ["Strategic Development", "Strategische Entwicklung"],
  [
    "Connect marketing choices to an agreed customer need and a measurable outcome.",
    "Verknüpfen Sie Marketingentscheidungen mit einem abgestimmten Kundenbedarf und einem messbaren Ergebnis.",
  ],
  [
    [
      ["Frame the choice", "Die Entscheidung eingrenzen"],
      [
        "State the problem, the audience and the change you want to achieve.",
        "Benennen Sie das Problem, die Zielgruppe und die gewünschte Veränderung.",
      ],
      [
        "Compare a small number of options against evidence, capacity and expected benefit.",
        "Vergleichen Sie wenige Optionen anhand von Belegen, verfügbaren Kapazitäten und erwartetem Nutzen.",
      ],
    ],
    [
      ["Keep knowledge and planning connected", "Wissen mit Planung verbinden"],
      [
        "Record assumptions so the next review can distinguish learning from a change in direction.",
        "Halten Sie Annahmen fest, damit die nächste Auswertung neue Erkenntnisse von einem Richtungswechsel unterscheiden kann.",
      ],
      [
        "Manage current plans and department submissions in Planning.",
        "Aktuelle Pläne und Abteilungsbeiträge werden im Arbeitsbereich Planung verwaltet.",
      ],
    ],
  ],
);
article(
  "foundations",
  "know-audiences",
  ["Know Our Audiences", "Unsere Zielgruppen verstehen"],
  [
    "Use audience knowledge to choose relevant messages, channels and research questions.",
    "Nutzen Sie Zielgruppenwissen für passende Botschaften, Kanäle und Forschungsfragen.",
  ],
  [
    [
      ["Start with a need", "Beim Bedarf beginnen"],
      [
        "Describe the situation and motivation, rather than relying on demographic labels alone.",
        "Beschreiben Sie die Situation und Motivation, statt sich allein auf demografische Merkmale zu verlassen.",
      ],
      [
        "Check when the underlying research was conducted and which groups it included.",
        "Prüfen Sie, wann die zugrunde liegende Untersuchung stattfand und welche Gruppen einbezogen waren.",
      ],
    ],
    [
      ["Use segments responsibly", "Segmente umsichtig nutzen"],
      [
        "Treat a segment as a planning aid, not a prediction about an individual.",
        "Betrachten Sie ein Segment als Planungshilfe, nicht als Vorhersage über eine einzelne Person.",
      ],
      [
        "Take new research questions to Lab; retain the source and its limitations.",
        "Neue Forschungsfragen gehen an Lab. Bewahren Sie die Quelle und ihre Einschränkungen auf.",
      ],
    ],
  ],
);
article(
  "foundations",
  "know-customers",
  ["Know Our Customers", "Unsere Kundinnen und Kunden verstehen"],
  [
    "Understand the continuing relationship, not just the first conversion.",
    "Verstehen Sie die langfristige Beziehung und nicht nur den ersten Abschluss.",
  ],
  [
    [
      ["Look across the relationship", "Die gesamte Beziehung betrachten"],
      [
        "Consider the first contact, onboarding, ongoing service and renewal together.",
        "Betrachten Sie Erstkontakt, Einführung, laufenden Service und Verlängerung im Zusammenhang.",
      ],
      [
        "Use aggregate service themes to find friction without moving individual customer records into the Wiki.",
        "Nutzen Sie übergreifende Servicethemen, um Hürden zu erkennen, ohne individuelle Kundendaten ins Wiki zu übertragen.",
      ],
    ],
    [
      ["Close the feedback loop", "Rückmeldungen wirksam nutzen"],
      [
        "Confirm who owns the next customer response before handing over a question.",
        "Klären Sie vor einer Weitergabe, wer die nächste Kundenantwort übernimmt.",
      ],
      [
        "Relations coordinates continuing service; current relationship records remain in the customer platform.",
        "Das Team für Beziehungen koordiniert den laufenden Service. Aktuelle Beziehungsdaten verbleiben in der Kundenplattform.",
      ],
    ],
  ],
);
article(
  "foundations",
  "channel-landscape",
  ["Channel Landscape", "Kanallandschaft"],
  [
    "Choose channels for their role in the customer journey and the context in which people use them.",
    "Wählen Sie Kanäle nach ihrer Rolle in der Customer Journey und ihrem Nutzungskontext.",
  ],
  [
    [
      ["Match channel and task", "Kanal und Aufgabe abstimmen"],
      [
        "Use conversation for questions that need dialogue and digital journeys for clear self-service tasks.",
        "Nutzen Sie persönliche Gespräche für Fragen, die einen Dialog brauchen, und digitale Wege für klare Selbstbedienungsaufgaben.",
      ],
      [
        "Check accessibility, available support and handover arrangements before launching.",
        "Prüfen Sie vor dem Start Barrierefreiheit, verfügbare Unterstützung und Übergaben.",
      ],
    ],
    [
      ["Plan a connected experience", "Ein zusammenhängendes Erlebnis planen"],
      [
        "Keep the promise consistent when a customer moves between contact, website and service.",
        "Halten Sie das Leistungsversprechen beim Wechsel zwischen Kontakt, Website und Service konsistent.",
      ],
      [
        "Use Acquisitions for deployment planning and the Local Crew Portal for the current daily briefing.",
        "Nutzen Sie Akquise für die Einsatzplanung und das lokale Crew-Portal für das aktuelle Tagesbriefing.",
      ],
    ],
  ],
);

article(
  "messaging",
  "messaging-principles",
  ["Messaging Principles", "Grundsätze für Botschaften"],
  [
    "Build each communication around one useful promise and a clear next step.",
    "Bauen Sie jede Kommunikation auf einem hilfreichen Versprechen und einem klaren nächsten Schritt auf.",
  ],
  [
    [
      ["Lead with relevance", "Mit Relevanz beginnen"],
      [
        "Explain why the message matters to this audience now.",
        "Erklären Sie, warum die Botschaft jetzt für diese Zielgruppe wichtig ist.",
      ],
      [
        "Use one central claim and support it with approved evidence.",
        "Verwenden Sie eine zentrale Aussage und stützen Sie diese auf freigegebene Belege.",
      ],
    ],
    [
      ["Make the next step clear", "Den nächsten Schritt deutlich machen"],
      [
        "Ask for one action at a time and describe what happens after it.",
        "Bitten Sie jeweils um eine Handlung und beschreiben Sie, was danach geschieht.",
      ],
      [
        "Check that the destination fulfils the promise made in the message.",
        "Prüfen Sie, ob das Ziel das Versprechen der Botschaft einlöst.",
      ],
    ],
  ],
);
article(
  "messaging",
  "key-messages",
  ["Key Messages", "Kernbotschaften"],
  [
    "A message framework keeps the same meaning across campaigns and channels.",
    "Ein Botschaftsrahmen bewahrt dieselbe Bedeutung über Kampagnen und Kanäle hinweg.",
  ],
  [
    [
      ["Build the framework", "Den Rahmen aufbauen"],
      [
        "Record the central promise, two supporting points and the evidence for each.",
        "Halten Sie das zentrale Versprechen, zwei unterstützende Aussagen und die jeweiligen Belege fest.",
      ],
      [
        "Separate approved wording from explanatory background.",
        "Trennen Sie freigegebene Formulierungen von erläuternden Hintergrundinformationen.",
      ],
    ],
    [
      ["Use the current version", "Die aktuelle Fassung verwenden"],
      [
        "Check audience, channel, review date and any restrictions before reuse.",
        "Prüfen Sie vor der Wiederverwendung Zielgruppe, Kanal, Prüfdatum und mögliche Einschränkungen.",
      ],
      [
        "Bring proposed changes back to Studio rather than editing a local copy.",
        "Bringen Sie Änderungsvorschläge in Studio ein, statt eine lokale Kopie anzupassen.",
      ],
    ],
  ],
);
article(
  "messaging",
  "taglines",
  ["Taglines & End Lines", "Claims & Schlusszeilen"],
  [
    "Short lines need the same clarity and evidence as longer copy.",
    "Kurze Zeilen brauchen dieselbe Klarheit und Belegbarkeit wie längere Texte.",
  ],
  [
    [
      ["Keep a clear role", "Eine klare Aufgabe festlegen"],
      [
        "Use a tagline to reinforce the brand promise and an end line to close a specific communication.",
        "Nutzen Sie einen Claim zur Stärkung des Markenversprechens und eine Schlusszeile zum Abschluss einer konkreten Kommunikation.",
      ],
      [
        "Avoid adding a second promise that the main message cannot support.",
        "Vermeiden Sie ein zweites Versprechen, das die Hauptbotschaft nicht tragen kann.",
      ],
    ],
    [
      ["Review in context", "Im Zusammenhang prüfen"],
      [
        "Read the line alongside the image, offer, disclosure and next step.",
        "Lesen Sie die Zeile zusammen mit Bild, Angebot, Hinweisen und nächstem Schritt.",
      ],
      [
        "Use approved variations; check meaning again when adapting into another language.",
        "Nutzen Sie freigegebene Varianten und prüfen Sie die Bedeutung bei einer Sprachadaption erneut.",
      ],
    ],
  ],
);
article(
  "messaging",
  "scripts",
  ["Scripts & Talking Points", "Gesprächsleitfäden & Kernargumente"],
  [
    "Help colleagues hold a natural conversation while keeping essential information accurate.",
    "Unterstützen Sie natürliche Gespräche und bewahren Sie zugleich die Genauigkeit wesentlicher Informationen.",
  ],
  [
    [
      ["Structure the conversation", "Das Gespräch strukturieren"],
      [
        "Use a short introduction, an open question, a relevant explanation and a clear close.",
        "Nutzen Sie eine kurze Einleitung, eine offene Frage, eine passende Erläuterung und einen klaren Abschluss.",
      ],
      [
        "Mark the wording that must be used exactly and the points colleagues may explain in their own words.",
        "Kennzeichnen Sie verbindliche Formulierungen sowie Punkte, die in eigenen Worten erklärt werden dürfen.",
      ],
    ],
    [
      ["Prepare for questions", "Auf Fragen vorbereiten"],
      [
        "Keep common questions close to the supporting evidence and the correct referral route.",
        "Halten Sie häufige Fragen, passende Belege und den richtigen Weiterverweisungsweg zusammen.",
      ],
      [
        "Daily conversation priorities appear in the Local Crew Portal; stable guidance stays here.",
        "Tägliche Gesprächsschwerpunkte stehen im lokalen Crew-Portal. Dauerhafte Hinweise bleiben hier.",
      ],
    ],
  ],
);
article(
  "messaging",
  "language-tone",
  ["Language & Tone", "Sprache & Tonalität"],
  [
    "Write with confidence, warmth and respect for the reader's time.",
    "Schreiben Sie souverän, zugewandt und mit Respekt vor der Zeit der Lesenden.",
  ],
  [
    [
      ["Make it easy to understand", "Das Verständnis erleichtern"],
      [
        "Use familiar words, active verbs and one idea per sentence.",
        "Verwenden Sie vertraute Wörter, aktive Verben und einen Gedanken pro Satz.",
      ],
      [
        "Explain unavoidable specialist terms at the point where they first appear.",
        "Erläutern Sie unvermeidbare Fachbegriffe bei ihrer ersten Verwendung.",
      ],
    ],
    [
      ["Respect the audience", "Die Zielgruppe respektieren"],
      [
        "Avoid pressure, stereotypes and promises that depend on hidden conditions.",
        "Vermeiden Sie Druck, Stereotype und Versprechen, die von versteckten Bedingungen abhängen.",
      ],
      [
        "Read the copy aloud and check that it sounds like a helpful person.",
        "Lesen Sie den Text laut und prüfen Sie, ob er wie eine hilfreiche Person klingt.",
      ],
    ],
  ],
);
article(
  "messaging",
  "channel-adaptation",
  ["Channel Adaptation", "Kanalspezifische Adaption"],
  [
    "Adapt the expression while preserving the approved meaning.",
    "Passen Sie die Ausdrucksform an und bewahren Sie dabei die freigegebene Bedeutung.",
  ],
  [
    [
      ["Adapt to the context", "An den Kontext anpassen"],
      [
        "Account for screen size, reading time, sound and the surrounding content.",
        "Berücksichtigen Sie Bildschirmgröße, Lesezeit, Ton und umgebende Inhalte.",
      ],
      [
        "Keep the central promise and essential conditions together.",
        "Halten Sie das zentrale Versprechen und wesentliche Bedingungen zusammen.",
      ],
    ],
    [
      ["Test the complete journey", "Den gesamten Weg testen"],
      [
        "Review the message and its destination together, including error and confirmation states.",
        "Prüfen Sie die Botschaft und ihr Ziel gemeinsam, einschließlich Fehler- und Bestätigungszuständen.",
      ],
      [
        "Check captions, text alternatives and keyboard access before publication.",
        "Prüfen Sie vor der Veröffentlichung Untertitel, Textalternativen und Tastaturbedienbarkeit.",
      ],
    ],
  ],
);
article(
  "messaging",
  "creative-review",
  ["Creative Review", "Kreativabstimmung"],
  [
    "Review the work against the brief, with a clear owner for the final decision.",
    "Prüfen Sie die Arbeit anhand des Briefings und mit einer klar zuständigen Person für die Freigabe.",
  ],
  [
    [
      ["Give useful feedback", "Hilfreiches Feedback geben"],
      [
        "Point to the audience need, message or requirement affected by your comment.",
        "Benennen Sie den Zielgruppenbedarf, die Botschaft oder die Anforderung, auf die sich Ihr Kommentar bezieht.",
      ],
      [
        "Separate required corrections from suggestions and personal preferences.",
        "Trennen Sie notwendige Korrekturen von Vorschlägen und persönlichen Vorlieben.",
      ],
    ],
    [
      ["Keep one review record", "Eine gemeinsame Abstimmung führen"],
      [
        "Review the current version in the agreed production workflow.",
        "Prüfen Sie die aktuelle Fassung im vereinbarten Produktionsablauf.",
      ],
      [
        "Studio holds working assets and approvals; this page explains the method.",
        "Studio verwaltet Arbeitsdateien und Freigaben. Diese Seite erläutert das Vorgehen.",
      ],
    ],
  ],
);

article(
  "messaging",
  "working-with-creative-studio",
  ["Working with the Studio", "Zusammenarbeit mit dem Studio"],
  [
    "Bring topic expertise and channel craft together, from a clear brief to a release people can use.",
    "Fachwissen und Kanalexpertise verbinden – von einem klaren Briefing bis zur Veröffentlichung.",
  ],
  [
    [
      ["What the Studio does", "Die Aufgaben des Studios"],
      [
        "The Studio brings messaging, design, digital production and channel desks together around a shared piece of work.",
        "Im Studio arbeiten Redaktion, Gestaltung, digitale Produktion und Kanalteams gemeinsam an Inhalten.",
      ],
      [
        "Topic specialists contribute evidence, context and factual checks. Channel desks adapt the work for the places it will appear.",
        "Fachverantwortliche liefern Belege und Hintergrundwissen und prüfen die Fakten. Kanalteams bereiten die Inhalte für den jeweiligen Veröffentlichungsort auf.",
      ],
    ],
    [
      ["From brief to release", "Vom Briefing zur Veröffentlichung"],
      [
        "Start with the audience need, intended outcome, main message, formats and delivery date. Agree a production lead before work begins.",
        "Zielgruppenbedarf, gewünschtes Ergebnis, Kernbotschaft, Formate und Liefertermin im Briefing festhalten. Vor dem Start die Produktionsleitung festlegen.",
      ],
      [
        "The lead coordinates the creative or channel desk, gathers specialist feedback and keeps review decisions with the current version.",
        "Die Produktionsleitung stimmt die Arbeit mit Kreativ- und Kanalteams ab, bündelt fachliches Feedback und dokumentiert Prüfentscheidungen bei der aktuellen Fassung.",
      ],
    ],
    [
      ["Working files and conversation", "Arbeitsdateien und Abstimmung"],
      [
        "Keep shared drafts, review files and release records in the Studio workspace, with one current link for each working file.",
        "Gemeinsame Entwürfe, Abstimmungsdateien und Freigaben im Arbeitsbereich Studio ablegen. Jede Arbeitsdatei hat einen gemeinsamen Link zur aktuellen Fassung.",
      ],
      [
        "Use the relevant Teams channel for questions, coordination and quick feedback. Link to the workspace file rather than uploading another copy.",
        "Fragen, Abstimmungen und kurze Rückmeldungen gehören in den passenden Teams-Kanal. Dort die Arbeitsdatei verlinken, statt eine weitere Kopie hochzuladen.",
      ],
    ],
    [
      ["Review, handoff and help", "Prüfung, Übergabe und Unterstützung"],
      [
        "Agree who checks facts, accessibility and the final release. Hand over the approved version, destination and any usage limits together.",
        "Festlegen, wer Fakten und Barrierefreiheit prüft und die endgültige Freigabe erteilt. Die freigegebene Fassung zusammen mit Zielkanal und möglichen Nutzungsbeschränkungen übergeben.",
      ],
      [
        "Ask Alex Morgan, the Studio focal point, to connect a new brief with the right topic specialist or channel desk.",
        "Alex Morgan ist die Ansprechperson des Studios und bringt ein neues Briefing mit den passenden Fachverantwortlichen oder Kanalteams zusammen.",
      ],
    ],
  ],
);

article(
  "insight",
  "reporting-overview",
  ["Reporting Overview", "Berichte im Überblick"],
  [
    "Read performance in relation to the decision a report is intended to support.",
    "Lesen Sie Ergebnisse im Zusammenhang mit der Entscheidung, die ein Bericht unterstützen soll.",
  ],
  [
    [
      ["Read the context first", "Zuerst den Kontext prüfen"],
      [
        "Check reporting period, data refresh time, coverage and comparison basis.",
        "Prüfen Sie Berichtszeitraum, Aktualisierungsstand, Abdeckung und Vergleichsbasis.",
      ],
      [
        "Distinguish a target, a forecast and an observed result.",
        "Unterscheiden Sie Zielwert, Prognose und beobachtetes Ergebnis.",
      ],
    ],
    [
      ["Turn findings into a question", "Aus Ergebnissen eine Frage ableiten"],
      [
        "Identify what changed, whether the difference is meaningful and what to investigate next.",
        "Klären Sie, was sich verändert hat, ob der Unterschied bedeutsam ist und was als Nächstes untersucht werden sollte.",
      ],
      [
        "Current reporting and analysis remain in Lab and approved dashboards.",
        "Aktuelle Berichte und Analysen verbleiben in Lab und den freigegebenen Dashboards.",
      ],
    ],
  ],
);
article(
  "insight",
  "audience-segments",
  ["Audience Segments", "Zielgruppensegmente"],
  [
    "Segments help compare shared needs without treating people as identical.",
    "Segmente helfen, gemeinsame Bedürfnisse zu vergleichen, ohne Menschen gleichzusetzen.",
  ],
  [
    [
      ["Understand the definition", "Die Definition verstehen"],
      [
        "Check the population, grouping method and date of the segment model.",
        "Prüfen Sie Grundgesamtheit, Gruppierungsmethode und Datum des Segmentmodells.",
      ],
      [
        "Use the same segment definition when comparing campaigns or periods.",
        "Verwenden Sie beim Vergleich von Kampagnen oder Zeiträumen dieselbe Segmentdefinition.",
      ],
    ],
    [
      ["Apply with care", "Mit Bedacht anwenden"],
      [
        "Describe likely needs and barriers, and test whether the evidence applies to the task.",
        "Beschreiben Sie wahrscheinliche Bedürfnisse und Hürden und prüfen Sie, ob die Belege zur Aufgabe passen.",
      ],
      [
        "Ask Lab before changing a definition or combining small groups.",
        "Stimmen Sie Änderungen einer Definition oder die Zusammenfassung kleiner Gruppen mit Lab ab.",
      ],
    ],
  ],
);
article(
  "insight",
  "competitor-landscape",
  ["Competitor Landscape", "Wettbewerbsumfeld"],
  [
    "Compare customer choices using dated, attributable observations.",
    "Vergleichen Sie Kundenoptionen anhand datierter und nachvollziehbarer Beobachtungen.",
  ],
  [
    [
      ["Compare like with like", "Vergleichbares vergleichen"],
      [
        "Record the offer, audience, channel and date for each observation.",
        "Halten Sie Angebot, Zielgruppe, Kanal und Datum jeder Beobachtung fest.",
      ],
      [
        "Separate observed facts from interpretation and untested assumptions.",
        "Trennen Sie beobachtete Fakten von Deutungen und ungeprüften Annahmen.",
      ],
    ],
    [
      ["Keep the comparison useful", "Den Vergleich nützlich halten"],
      [
        "Focus on the decision at hand rather than collecting every possible example.",
        "Konzentrieren Sie sich auf die anstehende Entscheidung, statt jedes denkbare Beispiel zu sammeln.",
      ],
      [
        "Commission or update competitor research through Lab.",
        "Beauftragen oder aktualisieren Sie Wettbewerbsrecherchen über Lab.",
      ],
    ],
  ],
);
article(
  "insight",
  "conversion-metrics",
  ["Conversion Metrics", "Conversion-Kennzahlen"],
  [
    "A conversion rate is only meaningful when its event and denominator are clear.",
    "Eine Conversion-Rate ist nur aussagekräftig, wenn Ereignis und Bezugsgröße klar sind.",
  ],
  [
    [
      ["Define the measure", "Die Kennzahl definieren"],
      [
        "Name the qualifying action, eligible population and time window.",
        "Benennen Sie die relevante Handlung, die einbezogene Grundgesamtheit und den Zeitraum.",
      ],
      [
        "Keep gross, validated and retained outcomes separate.",
        "Halten Sie Bruttoergebnisse, bestätigte Ergebnisse und dauerhaft bestehende Ergebnisse auseinander.",
      ],
    ],
    [
      ["Interpret the movement", "Veränderungen einordnen"],
      [
        "Check volume, mix and data quality before attributing a change to creative work.",
        "Prüfen Sie Volumen, Zusammensetzung und Datenqualität, bevor Sie eine Veränderung auf kreative Arbeit zurückführen.",
      ],
      [
        "Use the approved metric definition in dashboards and campaign evaluations.",
        "Verwenden Sie in Dashboards und Kampagnenauswertungen die freigegebene Kennzahlendefinition.",
      ],
    ],
  ],
);
article(
  "insight",
  "digital-analytics",
  ["Digital Analytics", "Digitale Analyse"],
  [
    "Use digital measures to understand journeys and friction, alongside customer evidence.",
    "Nutzen Sie digitale Kennzahlen zusammen mit Kundenerkenntnissen, um Nutzungswege und Hürden zu verstehen.",
  ],
  [
    [
      ["Check measurement coverage", "Die Messabdeckung prüfen"],
      [
        "Confirm which events are measured and whether consent or technical changes affect coverage.",
        "Klären Sie, welche Ereignisse erfasst werden und ob Einwilligungen oder technische Änderungen die Abdeckung beeinflussen.",
      ],
      [
        "Treat a missing event as a measurement question before treating it as customer behaviour.",
        "Prüfen Sie bei einem fehlenden Ereignis zunächst die Messung, bevor Sie daraus Kundenverhalten ableiten.",
      ],
    ],
    [
      ["Use a focused question", "Eine gezielte Frage nutzen"],
      [
        "Compare a defined journey step and period, then inspect the size and consistency of the difference.",
        "Vergleichen Sie einen definierten Schritt und Zeitraum und prüfen Sie anschließend Größe und Beständigkeit des Unterschieds.",
      ],
      [
        "Dev. manages tracking implementation; Lab manages interpretation.",
        "Dev. betreut die technische Messung. Lab verantwortet die Auswertung.",
      ],
    ],
  ],
);
article(
  "insight",
  "campaign-evaluation",
  ["Campaign Evaluation", "Kampagnenauswertung"],
  [
    "Evaluate the outcome against the original objective and the evidence available.",
    "Bewerten Sie das Ergebnis anhand des ursprünglichen Ziels und der verfügbaren Belege.",
  ],
  [
    [
      ["Start with the agreed question", "Mit der vereinbarten Frage beginnen"],
      [
        "Restate the objective, target audience and measurement plan before looking at results.",
        "Benennen Sie Ziel, Zielgruppe und Messplan erneut, bevor Sie die Ergebnisse betrachten.",
      ],
      [
        "Include cost, customer quality and operational effects, not only response volume.",
        "Beziehen Sie neben dem Rücklauf auch Kosten, Kundenqualität und betriebliche Auswirkungen ein.",
      ],
    ],
    [
      ["Make learning reusable", "Erkenntnisse wiederverwendbar machen"],
      [
        "Record what to keep, what to change and what remains uncertain.",
        "Halten Sie fest, was beibehalten und verändert werden sollte und was unklar bleibt.",
      ],
      [
        "Keep the live evaluation in Lab and link to its approved conclusion.",
        "Führen Sie die laufende Auswertung in Lab und verlinken Sie ihr freigegebenes Fazit.",
      ],
    ],
  ],
);
article(
  "insight",
  "research-basics",
  ["Research Basics", "Grundlagen der Forschung"],
  [
    "Choose a method that can answer the question, then describe its limits openly.",
    "Wählen Sie eine Methode, die die Frage beantworten kann, und benennen Sie ihre Grenzen offen.",
  ],
  [
    [
      ["Prepare a useful brief", "Ein hilfreiches Briefing vorbereiten"],
      [
        "State the decision, the unknown, the audience and the deadline.",
        "Benennen Sie Entscheidung, Wissenslücke, Zielgruppe und Termin.",
      ],
      [
        "Check existing evidence before commissioning new work.",
        "Prüfen Sie vorhandene Erkenntnisse, bevor Sie eine neue Untersuchung beauftragen.",
      ],
    ],
    [
      ["Protect the quality of the answer", "Die Aussagequalität sichern"],
      [
        "Avoid leading questions and document recruitment, sample and analysis choices.",
        "Vermeiden Sie suggestive Fragen und dokumentieren Sie Rekrutierung, Stichprobe und Auswertungsmethode.",
      ],
      [
        "Ask Lab to review the method before participant contact.",
        "Lassen Sie die Methode vor der Kontaktaufnahme mit Teilnehmenden durch Lab prüfen.",
      ],
    ],
  ],
);

article(
  "standards",
  "consent",
  ["Consent & Preferences", "Einwilligungen & Präferenzen"],
  [
    "Use the approved contact-permission process for the activity and channel.",
    "Nutzen Sie das freigegebene Verfahren für Kontaktberechtigungen der jeweiligen Aktivität und des jeweiligen Kanals.",
  ],
  [
    [
      ["Before contact", "Vor der Kontaktaufnahme"],
      [
        "Check the current permission and suppression status in the authorised customer system.",
        "Prüfen Sie die aktuelle Kontaktberechtigung und mögliche Kontaktsperren im autorisierten Kundensystem.",
      ],
      [
        "Do not infer permission from an old list, a previous conversation or a local export.",
        "Leiten Sie keine Berechtigung aus einer alten Liste, einem früheren Gespräch oder einem lokalen Export ab.",
      ],
    ],
    [
      ["When a preference changes", "Bei geänderten Präferenzen"],
      [
        "Follow the approved capture route so the customer record and downstream use stay aligned.",
        "Nutzen Sie den freigegebenen Erfassungsweg, damit Kundenstammsatz und nachgelagerte Nutzung übereinstimmen.",
      ],
      [
        "Refer uncertainty to Legal/privacy and Relations before proceeding.",
        "Klären Sie Unsicherheiten vor dem Fortfahren mit Recht/Datenschutz und dem Team für Beziehungen.",
      ],
    ],
  ],
);
article(
  "standards",
  "copyright",
  ["Copyright & Usage Rights", "Urheberrecht & Nutzungsrechte"],
  [
    "Confirm the permitted use of an asset before it enters a campaign.",
    "Klären Sie die zulässige Verwendung eines Gestaltungselements, bevor es in eine Kampagne eingeht.",
  ],
  [
    [
      ["Check the rights record", "Den Rechtenachweis prüfen"],
      [
        "Check channel, territory, duration, adaptation rights and any credit requirement.",
        "Prüfen Sie Kanal, Gebiet, Dauer, Bearbeitungsrechte und mögliche Urheberhinweise.",
      ],
      [
        "Keep the rights reference with the approved asset; a downloaded file is not evidence of permission.",
        "Bewahren Sie den Rechtenachweis beim freigegebenen Asset auf. Eine heruntergeladene Datei belegt keine Erlaubnis.",
      ],
    ],
    [
      ["If use changes", "Bei geänderter Verwendung"],
      [
        "Ask Studio to confirm whether the existing approval covers the proposed use.",
        "Lassen Sie durch Studio prüfen, ob die bestehende Freigabe die geplante Nutzung abdeckt.",
      ],
      [
        "Legal handles interpretation and clearance questions; do not copy licence records into this Wiki.",
        "Recht klärt Auslegungs- und Freigabefragen. Kopieren Sie keine Lizenzakten in dieses Wiki.",
      ],
    ],
  ],
);
article(
  "standards",
  "fraud-prevention",
  ["Fraud Prevention", "Betrugsprävention"],
  [
    "Recognise an unusual request and use the established verification route.",
    "Erkennen Sie ungewöhnliche Anfragen und nutzen Sie den festgelegten Prüfweg.",
  ],
  [
    [
      ["Pause and verify", "Innehalten und prüfen"],
      [
        "Treat unexpected account changes, urgent payment instructions and requests for credentials as verification triggers.",
        "Prüfen Sie unerwartete Kontoänderungen, dringende Zahlungsanweisungen und Zugangsdatenanfragen besonders sorgfältig.",
      ],
      [
        "Verify through a known contact route rather than contact details supplied in the request.",
        "Prüfen Sie über einen bekannten Kontaktweg und nicht über Kontaktdaten aus der Anfrage.",
      ],
    ],
    [
      ["Use the right response", "Den richtigen Meldeweg nutzen"],
      [
        "Refer suspicious customer activity through the approved Relations process.",
        "Melden Sie verdächtige Kundenaktivitäten über das freigegebene Verfahren im Arbeitsbereich Beziehungen.",
      ],
      [
        "Use IT support for suspected account or device compromise; keep sensitive details out of shared channels.",
        "Wenden Sie sich bei Verdacht auf kompromittierte Konten oder Geräte an den IT-Support. Teilen Sie sensible Details nicht in offenen Kanälen.",
      ],
    ],
  ],
);
article(
  "standards",
  "data-privacy",
  ["Data Privacy", "Datenschutz"],
  [
    "Use only the information needed for an approved purpose and keep it in its authorised system.",
    "Nutzen Sie nur die für einen freigegebenen Zweck nötigen Informationen und belassen Sie diese im autorisierten System.",
  ],
  [
    [
      ["Plan the information flow", "Den Informationsfluss planen"],
      [
        "Identify the data, purpose, recipients and intended retention before collection.",
        "Klären Sie vor der Erhebung Daten, Zweck, Empfänger und vorgesehene Aufbewahrung.",
      ],
      [
        "Use aggregate examples in shared briefs and learning material wherever possible.",
        "Nutzen Sie in gemeinsamen Briefings und Lernunterlagen möglichst zusammengefasste Beispiele.",
      ],
    ],
    [
      ["Ask before changing the use", "Eine Zweckänderung vorher klären"],
      [
        "Bring new collection methods, sharing arrangements and reuse proposals to the privacy contact.",
        "Stimmen Sie neue Erhebungsverfahren, Weitergaben und Wiederverwendungen mit der Datenschutz-Ansprechperson ab.",
      ],
      [
        "This reference describes the internal route; current approved policy and Legal advice remain authoritative.",
        "Diese Übersicht beschreibt den internen Weg. Maßgeblich bleiben die aktuelle freigegebene Richtlinie und die Beratung durch Recht.",
      ],
    ],
  ],
);
article(
  "standards",
  "claims",
  ["Claims & Disclosures", "Werbeaussagen & Pflichtinformationen"],
  [
    "A customer should be able to understand the offer and its conditions together.",
    "Kundinnen und Kunden sollen Angebot und Bedingungen im Zusammenhang verstehen können.",
  ],
  [
    [
      ["Support the claim", "Die Aussage belegen"],
      [
        "Link each material claim to current evidence and the approved wording.",
        "Verknüpfen Sie jede wesentliche Aussage mit aktuellen Belegen und der freigegebenen Formulierung.",
      ],
      [
        "Avoid qualifications that contradict the main impression of the message.",
        "Vermeiden Sie Einschränkungen, die dem Gesamteindruck der Botschaft widersprechen.",
      ],
    ],
    [
      ["Check the final presentation", "Die Endfassung prüfen"],
      [
        "Review the disclosure at the size and in the channel where customers will encounter it.",
        "Prüfen Sie Hinweise in der Größe und im Kanal, in denen Kundinnen und Kunden sie sehen werden.",
      ],
      [
        "Route new or changed claims through Studio and Legal before publication.",
        "Lassen Sie neue oder geänderte Aussagen vor Veröffentlichung durch Studio und Recht prüfen.",
      ],
    ],
  ],
);
article(
  "standards",
  "customer-terms",
  ["Customer-facing Terms", "Kundenbedingungen"],
  [
    "Point customers to the current approved terms for the relevant proposition.",
    "Verweisen Sie auf die aktuellen freigegebenen Bedingungen des jeweiligen Angebots.",
  ],
  [
    [
      ["Use the approved reference", "Die freigegebene Quelle nutzen"],
      [
        "Check the proposition, effective date and customer audience before selecting a terms link.",
        "Prüfen Sie Angebot, Gültigkeitsdatum und Kundengruppe, bevor Sie die Bedingungen verlinken.",
      ],
      [
        "Do not retype or shorten contractual wording inside a campaign asset.",
        "Übertragen oder kürzen Sie vertragliche Formulierungen nicht eigenständig in Kampagnenmaterialien.",
      ],
    ],
    [
      ["Handle a question", "Eine Frage bearbeiten"],
      [
        "Refer interpretation to Legal and individual relationship questions to Relations.",
        "Fragen zur Auslegung gehen an Recht, individuelle Beziehungsfragen an das Team für Beziehungen.",
      ],
      [
        "Keep the customer's question in the approved service record rather than in Wiki comments.",
        "Halten Sie die Kundenfrage im freigegebenen Servicevorgang fest und nicht in Wiki-Kommentaren.",
      ],
    ],
  ],
);

article(
  "learning",
  "new-starter",
  ["I'm New to Sales & Marketing", "Neu in Vertrieb & Marketing"],
  [
    "A practical starting point for finding people, shared knowledge and current work.",
    "Ein praktischer Einstieg, um Ansprechpersonen, gemeinsames Wissen und aktuelle Arbeit zu finden.",
  ],
  [
    [
      ["Your first steps", "Die ersten Schritte"],
      [
        "Read Brand & Vision and Channel Landscape, then agree your initial responsibilities with your manager.",
        "Lesen Sie Marke & Vision und Kanallandschaft. Stimmen Sie anschließend Ihre ersten Aufgaben mit Ihrer Führungskraft ab.",
      ],
      [
        "Use Who to Ask to find the right role when ownership is unclear.",
        "Nutzen Sie Ansprechpersonen, wenn die Zuständigkeit unklar ist.",
      ],
    ],
    [
      ["Find the right environment", "Die passende Umgebung finden"],
      [
        "Use this Wiki for stable guidance and your workspace for shared delivery work.",
        "Nutzen Sie dieses Wiki für dauerhaftes Wissen und Ihren Arbeitsbereich für die gemeinsame Umsetzung.",
      ],
      [
        "Teams shows the channels relevant to your role; access to protected work is granted separately.",
        "Teams zeigt die für Ihre Rolle relevanten Kanäle. Geschützte Arbeit wird separat berechtigt.",
      ],
    ],
  ],
);
article(
  "learning",
  "frontline-training",
  ["Frontline Sales Training", "Training für den direkten Vertrieb"],
  [
    "Prepare for clear customer conversations and reliable handovers.",
    "Bereiten Sie klare Kundengespräche und verlässliche Übergaben vor.",
  ],
  [
    [
      ["Practise the essentials", "Die Grundlagen üben"],
      [
        "Work through the introduction, needs question, explanation and close with a coach.",
        "Üben Sie Einleitung, Bedarfsfrage, Erläuterung und Abschluss mit einem Coach.",
      ],
      [
        "Practise how to pause, acknowledge uncertainty and refer a question.",
        "Üben Sie, innezuhalten, Unsicherheit anzusprechen und eine Frage weiterzugeben.",
      ],
    ],
    [
      ["Before each shift", "Vor jedem Einsatz"],
      [
        "Read the current briefing in the Local Crew Portal and confirm coverage with your team lead.",
        "Lesen Sie das aktuelle Briefing im lokalen Crew-Portal und bestätigen Sie die Einsatzplanung mit Ihrer Teamleitung.",
      ],
      [
        "Use the approved customer tool for activity records; keep personal notes out of shared training files.",
        "Erfassen Sie Aktivitäten im freigegebenen Kundensystem. Persönliche Notizen gehören nicht in gemeinsame Trainingsdateien.",
      ],
    ],
  ],
);
article(
  "learning",
  "marketing-101",
  ["Marketing 101", "Marketing-Grundlagen"],
  [
    "Connect an audience need, a proposition and a route to action.",
    "Verbinden Sie einen Zielgruppenbedarf, ein Angebot und einen Weg zur Handlung.",
  ],
  [
    [
      ["Start with the audience", "Bei der Zielgruppe beginnen"],
      [
        "Describe the need and the barrier before choosing a channel or asset.",
        "Beschreiben Sie Bedarf und Hürde, bevor Sie einen Kanal oder ein Format wählen.",
      ],
      [
        "Define the benefit, supporting evidence and intended next step.",
        "Definieren Sie Nutzen, Belege und den gewünschten nächsten Schritt.",
      ],
    ],
    [
      ["Learn from the outcome", "Aus dem Ergebnis lernen"],
      [
        "Agree success measures before launch and include the customer experience after response.",
        "Vereinbaren Sie Erfolgskriterien vor dem Start und berücksichtigen Sie das Kundenerlebnis nach der Reaktion.",
      ],
      [
        "Use Campaign Evaluation to separate a result from an explanation of that result.",
        "Nutzen Sie Kampagnenauswertung, um ein Ergebnis von seiner Erklärung zu unterscheiden.",
      ],
    ],
  ],
);
article(
  "learning",
  "research-methods",
  [
    "Understanding Qualitative & Quantitative Methods",
    "Qualitative & quantitative Methoden verstehen",
  ],
  [
    "Different methods answer different kinds of questions.",
    "Unterschiedliche Methoden beantworten unterschiedliche Arten von Fragen.",
  ],
  [
    [
      ["Choose the question first", "Zuerst die Frage klären"],
      [
        "Qualitative work explores experience and meaning; quantitative work measures defined patterns.",
        "Qualitative Forschung untersucht Erfahrungen und Bedeutungen. Quantitative Forschung misst definierte Muster.",
      ],
      [
        "Neither method removes the need to understand sampling, context and uncertainty.",
        "Bei beiden Methoden müssen Stichprobe, Kontext und Unsicherheit verstanden werden.",
      ],
    ],
    [
      ["Combine evidence carefully", "Belege sorgfältig verbinden"],
      [
        "Use interviews to explore a possible explanation and an appropriate measurement design to test its scale.",
        "Nutzen Sie Interviews zur Erkundung möglicher Erklärungen und ein geeignetes Messdesign zur Prüfung ihrer Verbreitung.",
      ],
      [
        "Ask Lab for a method review before recruiting participants.",
        "Bitten Sie Lab vor der Rekrutierung von Teilnehmenden um eine Methodenprüfung.",
      ],
    ],
  ],
);
article(
  "learning",
  "channel-basics",
  ["Channel Basics", "Grundlagen der Kanäle"],
  [
    "A channel works best when its task and handover are clear.",
    "Ein Kanal funktioniert am besten mit einer klaren Aufgabe und Übergabe.",
  ],
  [
    [
      ["Understand the setting", "Den Nutzungskontext verstehen"],
      [
        "Consider attention, available time, device and whether the interaction is live.",
        "Berücksichtigen Sie Aufmerksamkeit, verfügbare Zeit, Gerät und die Frage, ob die Interaktion live stattfindet.",
      ],
      [
        "Match the amount of information and the action to that setting.",
        "Passen Sie Informationsmenge und Handlung an diesen Kontext an.",
      ],
    ],
    [
      ["Connect to the next step", "Den nächsten Schritt anschließen"],
      [
        "Confirm where the customer goes next and who can help if the journey fails.",
        "Klären Sie den nächsten Kundenweg und die Unterstützung bei Problemen.",
      ],
      [
        "Use Channel Adaptation when translating a central message into a specific format.",
        "Nutzen Sie Kanalspezifische Adaption, um eine zentrale Botschaft in ein konkretes Format zu übertragen.",
      ],
    ],
  ],
);
article(
  "learning",
  "customer-journeys",
  ["Understanding Customer Journeys", "Customer Journeys verstehen"],
  [
    "Map the experience from the customer's point of view across teams and channels.",
    "Betrachten Sie das Erlebnis aus Kundensicht über Teams und Kanäle hinweg.",
  ],
  [
    [
      ["Map what happens", "Den Ablauf erfassen"],
      [
        "Record the customer's task, question, touchpoint and likely barrier at each step.",
        "Halten Sie für jeden Schritt Aufgabe, Frage, Kontaktpunkt und mögliche Hürde fest.",
      ],
      [
        "Distinguish observed experience from the process the organisation intended.",
        "Unterscheiden Sie beobachtete Erfahrungen vom vorgesehenen Organisationsablauf.",
      ],
    ],
    [
      ["Choose an improvement", "Eine Verbesserung auswählen"],
      [
        "Prioritise a specific point of friction and name the team responsible for the handover.",
        "Priorisieren Sie eine konkrete Hürde und benennen Sie das für die Übergabe zuständige Team.",
      ],
      [
        "Check the proposed change with Relations and Lab before broader rollout.",
        "Prüfen Sie die geplante Änderung vor einer breiteren Einführung mit den Teams für Beziehungen und Lab.",
      ],
    ],
  ],
);

article(
  "tools",
  "customer-platform",
  ["Using the Customer Platform", "Die Kundenplattform nutzen"],
  [
    "Use the customer platform for current relationship information and approved activity records.",
    "Nutzen Sie die Kundenplattform für aktuelle Beziehungsinformationen und freigegebene Aktivitätsnachweise.",
  ],
  [
    [
      ["Find the right record", "Den richtigen Datensatz finden"],
      [
        "Use the approved lookup and check identifiers before making a change.",
        "Nutzen Sie die freigegebene Suche und prüfen Sie die Kennungen vor einer Änderung.",
      ],
      [
        "Check contact preferences and the current service context before an outbound action.",
        "Prüfen Sie vor einer ausgehenden Kontaktaufnahme Kontaktpräferenzen und aktuellen Servicekontext.",
      ],
    ],
    [
      ["Record a useful outcome", "Ein hilfreiches Ergebnis erfassen"],
      [
        "Use the agreed activity type and a factual, relevant summary.",
        "Nutzen Sie den vereinbarten Aktivitätstyp und eine sachliche, relevante Zusammenfassung.",
      ],
      [
        "Send platform faults to Dev. Ask Relations about record-handling questions.",
        "Melden Sie Plattformfehler an Dev. Fragen zur Datensatzbearbeitung gehen an das Team für Beziehungen.",
      ],
    ],
  ],
);
article(
  "tools",
  "campaign-setup",
  ["Setting Up a Campaign", "Eine Kampagne einrichten"],
  [
    "Bring the brief, measurement and operational handover together before launch.",
    "Führen Sie Briefing, Messung und operative Übergabe vor dem Start zusammen.",
  ],
  [
    [
      ["Prepare the brief", "Das Briefing vorbereiten"],
      [
        "Agree the audience, proposition, dates, owner and success measure.",
        "Vereinbaren Sie Zielgruppe, Angebot, Zeitraum, Verantwortlichkeit und Erfolgskriterium.",
      ],
      [
        "Confirm creative review, contact permissions and customer support arrangements.",
        "Klären Sie Kreativabstimmung, Kontaktberechtigungen und Kundenunterstützung.",
      ],
    ],
    [
      ["Launch through the working process", "Über den Arbeitsprozess starten"],
      [
        "Use Acquisitions for current deployment and coverage planning.",
        "Nutzen Sie Akquise für die aktuelle Einsatz- und Kapazitätsplanung.",
      ],
      [
        "Link to approved assets and the reporting definition rather than making new copies.",
        "Verlinken Sie freigegebene Materialien und die Berichtsdefinition, statt neue Kopien anzulegen.",
      ],
    ],
  ],
);
article(
  "tools",
  "planning-content",
  ["Planning Content", "Inhalte planen"],
  [
    "Turn a communication need into an actionable editorial brief.",
    "Übersetzen Sie einen Kommunikationsbedarf in ein umsetzbares redaktionelles Briefing.",
  ],
  [
    [
      ["Set a clear brief", "Ein klares Briefing erstellen"],
      [
        "Name the audience, central message, channel, required action and delivery date.",
        "Benennen Sie Zielgruppe, Kernbotschaft, Kanal, gewünschte Handlung und Liefertermin.",
      ],
      [
        "Include evidence, accessibility requirements and a named approver.",
        "Ergänzen Sie Belege, Anforderungen an die Barrierefreiheit und eine zuständige Freigabeperson.",
      ],
    ],
    [
      ["Coordinate delivery", "Die Umsetzung koordinieren"],
      [
        "Track commissioning, review and publication in Studio.",
        "Steuern Sie Beauftragung, Abstimmung und Veröffentlichung in Studio.",
      ],
      [
        "Keep one link to the current asset and record decisions in the production workflow.",
        "Behalten Sie einen Link zum aktuellen Material und dokumentieren Sie Entscheidungen im Produktionsablauf.",
      ],
    ],
  ],
);
article(
  "tools",
  "performance-dashboard",
  ["Reading the Performance Dashboard", "Das Performance-Dashboard lesen"],
  [
    "Use a consistent reading sequence before drawing a conclusion.",
    "Nutzen Sie eine einheitliche Lesereihenfolge, bevor Sie ein Fazit ziehen.",
  ],
  [
    [
      ["Check scope and freshness", "Umfang und Aktualität prüfen"],
      [
        "Confirm the reporting period, filters, refresh time and metric definition.",
        "Prüfen Sie Berichtszeitraum, Filter, Aktualisierungszeit und Kennzahlendefinition.",
      ],
      [
        "Compare with an appropriate baseline rather than an arbitrary previous date.",
        "Vergleichen Sie mit einer geeigneten Ausgangsbasis statt mit einem beliebigen früheren Datum.",
      ],
    ],
    [
      ["Follow the evidence", "Den Belegen folgen"],
      [
        "Look for volume changes, missing data and differences in audience or channel mix.",
        "Achten Sie auf Volumenänderungen, fehlende Daten und Unterschiede im Zielgruppen- oder Kanalmix.",
      ],
      [
        "Take unexplained movement to Lab with the same filters and reporting period.",
        "Bringen Sie unerklärte Veränderungen mit denselben Filtern und demselben Zeitraum zu Lab.",
      ],
    ],
  ],
);
article(
  "tools",
  "simple-survey",
  ["Running a Simple Survey", "Eine einfache Befragung durchführen"],
  [
    "Keep a small survey focused on a decision that the answers can support.",
    "Richten Sie eine kleine Befragung auf eine Entscheidung aus, die sich mit den Antworten unterstützen lässt.",
  ],
  [
    [
      ["Design before sending", "Vor dem Versand planen"],
      [
        "Define the audience and decision, then ask only the questions needed.",
        "Definieren Sie Zielgruppe und Entscheidung und stellen Sie nur die notwendigen Fragen.",
      ],
      [
        "Use neutral wording and test the form with someone outside the project.",
        "Formulieren Sie neutral und testen Sie das Formular mit einer projektfremden Person.",
      ],
    ],
    [
      ["Review and report", "Prüfen und berichten"],
      [
        "Ask Lab to check the design and the approved contact route.",
        "Lassen Sie Design und freigegebenen Kontaktweg durch Lab prüfen.",
      ],
      [
        "Report the response base and limitations; keep participant data in the approved research system.",
        "Nennen Sie Rücklaufbasis und Einschränkungen. Teilnehmendendaten verbleiben im freigegebenen Forschungssystem.",
      ],
    ],
  ],
);
article(
  "tools",
  "customer-mailing",
  ["Preparing a Customer Mailing", "Einen Kundenversand vorbereiten"],
  [
    "Coordinate content, audience selection and service readiness before release.",
    "Stimmen Sie Inhalte, Zielgruppenauswahl und Servicebereitschaft vor der Freigabe ab.",
  ],
  [
    [
      ["Prepare the send", "Den Versand vorbereiten"],
      [
        "Confirm the objective, approved copy, destination and contact-permission selection.",
        "Klären Sie Ziel, freigegebenen Text, Zielseite und Auswahl nach Kontaktberechtigung.",
      ],
      [
        "Test personalisation, links and the customer response route using approved test records.",
        "Testen Sie Personalisierung, Links und Rückmeldeweg anhand freigegebener Testdatensätze.",
      ],
    ],
    [
      ["Confirm the handover", "Die Übergabe bestätigen"],
      [
        "Make Relations aware of likely questions and the release window.",
        "Informieren Sie das Team für Beziehungen über erwartbare Fragen und das Versandfenster.",
      ],
      [
        "Keep selection and send records in the authorised platform; the Wiki holds the method only.",
        "Auswahl- und Versandnachweise verbleiben in der autorisierten Plattform. Das Wiki enthält nur das Vorgehen.",
      ],
    ],
  ],
);
article(
  "tools",
  "shared-templates",
  ["Using Shared Templates", "Gemeinsame Vorlagen nutzen"],
  [
    "Start from the current managed template and keep its purpose intact.",
    "Beginnen Sie mit der aktuellen verwalteten Vorlage und bewahren Sie deren Zweck.",
  ],
  [
    [
      ["Choose the current source", "Die aktuelle Quelle wählen"],
      [
        "Check template title, owner, review date and intended audience in the A–Z Directory.",
        "Prüfen Sie Titel, verantwortliche Person, Prüfdatum und Zielgruppe der Vorlage im A–Z-Verzeichnis.",
      ],
      [
        "Use the agreed fields so reviewers can find the information they need.",
        "Nutzen Sie die vereinbarten Felder, damit Prüfende die benötigten Informationen finden.",
      ],
    ],
    [
      [
        "Create work in its workspace",
        "Arbeit im zuständigen Arbeitsbereich anlegen",
      ],
      [
        "Save the completed brief or plan in the workspace responsible for delivery.",
        "Speichern Sie das ausgefüllte Briefing oder den Plan im für die Umsetzung zuständigen Arbeitsbereich.",
      ],
      [
        "Suggest template improvements to its owner rather than distributing an alternative master.",
        "Schlagen Sie Verbesserungen der verantwortlichen Person vor, statt eine alternative Mastervorlage zu verteilen.",
      ],
    ],
  ],
);
article(
  "contacts",
  "contact-guide",
  ["Role-based Contact Guide", "Ansprechpersonen nach Zuständigkeit"],
  [
    "Start with the role responsible for the question. No private contact details are listed.",
    "Wenden Sie sich zuerst an die für die Frage zuständige Rolle. Private Kontaktdaten werden nicht aufgeführt.",
  ],
  [
    [
      ["Commercial and customer work", "Vertriebs- und Kundenarbeit"],
      [
        "Maya Chen coordinates frontline sales operations and deployment questions.",
        "Maya Chen koordiniert operative Vertriebsabläufe und Fragen zur Einsatzplanung.",
      ],
      [
        "Taylor Brooks is the starting point for audience research and analytics. Alex Morgan coordinates creative and editorial production.",
        "Taylor Brooks ist die erste Ansprechperson für Zielgruppenforschung und Analyse. Alex Morgan koordiniert kreative und redaktionelle Produktion.",
      ],
    ],
    [
      ["Specialist support", "Fachliche Unterstützung"],
      [
        "Use Relations for continuing customer service and Devon Park for digital platform issues.",
        "Wenden Sie sich für laufende Kundenanliegen an das Team für Beziehungen und für digitale Plattformprobleme an Devon Park.",
      ],
      [
        "Harper Cole coordinates legal and privacy questions. Elena Rossi supports learning and capability development.",
        "Harper Cole koordiniert Rechts- und Datenschutzfragen. Elena Rossi unterstützt Lernen und Kompetenzentwicklung.",
      ],
    ],
  ],
);

export const wikiArticles: readonly WikiArticle[] = articles;
export function wikiArticleHref(item: Pick<WikiArticle, "areaId" | "id">) {
  return `${wikiBase}/${item.areaId}/${item.id}`;
}
export function wikiAreaHref(areaId: string) {
  const first = wikiArticles.find((item) => item.areaId === areaId);
  return first ? wikiArticleHref(first) : `${wikiBase}/a-z`;
}
export function resolveWikiPath(pathname: string) {
  const parts = pathname.slice(wikiBase.length).split("/").filter(Boolean);
  const [areaId = "foundations", articleId] = parts;
  const area = wikiAreas.find((item) => item.id === areaId);
  const article = wikiArticles.find(
    (item) => item.areaId === areaId && (!articleId || item.id === articleId),
  );
  const valid =
    pathname.startsWith(wikiBase) &&
    parts.length <= 2 &&
    !!area &&
    (areaId === "a-z" ? !articleId : !!article);
  return { area, article, valid };
}

const folders = {
  foundations: c(["Brand & Strategy", "Marke & Strategie"]),
  messaging: c(["Messaging & Creative", "Botschaften & Kreation"]),
  insight: c(["Analytics & Performance", "Analyse & Wirkung"]),
  standards: c(["Legal & Standards", "Recht & Standards"]),
  learning: c(["Learning", "Lernen"]),
  tools: c(["Tools & Processes", "Werkzeuge & Prozesse"]),
  contacts: c(["Audience & Customer", "Zielgruppen & Kunden"]),
};
export const wikiFolders = [...new Set(Object.values(folders))];
export const wikiFiles: LibraryDocument[] = wikiArticles.map((item, index) => {
  const folder =
    item.id === "know-audiences" || item.id === "know-customers"
      ? folders.contacts
      : folders[item.areaId as keyof typeof folders];
  const name = `${item.title}.pdf`;
  wikiTranslations[name] = `${wikiTranslations[item.title]}.pdf`;
  return {
    id: item.sourceId,
    sensitivity: "Internal",
    name,
    folder,
    modified: index % 3 === 0 ? "2026-10-14" : "2026-10-12",
    owner: item.owner,
    status: index === 10 || index === 24 ? "Needs review" : "Approved",
    summary: item.introduction,
    contentType: item.areaId === "tools" ? "how-to" : "reference",
    metadata: {
      Topic: item.title,
      Audience: "Sales & Marketing colleagues",
      "Review date": index === 10 || index === 24 ? "2026-10-15" : "2027-01-12",
    },
    versions: [
      {
        version: "2.0",
        date: item.reviewed,
        author: item.owner,
        note: "Reviewed reference edition",
        current: true,
      },
      {
        version: "1.0",
        date: "2026-07-01",
        author: item.owner,
        note: "First approved reference edition",
      },
    ],
  };
});
export const wikiLibraryTitle = "Sales & Marketing reference collection";
export function wikiSourceHref(article: Pick<WikiArticle, "sourceId">) {
  return `${wikiBase}/a-z?${new URLSearchParams({ library: wikiLibraryTitle, file: article.sourceId })}`;
}
export const wikiLibrary: LibraryDefinition = {
  id: "sales-marketing-reference",
  defaultSensitivity: "Internal",
  name: wikiLibraryTitle,
  purpose: "Managed sources behind the Wiki articles.",
  columns: [
    { key: "name", label: "Name" },
    { key: "Topic", label: "Topic" },
    { key: "owner", label: "Owner" },
    { key: "status", label: "Status" },
  ],
  fields: [
    { key: "contentType", label: "Content type" },
    { key: "Audience", label: "Audience" },
    { key: "Review date", label: "Review date", type: "date" },
    { key: "modified", label: "Modified", type: "date" },
  ],
  contentTypes: [
    { id: "reference", name: "Knowledge reference" },
    { id: "how-to", name: "How-to guide" },
  ],
  views: [
    { id: "a-z", name: "A–Z", sortBy: "Topic", recursive: true },
    {
      id: "recent",
      name: "Recently updated",
      sortBy: "modified",
      descending: true,
      recursive: true,
      columns: ["name", "modified", "owner"],
    },
    {
      id: "review",
      name: "Needs review",
      filters: [{ field: "status", value: "Needs review" }],
      recursive: true,
      columns: ["name", "owner", "Review date", "status"],
    },
    {
      id: "topic",
      name: "By topic",
      sortBy: "folder",
      recursive: true,
      columns: ["name", "Topic", "contentType", "owner"],
    },
  ],
};

export const wikiInterfaceCopy: Copy[] = [
  [
    "Advertising, Marketing & Sales Wiki",
    "Advertising, Marketing & Sales Wiki",
  ],
  ["Knowledge & frontline", "Wissen & Vertriebsalltag"],
  ["Search this Wiki", "Dieses Wiki durchsuchen"],
  ["Wiki search results", "Wiki-Suchergebnisse"],
  ["No matching articles.", "Keine passenden Artikel."],
  ["Knowledge areas", "Wissensbereiche"],
  ["Chapters", "Kapitel"],
  ["Browse knowledge areas", "Wissensbereiche anzeigen"],
  ["Browse chapters", "Kapitel anzeigen"],
  ["Wiki article", "Wiki-Artikel"],
  ["Wiki chapter navigation", "Wiki-Kapitelnavigation"],
  ["Wiki area navigation", "Wiki-Bereichsnavigation"],
  ["Article sections", "Artikelabschnitte"],
  ["On this page", "Auf dieser Seite"],
  ["Related reading", "Weiterführende Artikel"],
  ["Reference source", "Referenzquelle"],
  ["Open managed source", "Verwaltete Quelle öffnen"],
  ["Last reviewed", "Zuletzt geprüft"],
  ["Article owner", "Artikelverantwortung"],
  ["Previous article", "Vorheriger Artikel"],
  ["Next article", "Nächster Artikel"],
  ["Article not found", "Artikel nicht gefunden"],
  [
    "Choose a knowledge area to continue.",
    "Wählen Sie einen Wissensbereich, um fortzufahren.",
  ],
  ["Skip to Wiki article", "Zum Wiki-Artikel springen"],
  ["Reference folders", "Referenzordner"],
  ["All references", "Alle Referenzen"],
  [
    "Browse the managed references behind these articles.",
    "Durchsuchen Sie die verwalteten Referenzen hinter diesen Artikeln.",
  ],
  [wikiLibraryTitle, "Referenzsammlung Vertrieb & Marketing"],
  [
    "Managed sources behind the Wiki articles.",
    "Verwaltete Quellen der Wiki-Artikel.",
  ],
  ["Sales & Marketing colleagues", "Mitarbeitende in Vertrieb & Marketing"],
  ["Knowledge reference", "Wissensreferenz"],
  ["How-to guide", "Anleitung"],
  ["Recently updated", "Zuletzt aktualisiert"],
  ["By topic", "Nach Thema"],
  ["Reviewed reference edition", "Geprüfte Referenzfassung"],
  ["First approved reference edition", "Erste freigegebene Referenzfassung"],
];
wikiInterfaceCopy.forEach(c);
