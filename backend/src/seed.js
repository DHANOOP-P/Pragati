import bcrypt from "bcryptjs";
import User from "./models/User.js";
import ArtsEvent from "./models/ArtsEvent.js";
import Workshop from "./models/Workshop.js";
import Proshow from "./models/Proshow.js";
import Ad from "./models/Ad.js";
import Winner from "./models/Winner.js";
import PreEvent from "./models/PreEvent.js";
import House from "./models/House.js";
import { HOUSE_TABLE } from "./utils/studentMeta.js";

export async function seedDemoUsers() {
  const demos = [
    {
      name: "Dhanoop",
      email: "dhanoop_21b410cs@gecwyd.ac.in",
      password: "Student@123",
      college: "GEC Wayanad",
      phone: "9999999999",
    },
    {
      name: "Guest Artist",
      email: "guest@example.com",
      password: "Student@123",
      college: "Other College",
      phone: "8888888888",
    },
  ];

  for (const demo of demos) {
    const exists = await User.findOne({ email: demo.email });
    if (exists) continue;
    await User.create({
      ...demo,
      password: await bcrypt.hash(demo.password, 10),
    });
  }
}

export async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || "admin@pragati.fest").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "PragatiAdmin@2026";
  const existing = await User.findOne({ email });
  if (existing) return existing;
  const hashed = await bcrypt.hash(password, 10);
  const admin = await User.create({
    name: "Pragati Admin",
    email,
    password: hashed,
    role: "admin",
    college: "GEC Wayanad",
  });
  console.log("Admin seeded:", email);
  return admin;
}

const FEATURED_PROSHOWS = [
  {
    title: "DJ NIGHT",
    description: "Headline concert where gold light, percussion and voice weigh the night.",
    date: new Date("2026-03-14T18:30:00"),
    venue: "Open Stage, GEC Wayanad",
    artist: "DJ Dion",
    price: 199,
    capacity: 1200,
    image: "/assets/proshows/dion.jpg",
    isOpen: true,
  },
  {
    title: "MUSICAL NIGHT",
    description: "Music night with sounds that bring the night to life.",
    date: new Date("2026-03-15T19:00:00"),
    venue: "Open Stage",
    artist: "Decibel",
    price: 199,
    capacity: 1500,
    image: "/assets/proshows/decibel.jpg",
    isOpen: true,
  },
  {
    title: "DJ NIGHT",
    description: "Closing night. Voice, brass, and a last measure of gold over the yard.",
    date: new Date("2026-03-16T19:30:00"),
    venue: "Open Stage",
    artist: "Ricky Brown",
    price: 199,
    capacity: 1300,
    image: "/assets/proshows/ricky-brown.jpg",
    isOpen: true,
  },
];

export async function seedCatalog() {
  if ((await ArtsEvent.countDocuments()) === 0) {
    await ArtsEvent.insertMany([
      {
        title: "Natyashastra",
        description: "Classical and contemporary stage dance judged on form, story and justice of expression.",
        date: new Date("2026-03-12T10:00:00"),
        venue: "Main Auditorium",
        category: "Dance",
        stage: "onstage",
        participationType: "group",
        capacity: 60,
        image: "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=1200&q=80",
      },
      {
        title: "Vakyartha",
        description: "Poetry and spoken word on righteousness, dissent and the art of speaking truth.",
        date: new Date("2026-03-12T14:00:00"),
        venue: "Open Air Theatre",
        category: "Literary",
        stage: "offstage",
        participationType: "individual",
        capacity: 40,
        image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80",
      },
      {
        title: "Chaya",
        description: "Short film contest. Frames that weigh guilt, mercy and the pursuit of justice.",
        date: new Date("2026-03-13T11:00:00"),
        venue: "Media Lab",
        category: "Film",
        stage: "offstage",
        participationType: "group",
        capacity: 30,
        image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&q=80",
      },
      {
        title: "Raga Nyaya",
        description: "Solo and group music. Melody as argument, rhythm as verdict.",
        date: new Date("2026-03-13T16:00:00"),
        venue: "Music Pavilion",
        category: "Music",
        stage: "onstage",
        participationType: "individual",
        capacity: 50,
        image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80",
      },
      {
        title: "Varna Rekha",
        description: "Fine arts: portrait, mural and protest poster on the theme of righteous justice.",
        date: new Date("2026-03-14T09:30:00"),
        venue: "Art Courtyard",
        category: "Fine Arts",
        stage: "offstage",
        participationType: "individual",
        capacity: 70,
        image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200&q=80",
      },
      {
        title: "Mukhabhinaya",
        description: "Mime and theatre. Silence that still delivers a verdict.",
        date: new Date("2026-03-14T15:00:00"),
        venue: "Black Box",
        category: "Theatre",
        stage: "onstage",
        participationType: "group",
        capacity: 35,
        image: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=1200&q=80",
      },
    ]);
  }

  if ((await Workshop.countDocuments()) === 0) {
    await Workshop.insertMany([
      {
        title: "drawing workshop",
        description: "A paid masterclass art implementation",
        date: new Date("2026-03-11T10:00:00"),
        venue: "Workshop Hall A",
        mentor: "joseph m verghese",
        price: 99,
        capacity: 32,
        image: "https://images.unsplash.com/photo-1516038199228-4e16d9225c0e?w=1200&q=80",
      },
      {
        title: "Body as Argument",
        description: "Movement workshop fusing kalaripayattu lines with contemporary choreography.",
        date: new Date("2026-03-11T14:00:00"),
        venue: "Movement Studio",
        mentor: "Niranjan Dev",
        price: 349,
        capacity: 28,
        image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&q=80",
      },
      {
        title: "Ink & Verdict",
        description: "Lettering and editorial illustration for campus journals and fest posters.",
        date: new Date("2026-03-12T09:00:00"),
        venue: "Design Lab",
        mentor: "Meera K",
        price: 299,
        capacity: 36,
        image: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1200&q=80",
      },
    ]);
  }

  if ((await Proshow.countDocuments()) === 0) {
    await Proshow.insertMany(FEATURED_PROSHOWS);
  }

  if ((await Ad.countDocuments()) === 0) {
    await Ad.insertMany([
      {
        title: "Night of Scales — early bird",
        media: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1600&q=80",
        link: "/proshows",
        placement: "both",
        active: true,
      },
      {
        title: "Ink & Verdict workshop seats",
        media: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1600&q=80",
        link: "/workshops",
        placement: "workshop",
        active: true,
      },
    ]);
  }

  if ((await Winner.countDocuments()) === 0) {
    await Winner.insertMany([
      { eventTitle: "Natyashastra", studentName: "Ananya P", position: "First", department: "CSE", published: true },
      { eventTitle: "Vakyartha", studentName: "Rahul M", position: "Second", department: "ECE", published: true },
    ]);
  }
}

const ARTS_META = [
  { title: "Natyashastra", stage: "onstage", participationType: "group" },
  { title: "Vakyartha", stage: "offstage", participationType: "individual" },
  { title: "Chaya", stage: "offstage", participationType: "group" },
  { title: "Raga Nyaya", stage: "onstage", participationType: "individual" },
  { title: "Varna Rekha", stage: "offstage", participationType: "individual" },
  { title: "Mukhabhinaya", stage: "onstage", participationType: "group" },
];

const ARTS_IMAGES = {
  Dance: "https://images.unsplash.com/photo-1547153760-18fc86324438?w=1200&q=80",
  Music: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80",
  Theatre: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=1200&q=80",
  Literary: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80",
  "Fine Arts": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&q=80",
};

const ARTS_VENUE = {
  Dance: "Main Auditorium",
  Music: "Music Pavilion",
  Theatre: "Black Box",
  Literary: "Seminar Hall",
  "Fine Arts": "Art Courtyard",
};

const LANGS_SIX = ["Malayalam", "English", "Hindi", "Arabic", "Tamil", "Sanskrit"];
const LANGS_AKSHARA = ["Malayalam", "Arabic", "Sanskrit"];

const artsEvent = (title, stage, participationType, category, description) => ({
  title,
  description:
    description ||
    `${stage === "onstage" ? "Onstage" : "Offstage"} · ${participationType} · ${category}.`,
  date: new Date("2026-03-12T10:00:00"),
  venue: ARTS_VENUE[category] || "GEC Wayanad",
  category,
  stage,
  participationType,
  capacity: participationType === "group" ? 40 : 50,
  image: ARTS_IMAGES[category] || ARTS_IMAGES.Literary,
  isOpen: true,
});

const withLangs = (base, langs, stage, type, category) =>
  langs.map((lang) =>
    artsEvent(`${base} · ${lang}`, stage, type, category, `${base} in ${lang}.`)
  );

const EXTRA_ARTS = [
  ...withLangs("Essay Writing", LANGS_SIX, "offstage", "individual", "Literary"),
  ...withLangs("Poetry", LANGS_SIX, "offstage", "individual", "Literary"),
  ...withLangs("Short Story", LANGS_SIX, "offstage", "individual", "Literary"),
  artsEvent("Quiz", "offstage", "group", "Literary", "Offstage quiz. A shared case of recall."),
  artsEvent("Pencil Drawing", "offstage", "individual", "Fine Arts"),
  artsEvent("Cartooning", "offstage", "individual", "Fine Arts"),
  artsEvent("Calligraphy", "offstage", "individual", "Fine Arts"),
  artsEvent("Spot Photography", "offstage", "individual", "Fine Arts"),
  artsEvent("Digital Painting", "offstage", "individual", "Fine Arts"),
  artsEvent("Clay Modeling", "offstage", "individual", "Fine Arts"),
  artsEvent("Water Colour", "offstage", "individual", "Fine Arts"),
  artsEvent("Oil Paint", "offstage", "individual", "Fine Arts"),
  artsEvent("Poster Making", "offstage", "individual", "Fine Arts"),
  artsEvent("Collage", "offstage", "individual", "Fine Arts"),
  artsEvent("Rangoli", "offstage", "individual", "Fine Arts"),
  artsEvent("Origami", "offstage", "individual", "Fine Arts"),
  artsEvent("Vegetable Printing", "offstage", "individual", "Fine Arts"),
  artsEvent("Embroidery", "offstage", "individual", "Fine Arts"),

  ...withLangs("Recitation", LANGS_SIX, "onstage", "individual", "Literary"),
  artsEvent("Light Music", "onstage", "individual", "Music", "Solo voice. Melody as testimony."),
  artsEvent("Classical Music", "onstage", "individual", "Music"),
  artsEvent("Hindustani Classical Vocal", "onstage", "individual", "Music"),
  artsEvent("Cinematic Song", "onstage", "individual", "Music"),
  artsEvent("Kavyakeli", "onstage", "individual", "Literary"),
  artsEvent("Western Vocal Solo", "onstage", "individual", "Music"),
  artsEvent("Kathakali Sangeetham", "onstage", "individual", "Music"),
  artsEvent("Gazal", "onstage", "individual", "Music"),
  artsEvent("Mappilappattu", "onstage", "individual", "Music"),
  artsEvent("Keyboard", "onstage", "individual", "Music"),
  artsEvent("Eastern Style Stringed Instrument", "onstage", "individual", "Music"),
  artsEvent("Western Style Stringed Instrument", "onstage", "individual", "Music"),
  artsEvent("Veena", "onstage", "individual", "Music"),
  artsEvent("Guitar", "onstage", "individual", "Music"),
  artsEvent("Eastern Style Wind Instrument", "onstage", "individual", "Music"),
  artsEvent("Western Style Wind Instrument", "onstage", "individual", "Music"),
  artsEvent("Eastern Style Percussion Instrument", "onstage", "individual", "Music"),
  artsEvent("Chenda", "onstage", "individual", "Music"),
  artsEvent("Mrudangam", "onstage", "individual", "Music"),
  artsEvent("Tabala", "onstage", "individual", "Music"),
  artsEvent("Western Style Percussion Instrument", "onstage", "individual", "Music"),
  artsEvent("Organ", "onstage", "individual", "Music"),
  artsEvent("Western Dance Solo", "onstage", "individual", "Dance"),
  artsEvent("Cinematic Dance Solo", "onstage", "individual", "Dance"),
  artsEvent("Spot Choreography Dance Solo", "onstage", "individual", "Dance"),
  artsEvent("Kathak", "onstage", "individual", "Dance"),
  artsEvent("Koodiyattam", "onstage", "individual", "Theatre"),
  artsEvent("Ottam Thullal", "onstage", "individual", "Dance"),
  artsEvent("Kathakali", "onstage", "individual", "Dance"),
  artsEvent("Bharathanatyam", "onstage", "individual", "Dance"),
  artsEvent("Folk Dance", "onstage", "individual", "Dance"),
  artsEvent("Kuchipudi", "onstage", "individual", "Dance"),
  artsEvent("Kerala Nadanam", "onstage", "individual", "Dance"),
  artsEvent("Mohiniyattam", "onstage", "individual", "Dance"),
  artsEvent("Chakyarkoothu", "onstage", "individual", "Theatre"),
  artsEvent("Nangyarkoothu", "onstage", "individual", "Theatre"),
  artsEvent("Mimicry", "onstage", "individual", "Theatre"),
  artsEvent("Mono Act", "onstage", "individual", "Theatre", "One body, one case. Solo theatre."),
  artsEvent("Standup Comedy", "onstage", "individual", "Theatre"),
  ...withLangs("Elocution", LANGS_SIX, "onstage", "individual", "Literary"),
  ...withLangs("Aksharaslokam", LANGS_AKSHARA, "onstage", "individual", "Literary"),
  artsEvent("Versification", "onstage", "individual", "Literary"),
  artsEvent("Extempore", "onstage", "individual", "Literary"),
  artsEvent("Fancy Dress", "onstage", "individual", "Theatre"),

  artsEvent("Ganamela", "onstage", "group", "Music"),
  artsEvent("Vanchippattu", "onstage", "group", "Music"),
  artsEvent("Patriotic Song", "onstage", "group", "Music"),
  artsEvent("Vattapattu", "onstage", "group", "Music"),
  artsEvent("Folk Song", "onstage", "group", "Music"),
  artsEvent("Western Group Dance", "onstage", "group", "Dance"),
  artsEvent("Duet Dance", "onstage", "group", "Dance"),
  artsEvent("Classical Group Dance", "onstage", "group", "Dance"),
  artsEvent("Thiruvathira", "onstage", "group", "Dance", "Group folk dance. Lines of light and rhythm."),
  artsEvent("Oppana", "onstage", "group", "Dance"),
  artsEvent("Margamkali", "onstage", "group", "Dance"),
  artsEvent("Kerala Nadanam Group", "onstage", "group", "Dance"),
  artsEvent("Duffmuttu", "onstage", "group", "Dance"),
  artsEvent("Kolkali", "onstage", "group", "Dance"),
  artsEvent("Arabanamuttu", "onstage", "group", "Dance"),
  artsEvent("Poorakali", "onstage", "group", "Dance"),
  artsEvent("Parijamuttu", "onstage", "group", "Dance"),
  artsEvent("Skit", "onstage", "group", "Theatre"),
  artsEvent("Kathaprasangam", "onstage", "group", "Theatre"),
  artsEvent("Mime", "onstage", "group", "Theatre"),
  artsEvent("Drama", "onstage", "group", "Theatre"),
  artsEvent("Nadakam", "onstage", "group", "Theatre"),

  artsEvent("Group Song", "onstage", "group", "Music", "Choir and ensemble. Harmony as a court of many voices."),
  artsEvent("Debate", "offstage", "group", "Literary", "Offstage argument on justice, campus and the right to speak."),
  artsEvent("Pencil Portrait", "offstage", "individual", "Fine Arts", "Solo drawing. Face, line, and the weight of a gaze."),
];

export async function syncArtsEventMeta() {
  for (const row of ARTS_META) {
    await ArtsEvent.updateOne(
      { title: row.title },
      { $set: { stage: row.stage, participationType: row.participationType } }
    );
  }
  await ArtsEvent.updateMany(
    { $or: [{ stage: { $exists: false } }, { stage: null }, { stage: "" }] },
    { $set: { stage: "offstage" } }
  );
  await ArtsEvent.updateMany(
    { $or: [{ participationType: { $exists: false } }, { participationType: null }, { participationType: "" }] },
    { $set: { participationType: "individual" } }
  );
  await ArtsEvent.updateOne({ title: "Monoact" }, { $set: { title: "Mono Act" } });
  for (const event of EXTRA_ARTS) {
    const exists = await ArtsEvent.findOne({ title: event.title });
    if (!exists) await ArtsEvent.create(event);
  }
}

const FEATURED_WORKSHOPS = [
  {
    title: "Drawing Workshop",
    description: "Basic sketches of vision art with Joseph M Verghese. Line, sight, and the weight of a mark.",
    date: new Date("2026-04-05T10:00:00"),
    venue: "Art Courtyard, GEC Wayanad",
    mentor: "Joseph M Verghese",
    price: 99,
    capacity: 40,
    image: "/assets/workshops/drawing.png",
    isOpen: true,
  },
  {
    title: "Visual Design",
    description: "What we think — what we see. Photoshop and Illustrator as a court of form.",
    date: new Date("2026-04-08T10:00:00"),
    venue: "Design Lab, GEC Wayanad",
    mentor: "Raja Thashreef",
    price: 99,
    capacity: 40,
    image: "/assets/workshops/visual.png",
    isOpen: true,
  },
  {
    title: "Hiphop Workshop",
    description: "Rhythm as argument. A session with Gang 86 on movement, beat, and presence.",
    date: new Date("2026-04-09T10:00:00"),
    venue: "Movement Studio, GEC Wayanad",
    mentor: "Gang 86",
    price: 99,
    capacity: 40,
    image: "/assets/workshops/hiphop.png",
    isOpen: true,
  },
];

export async function syncFeaturedWorkshops() {
  for (const row of FEATURED_WORKSHOPS) {
    await Workshop.findOneAndUpdate({ title: row.title }, { $set: row }, { upsert: true });
  }
}

const FEATURED_PREEVENTS = [
  {
    title: "BGMI",
    description: "E Games - Games Galore. Form your squad and be ready for the clash in the maps of BGMI.",
    date: new Date("2026-04-05T10:00:00"),
    venue: "GEC Wayanad",
    category: "E-Games",
    image: "/assets/preevents/bgmi.png",
    isOpen: true,
  },
  {
    title: "Film Fest",
    description: "Tumbbad, Mucize, Suzume, Spadikam. Screens across 16-20 April.",
    date: new Date("2026-04-16T18:00:00"),
    venue: "GEC Wayanad",
    category: "Film",
    image: "/assets/preevents/film-fest.jpg",
    isOpen: true,
  },
  {
    title: "Ethnic Day",
    description: "Traditional attire on campus. Libertad College Union, 17 April.",
    date: new Date("2026-04-17T10:00:00"),
    venue: "GEC Wayanad",
    category: "Campus",
    image: "/assets/preevents/ethnic-day.jpg",
    isOpen: true,
  },
  {
    title: "Fashion Show",
    description: "The runway at Pragati. Libertad College Union, 17 April.",
    date: new Date("2026-04-17T16:00:00"),
    venue: "GEC Wayanad",
    category: "Fashion",
    image: "/assets/preevents/fashion-show.jpg",
    isOpen: true,
  },
  {
    title: "Prom Night",
    description: "17 April, 6 PM onwards. Libertad College Union, GEC Wayanad.",
    date: new Date("2026-04-17T18:00:00"),
    venue: "GEC Wayanad",
    category: "Night",
    image: "/assets/preevents/prom-night.jpg",
    isOpen: true,
  },
];

export async function syncProshows() {
  const shows = await Proshow.find().sort({ date: 1 });
  for (let i = 0; i < FEATURED_PROSHOWS.length; i += 1) {
    const row = FEATURED_PROSHOWS[i];
    if (shows[i]) {
      await Proshow.updateOne({ _id: shows[i]._id }, { $set: row });
    } else {
      await Proshow.create(row);
    }
  }
}

export async function syncPreEvents() {
  await PreEvent.deleteMany({
    title: { $in: ["House Reveal", "Flash Mob", "Open Mic", "Treasure Hunt"] },
  });
  await PreEvent.updateMany({ title: "Inter Class BGMI Tournament" }, { $set: { title: "BGMI" } });
  for (const row of FEATURED_PREEVENTS) {
    await PreEvent.findOneAndUpdate({ title: row.title }, { $set: row }, { upsert: true });
  }
}

export async function syncHouses() {
  for (const row of HOUSE_TABLE) {
    await House.findOneAndUpdate({ name: row.name }, { $setOnInsert: row }, { upsert: true });
  }
}
