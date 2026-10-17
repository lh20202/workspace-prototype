import {
  Button,
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
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
  workspaceFAQGroups,
  workspaceFAQExampleHref,
} from "./workspaceFAQContent";
import "./workspace-faq.css";

export function WorkspaceFAQContent() {
  return (
    <>
      {workspaceFAQGroups.map((group) => (
        <section
          className="workspace-faq-group"
          aria-labelledby={`faq-group-${group.id}`}
          key={group.id}
        >
          <h3 id={`faq-group-${group.id}`}>{group.title}</h3>
          <Accordion
            collapsible
            multiple
            defaultOpenItems={[]}
            className="workspace-faq-accordion"
          >
            {group.questions.map(({ id, question, answer }) => (
              <AccordionItem
                value={id}
                key={id}
                className="workspace-faq-question"
                data-faq-id={id}
              >
                <AccordionHeader as="h4" size="small" expandIconPosition="end">
                  {question}
                </AccordionHeader>
                <AccordionPanel className="workspace-faq-answer">
                  <p>{answer}</p>
                  {id === "personal-drive-shared" && (
                    <WorkspaceFAQExample href={workspaceFAQExampleHref} />
                  )}
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
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
          <DialogTitle className="workspace-faq-title">
            Workspace FAQ
          </DialogTitle>
          <DialogContent className="workspace-faq-scroll">
            <WorkspaceFAQContent />
          </DialogContent>
          <DialogActions className="workspace-faq-footer">
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="primary">Close</Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
