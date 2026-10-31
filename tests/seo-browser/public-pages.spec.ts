import { expect, test } from '@playwright/test';
// Vercel cleanUrls resolves /contact to /contact.html; Vite preview does not.
async function emulateCleanUrls(context: import('@playwright/test').BrowserContext, baseURL?: string) {
  if (process.env.SEO_BASE_URL) return;
  await context.route('http://127.0.0.1:4173/**', route => {
    const url = new URL(route.request().url());
    if (url.pathname !== '/' && !url.pathname.split('/').pop()!.includes('.')) url.pathname += '.html';
    return route.continue({url: url.href});
  });
}
test('product guide is readable without JavaScript and links to its live shop item', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  await emulateCleanUrls(context, baseURL);
  const page = await context.newPage();
  await page.goto(`${baseURL}/products/sarson-mustard-oil`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sarson (Mustard) Oil');
  await expect(page.getByRole('link', { name: 'Check current price and order' })).toHaveAttribute('href', '/?product=p2#products-section');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://malikoil.vercel.app/products/sarson-mustard-oil');
  await page.screenshot({ path: 'test-results/seo-mobile-guide.png', fullPage: true });
  await context.close();
});
test('contact and FAQ deep links retain their content on refresh', async ({ page, context, baseURL }) => {
  await emulateCleanUrls(context, baseURL);
  await page.goto('/contact', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Contact and directions');
  await expect(page.getByRole('link', { name: 'Get directions on Google Maps' })).toHaveAttribute('href', 'https://share.google/13Iq5xfgVYuq55w6Q');
  await page.getByRole('link', { name: 'FAQs', exact: true }).click();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ordering questions answered');
  await expect(page.getByText('Cash on delivery is the currently supported checkout method.', { exact: false })).toBeVisible();
});
