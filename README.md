# Malik Oil Expellers

React/Vite storefront, Firebase Authentication/Firestore and authenticated Vercel APIs.

## Verification

Use Node 22+ and Java 21+ for the Firebase emulators.

```sh
npm ci
npm run lint
npm test
npm run test:security
npm run test:browser
npm run build
```

Browser tests use installed Google Chrome and isolated fixtures. Security tests use the demo-malik-oil local project and never modify production.

`npm run dev` serves the UI. Use `npx vercel dev` with server environment variables to exercise API routes locally. Static dist-only hosting cannot accept orders.

## Release prerequisites

Deploy server/client/rules together. Do not publish the new client with missing server credentials or deploy the new rules while the old checkout is still live.

1. Enable Anonymous and Email/Password sign-in in Firebase Authentication.
2. Set FIREBASE_SERVICE_ACCOUNT_JSON in Vercel's server environment to a service account for malik-oil-expellers with appropriate Firestore and Firebase Auth access. Never commit credentials or use a VITE_ prefix for secrets. Set FIREBASE_DATABASE_ID=(default).
3. Grant the intended existing staff account the admin claim using scripts/set-admin.mjs in a trusted shell. Sign out/in afterward. Ordinary/anonymous users are never store admins.
4. Check products and settings/main documents. Prices and stock must be valid; delivery settings require standardShippingRate and freeShippingThreshold. All new orders have zero sales tax even if old settings contain a nonzero tax rate.
5. For App Check, register the production/preview domains with Firebase App Check and reCAPTCHA v3. Set VITE_FIREBASE_APP_CHECK_SITE_KEY (public site key) and FIREBASE_APP_CHECK_REQUIRED=true (server) together. An attestation is then required on checkout, tracking and order-management APIs. Do not turn on enforcement without configuring the browser provider.
6. Deploy a Vercel preview; verify catalog, staff access and controlled COD checkout. Deploy firestore.rules to the correct Firebase database and promote the matching Vercel release in one maintenance window. Verify the exact production commit and domain afterward.

## Behavior

- Checkout authenticates the caller, verifies current prices/discount minimums/delivery settings, and commits the order, stock reservation and customer summary atomically.
- Duplicate requests use the same saved order ID. Pending request details survive in session storage so uncertain network failures can be retried safely.
- Anonymous clients cannot write orders, payments, fulfillment status or inventory. Staff order mutations also go through the server so cancellation accounting cannot be bypassed through the UI.
- Cancelling a pending unpaid order returns stock once and reverses its customer totals. Cancelling a dispatched order reverses accounting but does not assume goods have returned; staff must explicitly confirm physical return before stock is added back. Paid orders require a recorded manual refund/unpaid state before cancellation. Delivered/cancelled orders cannot be reopened through arbitrary status changes.
- Completed/cancelled records can be archived. They are retained for audit and checkout replay protection rather than hard-deleted.
- Cross-device tracking requires invoice and delivery phone. Only status, dates, items and totals are returned, never customer name/address/email/phone or internal fields.
- Persistent limits apply per account and source address across anonymous accounts. App Check provides an additional layer when configured.
- COD is the enabled payment method. Easypaisa still requires an approved merchant integration and server-confirmed payment events; do not simulate a paid payment.

## Performance and content

Optimized source photos total about 0.60 MB versus 6.92 MB (91% smaller). Logo/favicon use a small WebP. Secondary screens/PDF/admin tools are loaded on demand; Firebase loads after the storefront's first render. Hashed assets receive immutable caching. Run scripts/optimize-images.py with Pillow to reproduce WebP assets.

The site uses configured contacts consistently, removes placeholder account/social links and verified-buyer claims, and includes delivery/returns/privacy help. Business-specific return commitments and product claims still require the owner's review; the text does not invent delivery/refund guarantees.
