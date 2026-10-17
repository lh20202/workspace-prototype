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
const FunctionalApp = lazy(() => import("./workspaces/FunctionalApp"));
const FinanceApp = lazy(() => import("./finance/FinanceApp"));
const TeamsPreview = lazy(() => import("./intranet/TeamsPreview"));
const ExecutiveApp = lazy(() => import("./executive/ExecutiveApp"));
const GovernanceApp = lazy(() => import("./executive/GovernanceApp"));
const EmergencyApp = lazy(() => import("./executive/EmergencyApp"));
const WikiApp = lazy(() => import("./wiki/WikiApp"));
const FrontlineApp = lazy(() => import("./frontline/FrontlineApp"));
export default function AppRouter() {
  const prototype = prototypeForPath(location.pathname);
  const redirect = resolveLegacy(location.pathname);
  useEffect(() => {
    if (redirect) location.replace(redirect + location.search);
  }, [redirect]);
  useEffect(() => {
    document.title = pageTitle(location.pathname);
  }, [prototype]);
  if (redirect)
    return (
      <div className="workspace-loading" role="status">
        Opening the owning workspace…
      </div>
    );
  if (prototype === "launcher") return <Launcher />;
  if (prototype === "architecture") return <Directory />;
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
        ) : prototype === "frontline" ? (
          <FrontlineApp />
        ) : prototype === "projects" ? (
          <ProjectsApp />
        ) : prototype === "functional" ? (
          <FunctionalApp />
        ) : prototype === "executive" ? (
          <ExecutiveApp />
        ) : prototype === "governance" ? (
          <GovernanceApp />
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
