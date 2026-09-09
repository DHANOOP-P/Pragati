import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import ErrorState from "../components/ui/ErrorState";
import { isOnstageEvent } from "../components/sections/StageCards";
import { isCollegeEmail } from "../utils/collegeEmail";
import { isServiceOpen } from "../utils/serviceGates";
import "./events.css";

const STAGE_CARDS = [
  {
    stage: "offstage",
    title: "Offstage",
    kicker: "Literary · film · fine arts",
    image: "/assets/stage/offstage.jpg",
    tone: "offstage",
  },
  {
    stage: "onstage",
    title: "Onstage",
    kicker: "Dance · music · theatre",
    image: "/assets/stage/onstage.png",
    tone: "onstage",
  },
];

const KIND_CARDS = [
  { kind: "group", title: "Group", kicker: "Up to 3 events", tone: "group" },
  { kind: "individual", title: "Individual", kicker: "Up to 3 events", tone: "individual" },
];

const emptyQuota = {
  group: { used: 0, limit: 3, remaining: 3 },
  individual: { used: 0, limit: 3, remaining: 3 },
  registeredIds: [],
};

const fmtWhen = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
};

const ChoiceCard = ({ to, title, kicker, image, tone = "" }) => (
  <Link to={to} data-cursor="ENTER" className={`choice-card${tone ? ` is-${tone}` : ""}`}>
    <span className="choice-card-rim" aria-hidden />
    <span className="choice-card-ticks" aria-hidden />
    {image ? (
      <img src={image} alt="" className="choice-card-img" />
    ) : (
      <span className="choice-card-wash" aria-hidden />
    )}
    <span className="choice-card-shade" aria-hidden />
    <div className="choice-card-copy">
      <p>{kicker}</p>
      <h2>{title}</h2>
    </div>
  </Link>
);

const Events = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const stage = params.get("stage");
  const kind = params.get("kind");
  const [items, setItems] = useState([]);
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState("");
  const [quota, setQuota] = useState(emptyQuota);

  const load = () => {
    setError(false);
    api
      .get("/events")
      .then((res) => setItems(res.data))
      .catch((err) => {
        console.error(err);
        setError(true);
      });
  };

  const loadQuota = () => {
    if (!user) {
      setQuota(emptyQuota);
      return;
    }
    api
      .get("/registrations/me/arts-quota")
      .then((res) => setQuota(res.data))
      .catch(() => setQuota(emptyQuota));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    loadQuota();
  }, [user]);

  const rows = useMemo(() => {
    if (stage !== "onstage" && stage !== "offstage") return [];
    return items.filter((item) => {
      const on = isOnstageEvent(item);
      if (stage === "onstage" ? !on : on) return false;
      if (stage === "onstage" && (kind === "group" || kind === "individual")) {
        return String(item.participationType || "individual") === kind;
      }
      return true;
    });
  }, [items, stage, kind]);

  const register = async (event) => {
    if (!user) {
      navigate("/auth", { state: { from: `/events/${event._id}?register=1` } });
      return;
    }
    if (!isCollegeEmail(user.email)) {
      setMessage("Arts events are only for GEC Wayanad students. Sign in with a college mail like name_21b410cs@gecwyd.ac.in.");
      return;
    }
    const open = await isServiceOpen("arts");
    if (!open) {
      navigate("/unavailable", { state: { service: "arts" } });
      return;
    }
    navigate(`/events/${event._id}?register=1`);
  };

  if (error && !items.length) return <ErrorState onRetry={load} />;

  const showTable = stage === "offstage" || (stage === "onstage" && (kind === "group" || kind === "individual"));
  const heading =
    stage === "onstage" && kind === "group"
      ? "Group"
      : stage === "onstage" && kind === "individual"
        ? "Individual"
        : stage === "onstage"
          ? "Onstage"
          : stage === "offstage"
            ? "Offstage"
            : "Arts";
  const kicker =
    showTable && stage === "onstage"
      ? `${kind} · 3 events max`
      : stage === "offstage"
        ? "Literary · film · fine arts"
        : stage === "onstage"
          ? "Choose group or individual"
          : "College mail · free";

  return (
    <div className="relative z-20 px-6 pb-24 pt-28 md:px-12">
      <p className="text-[11px] uppercase tracking-[0.35em] text-ember">{kicker}</p>
      <h1 className="mt-3 font-display text-6xl md:text-8xl">{heading}</h1>

      <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-[11px] uppercase tracking-[0.22em] text-mute">
        <Link to="/events" className="hover:text-gold">
          Arts
        </Link>
        {stage && (
          <>
            <span>/</span>
            <Link to={`/events?stage=${stage}`} className="hover:text-gold">
              {stage}
            </Link>
          </>
        )}
        {kind && stage === "onstage" && (
          <>
            <span>/</span>
            <span className="text-paper">{kind}</span>
          </>
        )}
      </div>

      {user && showTable && (
        <p className="mt-6 text-sm text-gold">
          Group {quota.group.used}/{quota.group.limit} · Individual {quota.individual.used}/{quota.individual.limit}
        </p>
      )}

      {!stage && (
        <div className="choice-cards mt-12 grid gap-6 md:grid-cols-2">
          {STAGE_CARDS.map((card) => (
            <ChoiceCard key={card.stage} to={`/events?stage=${card.stage}`} {...card} />
          ))}
        </div>
      )}

      {stage === "onstage" && !kind && (
        <div className="choice-cards mt-12 grid gap-6 md:grid-cols-2">
          {KIND_CARDS.map((card) => (
            <ChoiceCard key={card.kind} to={`/events?stage=onstage&kind=${card.kind}`} title={card.title} kicker={card.kicker} tone={card.tone} />
          ))}
        </div>
      )}

      {showTable && (
        <div className="mt-12 overflow-x-auto border border-paper/10">
          <table className="min-w-full text-left">
            <thead className="border-b border-paper/10 text-[11px] uppercase tracking-[0.22em] text-mute">
              <tr>
                <th className="px-4 py-4 font-normal">Event</th>
                <th className="px-4 py-4 font-normal">Category</th>
                {stage === "offstage" && <th className="px-4 py-4 font-normal">Type</th>}
                <th className="px-4 py-4 font-normal">When</th>
                <th className="px-4 py-4 font-normal">Venue</th>
                <th className="px-4 py-4 font-normal">Seats</th>
                <th className="px-4 py-4 font-normal"> </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((event) => {
                const remaining = Math.max(0, event.capacity - event.registeredCount);
                const eventKind = event.participationType === "group" ? "group" : "individual";
                const taken = quota.registeredIds.includes(String(event._id));
                const limitHit = quota[eventKind]?.remaining <= 0 && !taken;
                const full = remaining <= 0;
                const closed = !event.isOpen;
                let label = "Register";
                if (taken) label = "Registered";
                else if (closed) label = "Closed";
                else if (full) label = "Full";
                else if (limitHit) label = "Limit reached";
                const disabled = Boolean(busyId) || taken || closed || full || limitHit;
                return (
                  <tr key={event._id} className="border-b border-paper/10 last:border-0">
                    <td className="px-4 py-4">
                      <Link to={`/events/${event._id}`} className="font-display text-xl hover:text-gold">
                        {event.title}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-sm text-mute">{event.category}</td>
                    {stage === "offstage" && (
                      <td className="px-4 py-4 text-sm capitalize text-mute">{eventKind}</td>
                    )}
                    <td className="px-4 py-4 text-sm text-mute">{fmtWhen(event.date)}</td>
                    <td className="px-4 py-4 text-sm text-mute">{event.venue}</td>
                    <td className="px-4 py-4 text-sm text-gold">{remaining}</td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => register(event)}
                        data-cursor="GO"
                        className="bg-ember px-5 py-2 text-[10px] uppercase tracking-[0.28em] disabled:opacity-40"
                      >
                        {busyId === event._id ? "Working…" : label}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!rows.length && (
                <tr>
                  <td colSpan={stage === "offstage" ? 7 : 6} className="px-4 py-10 text-mute">
                    No events in this court yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {message && <p className="mt-6 text-ember">{message}</p>}
    </div>
  );
};

export default Events;
