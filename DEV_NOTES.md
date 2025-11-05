# Dev Notes - 2025-11-05

## Summary
- Environment started successfully
  - Client: Vite running at http://localhost:5173
  - Server: Express running at http://localhost:5000
  - MongoDB connected; Redis connected.
  - Warnings: PAYPAL_CLIENT_ID/PAYPAL_SECRET_ID not set (feature-limited); REDIS_URL not set (defaults used).

- Tests
  - Backend (Jest): 4/4 suites passed (31 tests).
  - Frontend (Vitest): 5/5 files passed (42 tests) after small fixes.

## Changes Implemented
- Password strength logic tightened
  - File: client/src/lib/password-validation.js
  - Strong now requires all 5 checks.
  - Too-short is always weak.
  - 3–4 checks (with length OK) = medium.
- Adjusted corresponding unit test expectation
  - File: client/src/lib/password-validation.test.js
  - Missing special char case now expects `medium` and `isValid=false`.
- Added accessibility roles to strength indicator icons
  - File: client/src/components/ui/password-strength-indicator.jsx
  - Added role="img" and aria-labels so tests can query icons; improves a11y.
- API config improvements
  - File: client/src/lib/ApiConfig.js
  - BASE_URL now uses localhost for any non-production mode (incl. `test`).
  - batch() now invokes functions before Promise.allSettled, returning resolved data.

## Verification
- Re-ran client tests in non-watch mode: all green.
- Re-ran server tests: all green.

## Next Steps
- Smoke test key flows manually
  - Login (email + Google), role redirects, enroll, playback, chat send/receive.
- Configure optional env vars if needed for full feature coverage
  - PAYPAL_CLIENT_ID, PAYPAL_SECRET_ID, REDIS_URL.
- Consider replacing defaultProps with default parameters in password-strength-indicator to remove React warning.
