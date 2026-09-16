import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import "./cursor.css";

const MAX_PARTICLES = 18;

const Cursor = () => {
  const desktop = useMediaQuery("(hover: hover) and (pointer: fine) and (min-width: 1024px)");
  const reduce = useReducedMotion();
  const [label, setLabel] = useState("");
  const [hot, setHot] = useState(false);
  const wrap = useRef(null);
  const tip = useRef(null);
  const ring = useRef(null);
  const canvas = useRef(null);
  const target = useRef({ x: -200, y: -200 });
  const smooth = useRef({ x: -200, y: -200 });
  const particles = useRef([]);
  const angle = useRef(0);
  const raf = useRef(0);
  const hotRef = useRef(false);
  const lastSpawn = useRef(0);

  useEffect(() => {
    hotRef.current = hot;
  }, [hot]);

  useEffect(() => {
    if (!desktop) {
      document.body.classList.remove("has-cursor");
      return undefined;
    }
    document.body.classList.add("has-cursor");

    const cvs = canvas.current;
    const ctx = cvs?.getContext("2d");

    const sizeCanvas = () => {
      if (!cvs) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cvs.width = Math.floor(window.innerWidth * dpr);
      cvs.height = Math.floor(window.innerHeight * dpr);
      cvs.style.width = `${window.innerWidth}px`;
      cvs.style.height = `${window.innerHeight}px`;
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    sizeCanvas();

    const move = (e) => {
      target.current = { x: e.clientX, y: e.clientY };
      const el = e.target.closest("[data-cursor]");
      setLabel(el?.getAttribute("data-cursor") || "");
      setHot(Boolean(el) || Boolean(e.target.closest("a, button, [role='button']")));
    };

    const spawn = (x, y, force = false) => {
      if (reduce) return;
      const now = performance.now();
      if (!force && now - lastSpawn.current < 28) return;
      lastSpawn.current = now;
      particles.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * (hotRef.current ? 1.6 : 0.7),
        vy: (Math.random() - 0.5) * (hotRef.current ? 1.6 : 0.7),
        life: 1,
        size: hotRef.current ? 3.2 + Math.random() * 2.4 : 1.4 + Math.random() * 1.8,
        hue: Math.random() > 0.55 ? "gold" : "ember",
      });
      if (particles.current.length > MAX_PARTICLES) particles.current.shift();
    };

    const tick = () => {
      const t = target.current;
      const s = smooth.current;
      const ease = hotRef.current ? 0.22 : 0.14;
      s.x += (t.x - s.x) * ease;
      s.y += (t.y - s.y) * ease;
      angle.current += hotRef.current ? 0.06 : 0.03;

      const dist = Math.hypot(t.x - s.x, t.y - s.y);
      if (dist > 2) spawn(s.x, s.y);

      if (tip.current) {
        tip.current.style.transform = `translate3d(${t.x}px, ${t.y}px, 0) translate(-50%, -50%) rotate(${angle.current * 12}deg)`;
      }
      if (ring.current) {
        const spin = angle.current * (180 / Math.PI);
        ring.current.style.transform = `translate3d(${s.x}px, ${s.y}px, 0) translate(-50%, -50%) rotate(${spin}deg)`;
      }

      if (ctx && cvs) {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        particles.current = particles.current.filter((p) => p.life > 0.02);
        for (const p of particles.current) {
          p.x += p.vx;
          p.y += p.vy;
          p.life *= 0.92;
          p.vx *= 0.96;
          p.vy *= 0.96;
          ctx.beginPath();
          ctx.fillStyle =
            p.hue === "gold"
              ? `rgba(215, 181, 109, ${p.life * 0.85})`
              : `rgba(196, 92, 45, ${p.life * 0.8})`;
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fill();
        }

        // orbiting sparks around the lagging ring
        if (!reduce) {
          const radius = hotRef.current ? 34 : 22;
          for (let i = 0; i < 3; i += 1) {
            const a = angle.current + (i * Math.PI * 2) / 3;
            const ox = s.x + Math.cos(a) * radius;
            const oy = s.y + Math.sin(a) * radius;
            ctx.beginPath();
            ctx.fillStyle = i % 2 ? "rgba(215,181,109,0.9)" : "rgba(243,236,224,0.75)";
            ctx.arc(ox, oy, hotRef.current ? 2.4 : 1.6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      raf.current = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("resize", sizeCanvas);
    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("resize", sizeCanvas);
      cancelAnimationFrame(raf.current);
      document.body.classList.remove("has-cursor");
    };
  }, [desktop, reduce]);

  if (!desktop) return null;

  return (
    <div className="cursor-layer" aria-hidden ref={wrap}>
      <canvas ref={canvas} className="cursor-canvas" />
      <div ref={ring} className={`cursor-ring${hot ? " is-hot" : ""}`}>
        <span className="cursor-ring-mark" />
        <span className="cursor-ring-mark" />
        <span className="cursor-ring-mark" />
        <span className="cursor-ring-mark" />
      </div>
      <div ref={tip} className={`cursor-tip${hot ? " is-hot" : ""}`}>
        <span className="cursor-diamond" />
        {label ? <span className="cursor-label">{label}</span> : null}
      </div>
    </div>
  );
};

export default Cursor;
