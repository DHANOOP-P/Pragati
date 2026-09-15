import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let memoryServer;

export function resolveMongoUri(raw = process.env.MONGO_URI, dbName = "pragati") {
  const fallback = `mongodb://127.0.0.1:27017/${dbName}`;
  if (!raw) return fallback;
  try {
    const url = new URL(raw);
    if (!url.pathname || url.pathname === "/") url.pathname = `/${dbName}`;
    return url.toString();
  } catch {
    return raw;
  }
}

export function redactMongoUri(uri = "") {
  return String(uri).replace(/\/\/([^:/?#]+):([^@]+)@/, "//$1:***@");
}

export function isRemoteMongoUri(uri = "") {
  return String(uri).includes("mongodb+srv://") || /mongodb\.net/i.test(uri);
}

export async function connectDb() {
  const uri = resolveMongoUri();

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 20000,
      family: 4,
      autoSelectFamily: false,
    });
    console.log("MongoDB connected:", redactMongoUri(uri));
    return { memory: false, uri };
  } catch (err) {
    if (isRemoteMongoUri(uri)) {
      console.error("MongoDB Atlas connection failed:", err.message);
      throw err;
    }
    console.warn("Local MongoDB unavailable, starting in-memory database:", err.message);
    memoryServer = await MongoMemoryServer.create();
    const memUri = memoryServer.getUri();
    await mongoose.connect(memUri);
    console.log("In-memory MongoDB ready");
    return { memory: true, uri: memUri };
  }
}
