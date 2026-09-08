import { useEffect, useState } from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery";

const Cursor = () => {
  const desktop = useMediaQuery("(hover: hover) and (pointer: fine) and (min-width: 1024px)");
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [label, setLabel] = useState("");
  const [hot, setHot] = useState(false);

  useEffect(() => {
    if (!desktop) {
      document.body.classList.remove("has-cursor");
      return undefined;
    }
    document.body.classList.add("has-cursor");
    const move = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
      const el = e.target.closest("[data-cursor]");
      setLabel(el?.getAttribute("data-cursor") || "");
      setHot(Boolean(el) || Boolean(e.target.closest("a, button")));
    };
    window.addEventListener("pointermove", move);
    return () => {
      window.removeEventListener("pointermove", move);
      document.body.classList.remove("has-cursor");
    };
  }, [desktop]);

  if (!desktop) return null;

  return (
    <div
      className="pointer-events-none fixed z-[80] mix-blend-difference"
      style={{ left: pos.x, top: pos.y, transform: "translate(-50%, -50%)" }}
    >
      <div
        className={`grid place-items-center rounded-full border border-paper/80 transition-all duration-200 ${
          hot ? "h-16 w-16" : "h-3 w-3 bg-paper"
        }`}
      >
        {label && <span className="text-[9px] uppercase tracking-[0.2em]">{label}</span>}
      </div>
    </div>
  );
};

export default Cursor;
