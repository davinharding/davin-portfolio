/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  // PostHog's API paths end in a slash; redirecting them would break capture.
  skipTrailingSlashRedirect: true,

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Same-origin proxy for PostHog (POSTHOG_PROXY_PATH in src/lib/analytics/config.ts),
  // so ad blockers that drop third-party analytics hosts keep the events.
  async rewrites() {
    return [
      { source: "/relay-dh/static/:path*", destination: "https://us-assets.i.posthog.com/static/:path*" },
      { source: "/relay-dh/array/:path*", destination: "https://us-assets.i.posthog.com/array/:path*" },
      { source: "/relay-dh/:path*", destination: "https://us.i.posthog.com/:path*" },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
      {
        source: "/(logos|projectScreenshots|new_profile_pic.png|logo.svg|logo-light.svg)/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

};

module.exports = nextConfig;
