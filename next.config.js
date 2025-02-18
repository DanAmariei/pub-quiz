/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com']
  },
  experimental: {
    serverActions: true
  },
  typescript: {
    ignoreBuildErrors: true
  }
}

module.exports = nextConfig 