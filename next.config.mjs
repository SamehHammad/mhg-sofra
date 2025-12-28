
/** @type {import('next').NextConfig} */

const nextConfig = {
  //================ ESLint =================
  eslint: {
    ignoreDuringBuilds: true, // Disable ESLint during build
  },
  rewrites() {
    return [
      {
        source: "/manifest.json",
        destination: "/api/manifest",
      },
    ];
  },
};

export default nextConfig;
