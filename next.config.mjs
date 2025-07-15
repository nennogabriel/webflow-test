import fs from 'fs/promises';
import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Configure static file serving with clean URLs
  async rewrites() {
    const rewrites = [
      // Serve index.html for root path
      {
        source: '/',
        destination: '/index.html',
      },
    ];

    // Dynamically add rewrites for HTML files
    try {
      const publicDir = path.join(process.cwd(), 'public');
      const htmlFiles = await findHtmlFiles(publicDir);
      
      for (const htmlFile of htmlFiles) {
        const relativePath = htmlFile.replace(publicDir, '').replace(/^\//, '');
        const routePath = relativePath.replace(/\.html$/, '');
        
        if (routePath === 'index') {
          // Skip root index.html as it's already handled
          continue;
        }
        
        if (relativePath.endsWith('/index.html')) {
          // This is an index.html in a directory, add directory rewrite
          const dirPath = routePath.replace(/\/index$/, '');
          rewrites.push({
            source: `/${dirPath}/`,
            destination: `/${relativePath}`,
          });
          rewrites.push({
            source: `/${dirPath}`,
            destination: `/${relativePath}`,
          });
        } else {
          // This is a regular HTML file
          rewrites.push({
            source: `/${routePath}`,
            destination: `/${relativePath}`,
          });
        }
      }
    } catch (error) {
      console.warn('Could not scan for HTML files:', error.message);
    }

    return rewrites;
  },
};

// Helper function to find all HTML files recursively
async function findHtmlFiles(dir) {
  const files = [];
  
  try {
    const items = await fs.readdir(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = await fs.stat(fullPath);
      
      if (stat.isDirectory()) {
        const subFiles = await findHtmlFiles(fullPath);
        files.push(...subFiles);
      } else if (item.endsWith('.html')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
  }
  
  return files;
}

export default nextConfig;
