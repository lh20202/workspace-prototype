import { useEffect, lazy, Suspense } from "react";
const ProjectsApp = lazy(() => import("./projects/ProjectsApp"));
const App = lazy(() => import("./App"));
import PrototypeNavigator from "./components/PrototypeNavigator";
const LogisticsApp = lazy(() => import("./logistics/LogisticsApp"));
const ContentApp = lazy(() => import("./content/ContentApp"));
const AudienceApp = lazy(() => import("./audience/AudienceApp"));
const ServicesApp = lazy(() => import("./services/ServicesApp"));
const AccessRequest = lazy(() => import("./service-desk/AccessRequest"));
import { pageTitle, prototypeForPath } from "./utils/routes";
import Directory from "./intranet/Directory";
import Launcher from "./intranet/Launcher";
import { resolveLegacy } from "./workspaces/registry";
import { publishingLegacyHref } from "./workspaces/publishingRetirement";
import ExternalEnvironmentPreview from "./environments/ExternalEnvironmentPreview";
import { externalPreviewForPath } from "./environments/previewRoutes";
const FunctionalApp = lazy(() => import("./workspaces/FunctionalApp"));
const FinanceApp = lazy(() => import("./finance/FinanceApp"));
const TeamsPreview = lazy(() => import("./intranet/TeamsPreview"));
const ExecutiveApp = lazy(() => import("./executive/ExecutiveApp"));
const EmergencyApp = lazy(() => import("./executive/EmergencyApp"));
const WikiApp = lazy(() => import("./wiki/WikiApp"));
const SiteAdministrationPage = lazy(
  () => import("./administration/SiteAdministrationPage"),
);
const WorkspaceTour = lazy(() => import("./workspace-tour/WorkspaceTour"));
import { siteAdministrationPage } from "./administration/routes";
import { defaultPreviewRoleId } from "./access/policy";
export default function AppRouter() {
  const prototype = prototypeForPath(location.pathname);
  const external = externalPreviewForPath(location.pathname);
  const oldRoute = resolveLegacy(location.pathname);
  const redirect =
    publishingLegacyHref(location.pathname, location.search) ||
    (oldRoute ? oldRoute + location.search : undefined);
  const legacyDemoView =
    new URLSearchParams(location.search).get("staff") === "aaa";
  useEffect(() => {
    if (redirect) location.replace(redirect);
  }, [redirect]);
  useEffect(() => {
    if (!legacyDemoView || redirect) return;
    const params = new URLSearchParams(location.search);
    params.set("staff", defaultPreviewRoleId);
    params.delete("demoReveal");
    location.replace(
      `${location.pathname}?${params.toString()}${location.hash}`,
    );
  }, [legacyDemoView, redirect]);
  useEffect(() => {
    document.title = pageTitle(location.pathname);
  }, [prototype]);
  if (redirect || legacyDemoView)
    return (
      <div className="workspace-loading" role="status">
        Opening the owning workspace…
      </div>
    );
  if (prototype === "launcher") return <Launcher />;
  if (prototype === "architecture") return <Directory />;
  if (prototype === "workspace-tour")
    return (
      <div className="prototype-frame workspace-tour-frame">
        <PrototypeNavigator allowWelcomeInvitation={false} />
        <Suspense
          fallback={
            <div className="workspace-loading" role="status">
              Opening the workspace tour…
            </div>
          }
        >
          <WorkspaceTour />
        </Suspense>
      </div>
    );
  if (siteAdministrationPage(location.search))
    return (
      <Suspense fallback={<div role="status">Opening settings…</div>}>
        <SiteAdministrationPage />
      </Suspense>
    );
  if (external)
    return (
      <div className="prototype-frame external-preview-frame">
        <PrototypeNavigator allowWelcomeInvitation={false} />
        <ExternalEnvironmentPreview environment={external} />
      </div>
    );
  return (
    <div className="prototype-frame">
      <PrototypeNavigator />
      <Suspense
        fallback={
          <div className="workspace-loading" role="status">
            Opening workspace…
          </div>
        }
      >
        {prototype === "wiki" ? (
          <WikiApp />
        ) : prototype === "projects" ? (
          <ProjectsApp />
        ) : prototype === "functional" ? (
          <FunctionalApp />
        ) : prototype === "executive" ? (
          <ExecutiveApp />
        ) : prototype === "emergency" ? (
          <EmergencyApp />
        ) : prototype === "finance" ? (
          <FinanceApp />
        ) : prototype === "teams" ? (
          <TeamsPreview />
        ) : prototype === "content" ? (
          <ContentApp />
        ) : prototype === "audience" ? (
          <AudienceApp />
        ) : prototype === "services" ? (
          <ServicesApp />
        ) : prototype === "service-desk" ? (
          <AccessRequest />
        ) : prototype === "planning" ? (
          <App />
        ) : (
          <LogisticsApp />
        )}
      </Suspense>
    </div>
  );
}
