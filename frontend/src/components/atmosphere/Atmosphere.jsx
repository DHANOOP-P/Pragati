import "./atmosphere.css";

const Atmosphere = () => (
  <div className="atmosphere" aria-hidden>
    <span className="atmosphere-patch atmosphere-patch-a" />
    <span className="atmosphere-patch atmosphere-patch-b" />
    <span className="atmosphere-patch atmosphere-patch-c" />

    <svg className="atmosphere-orbits" viewBox="0 0 1000 1000" fill="none">
      <circle cx="500" cy="500" r="220" stroke="rgba(243,236,224,0.16)" strokeWidth="0.9" strokeDasharray="220 1160" />
      <circle cx="500" cy="500" r="340" stroke="rgba(243,236,224,0.13)" strokeWidth="0.8" strokeDasharray="280 1850" strokeDashoffset="200" />
      <circle cx="500" cy="500" r="470" stroke="rgba(215,181,109,0.14)" strokeWidth="0.8" strokeDasharray="340 2610" strokeDashoffset="420" />
    </svg>

    <span className="atmosphere-dot" style={{ left: "14%", top: "22%" }} />
    <span className="atmosphere-dot" style={{ left: "72%", top: "18%" }} />
    <span className="atmosphere-dot" style={{ left: "28%", top: "68%" }} />
    <span className="atmosphere-dot" style={{ left: "81%", top: "62%" }} />
    <span className="atmosphere-dot" style={{ left: "52%", top: "40%" }} />
  </div>
);

export default Atmosphere;
