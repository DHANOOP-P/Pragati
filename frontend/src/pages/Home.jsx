import { useCallback, useEffect, useState } from "react";
import api from "../api/client";
import Loader from "../components/ui/Loader";
import ErrorState from "../components/ui/ErrorState";
import Hero from "../components/hero/Hero";
import Idea from "../components/sections/Idea";
import StageCards from "../components/sections/StageCards";
import WorkshopStack from "../components/sections/WorkshopStack";
import EventRiver from "../components/sections/EventRiver";
import PreEvents from "../components/sections/PreEvents";
import CurrentBand from "../components/sections/CurrentBand";
import Faq from "../components/sections/Faq";
import Finale from "../components/sections/Finale";

const Home = () => {
  const [booting, setBooting] = useState(() => !sessionStorage.getItem("pragati_booted"));
  const [error, setError] = useState(false);
  const [events, setEvents] = useState([]);
  const [proshows, setProshows] = useState([]);
  const [preevents, setPreevents] = useState([]);

  const load = useCallback(() => {
    setError(false);
    Promise.all([api.get("/events"), api.get("/proshows"), api.get("/preevents")])
      .then(([e, p, pre]) => {
        setEvents(e.data);
        setProshows(p.data);
        setPreevents(pre.data);
      })
      .catch((err) => {
        console.error(err);
        setError(true);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (booting) {
    return (
      <Loader
        onDone={() => {
          sessionStorage.setItem("pragati_booted", "1");
          setBooting(false);
        }}
      />
    );
  }
  if (error) return <ErrorState onRetry={load} />;

  return (
    <div>
      <Hero />
      <Idea />
      <StageCards events={events} />
      <WorkshopStack />
      <EventRiver
        title="Night court"
        kicker="Proshow · paid"
        items={proshows}
        pathBase="/proshows"
        badge={(item) => item.artist || "Live"}
        toAll="/proshows"
      />
      <PreEvents items={preevents} />
      <CurrentBand />
      <Faq />
      <Finale />
    </div>
  );
};

export default Home;
