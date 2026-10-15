# Anjola storefront branding

Positioning: gifts, lifestyle essentials and everyday joys. The catalog includes curated gift boxes, gift packaging, bathroom essentials, drinkware, cosmetic bags, tote bags, fashion accessories and foot care. Keep the ribbon as the brand mark and the pink/purple palette; avoid presenting the business as primarily a skincare or wellness store.

`src/branding.json` holds public page metadata and brand information. `public/index.html` supplies the initial homepage metadata, social image and OnlineStore structured data. Keep these aligned when changing the identity. `src/siteMetadata.js` updates existing tags during client navigation, without adding duplicate canonicals.

`npm run build` generates HTML metadata for each route under `build/seo/` and a four-page `build/sitemap.xml`. Vercel and the `_redirects` file map public route URLs to these files. Hosting must run the complete npm build command, including `scripts/build-seo.cjs`. These files provide metadata before JavaScript executes; the page content still renders in React.

The public sitemap includes `/`, `/shop`, `/blog` and `/contact`. Account, checkout and administrative pages use noindex; this is a search directive, not access control. `/product` also uses noindex because it currently selects a product from browser state and does not identify one product in its URL. Dedicated product URLs, loading by ID and product-specific metadata need a separate implementation before adding products to the sitemap.

The social card is `public/anjola-social-v4.png` (1200 × 630). Its editable HTML/CSS source is `scripts/social-preview.html`; export it in a browser at the same viewport size. The small ribbon is retained as the brand signature.

After deployment, inspect the HTML returned by the public routes and confirm `/sitemap.xml` and the social image return their actual file types. Submit `https://anjolaaestheticsng.com/sitemap.xml` in the site's verified Google Search Console property. Submission and recrawling have not been performed by this code change, and search/social caches may retain older previews.

References: [Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [Vercel rewrites](https://vercel.com/docs/routing/rewrites), [OnlineStore schema](https://schema.org/OnlineStore).
