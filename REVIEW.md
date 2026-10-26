# Release review

## Implemented

- Claim-based staff authorization, private customer/order reads and removal of public browser auto-seeding/private caches.
- Authenticated transactional checkout with current prices, stock, discount checks, idempotency and zero sales tax.
- Real save confirmation; retained cart and safe network retry; simulated card/bank instructions removed.
- Server-only payment/status changes, cancellation accounting, exactly-once stock return and archive/replay protection.
- Cross-device invoice-and-phone tracking returning a minimal summary.
- Persistent per-user/source rate limits and configurable required Firebase App Check.
- Awaited admin saves and error feedback instead of optimistic success; invoice HTML escaping.
- WebP conversion: 6,923,218 source-image bytes to 595,522 bytes (91.4% reduction); small favicon, lazy images/screens/PDF/admin tools and delayed Firebase bundle.
- Configured business contacts, working order-help navigation and removal of unverified review badges/placeholder links.

## Validation

The first full emulator run passed all 11 security/integration tests. Unit and Chrome browser suites passed. Two extra cases now cover required App Check and paid-order cancellation/discount minimums; see the delivery note for their completed results and the final build result.

## Deployment dependencies

The source is prepared for the existing malikoil Vercel project. Production must not be promoted until Vercel team authorization, Firebase administrative access, server credentials, sign-in providers, staff claims and matching rules are configured. App Check enforcement needs its public site key/domains configured first.

COD remains supported. The user selected COD plus Easypaisa; enabling Easypaisa requires approved merchant credentials, a supported provider contract and verified payment callbacks. No payment secrets belong in chat or the repository.

Existing historical orders and testimonials in the cloud are preserved. Staff must confirm actual physical returns; automatic cancellation is not a claim that a financial refund was sent. Business-specific policy/product claims require owner verification.
