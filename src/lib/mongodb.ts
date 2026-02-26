import { MongoClient, type Db } from "mongodb";

/**
 * Minimal MongoDB connection helper for Next.js (serverless-friendly).
 *
 * Required env:
 *   - MONGODB_URI
 * Optional:
 *   - MONGODB_DB (defaults to "techshop_pro")
 */

declare global {
  // eslint-disable-next-line no-var
  var _techshopMongoClientPromise: Promise<MongoClient> | undefined;
}

function normalizeEnv(value: string | undefined | null) {
  if (!value) return "";
  const trimmed = value.trim();
  // Strip common accidental wrapping quotes from dashboard copy/paste.
  return trimmed.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
}

export function getMongoUri() {
  return normalizeEnv(process.env.MONGODB_URI);
}

export function isMongoConfigured() {
  return Boolean(getMongoUri());
}

export async function getMongoClient(): Promise<MongoClient> {
  const uri = getMongoUri();
  if (!uri) {
    throw new Error("MongoDB is not configured. Set MONGODB_URI in environment variables.");
  }

  // Reuse the client across hot reloads in dev and across invocations in serverless.
  if (!globalThis._techshopMongoClientPromise) {
    const client = new MongoClient(uri, {
      // Fail fast so the admin UI can show a useful error instead of hanging.
      serverSelectionTimeoutMS: 8000,
    });
    globalThis._techshopMongoClientPromise = client.connect();
  }

  return globalThis._techshopMongoClientPromise;
}

export async function getMongoDb(): Promise<Db> {
  const client = await getMongoClient();
  const dbName =
    normalizeEnv(process.env.MONGODB_DB) ||
    normalizeEnv(process.env.MONGODB_DATABASE) ||
    "techshop_pro";

  // IMPORTANT:
  // If the URI doesn't include a DB name and MONGODB_DB isn't set, Mongo defaults to "test".
  // Many Atlas users only grant permissions to a specific DB, which causes "not authorized".
  // We default to "techshop_pro" for this project.
  return client.db(dbName);
}
