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
        // Ship prebuilt SQLite seed DB into serverless functions (copied to /tmp at runtime)
        outputFileTracingIncludes: {
          "/api/**/*": ["./prisma/data.db"],
          "/admin61/**/*": ["./prisma/data.db"],
        },
      }),
};

export default nextConfig;
