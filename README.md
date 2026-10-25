# Malik Oil Expellers Online Store

React/Vite storefront with Firebase Authentication, Firestore and a Vercel checkout API. Use Node.js 22 or newer.

```sh
npm ci
npm run dev
npm run lint
npm test
npm run build
npm run test:security
npm run test:browser
```

`npm run dev` serves the UI. Use `npx vercel dev` with server environment variables to exercise checkout locally. Static `dist` hosting alone cannot accept orders. Security tests use local Auth/Firestore emulators with a `demo-` project and require Java 21+. Browser tests use installed Google Chrome and an isolated checkout fixture, never production orders.

## Release configuration

The server, client, admin claim and rules form one release. Rules alone break old checkout; UI alone leaves the old database permissions open.

1. Enable **Anonymous** and **Email/Password** in Firebase Authentication. Create the intended staff account in Firebase Console.
2. Add `FIREBASE_SERVICE_ACCOUNT_JSON` to Vercel's server environment with a service-account credential for the existing `malik-oil-expellers` project. Set `FIREBASE_DATABASE_ID=(default)`. Never commit the credential or prefix it with `VITE_`.
3. In a trusted shell with that same credential, run `node scripts/set-admin.mjs YOUR_STAFF_EMAIL`. Sign out/in afterward. Normal and anonymous accounts cannot administer the store.
4. Verify existing `products` and `settings/main` documents. Products require nonnegative numeric prices and integer stock. Settings require `standardShippingRate` and `freeShippingThreshold`. Sales tax is disabled for all new orders, including stores with older nonzero tax settings. There is no public automatic seed/migration.
5. Deploy the branch to Vercel preview with its server environment. In the same maintenance window, deploy `firestore.rules` using Firebase Console or `npx firebase deploy --only firestore --project malik-oil-expellers`, then release the matching Vercel deployment. Confirm catalog access, staff login and a controlled COD order. Coordinate this switch because the old client is incompatible with secure rules.

Checkout verifies the Firebase identity and current prices/settings/discounts. One transaction creates the order, reserves stock, updates the customer summary and applies per-user order limits. An identical request ID returns the saved order without decrementing stock again. Uncertain requests persist in session storage for safe retry.

Only **Cash on Delivery** is enabled. A real payment gateway and server-confirmed webhooks are required before enabling card payments. Verify bank details before restoring transfers.

## Privacy and limitations

- Staff access requires an `admin: true` custom claim. Customers can read only orders belonging to their Firebase identity. Public visits never download all orders/customers.
- Tracking requires the same browser identity as checkout. Old orders without `ownerUid`, another device, cleared storage, or an admin sign-in replacing the anonymous session require store support. Do not restore public order downloads.
- Old order/customer caches are cleared. Cart products persist locally. Pending checkout details remain in session storage until success or definite rejection.
- Existing cloud sample records/testimonials are preserved for owner review. New visitor sessions no longer seed sample customer/orders or fallback reviews.
- Per-account limits do not prevent creation of many anonymous accounts. Configure App Check and hosting rate limits before substantial traffic.
- Cancellation/deletion does not automatically return stock or reverse customer spending summaries; reconcile manually until a server workflow is added.
- Large photos, contact consistency, delivery/return/privacy policies and product claims need further review. See `REVIEW.md`.
