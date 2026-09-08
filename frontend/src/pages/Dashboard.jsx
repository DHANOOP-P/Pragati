import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { downloadAuth } from "../utils/download";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [regs, setRegs] = useState([]);
  const [certs, setCerts] = useState([]);

  useEffect(() => {
    api.get("/registrations/me").then((res) => setRegs(res.data)).catch(console.error);
    api.get("/certificates/me").then((res) => setCerts(res.data)).catch(console.error);
  }, []);

  return (
    <div className="relative z-20 bg-void px-6 pb-24 pt-28 md:px-12">
      <p className="text-[11px] uppercase tracking-[0.35em] text-ember">Your file</p>
      <h1 className="mt-2 font-display text-6xl">{user?.name}</h1>
      <p className="mt-2 text-mute">{user?.email}</p>
      <button
        type="button"
        className="mt-5 text-[11px] uppercase tracking-[0.28em] text-ember"
        onClick={() => {
          logout();
          navigate("/");
        }}
      >
        Logout
      </button>
      <h2 className="mt-14 font-display text-3xl text-gold">Tickets</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {regs.map((r) => (
          <div key={r._id} className="border border-paper/10 p-5">
            <p className="text-[10px] uppercase tracking-[0.28em] text-ember">{r.itemType}</p>
            <h3 className="font-display text-2xl">{r.itemTitle}</h3>
            <p className="mt-1 text-sm text-mute">{r.ticketCode} · ₹{r.amount}</p>
            <div className="mt-4 flex gap-4 text-[11px] uppercase tracking-[0.2em]">
              <button type="button" onClick={() => downloadAuth(`/api/registrations/${r._id}/ticket`, `${r.ticketCode}.pdf`)}>
                Ticket
              </button>
              {r.invoicePath && (
                <button type="button" className="text-gold" onClick={() => downloadAuth(`/api/registrations/${r._id}/invoice`, `invoice-${r.ticketCode}.pdf`)}>
                  Invoice
                </button>
              )}
            </div>
          </div>
        ))}
        {!regs.length && (
          <p className="text-mute">
            Empty. Browse <Link to="/events" className="text-gold">arts</Link>.
          </p>
        )}
      </div>
      <h2 className="mt-14 font-display text-3xl text-gold">Certificates</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {certs.map((c) => (
          <div key={c._id} className="border border-gold/20 p-5">
            <h3 className="font-display text-2xl">{c.studentName}</h3>
            <button
              type="button"
              className="mt-3 text-[11px] uppercase tracking-[0.2em] text-gold"
              onClick={() => downloadAuth(`/api/certificates/${c._id}/download`, `${c.studentName}.pdf`)}
            >
              Download
            </button>
          </div>
        ))}
        {!certs.length && <p className="text-mute">No certificate matched yet.</p>}
      </div>
    </div>
  );
};

export default Dashboard;
