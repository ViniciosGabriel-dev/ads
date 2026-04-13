import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: [
    "puppeteer-extra",
    "puppeteer-extra-plugin-stealth",
    "puppeteer-extra-plugin",
    "puppeteer-core",
    "puppeteer",
    "merge-deep",
    "clone-deep",
    "is-plain-object",
    "lazy-cache",
    "shallow-clone",
    "kind-of",
    "for-own",
  ],
  logging: false,
  productionBrowserSourceMaps: false,
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "no-referrer" },
        // Impede que o navegador guarde no cache (dificulta análise offline)
        { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
      ],
    },
  ],
};

export default nextConfig;
