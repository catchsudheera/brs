/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: [
      'lh3.googleusercontent.com', // For Google profile images
    ],
  },
};
export default nextConfig;
