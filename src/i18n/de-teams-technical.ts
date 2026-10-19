export const germanTeamsTechnical: Record<string, string> = {
  "Privileged-access review is ready. @Ari can you check the service owners against the approved changes before the window? Credentials and vulnerability details are still in their separate systems.":
    "Die Prüfung der privilegierten Zugriffe ist bereit. @Ari, kannst du vor dem Wartungsfenster die Serviceverantwortlichen mit den freigegebenen Änderungen abgleichen? Zugangsdaten und Schwachstellendetails liegen weiterhin in den getrennten Systemen.",
  "On it. I’ll check the approval references as well.":
    "Mache ich. Die Freigabereferenzen prüfe ich gleich mit.",
  "Company Data API: I’d validate requests in TypeScript at the edge and keep the batch workers in Python. Is there a good reason to put the whole pipeline behind one synchronous endpoint?":
    "Company Data API: Ich würde Anfragen am Eingang in TypeScript validieren und die Batch-Worker in Python lassen. Gibt es einen guten Grund, die gesamte Pipeline hinter einen synchronen Endpunkt zu hängen?",
  "Separate failure domains would be easier to test. What does that mean for retries and idempotency?":
    "Getrennte Fehlerbereiche wären leichter zu testen. Was bedeutet das für Wiederholungsversuche und Idempotenz?",
  "That’s the trade-off I want to settle. I’ll add both options to the Architecture Decision Record before we choose.":
    "Genau das möchte ich klären. Ich nehme beide Optionen in den Architecture Decision Record auf, bevor wir uns entscheiden.",
  "Container preview builds are reproducible now. CI/CD runs typecheck, contract tests and the image build, then waits for deployment approval. Could someone check the edge-function timeout handling in this PR?":
    "Die Container-Preview lässt sich jetzt reproduzierbar bauen. CI/CD führt Typprüfung, Vertragstests und Image-Build aus und wartet dann auf die Deployment-Freigabe. Könnte jemand die Timeout-Behandlung der Edge Function in diesem PR prüfen?",
  "I’ll take the timeout handling. Can we review the API contract tests separately from the deploy wiring?":
    "Ich übernehme die Timeouts. Können wir die API-Vertragstests getrennt von der Deployment-Konfiguration prüfen?",
  "Compact search results render fine in React/SPFx. Graph throttling is the awkward part. I’ve split out the adapter so we can test backoff without a tenant.":
    "Die kompakten Suchergebnisse lassen sich mit React/SPFx problemlos darstellen. Schwierig ist das Graph-Throttling. Ich habe den Adapter herausgelöst, damit wir das Backoff-Verhalten ohne Mandanten testen können.",
  "I can look at the adapter. Let’s keep the local fixture synthetic and note the tenant limitation in the review.":
    "Ich schaue mir den Adapter an. Lassen wir die lokalen Testdaten synthetisch und halten die Einschränkung beim Mandantenzugriff im Review fest.",
  "Has anyone tried Qwen3 and Mistral Small locally for structured extraction? Schema constraints helped JSON consistency on our synthetic test set, but latency still needs work. Licence review is still a separate gate.":
    "Hat jemand Qwen3 und Mistral Small lokal für strukturierte Extraktion ausprobiert? Schema-Vorgaben haben die JSON-Konsistenz in unserem synthetischen Testdatensatz verbessert, aber an der Latenz müssen wir noch arbeiten. Die Lizenzprüfung bleibt eine separate Freigabe.",
  "Were classification and long-context cases in the same run? I’d split those out before we draw conclusions about the smaller model.":
    "Waren Klassifikation und Fälle mit langem Kontext im selben Lauf? Ich würde das trennen, bevor wir Schlüsse zum kleineren Modell ziehen.",
  "Good point. I’ll separate the results in Model Evaluation.xlsx.":
    "Guter Punkt. Ich trenne die Ergebnisse in Model Evaluation.xlsx.",
  "I’d try Qdrant locally before paying for a hosted vector store for the chatbot. Embeddings can stay local too. The RAG harness now scores retrieval and answers separately; the test set has no real customer data.":
    "Ich würde Qdrant für den Chatbot erst lokal testen, bevor wir für einen gehosteten Vektorspeicher zahlen. Die Embeddings können ebenfalls lokal bleiben. Der RAG-Testlauf bewertet Retrieval und Antworten jetzt getrennt; der Testdatensatz enthält keine echten Kundendaten.",
  "Added privacy-safe fixtures, prompt changes and licence notes to the issue. Can we keep the run manifest the same when we compare inference settings?":
    "Datenschutzgerechte Testdaten, Prompt-Änderungen und Lizenzhinweise sind im Issue ergänzt. Können wir beim Vergleich der Inferenz-Einstellungen dasselbe Laufmanifest verwenden?",
  "Can you add the synthetic event replay result to the release review? We don’t need any CRM customer records there.":
    "Kannst du das Ergebnis des synthetischen Event-Replays im Release-Review ergänzen? CRM-Kundendatensätze brauchen wir dort nicht.",
  "Metadata provisioning PR is up: configuration and migration mapping. I’ve used the functional owners’ taxonomy and Archives’ retention requirements. @Devon, could you check the rollback path?":
    "Der PR für die Metadaten-Bereitstellung ist offen: Konfiguration und Migrationszuordnung. Grundlage sind die Taxonomie der Fachverantwortlichen und die Aufbewahrungsanforderungen des Archivs. @Devon, kannst du den Rollback-Pfad prüfen?",
  "Yes, and I’ll check the Graph permission scope. Keep tenant credentials out of the review notes.":
    "Ja, und ich prüfe auch den Umfang der Graph-Berechtigungen. Keine Mandanten-Zugangsdaten in die Review-Notizen aufnehmen.",
  "Reviews this week: customer platform integration, local classification evals and M365 search. Bring the repo issue and working design to each review so we’re looking at the same version.":
    "Reviews diese Woche: Kundenplattform-Integration, lokale Klassifikations-Evaluationen und M365-Suche. Bringt jeweils das Repo-Issue und den Arbeitsentwurf mit, damit wir dieselbe Version vor uns haben.",
  "Thanks. I’ll use that for the pagination check.":
    "Danke. Den nehme ich für die Paginierungsprüfung.",
  "Managed hosting or containers for the new service? I’ve put the trade-offs in the Architecture Decision Record. We still need to agree who runs it and how we recover if it fails.":
    "Managed Hosting oder Container für den neuen Service? Die Vor- und Nachteile stehen im Architecture Decision Record. Offen ist noch, wer den Betrieb übernimmt und wie wir den Service im Fehlerfall wiederherstellen.",
  "Agreed. I’ll keep the investment decision linked to the executive paper rather than copying it into the record.":
    "Einverstanden. Ich verlinke die Investitionsentscheidung mit der Vorlage für die Geschäftsleitung, statt sie in den Record zu kopieren.",
  "I’ll check the authorised account and device handoff with the new-starter owner.":
    "Ich kläre die freigegebene Konto- und Geräteübergabe mit der verantwortlichen Person für den neuen Mitarbeitenden.",
  "This week’s reviews are in the register. Can we settle the owner and audience before sending the changes to Digital? It’ll save another round of questions.":
    "Die Reviews dieser Woche stehen in der Übersicht. Können wir Verantwortung und Nutzerkreis klären, bevor die Änderungen an Digital gehen? Das spart eine weitere Fragerunde.",
  "Customer Care asked for another private library. This looks like it might already fit in their protected relationship area. Can someone check with them before we set anything up?":
    "Die Kundenbetreuung hat eine weitere private Bibliothek angefragt. Das könnte schon in ihren geschützten Beziehungsbereich passen. Kann jemand nachfragen, bevor wir etwas einrichten?",
  "I’ll ask the owner what’s missing and who needs access. Added it to the register so we don’t lose it.":
    "Ich frage die verantwortliche Person, was fehlt und wer Zugriff braucht. Steht jetzt auch in der Übersicht, damit es nicht untergeht.",
  "Two closed projects are still showing in Current Projects. I’ve linked the view in the review register — are we waiting for final handover on those?":
    "Zwei abgeschlossene Projekte erscheinen noch unter Aktuelle Projekte. Die Ansicht ist in der Prüfübersicht verlinkt — warten wir bei den beiden noch auf die letzte Übergabe?",
  "I’ll check the view once the project owners confirm the closure status.":
    "Ich prüfe die Ansicht, sobald die Projektverantwortlichen den Abschlussstatus bestätigen.",
  "Thanks, I’ll ask them and come back here.":
    "Danke, ich frage nach und melde mich hier wieder.",
  "Planning’s approved reporting view has changed. Could someone check the intranet link? I think it still opens the old location.":
    "Die freigegebene Berichtsansicht der Planung hat sich geändert. Könnte jemand den Intranet-Link prüfen? Ich glaube, er öffnet noch den alten Speicherort.",
  "I’ll check it with the page owner today.":
    "Ich prüfe das heute mit der seitenverantwortlichen Person.",
  "Three Advertising, Marketing & Sales Wiki pages are due for review this month. Owners are in the register. Do we have dates from everyone yet?":
    "Drei Seiten im Advertising, Marketing & Sales Wiki sind diesen Monat zur Überprüfung fällig. Die Verantwortlichen stehen in der Übersicht. Haben wir schon von allen Termine?",
  "Not yet. I’ve asked them to confirm before the next publishing handoff.":
    "Noch nicht. Ich habe sie gebeten, die Termine vor der nächsten Veröffentlichungsübergabe zu bestätigen.",
  "The updated guidance is waiting for the page owner’s approval. Can we link the working draft from its workspace here? I’d rather not start a second copy.":
    "Die aktualisierten Hinweise warten auf die Freigabe durch die seitenverantwortliche Person. Können wir den Arbeitsentwurf aus seinem Arbeitsbereich hier verlinken? Ich würde ungern eine zweite Kopie anfangen.",
  "Done — the handoff checklist now links to the owner’s file.":
    "Erledigt — die Übergabecheckliste verlinkt jetzt die Datei der verantwortlichen Person.",
  "Yesterday’s search feedback: people find the published policy but miss the working procedure. I’ve added both routes to today’s navigation review. Could the page titles be the problem?":
    "Rückmeldungen zur Suche von gestern: Die veröffentlichte Richtlinie wird gefunden, das Arbeitsverfahren nicht. Beide Zugangswege stehen für heute auf der Liste zur Navigationsprüfung. Könnten die Seitentitel das Problem sein?",
  "I’ll look at the wording with the procedure owner first. If search configuration needs changing, I’ll bring it back to Digital.":
    "Ich schaue mir zuerst die Formulierungen mit der verfahrensverantwortlichen Person an. Falls die Suchkonfiguration geändert werden muss, komme ich damit auf Digital zurück.",
  "The initial response group is in. Keep incident updates here so we have one record.":
    "Die erste Einsatzgruppe ist vollständig. Meldet Aktualisierungen zum Vorfall hier, damit wir einen gemeinsamen Stand haben.",
  "Impact Assessment is in Files. I’ll update it as the service checks come back.":
    "Die Auswirkungsbewertung liegt unter Dateien. Ich ergänze sie, sobald die Ergebnisse der Serviceprüfungen vorliegen.",
  "I’m checking the notification requirements. I’ll update here once they’re clear.":
    "Ich prüfe die Meldepflichten und melde mich hier, sobald sie geklärt sind.",
  "The temporary operating measure needs a decision. I’ll confirm the conditions before we implement it.":
    "Die vorübergehende betriebliche Maßnahme braucht eine Entscheidung. Ich kläre die Bedingungen, bevor wir sie umsetzen.",
  Earlier: "Zuvor",
};
