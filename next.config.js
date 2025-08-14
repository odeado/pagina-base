/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // Opcional para evitar errores de ESLint
  },
  typescript: {
    ignoreBuildErrors: true, // Opcional si usas TypeScript
  }
};

module.exports = nextConfig;