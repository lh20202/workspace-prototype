import { useEffect, lazy, Suspense } from "react";
const App = lazy(() => import("./App"));
import PrototypeNavigator from "./components/PrototypeNavigator";
const LogisticsApp = lazy(() => import("./logistics/LogisticsApp"));
const ContentApp = lazy(() => import("./content/ContentApp"));
const AudienceApp = lazy(() => import("./audience/AudienceApp"));
const ServicesApp = lazy(() => import("./services/ServicesApp"));
const AccessRequest = lazy(() => import("./service-desk/AccessRequest"));
import { pageTitle, prototypeForPath } from "./utils/routes";
import Directory from "./intranet/Directory";
const FinanceApp = lazy(() => import("./finance/FinanceApp"));
const TeamsPreview = lazy(() => import("./intranet/TeamsPreview"));
export default function AppRouter() {
  const prototype = prototypeForPath(location.pathname);
  useEffect(() => {
    document.title = pageTitle(location.pathname);
  }, [prototype]);
  if (prototype === "launcher") return <Directory />;
  return (
    <>
      <PrototypeNavigator
        active={prototype}
        teams={location.pathname.startsWith("/logistics/teams")}
      />
      <Suspense
        fallback={
          <div className="workspace-loading" role="status">
            Opening workspace…
          </div>
        }
      >
        {prototype === "finance" ? (
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
    </>
  );
}
