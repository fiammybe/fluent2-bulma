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
  ['store', 'store.html'],
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

test('store product details, reviews, and shopping cart are interactive', async ({ page }) => {
  await page.goto('/demo/store.html');
  await expect(page.getByRole('heading', { name: 'Focus Planner' }).first()).toBeVisible();
  await expect(page.getByText('4.8 out of 5 · 126 ratings')).toBeVisible();
  await expect(page.getByText(/Just enough structure/)).toBeVisible();

  await page.getByRole('button', { name: 'Add to cart' }).first().click();
  await page.getByRole('button', { name: 'Add to cart' }).first().click();
  await page.getByRole('button', { name: 'Add to cart' }).nth(1).click();
  await expect(page.locator('#store-cart-count')).toHaveText('3');
  await expect(page.locator('#store-cart-total')).toHaveText('$68.00');

  await page.getByRole('button', { name: 'Remove Focus Planner from cart' }).click();
  await expect(page.locator('#store-cart-count')).toHaveText('1');
  await expect(page.locator('#store-cart-total')).toHaveText('$32.00');

  await page.getByRole('button', { name: 'Details' }).nth(1).click();
  await expect(page.locator('#store-detail-name')).toHaveText('Desk Timer');
  await expect(page.getByText(/A small change that made my focus blocks/)).toBeVisible();

  await page.getByLabel('Your name').fill('Avery');
  await page.getByLabel('Your rating').selectOption('4');
  await page
    .getByRole('textbox', { name: 'Comment' })
    .fill('This timer helps me settle into a task.');
  await page.getByRole('button', { name: 'Post review' }).click();
  await expect(page.getByText('Avery', { exact: true })).toBeVisible();
  await expect(page.getByText('This timer helps me settle into a task.')).toBeVisible();
  await expect(page.locator('#store-rating-summary')).toHaveText('4.6 out of 5 · 85 ratings');
});
