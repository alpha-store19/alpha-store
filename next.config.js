/** @type {import('next').NextConfig} */
const nextConfig = {
  generateBuildId: () => `build-${Date.now()}`,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
}

module.exports = nextConfig
