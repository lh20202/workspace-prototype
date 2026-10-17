import ExternalEnvironmentPreview from "../environments/ExternalEnvironmentPreview";

/** Existing governance URLs now share the Members Portal external boundary. */
export default function GovernanceApp() {
  return <ExternalEnvironmentPreview environmentId="members" />;
}
