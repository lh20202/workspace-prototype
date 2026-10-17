import type { AccessResource } from "./policy";
import WorkspaceHeader from "../logistics/WorkspaceHeader";
import AccessBoundary from "./AccessBoundary";
import { resolveStaffPerson } from "../intranet/catalog";
import { workspaceById } from "../workspaces/registry";

/** A workspace denial never renders working-file search, navigation or file metadata. */
export default function WorkspaceDenied({
  workspaceId,
  known = true,
  resource,
}: {
  workspaceId: string;
  known?: boolean;
  resource?: AccessResource;
}) {
  const person = resolveStaffPerson(
    new URLSearchParams(location.search).get("staff"),
  );
  const workspace = workspaceById.get(workspaceId)!;
  return (
    <div className="app-shell services-app functional-app">
      <WorkspaceHeader
        title={workspace.title}
        userName={person.name}
        userRole={person.role}
        searchFiles={[]}
        onOpen={() => {}}
        onMessage={() => {}}
      />
      <main className="services-main functional-main">
        <AccessBoundary
          workspaceId={workspaceId}
          area={workspace.title}
          personId={person.id}
          resource={
            known ? resource || { kind: "workspace", workspaceId } : undefined
          }
          returnHref="/architecture"
          returnLabel="Back to all workspaces"
        />
      </main>
    </div>
  );
}
