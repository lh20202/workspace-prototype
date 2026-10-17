import DemoInfo from "./DemoInfo";
import "./demo-info.css";

export const betaInfoText =
  "Still being tested. You may spot rough edges or things that change.";

/** State belongs to the complete demo, independently of the simulated products. */
export function BetaBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`beta-badge${compact ? " beta-badge-compact" : ""}`}>
      <span>{compact ? "BETA" : "BETA TEST"}</span>
      <DemoInfo label="About beta test">{betaInfoText}</DemoInfo>
    </span>
  );
}
export default BetaBadge;
