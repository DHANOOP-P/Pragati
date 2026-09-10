export const SITE_URL = String(import.meta.env.VITE_SITE_URL || "https://pragati-ten-azure.vercel.app").replace(
  /\/+$/,
  ""
);

export const SITE_NAME = "Pragati 24";
export const DEFAULT_TITLE = "Pragati 24 · GEC Wayanad Arts Festival | GECW Arts";
export const DEFAULT_DESCRIPTION =
  "Pragati 24 is the official arts festival of Government Engineering College Wayanad (GECW). Onstage and offstage arts, workshops, proshows, and pre-events by Libertad College Union.";
export const DEFAULT_KEYWORDS =
  "pragati24, pragati 24, pragati gec wayanad arts, gec wayanad arts, gecw arts, government engineering college wayanad arts fest, pragati arts, GEC Wayanad, Libertad";
export const OG_IMAGE = `${SITE_URL}/assets/stage/onstage.png`;

const home = {
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
};

export const PAGE_SEO = {
  "/": home,
  default: home,
  "/about": {
    title: "About Pragati 24 · GEC Wayanad Arts Fest",
    description:
      "About Pragati, the GEC Wayanad arts festival run by Libertad College Union — houses, onstage and offstage, workshops, and proshows.",
  },
  "/events": {
    title: "Arts Events · Pragati 24 GEC Wayanad",
    description: "Onstage and offstage arts events at Pragati 24, the GECW arts fest.",
  },
  "/workshops": {
    title: "Workshops · Pragati 24 GEC Wayanad",
    description: "Paid workshops at Pragati 24, Government Engineering College Wayanad arts festival.",
  },
  "/proshows": {
    title: "Proshow · Pragati 24 GEC Wayanad",
    description: "Night proshows at Pragati 24, GEC Wayanad arts fest.",
  },
  "/preevents": {
    title: "Pre events · Pragati 24 GEC Wayanad",
    description: "Campus pre-events at Pragati 24, GECW arts.",
  },
  "/contact": {
    title: "Contact · Pragati 24 GEC Wayanad",
    description: "Contact the Pragati 24 desk at Government Engineering College Wayanad.",
  },
  "/certificates": {
    title: "Certificates · Pragati 24 GEC Wayanad",
    description: "Collect Pragati 24 participation, volunteer, and winner certificates with a GECW college mail.",
  },
  "/winners": {
    title: "Point table · Pragati 24 GEC Wayanad",
    description: "House point table for Pragati 24, GEC Wayanad arts.",
  },
};

export const NOINDEX_PREFIXES = ["/admin", "/auth", "/dashboard", "/unavailable"];
