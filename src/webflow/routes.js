// Webflow routes configuration
export const WEBFLOW_BASE_URL = 'https://zigchain-com-qa.webflow.io';

// List of pages to download
export const PAGES_TO_DOWNLOAD = [
  { path: '/', outputFile: 'index.html' },
  { path: '/legal/terms-and-conditions', outputFile: 'legal/terms-and-conditions.html' },
];

// Generate Next.js rewrites from the pages configuration
export function generateNextJsRewrites() {
  return PAGES_TO_DOWNLOAD.map(page => ({
    source: page.path,
    destination: `/webflow/${page.outputFile}`,
  }));
}

// Get all webflow routes for validation
export function getWebflowRoutes() {
  return PAGES_TO_DOWNLOAD.map(page => page.path);
} 