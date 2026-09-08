import { useEffect, useState } from "react";
import api from "../../api/client";

const AdminPoints = () => {
  const [houses, setHouses] = useState([]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => {
    setError("");
    api
      .get("/admin/points")
      .then((res) => setHouses(res.data || []))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (id, value) => {
    setHouses((rows) =>
      rows.map((row) => (row._id === id ? { ...row, points: value === "" ? "" : Number(value) } : row))
    );
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setStatus("");
    try {
      const { data } = await api.put("/admin/points", {
        houses: houses.map((row) => ({ _id: row._id, points: Number(row.points) || 0 })),
      });
      setHouses(data);
      setStatus("Point table saved. The public Points page will show the new ranks.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.35em] text-ember">Houses</p>
      <h1 className="mt-2 font-display text-4xl">Point table</h1>
      <p className="mt-3 max-w-xl text-sm text-mute">
        Update house scores. Rank on the public Points page follows these numbers.
      </p>

      <form onSubmit={save} className="mt-6 grid gap-3 border border-paper/10 p-5 md:grid-cols-2">
        {houses.map((house) => (
          <label key={house._id} className="text-sm text-mute">
            {house.name}
            <input
              type="number"
              min="0"
              step="1"
              value={house.points}
              onChange={(e) => onChange(house._id, e.target.value)}
              className="mt-1 w-full border border-paper/15 bg-transparent px-3 py-2 text-paper"
            />
          </label>
        ))}
        <div className="md:col-span-2">
          {error && <p className="mb-2 text-ember">{error}</p>}
          {status && <p className="mb-2 text-gold">{status}</p>}
          <button type="submit" disabled={busy || !houses.length} className="bg-ember px-6 py-2 text-[11px] uppercase tracking-[0.28em] disabled:opacity-40">
            {busy ? "Saving…" : "Save points"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminPoints;
