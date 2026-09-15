import { useCallback, useEffect, useState } from "react";
import { getCatalog, wakeApi } from "../api/client";
import Loader from "../components/ui/Loader";
import Hero from "../components/hero/Hero";
import Idea from "../components/sections/Idea";
import StageCards from "../components/sections/StageCards";
import WorkshopStack from "../components/sections/WorkshopStack";
import EventRiver from "../components/sections/EventRiver";
import PreEvents from "../components/sections/PreEvents";
import CurrentBand from "../components/sections/CurrentBand";
import Faq from "../components/sections/Faq";
import Finale from "../components/sections/Finale";
import { FEATURED_PREEVENTS, FEATURED_PROSHOWS, mergePreevents, mergeProshows } from "../data/featuredCatalog";

const list = (res) => (Array.isArray(res?.data) ? res.data : []);

const catalog = {
  events: [],
  proshows: FEATURED_PROSHOWS,
  preevents: FEATURED_PREEVENTS,
};

/** Survives SPA back-navigation; resets on hard refresh. */
let homeBootSeen = false;

const Home = () => {
  const [booting, setBooting] = useState(() => !homeBootSeen);
  const [events, setEvents] = useState(catalog.events);
  const [proshows, setProshows] = useState(catalog.proshows);
  const [preevents, setPreevents] = useState(catalog.preevents);

  const load = useCallback(() => {
    getCatalog("/events")
      .then((res) => {
        const items = list(res);
        catalog.events = items;
        setEvents(items);
      })
      .catch((err) => console.error(err));

    getCatalog("/proshows")
      .then((res) => {
        const items = mergeProshows(list(res));
        catalog.proshows = items;
        setProshows(items);
      })
      .catch((err) => console.error(err));

    getCatalog("/preevents")
      .then((res) => {
        const items = mergePreevents(list(res));
        catalog.preevents = items;
        setPreevents(items);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    wakeApi();
    load();
  }, [load]);

  if (booting) {
    return (
      <Loader
        onDone={() => {
          homeBootSeen = true;
          setBooting(false);
        }}
      />
    );
  }

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
