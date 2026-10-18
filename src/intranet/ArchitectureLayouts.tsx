import {
  Archive20Regular,
  ChevronRight16Regular,
  Open16Regular,
} from "@fluentui/react-icons";
import type { ReactNode } from "react";
import StaffLink from "../components/StaffLink";
import WorkspaceIcon from "../components/WorkspaceIcon";
import RestrictedWorkspaceIcon from "../components/RestrictedWorkspaceIcon";
import EnvironmentIcon from "../components/EnvironmentIcon";
import TeamsMark from "../components/TeamsMark";
import { departments } from "../coordination/data";
import { departmentPreviewHref } from "../teams/departmentPreview";
import { projectHref } from "../projects/data";
import AdminLogins from "./AdminLogins";
import ExternalBrandMark from "../components/ExternalBrandMark";
import { externalPreviewHref } from "../environments/catalog";
import HubHeadingIcon from "./HubHeadingIcon";
import { architectureDestinationById } from "./architectureDestinations";
import {
  architectureHubViews,
  architectureProjects,
  architectureTools,
  type ArchitectureHubView,
  type ArchitectureLayout,
  type LayoutDestination,
} from "./architectureLayoutModel";

export function ArchitectureDestinationLink({
  destination,
}: {
  destination: LayoutDestination;
}) {
  const { type, label, href, description } = destination;
  const controlled =
    destination.controlledMark ||
    destination.accessLevel === "strictly-confidential";
  const isWorkspace = !["wiki", "portal", "archive"].includes(type);
  return (
    <StaffLink
      className="architecture-destination"
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
      ) : controlled ? (
        <RestrictedWorkspaceIcon />
      ) : (
        <WorkspaceIcon size={20} />
      )}
      <span>{label}</span>
    </StaffLink>
  );
}

function DestinationGrid({
  destinations,
}: {
  destinations: LayoutDestination[];
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

function HubPanel({
  hub,
  workspacesOnly,
}: {
  hub: ArchitectureHubView;
  workspacesOnly: boolean;
}) {
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
      <div className="architecture-primary">
        <DestinationGrid destinations={hub.primary} />
        {!workspacesOnly && hub.knowledge.length > 0 && (
          <div className="architecture-knowledge">
            {hub.knowledge.map((destination) => (
              <ArchitectureDestinationLink
                key={destination.id}
                destination={destination}
              />
            ))}
          </div>
        )}
      </div>
      {!workspacesOnly && (
        <>
          <div
            className="architecture-secondary"
            aria-hidden={hub.secondary.length === 0 ? true : undefined}
          >
            <DestinationGrid destinations={hub.secondary} />
          </div>
          <AdminLogins hubId={hub.id} />
        </>
      )}
    </section>
  );
}

function SharedEnvironments() {
  return (
    <section
      className="architecture-shared-environments"
      aria-labelledby="architecture-knowledge-title"
    >
      <h2 id="architecture-knowledge-title">Knowledge & portals</h2>
      <DestinationGrid
        destinations={architectureHubViews.flatMap((hub) => [
          ...hub.knowledge,
          ...hub.secondary,
        ])}
      />
    </section>
  );
}

function SharedTools() {
  return (
    <section
      className="architecture-shared-tools"
      aria-labelledby="architecture-tools-title"
    >
      <h2 id="architecture-tools-title">Tools</h2>
      <div className="architecture-tools-list">
        {architectureTools.map(({ tool, description }) => (
          <StaffLink
            className="architecture-tool-link"
            key={tool.id}
            href={externalPreviewHref(tool.id)}
            data-brand={tool.id}
          >
            <ExternalBrandMark id={tool.id} size={20} />
            <span className="architecture-tool-copy">
              <span data-no-translate>{tool.name}</span>
              <small>{description}</small>
            </span>
            <Open16Regular aria-hidden="true" />
          </StaffLink>
        ))}
      </div>
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
    <aside className="architecture-jump-groups" aria-label="Jump to…">
      <section aria-labelledby="architecture-department-title">
        <h2 id="architecture-department-title">Jump to…</h2>
        <p>Meetings and coordination</p>
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
      <section aria-labelledby="architecture-project-title">
        <h2 id="architecture-project-title">Project workspaces</h2>
        {architectureProjects.map((project) => (
          <JumpLink
            key={project.code}
            href={projectHref(project)}
            icon={<WorkspaceIcon size={20} />}
            label={project.name}
            detail={project.code}
          />
        ))}
        <StaffLink
          className="architecture-all-projects"
          href={architectureDestinationById.get("projects")!.href}
        >
          All projects
          <ChevronRight16Regular aria-hidden="true" />
        </StaffLink>
      </section>
    </aside>
  );
}

export default function ArchitectureLayouts({
  layout,
}: {
  layout: Exclude<ArchitectureLayout, "classic">;
}) {
  const workspacesOnly = layout === "workspaces-first";
  return (
    <div className="architecture-exploration">
      <div className="architecture-layout-main">
        <div className="architecture-panels">
          {[
            architectureHubViews.slice(0, 2),
            architectureHubViews.slice(2),
          ].map((row) => (
            <div className="architecture-panel-row" key={row[0].id}>
              {row.map((hub) => (
                <HubPanel
                  key={hub.id}
                  hub={hub}
                  workspacesOnly={workspacesOnly}
                />
              ))}
            </div>
          ))}
        </div>
        {workspacesOnly && <SharedEnvironments />}
      </div>
      {workspacesOnly && <SharedTools />}
      <ArchitectureJumpGroups />
    </div>
  );
}
