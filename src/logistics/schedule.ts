import {
  filesById,
  permits,
  initialTasks,
  weekStart,
  weekEnd,
  type OperationalFile,
} from "./data";
export type RotaType = "street" | "telephone";
export interface Duty {
  id: string;
  date: string;
  fileId: string;
  permitId?: string;
  group: string;
  start: string;
  finish: string;
  shift: string;
  kind: "In-person deployment" | "Calling shift" | "Training" | "Coach coverage";
  status?: string;
}
// These are shift details attached to existing operational file/permit records, not a second document store.
export const duties: Duty[] = [
  {
    id: "central-wed",
    date: "2026-10-14",
    fileId: "central-deployment",
    group: "In-person crew A",
    start: "09:00",
    finish: "17:00",
    shift: "Day",
    kind: "In-person deployment",
  },
  {
    id: "north-fri",
    date: "2026-10-16",
    fileId: "north-schedule",
    permitId: "permit-north",
    group: "In-person crew B",
    start: "09:30",
    finish: "17:00",
    shift: "Day",
    kind: "In-person deployment",
  },
  {
    id: "travel-sat",
    date: "2026-10-17",
    fileId: "travel-itinerary",
    permitId: "permit-lakeside",
    group: "Travel crew",
    start: "10:00",
    finish: "16:30",
    shift: "Day",
    kind: "In-person deployment",
  },
  {
    id: "central-sun",
    date: "2026-10-18",
    fileId: "central-deployment",
    permitId: "permit-central",
    group: "In-person crew A",
    start: "10:00",
    finish: "16:00",
    shift: "Day",
    kind: "In-person deployment",
  },
  {
    id: "renewal-wed",
    date: "2026-10-14",
    fileId: "telephone-schedule",
    group: "Caller group A",
    start: "09:00",
    finish: "12:30",
    shift: "Morning",
    kind: "Calling shift",
  },
  {
    id: "renewal-thu",
    date: "2026-10-15",
    fileId: "telephone-schedule",
    group: "Caller group B",
    start: "13:00",
    finish: "17:00",
    shift: "Afternoon",
    kind: "Calling shift",
  },
  {
    id: "welcome-mon",
    date: "2026-10-19",
    fileId: "welcome-script",
    group: "Caller group A",
    start: "09:00",
    finish: "12:30",
    shift: "Morning",
    kind: "Calling shift",
    status: "Scheduled",
  },
  {
    id: "starter-thu",
    date: "2026-10-15",
    fileId: "starter-checklist",
    group: "New starter session",
    start: "10:00",
    finish: "11:00",
    shift: "Session",
    kind: "Training",
    status: "Confirmed",
  },
  {
    id: "coach-fri",
    date: "2026-10-16",
    fileId: "coach-schedule",
    group: "Coach coverage",
    start: "09:00",
    finish: "12:00",
    shift: "Coverage",
    kind: "Coach coverage",
    status: "Scheduled",
  },
];
export function resolveDuty(duty: Duty) {
  const file = filesById.get(duty.fileId)!;
  const permit = permits.find((p) => p.id === duty.permitId);
  return {
    ...duty,
    file,
    campaign: file.campaign,
    location: permit?.location ?? file.location,
    lead: permit?.lead ?? file.owner,
    status:
      duty.status ??
      permit?.status ??
      (file.status === "Active" || file.status === "Current"
        ? "Confirmed"
        : file.status),
  };
}
export function rotaRows(type: RotaType, period = "This week") {
  return duties
    .filter(
      (d) =>
        d.kind ===
        (type === "street" ? "In-person deployment" : "Calling shift"),
    )
    .map(resolveDuty)
    .filter((d) => inPeriod(d.date, period))
    .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
}
export function inPeriod(date: string, period: string) {
  return period === "All upcoming"
    ? date >= weekStart
    : period === "Next week"
      ? date > weekEnd && date <= "2026-10-25"
      : date >= weekStart && date <= weekEnd;
}
export interface CalendarEntry {
  id: string;
  date: string;
  time: string;
  title: string;
  kind: string;
  campaign: string;
  owner: string;
  status: string;
  file?: OperationalFile;
  taskId?: string;
  permitId?: string;
}
export function calendarEntries(): CalendarEntry[] {
  const representedPermits = new Set(
    duties.map((d) => d.permitId).filter(Boolean),
  );
  return [
    ...duties.map((d) => {
      const row = resolveDuty(d);
      return {
        id: d.id,
        date: d.date,
        time: `${d.start}–${d.finish}`,
        title:
          d.kind === "Training"
            ? d.group
            : d.kind === "Coach coverage"
              ? "Coach & team lead coverage"
              : d.kind === "Calling shift"
                ? `${row.campaign} · ${d.shift}`
                : `${row.campaign} · ${row.location}`,
        kind: d.kind,
        campaign: row.campaign,
        owner: row.lead,
        status: row.status,
        file: row.file,
        permitId: d.permitId,
      };
    }),
    ...permits
      .filter((p) => !representedPermits.has(p.id))
      .map((p) => ({
        id: p.id,
        date: p.date,
        time: "Before deployment",
        title: `Location confirmation · ${p.location}`,
        kind: "Permit",
        campaign: p.campaign,
        owner: p.lead,
        status: p.status,
        permitId: p.id,
      })),
    ...initialTasks.map((t) => ({
      id: t.id,
      date: `2026-10-${t.due.split(" ")[0].padStart(2, "0")}`,
      time: "Deadline",
      title: t.title,
      kind: "Deadline",
      campaign: "Shared operations",
      owner: t.owner,
      status: t.state,
      taskId: t.id,
    })),
  ].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}
export function queryCalendar(period: string, kind: string, search: string) {
  return calendarEntries().filter(
    (e) =>
      inPeriod(e.date, period) &&
      (!kind || e.kind === kind) &&
      `${e.title} ${e.campaign} ${e.owner}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
}
