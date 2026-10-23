import { ArrowLeft20Regular, Toolbox24Regular } from "@fluentui/react-icons";
import type { MouseEvent } from "react";
import StaffLink from "../components/StaffLink";
import EnvironmentIcon from "../components/EnvironmentIcon";
import { getExternalEnvironment, type ExternalEnvironment } from "./catalog";
import { canReturnToReferrer, externalReturnHref } from "./previewRoutes";
import { LanguageToggle } from "../i18n/Language";
import "./external-preview.css";

export default function ExternalEnvironmentPreview({
  environmentId,
  environment,
}: {
  environmentId?: string;
  environment?: ExternalEnvironment;
}) {
  const destination =
    environment || getExternalEnvironment(environmentId || "");
  if (!destination) return null;
  const frontline = destination.variant === "frontline";
  const comingSoon = destination.variant === "coming-soon";
  const returnHref = externalReturnHref(
    typeof location === "undefined" ? "" : location.search,
    typeof document === "undefined" ? "" : document.referrer,
    typeof location === "undefined" ? undefined : location.origin,
  );
  const returnToPreviousPage = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      typeof window !== "undefined" &&
      window.history.length > 1 &&
      canReturnToReferrer(document.referrer, window.location.origin)
    ) {
      event.preventDefault();
      window.history.back();
    }
  };
  return (
    <main
      className={`external-preview external-preview-${destination.theme}${frontline ? " external-preview-frontline" : ""}`}
      data-environment={destination.id}
      aria-labelledby="external-environment-title"
    >
      <div className="external-preview-language">
        <LanguageToggle />
      </div>
      <div className="external-backdrop" aria-hidden="true">
        <div className="external-backdrop-masthead">
          <i />
          <div>
            <span />
            <span />
            <span />
          </div>
          <b />
        </div>
        <div className="external-backdrop-hero">
          <div className="external-backdrop-hero-copy">
            <span />
            <i />
            <i />
            <b />
          </div>
          <img src="/images/external/corporate-courtyard.jpg" alt="" />
        </div>
        <div className="external-backdrop-section">
          <div>
            <i />
            <span />
            <span />
          </div>
          <img src="/images/external/workplace-atrium.jpg" alt="" />
        </div>
        <div className="external-backdrop-colour">
          <i />
          <i />
          <i />
        </div>
      </div>
      <section className="external-preview-panel">
        {destination.logo ? (
          <img
            className="external-preview-logo"
            src={destination.logo}
            alt=""
            width="48"
            height="48"
          />
        ) : (
          <EnvironmentIcon type="portal" size={40} />
        )}
        <h1 id="external-environment-title">{destination.name}</h1>
        {frontline || comingSoon ? (
          <>
            <div className="external-coming-soon">
              <Toolbox24Regular aria-hidden="true" />
              <span>COMING SOON</span>
            </div>
            <p>
              {frontline
                ? "In development — a separate experience for frontline crew with the information and tools they need for day-to-day operations."
                : "A shared landing page for linked work tools is in development."}
            </p>
          </>
        ) : (
          <p>
            This linked environment is represented at a high level in this demo.
          </p>
        )}
        <StaffLink
          className="external-return"
          href={returnHref}
          onClick={returnToPreviousPage}
        >
          <ArrowLeft20Regular aria-hidden="true" />
          Back to demo
        </StaffLink>
      </section>
    </main>
  );
}
