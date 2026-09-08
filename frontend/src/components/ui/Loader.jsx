import { useEffect, useLayoutEffect, useState } from "react";
import BrandMark from "./BrandMark";

const Loader = ({ onDone }) => {
  const [pct, setPct] = useState(0);

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
    let n = 0;
    const id = setInterval(() => {
      n += Math.random() * 18 + 8;
      if (n >= 100) {
        n = 100;
        clearInterval(id);
        setTimeout(onDone, 220);
      }
      setPct(Math.min(100, Math.floor(n)));
    }, 70);
    return () => clearInterval(id);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-void">
      <BrandMark className="h-28 w-auto md:h-36" />
      <p className="mt-6 font-serif text-sm tracking-[0.6em] text-gold">GECW</p>
      <h1 className="mt-4 font-display text-[18vw] leading-none tracking-tight md:text-[9rem]">PRAGATI</h1>
      <p className="mt-6 font-serif italic text-mute">entering the other side of art</p>
      <p className="mt-10 font-display text-4xl tabular-nums text-gold">{String(pct).padStart(2, "0")}</p>
    </div>
  );
};

export default Loader;
