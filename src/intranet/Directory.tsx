import { useState } from "react";
import ArchitectureLayouts from "./ArchitectureLayouts";
import {
  architectureLayoutOptions,
  readArchitectureLayout,
  saveArchitectureLayout,
  type ArchitectureLayout,
} from "./architectureLayoutModel";
import "./architecture-layouts.css";
import PrototypeNavigator from "../components/PrototypeNavigator";
import EnvironmentIcon from "../components/EnvironmentIcon";
import WorkspaceIcon from "../components/WorkspaceIcon";
import HubHeadingIcon from "./HubHeadingIcon";
import AccessLock from "../components/AccessLock";
import TeamsMark from "../components/TeamsMark";
import StaffLink from "../components/StaffLink";
import { LanguageToggle } from "../i18n/Language";
import {
  GridDots24Regular,
  ChevronRight16Regular,
} from "@fluentui/react-icons";
import { architectureSections, hubById } from "../workspaces/registry";
import {
  architectureDestinationById,
  destinationsForHub,
  financeJumpLinks,
  orgCentralGroups,
  personnelDestinations,
  type ArchitectureDestination,
} from "./architectureDestinations";
import AdminLogins from "./AdminLogins";
import "./styles.css";
import "./launcher.css";
import { departments } from "../coordination/data";
import { departmentPreviewHref } from "../teams/departmentPreview";
import "../coordination/styles.css";
import "../executive/styles.css";
import "../workspaces/styles.css";
import "./architecture-hubs.css";

export function WorkspaceLink({
  destination,
}: {
  destination: ArchitectureDestination;
}) {
  return (
    <StaffLink
      className="directory-workspace-link"
      href={destination.href}
      data-environment="workspace"
    >
      <WorkspaceIcon size={20} />
      <h3>
        {destination.label}
        {destination.accessLevel === "strictly-confidential" && (
          <AccessLock className="directory-confidential" />
        )}
      </h3>
    </StaffLink>
  );
}

function WorkspaceGroup({ ids }: { ids: string[] }) {
  return (
    <div className="directory-workspace-group">
      <div className="directory-hub-grid">
        {ids.map((id) => (
          <WorkspaceLink
            key={id}
            destination={architectureDestinationById.get(id)!}
          />
        ))}
      </div>
    </div>
  );
}

export function ClassicArchitecture() {
  return (
    <div className="directory-content">
      <div className="directory-groups">
        {architectureSections.map((section) => {
          if (section.type === "workspace") {
            const destination = architectureDestinationById.get(section.id)!;
            return (
              <section
                className="directory-hub directory-hub-finance"
                aria-labelledby="hub-finance"
                key={section.id}
              >
                <header className="directory-hub-heading">
                  <StaffLink
                    className="directory-finance-title"
                    href={destination.href}
                    data-environment="workspace"
                  >
                    <HubHeadingIcon hubId="finance" />
                    <h2 id="hub-finance">{destination.label}</h2>
                  </StaffLink>
                </header>
                <nav
                  className="directory-finance-destinations"
                  aria-label="Financial destinations"
                >
                  <div>
                    {financeJumpLinks.map((link) => (
                      <StaffLink
                        href={link.href}
                        key={link.href}
                        title={link.description}
                        aria-label={`${link.label}: ${link.description}`}
                      >
                        <WorkspaceIcon size={20} />
                        <span>{link.label}</span>
                      </StaffLink>
                    ))}
                  </div>
                </nav>
                <AdminLogins hubId="finance" />
              </section>
            );
          }
          const hub = hubById.get(section.id)!;
          const environments = destinationsForHub(hub.id);
          const knowledgeEnvironments = environments
            .filter((environment) =>
              ["wiki", "portal"].includes(environment.type),
            )
            .sort(
              (a, b) =>
                Number(a.id === hub.portal) - Number(b.id === hub.portal),
            );
          return (
            <section
              className={`directory-hub directory-hub-${hub.id}`}
              aria-labelledby={`hub-${hub.id}`}
              key={hub.id}
            >
              <header className="directory-hub-heading">
                <HubHeadingIcon hubId={hub.id} />
                <h2 id={`hub-${hub.id}`}>{hub.name}</h2>
              </header>
              <div className="directory-hub-body">
                <div className="directory-hub-workspaces">
                  {hub.id === "infrastructure" ? (
                    <div className="directory-org-groups">
                      {orgCentralGroups.map((group) => (
                        <WorkspaceGroup key={group.label} ids={group.ids} />
                      ))}
                    </div>
                  ) : hub.id === "personnel" ? (
                    <>
                      <div className="directory-hub-grid">
                        {personnelDestinations.normal.map((destination) => (
                          <WorkspaceLink
                            destination={destination}
                            key={destination.id}
                          />
                        ))}
                      </div>
                      <div className="directory-controlled-links">
                        {personnelDestinations.controlled.map((destination) => (
                          <StaffLink
                            href={destination.href}
                            key={destination.id}
                          >
                            <AccessLock
                              size={20}
                              className="directory-confidential"
                            />
                            <span>{destination.label}</span>
                            <ChevronRight16Regular aria-hidden="true" />
                          </StaffLink>
                        ))}
                      </div>
                    </>
                  ) : (
                    <WorkspaceGroup
                      ids={environments
                        .filter(
                          (destination) => destination.type === "workspace",
                        )
                        .map(({ id }) => id)}
                    />
                  )}
                </div>
                <div className="directory-hub-support">
                  {knowledgeEnvironments.length > 0 && (
                    <div
                      className="directory-knowledge"
                      aria-label="Knowledge & external environments"
                    >
                      {knowledgeEnvironments.map((environment) => (
                        <StaffLink
                          key={environment.id}
                          href={environment.href}
                          data-environment={environment.type}
                        >
                          <EnvironmentIcon
                            type={environment.type as "wiki" | "portal"}
                            size={20}
                          />
                          <span>{environment.label}</span>
                        </StaffLink>
                      ))}
                    </div>
                  )}
                  <AdminLogins hubId={hub.id} />
                </div>
              </div>
            </section>
          );
        })}
      </div>
      <aside className="directory-coordination" aria-label="Jump to…">
        <h2>Jump to…</h2>
        <p>Meetings and coordination</p>
        {departments.map((department) => (
          <StaffLink
            className="department-quick-link"
            key={department.id}
            href={departmentPreviewHref(department.id)}
          >
            <span>
              {department.name}
              <small>
                <span className="department-open-label">
                  <TeamsMark size={12} /> Open channel
                </span>
              </small>
            </span>
            <ChevronRight16Regular aria-hidden="true" />
          </StaffLink>
        ))}
      </aside>
    </div>
  );
}

export default function Directory() {
  const [layout, setLayout] = useState(readArchitectureLayout);
  function changeLayout(next: ArchitectureLayout) {
    setLayout(next);
    saveArchitectureLayout(next);
  }
  return (
    <div className={`architecture-poc-page architecture-layout-${layout}`}>
      <PrototypeNavigator />
      <StaffLink className="skip-link" href="#directory-main">
        Skip to workspaces
      </StaffLink>
      <div className="intranet-directory">
        <header className="directory-brand">
          <GridDots24Regular aria-hidden="true" />
          <strong>Site</strong>
          <span className="directory-brand-end">Company intranet</span>
          <LanguageToggle />
        </header>
        <nav
          className="directory-nav"
          aria-label="Intranet navigation"
          aria-description="Other intranet sections are shown only to establish context and are unavailable in this proof of concept."
        >
          <img
            className="directory-company-mark"
            src="/images/company-mark.png"
            alt=""
            width="40"
            height="32"
          />
          <strong>Sample Organisation</strong>
          {["Home", "News", "Our organisation", "Tools & support"].map((x) => (
            <button type="button" key={x} disabled>
              {x}
            </button>
          ))}
          <StaffLink href="/architecture" aria-current="page">
            Digital Workspaces
          </StaffLink>
        </nav>
        <main className="directory-main" id="directory-main">
          <div className="directory-heading">
            <div>
              <h1>Digital workspaces</h1>
              <p>Find the shared space for your work.</p>
            </div>
            <label
              className="architecture-layout-control"
              htmlFor="architecture-layout"
            >
              <span>Layout</span>
              <select
                id="architecture-layout"
                aria-label="Architecture layout"
                value={layout}
                onChange={(event) =>
                  changeLayout(event.target.value as ArchitectureLayout)
                }
              >
                {architectureLayoutOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {layout === "classic" ? (
            <ClassicArchitecture />
          ) : (
            <ArchitectureLayouts layout={layout} />
          )}
        </main>
      </div>
    </div>
  );
}
