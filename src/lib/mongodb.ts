import { MongoClient, Db } from "mongodb";

const uri =
  process.env.MONGODB_URI ||
  (process.env.NODE_ENV === "development" ? "mongodb://127.0.0.1:27017/inacard" : "");

const options = {
  // Short timeout so if local MongoDB or Compass instance is not running, it quickly falls back without hanging
  serverSelectionTimeoutMS: 3000,
  connectTimeoutMS: 3000,
};

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export function isMongoConfigured(): boolean {
  return Boolean(uri && uri.trim().length > 0);
}

export async function getMongoClient(): Promise<MongoClient | null> {
  if (!isMongoConfigured()) {
    return null;
  }

  try {
    if (process.env.NODE_ENV === "development") {
      if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect().catch((err) => {
          console.warn("MongoDB connection failed (falling back to local storage):", err.message);
          global._mongoClientPromise = undefined;
          return Promise.reject(err);
        });
      }
      return await global._mongoClientPromise;
    } else {
      if (!clientPromise) {
        client = new MongoClient(uri, options);
        clientPromise = client.connect().catch((err) => {
          console.warn("Production MongoDB connection error:", err.message);
          clientPromise = null;
          return Promise.reject(err);
        });
      }
      return await clientPromise;
    }
  } catch (err) {
    return null;
  }
}

export async function getMongoDb(dbName = "inacard"): Promise<Db | null> {
  try {
    const client = await getMongoClient();
    if (!client) return null;
    return client.db(dbName);
  } catch {
    return null;
  }
}
