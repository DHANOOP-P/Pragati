import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import api from "../../api/client";
import ErrorState from "../ui/ErrorState";
import "./eventRiver.css";

gsap.registerPlugin(ScrollTrigger);

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
  pathBase = "/proshows",
  badge,
  toAll = "/proshows",
  priceKey,
  asPage = false,
}) => {
  const pinRef = useRef(null);
  const sceneRef = useRef(null);
  const [items, setItems] = useState(given || []);
  const [error, setError] = useState(false);

  const load = () => {
    setError(false);
    api
      .get("/proshows")
      .then((res) => setItems(res.data || []))
      .catch((err) => {
        console.error(err);
        setError(true);
      });
  };

  useEffect(() => {
    if (given !== undefined) {
      setItems(given);
      return undefined;
    }
    load();
    return undefined;
  }, [given]);

  useLayoutEffect(() => {
    const pin = pinRef.current;
    const scene = sceneRef.current;
    if (!pin || !scene || !items?.length) return undefined;

    const cards = gsap.utils.toArray(".event-river-card", scene);
    const n = cards.length;
    if (!n) return undefined;

    const pose = (i, t) => {
      const lean = i % 2 ? 1 : -1;
      const w = Math.max(scene.clientWidth, 320);
      const h = Math.max(scene.clientHeight, 240);
      const fromX = w * 0.55;
      const fromY = h * 0.36;
      const toX = -w * 0.55;
      const toY = -h * 0.36;

      if (t <= 0) {
        return i === 0
          ? { x: fromX, y: fromY, rotate: 10 * lean, scale: 0.38, opacity: 1 }
          : { x: fromX, y: fromY, rotate: 12 * lean, scale: 0.28, opacity: 0 };
      }
      if (t <= 0.45) {
        const p = easeInOut(t / 0.45);
        return {
          x: mix(fromX, 0, p),
          y: mix(fromY, 0, p),
          rotate: mix(10 * lean, 0, p),
          scale: mix(0.38, 1, p),
          opacity: 1,
        };
      }
      if (t < 0.55 || i === n - 1) {
        return { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 };
      }
      const p = easeInOut((t - 0.55) / 0.45);
      return {
        x: mix(0, toX, p),
        y: mix(0, toY, p),
        rotate: mix(0, -12 * lean, p),
        scale: mix(1, 0.28, p),
        opacity: mix(1, 0, p),
      };
    };

    const apply = (progress) => {
      cards.forEach((card, i) => {
        const start = i / n;
        const local = clamp((progress - start) / (1 / n), 0, 1);
        const p = pose(i, local);

        gsap.set(card, {
          xPercent: -50,
          yPercent: -50,
          x: p.x,
          y: p.y,
          rotate: p.rotate,
          scale: p.scale,
          opacity: p.opacity,
          zIndex: 2 + i + Math.round(local * 10),
          force3D: true,
        });
        card.classList.toggle("is-focus", i === n - 1 ? local > 0.3 : local > 0.3 && local < 0.7);
      });
    };

    const read = () => {
      const span = pin.offsetHeight - window.innerHeight;
      if (span <= 1) return 0;
      return clamp(-pin.getBoundingClientRect().top / span, 0, 1);
    };

    const layout = () => {
      pin.style.height = `${window.innerHeight * (1 + n * 1.15)}px`;
    };

    const tick = () => apply(read());

    layout();
    apply(0);
    gsap.ticker.add(tick);
    requestAnimationFrame(() => ScrollTrigger.refresh());

    const onResize = () => {
      layout();
      apply(read());
    };
    window.addEventListener("resize", onResize);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("resize", onResize);
      pin.style.height = "";
    };
  }, [items?.length]);

  if (error && asPage) return <ErrorState onRetry={load} />;
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
                <article key={item._id} className="event-river-card">
                  <Link
                    to={`${pathBase}/${item._id}`}
                    data-cursor="ENTER"
                    className="event-river-shell"
                  >
                    {item.image ? <img src={item.image} alt="" loading="lazy" /> : null}
                    <div className="event-river-copy">
                      {/* <p className="text-[11px] uppercase tracking-[0.32em] text-ember">
                        {String(i + 1).padStart(2, "0")} ·{" "}
                        {typeof badge === "function" ? badge(item) : badge}
                      </p> */}
                      {/* <h3>{item.title}</h3> */}
                      {/* {item.description ? <p>{item.description}</p> : null} */}
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
