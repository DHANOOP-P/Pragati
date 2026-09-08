import Magnetic from "../ui/Magnetic";

const Social = () => (
  <section className="relative px-6 py-16 text-center md:px-12 md:py-20">
    <p className="text-[11px] uppercase tracking-[0.4em] text-ember">The movement</p>
    <h2 className="mt-6 font-display text-[12vw] leading-[0.85] md:text-8xl">
      FOLLOW
      <br />
      THE
      <br />
      CURRENT
    </h2>
    <Magnetic className="mt-10 inline-block">
      <a
        href="https://www.instagram.com/pragati_gecw"
        target="_blank"
        rel="noreferrer"
        data-cursor="OPEN"
        className="border border-gold px-10 py-4 text-[12px] uppercase tracking-[0.35em] text-gold"
      >
        @pragati_gecw
      </a>
    </Magnetic>
  </section>
);

export default Social;
