import PrototypeNavigator from "../components/PrototypeNavigator";
import EnvironmentIcon from "../components/EnvironmentIcon";
import WorkspaceIcon from "../components/WorkspaceIcon";
import AccessLock from "../components/AccessLock";
import TeamsMark from "../components/TeamsMark";
import StaffLink from "../components/StaffLink";
import {
  ArrowRight20Regular,
  GridDots24Regular,
  ChevronRight16Regular,
  Organization24Regular,
} from "@fluentui/react-icons";
import { resolveStaffPerson } from "./catalog";
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
import { departments, departmentHref } from "../coordination/data";
import "../coordination/styles.css";
import "../executive/styles.css";
import "../workspaces/styles.css";
import "./architecture-hubs.css";

function DestinationTile({
  destination,
}: {
  destination: ArchitectureDestination;
}) {
  return (
    <StaffLink
      className="directory-tile"
      href={destination.href}
      data-environment="workspace"
    >
      <WorkspaceIcon />
      <h3>
        {destination.label}
        {destination.accessLevel === "strictly-confidential" && (
          <AccessLock className="directory-confidential" />
        )}
      </h3>
      <ArrowRight20Regular className="directory-row-arrow" aria-hidden="true" />
    </StaffLink>
  );
}

function WorkspaceGroup({ label, ids }: { label: string; ids: string[] }) {
  return (
    <div className="directory-workspace-group">
      <h3 className="directory-subheading">{label}</h3>
      <div className="directory-hub-grid">
        {ids.map((id) => (
          <DestinationTile
            key={id}
            destination={architectureDestinationById.get(id)!}
          />
        ))}
      </div>
    </div>
  );
}

export default function Directory() {
  const person = resolveStaffPerson(
    new URLSearchParams(location.search).get("staff"),
  );
  return (
    <div className="architecture-poc-page">
      <PrototypeNavigator />
      <div className="intranet-directory">
        <header className="directory-brand">
          <GridDots24Regular aria-hidden="true" />
          <strong>SharePoint</strong>
          <span className="directory-brand-end">Company intranet</span>
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
          <strong>Our workplace</strong>
          {["Home", "News", "Our organisation", "Tools & support"].map((x) => (
            <button type="button" key={x} disabled>
              {x}
            </button>
          ))}
          <StaffLink href="/architecture" aria-current="page">
            Digital Workspaces
          </StaffLink>
        </nav>
        <main className="directory-main">
          <div className="directory-heading">
            <div>
              <h1>Digital workspaces</h1>
              <p>Find the shared space for your work.</p>
            </div>
          </div>
          <div className="directory-content">
            <div className="directory-groups">
              {architectureSections.map((section) => {
                if (section.type === "workspace") {
                  const destination = architectureDestinationById.get(
                    section.id,
                  )!;
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
                          <WorkspaceIcon size={32} />
                          <h2 id="hub-finance">{destination.label}</h2>
                          <AccessLock className="directory-confidential" />
                          <ArrowRight20Regular aria-hidden="true" />
                        </StaffLink>
                      </header>
                      <div className="directory-finance-jumps">
                        <h3 className="directory-subheading">Jump to</h3>
                        <div>
                          {financeJumpLinks.map((link) => (
                            <StaffLink href={link.href} key={link.href}>
                              {link.label}
                              <ChevronRight16Regular aria-hidden="true" />
                            </StaffLink>
                          ))}
                        </div>
                      </div>
                      <AdminLogins hubId="finance" />
                    </section>
                  );
                }
                const hub = hubById.get(section.id)!;
                const environments = destinationsForHub(hub.id);
                return (
                  <section
                    className={`directory-hub directory-hub-${hub.id}`}
                    aria-labelledby={`hub-${hub.id}`}
                    key={hub.id}
                  >
                    <header className="directory-hub-heading">
                      <span className="directory-hub-icon" aria-hidden="true">
                        <Organization24Regular />
                      </span>
                      <h2 id={`hub-${hub.id}`}>{hub.name}</h2>
                    </header>
                    {hub.id === "infrastructure" ? (
                      <div className="directory-org-groups">
                        {orgCentralGroups.map((group) => (
                          <WorkspaceGroup
                            key={group.label}
                            label={group.label}
                            ids={group.ids}
                          />
                        ))}
                      </div>
                    ) : hub.id === "personnel" ? (
                      <>
                        <div className="directory-hub-grid">
                          {personnelDestinations.normal.map((destination) => (
                            <DestinationTile
                              destination={destination}
                              key={destination.id}
                            />
                          ))}
                        </div>
                        <div className="directory-controlled-links">
                          {personnelDestinations.controlled.map(
                            (destination) => (
                              <StaffLink
                                href={destination.href}
                                key={destination.id}
                              >
                                <AccessLock className="directory-confidential" />
                                <span>{destination.label}</span>
                                <ChevronRight16Regular aria-hidden="true" />
                              </StaffLink>
                            ),
                          )}
                        </div>
                      </>
                    ) : (
                      <WorkspaceGroup
                        label="Workspaces"
                        ids={environments
                          .filter(
                            (destination) => destination.type === "workspace",
                          )
                          .map(({ id }) => id)}
                      />
                    )}
                    {environments.some((environment) =>
                      ["wiki", "portal"].includes(environment.type),
                    ) && (
                      <div
                        className="directory-knowledge"
                        aria-label="Knowledge & external environments"
                      >
                        {environments
                          .filter((environment) =>
                            ["wiki", "portal"].includes(environment.type),
                          )
                          .map((environment) => (
                            <StaffLink
                              key={environment.id}
                              href={environment.href}
                              data-environment={environment.type}
                            >
                              <EnvironmentIcon
                                type={environment.type as "wiki" | "portal"}
                                size={26}
                              />
                              <span>{environment.label}</span>
                              <ArrowRight20Regular aria-hidden="true" />
                            </StaffLink>
                          ))}
                      </div>
                    )}
                    <AdminLogins hubId={hub.id} />
                  </section>
                );
              })}
            </div>
            <aside
              className="directory-coordination"
              aria-label="Department Teams"
            >
              <h2>
                <TeamsMark size={26} />
                Department Teams
              </h2>
              <p>Local meetings, planning and team coordination.</p>
              {departments.map((department) => (
                <StaffLink
                  className="department-quick-link"
                  key={department.id}
                  href={departmentHref(person.id, department.id)}
                >
                  <span>
                    {department.name}
                    <small>
                      <span className="department-open-label">
                        <TeamsMark size={12} /> Open in Teams
                      </span>
                    </small>
                  </span>
                  <ChevronRight16Regular aria-hidden="true" />
                </StaffLink>
              ))}
              <StaffLink
                className="directory-my-teams"
                href={`/teams?staff=${person.id}`}
              >
                <TeamsMark size={19} />
                Open my Teams
                <ArrowRight20Regular aria-hidden="true" />
              </StaffLink>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
