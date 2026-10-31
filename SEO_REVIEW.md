# Search visibility review — 2026-10-31

## Findings and implementation

The previous site used state-only navigation, an empty initial HTML app root, a single title/description and a catch-all 200 response. It had no sitemap or robots file. Those conditions limited discovery and made non-JavaScript crawlers depend on an app they could not render.

The build now generates 12 indexable HTML pages: home, product index, six product guides, about, contact, FAQs and delivery/privacy. Each contains readable content, crawlable links, a unique title/description, canonical URL, absolute social metadata and matching Store/WebSite/WebPage structured data. Secondary pages have breadcrumbs. Product guides link to the corresponding live-shop item. Current prices and inventory remain in the transactional shop; static guides deliberately do not publish stale offers or fabricated ratings. FAQs answer actual ordering, COD, delivery, tax, tracking and return questions. No claim is made that FAQ rich results will appear.

Information pages ship no storefront JavaScript and do not require Firebase or reCAPTCHA to read. The shop and private tracking keep their interactive functionality and App Check. Vercel serves real static paths, redirects HTML extensions through cleanUrls, and returns a real 404 for unknown paths instead of the old homepage fallback. Tracking and 404 are noindex. The sitemap lists only public indexable pages; robots allows public crawlers, including search/AI crawlers, while excluding application API paths. Robots rules do not replace API authorization.

The owner supplied the Tandila Road, Samundri, Faisalabad address and Maps link https://share.google/13Iq5xfgVYuq55w6Q. The link could not be expanded by the research tool, so no coordinates, ratings or profile details were inferred. The existing public phone/WhatsApp are retained. Opening hours and delivery coverage still need owner confirmation; fixed, unconfirmed footer hours were removed.

## Research and approach

The render-blocking external Google Fonts CSS import was removed. Inter and Cinzel variable WOFF2 fonts are served locally with swap rendering, their original OFL licenses and versioned immutable caching. This preserves the typefaces while removing the external font stylesheet dependency; no measured production speed or Core Web Vitals score is inferred from that change.

- [Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics): readable initial HTML, unique metadata, canonical URLs and ordinary href links.
- [Google AI features](https://developers.google.com/search/docs/appearance/ai-features): SEO fundamentals apply; no special AI schema or AI text file is required, and inclusion is not guaranteed.
- [Google ecommerce navigation](https://developers.google.com/search/docs/specialty/ecommerce/help-google-understand-your-ecommerce-site-structure): link directly from categories to products.
- [Google structured data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies): markup must reflect visible, accurate content.
- [Google local ranking guidance](https://support.google.com/business/answer/7091): accurate profile details, relevance, distance and prominence matter. Website edits cannot guarantee a local ranking.
- [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots): search crawling is governed by crawler access; crawl permission does not guarantee inclusion or citation.

Initial brand/local web queries did not establish a reliable indexed result for this exact store. This is a limited research observation, not proof that Google has never indexed it, and no search-volume numbers or keyword-rank claims are invented. Pages focus on real product names and local intent: Malik Oil Expellers Samundri, sarson oil / sarson ka tel, til/sesame oil, canola oil, taramira oil, sarson khall and wanda feed. Urdu product names are visible alongside English; the pages are not represented as full Urdu translations.

## External work still requiring owner/account access

1. Verify the existing Maps/Google Business Profile, add the website URL and confirm the real public phone, hours, category and delivery coverage. Publish genuine storefront/product photos and respond to genuine customer reviews. Do not create duplicate profiles or buy reviews/links.
2. Verify https://malikoil.vercel.app/ as a URL-prefix property in Google Search Console, submit https://malikoil.vercel.app/sitemap.xml, and inspect home/product URLs. Bing Webmaster Tools can receive the same sitemap. These submissions have not been claimed as completed.
3. If a custom domain is selected, connect it first, then update SITE_URL, canonicals, sitemap, Google/AI crawl access, redirects and the reCAPTCHA domain allowlist together. No domain purchase is authorized by this review.
4. Measure indexed pages, search impressions/clicks and real-user performance after release. No rank, traffic or Core Web Vitals improvement is claimed before measurements exist.

Easypaisa remains unavailable until an approved Online Payment Gateway merchant account and provider integration details exist. A personal wallet is not a verified checkout integration; COD remains supported.
