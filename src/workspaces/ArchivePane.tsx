import { useState } from "react";
import PocAnnotation from "../components/PocAnnotation";
import {
  archiveRecords,
  regions,
  retentionSchedule,
  searchArchive,
  legacyFolders,
  transferStages,
  type ArchiveRecord,
} from "./archiveData";
import type { WorkingItem } from "./types";
export default function ArchivePane({
  page,
  region,
  items,
  onItem,
}: {
  page: string;
  region?: string;
  items: WorkingItem[];
  onItem: (x: WorkingItem) => void;
}) {
  const [query, setQuery] = useState(""),
    [filters, setFilters] = useState<Record<string, string>>({
      collection: new URLSearchParams(location.search).get("collection") || "",
    }),
    [selected, setSelected] = useState<ArchiveRecord | undefined>(() =>
      archiveRecords.find(
        (r) => r.id === new URLSearchParams(location.search).get("record"),
      ),
    ),
    [folder, setFolder] = useState(""),
    [stages, setStages] = useState<Record<string, string>>({}),
    [scheduleStates, setScheduleStates] = useState<Record<string, string>>({});
  const allRecords = searchArchive(query, filters).filter(
    (r) => !region || r.region === region,
  );
  const records =
    page === "home" && !query && !Object.values(filters).some(Boolean)
      ? allRecords.slice(0, 3)
      : allRecords;
  const catalogue = (
    <>
      <form className="archive-search" onSubmit={(e) => e.preventDefault()}>
        <label>
          <input
            aria-label="Search the archive"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Title, creator, description or reference"
          />
        </label>
        <div className="archive-filters">
          {[
            ["year", "Year"],
            ["collection", "Collection"],
            ["area", "Business area"],
            ["series", "Record series"],
            ["format", "Format"],
          ].map(([key, label]) => (
            <label key={key}>
              {label}
              <select
                aria-label={`Archive ${label}`}
                value={filters[key] || ""}
                onChange={(e) =>
                  setFilters({ ...filters, [key]: e.target.value })
                }
              >
                <option value="">All</option>
                {[
                  ...new Set(
                    archiveRecords.map((r) => r[key as keyof ArchiveRecord]),
                  ),
                ]
                  .filter(Boolean)
                  .map((v) => (
                    <option key={v}>{v}</option>
                  ))}
              </select>
            </label>
          ))}
        </div>
      </form>
      <div className="archive-results">
        {records.map((r) => (
          <button key={r.id} onClick={() => setSelected(r)}>
            <small>
              {r.year} · {r.series}
            </small>
            <strong>{r.name}</strong>
            <span>{r.description}</span>
            <small>
              {r.collection} · {r.format} · {r.preservation}
            </small>
          </button>
        ))}
        {!records.length && <p>No catalogue records match these filters.</p>}
      </div>
    </>
  );
  return (
    <div className="archive-pane">
      {page === "home" ? (
        <>
          <section>
            <h2>Search the archive</h2>
            {catalogue}
          </section>
          <div className="archive-home-columns">
            <section>
              <h2>Featured collections</h2>
              {[...new Set(archiveRecords.map((r) => r.collection))]
                .slice(0, 3)
                .map((c) => (
                  <a
                    key={c}
                    href={`/archives/collections?collection=${encodeURIComponent(c)}`}
                  >
                    {c} →
                  </a>
                ))}
              <a href="/archives/legacy-drive" className="archive-legacy-link">
                <strong>Legacy P: drive</strong>
                <span>VIEW ONLY · Browse historical folders</span>
              </a>
            </section>
            <section>
              <h2>Global Archives</h2>
              {regions.map((r) => (
                <a key={r.id} href={`/archives/global/${r.id}`}>
                  {r.name} →
                </a>
              ))}
              <a href="/archives/retention">Records & Retention →</a>
            </section>
          </div>
          <section>
            <h2>Current archive work</h2>
            {items
              .filter((x) =>
                ["transfer", "preservation", "cataloguing"].includes(x.area),
              )
              .slice(0, 3)
              .map((x) => (
                <button
                  className="functional-work-row"
                  key={x.id}
                  onClick={() => onItem(x)}
                >
                  <strong>{x.name}</strong>
                  <span>
                    {x.status} · {x.nextAction}
                  </span>
                </button>
              ))}
          </section>
        </>
      ) : page === "collections" || page === "global" ? (
        <>
          <h2>
            {regions.find((r) => r.id === region)?.name || "Archive catalogue"}
          </h2>
          {page === "global" && !region && (
            <div className="archive-region-links">
              {regions.map((r) => (
                <a key={r.id} href={`/archives/global/${r.id}`}>
                  {r.name} →
                </a>
              ))}
            </div>
          )}
          {catalogue}
          <a href="/archives/collections/historical">
            Restricted Historical Collection · Controlled access →
          </a>
        </>
      ) : page === "legacy-drive" ? (
        <>
          <span className="archive-view-only">VIEW ONLY</span>
          <h2>Legacy P: drive</h2>
          <p>
            Historical reference location. Continue active work in its
            functional workspace.
          </p>
          <div className="legacy-drive">
            <nav aria-label="Legacy P drive folders">
              <button onClick={() => setFolder("")}>P:\</button>
              {legacyFolders.map((f) => (
                <button key={f} onClick={() => setFolder(f)}>
                  ▸ {f}
                </button>
              ))}
            </nav>
            <section>
              <h3>{folder ? `P:\\${folder}` : "Select a legacy folder"}</h3>
              {folder && (
                <button
                  className="archive-legacy-file"
                  onClick={() =>
                    setSelected({
                      ...archiveRecords[0],
                      id: `LEGACY-${folder.toUpperCase()}`,
                      year: "2012",
                      collection: "Legacy P: drive",
                      series: "Historical reference",
                      creator: `${folder} legacy filing`,
                      area: folder,
                      preservation: "Appraisal pending",
                      name: `${folder} — Approved Historical Summary.pdf`,
                      description:
                        "View-only synthetic historical summary. No current personnel, customer or transaction records are included.",
                    })
                  }
                >
                  {folder} — Approved Historical Summary.pdf
                  <small>2012 · Historical reference · VIEW ONLY</small>
                </button>
              )}
            </section>
          </div>
        </>
      ) : page === "retention" ? (
        <>
          <h2>Retention Schedule</h2>
          <PocAnnotation title="Test data" variant="inline">
            Fictional schedule for records-specialist review
          </PocAnnotation>
          <div className="functional-table">
            <table>
              <thead>
                <tr>
                  {[
                    "Record series",
                    "Business activity",
                    "Trigger",
                    "Retention period",
                    "Final action",
                    "Archive review",
                    "Owner",
                    "Status",
                    "Basis",
                  ].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {retentionSchedule.map((r) => (
                  <tr key={r.series}>
                    <td>{r.series}</td>
                    <td>{r.activity}</td>
                    <td>{r.trigger}</td>
                    <td>{r.period}</td>
                    <td>{r.action}</td>
                    <td>{r.review}</td>
                    <td>{r.owner}</td>
                    <td>
                      <select
                        aria-label={`Retention status ${r.series}`}
                        value={scheduleStates[r.series] || r.status}
                        onChange={(e) =>
                          setScheduleStates({
                            ...scheduleStates,
                            [r.series]: e.target.value,
                          })
                        }
                      >
                        {[
                          "Draft",
                          "Under review",
                          "Approved",
                          "Superseded",
                        ].map((v) => (
                          <option key={v}>{v}</option>
                        ))}
                      </select>
                    </td>
                    <td>{r.basis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : page === "transfer" ? (
        <>
          <h2>Appraisal & Transfer queue</h2>
          <div className="functional-table">
            <table>
              <thead>
                <tr>
                  <th>Proposed transfer</th>
                  <th>Owner</th>
                  <th>Stage</th>
                  <th>Next action</th>
                </tr>
              </thead>
              <tbody>
                {items
                  .filter((x) => x.area === "transfer")
                  .map((x) => (
                    <tr key={x.id}>
                      <td>{x.name}</td>
                      <td>{x.owner}</td>
                      <td>
                        <select
                          aria-label={`Transfer stage ${x.id}`}
                          value={stages[x.id] || "Appraisal"}
                          onChange={(e) =>
                            setStages({ ...stages, [x.id]: e.target.value })
                          }
                        >
                          {transferStages.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td>{x.nextAction}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <a href="/digital-tech/information-architecture">
            Technical storage implementation handoff ↗
          </a>
        </>
      ) : (
        <section>
          <h2>
            {page === "preservation"
              ? "Preservation review"
              : page === "cataloguing"
                ? "Description and catalogue work"
                : "Archive working queue"}
          </h2>
          {items
            .filter((x) => x.area === page)
            .map((x) => (
              <button
                className="functional-work-row"
                key={x.id}
                onClick={() => onItem(x)}
              >
                <strong>{x.name}</strong>
                <span>{x.nextAction}</span>
              </button>
            ))}
          {page === "preservation" && (
            <p>
              Review format risk, preservation copies, checksums, metadata
              completeness, digitisation and audio-visual media. Infrastructure
              implementation links to Digital & Technology.
            </p>
          )}
        </section>
      )}
      {selected && (
        <section
          className="archive-preview"
          role="dialog"
          aria-label="Archive record preview"
        >
          <button onClick={() => setSelected(undefined)}>Close preview</button>
          <span className="archive-view-only">VIEW ONLY</span>
          <h2>{selected.name}</h2>
          <dl>
            {(
              [
                ["Collection", selected.collection],
                ["Record series", selected.series],
                ["Year", selected.year],
                ["Created by", selected.creator],
                ["Business area", selected.area],
                ["Description", selected.description],
                ["Format", selected.format],
                ["Access", selected.access],
                ["Preservation", selected.preservation],
                ["Region", selected.region],
              ] as const
            )
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
          </dl>
        </section>
      )}
    </div>
  );
}
