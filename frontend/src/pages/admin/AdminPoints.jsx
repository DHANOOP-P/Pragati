import { useEffect, useState } from "react";
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

const field = "w-full border border-paper/15 bg-void px-3 py-2 text-sm text-paper outline-none focus:border-gold";

const AdminPoints = () => {
  const [houses, setHouses] = useState([]);
  const [newName, setNewName] = useState("");
  const [newPoints, setNewPoints] = useState(0);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setError("");
    return api
      .get("/admin/points")
      .then((res) => setHouses(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (id, key, value) => {
    setHouses((rows) =>
      rows.map((row) => {
        if (row._id !== id) return row;
        if (key === "points") return { ...row, points: value === "" ? "" : Number(value) };
        return { ...row, [key]: value };
      })
    );
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setStatus("");
    try {
      const { data } = await api.put("/admin/points", {
        houses: houses.map((row) => ({
          _id: row._id,
          name: String(row.name || "").trim(),
          points: Number(row.points) || 0,
        })),
      });
      setHouses(data);
      setStatus("Point table saved. Names and scores are live on the Points page.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const addCategory = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) {
      setError("Enter a category name.");
      return;
    }
    setBusy(true);
    setError("");
    setStatus("");
    try {
      await api.post("/admin/points", { name, points: Number(newPoints) || 0 });
      setNewName("");
      setNewPoints(0);
      setStatus(`Added category "${name}".`);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id, name) => {
    if (!window.confirm(`Remove category "${name}" from the point table?`)) return;
    setBusyId(id);
    setError("");
    try {
      await api.delete(`/admin/points/${id}`);
      setHouses((cur) => cur.filter((row) => row._id !== id));
      setStatus(`Removed "${name}".`);
    } catch (err) {
      setError(err.message || "Could not delete.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-ember">Houses</p>
          <h1 className="mt-2 font-display text-4xl">Point table</h1>
          <p className="mt-2 max-w-xl text-sm text-mute">
            Edit category names and scores, or add a new house category (Themis, Marduk, and more).
          </p>
        </div>
      </div>

      <form onSubmit={addCategory} className="mt-6 flex flex-wrap items-end gap-2 border border-paper/10 p-4">
        <label className="text-sm text-mute">
          New category
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Category name"
            className={`mt-1 min-w-[14rem] ${field}`}
          />
        </label>
        <label className="text-sm text-mute">
          Starting points
          <input
            type="number"
            min="0"
            step="1"
            value={newPoints}
            onChange={(e) => setNewPoints(e.target.value === "" ? "" : Number(e.target.value))}
            className={`mt-1 w-28 ${field}`}
          />
        </label>
        <button type="submit" disabled={busy} className="bg-ember px-5 py-2 text-[11px] uppercase tracking-[0.22em] disabled:opacity-40">
          Add category
        </button>
      </form>

      <p className="mt-4 text-sm text-mute">
        {loading ? "Loading…" : `${houses.length} categor${houses.length === 1 ? "y" : "ies"}`}
      </p>

      <form onSubmit={save}>
        <div className={adminTableWrap}>
          <table className={`${adminTable} min-w-[640px]`}>
            <thead>
              <tr className="border-b border-paper/15 bg-paper/[0.03]">
                <th className={adminTh}>Category</th>
                <th className={adminTh}>Points</th>
                <th className={adminTh}>Action</th>
              </tr>
            </thead>
            <tbody>
              {houses.map((house) => (
                <tr key={house._id} className={adminTr}>
                  <td className={adminTd}>
                    <input
                      value={house.name}
                      onChange={(e) => onChange(house._id, "name", e.target.value)}
                      className={field}
                      required
                    />
                  </td>
                  <td className={`${adminTd} w-40`}>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={house.points}
                      onChange={(e) => onChange(house._id, "points", e.target.value)}
                      className={field}
                    />
                  </td>
                  <td className={`${adminTd} text-right`}>
                    <button
                      type="button"
                      disabled={busyId === house._id}
                      onClick={() => remove(house._id, house.name)}
                      className={adminDeleteBtn}
                    >
                      {busyId === house._id ? "…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && !houses.length && <p className="px-4 py-6 text-sm text-mute">No categories yet. Add one above.</p>}
        </div>

        <div className="mt-4">
          {error && <p className="mb-2 text-ember">{error}</p>}
          {status && <p className="mb-2 text-gold">{status}</p>}
          <button
            type="submit"
            disabled={busy || !houses.length}
            className="bg-ember px-6 py-2 text-[11px] uppercase tracking-[0.28em] disabled:opacity-40"
          >
            {busy ? "Saving…" : "Save point table"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminPoints;
