import { Link, useLocation } from "react-router-dom";
import "./unavailable.css";

const COPY = {
  arts: { label: "Arts events", back: "/events", backLabel: "Arts" },
  workshop: { label: "Workshops", back: "/workshops", backLabel: "Workshops" },
  proshow: { label: "Proshow", back: "/proshows", backLabel: "Proshow" },
};

const Unavailable = () => {
  const location = useLocation();
  const service = COPY[location.state?.service] || null;

  return (
    <article className="unavailable-page">
      <p className="unavailable-kicker">Desk closed</p>
      <h1>Unavailable</h1>
      <p className="unavailable-lead">
        {service
          ? `${service.label} registration is closed for now.`
          : "This service is closed for now."}
      </p>
      <p className="unavailable-note">
        Payment and confirm are paused at the desk. Try again when the union opens the gate.
      </p>
      <div className="unavailable-links">
        {service ? (
          <Link to={service.back}>{service.backLabel}</Link>
        ) : null}
        <Link to="/">Home</Link>
      </div>
    </article>
  );
};

export default Unavailable;
