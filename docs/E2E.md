# End-to-end auth tests

`e2e/auth.spec.js` is a regression suite for the "redirected to login too
often" bug. Diagnosis:

- Token lifetime is **1 day** (`config/initializers/devise.rb` in the Rails
  backend) — confirmed by decoding a real issued JWT's `iat`/`exp`. Expiry was
  never the cause.
- The actual bug was in `src/app/layout.js`'s `ValidateAuth`: it looked for
  `access-token` / `client` / `uid` localStorage keys and called
  `GET /auth/validate_token`. Login only ever wrote a single `Authorization`
  key (`src/app/page.tsx`), and the backend never routed
  `/auth/validate_token` (Devise only defines `sign_in`/`sign_out` under
  `path: 'auth'` — confirmed, it 404s). So on **every** direct navigation or
  refresh to a non-`/` route, the guard found nothing it recognized, cleared
  storage, and pushed back to `/` — regardless of whether the real session was
  still perfectly valid.

The fix reads the actual `Authorization` value and checks its JWT `exp`
claim client-side (`src/lib/jwt.js`) instead of calling a dead endpoint.

## Running the suite

Needs both the backend and frontend already running:

```bash
docker compose up          # rpt_backend, http://localhost:3010
npm run dev                # rpt_frontend, http://localhost:3000 (nvm use 22)

npm run test:e2e           # headless
npm run test:e2e:ui        # Playwright's interactive UI mode
```

`playwright.config.js` points at `http://localhost:3000` by default
(`E2E_BASE_URL` to override); the API base is `http://localhost:3010`
(`E2E_API_URL` to override). It does **not** start its own servers.

## Test accounts

Two dedicated users live in the **local dev** database only (the
`docker-compose.yml` Postgres, not staging/production). Created via the Rails
console:

```bash
docker compose exec -T web bundle exec rails runner '
  u = User.find_or_initialize_by(email: "e2e_test@rptconsultants.local")
  u.uid = "e2e_test@rptconsultants.local"
  u.name = "E2E Test"
  u.company_id = 2   # any existing company id in your dev DB
  u.password = u.password_confirmation = "E2ePassw0rd!"
  u.save!
'

docker compose exec -T web bundle exec rails runner '
  u = User.find_or_initialize_by(email: "e2e_admin@rptconsultants.local")
  u.uid = "e2e_admin@rptconsultants.local"
  u.name = "E2E Admin"
  u.company_id = nil
  u.password = u.password_confirmation = "E2eAdminPw1!"
  u.save!
'
```

If your local dev DB doesn't have a company with id `2`, update
`companyId` in `e2e/helpers.js` to match one that exists
(`Company.pluck(:id, :name)` in the Rails console).

These are throwaway dev-only fixtures — never point `E2E_BASE_URL`/
`E2E_API_URL` at staging or production.

## What's covered

- Login routes a company user to `/companies/:id/goals`, and a company-less
  user to `/companies` (the picker) instead of a dead-end error toast.
- Bad credentials show an error and don't navigate.
- **The regression itself**: a hard refresh, a fresh deep link, and normal
  navigation across five company pages all stay put instead of bouncing to
  `/`.
- A garbage token, an expired token, and no token at all all correctly
  redirect to `/`.
- Logout clears the session and a subsequent visit to a protected route
  redirects back to login.

## A note on the "stay on this page" assertions

`expect(page).toHaveURL(...)` checked immediately after a `goto()`/`reload()`
does **not** catch this bug — the URL already matches the instant the
navigation lands, before the guard's `useEffect` has run. Confirmed by hand:
against the pre-fix code, three of these tests passed on a same-tick
assertion and only failed once `expectStillOn()` (in `e2e/helpers.js`) waited
~1s for the effect to settle before asserting. Keep using `expectStillOn` for
any new "should stay here" assertion rather than a bare `toHaveURL` right
after navigating.
