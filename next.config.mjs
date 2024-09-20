import path from "node:path";

const cacheHandler = path.resolve(
  process.env.HANDLER_PATH ?? "./cache-handler.mjs"
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheHandler:
    process.env.NODE_ENV !== "development" ? cacheHandler : undefined,
  cacheMaxMemorySize: 0, // disable default in-memory caching
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  experimental: {
    instrumentationHook: true,
    staleTimes: {
      dynamic: 10,
    },
  },
};

export default nextConfig;
