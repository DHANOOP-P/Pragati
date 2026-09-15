import { useEffect, useState } from "react";
import api from "../../api/client";
import { downloadAuth } from "../../utils/download";

const AdminRegistrations = () => {
  const [items, setItems] = useState([]);
  const [type, setType] = useState("");

  useEffect(() => {
    const params = { scope: "paid" };
    if (type) params.itemType = type;
    api
      .get("/admin/registrations", { params })
      .then((res) => setItems(res.data || []))
      .catch(() => setItems([]));
  }, [type]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-ember">Workshops · proshows</p>
          <h1 className="mt-2 font-display text-4xl">Paid registrations</h1>
        </div>
        <div className="flex gap-2">
          <select value={type} onChange={(e) => setType(e.target.value)} className="border border-paper/15 bg-void px-3 py-2 text-paper">
            <option value="">All paid</option>
            <option value="workshop">Workshops</option>
            <option value="proshow">Proshows</option>
          </select>
          <button
            type="button"
            onClick={() =>
              downloadAuth(
                `/api/admin/registrations/export?scope=paid${type ? `&itemType=${type}` : ""}`,
                "pragati-paid-registrations.csv"
              )
            }
            className="text-gold"
          >
            Export
          </button>
        </div>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-gold">
            <tr>
              <th className="py-3">Name</th>
              <th>Email</th>
              <th>Type</th>
              <th>Title</th>
              <th>Amount</th>
              <th>Ticket</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r._id} className="border-t border-paper/10">
                <td className="py-3">{r.user?.name || r.studentName}</td>
                <td>{r.user?.email || r.email}</td>
                <td>{r.itemType}</td>
                <td>{r.itemTitle}</td>
                <td>₹{r.amount}</td>
                <td>{r.ticketCode}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && <p className="mt-6 text-sm text-mute">No paid registrations yet.</p>}
      </div>
    </div>
  );
};

export default AdminRegistrations;
