import { Warning16Regular } from "@fluentui/react-icons";
import "./onedrive-source-note.css";

/** Attachment provenance, separate from the human conversation beneath it. */
export default function OneDriveSourceNote() {
  return (
    <small className="teams-source-note">
      <Warning16Regular aria-hidden="true" />
      <span>OneDrive source · access may be limited</span>
    </small>
  );
}
