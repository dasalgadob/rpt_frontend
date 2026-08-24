// Regression coverage for the "redirected to login too often" bug.
//
// Root cause (see src/app/layout.js history / docs/E2E.md): the route guard
// checked for `access-token`/`client`/`uid` localStorage keys that login
// never wrote (it only ever wrote `Authorization`), and it validated them
// against `/auth/validate_token`, which the backend doesn't route (404). So
// *any* direct navigation or refresh to a non-home page was bounced back to
// login even with a perfectly valid, unexpired session — token expiry (1 day,
// see config/initializers/devise.rb) was never the issue.
//
// These tests hit the real backend (docker-compose) and the real dev
// frontend (npm run dev) — see docs/E2E.md for the two required test users.

const { test, expect } = require('@playwright/test');
const { USERS, loginViaUi, waitForAuthenticated, seedSessionAndGoto, expectStillOn } = require('./helpers');

test.describe('login', () => {
  test('a company user is routed to their company goals page', async ({ page }) => {
    await loginViaUi(page, USERS.company);

    await expect(page).toHaveURL(new RegExp(`/companies/${USERS.company.companyId}/goals$`));
    const token = await page.evaluate(() => localStorage.getItem('Authorization'));
    expect(token).toMatch(/^Bearer /);
  });

  test('a user with no company_id is routed to the company picker, not an error', async ({ page }) => {
    await loginViaUi(page, USERS.admin);

    await expect(page).toHaveURL(/\/companies$/);
  });

  test('bad credentials show an error and do not navigate', async ({ page }) => {
    await loginViaUi(page, { email: USERS.company.email, password: 'wrong-password' });

    await expect(page).toHaveURL('/');
    await expect(page.getByText('Error de credenciales intentando autenticar')).toBeVisible();
  });
});

test.describe('session persistence across navigation (regression)', () => {
  test('a hard refresh on a deep company page keeps the session', async ({ page }) => {
    await loginViaUi(page, USERS.company);
    await expect(page).toHaveURL(new RegExp(`/companies/${USERS.company.companyId}/goals$`));

    const deepPath = `/companies/${USERS.company.companyId}/departments`;
    await page.goto(deepPath);
    await page.reload();

    // The bug: this reload used to bounce straight back to '/'.
    await expectStillOn(page, new RegExp(`${deepPath}$`));
    await expect(page.getByLabel('Correo electrónico')).not.toBeVisible();
  });

  test('opening a deep link fresh (valid stored token, no prior UI navigation) does not bounce to login', async ({ page }) => {
    const deepPath = `/companies/${USERS.company.companyId}/employees`;
    await seedSessionAndGoto(page, USERS.company, deepPath);

    await expectStillOn(page, new RegExp(`${deepPath}$`));
    await expect(page.getByLabel('Correo electrónico')).not.toBeVisible();
  });

  test('navigating between several company pages never redirects to login', async ({ page }) => {
    await loginViaUi(page, USERS.company);
    await waitForAuthenticated(page);
    const companyId = USERS.company.companyId;

    for (const section of ['periods', 'departments', 'employees', 'goals', 'position_types']) {
      await page.goto(`/companies/${companyId}/${section}`);
      await expectStillOn(page, new RegExp(`/companies/${companyId}/${section}$`));
    }
  });
});

test.describe('invalid session handling', () => {
  test('a garbage token is rejected and redirected to login', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('Authorization', 'Bearer not-a-real-jwt'));

    await page.goto(`/companies/${USERS.company.companyId}/departments`);
    await expect(page).toHaveURL('/');

    const token = await page.evaluate(() => localStorage.getItem('Authorization'));
    expect(token).toBeNull();
  });

  test('an expired-looking token is rejected and redirected to login', async ({ page }) => {
    // exp far in the past; signature doesn't matter since this is caught by
    // the client-side expiry check before any request is made.
    const expiredPayload = Buffer.from(JSON.stringify({ sub: '1', exp: 1 })).toString('base64url');
    const fakeToken = `Bearer header.${expiredPayload}.sig`;

    await page.goto('/');
    await page.evaluate((t) => localStorage.setItem('Authorization', t), fakeToken);

    await page.goto(`/companies/${USERS.company.companyId}/departments`);
    await expect(page).toHaveURL('/');
  });

  test('no token at all redirects straight to login', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    await page.goto(`/companies/${USERS.company.companyId}/departments`);
    await expect(page).toHaveURL('/');
  });
});

test.describe('logout', () => {
  test('logging out clears the session and a protected page redirects back to login', async ({ page }) => {
    await loginViaUi(page, USERS.company);
    await expect(page).toHaveURL(new RegExp(`/companies/${USERS.company.companyId}/goals$`));

    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL('/');

    const token = await page.evaluate(() => localStorage.getItem('Authorization'));
    expect(token).toBeNull();

    // Simulate the browser back button after logout.
    await page.goto(`/companies/${USERS.company.companyId}/goals`);
    await expect(page).toHaveURL('/');
  });
});
