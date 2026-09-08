import { useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { canSeePointTable } from "../utils/collegeEmail";
import "./winners.css";

const HOUSE_LOOK = {
  Themis: { ink: "#1a1816", paper: "#d8d2c8" },
  Maat: { ink: "#2a1020", paper: "#d85a96" },
  Justitia: { ink: "#0c1a33", paper: "#3d78c8" },
  Rashnu: { ink: "#2a0c0a", paper: "#b8422c" },
  Lugh: { ink: "#0c2212", paper: "#2f9a44" },
  Marduk: { ink: "#241806", paper: "#d7b56d" },
};

const FALLBACK_HOUSES = [
  { rank: 1, name: "Themis", points: 288 },
  { rank: 2, name: "Maat", points: 252 },
  { rank: 3, name: "Justitia", points: 127 },
  { rank: 4, name: "Rashnu", points: 94 },
  { rank: 5, name: "Lugh", points: 72 },
  { rank: 6, name: "Marduk", points: 62 },
];

const withLook = (houses) =>
  houses.map((house, i) => ({
    rank: house.rank || i + 1,
    name: house.name,
    points: house.points,
    ...(HOUSE_LOOK[house.name] || { ink: "#1a1816", paper: "#d8d2c8" }),
  }));

const HouseMark = ({ name, ink, paper }) => {
  const common = {
    fill: "none",
    stroke: paper,
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  return (
    <span className="point-mark" style={{ background: ink }} aria-hidden>
      <svg viewBox="0 0 48 48">
        {name === "Themis" && (
          <>
            <circle cx="24" cy="16" r="5.2" {...common} />
            <path d="M16 16h16M24 21v6M15 34h18M18 27h12" {...common} />
            <path d="M18 27l-5 7M30 27l5 7" {...common} />
          </>
        )}
        {name === "Maat" && (
          <>
            <path d="M24 10c6 7 8 14 0 28C16 24 18 17 24 10z" {...common} />
            <path d="M24 16v16M20 22h8" {...common} />
          </>
        )}
        {name === "Justitia" && (
          <>
            <path d="M24 9v26M18 14h12" {...common} />
            <path d="M16 28h16M19 22l-5 6M29 22l5 6" {...common} />
            <path d="M24 35l-3 5h6z" fill={paper} stroke="none" />
          </>
        )}
        {name === "Rashnu" && (
          <>
            <path d="M10 20h28M24 12v20" {...common} />
            <circle cx="15" cy="29" r="5" {...common} />
            <circle cx="33" cy="29" r="5" {...common} />
          </>
        )}
        {name === "Lugh" && (
          <>
            <circle cx="24" cy="20" r="7" {...common} />
            <path d="M24 9v4M24 27v4M13 20h4M31 20h4M16 13l2.4 2.4M30 27l2.4 2.4M30 13l-2.4 2.4M16 27l-2.4 2.4" {...common} />
            <path d="M24 34v6" {...common} />
          </>
        )}
        {name === "Marduk" && (
          <>
            <path d="M24 10l3.2 7.4 8 .6-6.2 5 2 7.6L24 26.6 16.9 30.6l2-7.6-6.1-5 8-.6z" {...common} />
            <path d="M14 36h20" {...common} />
          </>
        )}
      </svg>
    </span>
  );
};

const JusticeMark = () => (
  <svg className="point-table-mark" viewBox="0 0 200 240" fill="none" aria-hidden>
    <path
      d="M100 28c14 0 24 12 24 28 0 10-4 18-10 24h20l6 10H60l6-10h20c-6-6-10-14-10-24 0-16 10-28 24-28z"
      stroke="currentColor"
      strokeWidth="3"
    />
    <path d="M100 80v78M62 188h76" stroke="currentColor" strokeWidth="3" />
    <path d="M70 118h60M78 118l-16 28M122 118l16 28M62 146h28M110 146h28" stroke="currentColor" strokeWidth="3" />
    <circle cx="70" cy="158" r="12" stroke="currentColor" strokeWidth="3" />
    <circle cx="130" cy="158" r="12" stroke="currentColor" strokeWidth="3" />
    <path d="M86 198h28l6 18H80z" stroke="currentColor" strokeWidth="3" />
  </svg>
);

const Winners = () => {
  const { user, ready } = useAuth();
  const location = useLocation();
  const allowed = canSeePointTable(user);
  const [houses, setHouses] = useState([]);

  useEffect(() => {
    if (!allowed) {
      setHouses([]);
      return undefined;
    }
    api
      .get("/points")
      .then((res) => {
        const rows = res.data || [];
        setHouses(withLook(rows.length ? rows : FALLBACK_HOUSES));
      })
      .catch(() => setHouses(withLook(FALLBACK_HOUSES)));
    return undefined;
  }, [allowed]);

  if (!ready) {
    return <div className="grid min-h-screen place-items-center text-gold">…</div>;
  }
  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return (
    <section className="point-table" aria-label="Point table">
      <JusticeMark />
      <p className="point-table-word">PRAGATI</p>
      <div className="point-table-inner">
        <h1 className="point-table-title">POINT TABLE</h1>
        {!allowed ? (
          <p className="point-table-lock">
            This table is only for GEC Wayanad students. Sign in with a college mail like
            name_21b410cs@gecwyd.ac.in.
          </p>
        ) : null}
        {allowed ? (
        <div className="point-board-wrap">
        <table className="point-board">
          <thead>
            <tr>
              <th className="is-rank" scope="col">
                Rank
              </th>
              <th scope="col">Name</th>
              <th className="is-points" scope="col">
                Points
              </th>
            </tr>
          </thead>
          <tbody>
            {houses.map((house) => (
              <tr key={house.name}>
                <td className="is-rank">
                  <div className="point-rank">
                    <b>{house.rank}</b>
                    <HouseMark name={house.name} ink={house.ink} paper={house.paper} />
                  </div>
                </td>
                <td>
                  <span className="point-name">{house.name}</span>
                </td>
                <td className="is-points">
                  <span className="point-score">{house.points}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        ) : (
          <p className="point-table-lock-link">
            <Link to="/auth" state={{ from: location.pathname }}>
              Use college mail
            </Link>
          </p>
        )}
      </div>
    </section>
  );
};

export default Winners;
