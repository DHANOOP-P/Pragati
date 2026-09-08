import { Link } from "react-router-dom";
import { useRef } from "react";
import { mediaUrl } from "../../utils/media";

const PosterCard = ({ item, to, index, kicker, price, framed = false }) => {
  const ref = useRef(null);

  const tilt = (e) => {
    if (framed || window.matchMedia("(hover: hover)").matches === false) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
  };

  return (
    <Link
      to={to}
      data-cursor="EXPLORE"
      className="group block"
      style={framed ? undefined : { perspective: 1200 }}
      onMouseMove={tilt}
      onMouseLeave={() => {
        if (ref.current && !framed) ref.current.style.transform = "rotateY(0) rotateX(0)";
      }}
    >
      <article
        ref={ref}
        className={
          framed
            ? "relative h-[70vh] min-h-[420px] overflow-hidden bg-ink rounded-[1.25rem] border border-[#d7b56d]/30 shadow-[0_18px_40px_rgba(0,0,0,0.38)] transition-[transform,box-shadow,border-color,filter] duration-500 ease-out group-hover:-translate-y-3 group-hover:border-[#d7b56d]/70 group-hover:shadow-[0_1px_0_rgba(215,181,109,0.28),0_28px_56px_rgba(0,0,0,0.55)] group-hover:brightness-105"
            : "relative h-[70vh] min-h-[420px] overflow-hidden bg-ink transition-transform duration-200"
        }
        style={framed ? undefined : { transformStyle: "preserve-3d" }}
      >
        <img
          src={mediaUrl(item.image, 1400)}
          alt={item.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-8">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold">
            {String(index + 1).padStart(2, "0")} · {kicker}
          </p>
          <h3 className="mt-2 font-display text-4xl md:text-6xl">{item.title}</h3>
          {item.description ? (
            <p className="mt-2 max-w-md font-serif text-lg italic text-paper/70">{item.description}</p>
          ) : null}
          <p className="mt-3 text-sm text-paper/70">
            {[item.date ? new Date(item.date).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "", item.venue]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-ember">
            {price === 0 ? "Free" : `₹${price}`}
          </p>
        </div>
      </article>
    </Link>
  );
};

export default PosterCard;
