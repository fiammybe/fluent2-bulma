import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const openOverview = async (page) => {
  await page.goto('/overview.html');
  await page.evaluate(() => document.fonts.ready);
};

test('overview has no WCAG 2.1 A/AA accessibility violations in light or dark themes', async ({
  page,
}) => {
  await openOverview(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });

  for (const theme of ['light', 'dark']) {
    await page.locator(`[data-theme-choice="${theme}"]`).click();
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(violations, `${theme} theme`).toEqual([]);
  }
});

test('keyboard users can operate navigation, tabs, menus, dialogs, accordions, and tooltips', async ({
  page,
}) => {
  await openOverview(page);

  await page.setViewportSize({ width: 390, height: 844 });
  const navbarToggle = page.locator('[data-fluent-navbar-toggle]');
  await navbarToggle.focus();
  await page.keyboard.press('Enter');
  await expect(navbarToggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#overview-navigation')).toBeVisible();

  const tabs = page.locator('[data-fluent-tab]');
  await tabs.first().focus();
  await page.keyboard.press('ArrowRight');
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('End');
  await expect(tabs.nth(2)).toHaveAttribute('aria-selected', 'true');

  const menuTrigger = page.locator('[popovertarget="sample-dropdown"]');
  await menuTrigger.focus();
  await page.keyboard.press('Enter');
  const menuItems = page.locator('#sample-dropdown [role="menuitem"]');
  await expect(menuItems.first()).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(menuItems.nth(1)).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menuTrigger).toBeFocused();

  const dialogTrigger = page.locator('[data-fluent-dialog-trigger]');
  await dialogTrigger.focus();
  await page.keyboard.press('Enter');
  const dialog = page.locator('#sample-dialog');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(dialogTrigger).toBeFocused();

  const summary = page.locator('.fluent-accordion summary').first();
  await summary.focus();
  await page.keyboard.press('Space');
  await expect(summary.locator('..')).toHaveAttribute('open', '');

  const tooltipTrigger = page.locator('[data-fluent-tooltip]');
  await tooltipTrigger.focus();
  await expect(page.locator('[role="tooltip"]')).toHaveText(
    'Tooltips describe controls without taking focus.',
  );
  await expect(tooltipTrigger).toHaveAttribute('aria-describedby', /fluent-tooltip-/);
});

test('reduced motion and forced-colors preferences are respected', async ({ page }) => {
  await openOverview(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const duration = await page
    .locator('.button')
    .first()
    .evaluate((element) => getComputedStyle(element).transitionDuration.split(',')[0]);
  expect(Number.parseFloat(duration)).toBeLessThan(0.001);

  await page.emulateMedia({ forcedColors: 'active' });
  const primaryButton = page.locator('.button.is-primary').first();
  await primaryButton.focus();
  const forcedColorsFocus = await primaryButton.evaluate((element) => ({
    boxShadow: getComputedStyle(element).boxShadow,
    color: getComputedStyle(element).color,
  }));
  expect(forcedColorsFocus.boxShadow).toBe('none');
  expect(forcedColorsFocus.color).not.toBe('rgba(0, 0, 0, 0)');
});

test('gallery snippets copy both Bulma and Fluent component class examples', async ({ page }) => {
  await openOverview(page);
  await page.evaluate(() => {
    window.copiedSnippet = null;
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async (text) => (window.copiedSnippet = text) },
    });
  });

  const copyButtons = page.getByRole('button', { name: 'Copy snippet' });
  await copyButtons.nth(0).click();
  await expect(page.locator('[data-copy-status]')).toHaveText('Snippet copied.');
  expect(await page.evaluate(() => window.copiedSnippet)).toContain('class="button is-primary"');

  await copyButtons.nth(1).click();
  expect(await page.evaluate(() => window.copiedSnippet)).toBe(
    '<span class="fluent-badge is-brand">New</span>',
  );
});

for (const theme of ['light', 'dark']) {
  for (const density of ['compact', 'comfortable']) {
    test(`overview visual baseline: ${theme} theme, ${density} density`, async ({ page }) => {
      await openOverview(page);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.locator(`[data-theme-choice="${theme}"]`).click();
      if (density === 'comfortable') {
        await page.locator('#comfortable-density').check();
        await expect(page.locator('#sample-form')).toHaveClass(/is-comfortable/);
      }
      await expect(page).toHaveScreenshot(`${theme}-${density}-overview.png`, {
        animations: 'disabled',
      });
      await page.evaluate(() => {
        const forms = document.querySelector('#forms');
        window.scrollTo(0, Math.round(forms.getBoundingClientRect().top + window.scrollY));
      });
      await expect(page).toHaveScreenshot(`${theme}-${density}-forms.png`, {
        animations: 'disabled',
      });
    });
  }
}
