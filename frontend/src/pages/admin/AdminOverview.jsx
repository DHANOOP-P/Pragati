import { useEffect, useState } from "react";
import api from "../../api/client";
import "./adminGates.css";

const GATES = [
  { key: "proshowsOpen", label: "Proshow" },
  { key: "artsOpen", label: "Arts events" },
  { key: "workshopsOpen", label: "Workshops" },
];

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [gates, setGates] = useState({
    artsOpen: true,
    workshopsOpen: true,
    proshowsOpen: true,
  });
  const [busyKey, setBusyKey] = useState("");

  useEffect(() => {
    api.get("/admin/stats").then((res) => setStats(res.data)).catch(console.error);
    api.get("/admin/service-gates").then((res) => setGates(res.data)).catch(console.error);
  }, []);

  const toggle = async (key) => {
    const next = { ...gates, [key]: !gates[key] };
    setGates(next);
    setBusyKey(key);
    try {
      const { data } = await api.put("/admin/service-gates", next);
      setGates(data);
    } catch (err) {
      console.error(err);
      setGates((cur) => ({ ...cur, [key]: !next[key] }));
    } finally {
      setBusyKey("");
    }
  };

  const cards = [
    ["Students", stats?.users],
    ["Arts", stats?.events],
    ["Workshops", stats?.workshops],
    ["Proshows", stats?.proshows],
    ["Pre events", stats?.preevents],
    ["Event registrations", stats?.artsRegistrations],
    ["Paid registrations", stats?.paidRegistrations],
    ["Certificates", stats?.certificates],
  ];

  return (
    <div>
      <h1 className="font-display text-4xl">Overview</h1>

      <section className="admin-gates" aria-label="Service gates">
        <p>Service gates</p>
        <div className="admin-gates-list">
          {GATES.map((gate) => {
            const on = gates[gate.key] !== false;
            return (
              <button
                key={gate.key}
                type="button"
                role="switch"
                aria-checked={on}
                disabled={Boolean(busyKey)}
                onClick={() => toggle(gate.key)}
                className={on ? "is-on" : ""}
              >
                <span>
                  <b>{gate.label}</b>
                  <i>{on ? "Open · confirm goes to payment" : "Closed · confirm shows unavailable"}</i>
                </span>
                <span className="admin-switch" aria-hidden>
                  <span />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([label, value]) => (
          <div key={label} className="border border-paper/10 p-6">
            <p className="text-[11px] uppercase tracking-[0.28em] text-gold">{label}</p>
            <p className="mt-2 font-display text-5xl">{value ?? "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOverview;
