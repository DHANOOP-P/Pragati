import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/client";
import PosterCard from "../components/events/PosterCard";
import ErrorState from "../components/ui/ErrorState";
import { isOnstageEvent } from "../components/sections/StageCards";

const Catalog = ({ endpoint, title, kicker, pathBase, badge, adPlacement, priceKey, framed }) => {
  const [items, setItems] = useState([]);
  const [ads, setAds] = useState([]);
  const [error, setError] = useState(false);
  const [params] = useSearchParams();
  const stage = params.get("stage");

  const load = () => {
    setError(false);
    api
      .get(endpoint)
      .then((res) => setItems(res.data))
      .catch((err) => {
        console.error(err);
        setError(true);
      });
    if (adPlacement) {
      api.get("/ads", { params: { placement: adPlacement } }).then((res) => setAds(res.data)).catch(() => {});
    }
  };

  useEffect(() => {
    load();
  }, [endpoint, adPlacement]);

  const visible = useMemo(() => {
    if (endpoint !== "/events" || (stage !== "onstage" && stage !== "offstage")) return items;
    return items.filter((item) => (stage === "onstage" ? isOnstageEvent(item) : !isOnstageEvent(item)));
  }, [items, endpoint, stage]);

  const heading =
    stage === "onstage" ? "Onstage" : stage === "offstage" ? "Offstage" : title;
  const sub =
    stage === "onstage"
      ? "Dance · music · theatre"
      : stage === "offstage"
        ? "Literary · film · fine arts"
        : kicker;

  if (error) return <ErrorState onRetry={load} />;

  return (
    <div className="relative z-20 px-6 pb-24 pt-28 md:px-12">
      <p className="text-[11px] uppercase tracking-[0.35em] text-ember">{sub}</p>
      <h1 className="mt-3 font-display text-6xl md:text-8xl">{heading}</h1>
      {ads[0] && (
        <Link to={ads[0].link || pathBase} className="mt-10 block overflow-hidden" data-cursor="VIEW">
          <img src={ads[0].media} alt={ads[0].title} className="h-56 w-full object-cover md:h-72" />
          <p className="mt-3 text-gold">{ads[0].title}</p>
        </Link>
      )}
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {visible.map((item, i) => (
          <PosterCard
            key={item._id}
            item={item}
            to={`${pathBase}/${item._id}`}
            index={i}
            kicker={typeof badge === "function" ? badge(item) : badge}
            price={priceKey === "free" ? 0 : item.price}
            framed={framed}
          />
        ))}
      </div>
    </div>
  );
};

export default Catalog;
