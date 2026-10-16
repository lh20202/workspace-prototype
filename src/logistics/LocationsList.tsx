import { useState } from "react";
import { Button, Input } from "@fluentui/react-components";
import {
  Search20Regular,
  Filter20Regular,
  Add20Regular,
} from "@fluentui/react-icons";
import { permits, type Permit } from "./data";
import { locationViews, queryPermits } from "./query";
import { shortDate } from "./FileTable";
export default function LocationsList({
  onMessage,
}: {
  onMessage: (message: string) => void;
}) {
  const [view, setView] = useState<string>("All Locations");
  const [search, setSearch] = useState("");
  const [campaign, setCampaign] = useState("");
  const [permit, setPermit] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<Permit | null>(null);
  const rows = queryPermits(permits, view, search, campaign, permit);
  return (
    <>
      <div className="library-heading">
        <div>
          <h2>Locations & Permits</h2>
          <p>
            Shared location confirmations and permit status for upcoming
            in-person operations.
          </p>
        </div>
        <span className="list-label">Microsoft Lists</span>
      </div>
      <div className="command-bar">
        <Button
          appearance="primary"
          icon={<Add20Regular />}
          onClick={() =>
            onMessage(
              "Prototype: a new location would be added to this shared list.",
            )
          }
        >
          New item
        </Button>
        <div>
          <label className="view-control">
            <span className="sr-only">Locations view</span>
            <select
              aria-label="Locations view"
              value={view}
              onChange={(e) => setView(e.target.value)}
            >
              {locationViews.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <Button
            appearance="subtle"
            icon={<Filter20Regular />}
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            Filters
          </Button>
        </div>
      </div>
      <div className="library-search">
        <Input
          contentBefore={<Search20Regular />}
          placeholder="Search locations"
          aria-label="Search locations"
          value={search}
          onChange={(_, d) => setSearch(d.value)}
        />
        <span>
          {rows.length} location{rows.length === 1 ? "" : "s"}
        </span>
        {(search || campaign || permit) && (
          <button
            onClick={() => {
              setSearch("");
              setCampaign("");
              setPermit("");
            }}
          >
            Clear filters
          </button>
        )}
      </div>
      {filtersOpen && (
        <div className="filter-bar">
          <label>
            Campaign
            <select
              aria-label="Location campaign"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
            >
              <option value="">All campaigns</option>
              {[...new Set(permits.map((p) => p.campaign))].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Permit status
            <select
              aria-label="Permit status filter"
              value={permit}
              onChange={(e) => setPermit(e.target.value)}
            >
              <option value="">All statuses</option>
              <option>Approved</option>
              <option>Pending</option>
            </select>
          </label>
          <Button
            onClick={() => {
              setSearch("");
              setCampaign("");
              setPermit("");
              setView("All Locations");
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
      <div className="table-scroll">
        <table className="locations-table">
          <thead>
            <tr>
              {[
                "Location",
                "Campaign",
                "City/region",
                "Date",
                "Permit status",
                "Operational status",
                "Team lead",
                "Notes",
              ].map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td>
                  <button
                    className="document-name"
                    onClick={() => setSelected(p)}
                  >
                    {p.location}
                  </button>
                </td>
                <td>{p.campaign}</td>
                <td>{p.region}</td>
                <td>{shortDate(p.date)}</td>
                <td>
                  <span className={`permit-status ${p.permit.toLowerCase()}`}>
                    {p.permit}
                  </span>
                </td>
                <td>{p.status}</td>
                <td>{p.lead}</td>
                <td className="location-notes">{p.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && (
          <div className="empty-state">No locations match this view.</div>
        )}
      </div>
      {selected && (
        <section className="location-detail" aria-label="Location details">
          <div className="section-heading">
            <h3>{selected.location}</h3>
            <Button onClick={() => setSelected(null)}>Close details</Button>
          </div>
          <p>{selected.notes}</p>
          <p>
            {selected.campaign} · {shortDate(selected.date)} · {selected.permit}{" "}
            · {selected.lead}
          </p>
        </section>
      )}
    </>
  );
}
