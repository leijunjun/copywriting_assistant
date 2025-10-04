/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    BUILD_ENV: process.env.BUILD_ENV || 'test',
    buildTime: new Date().toLocaleString()
  }
};

export default nextConfig;
