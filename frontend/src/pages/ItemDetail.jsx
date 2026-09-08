import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { startPaidCheckout } from "../utils/checkout";
import { downloadAuth } from "../utils/download";
import { mediaUrl } from "../utils/media";
import { isCollegeEmail } from "../utils/collegeEmail";
import { isServiceOpen } from "../utils/serviceGates";
import ErrorState from "../components/ui/ErrorState";
import ArtsRegisterForm from "../components/events/ArtsRegisterForm";

const ItemDetail = ({ type }) => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [item, setItem] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmPay, setConfirmPay] = useState(false);
  const [artsForm, setArtsForm] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [quota, setQuota] = useState(null);
  const endpoint = type === "arts" ? `/events/${id}` : type === "workshop" ? `/workshops/${id}` : `/proshows/${id}`;
  const paid = type !== "arts";

  useEffect(() => {
    api.get(endpoint).then((res) => setItem(res.data)).catch((err) => setError(err.message));
  }, [endpoint]);

  useEffect(() => {
    if (!user || type !== "arts") return undefined;
    api.get("/registrations/me/arts-quota").then((res) => setQuota(res.data)).catch(() => {});
    return undefined;
  }, [user, type]);

  useEffect(() => {
    if (!user) return undefined;
    api
      .get("/registrations/me")
      .then((res) => {
        const mine = (res.data || []).find((r) => r.itemType === type && String(r.itemId) === String(id));
        if (mine) setTicket(mine);
      })
      .catch(() => {});
    return undefined;
  }, [user, type, id]);

  useEffect(() => {
    if (type !== "arts" || params.get("register") !== "1" || !user || ticket) return;
    if (!isCollegeEmail(user.email)) {
      setError("Arts events are only for GEC Wayanad students. Sign in with a college mail like name_21b410cs@gecwyd.ac.in.");
      return;
    }
    setArtsForm(true);
  }, [type, params, user, ticket]);

  const register = async () => {
    if (!user) {
      navigate("/auth", { state: { from: window.location.pathname } });
      return;
    }
    if (type === "arts") {
    if (!isCollegeEmail(user.email)) {
      setError("Arts events are only for GEC Wayanad students. Sign in with a college mail like name_21b410cs@gecwyd.ac.in.");
      return;
    }
      setArtsForm(true);
      return;
    }
    if (!confirmPay) {
      setConfirmPay(true);
      return;
    }
    const open = await isServiceOpen(type);
    if (!open) {
      navigate("/unavailable", { state: { service: type } });
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await startPaidCheckout({
        itemType: type,
        itemId: id,
        user,
        onSuccess: (data) => {
          setMessage(data.message);
          if (data.registration) setTicket(data.registration);
          setConfirmPay(false);
        },
      });
    } catch (err) {
      console.error(err);
      if (err.code === "SERVICE_UNAVAILABLE") {
        navigate("/unavailable", { state: { service: type } });
        return;
      }
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const submitArts = async (details) => {
    const open = await isServiceOpen("arts");
    if (!open) {
      navigate("/unavailable", { state: { service: "arts" } });
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const { data } = await api.post(`/registrations/arts/${id}`, details);
      setMessage(data.message);
      if (data.quota) setQuota(data.quota);
      if (data.registration) setTicket(data.registration);
      setArtsForm(false);
    } catch (err) {
      console.error(err);
      if (err.code === "SERVICE_UNAVAILABLE") {
        navigate("/unavailable", { state: { service: "arts" } });
        return;
      }
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!item && !error) return <div className="grid min-h-screen place-items-center pt-24 text-gold">…</div>;
  if (!item) return <ErrorState />;

  const remaining = Math.max(0, item.capacity - item.registeredCount);
  const kind = item.participationType === "group" ? "group" : "individual";
  const taken = Boolean(ticket) || quota?.registeredIds?.includes(String(item._id));
  const limitHit = type === "arts" && quota && quota[kind]?.remaining <= 0 && !taken;
  const blocked = busy || !item.isOpen || remaining <= 0 || taken || limitHit;

  return (
    <div className="relative z-20 px-6 pb-24 pt-28 md:px-12">
      <Link to={type === "arts" ? "/events" : type === "workshop" ? "/workshops" : "/proshows"} className="text-[11px] uppercase tracking-[0.28em] text-mute hover:text-gold">
        Back
      </Link>
      <div className={`mx-auto mt-6 grid max-w-[1440px] gap-10 ${type === "arts" ? "" : "lg:grid-cols-2 lg:items-start"}`}>
        {type !== "arts" && item.image ? (
          <div className="flex w-full justify-center">
            <img
              src={mediaUrl(item.image, 900)}
              alt={item.title}
              className="h-auto w-full max-w-[22rem] object-contain object-center sm:max-w-md md:max-w-lg"
            />
          </div>
        ) : null}
        <div className={type === "arts" ? "max-w-2xl" : "w-full min-w-0"}>
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold">
            {type === "arts" ? "Free · college mail" : `Paid · ₹${item.price}`}
            {item.artist ? ` · ${item.artist}` : ""}
          </p>
          <h1 className="mt-3 font-display text-6xl md:text-8xl">{item.title}</h1>
          {item.artist && type === "proshow" ? (
            <p className="mt-3 text-sm uppercase tracking-[0.28em] text-ember">{item.artist}</p>
          ) : null}
          <p className="mt-6 font-serif text-2xl italic text-paper/70">{item.description}</p>
          {item.mentor && <p className="mt-4 text-sm uppercase tracking-[0.22em] text-ember">{item.mentor}</p>}
          <p className="mt-6 text-sm text-mute">
            {item.venue} · {new Date(item.date).toLocaleString("en-IN")}
          </p>
          <p className="mt-2 text-sm text-gold">
            {remaining} seats · {item.isOpen ? "Open" : "Closed"}
            {type === "arts" && item.stage ? ` · ${item.stage} · ${kind}` : ""}
          </p>
          {type === "arts" && quota && (
            <p className="mt-2 text-sm text-mute">
              Group {quota.group.used}/{quota.group.limit} · Individual {quota.individual.used}/{quota.individual.limit}
            </p>
          )}

          {ticket ? (
            <div className="mt-10 border border-gold/25 p-6">
              <p className="text-[11px] uppercase tracking-[0.3em] text-gold">Confirmed</p>
              <p className="mt-3 font-display text-3xl">{ticket.ticketCode}</p>
              <p className="mt-2 text-sm text-mute">
                Ticket sent to {user?.email}. Download it here or from your file.
              </p>
              <div className="mt-5 flex flex-wrap gap-4 text-[11px] uppercase tracking-[0.22em]">
                <button
                  type="button"
                  className="bg-ember px-6 py-3"
                  onClick={() => downloadAuth(`/api/registrations/${ticket._id}/ticket`, `${ticket.ticketCode}.pdf`)}
                >
                  Ticket
                </button>
                {ticket.invoicePath && (
                  <button
                    type="button"
                    className="border border-gold/40 px-6 py-3 text-gold"
                    onClick={() => downloadAuth(`/api/registrations/${ticket._id}/invoice`, `invoice-${ticket.ticketCode}.pdf`)}
                  >
                    Invoice
                  </button>
                )}
                <Link to="/dashboard" className="px-6 py-3 text-gold">
                  Your file
                </Link>
              </div>
            </div>
          ) : artsForm && type === "arts" ? (
            <ArtsRegisterForm
              item={item}
              user={user}
              busy={busy}
              onCancel={() => setArtsForm(false)}
              onSubmit={submitArts}
            />
          ) : confirmPay ? (
            <div className="mt-10 border border-paper/15 p-6">
              <p className="text-[11px] uppercase tracking-[0.3em] text-ember">Confirm pay</p>
              <p className="mt-3 font-serif text-2xl italic">
                Pay ₹{item.price} for {item.title}?
              </p>
              <p className="mt-2 text-sm text-mute">
                After payment a ticket is created and mailed to {user?.email}.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={register}
                  data-cursor="GO"
                  className="bg-ember px-10 py-4 text-[11px] uppercase tracking-[0.32em] disabled:opacity-40"
                >
                  {busy ? "Working…" : "Pay now"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setConfirmPay(false)}
                  className="px-8 py-4 text-[11px] uppercase tracking-[0.28em] text-mute"
                >
                  Back
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={blocked}
              onClick={register}
              data-cursor="GO"
              className="mt-10 bg-ember px-10 py-4 text-[11px] uppercase tracking-[0.32em] disabled:opacity-40"
            >
              {busy ? "Working…" : taken ? "Registered" : limitHit ? "Limit reached" : type === "arts" ? "Register free" : `Register · ₹${item.price}`}
            </button>
          )}

          {message && !ticket && (
            <p className="mt-4 text-gold">
              {message} <Link to="/dashboard">Your file</Link>
            </p>
          )}
          {error && <p className="mt-4 text-ember">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
