/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Vercel-friendly Next.js deployment.
   *
   * This repo started as a static export, but the v2 demo adds:
   * - Admin panel routes
   * - API routes
   *
   * …which require a server runtime (still deploys on Vercel free tier).
   */
  trailingSlash: true,
  images: {
    // Keep images unoptimized for simplicity and predictable builds.
    unoptimized: true,
  },
};

export default nextConfig;
