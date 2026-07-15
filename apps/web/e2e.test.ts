import { test, expect } from '@playwright/test';

test.setTimeout(120000);

test('End-to-End Happy Path Order Flow', async ({ page }) => {
  console.log('[E2E] Step 1: Navigating to Landing Page...');
  await page.goto('http://localhost/');

  console.log('[E2E] Step 2: Logging in as customer...');
  await page.goto('http://localhost/login');
  await page.getByLabel('Email').fill('customer1@foodiego.com');
  await page.getByLabel('Password').fill('123456');
  await page.getByRole('button', { name: 'Login' }).click();

  // Wait for login to complete (should redirect to landing page or keep us there with avatar)
  await page.waitForSelector('text=Welcome', { timeout: 10000 }).catch(() => {});
  
  console.log('[E2E] Step 3: Opening the first restaurant card...');
  // Open the first visible restaurant card from the seeded demo data
  await page.waitForSelector('a[href^="/restaurant/"]', { timeout: 15000 });
  await page.locator('a[href^="/restaurant/"]').first().click({ timeout: 10000 });

  console.log('[E2E] Step 4: Adding to cart...');
  // The menu loads, find any Add to Cart button
  const addToCartBtn = await page.waitForSelector('button:has-text("Add to Cart")');
  await addToCartBtn.click();
  
  console.log('[E2E] Step 5: Checkout...');
  // Open cart
  await page.click('button:has-text("Cart")'); // Or the shopping cart icon
  // Wait for checkout button
  const checkoutBtn = await page.waitForSelector('button:has-text("Checkout")');
  await checkoutBtn.click();

  console.log('[E2E] Step 6: Placing order...');
  // Checkout page details
  // Wait for Place Order button
  const placeOrderBtn = await page.waitForSelector('button:has-text("Place Order")');
  await placeOrderBtn.click();

  console.log('[E2E] Step 7: Verifying order success...');
  // Should go to My Orders or Success page
  // Look for CONFIRMED status
  await expect(page.locator('text=CONFIRMED').first()).toBeVisible({ timeout: 15000 });

  console.log('[E2E] Step 8: Logging out...');
  // Profile dropdown -> Logout
  await page.goto('http://localhost/');
  await page.evaluate(() => localStorage.clear()); // forceful logout

  console.log('[E2E] Step 9: Logging in as merchant...');
  await page.goto('http://localhost/merchant/login');
  await page.getByLabel('Email').fill('merchant2@foodiego.com');
  await page.getByLabel('Password').fill('123456');
  await page.getByRole('button', { name: 'Login to Dashboard' }).click();

  console.log('[E2E] Step 10: Going to Merchant Dashboard...');
  await page.goto('http://localhost/merchant');
  
  console.log('[E2E] Step 11: Waiting for new order (polling)...');
  // Order appears under "Active Orders"
  await page.waitForSelector('text=CONFIRMED', { timeout: 20000 });

  console.log('[E2E] Step 12: Click Prepare...');
  const prepareBtn = await page.waitForSelector('button:has-text("Prepare")');
  await prepareBtn.click();
  await expect(page.locator('text=PREPARING').first()).toBeVisible({ timeout: 5000 });

  console.log('[E2E] Step 13: Click Ready...');
  const readyBtn = await page.waitForSelector('button:has-text("Ready")');
  await readyBtn.click();
  await expect(page.locator('text=READY_FOR_DELIVERY').first()).toBeVisible({ timeout: 5000 });

  console.log('[E2E] SUCCESS! All steps completed successfully.');
});
