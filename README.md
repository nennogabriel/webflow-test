# Webflow Test

This is a Next.js project configured to run on Cloudflare Pages.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Cloudflare Pages Deployment

### Prerequisites

1. Install Wrangler CLI:
```bash
npm install -g wrangler
```

2. Login to Cloudflare:
```bash
wrangler login
```

### Local Development with Cloudflare Pages

To test your application locally using Cloudflare Pages:

```bash
npm run preview
```

### Deploy to Cloudflare Pages

To deploy your application to Cloudflare Pages:

```bash
npm run deploy
```

### Manual Deployment

1. Build the project:
```bash
npm run pages:build
```

2. Deploy using Wrangler:
```bash
wrangler pages deploy
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run download` - Download webflow assets
- `npm run pages:build` - Build for Cloudflare Pages
- `npm run preview` - Preview locally with Cloudflare Pages
- `npm run deploy` - Deploy to Cloudflare Pages

## Learn More

To learn more about Next.js and Cloudflare Pages:

- [Next.js Documentation](https://nextjs.org/docs)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Next.js on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/ssr/get-started/)
