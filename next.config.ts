import type { NextConfig } from "next";

const isPages = process.env.GITHUB_PAGES === "1";

const nextConfig: NextConfig = {
  ...(isPages
    ? {
        output: "export" as const,
        images: { unoptimized: true },
        trailingSlash: true,
      }
    : {
        // Ship prebuilt SQLite seed (synced at build) into all serverless routes
        outputFileTracingIncludes: {
          "/**/*": ["./prisma/data.db", "./prisma/runtime.db"],
        },
      }),
};

export default nextConfig;
