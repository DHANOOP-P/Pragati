import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import api from "../../api/client";
import { mediaUrl } from "../../utils/media";
import "./workshopStack.css";

gsap.registerPlugin(ScrollTrigger);

const FEATURED = [
  {
    title: "Drawing Workshop",
    description: "Basic sketches of vision art with Joseph M Verghese. Line, sight, and the weight of a mark.",
    image: "/assets/workshops/drawing.png",
    mentor: "Joseph M Verghese",
    price: 99,
  },
  {
    title: "Visual Design",
    description: "What we think — what we see. Photoshop and Illustrator as a court of form.",
    image: "/assets/workshops/visual.png",
    mentor: "Raja Thashreef",
    price: 99,
  },
  {
    title: "Hiphop Workshop",
    description: "Rhythm as argument. A session with Gang 86 on movement, beat, and presence.",
    image: "/assets/workshops/hiphop.png",
    mentor: "Gang 86",
    price: 99,
  },
];

const WorkshopStack = ({ asPage = false }) => {
  const reduce = useReducedMotion();
  const rootRef = useRef(null);
  const [cards, setCards] = useState(FEATURED);

  useEffect(() => {
    api
      .get("/workshops")
      .then((res) => {
        const mapped = FEATURED.map((card) => {
          const live = (res.data || []).find((item) => item.title === card.title);
          return live
            ? { ...card, ...live, image: card.image, _id: live._id }
            : card;
        });
        setCards(mapped);
      })
      .catch(() => setCards(FEATURED));
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduce) return undefined;

    const mm = gsap.matchMedia();

    const popCards = (fromY, scrub) => {
      const pops = gsap.utils.toArray(".workshop-pop", root);
      pops.forEach((card) => {
        const inner = card.querySelector(".workshop-pop-inner");
        if (!inner) return;

        gsap.fromTo(
          inner,
          { y: fromY, filter: "blur(6px)" },
          {
            y: 0,
            filter: "none",
            ease: scrub ? "none" : "power3.out",
            duration: scrub ? undefined : 0.7,
            immediateRender: true,
            scrollTrigger: scrub
              ? {
                  trigger: card,
                  start: "top 80%",
                  end: "top 30%",
                  scrub: true,
                  invalidateOnRefresh: true,
                }
              : {
                  trigger: card,
                  start: "top 92%",
                  toggleActions: "play none none reverse",
                },
          }
        );
      });
    };

    mm.add("(max-width: 767px)", () => popCards(40, false));
    mm.add("(min-width: 768px)", () => popCards(80, true));

    const refresh = () => ScrollTrigger.refresh();
    requestAnimationFrame(refresh);
    window.addEventListener("load", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      mm.revert();
    };
  }, [reduce, cards.length]);

  return (
    <section
      ref={rootRef}
      className={`workshop-stack${asPage ? " is-page" : ""}`}
      aria-label="Workshops"
    >
      <div className="workshop-stack-head">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-ember">Open · paid</p>
          {asPage ? (
            <h1 className="mt-2 font-display text-5xl md:text-7xl">Workshops</h1>
          ) : (
            <h2 className="mt-2 font-display text-5xl md:text-7xl">Workshops</h2>
          )}
        </div>
        {!asPage && (
          <Link to="/workshops" className="text-[11px] uppercase tracking-[0.28em] text-gold">
            View all
          </Link>
        )}
      </div>

      <div className="workshop-list">
        {cards.map((item, i) => (
          <article key={item._id || item.title} className="workshop-pop" style={{ zIndex: i + 1 }}>
            <div className="workshop-pop-shell">
              <div className="workshop-pop-inner">
                <Link
                  to={item._id ? `/workshops/${item._id}` : "/auth"}
                  data-cursor="ENTER"
                  className="workshop-pop-card"
                >
                  <div className="workshop-pop-media">
                    <img src={mediaUrl(item.image, 900)} alt="" loading="lazy" />
                  </div>
                  <div className="workshop-pop-copy">
                    <p className="text-[11px] uppercase tracking-[0.32em] text-ember">
                      {String(i + 1).padStart(2, "0")} · {item.mentor}
                    </p>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <span className="workshop-pop-meta">₹{item.price} · enter</span>
                  </div>
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default WorkshopStack;
