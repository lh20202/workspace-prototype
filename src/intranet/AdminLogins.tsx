import { Open16Regular } from "@fluentui/react-icons";
import {
  adminPlatformsForHub,
  externalPreviewHref,
  type AdminHubId,
} from "../environments/catalog";
import ExternalBrandMark from "../components/ExternalBrandMark";
import StaffLink from "../components/StaffLink";
import "./admin-logins.css";

/** Product links remain subordinate to the functional environments in each hub. */
export default function AdminLogins({ hubId }: { hubId: AdminHubId }) {
  const entries = adminPlatformsForHub(hubId);
  return (
    <section
      className="directory-admin-logins"
      aria-labelledby={`admin-logins-${hubId}`}
    >
      <h3 id={`admin-logins-${hubId}`}>Tools</h3>
      <div className="directory-admin-list">
        {entries.map((entry) => (
          <StaffLink
            key={entry.id}
            href={externalPreviewHref(entry.id)}
            title={entry.category}
            data-brand={entry.id}
          >
            <ExternalBrandMark id={entry.id} />
            <span data-no-translate>{entry.name}</span>
            <Open16Regular aria-hidden="true" />
          </StaffLink>
        ))}
      </div>
    </section>
  );
}
