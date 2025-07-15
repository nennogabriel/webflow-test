import fs from 'fs/promises';
import path from 'path';
import * as cheerio from 'cheerio';
import { WEBFLOW_BASE_URL, PAGES_TO_DOWNLOAD } from './routes.js';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'webflow');
const CSS_DIR = path.join(OUTPUT_DIR, 'css');

const ensureDir = (dirPath) => fs.mkdir(dirPath, { recursive: true });

const rewriteCssUrls = (cssContent, cssUrl) => {
    const cssUrlRegex = /url\((['"]?)(?!data:)([^'")]*)\1\)/g;
    return cssContent.replace(cssUrlRegex, (match, quote, url) => {
        try {
            const absoluteUrl = new URL(url, cssUrl).href;
            return `url(${quote}${absoluteUrl}${quote})`;
        } catch (e) {
            console.warn(`Could not create absolute URL for: ${url} in ${cssUrl}`);
            return match;
        }
    });
};

// Cache for already downloaded CSS
const downloadedCss = new Set();

async function downloadCss(cssUrl, $, pageUrl) {
    if (downloadedCss.has(cssUrl)) {
        return;
    }

    try {
        const cssFileName = path.basename(new URL(cssUrl).pathname);
        const localCssPath = path.join(CSS_DIR, cssFileName);
        const relativeCssPath = `/webflow/css/${cssFileName}`;
        
        console.log(`Downloading CSS: ${cssUrl}`);
        const cssResponse = await fetch(cssUrl);
        if (cssResponse.ok) {
            const cssContent = await cssResponse.text();
            const rewrittenCss = rewriteCssUrls(cssContent, cssUrl);
            await fs.writeFile(localCssPath, rewrittenCss);
            downloadedCss.add(cssUrl);
            console.log(`Saved CSS to ${localCssPath}`);
        }
    } catch(e) {
        console.error(`Error processing stylesheet ${cssUrl}:`, e.message);
    }
}

async function downloadWebflowPage(pagePath, outputFile) {
  try {
    const pageUrl = `${WEBFLOW_BASE_URL}${pagePath}`;
    console.log(`Downloading page: ${pageUrl}`);
    
    // Create directory for the page if necessary
    const outputPath = path.join(OUTPUT_DIR, outputFile);
    const outputDir = path.dirname(outputPath);
    await ensureDir(outputDir);

    const response = await fetch(pageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${pageUrl}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const tagsToUpdate = {
        'img': ['src', 'srcset'],
        'script': ['src'],
        'source': ['src', 'srcset'],
    };

    for (const [tag, attrs] of Object.entries(tagsToUpdate)) {
        $(tag).each((i, el) => {
            for (const attr of attrs) {
                const element = $(el);
                const attributeValue = element.attr(attr);
                if (attributeValue && !attributeValue.startsWith('data:')) {
                    if (attr === 'srcset') {
                        const newSrcset = attributeValue
                            .split(',')
                            .map(part => {
                                const [url, size] = part.trim().split(/\s+/);
                                try {
                                    const absoluteUrl = new URL(url, pageUrl).href;
                                    return `${absoluteUrl} ${size || ''}`.trim();
                                } catch (e) { return part; }
                            })
                            .join(', ');
                        element.attr(attr, newSrcset);
                    } else {
                        try {
                           const absoluteUrl = new URL(attributeValue, pageUrl).href;
                           element.attr(attr, absoluteUrl);
                        } catch (e) { /* ignore */ }
                    }
                }
            }
        });
    }

    // Download CSS files
    const cssPromises = [];
    $('link[rel="stylesheet"]').each((i, el) => {
        const element = $(el);
        const href = element.attr('href');
        if (href) {
            const cssUrl = new URL(href, pageUrl).href;
            const promise = downloadCss(cssUrl, $, pageUrl);
            cssPromises.push(promise);
        }
    });

    await Promise.all(cssPromises);

    // Update CSS hrefs to relative paths
    $('link[rel="stylesheet"]').each((i, el) => {
        const element = $(el);
        const href = element.attr('href');
        if (href) {
            const cssUrl = new URL(href, pageUrl).href;
            const cssFileName = path.basename(new URL(cssUrl).pathname);
            const relativeCssPath = `/webflow/css/${cssFileName}`;
            element.attr('href', relativeCssPath);
        }
    });

    $('style').each((i, el) => {
        const styleTag = $(el);
        const styleContent = styleTag.html();
        const rewrittenStyleContent = rewriteCssUrls(styleContent, pageUrl);
        styleTag.html(rewrittenStyleContent);
    });

    // Add CSS to hide the "Made in Webflow" banner
    const hideWebflowBannerCss = '<style>.w-webflow-badge { display: none !important; }</style>';
    $('head').append(hideWebflowBannerCss);

    const updatedHtml = $.html();
    await fs.writeFile(outputPath, updatedHtml);

    console.log(`Successfully downloaded and processed page. Saved to ${outputPath}`);
  } catch (error) {
    console.error(`Error downloading page ${pagePath}:`, error);
    throw error;
  }
}

async function downloadAllPages() {
  try {
    console.log('Starting download of all pages...');
    console.log(`Pages to download: ${PAGES_TO_DOWNLOAD.map(p => p.path).join(', ')}`);
    
    await ensureDir(OUTPUT_DIR);
    await ensureDir(CSS_DIR);

    for (const page of PAGES_TO_DOWNLOAD) {
      try {
        await downloadWebflowPage(page.path, page.outputFile);
      } catch (error) {
        console.error(`Failed to download ${page.path}:`, error.message);
        // Continue with other pages even if one fails
      }
    }

    console.log('All pages downloaded successfully!');
  } catch (error) {
    console.error('Error in download script:', error);
    process.exit(1);
  }
}

// Run the download if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  downloadAllPages();
}

export { downloadAllPages, downloadWebflowPage }; 