import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useTransform } from "framer-motion";
import gsap from "gsap";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { mediaUrl } from "../../utils/media";
import "./stageCards.css";

const ONSTAGE = new Set(["dance", "music", "theatre", "stage"]);

export const isOnstageEvent = (item) => {
  const stage = String(item?.stage || "").toLowerCase();
  if (stage === "onstage") return true;
  if (stage === "offstage") return false;
  return ONSTAGE.has(String(item?.category || "").toLowerCase());
};

const CARD_IMAGES = {
  onstage: "/assets/stage/onstage.jpg",
  offstage: "/assets/stage/offstage.jpg",
};

const fmtDate = (value, fallback) => {
  if (!value) return fallback;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return fallback;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }).replace(" ", " ");
};

const Arrow = () => (
  <svg className="stage-card-arrow" viewBox="0 0 24 24" aria-hidden>
    <path d="M7 17L17 7M10 7h7v7" fill="none" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

const Spark = () => (
  <svg className="stage-card-spark" viewBox="0 0 24 24" aria-hidden>
    <path d="M12 1.2l1.35 8.15L21.8 12l-8.45 2.65L12 22.8l-1.35-8.15L2.2 12l8.45-2.65L12 1.2z" fill="currentColor" />
  </svg>
);

const flyWide = {
  left: { x: -55, y: -50, scale: 0.18, opacity: 0 },
  right: { x: 55, y: -50, scale: 0.18, opacity: 0 },
};

const flyCompact = {
  left: { x: -18, y: -12, scale: 0.42, opacity: 0 },
  right: { x: 18, y: -12, scale: 0.42, opacity: 0 },
};

const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const easeOut = (t) => 1 - (1 - t) ** 2;

const notice = "Registration only for GECW students";
const noticeLoop = Array.from({ length: 8 }, () => notice);

const StageCardFly = ({ progress, from, compact, children }) => {
  const src = compact ? flyCompact[from] : flyWide[from];
  const x = useTransform(progress, (t) => `${src.x * (1 - t)}vw`);
  const y = useTransform(progress, (t) => `${src.y * (1 - t)}vh`);
  const scale = useTransform(progress, (t) => src.scale + (1 - src.scale) * t);
  const opacity = useTransform(progress, (t) => src.opacity + (1 - src.opacity) * Math.min(1, t * 1.35));
  return (
    <motion.div className="stage-card-fly" style={{ x, y, scale, opacity }}>
      {children}
    </motion.div>
  );
};

const StageCards = ({ events = [] }) => {
  const reduce = useReducedMotion();
  const compact = useMediaQuery("(max-width: 767px)");
  const sceneRef = useRef(null);
  const progress = useMotionValue(reduce ? 1 : 0);
  const [settled, setSettled] = useState(reduce);
  const onstage = events.filter(isOnstageEvent);
  const offstage = events.filter((item) => !isOnstageEvent(item));

  useEffect(() => {
    if (reduce) {
      progress.set(1);
      setSettled(true);
      return undefined;
    }
    const el = sceneRef.current;
    if (!el) return undefined;

    const tick = () => {
      const top = el.getBoundingClientRect().top;
      const vh = window.innerHeight || 1;
      const start = vh * 0.96;
      const end = compact ? vh * 0.46 : vh * 0.26;
      const raw = clamp((start - top) / Math.max(1, start - end), 0, 1);
      const next = easeOut(raw);
      progress.set(next);
      setSettled((was) => {
        const now = next > 0.97;
        return was === now ? was : now;
      });
    };

    tick();
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [reduce, compact, progress]);

  const headY = useTransform(progress, [0, 1], [28, 0]);
  const headOp = useTransform(progress, [0, 0.45, 1], [0, 1, 1]);
  const tickerOp = useTransform(progress, [0.15, 0.7], [0, 1]);

  const cards = [
    {
      to: "/events?stage=offstage",
      title: "Offstage",
      date: fmtDate(offstage[0]?.date, "12 Mar"),
      image: CARD_IMAGES.offstage,
      from: "left",
    },
    {
      to: "/events?stage=onstage",
      title: "Onstage",
      date: fmtDate(onstage[0]?.date, "12 Mar"),
      image: CARD_IMAGES.onstage,
      from: "right",
    },
  ];

  return (
    <section ref={sceneRef} className="stage-lineup relative z-20">
      <div className="stage-void">
        <motion.div className="stage-head relative z-10 px-6 text-center md:px-12" style={{ y: headY, opacity: headOp }}>
          <p className="text-[11px] uppercase tracking-[0.4em] text-ember">Arts · two courts</p>
          <h2 className="mt-3 font-display text-5xl md:text-7xl">The docket</h2>
        </motion.div>
      </div>

      <div className="stage-board">
        <motion.div className="stage-ticker stage-ticker-cards" aria-hidden style={{ opacity: tickerOp }}>
          <div className="stage-ticker-row">
            <p className={`stage-ticker-track ${reduce ? "" : "is-moving"}`}>
              {noticeLoop.map((line, i) => (
                <span key={`c-${i}`}>{line}</span>
              ))}
            </p>
          </div>
          <div className="stage-ticker-row">
            <p className={`stage-ticker-track is-rev ${reduce ? "" : "is-moving"}`}>
              {noticeLoop.map((line, i) => (
                <span key={`d-${i}`}>{line}</span>
              ))}
            </p>
          </div>
        </motion.div>
        <div className="stage-row px-6 md:px-12">
          {cards.map((card) => (
            <div key={card.title} className="stage-card">
              <div className="stage-card-io">
                <StageCardFly progress={progress} from={card.from} compact={compact}>
                  <span className={`stage-card-bob ${settled && !reduce ? "is-live" : ""}`}>
                    <Link to={card.to} data-cursor="ENTER" className="stage-card-link">
                      <span className="stage-card-tilt">
                        <img src={mediaUrl(card.image, 900)} alt="" loading="lazy" className="stage-card-img" />
                        <span className="stage-card-frame" aria-hidden />
                        <Arrow />
                        <div className="stage-card-plate">
                          <h3>{card.title}</h3>
                        </div>
                        <Spark />
                        <span className="stage-card-date">{card.date}.</span>
                      </span>
                    </Link>
                  </span>
                </StageCardFly>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StageCards;
