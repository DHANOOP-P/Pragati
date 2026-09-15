import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import "./loader.css";

const WORD = "PRAGATI";
const ROWS = 11;
const REPEAT = 8;
const DURATION_MS = 3000;
const strip = Array.from({ length: REPEAT }, () => WORD);
const track = [...strip, ...strip];

const Loader = ({ onDone }) => {
  const reduce = useReducedMotion();
  const startRef = useRef(Date.now());
  const doneRef = useRef(false);
  const [pct, setPct] = useState(0);
  const [exiting, setExiting] = useState(false);

  useLayoutEffect(() => {
    document.body.classList.add("is-booting");
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.classList.remove("is-booting");
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    startRef.current = Date.now();
    doneRef.current = false;
    setPct(0);
    setExiting(false);

    let raf = 0;

    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      setPct(100);
      setExiting(true);
      window.setTimeout(onDone, reduce ? 180 : 380);
    };

    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      setPct(Math.min(99, Math.floor((elapsed / DURATION_MS) * 99)));

      if (elapsed >= DURATION_MS) {
        finish();
        return;
      }

      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [onDone, reduce]);

  return (
    <div className={`pragati-loader${exiting ? " is-exit" : ""}`} aria-busy="true" aria-label="Loading Pragati">
      <div className="loader-field" aria-hidden>
        {Array.from({ length: ROWS }, (_, row) => (
          <div key={row} className="loader-row">
            <p className="loader-track">
              {track.map((word, i) => (
                <span key={`${row}-${i}`}>{word}</span>
              ))}
            </p>
          </div>
        ))}
      </div>
      <div className="loader-header" aria-hidden />
      <div className="loader-footer" aria-hidden />
      <p className="loader-meta is-file">GECW · FILE_08</p>
      <div className="loader-countdown" aria-live="polite">
        <p className="loader-countdown-label">Loading</p>
        <div className="loader-countdown-digits">
          {String(pct)
            .padStart(2, "0")
            .split("")
            .map((digit, i) => (
              <span key={`${pct}-${i}`} className="loader-countdown-digit" data-digit={digit}>
                {digit}
              </span>
            ))}
          <span className="loader-countdown-suffix">%</span>
        </div>
        <div className="loader-countdown-rail" aria-hidden>
          <i style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
};

export default Loader;
