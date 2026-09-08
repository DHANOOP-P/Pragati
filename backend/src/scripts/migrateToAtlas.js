import "dotenv/config";
import { MongoClient } from "mongodb";
import { redactMongoUri, resolveMongoUri } from "../config/db.js";

const LOCAL_URI = "mongodb://127.0.0.1:27017/pragati";

async function putDoc(dest, doc) {
  try {
    await dest.replaceOne({ _id: doc._id }, doc, { upsert: true });
  } catch (err) {
    if (err.code !== 11000 || !err.keyValue) throw err;
    await dest.deleteMany({ ...err.keyValue, _id: { $ne: doc._id } });
    await dest.replaceOne({ _id: doc._id }, doc, { upsert: true });
  }
}

async function copyCollection(fromDb, toDb, name) {
  const docs = await fromDb.collection(name).find().toArray();
  if (!docs.length) {
    console.log(`  ${name}: empty, skipped`);
    return 0;
  }
  const dest = toDb.collection(name);
  for (const doc of docs) {
    await putDoc(dest, doc);
  }
  const removed = await dest.deleteMany({ _id: { $nin: docs.map((doc) => doc._id) } });
  if (removed.deletedCount) {
    console.log(`  ${name}: ${docs.length} documents, removed ${removed.deletedCount} extras`);
  } else {
    console.log(`  ${name}: ${docs.length} documents`);
  }
  return docs.length;
}

async function main() {
  const remoteUri = resolveMongoUri(process.env.MONGO_URI);
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in backend/.env");
  }

  console.log("Local :", LOCAL_URI);
  console.log("Remote:", redactMongoUri(remoteUri));

  const local = new MongoClient(LOCAL_URI, { serverSelectionTimeoutMS: 8000 });
  const remote = new MongoClient(remoteUri, { serverSelectionTimeoutMS: 20000 });

  await local.connect();
  await remote.connect();

  const fromDb = local.db("pragati");
  const toDb = remote.db("pragati");
  const collections = (await fromDb.listCollections().toArray()).filter((c) => !c.name.startsWith("system."));

  if (!collections.length) {
    console.log("No local collections found. Nothing to copy.");
  } else {
    console.log(`Copying ${collections.length} collections…`);
    let total = 0;
    for (const { name } of collections) {
      total += await copyCollection(fromDb, toDb, name);
    }
    console.log(`Done. ${total} documents now on Atlas (pragati).`);
  }

  await local.close();
  await remote.close();
}

main().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
