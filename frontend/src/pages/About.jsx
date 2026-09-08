import "./about.css";

const About = () => (
  <article className="about-page">
    <header className="about-hero">
      <p className="about-kicker">GEC Wayanad · Libertad College Union</p>
      <h1>About</h1>
      {/* <p className="about-mal">പ്രഗതി</p> */}
    </header>

    <section className="about-block" aria-labelledby="about-pragati">
      <h2 id="about-pragati">Pragati</h2>
      <p>
        Pragati is the arts festival of Government Engineering College Wayanad — a week of music, dance,
        theatre, film, letter, and colour hosted by Libertad College Union.
      </p>
      <p>
        The fest is run through six houses. Students take the docket onstage and offstage, join workshops,
        and gather at night for proshows. Pre-events open the yard before the main days: film, fashion,
        ethnic day, and the rest of campus life.
      </p>
      <p>
        Arts events are for GECW students with a college mail. Workshops and proshows are open with a
        ticket. The point table follows the houses through the week.
      </p>
    </section>

    <section className="about-thanks" aria-labelledby="about-thanks">
      <h2 id="about-thanks" className="sr-only">
        Thanks
      </h2>
      <div className="thanks-card">
        <p className="thanks-word is-thank" aria-hidden>
          thank
        </p>
        <img className="thanks-cutout" src="/assets/about/dhanoop.png" alt="Dhanoop P" />
        <p className="thanks-word is-you" aria-hidden>
          you
        </p>
        <div className="thanks-copy">
          <p className="thanks-lead">
            A big <b>thank you</b>
          </p>
          <p>
            to every student who stepped onto a stage, sat in a workshop, or stayed for a night show.
            Pragati is built by the people who show up.
          </p>
          <p>
            Thanks to Libertad College Union, the staff and principal of GEC Wayanad, the volunteers,
            and every house that carried a colour through the week.
          </p>
        </div>
        <div className="thanks-sign">
          <svg className="thanks-oval" viewBox="0 0 320 150" fill="none" aria-hidden>
            <path
              d="M12 75c3-38 52-66 148-68 98-3 150 22 156 66 7 46-48 70-152 72C56 147 9 116 12 75z"
              stroke="url(#thanks-oval-grad)"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="thanks-oval-grad" x1="12" y1="18" x2="300" y2="130">
                <stop stopColor="#f3e27a" />
                <stop offset="1" stopColor="#e05a12" />
              </linearGradient>
            </defs>
          </svg>
          <p>Dhanoop P</p>
          <span>Arts Club Secretary</span>
          <span>Libertad College Union</span>
          <span>GEC Wayanad</span>
        </div>
      </div>
    </section>

    <section className="about-committee" aria-labelledby="about-committee">
      <h2 id="about-committee">Organising committee</h2>
      <img src="/assets/about/committee.jpg" alt="Libertad College Union office bearers" />
    </section>

    <section className="about-dev" aria-labelledby="about-dev">
      <h2 id="about-dev">Developer details</h2>
      <div className="dev-row">
        <div className="dev-photo">
          <svg className="dev-blob" viewBox="0 0 420 460" aria-hidden>
            <defs>
              <linearGradient id="dev-blob-grad" x1="40" y1="40" x2="380" y2="420">
                <stop stopColor="#e45c18" />
                <stop offset="0.55" stopColor="#f0a56a" />
                <stop offset="1" stopColor="#f6dcc0" />
              </linearGradient>
            </defs>
            <path
              fill="url(#dev-blob-grad)"
              d="M78 168c18-78 92-138 188-142 86-4 142 58 148 138 6 86-32 168-112 198-74 28-168 22-216-38-46-58-28-96-8-156z"
            />
            <g stroke="#f0a56a" strokeWidth="1.6" fill="none" opacity="0.55">
              <path d="M28 318l46-62" />
              <path d="M42 338l52-70" />
              <path d="M58 354l54-74" />
              <circle cx="28" cy="318" r="3.2" fill="#f0a56a" stroke="none" />
              <circle cx="42" cy="338" r="3.2" fill="#f0a56a" stroke="none" />
              <circle cx="58" cy="354" r="3.2" fill="#f0a56a" stroke="none" />
              <rect x="18" y="372" width="22" height="36" rx="11" />
              <circle cx="29" cy="390" r="3" fill="#f0a56a" stroke="none" />
            </g>
          </svg>
          <img src="/assets/about/dhanoop.png" alt="Dhanoop P" />
        </div>
        <div className="dev-note">
          <p>
            This site was built for Pragati — registrations, the docket, nights, and the house table —
            so GECW can run the fest from one place.
          </p>
          <p>Designed and developed in campus, for the union and the week of art.</p>
        </div>
      </div>
      <p className="dev-credit-name">Dhanoop P</p>
      <p className="dev-credit-meta">CSE-2021-25, GECW</p>
    </section>
  </article>
);

export default About;
