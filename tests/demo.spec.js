import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const demoPages = [
  ['home', 'index.html'],
  ['login', 'login.html'],
  ['dashboard', 'dashboard.html'],
  ['blog', 'blog.html'],
  ['forum', 'forum.html'],
  ['thread', 'thread.html'],
  ['profile', 'profile.html'],
];

for (const [name, path] of demoPages) {
  test(`${name} demo page has shared navigation and no WCAG 2.1 A/AA violations`, async ({
    page,
  }) => {
    await page.goto(`/demo/${path}`);

    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
    await expect(page.getByLabel('Language')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Download focus kit' })).toHaveAttribute(
      'download',
      '',
    );
    await expect(page.getByRole('contentinfo')).toBeVisible();

    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(violations).toEqual([]);
  });
}

test('demo navigation is keyboard accessible and fits a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo/index.html');

  const toggle = page.locator('[data-fluent-navbar-toggle]');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#site-navigation')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('demo sign-in does not submit credentials', async ({ page }) => {
  await page.goto('/demo/login.html');
  await page.getByLabel('Email address').fill('member@example.com');
  await page.getByLabel('Password').fill('not-a-real-password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.locator('#login-status')).toHaveText(
    'This demonstration does not connect to an account.',
  );
  expect(page.url()).toContain('/demo/login.html');
  expect(page.url()).not.toContain('member@example.com');
  expect(page.url()).not.toContain('not-a-real-password');
});
