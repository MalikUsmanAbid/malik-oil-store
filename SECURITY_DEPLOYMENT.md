# Security rollout (not yet deployed)

The branch must not replace production until backend secrets, admin access and challenge settings are configured. The previous code's public rules must be replaced in Firebase Console/CLI; committing rules does not deploy them.

## Free-tier deployment

Use Firebase Spark Hosting + Firestore and a Cloudflare Workers Free backend, within included quotas. Vercel Hobby is limited to personal non-commercial use; it is not the intended free host for this commercial shop. No billing upgrade is required by this implementation. Quota exhaustion can stop orders; do not describe free tiers as unlimited.

1. Back up production data using an authorized export method. Do not run browser migration/seeding.
2. In Firebase Authentication find the existing admin UID. In Firestore Console create `admins/<UID>` (for example `{ enabled: true }`). Never allow clients to create this document. Remove unwanted admin documents to revoke access.
3. Create a least-privilege backend service account with Firestore data access. In Cloudflare Worker secrets set `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, and `TURNSTILE_SECRET_KEY`. Never commit or send the private key in chat.
4. Create a Cloudflare Turnstile widget for the actual hosting domain. Set `STORE_ORIGIN` and `FIREBASE_PROJECT_ID` in `worker/wrangler.jsonc`; deploy using `npx wrangler deploy --config worker/wrangler.jsonc` after sign-in.
5. Build with public `VITE_ORDER_API_URL` and `VITE_TURNSTILE_SITE_KEY` values. Deploy frontend to Firebase Hosting. Add that domain to Firebase Auth authorized domains. Deploy rules alongside the coordinated rollout using Firebase CLI (`npx firebase-tools deploy --only hosting,firestore:rules`). Verify admin reads and writes before switching traffic.
6. Confirm shop settings: actual `taxRatePercent`, `standardShippingRate`, `freeShippingThreshold`, business phone/address and transfer receiving details. Current tax figures are legacy configuration, not verified legal tax guidance. No bank details are invented. Manual transfer instructions currently say to contact the shop; payment remains Unpaid until admin verification.
7. On staging test two simultaneous purchases of the last item, duplicate retry using the same order ID, lost responses, denied writes, unauthorized admin access, privacy of tracking, and CAPTCHA failure/expiry. Run Firestore Rules emulator tests before production deployment. Tests in `tests/order.test.ts` cover pricing/validation and HTTP guards; they are not a substitute for deployed transaction/emulator checks.

## Known scope limits

Tracking accepts new 32-character invoice tokens and order phone number. Legacy short invoice numbers require manual shop support; no public legacy order collection is downloaded. Deleted orders are intentionally blocked to preserve the ledger. Cancellation currently changes status only and does not automatically return stock or reverse customer totals. Implement an idempotent authorized cancellation endpoint before enabling automatic returns. Pending unpaid orders reserve stock; define an expiry/confirmation policy with the owner before adding automated releases. Backend challenges reduce abuse but are not a replacement for quota monitoring.

The worker uses a Firestore REST transaction for order + stock + customer aggregates. Conflict responses fail closed; retry uses the same order ID and avoids a second decrement. Browser prices/statuses never authorize payment. Customer records and order documents are admin-only. Service-account credentials bypass rules and must remain solely on the Worker.
