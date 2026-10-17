import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
} from "@fluentui/react-components";
import { QuestionCircle16Regular } from "@fluentui/react-icons";
import WorkspaceFAQExample from "./WorkspaceFAQExample";
import {
  workspaceFAQQuestions,
  workspaceFAQExampleHref,
  workspaceFAQAutomationNote,
} from "./workspaceFAQContent";
import "./workspace-faq.css";

export function WorkspaceFAQContent() {
  return (
    <>
      {workspaceFAQQuestions.map(({ question, answer }, index) => (
        <section className="workspace-faq-question" key={question}>
          <h3>{question}</h3>
          <p>{answer}</p>
          {index === 1 && (
            <>
              <WorkspaceFAQExample href={workspaceFAQExampleHref} />
              <details className="workspace-faq-automation">
                <summary>Could this be automated?</summary>
                <p>{workspaceFAQAutomationNote}</p>
              </details>
            </>
          )}
        </section>
      ))}
    </>
  );
}

/** One accessible on-demand FAQ, shared by Welcome and the outer demo controls. */
export default function WorkspaceFAQ() {
  return (
    <Dialog>
      <DialogTrigger disableButtonEnhancement>
        <button
          type="button"
          className="workspace-faq-link"
          aria-haspopup="dialog"
        >
          <QuestionCircle16Regular aria-hidden="true" />
          Workspace FAQ
        </button>
      </DialogTrigger>
      <DialogSurface className="workspace-faq-dialog">
        <DialogBody className="workspace-faq-dialog-body">
          <DialogTitle>Workspace FAQ</DialogTitle>
          <DialogContent>
            <WorkspaceFAQContent />
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="primary">Close</Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
