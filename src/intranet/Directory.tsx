import { useState } from "react";
import {
  ChartMultiple24Regular,
  PeopleTeam24Regular,
  Settings24Regular,
  Search24Regular,
  DesignIdeas24Regular,
  Money24Regular,
  ArrowRight20Regular,
  GridDots24Regular,
  BuildingGovernment24Regular,
} from "@fluentui/react-icons";
import { workspaces, staff } from "./catalog";
import "./styles.css";
import "../executive/styles.css";
const icons = [
  ChartMultiple24Regular,
  PeopleTeam24Regular,
  Settings24Regular,
  Search24Regular,
  DesignIdeas24Regular,
  Money24Regular,
  BuildingGovernment24Regular,
];
export default function Directory() {
  const [person, setPerson] = useState("maya");
  const [notice, setNotice] = useState("");
  return (
    <div className="intranet-directory">
      <header className="directory-brand">
        <GridDots24Regular aria-hidden="true" />
        <strong>SharePoint</strong>
        <span className="directory-brand-end">Company intranet</span>
      </header>
      <nav className="directory-nav" aria-label="Intranet navigation">
        <strong>Our workplace</strong>
        {[
          "Home",
          "News",
          "Our organisation",
          "People & support",
          "Digital Workspaces",
        ].map((x) => (
          <button
            key={x}
            aria-current={x === "Digital Workspaces" ? "page" : undefined}
            onClick={() =>
              setNotice(
                x === "Digital Workspaces"
                  ? "You are on Digital Workspaces."
                  : `${x} is illustrative intranet navigation.`,
              )
            }
          >
            {x}
          </button>
        ))}
      </nav>
      <main className="directory-main">
        <div className="directory-heading">
          <div>
            <small>OUR WORKPLACE / DIGITAL WORKSPACES</small>
            <h1>Digital workspaces</h1>
            <p>Find the shared space for your work.</p>
          </div>
          <aside>Interactive examples · Fictional workspace names</aside>
        </div>
        {notice && (
          <div role="status" className="directory-notice">
            {notice}
            <button aria-label="Dismiss notice" onClick={() => setNotice("")}>
              ×
            </button>
          </div>
        )}
        <div className="directory-grid">
          {workspaces.map((w, i) => {
            const Icon = icons[i];
            return (
              <a className="directory-tile" key={w.id} href={w.href}>
                <span className="directory-tile-icon">
                  <Icon />
                </span>
                <div>
                  <small>{w.group}</small>
                  <h2>{w.title} workspace</h2>
                </div>
                <span className="directory-open">
                  <img src="/images/sharepoint-logo.svg" alt="SharePoint" />
                  Open workspace <ArrowRight20Regular />
                </span>
              </a>
            );
          })}
        </div>
      </main>
      <footer className="directory-teams">
        <img src="/images/teams-logo.svg" alt="Microsoft Teams" />
        <div className="directory-teams-copy">
          <strong>Your work, connected in Teams</strong>
          <span>
            Explore the same workspaces through a colleague’s Teams view.
          </span>
        </div>
        <label>
          Preview as
          <select value={person} onChange={(e) => setPerson(e.target.value)}>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {s.role}
              </option>
            ))}
          </select>
        </label>
        <a href={`/teams?staff=${person}`}>
          Open Teams view <ArrowRight20Regular />
        </a>
      </footer>
    </div>
  );
}
