import {
  ArrowRight24Regular,
  Folder24Regular,
  PeopleTeam24Regular,
  Organization24Regular,
} from "@fluentui/react-icons";
import "./launcher.css";
const choices = [
  {
    title: "Organisational Planning & Reporting",
    href: "/planning",
    action: "Reference prototype",
    Icon: Folder24Regular,
  },
  {
    title: "Acquisition & Activation Logistics",
    href: "/logistics",
    action: "Reference prototype",
    Icon: PeopleTeam24Regular,
  },
  {
    title: "Full Architecture Proof of Concept",
    href: "/architecture",
    action: "Explore full architecture",
    Icon: Organization24Regular,
    exploratory: true,
  },
];
export default function Launcher() {
  return (
    <main className="prototype-launcher">
      <div className="launcher-content">
        <p className="launcher-eyebrow">Interactive workspace examples</p>
        <h1>Digital workspace design</h1>
        <div className="launcher-choices">
          {choices.map(({ title, href, action, Icon, exploratory }) => (
            <a href={href} key={href} className="launcher-choice">
              <Icon aria-hidden="true" />
              <div>
                <div className="launcher-choice-title">
                  <h2>{title}</h2>
                  {exploratory && (
                    <span className="exploratory-badge">EXPLORATORY</span>
                  )}
                </div>
                <span className="launcher-action">{action}</span>
              </div>
              <ArrowRight24Regular aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
