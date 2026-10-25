import { expect, test, type Page } from '@playwright/test';

async function delivery(page: Page, mode: string) {
  await page.goto('/tests/cart.html' + mode, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'PROCEED TO DETAILS' }).click();
  await page.getByPlaceholder('e.g. Muhammad Usman').fill('Test Buyer');
  await page.locator('input[type="tel"]').fill('03001234567');
  await page.getByPlaceholder('e.g. Samundri', { exact: true }).fill('Samundri');
  await page.locator('textarea').fill('Test House, Street 123');
  await page.getByRole('button', { name: 'PROCEED TO PAYMENT' }).click();
}
test('failed save keeps checkout open and never shows confirmation', async ({ page }) => {
  await delivery(page, '?fail');
  await page.getByRole('button', { name: /PLACE ORDER/ }).click();
  await expect(page.getByRole('alert')).toContainText('Order could not be saved');
  await expect(page.getByText('Your Order is Placed Successfully')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /PLACE ORDER/ })).toBeEnabled();
  await expect(page.getByText('💳 Card', { exact: true })).toHaveCount(0);
});
test('double click submits once, then displays only saved server invoice', async ({ page }) => {
  await delivery(page, '');
  const button = page.getByRole('button', { name: /PLACE ORDER/ });
  await button.evaluate(element => { (element as HTMLButtonElement).click(); (element as HTMLButtonElement).click(); });
  await expect(page.getByText('Your Order is Placed Successfully')).toBeVisible();
  await expect(page.getByTestId('calls')).toHaveText('1');
  await expect(page.getByText('MEO-CONFIRMED').first()).toBeVisible();
  await expect(page.getByText('Amount Due on Delivery:')).toBeVisible();
  await page.screenshot({ path: 'test-results/mobile-checkout.png', fullPage: true });
});

test('app restores the cart after refresh and removes legacy private caches', async ({ page }) => {
  await page.route('**/src/services/dbService.ts', async route => route.fulfill({ contentType: 'application/javascript', body: `
    import { INITIAL_PRODUCTS, DEFAULT_STORE_SETTINGS } from '/src/data/initialData.ts';
    export function subscribeToProducts(cb) { cb(INITIAL_PRODUCTS); return () => {}; }
    export function subscribeToSettings(cb) { cb(DEFAULT_STORE_SETTINGS); return () => {}; }
    export function subscribeToDiscountCodes(cb) { cb([]); return () => {}; }
    export function subscribeToReviews(cb) { cb([]); return () => {}; }
    export function subscribeToAuth(cb) { cb(null); return () => {}; }
    export function subscribeToOrders() { throw new Error('Private orders must not be subscribed to on public visits'); }
    export function subscribeToCustomers() { throw new Error('Private customers must not be subscribed to on public visits'); }
    export const addProduct = async () => {}, updateProduct = addProduct, deleteProduct = addProduct,
      updateProductStock = addProduct, updateProductPrice = addProduct, placeOrder = addProduct,
      updateOrderStatus = addProduct, updatePaymentStatus = addProduct, deleteOrder = addProduct,
      saveStoreSettings = addProduct, saveDiscountCode = addProduct, deleteDiscountCode = addProduct,
      saveReview = addProduct, trackOrder = addProduct;
  ` }));
  await page.addInitScript(() => {
    if (sessionStorage.getItem('fixture-initialized')) return;
    sessionStorage.setItem('fixture-initialized', '1');
    localStorage.setItem('malik_oil_cart', JSON.stringify([{ product: { id: 'p1', name: 'Canola Oil', price: 650, stock: 120, category: 'Pure Oil' }, quantity: 2 }]));
    localStorage.setItem('malik_oil_orders', JSON.stringify([{ customerName: 'Private old order' }]));
    localStorage.setItem('malik_oil_customers', JSON.stringify([{ name: 'Private old customer' }]));
  });
  await page.goto('/tests/app.html', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Open cart', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Canola Oil');
  await expect(page.getByRole('dialog').getByText('2', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('malik_oil_orders'))).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem('malik_oil_customers'))).toBeNull();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Open cart', exact: true }).click();
  await expect(page.getByRole('dialog').getByText('2', { exact: true })).toBeVisible();
});
