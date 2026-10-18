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
  architectureToolsForHub,
  destinationDescriptions,
  type ArchitectureHubView,
  type ArchitectureLayout,
  type LayoutDestination,
} from "./architectureLayoutModel";

export function ArchitectureDestinationLink({
  destination,
  detailed = false,
}: {
  destination: LayoutDestination;
  detailed?: boolean;
}) {
  const { type, label, href, description } = destination;
  const controlled =
    destination.controlledMark ||
    destination.accessLevel === "strictly-confidential";
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
      ) : controlled ? (
        <RestrictedWorkspaceIcon />
      ) : (
        <WorkspaceIcon size={20} />
      )}
      <span>{label}</span>
      {detailed && (
        <span className="architecture-destination-description">
          {destinationDescriptions[destination.id]}
        </span>
      )}
    </StaffLink>
  );
}

function DestinationGrid({
  destinations,
  detailed,
}: {
  destinations: LayoutDestination[];
  detailed: boolean;
}) {
  return (
    <div className="architecture-destination-grid">
      {destinations.map((destination) => (
        <ArchitectureDestinationLink
          key={destination.id}
          destination={destination}
          detailed={detailed}
        />
      ))}
    </div>
  );
}

function HubPanel({
  hub,
  layout,
}: {
  hub: ArchitectureHubView;
  layout: ArchitectureLayout;
}) {
  const detailed = layout === "directory";
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
        detailed={detailed}
      />
      {layout === "classic" && <AdminLogins hubId={hub.id} />}
      {detailed && (
        <section
          className="architecture-panel-tools"
          aria-labelledby={`layout-tools-${hub.id}`}
        >
          <h3 id={`layout-tools-${hub.id}`}>Tools</h3>
          {architectureToolsForHub(hub.id).map((entry) => (
            <ToolLink key={entry.tool.id} {...entry} detailed />
          ))}
        </section>
      )}
    </section>
  );
}

function ToolLink({
  tool,
  description,
  detailed = false,
}: (typeof architectureTools)[number] & { detailed?: boolean }) {
  return (
    <StaffLink
      className={`architecture-tool-link${detailed ? " architecture-tool-detailed" : ""}`}
      href={externalPreviewHref(tool.id)}
      data-brand={tool.id}
    >
      <ExternalBrandMark id={tool.id} size={20} />
      {detailed ? (
        <>
          <span data-no-translate>{tool.name}</span>
          <span className="architecture-destination-description">
            {description}
          </span>
        </>
      ) : (
        <>
          <span className="architecture-tool-copy">
            <span data-no-translate>{tool.name}</span>
            <small>{description}</small>
          </span>
          <Open16Regular aria-hidden="true" />
        </>
      )}
    </StaffLink>
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
        {architectureTools.map((entry) => (
          <ToolLink key={entry.tool.id} {...entry} />
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
      <section aria-labelledby="architecture-project-title">
        <p id="architecture-project-title">Project workspaces</p>
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
  layout: ArchitectureLayout;
}) {
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
                <HubPanel key={hub.id} hub={hub} layout={layout} />
              ))}
            </div>
          ))}
        </div>
      </div>
      {layout === "workspaces-first" && <SharedTools />}
      <ArchitectureJumpGroups />
    </div>
  );
}
