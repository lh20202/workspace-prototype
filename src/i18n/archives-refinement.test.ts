import { describe, expect, it } from "vitest";
import {
  archiveRecords,
  retentionSchedule,
  regions,
} from "../workspaces/archiveData";
import { germanArchivesRefinement } from "./de-archives-refinement";

describe("German archive interpretation", () => {
  it("covers every visible catalogue record, collection, record series and regional archive", () => {
    for (const record of archiveRecords)
      for (const key of [
        record.name,
        record.collection,
        record.series,
        record.description,
        record.preservation,
        record.access,
      ])
        expect(germanArchivesRefinement[key], key).toBeTruthy();
    for (const region of regions)
      expect(germanArchivesRefinement[region.name]).toBeTruthy();
  });
  it("covers retention series and filter labels using archive terminology", () => {
    for (const row of retentionSchedule)
      for (const key of [row.series, row.period, row.action, row.basis])
        expect(germanArchivesRefinement[key], key).toBeTruthy();
    for (const label of [
      "Year",
      "Collection",
      "Business area",
      "Record series",
      "Format",
    ])
      expect(germanArchivesRefinement[`Archive ${label}`]).toBeTruthy();
    expect(germanArchivesRefinement.Appraisal).toBe("Archivische Bewertung");
    expect(germanArchivesRefinement["Digital Preservation"]).toBe(
      "Digitale Langzeitarchivierung",
    );
  });
});
