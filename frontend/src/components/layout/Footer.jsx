import { Link } from "react-router-dom";
import BrandMark from "../ui/BrandMark";
import "./footer.css";

const links = [
  { to: "/about", label: "About" },
  { to: "/events", label: "Events" },
  { to: "/preevents", label: "Pre events" },
  { to: "/workshops", label: "Workshops" },
  { to: "/proshows", label: "Proshow" },
  { to: "/winners", label: "Points" },
  { to: "/certificates", label: "Certificate" },
  { to: "/contact", label: "Contact" },
];

const houses = ["Themis", "Maat", "Justitia", "Rashnu", "Lugh", "Marduk"];
const houseLoop = [...houses, ...houses];

const Footer = () => (
  <footer className="site-foot">
    <p className="site-foot-stamp" aria-hidden>
      GEC WAYANAD
    </p>
    <div className="site-foot-inner">
      <div className="site-foot-main">
        <Link to="/" className="site-foot-brand" aria-label="Pragati home">
          <BrandMark className="site-foot-logo" />
          <span>
            <b>PRAGATI</b>
            <i>പ്രഗതി</i>
          </span>
        </Link>

        <nav className="site-foot-nav" aria-label="Footer">
          {links.map((item) => (
            <Link key={item.to} to={item.to}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="site-foot-contact">
          <a href="mailto:pragati2024lead@gmail.com">pragati2024lead@gmail.com</a>
          <a
            href="https://www.instagram.com/pragati_gecw"
            target="_blank"
            rel="noreferrer"
            data-cursor="OPEN"
          >
            @pragati_gecw
          </a>
        </div>
      </div>

      <div className="site-foot-base">
        <span>© 2024 · Libertad · GEC Wayanad</span>
        <div className="site-foot-houses" aria-hidden>
          <p>
            {houseLoop.map((name, i) => (
              <span key={`${name}-${i}`}>{name}</span>
            ))}
          </p>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
