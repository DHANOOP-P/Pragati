import { useEffect, useMemo, useState } from "react";
import api from "../../api/client";
import { DEPARTMENTS } from "../../data/studentMeta";
import { downloadAuth } from "../../utils/download";
import {
  adminDeleteBtn,
  adminSelect,
  adminTable,
  adminTableWrap,
  adminTd,
  adminTdMute,
  adminTh,
  adminTr,
} from "./adminTable";

const AdminEventRegistrations = () => {
  const [kind, setKind] = useState("individual");
  const [eventId, setEventId] = useState("");
  const [department, setDepartment] = useState("");
  const [sort, setSort] = useState("event");
  const [events, setEvents] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    api.get("/admin/events").then((res) => setEvents(res.data || [])).catch(() => setEvents([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { scope: "arts", participationType: kind, sort };
    if (eventId) params.itemId = eventId;
    if (department) params.department = department;
    api
      .get("/admin/registrations", { params })
      .then((res) => setItems(res.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
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

  const remove = async (id, label) => {
    if (!window.confirm(`Delete event registration for ${label || "this student"}?`)) return;
    setBusyId(id);
    try {
      await api.delete(`/admin/registrations/${id}`);
      setItems((cur) => cur.filter((row) => row._id !== id));
    } catch (err) {
      window.alert(err.message || "Could not delete.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-ember">GECW students only</p>
          <h1 className="mt-2 font-display text-4xl">Event registrations</h1>
          <p className="mt-2 max-w-xl text-sm text-mute">
            Arts sign-ups. Individual and group lists stay separate.
          </p>
        </div>
        <button type="button" onClick={() => downloadAuth(exportHref, `pragati-event-${kind}.pdf`)} className="text-gold">
          Export PDF
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
        <select value={eventId} onChange={(e) => setEventId(e.target.value)} className={adminSelect}>
          <option value="">All events</option>
          {eventOptions.map((event) => (
            <option key={event._id} value={event._id}>
              {event.title}
            </option>
          ))}
        </select>
        <select value={department} onChange={(e) => setDepartment(e.target.value)} className={adminSelect}>
          <option value="">All departments</option>
          {DEPARTMENTS.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className={adminSelect}>
          <option value="event">Sort by event</option>
          <option value="department">Sort by department</option>
          <option value="name">Sort by name</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      <p className="mt-4 text-sm text-mute">
        {loading ? "Loading…" : `${items.length} registration${items.length === 1 ? "" : "s"}`}
      </p>

      <div className={adminTableWrap}>
        {kind === "individual" ? (
          <table className={`${adminTable} min-w-[1100px]`}>
            <thead>
              <tr className="border-b border-paper/15 bg-paper/[0.03]">
                <th className={adminTh}>Student name</th>
                <th className={adminTh}>Event</th>
                <th className={adminTh}>Class</th>
                <th className={adminTh}>House</th>
                <th className={adminTh}>Department</th>
                <th className={adminTh}>Phone</th>
                <th className={adminTh}>Mail id</th>
                <th className={adminTh}>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row._id} className={adminTr}>
                  <td className={`${adminTd} font-medium`}>{row.studentName || "—"}</td>
                  <td className={adminTd}>{row.itemTitle}</td>
                  <td className={`${adminTd} whitespace-nowrap`}>{row.studentClass || "—"}</td>
                  <td className={`${adminTd} whitespace-nowrap`}>{row.houseName || "—"}</td>
                  <td className={`${adminTd} whitespace-nowrap`}>{row.department || "—"}</td>
                  <td className={`${adminTd} tabular-nums`}>{row.phone || "—"}</td>
                  <td className={`${adminTdMute} break-all`}>{row.email || "—"}</td>
                  <td className={`${adminTd} text-right`}>
                    <button
                      type="button"
                      disabled={busyId === row._id}
                      onClick={() => remove(row._id, row.studentName)}
                      className={adminDeleteBtn}
                    >
                      {busyId === row._id ? "…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className={`${adminTable} min-w-[1180px]`}>
            <thead>
              <tr className="border-b border-paper/15 bg-paper/[0.03]">
                <th className={adminTh}>Group leader</th>
                <th className={adminTh}>Event</th>
                <th className={adminTh}>Leader class</th>
                <th className={adminTh}>Department</th>
                <th className={adminTh}>Members</th>
                <th className={adminTh}>Phone</th>
                <th className={adminTh}>Mail id</th>
                <th className={adminTh}>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row._id} className={adminTr}>
                  <td className={`${adminTd} font-medium`}>{row.studentName || "—"}</td>
                  <td className={adminTd}>{row.itemTitle}</td>
                  <td className={`${adminTd} whitespace-nowrap`}>{row.studentClass || "—"}</td>
                  <td className={`${adminTd} whitespace-nowrap`}>{row.department || "—"}</td>
                  <td className={`${adminTdMute} max-w-xs`}>
                    {(row.members || []).length
                      ? row.members.map((member, i) => (
                          <p key={`${row._id}-${i}`}>
                            {member.name}
                            {member.studentClass || member.department
                              ? ` · ${[member.studentClass, member.department].filter(Boolean).join(" · ")}`
                              : ""}
                          </p>
                        ))
                      : "—"}
                  </td>
                  <td className={`${adminTd} tabular-nums`}>{row.phone || "—"}</td>
                  <td className={`${adminTdMute} break-all`}>{row.email || "—"}</td>
                  <td className={`${adminTd} text-right`}>
                    <button
                      type="button"
                      disabled={busyId === row._id}
                      onClick={() => remove(row._id, row.studentName)}
                      className={adminDeleteBtn}
                    >
                      {busyId === row._id ? "…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && !items.length && (
          <p className="px-4 py-6 text-sm text-mute">No {kind} registrations for this filter.</p>
        )}
      </div>
    </div>
  );
};

export default AdminEventRegistrations;
