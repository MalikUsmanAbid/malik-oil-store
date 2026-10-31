import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { publicPaths, SITE_URL } from '../src/data/seo';
import { readdir } from 'node:fs/promises';

const titles = new Set<string>();
for (const path of [...publicPaths, '/track', '/404']) {
  const html = await readFile(path === '/' ? 'dist/index.html' : `dist${path}.html`, 'utf8');
  const title = html.match(/<title>(.*?)<\/title>/)?.[1];
  assert(title && !titles.has(title), `Unique title required: ${path}`); titles.add(title);
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
  assert(html.includes(`href="${SITE_URL}${path}"`));
  assert(html.includes('Tandila Road'), `Readable content required: ${path}`);
  assert.equal((html.match(/<h1[ >]/g)||[]).length, 1, `One main heading required: ${path}`);
  assert(html.includes('rel="stylesheet"'), `Stylesheet required: ${path}`);
  if (publicPaths.includes(path)) {
    assert(html.includes('index,follow'));
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)![1]);
    assert(schema['@graph'].some((node: any) => node['@type'] === 'Store'));
  } else assert(html.includes('noindex,follow'));
  if (path !== '/' && path !== '/track') assert(!html.includes('type="module"'), `Static page should not load storefront JS: ${path}`);
  for (const match of html.matchAll(/href="(\/[^"?#]*)(?:[?#][^"]*)?"/g)) {
    const href = match[1];
    if (href.startsWith('/assets/') || href.startsWith('/images/')) await access(`dist${href}`);
    else assert(publicPaths.includes(href) || href === '/track', `Broken internal link ${href} on ${path}`);
  }
}
const sitemap = await readFile('dist/sitemap.xml','utf8');
assert.equal((sitemap.match(/<loc>/g)||[]).length, publicPaths.length);
assert(!sitemap.includes('/track'));
const robots = await readFile('dist/robots.txt','utf8');
assert(robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`));
assert(!robots.includes('Disallow: /\n'));
const cssFiles = (await readdir('dist/assets')).filter(file => file.endsWith('.css'));
for (const file of cssFiles) assert(!(await readFile(`dist/assets/${file}`, 'utf8')).includes('fonts.googleapis.com'), 'Fonts must not require an external stylesheet');
await access('dist/fonts/inter-latin-v20.woff2');
await access('dist/fonts/cinzel-latin-v26.woff2');
console.log(`${titles.size} HTML pages verified: unique metadata, canonicals, schema, internal links, CSS, crawler access and sitemap.`);
