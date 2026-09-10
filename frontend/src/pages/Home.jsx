import { useCallback, useEffect, useState } from "react";
import api, { wakeApi } from "../api/client";
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

const list = (res) => (Array.isArray(res?.data) ? res.data : []);

const catalog = {
  events: [],
  proshows: [],
  preevents: [],
  proshowsReady: false,
  preeventsReady: false,
};

const Home = () => {
  const [booting, setBooting] = useState(() => !sessionStorage.getItem("pragati_booted"));
  const [events, setEvents] = useState(catalog.events);
  const [proshows, setProshows] = useState(catalog.proshows);
  const [preevents, setPreevents] = useState(catalog.preevents);
  const [proshowsReady, setProshowsReady] = useState(catalog.proshowsReady);
  const [preeventsReady, setPreeventsReady] = useState(catalog.preeventsReady);

  const load = useCallback(() => {
    api
      .get("/events")
      .then((res) => {
        const items = list(res);
        catalog.events = items;
        setEvents(items);
      })
      .catch((err) => console.error(err));

    api
      .get("/proshows")
      .then((res) => {
        const items = list(res);
        catalog.proshows = items;
        setProshows(items);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        catalog.proshowsReady = true;
        setProshowsReady(true);
      });

    api
      .get("/preevents")
      .then((res) => {
        const items = list(res);
        catalog.preevents = items;
        setPreevents(items);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        catalog.preeventsReady = true;
        setPreeventsReady(true);
      });
  }, []);

  useEffect(() => {
    wakeApi();
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
        loading={!proshowsReady}
        pathBase="/proshows"
        badge={(item) => item.artist || "Live"}
        toAll="/proshows"
      />
      <PreEvents items={preevents} loading={!preeventsReady} />
      <CurrentBand />
      <Faq />
      <Finale />
    </div>
  );
};

export default Home;
