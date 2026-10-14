export default function PrototypeNavigator({
  active,
}: {
  active: "planning" | "logistics";
}) {
  return (
    <nav className="prototype-navigator" aria-label="Prototype navigator">
      <span>PROTOTYPE NAVIGATOR</span>
      <a href="/">Prototype home</a>
      <a
        href="/planning"
        aria-current={active === "planning" ? "page" : undefined}
      >
        Organisational Planning & Reporting
      </a>
      <a
        href="/logistics"
        aria-current={active === "logistics" ? "page" : undefined}
      >
        Street & Telephone Campaign Logistics
      </a>
    </nav>
  );
}
