/**
 * Verification script - prints raw HTTP status + body for each step
 * Used to satisfy sprint verification requirement #4 (Merchant Approval)
 * and #3 (Delivery API)
 */
import crypto from 'crypto';

const BASE_URL = 'http://localhost:3000/api/v1';

async function rawFetch(label, endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  console.log(`\n--- ${label} ---`);
  console.log(`REQUEST: ${options.method || 'GET'} ${url}`);
  if (options.body) console.log('BODY:', options.body);

  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }

  console.log(`RESPONSE STATUS: ${res.status}`);
  console.log('RESPONSE BODY:', JSON.stringify(data, null, 2));
  return { status: res.status, data };
}

async function run() {
  console.log('=== RAW VERIFICATION OUTPUT ===');

  const merchantEmail = `merchant_${crypto.randomBytes(4).toString('hex')}@test.com`;
  const merchantPass = 'password123';

  // A. Register merchant
  const regResult = await rawFetch(
    'A. Register Merchant',
    '/auth/register',
    { method: 'POST', body: JSON.stringify({ email: merchantEmail, password: merchantPass, full_name: 'Test Merchant', role: 'merchant' }) }
  );
  const merchantId = regResult.data?.data?.user?.id;

  // B. Login merchant (expect 403 MERCHANT_PENDING)
  await rawFetch(
    'B. Login Merchant (expect 403 MERCHANT_PENDING)',
    '/auth/login',
    { method: 'POST', body: JSON.stringify({ email: merchantEmail, password: merchantPass }) }
  );

  // C. Admin login
  const adminResult = await rawFetch(
    'C. Admin Login',
    '/auth/login',
    { method: 'POST', body: JSON.stringify({ email: 'admin@foodiego.com', password: 'Admin@123' }) }
  );
  const adminToken = adminResult.data?.data?.token;

  // Approve merchant
  await rawFetch(
    'D. Admin Approve Merchant',
    `/users/admin/merchants/${merchantId}/approve`,
    { method: 'PATCH', headers: { Authorization: `Bearer ${adminToken}` } }
  );

  // D. Login merchant again (expect 200)
  await rawFetch(
    'E. Login Merchant After Approval (expect 200)',
    '/auth/login',
    { method: 'POST', body: JSON.stringify({ email: merchantEmail, password: merchantPass }) }
  );

  // Delivery API
  await rawFetch(
    'F. GET /delivery?status=waiting (expect 200)',
    '/delivery?status=waiting',
    { headers: { Authorization: `Bearer ${adminToken}` } }
  );
}

run().catch(e => { console.error(e); process.exit(1); });
