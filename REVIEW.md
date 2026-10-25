# Store review

## Implemented

- Restrict catalog/settings/discount writes and customer data to custom-claim admins; restrict order reads to staff or the owner.
- Stop public downloads/browser caching of all customer/orders and clear legacy private caches.
- Add authenticated server checkout with transactional stock reservation, customer summaries, price/quantity validation, discount minimum checks and settings-based delivery/tax totals.
- Preserve request IDs across uncertain retries, prevent duplicate stock deductions, and show confirmation only after a saved server response.
- Remove simulated card payments and unverified fixed bank instructions; new orders are COD/Unpaid.
- Persist carts across refresh and reconcile them with current availability.
- Remove public auto-seeding, bundled example customers/orders, fallback testimonials and the public project ZIP.
- Remove hardcoded discount bypasses; deleted discounts no longer return from fallback data and are deleted from Firestore.
- Fix admin auth state after sign-out, review success on failed saves, review validation and incorrect verified-purchase labels.
- Escape values inserted into invoice HTML, use configured contact details in PDF invoices, and clean up temporary DOM nodes after PDF failures.
- Load admin charts/PDF tools on demand and add basic response security headers.

## Remaining work / owner input

1. **Live configuration:** Vercel server credentials, anonymous sign-in, staff custom claim and matching Firebase rules must be deployed. Code alone does not secure the production database.
2. **Payments:** connect a real provider with server-confirmed payment events. Verify actual bank details before restoring transfers.
3. **Abuse controls:** enable App Check and hosting rate limits. Per-user limits cannot prevent anonymous-account farming.
4. **Cancellation/refunds:** add a server-side operation that returns stock exactly once and adjusts customer summaries. Manual reconciliation is currently required.
5. **Cross-device tracking:** add customer accounts/OTP or a private recovery link. Current secure tracking uses the checkout browser identity; old unowned orders require support.
6. **Content:** verify contact/address consistency, delivery/return/privacy policies, product claims, and testimonials already saved in Firestore.
7. **Performance:** compress large photos to WebP/AVIF and check their visual quality. Admin/PDF code is now loaded on demand.
8. **Staff feedback:** some existing admin forms show optimistic save messages. Convert them to awaited cloud save states in a dedicated admin UX pass.

Tests cover total calculation, input validation, invoice escaping, access rules, concurrent orders, idempotent retries and browser checkout behavior. See the delivery note for checks actually run.

Validation so far: TypeScript check, production build, 5 unit tests and 3 Chrome browser tests passed. Production dependency audit reports zero vulnerabilities; 7 development-tool advisories remain. Initial JavaScript dropped from about 2.34 MB to 1.18 MB before compression.

Sales tax removal: all new checkout totals use tax=0 even when legacy cloud settings contain a nonzero rate. Existing saved orders are preserved.
