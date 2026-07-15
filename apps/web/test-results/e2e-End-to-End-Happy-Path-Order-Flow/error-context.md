# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.test.ts >> End-to-End Happy Path Order Flow
- Location: e2e.test.ts:5:1

# Error details

```
TimeoutError: page.waitForSelector: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('a[href^="/restaurant/"]') to be visible

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e5]:
        - link "FoodieGo" [ref=e6] [cursor=pointer]:
          - /url: /
        - navigation [ref=e7]:
          - link "Home" [ref=e8] [cursor=pointer]:
            - /url: /
          - link "Search" [ref=e9] [cursor=pointer]:
            - /url: /search
        - generic [ref=e10]:
          - button "Hai Chau, Da Nang" [ref=e11] [cursor=pointer]:
            - img [ref=e12]
            - generic [ref=e15]: Hai Chau, Da Nang
          - generic [ref=e17]:
            - link "Customer 1" [ref=e18] [cursor=pointer]:
              - /url: /profile
            - link "Orders" [ref=e19] [cursor=pointer]:
              - /url: /orders
            - button "Logout" [ref=e20] [cursor=pointer]
          - button [ref=e22] [cursor=pointer]:
            - img [ref=e23]
          - generic [ref=e27]:
            - generic [ref=e28]:
              - generic [ref=e29]:
                - img [ref=e30]
                - heading "Your Cart" [level=2] [ref=e34]
              - button [ref=e35] [cursor=pointer]:
                - img [ref=e36]
            - generic [ref=e39]:
              - generic:
                - paragraph [ref=e43]: Your cart is empty.
                - button "Continue Shopping" [ref=e44] [cursor=pointer]
    - main [ref=e45]:
      - generic [ref=e46]:
        - generic [ref=e47]:
          - heading "Craving something delicious?" [level=1] [ref=e48]
          - paragraph [ref=e49]: Get your favorite food delivered in minutes.
          - generic [ref=e51]:
            - img [ref=e52]
            - textbox "Search restaurants..." [ref=e55]
        - generic [ref=e56]:
          - heading "Restaurants" [level=2] [ref=e58]
          - generic [ref=e60]:
            - img [ref=e61]
            - heading "Failed to Load Restaurants" [level=3] [ref=e63]
            - paragraph [ref=e64]: We couldn't load restaurants at this time. Please try again.
            - button "Retry" [ref=e65] [cursor=pointer]:
              - img [ref=e66]
              - text: Retry
    - contentinfo [ref=e71]:
      - paragraph [ref=e73]: Built with modern architecture.
  - region "Notifications alt+T"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.setTimeout(120000);
  4  | 
  5  | test('End-to-End Happy Path Order Flow', async ({ page }) => {
  6  |   console.log('[E2E] Step 1: Navigating to Landing Page...');
  7  |   await page.goto('http://localhost/');
  8  | 
  9  |   console.log('[E2E] Step 2: Logging in as customer...');
  10 |   await page.goto('http://localhost/login');
  11 |   await page.getByLabel('Email').fill('customer1@foodiego.com');
  12 |   await page.getByLabel('Password').fill('123456');
  13 |   await page.getByRole('button', { name: 'Login' }).click();
  14 | 
  15 |   // Wait for login to complete (should redirect to landing page or keep us there with avatar)
  16 |   await page.waitForSelector('text=Welcome', { timeout: 10000 }).catch(() => {});
  17 |   
  18 |   console.log('[E2E] Step 3: Opening the first restaurant card...');
  19 |   // Open the first visible restaurant card from the seeded demo data
> 20 |   await page.waitForSelector('a[href^="/restaurant/"]', { timeout: 15000 });
     |              ^ TimeoutError: page.waitForSelector: Timeout 15000ms exceeded.
  21 |   await page.locator('a[href^="/restaurant/"]').first().click({ timeout: 10000 });
  22 | 
  23 |   console.log('[E2E] Step 4: Adding to cart...');
  24 |   // The menu loads, find any Add to Cart button
  25 |   const addToCartBtn = await page.waitForSelector('button:has-text("Add to Cart")');
  26 |   await addToCartBtn.click();
  27 |   
  28 |   console.log('[E2E] Step 5: Checkout...');
  29 |   // Open cart
  30 |   await page.click('button:has-text("Cart")'); // Or the shopping cart icon
  31 |   // Wait for checkout button
  32 |   const checkoutBtn = await page.waitForSelector('button:has-text("Checkout")');
  33 |   await checkoutBtn.click();
  34 | 
  35 |   console.log('[E2E] Step 6: Placing order...');
  36 |   // Checkout page details
  37 |   // Wait for Place Order button
  38 |   const placeOrderBtn = await page.waitForSelector('button:has-text("Place Order")');
  39 |   await placeOrderBtn.click();
  40 | 
  41 |   console.log('[E2E] Step 7: Verifying order success...');
  42 |   // Should go to My Orders or Success page
  43 |   // Look for CONFIRMED status
  44 |   await expect(page.locator('text=CONFIRMED').first()).toBeVisible({ timeout: 15000 });
  45 | 
  46 |   console.log('[E2E] Step 8: Logging out...');
  47 |   // Profile dropdown -> Logout
  48 |   await page.goto('http://localhost/');
  49 |   await page.evaluate(() => localStorage.clear()); // forceful logout
  50 | 
  51 |   console.log('[E2E] Step 9: Logging in as merchant...');
  52 |   await page.goto('http://localhost/merchant/login');
  53 |   await page.getByLabel('Email').fill('merchant2@foodiego.com');
  54 |   await page.getByLabel('Password').fill('123456');
  55 |   await page.getByRole('button', { name: 'Login to Dashboard' }).click();
  56 | 
  57 |   console.log('[E2E] Step 10: Going to Merchant Dashboard...');
  58 |   await page.goto('http://localhost/merchant');
  59 |   
  60 |   console.log('[E2E] Step 11: Waiting for new order (polling)...');
  61 |   // Order appears under "Active Orders"
  62 |   await page.waitForSelector('text=CONFIRMED', { timeout: 20000 });
  63 | 
  64 |   console.log('[E2E] Step 12: Click Prepare...');
  65 |   const prepareBtn = await page.waitForSelector('button:has-text("Prepare")');
  66 |   await prepareBtn.click();
  67 |   await expect(page.locator('text=PREPARING').first()).toBeVisible({ timeout: 5000 });
  68 | 
  69 |   console.log('[E2E] Step 13: Click Ready...');
  70 |   const readyBtn = await page.waitForSelector('button:has-text("Ready")');
  71 |   await readyBtn.click();
  72 |   await expect(page.locator('text=READY_FOR_DELIVERY').first()).toBeVisible({ timeout: 5000 });
  73 | 
  74 |   console.log('[E2E] SUCCESS! All steps completed successfully.');
  75 | });
  76 | 
```