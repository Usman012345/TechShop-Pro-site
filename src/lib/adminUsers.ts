import bcrypt from "bcryptjs";
import { getMongoDb } from "@/lib/mongodb";

export type AdminUser = {
  username: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
};

const ADMINS_COLLECTION = "admins";

function normalizeUsername(input: string) {
  return input.trim().toLowerCase();
}

function getDefaultAdminUsername() {
  return normalizeUsername(process.env.ADMIN_USERNAME ?? "admin");
}

function getDefaultAdminAuthKey() {
  // Prefer the explicit ADMIN_AUTH_KEY.
  // Keep ADMIN_PASSWORD as a legacy fallback so older deployments don't break.
  // As requested, default to the built-in key if nothing is configured.
  const raw = process.env.ADMIN_AUTH_KEY ?? process.env.ADMIN_PASSWORD ?? "T3ch$hopPr0";
  // Avoid common dashboard copy/paste issues (quotes / whitespace).
  return raw
    .trim()
    .replace(/^"(.*)"$/, "$1")
    .replace(/^'(.*)'$/, "$1")
    // Next.js uses dotenv-expand, so values containing `$` may need escaping as `\$` in .env.
    // Normalize both forms so ADMIN_AUTH_KEY can be written as either:
    //   ADMIN_AUTH_KEY=T3ch$hopPr0
    //   ADMIN_AUTH_KEY=T3ch\$hopPr0
    .replace(/\\\$/g, "$");
}

async function getAdminsCollection() {
  const db = await getMongoDb();
  const col = db.collection<AdminUser>(ADMINS_COLLECTION);
  // Ensure an index for fast lookups + uniqueness.
  // If this fails (e.g. insufficient permissions or duplicate legacy records),
  // the app can still function — do not block login.
  try {
    await col.createIndex({ username: 1 }, { unique: true });
  } catch {
    // Ignore.
  }
  return col;
}

/**
 * Creates the first admin user in MongoDB if none exists.
 *
 * Uses ADMIN_USERNAME / ADMIN_AUTH_KEY from env as the seed values.
 * The key is stored as a bcrypt hash.
 */
export async function ensureAdminSeedUser(): Promise<void> {
  const username = getDefaultAdminUsername();

  const authKey = getDefaultAdminAuthKey();

  // If MongoDB isn't configured or isn't reachable, don't hard-fail the whole admin login.
  // The admin panel can still run in a temporary dev mode (draft stored in memory), and the
  // login can fall back to comparing the key against the configured ADMIN_AUTH_KEY.
  let col: Awaited<ReturnType<typeof getAdminsCollection>> | null = null;
  try {
    col = await getAdminsCollection();
  } catch {
    return;
  }

  // Ensure the *default* admin exists (the login screen does not ask for username).
  const existing = await col.findOne({ username });
  if (existing) {
    // Self-heal: If a previous env value had an unescaped `$`, Next's dotenv-expand could have
    // truncated it (e.g. "T3ch$hopPr0" -> "T3ch"). If we detect that legacy hash, upgrade it.
    // This only runs for the built-in default key.
    if (authKey === "T3ch$hopPr0") {
      const okFull = await bcrypt.compare(authKey, existing.passwordHash);
      if (!okFull) {
        const okPrefix = await bcrypt.compare("T3ch", existing.passwordHash);
        if (okPrefix) {
          const now = new Date();
          const passwordHash = await bcrypt.hash(authKey, 12);
          await col.updateOne({ username }, { $set: { passwordHash, updatedAt: now } });
        }
      }
    }
    return;
  }

  if (!authKey) {
    throw new Error(
      "No admin user exists in MongoDB and no admin auth key is configured. Set ADMIN_AUTH_KEY env var to seed the first admin."
    );
  }

  const passwordHash = await bcrypt.hash(authKey, 12);
  const now = new Date();

  await col.insertOne({ username, passwordHash, createdAt: now, updatedAt: now });
}

/**
 * Verify the single "Admin Authorization Key".
 *
 * The login UI asks for one field only; the admin user is looked up by the
 * configured ADMIN_USERNAME (defaults to "admin").
 */
export async function verifyAdminAuthKey(authKeyRaw: string): Promise<boolean> {
  const authKey = authKeyRaw.trim();
  if (!authKey) return false;

  const username = getDefaultAdminUsername();

  // Prefer MongoDB (hashed) auth.
  try {
    const col = await getAdminsCollection();
    const user = await col.findOne({ username });
    if (!user) return false;
    return bcrypt.compare(authKey, user.passwordHash);
  } catch {
    // Fallback (dev / misconfigured Mongo): allow login if the key matches the configured value.
    // NOTE: In production, you should configure MongoDB so credentials are stored as a bcrypt hash.
    return authKey === getDefaultAdminAuthKey();
  }
}

// Backwards compatibility: keep the old API signature.
// (Some callers may still use username/password.)
export async function verifyAdminCredentials(usernameRaw: string, password: string): Promise<boolean> {
  const username = normalizeUsername(usernameRaw);
  if (username && username !== getDefaultAdminUsername()) return false;
  return verifyAdminAuthKey(password);
}
