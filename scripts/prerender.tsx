import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import PublicContent from '../src/components/PublicContent';
import { SITE_URL, pageForPath, publicPaths, structuredData } from '../src/data/seo';

const template = (await readFile('dist/index.html', 'utf8'))
  .replace(/<!-- seo:start -->[\s\S]*?<!-- seo:end -->/g, '')
  .replace(/<!-- content:start -->[\s\S]*?<!-- content:end -->/g, '');
const escape = (text: string) => text.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
for (const path of [...publicPaths, '/track', '/404']) {
  const page = pageForPath(path);
  const url = SITE_URL + (path === '/' ? '/' : path);
  const metadata = `<title>${escape(page.title)}</title>
<meta name="description" content="${escape(page.description)}" />
<meta name="robots" content="${page.index ? 'index,follow,max-image-preview:large' : 'noindex,follow'}" />
<link rel="canonical" href="${url}" />
<meta property="og:type" content="website" /><meta property="og:locale" content="en_PK" />
<meta property="og:site_name" content="Malik Oil Expellers" /><meta property="og:url" content="${url}" />
<meta property="og:title" content="${escape(page.title)}" /><meta property="og:description" content="${escape(page.description)}" />
<meta property="og:image" content="${SITE_URL}/images/malik-oil-logo.webp" />
<meta name="twitter:card" content="summary" /><meta name="twitter:title" content="${escape(page.title)}" />
<meta name="twitter:description" content="${escape(page.description)}" /><meta name="twitter:image" content="${SITE_URL}/images/malik-oil-logo.webp" />
${page.index ? `<script type="application/ld+json">${JSON.stringify(structuredData(path)).replace(/</g, '\\u003c')}</script>` : ''}`;
  let html = template.replace(/<title>[\s\S]*?<\/title>/, '').replace(/\s*<meta (?:name="description"|property="og:[^"]+")[^>]*>/g, '')
    .replace('</head>', `<!-- seo:start -->${metadata}<!-- seo:end --></head>`).replace('<div id="root"></div>', `<div id="root"><!-- content:start --><main>${renderToStaticMarkup(<PublicContent path={path} />)}</main><!-- content:end --></div>`);
  // Information pages need no Firebase, animation or storefront JavaScript.
  if (path !== '/' && path !== '/track') html = html.replace(/<script type="module"[^>]*>[\s\S]*?<\/script>/g, '').replace(/<link rel="modulepreload"[^>]*>/g, '');
  const file = path === '/' ? 'dist/index.html' : `dist${path}.html`;
  await mkdir(file.slice(0, file.lastIndexOf('/')), { recursive: true });
  await writeFile(file, html);
}
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${publicPaths.map(path => `<url><loc>${SITE_URL}${path}</loc></url>`).join('')}</urlset>\n`);
await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
console.log(`Prerendered ${publicPaths.length} indexable pages, tracking and 404; sitemap and robots.txt generated.`);
