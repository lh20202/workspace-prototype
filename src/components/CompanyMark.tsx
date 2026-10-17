import "./company-mark.css";

/** Fictional organisation identity; Microsoft product identities stay separate. */
export default function CompanyMark() {
  return (
    <div className="site-mark company-mark" aria-hidden="true">
      <img src="/images/company-mark.png" alt="" width="48" height="48" />
    </div>
  );
}
