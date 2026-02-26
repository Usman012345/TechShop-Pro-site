import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminAuth";
import { getDraftCatalog } from "@/lib/draftCatalogStore";
import { explainMongoError } from "@/lib/mongoErrors";

export const runtime = "nodejs";

async function assertAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

function getGitHubConfig() {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH ?? "main";
  const path = process.env.GITHUB_CATALOG_PATH ?? "src/data/catalogSeed.ts";

  if (!token || !owner || !repo) {
    return null;
  }

  return { token, owner, repo, branch, path };
}

function encodeGitHubPath(path: string) {
  return path
    .split("/")
    .map((p) => encodeURIComponent(p))
    .join("/");
}

function toBase64(content: string) {
  return Buffer.from(content, "utf8").toString("base64");
}

function generateCatalogSeedTs(catalog: unknown) {
  const json = JSON.stringify(catalog, null, 2);
  return `import type { Catalog } from "@/types/catalog";

/**
 * AUTO-GENERATED FILE.
 *
 * This file is updated by the Admin Panel (Publish action).
 * Do not edit manually.
 */

export const CATALOG_SEED: Catalog = ${json};
`;
}

async function githubFetch(
  url: string,
  token: string,
  init?: RequestInit
): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: {
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
      "user-agent": "techshop-pro-admin",
      authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
    // Node fetch: keep default.
  });
}

async function getExistingFileSha(opts: {
  token: string;
  owner: string;
  repo: string;
  path: string;
  branch: string;
}): Promise<string | null> {
  const encodedPath = encodeGitHubPath(opts.path);
  const url = `https://api.github.com/repos/${opts.owner}/${opts.repo}/contents/${encodedPath}?ref=${encodeURIComponent(
    opts.branch
  )}`;

  const res = await githubFetch(url, opts.token);
  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GitHub GET failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as { sha?: string };
  return data.sha ?? null;
}

async function upsertFile(opts: {
  token: string;
  owner: string;
  repo: string;
  path: string;
  branch: string;
  message: string;
  contentBase64: string;
  sha?: string | null;
}): Promise<{ htmlUrl?: string }>
{
  const encodedPath = encodeGitHubPath(opts.path);
  const url = `https://api.github.com/repos/${opts.owner}/${opts.repo}/contents/${encodedPath}`;

  const body: Record<string, unknown> = {
    message: opts.message,
    content: opts.contentBase64,
    branch: opts.branch,
  };
  if (opts.sha) body.sha = opts.sha;

  const res = await githubFetch(url, opts.token, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GitHub PUT failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = (await res.json().catch(() => null)) as
    | { content?: { html_url?: string }; commit?: { html_url?: string } }
    | null;

  return { htmlUrl: data?.commit?.html_url ?? data?.content?.html_url };
}

export async function POST(_req: NextRequest) {
  const unauth = await assertAdmin();
  if (unauth) return unauth;

  const cfg = getGitHubConfig();
  if (!cfg) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "GitHub publish is not configured. Set GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO environment variables.",
      },
      { status: 400 }
    );
  }

  let draft: unknown;
  try {
    draft = await getDraftCatalog();
  } catch (e) {
    return NextResponse.json({ ok: false, error: explainMongoError(e) }, { status: 500 });
  }

  const ts = generateCatalogSeedTs(draft);

  try {
    const sha = await getExistingFileSha(cfg);
    const now = new Date();
    const message = `Publish catalog (${now.toISOString()})`;

    const result = await upsertFile({
      ...cfg,
      message,
      contentBase64: toBase64(ts),
      sha,
    });

    return NextResponse.json({ ok: true, commitUrl: result.htmlUrl });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Publish failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
