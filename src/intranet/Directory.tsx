import PrototypeNavigator from "../components/PrototypeNavigator";
import { PocPreviewControls } from "../components/PocAnnotation";
import EnvironmentIcon from "../components/EnvironmentIcon";
import StaffLink from "../components/StaffLink";
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
  PersonBriefcase24Regular,
  Building24Regular,
  Organization24Regular,
  Heart24Regular,
  LockClosed16Regular,
  BookOpen24Regular,
  Megaphone24Regular,
  CalendarMonth24Regular,
} from "@fluentui/react-icons";
import { resolveStaffPerson } from "./catalog";
import { architectureSections, hubById } from "../workspaces/registry";
import {
  architectureDestinationById,
  destinationsForHub,
  personnelDestinations,
  type ArchitectureDestination,
} from "./architectureDestinations";
import "./styles.css";
import "./launcher.css";
import { departments, departmentHref } from "../coordination/data";
import "../coordination/styles.css";
import "../executive/styles.css";
import "../workspaces/styles.css";
import "./architecture-hubs.css";
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
  employment: PersonBriefcase24Regular,
  welfare: Heart24Regular,
  publishing: DesignIdeas24Regular,
  workforce: Organization24Regular,
  leadership: PeopleTeam24Regular,
  learning: BookOpen24Regular,
  communications: Megaphone24Regular,
  reward: Money24Regular,
  communities: CalendarMonth24Regular,
};
const hubIcons: Record<string, typeof Code24Regular> = {
  organisation: Organization24Regular,
  infrastructure: Building24Regular,
  personnel: PeopleTeam24Regular,
};
function DestinationTile({
  destination,
  single = false,
  nested = false,
}: {
  destination: ArchitectureDestination;
  single?: boolean;
  nested?: boolean;
}) {
  const Icon =
    workspaceIcons[destination.id] ||
    workspaceIcons[destination.icon] ||
    Organization24Regular;
  const Heading = single ? "h2" : nested ? "h4" : "h3";
  return (
    <StaffLink
      className={`directory-tile${single ? " directory-single-workspace" : ""}`}
      href={destination.href}
    >
      <span className="directory-tile-icon" aria-hidden="true">
        <Icon />
      </span>
      <div>
        <Heading>
          {destination.label}
          {destination.accessLevel === "strictly-confidential" && (
            <span
              className="directory-confidential"
              role="img"
              aria-label="Strictly confidential"
              title="Strictly confidential"
            >
              <LockClosed16Regular aria-hidden="true" />
            </span>
          )}
        </Heading>
      </div>
      <span className="directory-open" aria-hidden="true">
        <ArrowRight20Regular />
      </span>
    </StaffLink>
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
                      className="directory-functional-area"
                      aria-label={destination.label}
                      key={destination.id}
                    >
                      <DestinationTile destination={destination} single />
                    </section>
                  );
                }
                const hub = hubById.get(section.id)!;
                const Icon = hubIcons[hub.icon];
                return (
                  <section
                    className={`directory-hub directory-hub-${hub.id}`}
                    aria-labelledby={`hub-${hub.id}`}
                    key={hub.id}
                  >
                    <header className="directory-hub-heading">
                      <span className="directory-hub-icon" aria-hidden="true">
                        <Icon />
                      </span>
                      <div>
                        <h2 id={`hub-${hub.id}`}>{hub.name}</h2>
                        {hub.description && <p>{hub.description}</p>}
                      </div>
                    </header>
                    {hub.id === "personnel" ? (
                      <div className="directory-personnel-sections">
                        <div
                          className="directory-personnel-normal"
                          role="group"
                          aria-labelledby="personnel-normal"
                        >
                          <h3
                            className="directory-subheading"
                            id="personnel-normal"
                          >
                            People & organisation
                          </h3>
                          <div className="directory-hub-grid">
                            {personnelDestinations.normal.map((destination) => (
                              <DestinationTile
                                destination={destination}
                                key={destination.id}
                                nested
                              />
                            ))}
                          </div>
                        </div>
                        <div
                          className="directory-personnel-controlled"
                          role="group"
                          aria-labelledby="personnel-controlled"
                        >
                          <h3
                            className="directory-subheading"
                            id="personnel-controlled"
                          >
                            Controlled environments
                          </h3>
                          <div className="directory-hub-grid">
                            {personnelDestinations.controlled.map(
                              (destination) => (
                                <DestinationTile
                                  destination={destination}
                                  key={destination.id}
                                  nested
                                />
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="directory-hub-grid">
                        {destinationsForHub(hub.id)
                          .filter(
                            (destination) =>
                              !["wiki", "portal"].includes(destination.type),
                          )
                          .map((destination) => (
                            <DestinationTile
                              destination={destination}
                              key={destination.id}
                            />
                          ))}
                      </div>
                    )}
                    {destinationsForHub(hub.id).some((environment) =>
                      ["wiki", "portal"].includes(environment.type),
                    ) && (
                      <div
                        className="directory-knowledge"
                        aria-label="Knowledge & frontline"
                      >
                        {destinationsForHub(hub.id)
                          .filter((environment) =>
                            ["wiki", "portal"].includes(environment.type),
                          )
                          .map((environment) => (
                            <StaffLink
                              key={environment.id}
                              href={environment.href}
                            >
                              <EnvironmentIcon
                                type={environment.type as "wiki" | "portal"}
                              />
                              <span>{environment.label}</span>
                              <ArrowRight20Regular aria-hidden="true" />
                            </StaffLink>
                          ))}
                      </div>
                    )}
                  </section>
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
                  <StaffLink
                    className="department-quick-link"
                    key={d.id}
                    href={departmentHref(person.id, d.id)}
                  >
                    <Icon />
                    <span>
                      {d.name}
                      <small>
                        <img src="/images/teams-logo.svg" alt="Teams" />
                        <span className="department-open-label">
                          Open in Teams
                        </span>
                      </small>
                    </span>
                    <ChevronRight16Regular />
                  </StaffLink>
                );
              })}
            </aside>
          </div>
        </main>
      </div>
      <PocPreviewControls title="Teams preview" className="directory-teams">
        <img src="/images/teams-logo.svg" alt="Microsoft Teams" />
        <span className="directory-teams-context">
          Your work, connected in Teams
        </span>
        <StaffLink href={`/teams?staff=${person.id}`}>
          Open Teams view <ArrowRight20Regular />
        </StaffLink>
      </PocPreviewControls>
    </div>
  );
}
