# Release review

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

## Deployment dependencies

The source is prepared for the existing malikoil Vercel project. Production must not be promoted until Vercel team authorization, Firebase administrative access, server credentials, sign-in providers, staff claims and matching rules are configured. App Check enforcement needs its public site key/domains configured first.

COD remains supported. The user selected COD plus Easypaisa; enabling Easypaisa requires approved merchant credentials, a supported provider contract and verified payment callbacks. No payment secrets belong in chat or the repository.

Existing historical orders and testimonials in the cloud are preserved. Staff must confirm actual physical returns; automatic cancellation is not a claim that a financial refund was sent. Business-specific policy/product claims require owner verification.
