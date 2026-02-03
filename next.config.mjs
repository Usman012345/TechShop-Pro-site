/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Static export configuration (Vercel / Cloudflare Pages / Netlify friendly)
   *
   * NOTE: With `output: 'export'` you deploy the generated `/out` folder.
   * This keeps the storefront static-host ready.
   */
  output: "export",
  trailingSlash: true,
  images: {
    // next/image optimization isn't available in pure static export mode.
    // This keeps <Image /> working by outputting standard <img> tags.
    unoptimized: true,
  },
};

export default nextConfig;
