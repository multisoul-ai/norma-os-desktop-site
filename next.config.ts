import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next strips every trailing slash by default. That would turn /prototype/ios/
  // into /prototype/ios, and the prototype's relative ./MODULES.md link would
  // resolve at the site root. Skip the built-in redirect and recreate it for
  // every path except this directory URL.
  skipTrailingSlashRedirect: true,
  async redirects() {
    return [
      {
        source: "/prototype/ios/:path+/",
        destination: "/prototype/ios/:path+",
        permanent: true,
      },
      {
        source: "/:path((?!prototype/ios/).*)/",
        destination: "/:path",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/prototype/ios/",
          destination: "/prototype/ios/index.html",
        },
      ],
    };
  },
};

export default nextConfig;
