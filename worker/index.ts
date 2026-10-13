/** Cloudflare Worker: configure secrets in Cloudflare, never in the browser. */
interface Env {
  FIREBASE_PROJECT_ID: string;
  FIREBASE_CLIENT_EMAIL: string;
  FIREBASE_PRIVATE_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  STORE_ORIGIN: string;
}
const encoder = new TextEncoder();
const b64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
let tokenCache: { token: string; expires: number } | undefined;
async function accessToken(env: Env) {
  if (tokenCache && tokenCache.expires > Date.now() + 60000) return tokenCache.token;
  const now = Math.floor(Date.now() / 1000);
  const header = b64(encoder.encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
  const claims = b64(encoder.encode(JSON.stringify({ iss: env.FIREBASE_CLIENT_EMAIL, scope: 'https://www.googleapis.com/auth/datastore', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })));
  const pem = env.FIREBASE_PRIVATE_KEY.replaceAll('\\n', '\n').replace(/-----[^-]+-----/g, '').replace(/\s/g, '');
  const key = await crypto.subtle.importKey('pkcs8', Uint8Array.from(atob(pem), c => c.charCodeAt(0)), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const unsigned = `${header}.${claims}`;
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, encoder.encode(unsigned));
  const res = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${b64(new Uint8Array(signature))}` }) });
  if (!res.ok) throw new Error('Backend authentication unavailable');
  const data: any = await res.json();
  tokenCache = { token: data.access_token, expires: Date.now() + data.expires_in * 1000 };
  return tokenCache.token;
}
function encode(value: any): any {
  if (value === null) return { nullValue: null };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (typeof value === 'string') return { stringValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encode) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined).map(([k, v]) => [k, encode(v)])) } };
}
function decode(value: any): any {
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if (value.arrayValue) return (value.arrayValue.values || []).map(decode);
  return Object.fromEntries(Object.entries(value.mapValue?.fields || {}).map(([k, v]) => [k, decode(v)]));
}
export function validateOrder(input: any) {
  if (!input || typeof input !== 'object' || !/^ord-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(input.id)) throw new Error('Invalid order ID');
  for (const key of ['customerName', 'customerPhone', 'address', 'city', 'province']) {
    if (typeof input[key] !== 'string' || !input[key].trim() || input[key].length > 500) throw new Error(`Invalid ${key}`);
  }
  if (!/^(\+92|0)?[0-9\s-]{9,15}$/.test(input.customerPhone)) throw new Error('Invalid phone number');
  if (!['COD', 'JazzCash', 'Easypaisa', 'Bank Transfer', 'Raast'].includes(input.paymentMethod)) throw new Error('Unsupported payment method');
  if (!Array.isArray(input.items) || input.items.length < 1 || input.items.length > 20) throw new Error('Invalid cart');
  const ids = new Set();
  for (const item of input.items) {
    if (!/^[a-zA-Z0-9_-]{1,100}$/.test(item.productId) || ids.has(item.productId) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 1000) throw new Error('Invalid cart quantity');
    ids.add(item.productId);
  }
  if (input.customerEmail && (typeof input.customerEmail !== 'string' || input.customerEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.customerEmail))) throw new Error('Invalid email');
}
export function calculateOrder(input: any, products: any[], settings: any, discountCode?: any) {
  let subtotal = 0;
  const items = input.items.map((item: any, i: number) => {
    const product = products[i];
    if (!product || product.isActive === false || !Number.isFinite(product.stock) || product.stock < item.quantity || !Number.isFinite(product.price) || product.price < 0) throw new Error('Product unavailable or insufficient stock');
    subtotal += product.price * item.quantity;
    return { id: `${input.id}-${i}`, productId: item.productId, productName: product.name, unit: product.unit, quantity: item.quantity, priceAtPurchase: product.price };
  });
  let discount = 0;
  if (input.discountCode) {
    if (!discountCode?.isActive || discountCode.code !== input.discountCode || subtotal < (discountCode.minOrderAmount || 0)) throw new Error('Discount no longer available');
    if (!Number.isFinite(discountCode.value) || discountCode.value < 0 || !['percentage', 'flat'].includes(discountCode.type)) throw new Error('Invalid discount configuration');
    discount = Math.min(subtotal, discountCode.type === 'percentage' ? Math.round(subtotal * discountCode.value / 100) : discountCode.value);
  }
  // Actual shop tax/shipping configuration; never trust client totals or guessed provincial tax rates.
  const taxRate = Number(settings.taxRatePercent ?? 0);
  const shippingRate = Number(settings.standardShippingRate ?? 250);
  const threshold = Number(settings.freeShippingThreshold ?? 0);
  if (![taxRate, shippingRate, threshold].every(Number.isFinite) || taxRate < 0 || taxRate > 100 || shippingRate < 0 || threshold < 0) throw new Error('Invalid store pricing configuration');
  const tax = Math.round((subtotal - discount) * taxRate / 100);
  const shipping = threshold > 0 && subtotal >= threshold ? 0 : shippingRate;
  const total = Math.round((subtotal - discount + tax + shipping) * 100) / 100;
  if (!Number.isFinite(input.total) || Math.abs(total - input.total) > 0.01) throw new Error('Prices changed. Refresh your cart and confirm the updated total.');
  return { id: input.id, invoiceNo: `MEO-${input.id.slice(4).replaceAll('-', '').toUpperCase()}`, customerName: input.customerName.trim(), customerEmail: input.customerEmail?.trim() || '', customerPhone: input.customerPhone.trim(), address: input.address.trim(), city: input.city.trim(), province: input.province, orderDate: new Date().toISOString(), items, subtotal, discount, ...(input.discountCode ? { discountCode: input.discountCode } : {}), tax, shipping, total, paymentMethod: input.paymentMethod, paymentStatus: 'Unpaid', orderStatus: 'Pending' };
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const headers = { 'Access-Control-Allow-Origin': env.STORE_ORIGIN, 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Cache-Control': 'no-store', 'Vary': 'Origin' };
    const reply = (body: any, status = 200) => Response.json(body, { status, headers });
    if (request.headers.get('Origin') !== env.STORE_ORIGIN) return reply({ error: 'Origin not allowed' }, 403);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'POST') return reply({ error: 'Method not allowed' }, 405);
    const route = new URL(request.url).pathname;
    if (!['/orders', '/track'].includes(route)) return reply({ error: 'Not found' }, 404);
    if (Number(request.headers.get('Content-Length') || 0) > 20000) return reply({ error: 'Request too large' }, 413);
    let transaction: string | undefined;
    let api: ((path: string, body?: any) => Promise<any>) | undefined;
    try {
      const raw = await request.text();
      if (raw.length > 20000) return reply({ error: 'Request too large' }, 413);
      const payload = JSON.parse(raw);
      if (!env.TURNSTILE_SECRET_KEY || !env.FIREBASE_PRIVATE_KEY) return reply({ error: 'Secure checkout is not configured yet' }, 503);
      const challenge = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: String(payload.challenge || ''), remoteip: request.headers.get('CF-Connecting-IP') || '' }) });
      const challengeResult: any = await challenge.json();
      if (!challengeResult.success || challengeResult.hostname !== new URL(env.STORE_ORIGIN).hostname) return reply({ error: 'Security verification failed. Please retry.' }, 403);
      const token = await accessToken(env);
      const root = `projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents`;
      api = async (path, body) => {
        const result = await fetch(`https://firestore.googleapis.com/v1/${root}${path}`, { method: body ? 'POST' : 'GET', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
        const data: any = await result.json();
        if (!result.ok) throw new Error(data.error?.status || 'Database unavailable');
        return data;
      };
      if (route === '/track') {
        if (!/^MEO-[A-F0-9]{32}$/.test(payload.invoiceNo) || typeof payload.phone !== 'string') return reply({ error: 'Order not found' }, 404);
        const id = payload.invoiceNo.slice(4).toLowerCase().replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
        const doc = await api(`/orders/ord-${id}`);
        const order = decode({ mapValue: { fields: doc.fields } });
        const normalize = (phone: string) => phone.replace(/\D/g, '').replace(/^92/, '0');
        if (normalize(order.customerPhone) !== normalize(payload.phone)) return reply({ error: 'Order not found' }, 404);
        return reply({ order: { invoiceNo: order.invoiceNo, orderDate: order.orderDate, orderStatus: order.orderStatus, paymentStatus: order.paymentStatus } });
      }
      const input = payload.order;
      validateOrder(input);
      transaction = (await api(':beginTransaction', { options: { readWrite: {} } })).transaction;
      const normalizedPhone = input.customerPhone.replace(/\D/g, '').replace(/^92/, '0');
      const customerId = b64(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(normalizedPhone))));
      const customerPath = `${root}/customers/${customerId}`;
      const documents = [`${root}/orders/${input.id}`, `${root}/settings/main`, ...input.items.map((i: any) => `${root}/products/${i.productId}`)];
      documents.push(customerPath);
      // Discount catalog is public, but changes participate in the transaction through document reads.
      let discountId: string | undefined;
      if (input.discountCode) {
        const catalog = await api('/discountCodes');
        const match = (catalog.documents || []).find((doc: any) => decode({ mapValue: { fields: doc.fields } }).code === input.discountCode);
        if (!match) throw new Error('Discount no longer available');
        discountId = match.name;
        documents.push(discountId!);
      }
      const result = await api(':batchGet', { documents, transaction });
      const byName = new Map((Array.isArray(result) ? result : [result]).filter((d: any) => d.found).map((d: any) => [d.found.name, decode({ mapValue: { fields: d.found.fields } })]));
      const previous: any = byName.get(documents[0]);
      if (previous) {
        // A retry may only retrieve its own identical saved submission.
        const same = ['customerName', 'customerPhone', 'address', 'city', 'paymentMethod'].every(k => previous[k] === input[k].trim()) && previous.total === input.total && JSON.stringify(previous.items.map((i: any) => [i.productId, i.quantity])) === JSON.stringify(input.items.map((i: any) => [i.productId, i.quantity]));
        if (!same) throw new Error('Order ID already used');
        await api(':rollback', { transaction }); transaction = undefined;
        return reply({ order: previous });
      }
      const settings = byName.get(documents[1]);
      if (!settings) throw new Error('Store settings unavailable');
      const products: any[] = input.items.map((i: any) => byName.get(`${root}/products/${i.productId}`));
      const order = calculateOrder(input, products, settings, discountId ? byName.get(discountId) : undefined);
      const writes: any[] = [{ update: { name: documents[0], fields: encode(order).mapValue.fields }, currentDocument: { exists: false } }];
      input.items.forEach((item: any, i: number) => writes.push({ update: { name: `${root}/products/${item.productId}`, fields: { stock: encode(products[i].stock - item.quantity) } }, updateMask: { fieldPaths: ['stock'] }, currentDocument: { exists: true } }));
      const customer: any = byName.get(customerPath) || {};
      writes.push({ update: { name: customerPath, fields: encode({ id: customerId, name: order.customerName, email: order.customerEmail, phone: order.customerPhone, address: order.address, city: order.city, totalOrders: (customer.totalOrders || 0) + 1, totalSpent: (customer.totalSpent || 0) + order.total, lastOrderDate: order.orderDate }).mapValue.fields } });
      await api(':commit', { writes, transaction }); transaction = undefined;
      return reply({ order }, 201);
    } catch (error) {
      if (transaction && api) { try { await api(':rollback', { transaction }); } catch {} }
      const message = error instanceof Error ? error.message : '';
      const safe = /^(Invalid |Unsupported |Product unavailable|Discount no longer|Prices changed|Order ID already)/.test(message);
      return reply({ error: safe ? message : 'Request could not be confirmed. Please retry with the same order.' }, safe ? 400 : 503);
    }
  }
};
