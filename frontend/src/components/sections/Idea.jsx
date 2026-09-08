import { useReducedMotion } from "../../hooks/useReducedMotion";
import JusticeScene from "../3d/JusticeScene";

const lines = [
  ["ART", "IS NOT"],
  ["JUST", "SEEN."],
  ["IT IS", "WEIGHED."],
  ["THEN", "IT SINGS."],
];

const Idea = () => {
  const reduce = useReducedMotion();

  return (
    <section
      id="idea"
      className={`idea-section relative z-20 overflow-visible px-6 pt-28 pb-4 md:px-12 md:pt-32 md:pb-6 ${reduce ? "is-static" : ""}`}
    >
      <div className="mx-auto grid max-w-[1560px] items-center gap-10 lg:grid-cols-2 lg:gap-8">
        <div className="relative z-10 min-w-0">
          <p className="idea-kicker text-[11px] uppercase tracking-[0.4em] text-ember">The idea</p>
          <div className="mt-8 space-y-2">
            {lines.map((row) => (
              <p
                key={row.join()}
                className="flex flex-wrap gap-x-5 font-display text-[11.5vw] font-extrabold leading-[0.85] text-paper md:text-[6vw] lg:text-[4.6vw]"
              >
                {row.map((w) => (
                  <span key={w} data-word className="idea-word inline-block whitespace-nowrap">
                    {w}
                  </span>
                ))}
              </p>
            ))}
          </div>
          <p className="idea-note mt-12 max-w-lg font-serif text-2xl italic text-mute">
            Pragati is GEC Wayanad’s court of colour — music, dance, film, and letter as a pursuit of righteous justice.
          </p>
        </div>

        <div
          className="idea-stage relative h-[min(62vw,400px)] w-full lg:h-[min(70vh,640px)]"
          aria-label="Antique brass scales of justice"
        >
          <JusticeScene reduce={reduce} />
        </div>
      </div>
    </section>
  );
};

export default Idea;
