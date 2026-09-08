const EN = "PRAGATI";
const ML = "പ്രഗതി";
const YEAR = "2025";

const WHITE = [255, 244, 226];
const CREAM = [255, 214, 150];
const GOLD = [255, 176, 64];
const EMBER = [255, 92, 28];
const PAPER = "#f3ece0";

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (t) => Math.max(0, Math.min(1, t));
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

const rng = (seed) => {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

const makeGlyph = (text, font, letterSpacing, cssW, cssH, dpr, gap, align = "center") => {
  const off = document.createElement("canvas");
  off.width = Math.max(1, Math.floor(cssW * dpr));
  off.height = Math.max(1, Math.floor(cssH * dpr));
  const c = off.getContext("2d", { willReadFrequently: true });
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.clearRect(0, 0, cssW, cssH);
  c.fillStyle = PAPER;
  let drawFont = font;
  let drawX = align === "left" ? 0 : cssW / 2;
  const sizeMatch = font.match(/(\d+(?:\.\d+)?)px/);
  let fontSize = sizeMatch ? parseFloat(sizeMatch[1]) : 16;
  c.font = drawFont;
  c.textAlign = align;
  c.textBaseline = "middle";
  if ("letterSpacing" in c && letterSpacing && letterSpacing !== "0px") {
    c.letterSpacing = letterSpacing;
  }
  if (align === "center") {
    const fit = (size) => {
      const next = font.replace(/(\d+(?:\.\d+)?)px/, `${size}px`);
      c.font = next;
      return c.measureText(text);
    };
    let metrics = fit(fontSize);
    const advance = metrics.width || 1;
    if (advance > cssW * 0.92) {
      fontSize *= (cssW * 0.92) / advance;
      metrics = fit(fontSize);
    }
    const inkH =
      (metrics.actualBoundingBoxAscent || fontSize * 0.8) + (metrics.actualBoundingBoxDescent || fontSize * 0.25);
    if (inkH > cssH * 0.9) {
      fontSize *= (cssH * 0.9) / inkH;
      metrics = fit(fontSize);
    }
    drawFont = font.replace(/(\d+(?:\.\d+)?)px/, `${fontSize}px`);
    c.font = drawFont;
    const left = metrics.actualBoundingBoxLeft ?? metrics.width / 2;
    const right = metrics.actualBoundingBoxRight ?? metrics.width / 2;
    drawX = cssW / 2 + (left - right) / 2;
    c.fillText(text, drawX, cssH / 2);
  } else {
    c.fillText(text, drawX, cssH / 2);
  }
  const { data, width, height } = c.getImageData(0, 0, off.width, off.height);
  const pts = [];
  let minX = Infinity;
  let maxX = -Infinity;
  for (let y = 0; y < height; y += gap) {
    for (let x = 0; x < width; x += gap) {
      if (data[(y * width + x) * 4 + 3] > 132) {
        const px = x / dpr;
        pts.push({ x: px, y: y / dpr });
        if (px < minX) minX = px;
        if (px > maxX) maxX = px;
      }
    }
  }
  // #region agent log
  if (align === "center") {
    const metrics = c.measureText(text);
    fetch("http://127.0.0.1:7884/ingest/4b5f1749-191d-4b7d-83f1-1444aa54ee80", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "cede7e" },
      body: JSON.stringify({
        sessionId: "cede7e",
        runId: "pre-fix",
        hypothesisId: "A",
        location: "typeMorph.js:makeGlyph",
        message: "glyph metrics",
        data: {
          text,
          cssW: Math.round(cssW),
          drawX: Math.round(drawX),
          mid: Math.round(cssW / 2),
          shift: Math.round(drawX - cssW / 2),
          left: Math.round(metrics.actualBoundingBoxLeft || 0),
          right: Math.round(metrics.actualBoundingBoxRight || 0),
          inkMin: Number.isFinite(minX) ? Math.round(minX) : null,
          inkMax: Number.isFinite(maxX) ? Math.round(maxX) : null,
          inkCenter: Number.isFinite(minX) ? Math.round((minX + maxX) / 2) : null,
          inkOff: Number.isFinite(minX) ? Math.round((minX + maxX) / 2 - cssW / 2) : null,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }
  // #endregion
  return { canvas: off, pts, cssW, cssH, font: drawFont, drawX };
};

const takeEven = (pts, n) => {
  if (pts.length <= n) return pts.slice();
  const out = [];
  const step = pts.length / n;
  for (let i = 0; i < n; i += 1) out.push(pts[Math.floor(i * step)]);
  return out;
};

export const waitTypeFonts = (px) =>
  Promise.all([
    document.fonts.load(`800 ${px}px Syne`),
    document.fonts.load(`800 ${px}px "Baloo Chettan 2"`),
    document.fonts.load(`400 ${px}px "Instrument Serif"`),
    document.fonts.ready,
  ]);

const between = (t, a, b) => clamp((t - a) / (b - a));
const easeOut = (t) => 1 - (1 - t) ** 3;
const easeIn = (t) => t * t;

const gate = (t, a, b, c, d) => {
  if (t <= a || t >= d) return 0;
  if (t < b) return easeInOut((t - a) / (b - a));
  if (t <= c) return 1;
  return easeInOut(1 - (t - c) / (d - c));
};

export const createTypeMorph = (rootEl, canvas, wordEl, yearEl, mobile) => {
  const cssW = rootEl.clientWidth;
  const cssH = rootEl.clientHeight;
  if (!cssW || !cssH || !wordEl || !yearEl) return { draw: () => {}, destroy: () => {} };

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const sw = document.documentElement.clientWidth || window.innerWidth;
  const sh = window.innerHeight;
  canvas.width = Math.max(1, Math.floor(sw * dpr));
  canvas.height = Math.max(1, Math.floor(sh * dpr));
  canvas.style.width = `${sw}px`;
  canvas.style.height = `${sh}px`;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { draw: () => {}, destroy: () => {} };
  const home = canvas.parentNode;
  document.body.appendChild(canvas);
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.zIndex = "36";
  canvas.style.pointerEvents = "none";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const wordOrigin = wordEl.getBoundingClientRect();
  const yearOrigin = yearEl.getBoundingClientRect();
  // #region agent log
  fetch("http://127.0.0.1:7884/ingest/4b5f1749-191d-4b7d-83f1-1444aa54ee80", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "cede7e" },
    body: JSON.stringify({
      sessionId: "cede7e",
      runId: "pre-fix",
      hypothesisId: "C",
      location: "typeMorph.js:createTypeMorph",
      message: "word box vs viewport",
      data: {
        sw,
        wordLeft: Math.round(wordOrigin.left),
        wordW: Math.round(wordOrigin.width),
        wordMid: Math.round((wordOrigin.left + wordOrigin.right) / 2),
        viewMid: Math.round(sw / 2),
        boxOff: Math.round((wordOrigin.left + wordOrigin.right) / 2 - sw / 2),
        mobile,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  const place = (origin, pts) => pts.map((p) => ({ x: p.x + origin.left, y: p.y + origin.top }));

  const gap = mobile ? 3 : 2;
  const wordCap = mobile ? 900 : 2000;
  const yearCap = mobile ? 320 : 700;
  const wordSize = parseFloat(getComputedStyle(wordEl).fontSize);
  const yearSize = parseFloat(getComputedStyle(yearEl).fontSize);
  const mlEl = wordEl.querySelector(".hero-lang-ml");
  const mlSize = mlEl ? parseFloat(getComputedStyle(mlEl).fontSize) : wordSize * 1.62;
  const enFont = `800 ${wordSize}px Syne`;
  const mlFont = `800 ${mlSize}px "Baloo Chettan 2"`;
  const yrFont = `400 ${yearSize}px "Instrument Serif"`;
  const enSpace = `${-0.02 * wordSize}px`;
  const mlSpace = "0px";
  const yrSpace = `${-0.03 * yearSize}px`;

  const enGlyph = makeGlyph(EN, enFont, enSpace, wordEl.clientWidth, wordEl.clientHeight, dpr, gap);
  const mlGlyph = makeGlyph(ML, mlFont, mlSpace, wordEl.clientWidth, wordEl.clientHeight, dpr, gap);
  const yrGlyph = makeGlyph(YEAR, yrFont, yrSpace, yearEl.clientWidth, yearEl.clientHeight, dpr, gap);

  const en = place(wordOrigin, takeEven(enGlyph.pts, wordCap));
  const ml = place(wordOrigin, takeEven(mlGlyph.pts, wordCap));
  const yr = place(yearOrigin, takeEven(yrGlyph.pts, yearCap));

  const wordCount = Math.min(en.length, ml.length);
  if (!wordCount) return { draw: () => {}, destroy: () => {} };

  const rand = rng(19);
  const w = sw;
  const h = sh;
  const trailW = h * (mobile ? 0.1 : 0.12);
  const centerX = (wordOrigin.left + wordOrigin.right) / 2;
  const titleY = (wordOrigin.top + yearOrigin.bottom) / 2;

  const wave = (u, phase = 0) => {
    const x = lerp(-0.16 * w, 0.52 * w, u);
    const y =
      lerp(-0.12 * h, 0.4 * h, u) +
      Math.sin(u * Math.PI * 2.1 + phase) * h * 0.15 +
      Math.sin(u * Math.PI * 4.5 + phase * 0.75) * h * 0.04;
    const tx = 0.68 * w;
    const ty =
      0.52 * h +
      Math.cos(u * Math.PI * 2.1 + phase) * h * 0.15 * Math.PI * 2.1 +
      Math.cos(u * Math.PI * 4.5 + phase * 0.75) * h * 0.04 * Math.PI * 4.5;
    const len = Math.hypot(tx, ty) || 1;
    return { x, y, nx: -ty / len, ny: tx / len };
  };

  const onWave = (u, offset, phase = 0) => {
    const p = wave(u, phase);
    return { x: p.x + p.nx * offset, y: p.y + p.ny * offset };
  };

  const look = () => {
    const roll = rand();
    let size = 0.85;
    if (roll > 0.94) size = 2.55 + rand() * 0.7;
    else if (roll > 0.72) size = 1.55 + rand() * 0.55;
    else if (roll > 0.38) size = 1.05 + rand() * 0.4;
    else size = 0.58 + rand() * 0.32;
    return {
      size,
      glow: roll > 0.48,
      bloom: 1.45 + rand() * 1.05,
      tint: roll > 0.62 ? GOLD : roll > 0.3 ? CREAM : EMBER,
      alpha: 0.62 + rand() * 0.38,
    };
  };

  const total = wordCount + yr.length;
  const particles = [];
  const push = (role, i, gx, gy, mx, my) => {
    const side = (rand() - 0.5) * 2;
    const offset = side * trailW * Math.pow(rand(), 1.65);
    const scatter = Math.pow(rand(), 0.4);
    particles.push({
      role,
      slot: i / Math.max(1, total - 1),
      offset,
      delay: rand() * 0.2,
      stream: rand() * 0.42,
      seed: rand() * Math.PI * 2,
      burstX: (gx - centerX) * (0.95 + scatter * 1.7) + (rand() - 0.5) * w * 0.58,
      burstY: (rand() - 0.5) * h * 0.62,
      blastX: (mx - centerX) * (1.8 + scatter * 2.2) + (rand() - 0.5) * w * 0.55,
      blastY: (rand() - 0.55) * h * 0.22,
      ...look(),
      enX: gx,
      enY: gy,
      mlX: mx,
      mlY: my,
    });
  };

  for (let i = 0; i < wordCount; i += 1) push("word", i, en[i].x, en[i].y, ml[i].x, ml[i].y);
  for (let i = 0; i < yr.length; i += 1) push("year", wordCount + i, yr[i].x, yr[i].y, yr[i].x, yr[i].y);

  const sampleIdea = () => {
    const idea = document.getElementById("idea");
    if (!idea) return [];
    const words = idea.querySelectorAll("[data-word]");
    const pts = [];
    words.forEach((el, wordIndex) => {
      const text = (el.textContent || "").trim();
      if (!text) return;
      const cs = getComputedStyle(el);
      const size = parseFloat(cs.fontSize);
      const er = el.getBoundingClientRect();
      const boxW = Math.max(1, er.width);
      const boxH = Math.max(1, er.height, size);
      const font = `${cs.fontWeight} ${size}px ${cs.fontFamily}`;
      const spacing = cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing;
      const glyph = makeGlyph(text, font, spacing, boxW, boxH, dpr, mobile ? 5 : 4, "left");
      glyph.pts.forEach((p) => {
        pts.push({
          nx: p.x / boxW,
          ny: p.y / boxH,
          wordIndex,
        });
      });
    });
    return pts;
  };

  const heroCount = particles.length;
  const bindIdeaTargets = () => {
    const raw = sampleIdea();
    if (!raw.length) return false;
    const cap = mobile ? 1600 : 3800;
    const pts = takeEven(raw, Math.min(cap, raw.length));
    if (!pts.length) return false;
    const need = Math.min(cap, Math.max(heroCount, pts.length));
    for (let i = 0; i < need; i += 1) {
      const t = pts[i % pts.length];
      if (i >= particles.length) {
        const src = particles[i % heroCount];
        particles.push({
          ...src,
          ideaOnly: true,
          delay: rand() * 0.2,
          stream: rand() * 0.42,
          seed: rand() * Math.PI * 2,
          ...look(),
        });
      }
      particles[i].ideaNx = t.nx;
      particles[i].ideaNy = t.ny;
      particles[i].ideaWord = t.wordIndex;
    }
    return true;
  };
  let ideaReady = bindIdeaTargets();
  let ideaResampled = false;

  const continueLineFromRect = (r) => {
    if (!r) return 0;
    return clamp((h * 0.98 - r.top) / (h * 1.35));
  };

  const ideaFormFromRect = (r) => {
    if (!r) return 0;
    return clamp((h * 0.28 - r.top) / (h * 0.48));
  };

  const clearIdeaType = () => {
    const idea = document.getElementById("idea");
    if (!idea) return;
    idea.style.removeProperty("--idea-in");
    idea.style.removeProperty("--idea-copy");
  };

  const solids = (t) => {
    const enSolid = gate(t, 0.12, 0.18, 0.26, 0.34);
    const mlSolid = gate(t, 0.48, 0.54, 0.76, 0.82);
    const yearSolid = gate(t, 0.12, 0.18, 0.76, 0.82);
    return { en: enSolid, ml: mlSolid, year: yearSolid };
  };

  const pose = (t, p, time, flow, formAmt, wordRects) => {
    if (p.ideaOnly && flow < 0.02) return { hide: true };

    const glyphA = { x: p.enX, y: p.enY };
    const glyphB = { x: p.mlX, y: p.mlY };

    if (t < 0.18) {
      const head = t / 0.13;
      const u = head - p.slot * 0.88;
      if (u <= 0) return { hide: true };
      const stream = onWave(Math.min(u, 0.5), p.offset, 0.2);
      const form = easeInOut(clamp((u - 0.34) / 0.34));
      return { x: lerp(stream.x, glyphA.x, form), y: lerp(stream.y, glyphA.y, form), s: form, ignite: 0, size: p.size, fade: 1 };
    }

    if (t < 0.34) return { x: glyphA.x, y: glyphA.y, s: 1, ignite: 0, size: p.size, fade: 1 };

    if (t < 0.5) {
      if (p.role === "year") return { x: glyphA.x, y: glyphA.y, s: 1, ignite: 0, size: p.size, fade: 1 };
      const burst = easeInOut(between(t, 0.34, 0.42));
      const gather = easeInOut(between(t, 0.42, 0.5));
      const wideX = glyphA.x + p.burstX;
      const wideY = glyphA.y + p.burstY;
      if (t < 0.42) {
        return { x: lerp(glyphA.x, wideX, burst), y: lerp(glyphA.y, wideY, burst), s: 1 - burst, ignite: 0, size: p.size, fade: 1 };
      }
      return { x: lerp(wideX, glyphB.x, gather), y: lerp(wideY, glyphB.y, gather), s: gather, ignite: 0, size: p.size, fade: 1 };
    }

    if (t < 0.78) return { x: glyphB.x, y: glyphB.y, s: 1, ignite: 0, size: p.size, fade: 1 };

    const ignite = easeInOut(between(t, 0.78, 0.86));
    const crack = easeOut(clamp((between(t, 0.8, 0.9) - p.delay * 0.35) / 0.8));
    const flyX = glyphB.x + p.blastX * crack;
    const flyY = glyphB.y + p.blastY * crack;
    if (flow < 0.012) {
      return { x: flyX, y: flyY, s: 1 - crack, ignite, size: p.size, fade: 1, form: 0 };
    }

    const local = easeIn(clamp((flow - p.stream * 0.42) / 1.2));
    const pinchY = h * 0.78;
    const originY = Math.min(flyY, titleY);
    const funnelH = Math.max(160, pinchY - originY);
    const funnelY = flyY + local * (funnelH + h * 0.55);
    const along = clamp((funnelY - originY) / funnelH);
    const pinch = 1 - (1 - along) ** 3.15;
    const mist = (1 - pinch) * Math.sin(time * 0.7 + p.seed) * 8;
    const funnelX = lerp(flyX, centerX, pinch) + mist + (pinch > 0.93 ? Math.sin(p.seed * 9) * 0.7 : 0);
    const funnelSize = lerp(p.size, Math.max(0.7, p.size * 0.62), pinch);

    const wr = wordRects[p.ideaWord];
    if (wr && p.ideaNx != null) {
      const tx = wr.left + p.ideaNx * wr.width;
      const ty = wr.top + p.ideaNy * wr.height;
      const settle = easeInOut(pinch * local);
      const lineX = lerp(funnelX, centerX, settle);
      const lineY = lerp(funnelY, ty, settle);
      const peelWait = clamp(Math.abs(tx - centerX) / (w * 0.7));
      const form = easeInOut(clamp((formAmt - peelWait * 0.2 - p.delay * 0.04) / 0.38));
      return {
        x: lerp(lineX, tx, form),
        y: lerp(lineY, ty, form),
        s: 1,
        ignite: ignite * (1 - form * 0.9),
        size: lerp(funnelSize, 0.82, form),
        fade: 1,
        form,
      };
    }

    const offBottom = clamp((funnelY - h * 0.94) / (h * 0.22));
    return {
      x: funnelX,
      y: funnelY,
      s: 1 - crack,
      ignite,
      size: funnelSize,
      fade: 1 - offBottom ** 1.2,
      form: 0,
    };
  };

  const drawSolid = (text, glyph, spacing, origin, alpha) => {
    if (alpha <= 0.01) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = PAPER;
    ctx.font = glyph.font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if ("letterSpacing" in ctx && spacing && spacing !== "0px") ctx.letterSpacing = spacing;
    ctx.shadowColor = "rgba(5, 3, 8, 0.5)";
    ctx.shadowBlur = 16;
    ctx.fillText(text, origin.left + glyph.drawX, origin.top + glyph.cssH / 2);
    ctx.restore();
  };

  const sparkle = (x, y, r, color, a, ignite, glow, bloom, time, seed) => {
    const pulse = 0.82 + 0.18 * Math.abs(Math.sin(time * 8 + seed));
    const rad = Math.max(0.45, r);
    if (ignite > 0.2 && glow) {
      ctx.fillStyle = rgba(color, a * 0.12 * pulse * ignite);
      ctx.beginPath();
      ctx.arc(x, y, rad * bloom, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = rgba(color, a * pulse);
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
    if (ignite > 0.35) {
      ctx.fillStyle = rgba(WHITE, a * 0.75 * ignite);
      ctx.beginPath();
      ctx.arc(x, y, Math.max(0.22, rad * 0.28), 0, Math.PI * 2);
      ctx.fill();
    }
  };

  let lastT = 0;
  let alive = true;
  let raf = 0;

  const paint = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, sw, sh);
    const time = performance.now() * 0.001;
    if (!ideaReady) ideaReady = bindIdeaTargets();
    const ideaEl = document.getElementById("idea");
    const ideaRect = ideaEl ? ideaEl.getBoundingClientRect() : null;
    const flow = between(lastT, 0.88, 1) * 0.14 + continueLineFromRect(ideaRect);
    const formAmt = ideaFormFromRect(ideaRect);
    if (ideaReady && !ideaResampled && formAmt > 0.02) {
      bindIdeaTargets();
      ideaResampled = true;
    }
    const wordRects = ideaEl
      ? Array.from(ideaEl.querySelectorAll("[data-word]")).map((el) => el.getBoundingClientRect())
      : [];
    const solidIn = easeInOut(clamp((formAmt - 0.42) / 0.24));
    const copyIn = easeInOut(clamp((formAmt - 0.62) / 0.18));
    const dotsOut = easeInOut(clamp((formAmt - 0.58) / 0.22));
    if (ideaEl) {
      ideaEl.style.setProperty("--idea-in", String(solidIn));
      ideaEl.style.setProperty("--idea-copy", String(copyIn));
    }
    const solid = solids(lastT);

    ctx.globalCompositeOperation = "source-over";
    drawSolid(EN, enGlyph, enSpace, wordOrigin, solid.en);
    drawSolid(ML, mlGlyph, mlSpace, wordOrigin, solid.ml);
    drawSolid(YEAR, yrGlyph, yrSpace, yearOrigin, solid.year);

    ctx.globalCompositeOperation = lastT > 0.7 && formAmt < 0.28 ? "lighter" : "source-over";
    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];
      const pos = pose(lastT, p, time, flow, formAmt, wordRects);
      if (pos.hide) continue;
      const holding = p.role === "year" ? solid.year : lastT < 0.45 ? solid.en : solid.ml;
      if (holding > 0.82) continue;
      const fade = pos.fade * (1 - holding * 0.2) * (1 - dotsOut);
      if (fade < 0.03) continue;
      const enter = lastT < 0.22 ? clamp((pos.x + 36) / 90) : 1;
      if (enter < 0.03) continue;
      const ignite = pos.ignite ?? 0;
      const landed = pos.form ?? 0;
      const color = mix3(mix3(WHITE, p.tint, ignite), WHITE, landed);
      const a = enter * fade * lerp(0.88, p.alpha, ignite);
      sparkle(pos.x, pos.y, pos.size, color, a, ignite, p.glow, p.bloom, time, p.seed);
    }
    ctx.globalCompositeOperation = "source-over";
  };

  const loop = () => {
    if (!alive) return;
    paint();
    raf = requestAnimationFrame(loop);
  };
  loop();

  return {
    draw: (t) => {
      lastT = t;
    },
    destroy: () => {
      alive = false;
      cancelAnimationFrame(raf);
      clearIdeaType();
      if (home && canvas.parentNode === document.body) home.appendChild(canvas);
    },
  };
};
