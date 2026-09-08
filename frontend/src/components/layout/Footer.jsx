import { Link } from "react-router-dom";
import BrandMark from "../ui/BrandMark";
import "./footer.css";

const CERTIFICATE_URL =
  "https://drive.google.com/drive/folders/1XQ0h_IaAfKm5y29VNC6OoCeNnbEH_vgC?usp=sharing";

const links = [
  { to: "/about", label: "About" },
  { to: "/events", label: "Events" },
  { to: "/preevents", label: "Pre events" },
  { to: "/workshops", label: "Workshops" },
  { to: "/proshows", label: "Proshow" },
  { to: "/winners", label: "Points" },
  { href: CERTIFICATE_URL, label: "Certificate", external: true },
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
          {links.map((item) =>
            item.external ? (
              <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer">
                {item.label}
              </a>
            ) : (
              <Link key={item.to} to={item.to}>
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="site-foot-contact">
          <a href="mailto:pragati@gecwyd.ac.in">pragati@gecwyd.ac.in</a>
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
        <span>© 2026 · Libertad · GEC Wayanad</span>
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
