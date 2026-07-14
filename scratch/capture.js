const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const OUT_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/2e4d87ec-aa2e-4b86-93d2-7576f3ce83e2';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    console.log("1. Admin Login Isolation");
    await page.goto('http://localhost/admin/login');
    await page.waitForSelector('input[type="email"\]'); await page.type('input[type="email"\]', 'admin1@foodiego.com');
    await page.type('input[type="password"]', '123456'); 
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 3000));
    
    // Screenshot admin dashboard
    await page.screenshot({ path: path.join(OUT_DIR, 'admin_dashboard.png') });

    // Try going to merchant login
    await page.goto('http://localhost/merchant/login');
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(OUT_DIR, 'merchant_login_isolation.png') });
    
    // Check if it's really isolated. The URL should still be /merchant/login
    console.log("URL after navigating to /merchant/login: ", page.url());

    // Try going to driver login
    await page.goto('http://localhost/driver/login');
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(OUT_DIR, 'driver_login_isolation.png') });

    console.log("2. Registration Flow Verification");
    // We register via API to ensure it works, or via UI
    await page.goto('http://localhost/merchant/register');
    await page.waitForSelector('input[type="email"\]'); await page.type('input[type="email"\]', 'newmerch2024@foodiego.com');
    await page.type('input[type="password"]', 'password123');
    await page.type('input[placeholder="John Doe"]', 'New Merchant 2024');
    await page.type('input[placeholder="0901234567"]', '0999999999');
    await page.type('input[placeholder="My Awesome Restaurant"]', 'Awesome Resto');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 3000)); // Wait for API response and redirect

    // Should redirect to login. Let's try to login
    await page.goto('http://localhost/merchant/login');
    await page.waitForSelector('input[type="email"\]'); await page.type('input[type="email"\]', 'newmerch2024@foodiego.com');
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 2000)); // Wait for toast error

    await page.screenshot({ path: path.join(OUT_DIR, 'merchant_pending_login_error.png') });

    console.log("3. Admin Approvals");
    // Admin is already logged in for this browser session?
    // Wait, localStorage is per domain (localhost). 
    // Since we used /admin/login, the admin token is in localStorage under 'foodiego-auth' key?
    // Let's go to admin approvals
    await page.goto('http://localhost/admin/approvals');
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(OUT_DIR, 'admin_approvals_merchants.png') });

    // Approve the first pending merchant (which is our new one, or one of the seeds)
    // Actually we can just screenshot the page and that's it.
    
    console.log("All screenshots captured successfully.");
  } catch (err) {
    console.error("Error during puppeteer script:", err);
  } finally {
    await browser.close();
  }
})();
