import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import TeamIdentity, {
  workspaceTeamAccent,
  workspaceTeamPalette,
} from "./TeamIdentity";
import WorkspaceIcon from "../components/WorkspaceIcon";
import { staff } from "../intranet/catalog";
import { teamsGroups } from "./navigation";
import { departments } from "../coordination/data";
import { workspaceById } from "../workspaces/registry";

describe("parent Team environment identity", () => {
  it("uses the existing company mark rather than CU initials for Company Updates", () => {
    const html = renderToStaticMarkup(
      <TeamIdentity kind="company" id="company" />,
    );
    expect(html).toContain('src="/images/company-mark.png"');
    expect(html).not.toContain("workspace-icon");
    expect(html).not.toContain(">CU<");
  });

  it("retains the exact WorkspaceIcon geometry for workspace and project Teams", () => {
    const workspace = renderToStaticMarkup(<WorkspaceIcon size={26} />);
    for (const [kind, id] of [
      ["workspace", "digital"],
      ["project", "PRJ-2026-01"],
    ] as const) {
      const html = renderToStaticMarkup(<TeamIdentity kind={kind} id={id} />);
      expect(html).toContain(workspace);
      expect(html).toContain(`data-team-kind="${kind}"`);
      expect(html).not.toContain(">PR<");
    }
  });

  it("keeps Department and response identities separate from workspace marks", () => {
    for (const kind of ["department", "emergency"] as const) {
      const html = renderToStaticMarkup(
        <TeamIdentity kind={kind} id="sample" />,
      );
      expect(html).toContain(`team-identity-${kind}`);
      expect(html).not.toContain("workspace-icon");
      expect(html).not.toContain("company-mark.png");
    }
  });

  it("carries explicit parent identity through every role's actual sidebar groups", () => {
    for (const person of staff) {
      for (const group of teamsGroups(person)) {
        expect(group.kind, `${person.id}: ${group.id}`).toBeDefined();
        if (group.id === "company") expect(group.kind).toBe("company");
        else if (departments.some((department) => department.id === group.id))
          expect(group.kind).toBe("department");
        else if (group.id === "emergency") expect(group.kind).toBe("emergency");
        else if (group.id.startsWith("PRJ-"))
          expect(group.kind).toBe("project");
        else {
          expect(group.kind).toBe("workspace");
          expect(group.label).toBe(workspaceById.get(group.id)?.title);
        }
      }
    }
  });

  it("assigns a stable restrained accent by Team ID, independent of role and channel", () => {
    expect(workspaceTeamPalette).toHaveLength(8);
    for (const id of [
      "content",
      "logistics",
      "digital",
      "planning",
      "PRJ-2026-01",
    ]) {
      expect(workspaceTeamPalette).toContain(workspaceTeamAccent(id));
      expect(workspaceTeamAccent(id)).toBe(workspaceTeamAccent(id));
      expect(
        renderToStaticMarkup(<TeamIdentity kind="workspace" id={id} />),
      ).toContain(`--team-workspace-accent:${workspaceTeamAccent(id)}`);
    }
    expect(
      new Set(
        ["content", "logistics", "digital", "planning"].map(
          workspaceTeamAccent,
        ),
      ).size,
    ).toBeGreaterThan(2);
  });
});
