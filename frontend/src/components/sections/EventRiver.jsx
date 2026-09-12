import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import api from "../../api/client";
import ErrorState from "../ui/ErrorState";
import { FEATURED_PROSHOWS, mergeProshows } from "../../data/featuredCatalog";
import { mediaUrl } from "../../utils/media";
import "./eventRiver.css";

const TICKER = ["grab tickets", "ensure your seat", "enjoy the night"];
const tickerLoop = [...TICKER, ...TICKER, ...TICKER];

const fmtWhen = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
};

const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const mix = (a, b, t) => a + (b - a) * t;
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

const EventRiver = ({
  title = "Night court",
  kicker = "Proshow · paid",
  items: given,
  loading: givenLoading,
  pathBase = "/proshows",
  badge,
  toAll = "/proshows",
  priceKey,
  asPage = false,
}) => {
  const pinRef = useRef(null);
  const sceneRef = useRef(null);
  const [items, setItems] = useState(() => (given?.length ? given : FEATURED_PROSHOWS));
  const [error, setError] = useState(false);
  const [selfLoading, setSelfLoading] = useState(given === undefined);
  const loading = given !== undefined ? Boolean(givenLoading) : selfLoading;

  const load = () => {
    setError(false);
    setSelfLoading(true);
    api
      .get("/proshows")
      .then((res) => setItems(mergeProshows(res.data)))
      .catch((err) => {
        console.error(err);
        setError(true);
        setItems((cur) => (cur.length ? cur : FEATURED_PROSHOWS));
      })
      .finally(() => setSelfLoading(false));
  };

  useEffect(() => {
    if (given !== undefined) {
      setItems(given.length ? given : FEATURED_PROSHOWS);
      return undefined;
    }
    load();
    return undefined;
  }, [given]);

  useLayoutEffect(() => {
    const pin = pinRef.current;
    const scene = sceneRef.current;
    if (!pin || !scene || !items?.length) return undefined;

    const cards = [...scene.querySelectorAll(".event-river-card")];
    const n = cards.length;
    if (!n) return undefined;

    if (typeof pin._riverTick === "function") {
      gsap.ticker.remove(pin._riverTick);
      pin._riverTick = null;
    }

    const rush = (t) => {
      if (t < 0.38) return easeInOut(t / 0.38) * 0.58;
      return mix(0.58, 1, easeInOut((t - 0.38) / 0.62));
    };

    const scaleAt = (travel) => mix(1, 0.06, easeInOut(clamp(travel, 0, 1) ** 0.72));

    const pose = (i, t) => {
      const lean = i % 2 ? 1 : -1;
      const w = Math.max(scene.clientWidth, 320);
      const h = Math.max(scene.clientHeight, 240);
      const fromX = w * (1.08 + i * 0.14);
      const fromY = h * (0.88 + (i % 2) * 0.12);
      const toX = -w * (1.08 + i * 0.14);
      const toY = -h * (0.88 + ((i + 1) % 2) * 0.12);

      if (t <= 0) {
        return { x: fromX, y: fromY, rotate: 18 * lean, scale: 0.06, opacity: 0 };
      }
      if (t <= 0.45) {
        const p = rush(t / 0.45);
        return {
          x: mix(fromX, 0, p),
          y: mix(fromY, 0, p),
          rotate: mix(18 * lean, 0, p),
          scale: scaleAt(1 - p),
          opacity: clamp((p - 0.34) / 0.16, 0, 1),
        };
      }
      if (t < 0.55 || i === n - 1) {
        return { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 };
      }
      const p = rush((t - 0.55) / 0.45);
      return {
        x: mix(0, toX, p),
        y: mix(0, toY, p),
        rotate: mix(0, -18 * lean, p),
        scale: scaleAt(p),
        opacity: clamp(1 - (p - 0.72) / 0.22, 0, 1),
      };
    };

    const apply = (progress) => {
      const cursor = n === 1 ? 0.5 : progress * (n - 1);
      cards.forEach((card, i) => {
        const local = n === 1 ? 0.5 : clamp((cursor - i + 1.12) / 2, 0, 1);
        const p = pose(i, local);
        card.style.opacity = String(p.opacity);
        card.style.zIndex = String(2 + i + Math.round(local * 10));
        card.style.transform = `translate(-50%, -50%) translate(${p.x}px, ${p.y}px) rotate(${p.rotate}deg) scale(${p.scale})`;
        card.classList.toggle("is-focus", i === n - 1 ? local > 0.3 : local > 0.28 && local < 0.72);
      });
    };

    const read = () => {
      const span = pin.offsetHeight - window.innerHeight;
      if (span <= 1) return 0;
      return clamp(-pin.getBoundingClientRect().top / span, 0, 1);
    };

    const layout = () => {
      pin.style.height = `${window.innerHeight * (1 + n * 1.4)}px`;
    };

    const tick = () => apply(read());
    pin._riverTick = tick;

    layout();
    apply(0);
    tick();
    const raf = requestAnimationFrame(tick);
    gsap.ticker.add(tick);

    const onResize = () => {
      layout();
      apply(read());
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      gsap.ticker.remove(tick);
      if (pin._riverTick === tick) pin._riverTick = null;
      window.removeEventListener("resize", onResize);
      pin.style.height = "";
    };
  }, [items]);

  if (error && asPage && !items?.length) return <ErrorState onRetry={load} />;
  if (asPage && loading && !items?.length) {
    return (
      <section
        className={`event-river is-loading${asPage ? " is-page" : ""}`}
        aria-label={title}
        aria-busy="true"
      >
        <div className="event-river-head">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-ember">{kicker}</p>
            {asPage ? (
              <h1 className="mt-2 font-display text-5xl md:text-7xl">{title}</h1>
            ) : (
              <h2 className="mt-2 font-display text-5xl md:text-7xl">{title}</h2>
            )}
          </div>
          {!asPage && toAll ? (
            <Link to={toAll} className="text-[11px] uppercase tracking-[0.28em] text-gold">
              All
            </Link>
          ) : null}
        </div>
        <p className="event-river-loading font-serif text-lg italic text-mute">Loading…</p>
      </section>
    );
  }
  if (!items?.length && !asPage) return null;

  return (
    <section className={`event-river${asPage ? " is-page" : ""}`} aria-label={title}>
      <div ref={pinRef} className="event-river-pin">
        <div className="event-river-sticky">
          <div className="event-river-head">
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-ember">{kicker}</p>
              {asPage ? (
                <h1 className="mt-2 font-display text-5xl md:text-7xl">{title}</h1>
              ) : (
                <h2 className="mt-2 font-display text-5xl md:text-7xl">{title}</h2>
              )}
            </div>
            {!asPage && toAll ? (
              <Link to={toAll} className="text-[11px] uppercase tracking-[0.28em] text-gold">
                All
              </Link>
            ) : null}
          </div>

          <div ref={sceneRef} className="event-river-scene">
            <div className="event-river-ticker-clip" aria-hidden>
              <div className="event-river-ticker">
                <p className="event-river-ticker-track">
                  {[...tickerLoop, ...tickerLoop].map((line, i) => (
                    <span key={`a-${i}`}>{line}</span>
                  ))}
                </p>
                <p className="event-river-ticker-track is-rev">
                  {[...tickerLoop, ...tickerLoop].map((line, i) => (
                    <span key={`b-${i}`}>{line}</span>
                  ))}
                </p>
                <p className="event-river-ticker-track">
                  {[...tickerLoop, ...tickerLoop].map((line, i) => (
                    <span key={`c-${i}`}>{line}</span>
                  ))}
                </p>
              </div>
            </div>
            {items.map((item, i) => {
              const price = priceKey === "free" ? 0 : item.price;
              return (
                <article
                  key={item._id || item.artist || `${item.title}-${i}`}
                  className={`event-river-card${i === 0 ? " is-focus" : ""}`}
                >
                  <Link
                    to={item._id ? `${pathBase}/${item._id}` : toAll || pathBase}
                    data-cursor="ENTER"
                    className="event-river-shell"
                  >
                    {item.image ? <img src={mediaUrl(item.image, 900)} alt="" loading="lazy" /> : null}
                    <div className="event-river-copy">
                      <p className="event-river-kicker">
                        {String(i + 1).padStart(2, "0")} ·{" "}
                        {typeof badge === "function" ? badge(item) : item.artist || badge || "Live"}
                      </p>
                      <h3>{item.title}</h3>
                      <span className="event-river-meta">
                        {[fmtWhen(item.date), item.venue, price === 0 ? "Free" : `₹${price}`]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventRiver;
