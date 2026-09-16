import { useEffect, useMemo, useState } from "react";
import api from "../../api/client";
import { CLASS_YEARS, DEPARTMENTS, SEMESTERS } from "../../data/studentMeta";
import { downloadAuth } from "../../utils/download";

const selectClass = "border border-paper/15 bg-void px-3 py-2 text-sm text-paper";

const fmtWhen = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const AdminStudents = () => {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [semester, setSemester] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setSearch(q.trim()), 250);
    return () => clearTimeout(id);
  }, [q]);

  const params = useMemo(() => {
    const next = {};
    if (search) next.q = search;
    if (semester) next.semester = semester;
    if (studentClass) next.studentClass = studentClass;
    if (department) next.department = department;
    return next;
  }, [search, semester, studentClass, department]);

  const load = () => {
    setLoading(true);
    api
      .get("/admin/students", { params })
      .then((res) => setItems(Array.isArray(res.data) ? res.data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [params]);

  const exportHref = useMemo(() => {
    const query = new URLSearchParams(params).toString();
    return `/api/admin/students/export${query ? `?${query}` : ""}`;
  }, [params]);

  const remove = async (id, name) => {
    if (!window.confirm(`Delete student account for ${name || "this user"}? This cannot be undone.`)) return;
    setBusyId(id);
    try {
      await api.delete(`/admin/students/${id}`);
      setItems((cur) => cur.filter((row) => row._id !== id));
    } catch (err) {
      window.alert(err.message || "Could not delete student.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-ember">Accounts</p>
          <h1 className="mt-2 font-display text-4xl">Students</h1>
          <p className="mt-2 max-w-xl text-sm text-mute">Everyone who signed up. Newest accounts first.</p>
        </div>
        <button
          type="button"
          onClick={() => downloadAuth(exportHref, "pragati-students.pdf")}
          className="text-gold"
        >
          Export PDF
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, email, college…"
          className="min-w-[16rem] border border-paper/15 bg-void px-3 py-2 text-sm outline-none focus:border-gold"
        />
        <select value={semester} onChange={(e) => setSemester(e.target.value)} className={selectClass}>
          <option value="">All semesters</option>
          {SEMESTERS.map((sem) => (
            <option key={sem} value={sem}>
              {sem}
            </option>
          ))}
        </select>
        <select value={studentClass} onChange={(e) => setStudentClass(e.target.value)} className={selectClass}>
          <option value="">All classes</option>
          {CLASS_YEARS.map((year) => (
            <option key={year} value={year}>
              Year {year}
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
      </div>

      <p className="mt-4 text-sm text-mute">
        {loading ? "Loading…" : `${items.length} student${items.length === 1 ? "" : "s"}`}
      </p>

      <div className="mt-4 overflow-x-auto border border-paper/10">
        <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-paper/15 bg-paper/[0.03]">
              <th className="whitespace-nowrap px-4 py-3 text-[11px] font-normal uppercase tracking-[0.18em] text-gold">
                Name
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-[11px] font-normal uppercase tracking-[0.18em] text-gold">
                Email
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-[11px] font-normal uppercase tracking-[0.18em] text-gold">
                Phone
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-[11px] font-normal uppercase tracking-[0.18em] text-gold">
                College
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-[11px] font-normal uppercase tracking-[0.18em] text-gold">
                Class
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-[11px] font-normal uppercase tracking-[0.18em] text-gold">
                Semester
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-[11px] font-normal uppercase tracking-[0.18em] text-gold">
                Department
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-[11px] font-normal uppercase tracking-[0.18em] text-gold">
                Signed up
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-[11px] font-normal uppercase tracking-[0.18em] text-gold">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s._id} className="border-b border-paper/10 align-top last:border-b-0 hover:bg-paper/[0.02]">
                <td className="max-w-[10rem] px-4 py-3.5 font-medium text-paper">{s.name || "—"}</td>
                <td className="max-w-[16rem] break-all px-4 py-3.5 text-mute">{s.email || "—"}</td>
                <td className="whitespace-nowrap px-4 py-3.5 tabular-nums text-paper">{s.phone || "—"}</td>
                <td className="max-w-[14rem] px-4 py-3.5 text-mute" title={s.college || ""}>
                  {s.college || "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-paper">
                  {s.studentClass ? `Year ${s.studentClass}` : "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-paper">{s.semester || "—"}</td>
                <td className="whitespace-nowrap px-4 py-3.5 text-paper">{s.department || "—"}</td>
                <td className="whitespace-nowrap px-4 py-3.5 text-mute">{fmtWhen(s.createdAt)}</td>
                <td className="whitespace-nowrap px-4 py-3.5 text-right">
                  <button
                    type="button"
                    disabled={busyId === s._id}
                    onClick={() => remove(s._id, s.name)}
                    className="text-[11px] uppercase tracking-[0.2em] text-ember disabled:opacity-40"
                  >
                    {busyId === s._id ? "…" : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && !items.length && <p className="px-4 py-6 text-sm text-mute">No students found.</p>}
      </div>
    </div>
  );
};

export default AdminStudents;
