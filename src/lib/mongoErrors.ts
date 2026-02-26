function redactMongoUri(text: string) {
  // Avoid echoing credentials/URIs back to the client.
  return text
    .replace(/mongodb(\+srv)?:\/\/[^\s]+/gi, "[redacted-mongodb-uri]")
    .replace(/([Pp]assword=)[^&\s]+/g, "$1[redacted]");
}

export function explainMongoError(err: unknown) {
  const name = (err as any)?.name ? String((err as any).name) : "";
  const rawMsg = err instanceof Error ? err.message : String(err);
  const msg = redactMongoUri(rawMsg);

  const lower = msg.toLowerCase();

  if (lower.includes("mongodb is not configured") || lower.includes("set mongodb_uri")) {
    return "MongoDB is not configured. Set MONGODB_URI in your Vercel Environment Variables.";
  }

  if (lower.includes("not authorized")) {
    return "MongoDB user is not authorized for the selected database. Ensure your Atlas user has read/write access to the DB (default: techshop_pro) or set MONGODB_DB to the correct database name.";
  }

  if (lower.includes("authentication failed") || lower.includes("auth failed")) {
    return "MongoDB authentication failed. Double-check the username/password in MONGODB_URI and that the database user exists in Atlas.";
  }

  if (
    name.includes("MongoServerSelectionError") ||
    lower.includes("server selection") ||
    lower.includes("timed out") ||
    lower.includes("enotfound") ||
    lower.includes("econnrefused")
  ) {
    return "MongoDB connection failed. In MongoDB Atlas: Network Access → IP Access List → allow access from 0.0.0.0/0 (or add Vercel IPs).";
  }

  // Fallback to a trimmed, redacted message.
  return msg.length > 240 ? msg.slice(0, 240) + "…" : msg;
}
