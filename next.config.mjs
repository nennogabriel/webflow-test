import { generateNextJsRewrites } from './src/webflow/routes.js';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Serve static HTML files from public/webflow directory
  async rewrites() {
    return generateNextJsRewrites();
  },
};

export default nextConfig;
