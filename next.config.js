/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'res.cloudinary.com'  // Adăugăm domeniul Cloudinary
    ]
  }
}

module.exports = nextConfig 