import { useEffect, useMemo, useState } from "react";
import api from "../../api/client";
import {
  adminDeleteBtn,
  adminTable,
  adminTableWrap,
  adminTd,
  adminTdMute,
  adminTh,
  adminTr,
} from "./adminTable";

const AdminCertificates = () => {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  const load = () => {
    setLoading(true);
    return api
      .get("/admin/certificates")
      .then((res) => setItems(Array.isArray(res.data) ? res.data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((c) => {
      const hay = [
        c.studentName,
        c.originalName,
        c.user?.email,
        c.user?.name,
        c.matched ? "matched" : "unmatched",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [items, q]);

  const upload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    const data = new FormData();
    [...files].forEach((f) => data.append("files", f));
    try {
      const res = await api.post("/admin/certificates", data);
      setStatus(res.data.message);
      await load();
    } catch (err) {
      setStatus(err.message);
    }
    e.target.value = "";
  };

  const remove = async (id, name) => {
    if (!window.confirm(`Delete certificate for ${name || "this student"}?`)) return;
    setBusyId(id);
    try {
      await api.delete(`/admin/certificates/${id}`);
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
          <p className="text-[11px] uppercase tracking-[0.35em] text-ember">Desk</p>
          <h1 className="mt-2 font-display text-4xl">Certificates</h1>
          <p className="mt-2 max-w-xl text-sm text-mute">PDF filename should match the student name.</p>
        </div>
        <label className="inline-block cursor-pointer bg-ember px-6 py-3 text-[11px] uppercase tracking-[0.28em]">
          Upload
          <input type="file" accept="application/pdf" multiple className="hidden" onChange={upload} />
        </label>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, file, mail, matched…"
          className="min-w-[16rem] border border-paper/15 bg-void px-3 py-2 text-sm text-paper outline-none focus:border-gold"
        />
      </div>

      {status && <p className="mt-4 text-sm text-gold">{status}</p>}
      <p className="mt-4 text-sm text-mute">
        {loading
          ? "Loading…"
          : q.trim()
            ? `${filtered.length} of ${items.length} certificate${items.length === 1 ? "" : "s"}`
            : `${items.length} certificate${items.length === 1 ? "" : "s"}`}
      </p>

      <div className={adminTableWrap}>
        <table className={`${adminTable} min-w-[720px]`}>
          <thead>
            <tr className="border-b border-paper/15 bg-paper/[0.03]">
              <th className={adminTh}>Student</th>
              <th className={adminTh}>File</th>
              <th className={adminTh}>Status</th>
              <th className={adminTh}>Matched mail</th>
              <th className={adminTh}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c._id} className={adminTr}>
                <td className={`${adminTd} font-medium`}>{c.studentName || "—"}</td>
                <td className={`${adminTdMute} max-w-[16rem] break-all`}>{c.originalName || "—"}</td>
                <td className={adminTd}>{c.matched ? "Matched" : "Unmatched"}</td>
                <td className={`${adminTdMute} break-all`}>{c.user?.email || "—"}</td>
                <td className={`${adminTd} text-right`}>
                  <button
                    type="button"
                    disabled={busyId === c._id}
                    onClick={() => remove(c._id, c.studentName)}
                    className={adminDeleteBtn}
                  >
                    {busyId === c._id ? "…" : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && !filtered.length && (
          <p className="px-4 py-6 text-sm text-mute">
            {items.length ? "No certificates match that search." : "No certificates uploaded."}
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminCertificates;
