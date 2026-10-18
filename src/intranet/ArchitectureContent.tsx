import { Archive20Regular, ChevronRight16Regular } from "@fluentui/react-icons";
import type { ReactNode } from "react";
import StaffLink from "../components/StaffLink";
import ArchitectureWorkspaceIcon from "./ArchitectureWorkspaceIcon";
import EnvironmentIcon from "../components/EnvironmentIcon";
import TeamsMark from "../components/TeamsMark";
import { departments } from "../coordination/data";
import { departmentPreviewHref } from "../teams/departmentPreview";
import { projectHref } from "../projects/data";
import AdminLogins from "./AdminLogins";
import HubHeadingIcon from "./HubHeadingIcon";
import { architectureDestinationById } from "./architectureDestinations";
import {
  architectureHubViews,
  architectureProjects,
  type ArchitectureHubView,
  type DirectoryDestination,
} from "./architectureModel";

export function ArchitectureDestinationLink({
  destination,
}: {
  destination: DirectoryDestination;
}) {
  const { type, label, href, description } = destination;
  const isWorkspace = !["wiki", "portal", "archive"].includes(type);
  return (
    <StaffLink
      className={`architecture-destination${type === "wiki" ? " architecture-destination-wide" : ""}`}
      href={href}
      data-environment={isWorkspace ? "workspace" : type}
      title={description}
      aria-label={description ? `${label}: ${description}` : undefined}
    >
      {type === "archive" ? (
        <Archive20Regular
          className="architecture-archive-icon"
          aria-hidden="true"
        />
      ) : type === "wiki" || type === "portal" ? (
        <EnvironmentIcon type={type} size={20} />
      ) : (
        <ArchitectureWorkspaceIcon />
      )}
      <span>{label}</span>
    </StaffLink>
  );
}

function DestinationGrid({
  destinations,
}: {
  destinations: DirectoryDestination[];
}) {
  return (
    <div className="architecture-destination-grid">
      {destinations.map((destination) => (
        <ArchitectureDestinationLink
          key={destination.id}
          destination={destination}
        />
      ))}
    </div>
  );
}

function HubPanel({ hub }: { hub: ArchitectureHubView }) {
  const heading = (
    <>
      <HubHeadingIcon hubId={hub.id} />
      <h2 id={`layout-hub-${hub.id}`}>{hub.label}</h2>
    </>
  );
  return (
    <section
      className={`architecture-panel architecture-tone-${hub.id}`}
      aria-labelledby={`layout-hub-${hub.id}`}
    >
      <header className="architecture-panel-heading">
        {hub.href ? <StaffLink href={hub.href}>{heading}</StaffLink> : heading}
      </header>
      <DestinationGrid
        destinations={[...hub.primary, ...hub.knowledge, ...hub.secondary]}
      />
      <AdminLogins hubId={hub.id} />
    </section>
  );
}

function JumpLink({
  href,
  icon,
  label,
  detail,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  detail: string;
}) {
  return (
    <StaffLink className="architecture-jump-link" href={href}>
      {icon}
      <span className="architecture-jump-copy">
        <span>{label}</span>
        <small>{detail}</small>
      </span>
      <ChevronRight16Regular aria-hidden="true" />
    </StaffLink>
  );
}

function ArchitectureJumpGroups() {
  return (
    <aside
      className="architecture-jump-groups"
      aria-labelledby="architecture-jump-title"
    >
      <h2 id="architecture-jump-title">Jump to…</h2>
      <section aria-labelledby="architecture-department-title">
        <p id="architecture-department-title">Meetings and coordination</p>
        {departments.map((department) => (
          <JumpLink
            key={department.id}
            href={departmentPreviewHref(department.id)}
            icon={<TeamsMark size={20} />}
            label={department.name}
            detail="Open channel"
          />
        ))}
      </section>
    </aside>
  );
}

function ArchitectureProjectStrip() {
  return (
    <section
      className="architecture-projects"
      aria-labelledby="architecture-project-title"
    >
      <p id="architecture-project-title">Project workspaces</p>
      <div className="architecture-project-strip">
        <StaffLink
          className="architecture-project-link architecture-portfolio"
          href={architectureDestinationById.get("projects")!.href}
        >
          <ArchitectureWorkspaceIcon />
          <span className="architecture-project-copy">
            <span>Portfolio</span>
            <small>Project management</small>
          </span>
        </StaffLink>
        {architectureProjects.map((project) => (
          <StaffLink
            className="architecture-project-link"
            key={project.code}
            href={projectHref(project)}
            title={`${project.name} (${project.code})`}
          >
            <ArchitectureWorkspaceIcon />
            <span className="architecture-project-copy">
              <span>{project.name}</span>
              <small>{project.code}</small>
            </span>
          </StaffLink>
        ))}
        <StaffLink
          className="architecture-all-projects"
          href="/projects/current"
        >
          See all
          <ChevronRight16Regular aria-hidden="true" />
        </StaffLink>
      </div>
    </section>
  );
}

export default function ArchitectureContent() {
  return (
    <div className="architecture-exploration">
      <div className="architecture-main">
        <div className="architecture-panels">
          {[
            architectureHubViews.slice(0, 2),
            architectureHubViews.slice(2),
          ].map((row) => (
            <div className="architecture-panel-row" key={row[0].id}>
              {row.map((hub) => (
                <HubPanel key={hub.id} hub={hub} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <ArchitectureJumpGroups />
      <ArchitectureProjectStrip />
    </div>
  );
}
