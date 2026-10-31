# Release review

## Follow-up — 2026-10-31

Node.js is pinned to the locally verified 24.x major. The previous open-ended >=22 range selected Node 26 in Vercel build logs and produced unsupported-engine warnings for the Firebase toolchain. Patch/security updates within Node 24 remain platform-managed.

The official Firebase App Check API showed Authentication still UNENFORCED despite the earlier owner-reported console change. Authentication was changed to ENFORCED through the official API; Firestore remained ENFORCED. After propagation, the client SDK's anonymous login without App Check was rejected with `auth/firebase-app-check-token-is-invalid.`. The owner confirmed a fresh staff dashboard login after the actual enforcement change. No paid upgrade, replay-protection change or debug bypass was used. Earlier Monitoring references below describe the original rollout stage.

SEO/GEO/AEO research and implementation details are in [SEO_REVIEW.md](SEO_REVIEW.md). Public content now has static HTML, clean URLs, crawlable navigation, product guides, direct answers, accurate owner-supplied address/Maps details, canonical/social metadata, structured data, a sitemap and robots.txt. Static information pages require no storefront JavaScript. Search Console submission, indexing, rankings and real-user speed gains are not claimed as completed or measured.

## Implemented

- Claim-based staff authorization, private customer/order reads and removal of public browser auto-seeding/private caches.
- Authenticated transactional checkout with current prices, stock, discount checks, idempotency and zero sales tax.
- Real save confirmation; retained cart and safe network retry; simulated card/bank instructions removed.
- Server-only payment/status changes, cancellation accounting, exactly-once stock return and archive/replay protection.
- Cross-device invoice-and-phone tracking returning a minimal summary.
- Server-validated review creation, bounded fields and review submission limits.
- Persistent per-user/source rate limits and configurable required Firebase App Check.
- Awaited admin saves and error feedback instead of optimistic success; invoice HTML escaping.
- WebP conversion: 6,923,218 source-image bytes to 595,522 bytes (91.4% reduction); small favicon, lazy images/screens/PDF/admin tools and delayed Firebase bundle.
- Configured business contacts, working order-help navigation and removal of unverified review badges/placeholder links.

## Validation

On 2026-10-26: TypeScript passed; all 14 security/integration tests, 5 unit tests and 3 Chrome browser tests passed. The production build passed. The fresh production dependency audit reported zero vulnerabilities. Expected permission-denied emulator logs are negative access-control assertions.

Initial JavaScript is about 447 KB (133 KB gzip), compared with 1.18 MB before the final loading changes. Photos are 91.4% smaller. These are payload measurements, not a claim of measured production page-load time.

## Production release

On 2026-10-26, PR #2 was merged at f842007 and deployed to https://malikoil.vercel.app. Vercel server secrets, Firebase Anonymous/Email-Password providers and the existing owner's admin claim were configured. Matching Firestore rules and indexes were released to malik-oil-expellers.

Both preview and production API checks verified tax=0, current-price validation, retry idempotency, private tracking, staff authorization and exactly-once stock return. A 390px Chrome browser completed the actual production checkout with no page errors. Synthetic verification orders were cancelled and archived and their inventory restored. The Firebase Admin/jwks-rsa startup incompatibility on Vercel was fixed with a scoped jose 5 override; server modules also load with native require(esm) support disabled. Production dependency audit remains at zero vulnerabilities.

On 2026-10-27, the production web app was registered with reCAPTCHA Enterprise (Fraud Defense), with domain verification enabled for malikoil.vercel.app. PR #3 adds the Enterprise client provider. Vercel production has the public site key and FIREBASE_APP_CHECK_REQUIRED=true. Authenticated requests without App Check were rejected by all four application APIs; a genuine browser successfully tracked an order and completed a zero-tax COD checkout after enforcement. Cloud Firestore App Check is configured as Enforced. Authentication remains in Monitoring for a separate staged rollout. No paid billing was activated; the project remains on Spark.

Persistent UID/source request limits remain active. This release is not a claim that all possible security issues have been eliminated.

The live Firestore negative check also denied an unauthenticated catalog read without App Check (the catalog's security rules otherwise allow public reads), confirming that service-level attestation enforcement is active.

Live Firestore checks confirmed that the catalog is publicly readable, customer/order collection reads are denied to public visitors, and anonymous price changes are denied. The deployed application's error/fatal log query returned no records during the release checks.

COD remains supported. The user selected COD plus Easypaisa; enabling Easypaisa requires approved merchant credentials, a supported provider contract and verified payment callbacks. No payment secrets belong in chat or the repository.

Existing historical orders and testimonials in the cloud are preserved. Staff must confirm actual physical returns; automatic cancellation is not a claim that a financial refund was sent. Business-specific policy/product claims require owner verification.
