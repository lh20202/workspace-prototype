import {
  Popover,
  PopoverTrigger,
  PopoverSurface,
} from "@fluentui/react-components";
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
  ChevronRight16Regular,
  Code24Regular,
  Library24Regular,
  Scales24Regular,
  Headset24Regular,
  Briefcase24Regular,
  Warning24Regular,
} from "@fluentui/react-icons";
import { workspaces, staff, selectedStaffId, rememberStaff } from "./catalog";
import "./styles.css";
import "./launcher.css";
import { departments, departmentHref } from "../coordination/data";
import "../coordination/styles.css";
import "../executive/styles.css";
import "../workspaces/styles.css";
const workspaceIcons: Record<string, typeof Code24Regular> = {
  projects: Briefcase24Regular,
  planning: ChartMultiple24Regular,
  logistics: PeopleTeam24Regular,
  services: Settings24Regular,
  audience: Search24Regular,
  content: DesignIdeas24Regular,
  finance: Money24Regular,
  executive: BuildingGovernment24Regular,
  quality: ChartMultiple24Regular,
  digital: Code24Regular,
  legal: Scales24Regular,
  people: PeopleTeam24Regular,
  archives: Library24Regular,
  customer: Headset24Regular,
};
export default function Directory() {
  const [person, setPerson] = useState(selectedStaffId);
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
          "Tools & support",
          "Digital Workspaces",
        ].map((x) => (
          <Popover key={x} positioning="below-start" withArrow trapFocus>
            <PopoverTrigger disableButtonEnhancement>
              <button
                aria-current={x === "Digital Workspaces" ? "page" : undefined}
              >
                {x}
              </button>
            </PopoverTrigger>
            <PopoverSurface className="directory-nav-popover">
              <strong>{x}</strong>
              <p>
                {x === "Digital Workspaces"
                  ? "You are on Digital Workspaces."
                  : "Illustrative intranet navigation. This destination is not included in the prototype."}
              </p>
            </PopoverSurface>
          </Popover>
        ))}
      </nav>
      <main className="directory-main">
        <div className="architecture-preview-label">
          <span>Full Architecture Prototype</span>
          <span className="exploratory-badge">EXPLORATORY BETA</span>
          <a href="/">Back to prototypes</a>
        </div>
        <div className="directory-heading">
          <div>
            <small>OUR WORKPLACE / DIGITAL WORKSPACES</small>
            <h1>Digital workspaces</h1>
            <p>Find the shared space for your work.</p>
          </div>
          <aside className="directory-caveat">
            <Warning24Regular aria-hidden="true" />
            <div>
              <strong>Fictional examples</strong>
              <span>
                Workspace titles are illustrative, not real site names.
              </span>
            </div>
          </aside>
        </div>
        <div className="directory-content">
          <div className="directory-grid">
            {workspaces.map((w) => {
              const Icon = workspaceIcons[w.id];
              return (
                <a className="directory-tile" key={w.id} href={w.href}>
                  <span className="directory-tile-icon">
                    <Icon />
                  </span>
                  <div>
                    <h2>{w.title} workspace</h2>
                  </div>
                  <span className="directory-open">
                    <img src="/images/sharepoint-logo.svg" alt="" />
                    SharePoint <ArrowRight20Regular />
                  </span>
                </a>
              );
            })}
          </div>
          <aside
            className="directory-coordination"
            aria-label="Department Teams"
          >
            <h2>Department Teams</h2>
            <p>Local meetings, planning and team coordination.</p>
            {departments.map((d) => {
              const Icon = PeopleTeam24Regular;
              return (
                <a
                  className="department-quick-link"
                  key={d.id}
                  href={departmentHref(person, d.id)}
                >
                  <Icon />
                  <span>
                    {d.name}
                    <small>
                      <img src="/images/teams-logo.svg" alt="Teams" />
                      Open in Teams
                    </small>
                  </span>
                  <ChevronRight16Regular />
                </a>
              );
            })}
          </aside>
        </div>
      </main>
      <footer className="directory-teams">
        <img src="/images/teams-logo.svg" alt="Microsoft Teams" />
        <div className="directory-teams-copy">
          <strong>Your work, connected in Teams</strong>
          <span>See your channels and shared files.</span>
        </div>
        <label>
          Preview as
          <select
            value={person}
            onChange={(e) => {
              setPerson(e.target.value);
              rememberStaff(e.target.value);
            }}
          >
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
