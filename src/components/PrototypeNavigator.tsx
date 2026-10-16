import { Warning16Regular } from "@fluentui/react-icons";
export default function PrototypeNavigator() {
  return (
    <div className="demo-control-frame">
      <nav
        className="prototype-navigator demo-controls"
        aria-label="Demo controls"
      >
        <span>DEMO CONTROLS</span>
        <a href="/">Back to all workspaces</a>
        <aside className="demo-caveat" aria-label="Demonstration caveat">
          <Warning16Regular aria-hidden="true" />
          <div>
            <strong>Fictional workspace titles</strong>
            <small>Not real site names</small>
          </div>
        </aside>
      </nav>
    </div>
  );
}
