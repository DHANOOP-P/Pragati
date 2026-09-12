import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import api from "../../api/client";
import { FEATURED_PREEVENTS, mergePreevents } from "../../data/featuredCatalog";
import { mediaUrl } from "../../utils/media";
import "./preEvents.css";

gsap.registerPlugin(ScrollTrigger);

const fmtWhen = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
};

const waitImages = (root) =>
  Promise.all(
    [...root.querySelectorAll("img")].map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((resolve) => {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
          })
    )
  );

const PreEvents = ({ asPage = false, items: given, loading: givenLoading }) => {
  const reduce = useReducedMotion();
  const pinRef = useRef(null);
  const stickyRef = useRef(null);
  const sceneRef = useRef(null);
  const trackRef = useRef(null);
  const [items, setItems] = useState(() => (given?.length ? given : FEATURED_PREEVENTS));
  const [selfLoading, setSelfLoading] = useState(given === undefined);
  const loading = given !== undefined ? Boolean(givenLoading) : selfLoading;

  useEffect(() => {
    if (given !== undefined) {
      setItems(given.length ? given : FEATURED_PREEVENTS);
      return undefined;
    }
    setSelfLoading(true);
    api
      .get("/preevents")
      .then((res) => setItems(mergePreevents(res.data)))
      .catch(() => setItems(FEATURED_PREEVENTS))
      .finally(() => setSelfLoading(false));
    return undefined;
  }, [given]);

  useLayoutEffect(() => {
    const pin = pinRef.current;
    const sticky = stickyRef.current;
    const scene = sceneRef.current;
    const track = trackRef.current;
    if (!pin || !sticky || !scene || !track || reduce || !items.length) return undefined;

    const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const shift = () => {
        const overflow = Math.max(0, track.scrollWidth - scene.clientWidth);
        const card = track.querySelector(".pre-event-card");
        const minTravel = card?.offsetWidth || window.innerWidth * 0.32;
        return Math.max(overflow, minTravel * 0.85);
      };
      const layout = () => {
        pin.style.height = `${sticky.offsetHeight + shift() + window.innerHeight * 0.55}px`;
      };
      const tick = () => {
        const span = pin.offsetHeight - window.innerHeight;
        if (span <= 1) return;
        const p = clamp(-pin.getBoundingClientRect().top / span, 0, 1);
        gsap.set(track, { x: -shift() * p, force3D: true });
      };

      gsap.set(track, { x: 0, force3D: true });
      layout();
      tick();
      gsap.ticker.add(tick);

      const onResize = () => {
        layout();
        tick();
      };
      window.addEventListener("resize", onResize);
      waitImages(track).then(() => {
        layout();
        tick();
      });

      return () => {
        gsap.ticker.remove(tick);
        window.removeEventListener("resize", onResize);
        pin.style.height = "";
        gsap.set(track, { x: 0 });
      };
    });

    mm.add("(max-width: 767px)", () => {
      pin.style.height = "";
      const tweens = gsap.utils.toArray(".pre-event-card", track).map((card, i) =>
        gsap.fromTo(
          card,
          { y: 64, rotate: i % 2 ? 4 : -4 },
          {
            y: 0,
            rotate: 0,
            ease: "none",
            immediateRender: true,
            scrollTrigger: {
              trigger: card,
              start: "top 92%",
              end: "top 52%",
              scrub: 0.35,
            },
          }
        )
      );
      return () => {
        tweens.forEach((tween) => tween.scrollTrigger?.kill() || tween.kill());
        gsap.set(track.querySelectorAll(".pre-event-card"), { clearProps: "transform,y,rotate" });
      };
    });

    return () => mm.revert();
  }, [reduce, items.length]);

  if (!items.length && !asPage) return null;

  return (
    <section
      className={`pre-events${asPage ? " is-page" : ""}${asPage && loading && !items.length ? " is-loading" : ""}`}
      aria-label="Pre events"
      aria-busy={asPage && loading && !items.length}
    >
      <div ref={pinRef} className="pre-events-pin">
        <div ref={stickyRef} className="pre-events-sticky">
          <div className="pre-events-head">
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-ember">GECW only · no register</p>
              {asPage ? (
                <h1 className="mt-2 font-display text-5xl md:text-7xl">Pre events</h1>
              ) : (
                <h2 className="mt-2 font-display text-5xl md:text-7xl">Pre events</h2>
              )}
              <p className="mt-3 max-w-md font-serif text-lg italic text-mute">
                Campus only. Walk in — no ticket, no form.
              </p>
            </div>
            {!asPage && (
              <Link to="/preevents" className="text-[11px] uppercase tracking-[0.28em] text-gold">
                View all
              </Link>
            )}
          </div>
          {asPage && loading && !items.length ? (
            <p className="pre-events-loading font-serif text-lg italic text-mute">Loading…</p>
          ) : null}

          {items.length ? (
            <div ref={sceneRef} className="pre-events-scene">
              <div ref={trackRef} className="pre-events-track">
                {items.map((item, i) => (
                  <article key={item._id || item.title} className="pre-event-card">
                    <div className="pre-event-shell">
                      {item.image ? <img src={mediaUrl(item.image, 900)} alt="" loading="lazy" /> : null}
                      <div className="pre-event-copy">
                        <p className="text-[11px] uppercase tracking-[0.32em] text-ember">
                          {String(i + 1).padStart(2, "0")} · {item.category || "Campus"}
                        </p>
                        <h3>{item.title}</h3>
                        {item.description ? <p>{item.description}</p> : null}
                        <span className="pre-event-meta">
                          {[fmtWhen(item.date), item.venue].filter(Boolean).join(" · ")}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default PreEvents;
