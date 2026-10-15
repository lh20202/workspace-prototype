import { useState } from "react";
import { Input, Button } from "@fluentui/react-components";
import {
  Search20Regular,
  Calendar24Regular,
  ArrowRight20Regular,
  ChevronLeft20Regular,
  ChevronRight20Regular,
  Dismiss20Regular,
} from "@fluentui/react-icons";
import {
  rotaRows,
  queryCalendar,
  type RotaType,
  type CalendarEntry,
} from "./schedule";
import { shortDate } from "./FileTable";
import { type OperationalFile, initialTasks } from "./data";
export function RotaView({
  type,
  onOpen,
}: {
  type: RotaType;
  onOpen: (file: OperationalFile) => void;
}) {
  const [period, setPeriod] = useState("This week");
  const [search, setSearch] = useState("");
  const rows = rotaRows(type, period).filter((r) =>
    `${r.campaign} ${r.location} ${r.group}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <>
      <div className="library-heading">
        <div>
          <h2>{type === "street" ? "In-person rota" : "Calling rota"}</h2>
          <p>
            Weekly {type === "street" ? "in-person deployments" : "calling shifts"}{" "}
            coordinated through Campaign Operations.
          </p>
        </div>
        <span className="library-label">
          <Calendar24Regular />
          {period === "Next week"
            ? "Week 43 · 19–25 October 2026"
            : period === "All upcoming"
              ? "Upcoming operations"
              : "Week 42 · 12–18 October 2026"}
        </span>
      </div>
      <div className="schedule-toolbar">
        <label>
          Period
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option>This week</option>
            <option>Next week</option>
            <option>All upcoming</option>
          </select>
        </label>
        <Input
          contentBefore={<Search20Regular />}
          placeholder="Search rota"
          aria-label="Search rota"
          value={search}
          onChange={(_, d) => setSearch(d.value)}
        />
      </div>
      <div className="table-scroll">
        <table className="rota-table">
          <thead>
            <tr>
              {[
                "Day",
                "Campaign",
                type === "street" ? "Location" : "Shift",
                "Team lead",
                type === "street" ? "Team / crew" : "Caller group",
                "Start",
                "Finish",
                "Status",
                "Plan / brief",
              ].map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <strong>
                    {new Date(r.date + "T12:00:00").toLocaleDateString(
                      "en-GB",
                      { weekday: "short" },
                    )}
                  </strong>
                  <span className="rota-date">{shortDate(r.date)}</span>
                </td>
                <td>{r.campaign}</td>
                <td>{type === "street" ? r.location : r.shift}</td>
                <td>{r.lead}</td>
                <td>{r.group}</td>
                <td>{r.start}</td>
                <td>{r.finish}</td>
                <td>
                  <span
                    className={`rota-status ${r.status === "Awaiting confirmation" ? "awaiting" : "confirmed"}`}
                  >
                    {r.status}
                  </span>
                </td>
                <td>
                  <button className="text-link" onClick={() => onOpen(r.file)}>
                    View source <ArrowRight20Regular />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && (
          <div className="empty-state">
            No shifts match this period or search.
          </div>
        )}
      </div>
    </>
  );
}
export function CalendarView({
  onOpen,
  onNavigate,
}: {
  onOpen: (f: OperationalFile) => void;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}) {
  const [month, setMonth] = useState(new Date(2026, 9, 1));
  const [kind, setKind] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState("Month");
  const entries = queryCalendar("All upcoming", kind, search);
  const key = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const count =
    Math.ceil(
      (((new Date(month.getFullYear(), month.getMonth(), 1).getDay() + 6) % 7) +
        new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()) /
        7,
    ) * 7;
  const days = Array.from(
    { length: count },
    (_, i) =>
      new Date(start.getFullYear(), start.getMonth(), start.getDate() + i),
  );
  const monthEntries = entries.filter((e) =>
    e.date.startsWith(key(month).slice(0, 7)),
  );
  const move = (step: number) => {
    setMonth(new Date(month.getFullYear(), month.getMonth() + step, 1));
    setSelected(null);
  };
  const openSource = (e: CalendarEntry) => {
    if (e.file) onOpen(e.file);
    else if (e.taskId)
      onNavigate("teams", {
        channel: initialTasks.find((t) => t.id === e.taskId)!.channel,
        tab: "Planner",
      });
    else onNavigate("locations");
  };
  return (
    <>
      <div className="library-heading">
        <div>
          <h2>Shared calendar</h2>
          <p>
            Deployment dates, calling shifts, training, coach coverage and
            operational deadlines.
          </p>
        </div>
      </div>
      <div className="sp-calendar-commandbar">
        <Calendar24Regular />
        <strong>Operations calendar</strong>
        <label className="calendar-view-select">
          View
          <select
            aria-label="Calendar view"
            value={view}
            onChange={(e) => setView(e.target.value)}
          >
            <option>Month</option>
            <option>Agenda</option>
          </select>
        </label>
      </div>
      <div className="sp-calendar-toolbar">
        <Button
          appearance="subtle"
          icon={<ChevronLeft20Regular />}
          aria-label="Previous month"
          onClick={() => move(-1)}
        />
        <Button
          appearance="subtle"
          icon={<ChevronRight20Regular />}
          aria-label="Next month"
          onClick={() => move(1)}
        />
        <h3>
          {month.toLocaleDateString("en-GB", {
            month: "long",
            year: "numeric",
          })}
        </h3>
        <Button
          onClick={() => {
            setMonth(new Date(2026, 9, 1));
            setSelected("2026-10-14");
          }}
        >
          Today
        </Button>
        <label>
          Activity
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="">All activities</option>
            {[
              "In-person deployment",
              "Calling shift",
              "Training",
              "Coach coverage",
              "Permit",
              "Deadline",
            ].map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </label>
        <Input
          contentBefore={<Search20Regular />}
          placeholder="Search calendar"
          aria-label="Search calendar"
          value={search}
          onChange={(_, d) => setSearch(d.value)}
        />
      </div>
      <div className="sp-calendar-layout">
        <div className="sp-calendar-scroll">
          {view === "Month" ? (
            <table
              className="sp-month-calendar"
              aria-label={
                month.toLocaleDateString("en-GB", {
                  month: "long",
                  year: "numeric",
                }) + " calendar"
              }
            >
              <thead>
                <tr>
                  {[
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ].map((d) => (
                    <th key={d} scope="col">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: count / 7 }, (_, week) => (
                  <tr key={week}>
                    {days.slice(week * 7, week * 7 + 7).map((d) => {
                      const date = key(d);
                      const items = entries.filter((e) => e.date === date);
                      return (
                        <td
                          key={date}
                          className={`${d.getMonth() !== month.getMonth() ? "outside-month" : ""} ${selected === date ? "selected-day" : ""}`}
                        >
                          <button
                            className={`calendar-day-number ${date === "2026-10-14" ? "calendar-today" : ""}`}
                            aria-label={
                              d.toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }) + `, ${items.length} activities`
                            }
                            onClick={() => setSelected(date)}
                          >
                            {d.getDate()}
                          </button>
                          {items.slice(0, 3).map((e) => (
                            <button
                              key={e.id}
                              className="calendar-event"
                              title={`${e.time} · ${e.title}`}
                              onClick={() => setSelected(date)}
                            >
                              <span>
                                {e.time === "Deadline"
                                  ? "Due"
                                  : e.time.split("–")[0]}
                              </span>{" "}
                              {e.title}
                            </button>
                          ))}
                          {items.length > 3 && (
                            <button
                              className="calendar-more"
                              onClick={() => setSelected(date)}
                            >
                              +{items.length - 3} more
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="calendar-list-view">
              {monthEntries.map((e) => (
                <button key={e.id} onClick={() => setSelected(e.date)}>
                  <span>
                    {shortDate(e.date)} · {e.time}
                  </span>
                  <strong>{e.title}</strong>
                  <span>{e.kind}</span>
                </button>
              ))}
            </div>
          )}
          {!monthEntries.length && (
            <p className="calendar-empty">
              No activities{" "}
              {kind || search ? "match these filters" : "scheduled"} in this
              month.
            </p>
          )}
        </div>
        {selected && (
          <aside className="calendar-day-details" aria-label="Day activities">
            <div className="calendar-detail-heading">
              <h3>
                {new Date(selected + "T12:00:00").toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </h3>
              <Button
                appearance="subtle"
                icon={<Dismiss20Regular />}
                aria-label="Close day activities"
                onClick={() => setSelected(null)}
              />
            </div>
            {entries
              .filter((e) => e.date === selected)
              .map((e) => (
                <article key={e.id}>
                  <span className="agenda-kind">{e.kind}</span>
                  <h4>{e.title}</h4>
                  <p>{e.time}</p>
                  <p>
                    {e.owner} · {e.status}
                  </p>
                  <Button appearance="subtle" onClick={() => openSource(e)}>
                    {" "}
                    {e.file
                      ? "Open plan / resource"
                      : e.taskId
                        ? "Open Planner"
                        : "Open Locations & Permits"}
                    <ArrowRight20Regular />
                  </Button>
                </article>
              ))}
            {!entries.some((e) => e.date === selected) && (
              <p>No activities on this day.</p>
            )}
          </aside>
        )}
      </div>
    </>
  );
}
