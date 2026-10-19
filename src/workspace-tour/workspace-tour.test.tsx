import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import WorkspaceTour from "./WorkspaceTour";
import { activityFiles, activityLibrary, activityChannels } from "./data";
import { queryLibrary } from "../sharepoint/library";
import { pageTitle, prototypeForPath } from "../utils/routes";
import { environmentRegistry } from "../workspaces/registry";
import { displayText } from "../i18n/displayText";

afterEach(() => vi.unstubAllGlobals());

function renderTour(path: string) {
  vi.stubGlobal("location", new URL(path, "https://example.test"));
  vi.stubGlobal("sessionStorage", { getItem: () => null, setItem: () => {} });
  vi.stubGlobal("localStorage", { getItem: () => "[]", setItem: () => {} });
  return renderToStaticMarkup(<WorkspaceTour />);
}

describe("Activity Workspace walkthrough", () => {
  it("routes the walkthrough independently and gives it a clear page title", () => {
    expect(prototypeForPath("/workspace-tour")).toBe("workspace-tour");
    expect(prototypeForPath("/workspace-tour/workspace/documents")).toBe(
      "workspace-tour",
    );
    expect(prototypeForPath("/workspace-tour/channels")).toBe("workspace-tour");
    expect(pageTitle("/workspace-tour")).toBe(
      "What is a workspace? | Digital Workspace demo site",
    );
    expect(pageTitle("/workspace-tour/channels")).toBe(
      "Channels | Activity Workspace",
    );
  });

  it("anchors the tour on the live directory while making its background inert", () => {
    const html = renderTour("/workspace-tour?staff=taylor&demo=standalone");
    expect(html).toContain("What is a workspace?");
    expect(html).toContain(
      "See how workspaces, files and channels fit together.",
    );
    expect(html).toContain(
      'class="workspace-tour-architecture-context" aria-hidden="true" inert=""',
    );
    expect(html).toContain("Activity Workspace");
    expect(html).toContain(
      'href="/workspace-tour/workspace?staff=taylor&amp;demo=standalone"',
    );
    expect(html).toContain(
      "During rollout, support will help update important links",
    );
    expect(html).not.toContain('href="/activity-workspace');
    expect(
      environmentRegistry.some((item) => item.id === "activity-workspace"),
    ).toBe(false);
  });

  it("reuses one canonical sample file set for the library, search and channel Shared view", () => {
    expect(activityFiles).toHaveLength(6);
    expect(
      queryLibrary(activityFiles, {
        folder: "",
        search: "weekly priorities",
        definition: activityLibrary,
      }).map((file) => file.id),
    ).toEqual(["activity-weekly-priorities"]);
    expect(activityChannels.map((channel) => channel.label)).toEqual([
      "Coordination",
      "Updates",
      "Review",
    ]);
    const shared = renderTour(
      "/workspace-tour/channels?channel=coordination&tab=Shared&staff=taylor",
    );
    expect(shared).toContain('class="workspace-tour-guide"');
    expect(shared).toContain("Document library");
    expect(shared).toContain("Columns");
    expect(shared).toContain("Owners");
    expect(shared).toContain("Metadata");
    expect(shared).toContain("Links out");
    expect(shared).toContain('aria-label="Channel list filters"');
    expect(shared).not.toContain('aria-label="Chat list filters"');
    expect(shared).toContain("Open all working documents");
    expect(shared).toContain("Weekly priorities.docx");
    expect(shared).toContain("Project summary.docx");
    expect(shared.replace(/<[^>]*>/g, "")).not.toMatch(
      /SharePoint|Microsoft|\bTeams\b|M365/,
    );
  });

  it("keeps the sample file view available regardless of the selected staff query", () => {
    const renderDocuments = (staff: string) =>
      renderTour(`/workspace-tour/workspace/documents?staff=${staff}`);
    for (const staff of ["taylor", "devon", "alex"]) {
      expect(renderDocuments(staff)).toContain("Weekly priorities.docx");
      expect(renderDocuments(staff)).toContain("Project brief template.docx");
      expect(renderDocuments(staff)).toContain("Completed work");
    }
  });

  it("opens a page guide beside the workspace with several clear topics", () => {
    const home = renderTour("/workspace-tour/workspace?staff=taylor");
    expect(home).toContain('class="workspace-tour-guide"');
    expect(home).toContain("Explore this page");
    expect(home).toContain("Choose a label to see what each part does.");
    expect(home).toContain("Recent files");
    expect(home).toContain("Channels");
    expect(home).toContain("workspace-tour-guide-detail");
    expect(home).toContain('data-tour-target="workspace-navigation"');

    const library = renderTour(
      "/workspace-tour/workspace/documents?staff=taylor",
    );
    expect(library).toContain("Document library");
    expect(library).toContain("Columns");
    expect(library).toContain("Owners");
    expect(library).toContain("Metadata");
    expect(library).toContain("Links out");
    expect(library).toContain('data-tour-target="library-columns"');
    expect(library).toContain('data-tour-target="library-owner"');
    expect(library).toContain("Read only");
    expect(library).not.toContain('aria-label="About Working documents"');
  });

  it("provides a complete human German rendering for the new tour copy", () => {
    for (const [source, german] of [
      ["What is a workspace?", "Was ist ein Arbeitsbereich?"],
      [
        "See how workspaces, files and channels fit together.",
        "Erfahren Sie, wie Arbeitsbereiche, Dateien und Channels zusammengehören.",
      ],
      [
        "You can find all workspaces directly from the intranet.",
        "Alle Arbeitsbereiche finden Sie direkt im Intranet.",
      ],
      [
        "Channels are for conversations and coordination; the shared files stay in the workspace.",
        "Channels dienen dem Austausch und der Abstimmung. Die gemeinsamen Dateien bleiben im Arbeitsbereich.",
      ],
      [
        "Open a file’s details to check its owner, status and sensitivity.",
        "Öffnen Sie die Dateidetails, um Zuständigkeit, Status und Vertraulichkeit zu prüfen.",
      ],
    ]) {
      expect(displayText(source, "de"), source).toBe(german);
      expect(displayText(source, "en"), source).toBe(source);
    }
  });
});
