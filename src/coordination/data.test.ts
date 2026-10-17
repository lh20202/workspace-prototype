import { describe, it, expect } from "vitest";
import {
  departments,
  departmentFolders,
  unitFolders,
  canOpenDepartment,
  canOpenUnit,
  accessibleFiles,
  searchCoordination,
  departmentHref,
} from "./data";
import { staff, peopleDirectory, workspaces } from "../intranet/catalog";
import { germanTeamsDepartments } from "../i18n/de-teams-departments";
import { configById, functionalConfigs } from "../workspaces/config";
import { functionalFileHref } from "../workspaces/siteArchitecture";
import { files as contentFiles, filesById } from "../content/data";
import { libraryFor } from "../content/libraries";
import {
  documents,
  departments as planningDepartments,
} from "../data/workspace";
const maya = staff.find((p) => p.id === "maya")!,
  jamie = staff.find((p) => p.id === "jamie")!,
  robin = staff.find((p) => p.id === "robin")!;
const marketing = departments[0],
  finance = departments[2];
describe("department coordination architecture", () => {
  it("has exactly six departments, 33 units and no additional business workspaces", () => {
    expect(departments.map((d) => d.fullName)).toEqual([
      "MCG Department",
      "CPA Department",
      "FCS Department",
      "STT Department",
      "PAC Department",
      "EAO Department",
    ]);
    expect(departments.reduce((n, d) => n + d.units.length, 0)).toBe(33);
    expect(workspaces.some((workspace) => workspace.id === "employment")).toBe(
      true,
    );
    expect(planningDepartments).toEqual(departments.map((d) => d.fullName));
    expect(
      documents.every(
        (d) =>
          d.area === "Organisation-wide" ||
          planningDepartments.includes(d.area),
      ),
    ).toBe(true);
    expect(JSON.stringify(documents)).not.toMatch(/division/i);
  });
  it("maps organisational staff to a department and keeps the representative independent", () => {
    const representative = peopleDirectory.find(
      (person) => person.id === "skyler",
    )!;
    expect(representative.departmentId).toBe("");
    expect(representative.unitId).toBe("");
    for (const p of staff) {
      const d = departments.find((d) => d.id === p.departmentId)!;
      expect(d).toBeDefined();
      expect(d.units.some((u) => u.id === p.unitId)).toBe(true);
    }
  });
  it("distinguishes organisation-wide and department-only channel access", () => {
    expect(canOpenDepartment(marketing, jamie)).toBe(false);
    expect(canOpenDepartment(finance, maya)).toBe(false);
    expect(canOpenDepartment(finance, jamie)).toBe(false);
    expect(canOpenDepartment(departments[4], jamie)).toBe(true);
    expect(canOpenDepartment(departments[5], robin)).toBe(true);
    expect(canOpenDepartment(departments[4], maya)).toBe(false);
  });
  it("uses the same local administration folder structure everywhere", () => {
    expect(departmentFolders).toHaveLength(9);
    expect(unitFolders).toHaveLength(6);
    for (const d of departments)
      for (const u of d.units)
        expect(u.calendarItems.every((c) => c.person !== c.cover)).toBe(true);
    for (const d of departments) {
      expect(new Set(d.library.map((f) => f.folder)).size).toBe(8);
      for (const u of d.units) {
        expect(
          u.files.every(
            (f) =>
              unitFolders.includes(f.folder) &&
              f.unitId === u.id &&
              f.departmentId === d.id,
          ),
        ).toBe(true);
        expect(
          u.calendarItems.every(
            (c) =>
              Object.keys(c).sort().join(",") ===
              "availability,cover,dates,person",
          ),
        ).toBe(true);
      }
    }
  });
  it("enforces unit folder boundaries without exposing denied file content", () => {
    const insight = marketing.units.find(
        (u) => u.name === "Marketing Insight & Performance",
      )!,
      income = marketing.units.find((u) => u.name === "Income Administration")!;
    expect(canOpenUnit(marketing, insight, maya)).toBe(true);
    expect(canOpenUnit(marketing, insight, jamie)).toBe(false);
    expect(canOpenUnit(marketing, income, maya)).toBe(false);
    expect(
      accessibleFiles(marketing, maya).some((f) => f.unitId === income.id),
    ).toBe(false);
    expect(accessibleFiles(finance, maya)).toEqual([]);
    expect(canOpenUnit(departments[5], departments[5].units[0], robin)).toBe(
      true,
    );
  });
  it("searches only accessible coordination files and posts", () => {
    expect(searchCoordination(finance, maya, "")).toEqual({
      files: [],
      posts: [],
    });
    const visible = accessibleFiles(marketing, maya);
    for (const f of searchCoordination(marketing, maya, "Meeting").files)
      expect(visible.includes(f)).toBe(true);
    expect(searchCoordination(marketing, maya, "bank mandate").files).toEqual(
      [],
    );
  });
  it("resolves post attachments to original admin objects and keeps misplaced uploads out of Files", () => {
    for (const d of departments) {
      for (const p of d.posts) {
        if (p.attachmentId)
          expect(d.library.find((f) => f.id === p.attachmentId)).toBeDefined();
        if (p.upload) {
          expect(d.library.some((f) => f.name === p.upload?.name)).toBe(false);
          expect(p.moderatorReply).toBeTruthy();
        }
      }
      expect(d.posts.filter((p) => !p.upload).length).toBeGreaterThan(
        d.posts.filter((p) => p.upload).length,
      );
    }
  });
  it("keeps conversation authors in the department and provides German for seeded messages", () => {
    const colleagues = [...peopleDirectory, ...staff];
    for (const department of departments) {
      for (const post of department.posts) {
        expect(
          colleagues.some(
            (person) =>
              person.name === post.author &&
              person.departmentId === department.id,
          ),
        ).toBe(true);
        expect(germanTeamsDepartments[post.text]).toBeTruthy();
        if (post.moderatorReply)
          expect(germanTeamsDepartments[post.moderatorReply]).toBeTruthy();
        for (const reply of post.replies || []) {
          expect(
            colleagues.some(
              (person) =>
                person.name === reply.author &&
                person.departmentId === department.id,
            ),
          ).toBe(true);
          expect(germanTeamsDepartments[reply.text]).toBeTruthy();
        }
      }
    }
  });
  it("uses only implemented functional destinations including People learning", () => {
    expect(
      departments.flatMap((d) =>
        d.posts.flatMap((p) => (p.upload ? [p.upload.destination] : [])),
      ),
    ).toEqual([
      "/audience-innovation/analytics",
      "/content-delivery/creative",
      "/financial-operations/planning",
      "/services/purchasing",
      "/digital-tech/systems-engineering",
      "/people-culture/learning",
      "/employment-admin/recruitment-administration",
      "/projects/PRJ-2026-014/decisions",
    ]);
    expect(
      departments[4].posts.some(
        (p) => p.upload?.destination === "/people-culture/learning",
      ),
    ).toBe(true);
    const route = new URL(
      departmentHref("maya", "marketing-growth"),
      "https://example.test",
    );
    expect(route.searchParams.get("staff")).toBe("maya");
    expect(route.searchParams.get("tab")).toBe("Posts");
  });

  it("completes the supplier correction in the original thread without changing its opening", () => {
    const department = departments.find((d) => d.id === "strategy-technology")!;
    const post = department.posts.find(
      (p) => p.id === "strategy-technology-misfiled",
    )!;
    expect(post.author).toBe("Casey Blake");
    expect(post.text).toBe(
      "I've updated the supplier checklist after the project call. Have I missed anything before we send it back?",
    );
    expect(post.moderatorReply).toBe(
      "Can we keep this in Purchasing & Suppliers and link it back? They'll need the latest copy too. Give me a shout if you want a hand moving it.",
    );
    expect(post.upload).toMatchObject({
      id: "UP-STT-01",
      name: "Supplier Onboarding Checklist.docx",
      destination: "/services/purchasing",
      removed: true,
    });
    expect(post.replies).toEqual([
      {
        author: "Casey Blake",
        text: "Ooh, thanks for the reminder! I've reuploaded it there — here's the new link.",
        time: "10:49",
        link: {
          href: functionalFileHref(configById.get("services")!, "services-F3"),
          label: "Supplier Onboarding Checklist.docx",
        },
      },
      {
        author: "Theo Walker",
        text: "No worries! Can you also edit your original post to use the new link, just so we don't end up with two versions floating around? I'll remove the attachment from this channel's files. Thanks so much.",
        time: "10:53",
        moderator: true,
      },
    ]);
  });

  it.each([
    ["strategy-technology", "services", "services-F3"],
    ["people-culture", "people", "people-F5"],
  ])(
    "links the completed %s correction to one existing functional file",
    (departmentId, workspaceId, fileId) => {
      const department = departments.find((d) => d.id === departmentId)!;
      const post = department.posts.find(
        (p) => p.id === `${departmentId}-misfiled`,
      )!;
      const config = configById.get(workspaceId)!;
      const canonical = config.files.find((file) => file.id === fileId)!;
      expect(canonical.name).toBe(post.upload!.name);
      expect(post.replies![0].link).toEqual({
        href: functionalFileHref(config, canonical.id),
        label: canonical.name,
      });
      expect(
        functionalConfigs
          .flatMap((workspace) => workspace.files)
          .filter((file) => file.name === canonical.name),
      ).toEqual([canonical]);
      expect(
        department.library.some((file) => file.name === canonical.name),
      ).toBe(false);
      expect(post.upload!.removed).toBe(true);
      expect(post.replies![1].moderator).toBe(true);
    },
  );

  it("uses the existing production storyboard and retains the removed upload as history", () => {
    const department = departments.find((d) => d.id === "communications")!;
    const post = department.posts.find(
      (p) => p.id === "communications-misfiled",
    )!;
    const canonical = filesById.get("video-storyboard")!;
    expect(contentFiles.filter((file) => file.name === canonical.name)).toEqual(
      [canonical],
    );
    expect(post.replies![0].link).toEqual({
      href: `/content-delivery/${libraryFor(canonical)}?file=${canonical.id}`,
      label: canonical.name,
    });
    expect(post.upload).toMatchObject({ name: canonical.name, removed: true });
    expect(
      department.library.some((file) => file.name === canonical.name),
    ).toBe(false);
    expect(post.replies![1]).toMatchObject({
      author: "Morgan Lee",
      moderator: true,
    });
  });

  it("uses named thumbs-up acknowledgements without adding another reply thread", () => {
    const examples = departments.flatMap((department) =>
      department.posts
        .filter((post) => post.moderatorLikedBy?.length)
        .map((post) => ({ department, post })),
    );
    expect(examples.length).toBeGreaterThan(1);
    for (const { department, post } of examples) {
      expect(post.replies?.length || 0).toBe(0);
      expect(post.moderatorLikedBy).toEqual([post.author]);
      for (const name of post.moderatorLikedBy!)
        expect(
          [...peopleDirectory, ...staff].some(
            (person) =>
              person.name === name && person.departmentId === department.id,
          ),
        ).toBe(true);
    }
  });
});
