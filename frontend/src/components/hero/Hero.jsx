import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { createTypeMorph, waitTypeFonts } from "./typeMorph";
import "./hero.css";

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 70;
const FRAMES = Array.from(
  { length: FRAME_COUNT },
  (_, i) => `/assets/theyyam/frames/theyyam_${String(i).padStart(2, "0")}.webp`
);

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(src));
    img.src = src;
  });

const sizeCanvas = (canvas) => {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = document.documentElement.clientWidth || window.innerWidth;
  const h = window.innerHeight;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  return dpr;
};

const coverRect = (img, w, h) => {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = Math.max(w / iw, h / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  return {
    dx: (w - dw) / 2,
    dy: (h - dh) / 2,
    dw,
    dh,
  };
};

const Hero = () => {
  const root = useRef(null);
  const seqRef = useRef(null);
  const emberRef = useRef(null);
  const typeRef = useRef(null);
  const reduce = useReducedMotion();

  useLayoutEffect(() => {
    const rootEl = root.current;
    const seq = seqRef.current;
    const ember = emberRef.current;
    if (!rootEl || !seq) return undefined;

    const q = (sel) => rootEl.querySelector(sel);

    let cancelled = false;
    let ctx;
    let raf = 0;
    let drawing = true;
    let lastFrame = -1;
    let frameImgs = [];
    let onMove = () => {};
    let typeMorph = { draw: () => {}, destroy: () => {} };
    let morphT = 0;
    const paint = (f) => {
      if (!frameImgs.length) return;
      const n = frameImgs.length - 1;
      const clamped = Math.max(0, Math.min(n, f));
      if (Math.abs(clamped - lastFrame) < 0.006) return;
      lastFrame = clamped;
      const i = Math.min(n, Math.floor(clamped));
      const t = clamped - i;
      const c = seq.getContext("2d");
      const w = seq.width;
      const h = seq.height;
      c.globalAlpha = 1;
      c.fillStyle = "#050308";
      c.fillRect(0, 0, w, h);
      const a = frameImgs[i];
      const ra = coverRect(a, w, h);
      c.drawImage(a, ra.dx, ra.dy, ra.dw, ra.dh);
      const b = frameImgs[i + 1];
      if (t > 0.001 && b) {
        c.globalAlpha = t;
        const rb = coverRect(b, w, h);
        c.drawImage(b, rb.dx, rb.dy, rb.dw, rb.dh);
        c.globalAlpha = 1;
      }
    };
    const rebuildType = (mobile) => {
      const word = q(".hero-word");
      const year = q(".hero-year");
      const type = typeRef.current;
      if (!word || !year || !type) return;
      const run = (tries = 0) => {
        if (word.clientWidth < 80 && tries < 12) {
          requestAnimationFrame(() => run(tries + 1));
          return;
        }
        typeMorph.destroy?.();
        typeMorph = createTypeMorph(rootEl, type, word, year, mobile);
        typeMorph.draw(morphT);
      };
      requestAnimationFrame(() => run(0));
    };

    const applyMorph = (t) => {
      morphT = t;
      typeMorph.draw(t);
      const type = typeRef.current;
      if (!type) return;
      gsap.set([q(".hero-lang-en"), q(".hero-lang-ml"), q(".hero-year")], { opacity: 0 });
      gsap.set(type, { opacity: t <= 0 ? 0 : 1 });
    };

    const onResize = () => {
      sizeCanvas(seq);
      if (ember) sizeCanvas(ember);
      const current = Math.max(0, lastFrame);
      lastFrame = -1;
      paint(current);
      rebuildType(window.matchMedia("(max-width: 768px)").matches);
      ScrollTrigger.refresh();
    };

    const startEmbers = (mobile) => {
      if (!ember) return;
      const c = ember.getContext("2d");
      const dpr = sizeCanvas(ember);
      const dots = Array.from({ length: mobile ? 8 : 22 }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 1.2 + 0.25,
        v: Math.random() * 0.12 + 0.03,
        a: Math.random() * 0.4 + 0.15,
      }));
      const draw = () => {
        if (!drawing) return;
        const p = Number(rootEl.style.getPropertyValue("--hero-p")) || 0;
        c.clearRect(0, 0, ember.width, ember.height);
        dots.forEach((dot) => {
          dot.y -= (dot.v + p * 0.16) / 170;
          if (dot.y < 0) {
            dot.y = 1;
            dot.x = Math.random();
          }
          c.fillStyle = `rgba(220,70,40,${dot.a})`;
          c.beginPath();
          c.arc(dot.x * ember.width, dot.y * ember.height, dot.r * dpr, 0, Math.PI * 2);
          c.fill();
        });
        raf = requestAnimationFrame(draw);
      };
      draw();
    };

    const setupTimeline = (mobile) => {
      gsap.set(q(".theyyam-wrap"), { scale: 1, force3D: true });
      gsap.set([q(".hero-lang-en"), q(".hero-lang-ml"), q(".hero-year")], { opacity: 0 });
      gsap.set(typeRef.current, { opacity: 0 });
      applyMorph(0);

      const seqState = { f: 0 };
      const morph = { t: 0 };
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: rootEl,
          start: "top top",
          end: mobile ? "+=320%" : "+=430%",
          pin: true,
          pinSpacing: true,
          scrub: 0.45,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            rootEl.style.setProperty("--hero-p", String(self.progress));
          },
        },
      });

      tl.addLabel("start", 0)
        .to(q(".hero-hint"), { opacity: 0, duration: 0.55 }, 0)
        .to(
          seqState,
          {
            f: FRAME_COUNT - 1,
            duration: 6.5,
            ease: "none",
            onUpdate: () => paint(seqState.f),
          },
          0
        )
        .addLabel("eyesOpen", 1.75)
        .to(q(".hero-embers"), { opacity: 0.7, duration: 0.9 }, 1.5)
        .to(q(".hero-light"), { opacity: 0.32, duration: 1 }, 1.6)
        .addLabel("titleReveal", 1.7)
        .to(q(".hero-billboard"), { opacity: 1, duration: 0.15 }, 1.7)
        .to(
          morph,
          {
            t: 1,
            duration: 7.1,
            ease: "none",
            onUpdate: () => applyMorph(morph.t),
          },
          1.7
        )
        .addLabel("approach", 7.2)
        .to(
          q(".theyyam-wrap"),
          {
            scale: mobile ? 1.02 : 1.03,
            duration: 1.15,
            ease: "power1.in",
          },
          7.15
        )
        .to(q(".hero-light"), { scale: 1.2, opacity: 0.42, duration: 1.05 }, 7.2)
        .addLabel("transition", 7.85)
        .to(
          q(".theyyam-wrap"),
          {
            scale: mobile ? 1.04 : 1.06,
            filter: "blur(6px)",
            duration: 0.95,
          },
          7.85
        )
        .to(q(".hero-veil"), { opacity: 0.72, duration: 1 }, 7.9);

      const wrap = q(".theyyam-wrap");
      const mx = gsap.quickTo(wrap, "x", { duration: 0.8, ease: "power3.out" });
      const my = gsap.quickTo(wrap, "y", { duration: 0.8, ease: "power3.out" });
      onMove = (e) => {
        if (!window.matchMedia("(hover: hover)").matches) return;
        mx((e.clientX / window.innerWidth - 0.5) * 8);
        my((e.clientY / window.innerHeight - 0.5) * 5);
      };
      window.addEventListener("pointermove", onMove, { passive: true });
    };

    sizeCanvas(seq);
    window.addEventListener("resize", onResize);

    const startHero = () => {
      if (reduce) {
        rootEl.classList.add("is-static");
        lastFrame = -1;
        paint(FRAMES.length - 1);
        gsap.set(q(".hero-billboard"), { opacity: 1, y: 0 });
        gsap.set(q(".hero-lang-en"), { opacity: 0 });
        gsap.set(q(".hero-lang-ml"), { opacity: 1 });
        gsap.set(q(".hero-year"), { opacity: 1 });
        return;
      }

      const mobile = window.matchMedia("(max-width: 768px)").matches;
      startEmbers(mobile);
      waitTypeFonts(48).then(() => {
        if (cancelled) return;
        rebuildType(mobile);
        ctx = gsap.context(() => setupTimeline(mobile), rootEl);
        requestAnimationFrame(() => ScrollTrigger.refresh());
      });
    };

    loadImage(FRAMES[0])
      .then(async (first) => {
        if (cancelled) return;
        frameImgs = [first];
        paint(0);
        const rest = await Promise.all(FRAMES.slice(1).map(loadImage));
        if (cancelled) return;
        frameImgs = [first, ...rest];
        lastFrame = -1;
        paint(0);
        startHero();
      })
      .catch((err) => {
        console.error(err);
      });

    return () => {
      cancelled = true;
      drawing = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      typeMorph.destroy?.();
      ctx?.revert();
    };
  }, [reduce]);

  return (
    <section ref={root} className="hero-theyyam" aria-label="Theyyam awakening into Pragati">
      <div className="hero-bg" />

      <div className="theyyam-stage">
        <div className="theyyam-wrap">
          <canvas ref={seqRef} className="theyyam-seq" aria-hidden />
          <div className="theyyam-grade" aria-hidden>
            <span className="theyyam-grade-dark" />
            <span className="theyyam-grade-warm" />
            <span className="theyyam-grade-glow" />
            <span className="theyyam-grade-edge" />
          </div>
          <div className="theyyam-rim" />
        </div>
      </div>

      <div className="hero-light" aria-hidden />
      <canvas ref={emberRef} className="hero-embers" aria-hidden />
      <div className="hero-haze" aria-hidden />

      <canvas ref={typeRef} className="hero-type" aria-hidden />
      <div className="hero-copy">
        <h1 className="sr-only">PRAGATI 2025</h1>
        <div className="hero-billboard" aria-hidden="true">
          <div className="hero-word">
            <span className="hero-lang hero-lang-en">PRAGATI</span>
            <span className="hero-lang hero-lang-ml">പ്രഗതി</span>
          </div>
          <p className="hero-year">2025</p>
        </div>
      </div>

      <p className="hero-hint">
        <span>Scroll to enter</span>
        <span className="hero-hint-line" aria-hidden />
      </p>
      <div className="hero-veil" aria-hidden />
    </section>
  );
};

export default Hero;
