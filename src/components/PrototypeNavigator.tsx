import { useEffect, useState } from "react";
export default function PrototypeNavigator({
  active,
  teams = false,
}: {
  active: "launcher" | "planning" | "logistics" | "service-desk";
  teams?: boolean;
}) {
  const [isTeams, setIsTeams] = useState(teams);
  useEffect(() => {
    const update = () =>
      setIsTeams(location.pathname.startsWith("/logistics/teams"));
    window.addEventListener("popstate", update);
    window.addEventListener("workspace:navigation", update);
    return () => {
      window.removeEventListener("popstate", update);
      window.removeEventListener("workspace:navigation", update);
    };
  }, []);
  return (
    <div className="demo-control-frame">
      <nav
        className="prototype-navigator demo-controls"
        aria-label="Demo controls"
      >
        <span>DEMO CONTROLS</span>
        <a href="/" aria-current={active === "launcher" ? "page" : undefined}>
          Workspace prototypes
        </a>
        <a
          href="/planning"
          aria-current={active === "planning" ? "page" : undefined}
        >
          Planning workspace
        </a>
        <a
          href="/logistics"
          aria-current={active === "logistics" ? "page" : undefined}
        >
          Campaign logistics workspace
        </a>
        {isTeams && <a href="/logistics">← Back to logistics workspace</a>}
      </nav>
    </div>
  );
}
