import { Link } from "react-router-dom";
import Magnetic from "../ui/Magnetic";

const RegisterCta = () => (
  <section className="relative px-6 py-16 md:px-12 md:py-20">
    <div className="mx-auto max-w-[1440px] flex flex-col items-start justify-between gap-10 md:flex-row md:items-end">
      <h2 className="font-display text-[14vw] leading-[0.8] md:text-8xl">
        READY
        <br />
        TO
        <br />
        ENTER?
      </h2>
      <Magnetic>
        <Link
          to="/auth"
          data-cursor="GO"
          className="inline-block bg-ember px-12 py-5 text-[12px] uppercase tracking-[0.35em] text-paper"
        >
          Register
        </Link>
      </Magnetic>
    </div>
    <p className="mt-10 max-w-md font-serif text-xl italic text-mute">
      Arts stay free for GECW college mail. Workshops and nights ask for a ticket.
    </p>
  </section>
);

export default RegisterCta;
