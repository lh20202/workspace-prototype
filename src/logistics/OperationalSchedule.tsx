import { useState } from "react";
import { Input, Button } from "@fluentui/react-components";
import {
  Search20Regular,
  Calendar24Regular,
  ArrowRight20Regular,
} from "@fluentui/react-icons";
import { rotaRows, queryCalendar, type RotaType } from "./schedule";
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
          <h2>{type === "street" ? "Street rota" : "Telephone rota"}</h2>
          <p>
            Weekly {type === "street" ? "street deployments" : "calling shifts"}{" "}
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
  const [period, setPeriod] = useState("This week");
  const [kind, setKind] = useState("");
  const [search, setSearch] = useState("");
  const entries = queryCalendar(period, kind, search);
  const dates = [...new Set(entries.map((e) => e.date))];
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
        <span className="library-label">
          <Calendar24Regular />
          Operations agenda
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
        <label>
          Activity
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="">All activities</option>
            {[
              "Street deployment",
              "Telephone shift",
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
      <div className="operational-agenda">
        {dates.map((date) => (
          <section className="agenda-day" key={date}>
            <div className="agenda-date">
              <strong>
                {new Date(date + "T12:00:00").toLocaleDateString("en-GB", {
                  day: "numeric",
                })}
              </strong>
              <span>
                {new Date(date + "T12:00:00").toLocaleDateString("en-GB", {
                  weekday: "short",
                  month: "short",
                })}
              </span>
            </div>
            <div>
              {entries
                .filter((e) => e.date === date)
                .map((e) => (
                  <article key={e.id}>
                    <div>
                      <span
                        className={`agenda-kind kind-${e.kind.toLowerCase().replaceAll(" ", "-")}`}
                      >
                        {e.kind}
                      </span>
                      <span className="agenda-time">{e.time}</span>
                    </div>
                    <h3>{e.title}</h3>
                    <p>
                      {e.owner} · {e.status}
                    </p>
                    {e.file ? (
                      <Button
                        appearance="subtle"
                        onClick={() => onOpen(e.file!)}
                      >
                        Open plan / resource <ArrowRight20Regular />
                      </Button>
                    ) : e.taskId ? (
                      <Button
                        appearance="subtle"
                        onClick={() =>
                          onNavigate("teams", {
                            channel: initialTasks.find(
                              (t) => t.id === e.taskId,
                            )!.channel,
                            tab: "Planner",
                          })
                        }
                      >
                        Open Planner <ArrowRight20Regular />
                      </Button>
                    ) : (
                      <Button
                        appearance="subtle"
                        onClick={() => onNavigate("locations")}
                      >
                        Open Locations & Permits <ArrowRight20Regular />
                      </Button>
                    )}
                  </article>
                ))}
            </div>
          </section>
        ))}
        {!dates.length && (
          <div className="empty-state">No activities match this view.</div>
        )}
      </div>
    </>
  );
}
