import { useEffect, useState } from "react";
import api from "../../api/client";
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

const AdminRegistrations = () => {
  const [items, setItems] = useState([]);
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  const load = () => {
    setLoading(true);
    const params = { scope: "paid" };
    if (type) params.itemType = type;
    api
      .get("/admin/registrations", { params })
      .then((res) => setItems(res.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [type]);

  const remove = async (id, label) => {
    if (!window.confirm(`Delete paid registration for ${label || "this ticket"}?`)) return;
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
          <p className="text-[11px] uppercase tracking-[0.35em] text-ember">Workshops · proshows</p>
          <h1 className="mt-2 font-display text-4xl">Paid registrations</h1>
          <p className="mt-2 max-w-xl text-sm text-mute">Confirmed workshop and proshow tickets.</p>
        </div>
        <button
          type="button"
          onClick={() =>
            downloadAuth(
              `/api/admin/registrations/export?scope=paid${type ? `&itemType=${type}` : ""}`,
              "pragati-paid-registrations.pdf"
            )
          }
          className="text-gold"
        >
          Export PDF
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <select value={type} onChange={(e) => setType(e.target.value)} className={adminSelect}>
          <option value="">All paid</option>
          <option value="workshop">Workshops</option>
          <option value="proshow">Proshows</option>
        </select>
      </div>

      <p className="mt-4 text-sm text-mute">
        {loading ? "Loading…" : `${items.length} registration${items.length === 1 ? "" : "s"}`}
      </p>

      <div className={adminTableWrap}>
        <table className={`${adminTable} min-w-[900px]`}>
          <thead>
            <tr className="border-b border-paper/15 bg-paper/[0.03]">
              <th className={adminTh}>Name</th>
              <th className={adminTh}>Email</th>
              <th className={adminTh}>Type</th>
              <th className={adminTh}>Title</th>
              <th className={adminTh}>Amount</th>
              <th className={adminTh}>Ticket</th>
              <th className={adminTh}>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r._id} className={adminTr}>
                <td className={`${adminTd} font-medium`}>{r.user?.name || r.studentName || "—"}</td>
                <td className={`${adminTdMute} break-all`}>{r.user?.email || r.email || "—"}</td>
                <td className={adminTd}>{r.itemType}</td>
                <td className={adminTd}>{r.itemTitle}</td>
                <td className={`${adminTd} tabular-nums`}>₹{r.amount}</td>
                <td className={`${adminTdMute} whitespace-nowrap`}>{r.ticketCode}</td>
                <td className={`${adminTd} text-right`}>
                  <button
                    type="button"
                    disabled={busyId === r._id}
                    onClick={() => remove(r._id, r.user?.name || r.studentName || r.ticketCode)}
                    className={adminDeleteBtn}
                  >
                    {busyId === r._id ? "…" : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && !items.length && <p className="px-4 py-6 text-sm text-mute">No paid registrations yet.</p>}
      </div>
    </div>
  );
};

export default AdminRegistrations;
