import { useEffect, useMemo, useState } from "react";
import api from "../../api/client";
import { DEPARTMENTS } from "../../data/studentMeta";
import { downloadAuth } from "../../utils/download";

const selectClass = "border border-paper/15 bg-void px-3 py-2 text-sm text-paper";

const AdminEventRegistrations = () => {
  const [kind, setKind] = useState("individual");
  const [eventId, setEventId] = useState("");
  const [department, setDepartment] = useState("");
  const [sort, setSort] = useState("event");
  const [events, setEvents] = useState([]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/admin/events").then((res) => setEvents(res.data || [])).catch(() => setEvents([]));
  }, []);

  useEffect(() => {
    const params = { scope: "arts", participationType: kind, sort };
    if (eventId) params.itemId = eventId;
    if (department) params.department = department;
    api.get("/admin/registrations", { params }).then((res) => setItems(res.data || [])).catch(() => setItems([]));
  }, [kind, eventId, department, sort]);

  const eventOptions = useMemo(
    () => events.filter((event) => (event.participationType || "individual") === kind),
    [events, kind]
  );

  const exportHref = useMemo(() => {
    const params = new URLSearchParams({ scope: "arts", participationType: kind, sort });
    if (eventId) params.set("itemId", eventId);
    if (department) params.set("department", department);
    return `/api/admin/registrations/export?${params}`;
  }, [kind, eventId, department, sort]);

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.35em] text-ember">GECW students only</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl">Event registrations</h1>
          <p className="mt-2 max-w-xl text-sm text-mute">
            Arts sign-ups. Individual and group lists stay separate. Sort by event or department.
          </p>
        </div>
        <button type="button" onClick={() => downloadAuth(exportHref, `pragati-event-${kind}.csv`)} className="text-gold">
          Export
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {["individual", "group"].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setKind(value);
              setEventId("");
            }}
            className={`px-4 py-2 text-[11px] uppercase tracking-[0.22em] ${kind === value ? "bg-ember text-paper" : "border border-paper/15 text-mute"}`}
          >
            {value === "group" ? "Group events" : "Individual events"}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <select value={eventId} onChange={(e) => setEventId(e.target.value)} className={selectClass}>
          <option value="">All events</option>
          {eventOptions.map((event) => (
            <option key={event._id} value={event._id}>
              {event.title}
            </option>
          ))}
        </select>
        <select value={department} onChange={(e) => setDepartment(e.target.value)} className={selectClass}>
          <option value="">All departments</option>
          {DEPARTMENTS.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className={selectClass}>
          <option value="event">Sort by event</option>
          <option value="department">Sort by department</option>
          <option value="name">Sort by name</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      <div className="mt-6 overflow-x-auto">
        {kind === "individual" ? (
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="text-gold">
              <tr>
                <th className="py-3">Student name</th>
                <th>Event</th>
                <th>Class</th>
                <th>House</th>
                <th>Department</th>
                <th>Phone</th>
                <th>Mail id</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row._id} className="border-t border-paper/10">
                  <td className="py-3">{row.studentName || "—"}</td>
                  <td>{row.itemTitle}</td>
                  <td>{row.studentClass || "—"}</td>
                  <td>{row.houseName || "—"}</td>
                  <td>{row.department || "—"}</td>
                  <td>{row.phone || "—"}</td>
                  <td>{row.email || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="text-gold">
              <tr>
                <th className="py-3">Group leader</th>
                <th>Event</th>
                <th>Leader class</th>
                <th>Department</th>
                <th>Members</th>
                <th>Phone</th>
                <th>Mail id</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row._id} className="border-t border-paper/10 align-top">
                  <td className="py-3">{row.studentName || "—"}</td>
                  <td>{row.itemTitle}</td>
                  <td>{row.studentClass || "—"}</td>
                  <td>{row.department || "—"}</td>
                  <td className="max-w-xs">
                    {(row.members || []).length
                      ? row.members.map((member, i) => (
                          <p key={`${row._id}-${i}`} className="text-paper/90">
                            {member.name}
                            {member.studentClass || member.department
                              ? ` · ${[member.studentClass, member.department].filter(Boolean).join(" · ")}`
                              : ""}
                          </p>
                        ))
                      : "—"}
                  </td>
                  <td>{row.phone || "—"}</td>
                  <td>{row.email || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!items.length && <p className="mt-6 text-sm text-mute">No {kind} registrations for this filter.</p>}
      </div>
    </div>
  );
};

export default AdminEventRegistrations;
