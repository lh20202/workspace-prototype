import { lazy, Suspense, useId, useState } from "react";
import { ChevronDown16Regular } from "@fluentui/react-icons";
import StaffLink from "./StaffLink";
import { workspaceFAQExampleNote } from "./workspaceFAQContent";

const WorkspaceFAQThread = lazy(() => import("./WorkspaceFAQThread"));

export default function WorkspaceFAQExample({ href }: { href: string }) {
  const [expanded, setExpanded] = useState(false);
  const exampleId = useId();
  return (
    <>
      <button
        type="button"
        className="workspace-faq-example"
        aria-expanded={expanded}
        aria-controls={exampleId}
        onClick={() => setExpanded(!expanded)}
      >
        See an example
        <ChevronDown16Regular aria-hidden="true" />
      </button>
      <div id={exampleId} hidden={!expanded}>
        {expanded && (
          <>
            <p className="workspace-faq-example-note">
              {workspaceFAQExampleNote}
            </p>
            <Suspense fallback={<p role="status">Loading channel exchange…</p>}>
              <WorkspaceFAQThread />
            </Suspense>
            <StaffLink className="workspace-faq-full-demo" href={href}>
              Go to full channel demo <span aria-hidden="true">→</span>
            </StaffLink>
          </>
        )}
      </div>
    </>
  );
}
