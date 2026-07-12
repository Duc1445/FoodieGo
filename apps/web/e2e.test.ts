import { test, expect } from '@playwright/test';

test('End-to-End Happy Path Order Flow', async ({ page }) => {
  // Wait longer for elements and navigation since it's E2E
  test.setTimeout(60000);

  console.log('[E2E] Step 1: Navigating to Landing Page...');
  await page.goto('http://localhost/');

  console.log('[E2E] Step 2: Logging in as customer...');
  await page.click('text=Login');
  
  // Try to use the auth store mock, but actually we use real UI
  await page.fill('input[placeholder*="Email"]', 'customer@foodiego.com');
  await page.fill('input[placeholder*="Password"]', 'password');
  await page.click('button:has-text("Sign In")');

  // Wait for login to complete (should redirect to landing page or keep us there with avatar)
  await page.waitForSelector('text=Welcome', { timeout: 10000 }).catch(() => {});
  
  console.log('[E2E] Step 3: Searching for Mi Quang...');
  // Type in search bar
  const searchInput = await page.waitForSelector('input[placeholder*="Search"]');
  await searchInput.fill('Mi Quang');
  await page.keyboard.press('Enter');

  // Find Mi Quang Ba Mua card and click
  await page.click('text=Mi Quang Ba Mua', { timeout: 10000 });

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
  await page.goto('http://localhost/login');
  await page.fill('input[placeholder*="Email"]', 'merchant_miquangbamua@foodiego.com');
  await page.fill('input[placeholder*="Password"]', 'password');
  await page.click('button:has-text("Sign In")');

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
