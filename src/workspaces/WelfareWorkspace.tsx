import AccessLock from "../components/AccessLock";
import { useState } from "react";
import AccessBoundary from "../access/AccessBoundary";
import WorkspaceHeader from "../logistics/WorkspaceHeader";
import NavigationIcon from "../components/NavigationIcon";
import DocumentLibrary from "../sharepoint/DocumentLibrary";
import { resolveStaffPerson } from "../intranet/catalog";
import {
  canSeeWelfareArea,
  canSeeWelfareWorkspace,
  consultationArea,
  visibleWelfareAreas,
  welfareAreas,
  welfareConfig,
  welfareFilesForPerson,
  welfareHref,
  welfareTitle,
} from "./welfare";
import { functionalLibraries, functionalFileHref } from "./siteArchitecture";
import { workspaceDisplayName } from "./presentation";
import "../services/styles.css";
import "./styles.css";

/** Both route entry and every content collection use the same narrow memberships. */
export default function WelfareWorkspace() {
  const person = resolveStaffPerson(
    new URLSearchParams(location.search).get("staff"),
  );
  const routeParts = location.pathname.split("/").filter(Boolean);
  const page = routeParts[1] || "home";
  const member = canSeeWelfareWorkspace(person.id);
  const areas = visibleWelfareAreas(person.id);
  const area = welfareAreas.find((candidate) => candidate.id === page);
  const approved = page === consultationArea.id;
  const files = welfareFilesForPerson(person.id);
  const requestedFileId = new URLSearchParams(location.search).get("file");
  const requestedFile = welfareConfig.files.find(
    (file) => file.id === requestedFileId,
  );
  const deniedFile =
    !!requestedFileId && (!requestedFile || !files.includes(requestedFile));
  const authorisedPage =
    routeParts.length <= 2 &&
    (page === "home" || canSeeWelfareArea(person.id, page));
  // Only safe area labels cross a denied boundary; method names and payloads do not.
  const deniedArea =
    deniedFile && requestedFile
      ? welfareAreas.find((candidate) => candidate.id === requestedFile.area) ||
        (requestedFile.area === consultationArea.id
          ? consultationArea
          : undefined)
      : area || (approved ? consultationArea : undefined);
  const boundaryArea =
    deniedArea?.name ||
    (page === "home" ? welfareTitle : "Protected working material");
  const [notice, setNotice] = useState("");
  const href = (destination = "") =>
    `${welfareHref}${destination ? `/${destination}` : ""}?staff=${person.id}`;
  return (
    <div className="app-shell services-app functional-app welfare-app">
      <a className="skip-link" href="#welfare-main">
        Skip to workspace
      </a>
      <WorkspaceHeader
        title={workspaceDisplayName("welfare", welfareTitle, page)}
        userName={person.name}
        userRole={person.role}
        memberCount={2}
        searchFiles={files}
        onOpen={(file) =>
          location.assign(
            `${functionalFileHref(welfareConfig, file.id)}&staff=${person.id}`,
          )
        }
        onMessage={setNotice}
        helpText="Access is limited to authorised participants and remains separate for each protected area."
      />
      <div className="functional-layout">
        {member && (
          <aside className="sidebar services-sidebar">
            <nav aria-label="Welfare navigation">
              <a
                href={href()}
                aria-current={page === "home" ? "page" : undefined}
              >
                <NavigationIcon kind="home" />
                Home
              </a>
              {areas.map((item) => (
                <a
                  key={item.id}
                  href={href(item.id)}
                  aria-current={page === item.id ? "page" : undefined}
                >
                  <AccessLock />
                  {item.name}
                </a>
              ))}
              <a
                href={href(consultationArea.id)}
                aria-current={approved ? "page" : undefined}
              >
                <NavigationIcon kind="library" />
                {consultationArea.name}
              </a>
            </nav>
          </aside>
        )}
        <main className="services-main functional-main" id="welfare-main">
          {notice && (
            <p role="status" className="functional-notice">
              {notice}
              <button onClick={() => setNotice("")}>Dismiss</button>
            </p>
          )}
          {!member || !authorisedPage || deniedFile ? (
            <AccessBoundary
              workspaceId="welfare"
              resource={
                routeParts.length > 2
                  ? undefined
                  : page === "home" && !deniedFile
                    ? { kind: "workspace", workspaceId: "welfare" }
                    : {
                        kind: "area",
                        workspaceId: "welfare",
                        areaId: deniedArea?.id || page,
                      }
              }
              area={boundaryArea}
              personId={person.id}
              strict
              returnHref={member ? href() : "/architecture"}
              returnLabel={
                member ? "Return to workspace" : "Back to all workspaces"
              }
            />
          ) : page === "home" ? (
            <>
              <h1>{welfareTitle}</h1>
              <p className="functional-intro">Strictly confidential</p>
              <p>
                Working methods and aggregate coordination only. Individual
                support and representation records are not held in this
                demonstration.
              </p>
              <section>
                <h2>Your protected areas</h2>
                {areas.map((item) => (
                  <a
                    className="functional-work-row"
                    key={item.id}
                    href={href(item.id)}
                  >
                    <strong>{item.name}</strong>
                    <span>{item.summary}</span>
                  </a>
                ))}
              </section>
              <section>
                <h2>{consultationArea.name}</h2>
                <p>{consultationArea.summary}</p>
                <a href={href(consultationArea.id)}>Open approved outputs →</a>
              </section>
              <p className="muted">
                Employee representation has independent membership. Welfare
                participation does not grant access to internal representative
                work.
              </p>
            </>
          ) : (
            <>
              <div className="functional-breadcrumb">
                <a href={href()}>Workspace</a> /{" "}
                {approved ? consultationArea.name : area?.name}
              </div>
              <h1>{approved ? consultationArea.name : area?.name}</h1>
              <p className="functional-intro">
                {approved ? consultationArea.summary : area?.summary}
              </p>
              {page === "employee-representation" && (
                <p>
                  Independent employee representatives control this area.
                  Internal consultation preparation is not shared with welfare
                  or employment operations.
                </p>
              )}
              {!approved && (
                <section>
                  <h2>Coordination</h2>
                  {welfareConfig.items
                    .filter((item) => item.area === page)
                    .map((item) => (
                      <div className="functional-simple-row" key={item.id}>
                        <strong>{item.name}</strong>
                        <span>{item.nextAction}</span>
                      </div>
                    ))}
                </section>
              )}
              <DocumentLibrary
                key={`${person.id}:${page}`}
                title={approved ? consultationArea.name : area!.name}
                definition={functionalLibraries.welfare.find(
                  (library) => library.id === page,
                )}
                files={files.filter((file) => file.area === page)}
                readOnly
                headingLevel={2}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
