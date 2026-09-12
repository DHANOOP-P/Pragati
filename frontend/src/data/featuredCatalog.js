export const FEATURED_PROSHOWS = [
  {
    title: "DJ NIGHT",
    description: "Headline concert where gold light, percussion and voice weigh the night.",
    date: "2026-03-14T18:30:00",
    venue: "Open Stage, GEC Wayanad",
    artist: "DJ Dion",
    price: 199,
    image: "/assets/proshows/dion.jpg",
  },
  {
    title: "MUSICAL NIGHT",
    description: "Music night with sounds that bring the night to life.",
    date: "2026-03-15T19:00:00",
    venue: "Open Stage",
    artist: "Decibel",
    price: 199,
    image: "/assets/proshows/decibel.jpg",
  },
  {
    title: "DJ NIGHT",
    description: "Closing night. Voice, brass, and a last measure of gold over the yard.",
    date: "2026-03-16T19:30:00",
    venue: "Open Stage",
    artist: "Ricky Brown",
    price: 199,
    image: "/assets/proshows/ricky-brown.jpg",
  },
];

export const FEATURED_PREEVENTS = [
  {
    title: "BGMI",
    description: "E Games - Games Galore. Form your squad and be ready for the clash in the maps of BGMI.",
    date: "2026-04-05T10:00:00",
    venue: "GEC Wayanad",
    category: "E-Games",
    image: "/assets/preevents/bgmi.png",
  },
  {
    title: "Film Fest",
    description: "Tumbbad, Mucize, Suzume, Spadikam. Screens across 16-20 April.",
    date: "2026-04-16T18:00:00",
    venue: "GEC Wayanad",
    category: "Film",
    image: "/assets/preevents/film-fest.jpg",
  },
  {
    title: "Ethnic Day",
    description: "Traditional attire on campus. Libertad College Union, 17 April.",
    date: "2026-04-17T10:00:00",
    venue: "GEC Wayanad",
    category: "Campus",
    image: "/assets/preevents/ethnic-day.jpg",
  },
  {
    title: "Fashion Show",
    description: "The runway at Pragati. Libertad College Union, 17 April.",
    date: "2026-04-17T16:00:00",
    venue: "GEC Wayanad",
    category: "Fashion",
    image: "/assets/preevents/fashion-show.jpg",
  },
  {
    title: "Prom Night",
    description: "17 April, 6 PM onwards. Libertad College Union, GEC Wayanad.",
    date: "2026-04-17T18:00:00",
    venue: "GEC Wayanad",
    category: "Night",
    image: "/assets/preevents/prom-night.jpg",
  },
];

const norm = (value) => String(value || "").trim().toLowerCase();

export function mergeProshows(live) {
  const list = Array.isArray(live) ? live : [];
  if (!list.length) return FEATURED_PROSHOWS;
  const used = new Set();
  const merged = FEATURED_PROSHOWS.map((card) => {
    const byArtist = list.find((item) => {
      const artist = norm(item.artist);
      return artist && artist === norm(card.artist) && !used.has(String(item._id));
    });
    const hit =
      byArtist ||
      list.find((item) => item.title === card.title && !used.has(String(item._id)));
    if (!hit) return card;
    used.add(String(hit._id));
    return { ...card, ...hit, image: card.image };
  });
  const extras = list.filter((item) => item?._id && !used.has(String(item._id)));
  return extras.length ? [...merged, ...extras] : merged;
}

export function mergePreevents(live) {
  const list = Array.isArray(live) ? live : [];
  if (!list.length) return FEATURED_PREEVENTS;
  const used = new Set();
  const merged = FEATURED_PREEVENTS.map((card) => {
    const hit = list.find((item) => item.title === card.title && !used.has(String(item._id)));
    if (!hit) return card;
    used.add(String(hit._id));
    return { ...card, ...hit, image: card.image };
  });
  const extras = list.filter((item) => item?._id && !used.has(String(item._id)));
  return extras.length ? [...merged, ...extras] : merged;
}
