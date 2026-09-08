import { useState } from "react";
import "./faq.css";

const CERTIFICATE_URL =
  "https://drive.google.com/drive/folders/1XQ0h_IaAfKm5y29VNC6OoCeNnbEH_vgC?usp=sharing";

const faqs = [
  {
    q: "How can I get my certificates?",
    a: (
      <>
        Certificates are shared on the Pragati Drive. Open{" "}
        <a href={CERTIFICATE_URL} target="_blank" rel="noopener noreferrer">
          Certificate
        </a>{" "}
        in the nav. Keep your GECW mail handy if you are asked to sign in.
      </>
    ),
  },
  {
    q: "Who can register for arts events?",
    a: "Arts events are for GEC Wayanad students with a college mail like name_21b410cs@gecwyd.ac.in. Sign in, open the event, and register with class, house, department, and phone. Group events also need the other members.",
  },
  {
    q: "How do I book workshops and proshows?",
    a: "Workshops and night shows are open with any account. Sign in, open Workshops or Proshow, and complete payment when a ticket is paid. Grab tickets early so your seat is held.",
  },
  {
    q: "How does the point table work?",
    a: "Points is the house table for Themis, Maat, Justitia, Rashnu, Lugh, and Marduk. Only a GECW college mail can open it. Scores are updated from the desk through the week.",
  },
  {
    q: "I don't have a college mail. What can I still do?",
    a: "You can still create an account, browse the fest, and register for workshops and proshows. Arts registration and the house table stay with GECW mail.",
  },
];

const LinkCircles = () => (
  <svg className="faq-mark" viewBox="0 0 28 16" fill="none" aria-hidden>
    <circle cx="10" cy="8" r="6.2" />
    <circle cx="18" cy="8" r="6.2" />
  </svg>
);

const Faq = () => {
  const [open, setOpen] = useState(null);

  return (
    <section className="faq-section" id="faq" aria-labelledby="faq-heading">
      <p className="faq-kicker">Desk</p>
      <h2 id="faq-heading">FAQs</h2>
      <ul className="faq-list">
        {faqs.map((item, i) => {
          const id = `faq-${i}`;
          const isOpen = open === i;
          return (
            <li key={item.q} className={isOpen ? "is-open" : ""}>
              <button
                type="button"
                className="faq-q"
                aria-expanded={isOpen}
                aria-controls={id}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span className="faq-lead">
                  <LinkCircles />
                  <span className="faq-num">{String(i + 1).padStart(3, "0")}</span>
                  <span className="faq-title">{item.q}</span>
                </span>
                <span className="faq-toggle" aria-hidden>
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="11" />
                    <path d="M8 10.2l4 4 4-4" />
                  </svg>
                </span>
              </button>
              <div className="faq-a" id={id} role="region">
                <div className="faq-a-inner">
                  <p>{item.a}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default Faq;
