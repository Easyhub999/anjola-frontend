# Anjola storefront branding

Positioning: gifts, lifestyle essentials and everyday joys. The catalog includes curated gift boxes, gift packaging, bathroom essentials, drinkware, cosmetic bags, tote bags, fashion accessories and foot care. Keep the ribbon as the brand mark and the pink/purple palette; avoid presenting the business as primarily a skincare or wellness store.

`src/branding.json` holds public page metadata and brand information. `public/index.html` supplies the initial homepage metadata, social image and OnlineStore structured data. Keep these aligned when changing the identity. `src/siteMetadata.js` updates existing tags during client navigation, without adding duplicate canonicals.

`npm run build` generates HTML metadata for the static routes under `build/seo/`. Vercel and the `_redirects` file map those public route URLs to the generated files. Hosting must run the complete npm build command, including `scripts/build-seo.cjs`.

Each product has a permanent `/product/<MongoDB ID>` URL. Product names can change without breaking these links. React loads current details by ID instead of relying on browser storage, and the legacy `/product` URL redirects to the last viewed item when available. Hidden, deleted and invalid products show an unavailable state; network failures offer retry. Visible sold-out products remain readable with purchasing disabled.

On Vercel, `/product/:id` is rewritten to `api/product.js`. It reads the built SPA template bundled through `functions.includeFiles`, fetches the public backend record and returns product-specific metadata and Product structured data before JavaScript executes. It preserves the React assets, so visitors use the same interactive product page. Public paths take priority over conflicting query IDs. Missing/hidden products return HTTP404; backend or template failures return HTTP503. Error responses are noindex and not cached. Successful metadata can remain cached for up to 60 seconds. Prices are in NGN, and pack offers show pack prices rather than per-piece prices.

`/sitemap.xml` is served dynamically by `api/sitemap.js`, containing `/`, `/shop`, `/blog`, `/contact` and the current visible products. It is cached for 60 seconds and returns503 if the catalog cannot be loaded. No static `build/sitemap.xml` is emitted, so it cannot shadow the function. Account, checkout, administrative and legacy product landing pages use noindex; this is a search directive, not access control. Search Console submission still needs the site's verified account.

Deploy the backend endpoint update and then the frontend. The server-rendered product metadata and dynamic sitemap require the Vercel functions configuration; `_redirects` alone on another static host will not provide them. Confirm the deployed function includes `build/seo/product.html`, inspect a real product URL's source without executing JavaScript, and check the sitemap and404 behavior. `npm run test:seo` covers the server handlers with isolated data; frontend component tests cover direct loading, request races, errors and navigation. No live payment is needed to verify this feature.

The social card is `public/anjola-social-v4.png` (1200 × 630). Its editable HTML/CSS source is `scripts/social-preview.html`; export it in a browser at the same viewport size. The small ribbon is retained as the brand signature.

After deployment, inspect the HTML returned by the public routes and confirm `/sitemap.xml` and the social image return their actual file types. Submit `https://anjolaaestheticsng.com/sitemap.xml` in the site's verified Google Search Console property. Submission and recrawling have not been performed by this code change, and search/social caches may retain older previews.

References: [Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [Vercel rewrites](https://vercel.com/docs/routing/rewrites), [OnlineStore schema](https://schema.org/OnlineStore).
