// Shared helpers for the e2e suite. See docs/E2E.md for the test accounts
// these rely on and how to (re)create them.

const { expect } = require('@playwright/test');

const API_URL = process.env.E2E_API_URL || 'http://localhost:3010';

const USERS = {
  // Belongs to company id 2 ("Fondo Nacional de garantias" in the dev DB).
  company: { email: 'e2e_test@rptconsultants.local', password: 'E2ePassw0rd!', companyId: '2' },
  // No company_id — the "admin" case: any authenticated user can already see
  // every company's data (see docs/MIGRATION.md §3.4), so a null company_id
  // is the only client-side signal for "route to the company picker instead
  // of one company's goals" (see app/page.tsx).
  admin: { email: 'e2e_admin@rptconsultants.local', password: 'E2eAdminPw1!' },
};

/**
 * Log in through the real UI form — fills the form and submits, nothing
 * more. Deliberately does not wait for the outcome: a bad-credentials case
 * never gets a token, and callers that expect success already assert their
 * landing URL (which polls until the async login completes). Only a caller
 * with no such assertion needs `waitForAuthenticated` below.
 */
async function loginViaUi(page, { email, password }) {
  await page.goto('/');
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
}

/**
 * Wait for a session to actually land (`Authorization` written to
 * localStorage) after a successful `loginViaUi`. `handleLogin` in
 * app/page.tsx does an async fetch + localStorage.setItem + router.push, so
 * a test that navigates right after clicking submit — without first
 * asserting the landing URL — can race ahead of that finishing and hit a
 * protected page with no token yet. That's a real "no session" state and the
 * guard correctly redirects to login for it; it just isn't the thing under
 * test. Use this wherever the next step isn't already an assertion on the
 * post-login URL.
 */
async function waitForAuthenticated(page) {
  await page.waitForFunction(() => localStorage.getItem('Authorization') !== null);
}

/**
 * Obtain a real token from the API directly (bypasses the UI) and seed it
 * into localStorage the way app/page.tsx does, then load `path`. Used by
 * tests that care about *route-guard* behavior given an existing session,
 * not about the login form itself.
 */
async function seedSessionAndGoto(page, { email, password }, path) {
  const res = await page.request.post(`${API_URL}/auth/sign_in`, {
    data: { user: { email, password } },
  });
  const token = res.headers()['authorization'];
  if (!token) {
    throw new Error(`Login for ${email} did not return an Authorization header (status ${res.status()})`);
  }

  // Storage is per-origin, so an empty same-origin page has to load first.
  await page.goto('/');
  await page.evaluate((t) => localStorage.setItem('Authorization', t), token);
  await page.goto(path);
  return token;
}

/**
 * Assert the page is (still) on `pathRegex` — and stays there.
 *
 * `expect(page).toHaveURL(...)` right after a `goto()`/`reload()` is not
 * enough to catch the layout.js redirect bug this suite guards against: the
 * URL already matches the instant navigation lands, and the guard's
 * `useEffect` (which is what fires the bad `router.push('/')`) hasn't run
 * yet — so a same-tick assertion passes regardless of whether the redirect
 * is about to happen.
 *
 * Waits until no navigation has occurred for `settleMs`, capped at
 * `maxWaitMs` — rather than a single fixed sleep — because the Next.js dev
 * server (Turbopack) compiles each route on first request: an on-demand
 * compile can push a redirect's navigation event out further than a fixed
 * short wait would cover, which showed up as an intermittent false pass
 * (and, if the wait is too short for the assert itself, an intermittent
 * false failure) on a cold route.
 */
async function expectStillOn(page, pathRegex, { settleMs = 1200, maxWaitMs = 8000 } = {}) {
  const start = Date.now();
  let lastNav = Date.now();
  const onNav = () => { lastNav = Date.now(); };
  page.on('framenavigated', onNav);
  try {
    while (Date.now() - start < maxWaitMs && Date.now() - lastNav < settleMs) {
      await page.waitForTimeout(100);
    }
  } finally {
    page.off('framenavigated', onNav);
  }
  await expect(page).toHaveURL(pathRegex);
}

module.exports = { API_URL, USERS, loginViaUi, waitForAuthenticated, seedSessionAndGoto, expectStillOn };
