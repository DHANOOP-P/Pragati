import Social from "./Social";
import RegisterCta from "./RegisterCta";
import CurrentScene from "../3d/CurrentScene";
import "./currentBand.css";

const CurrentBand = () => (
  <section className="current-band" aria-label="The movement">
    <CurrentScene />
    <div className="current-band-copy">
      <Social />
      <RegisterCta />
    </div>
  </section>
);

export default CurrentBand;
