import crypto from 'crypto';

const BASE_URL = 'http://localhost:3000/api/v1';

async function fetchAPI(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
}

async function run() {
  console.log('=== Starting E2E Admin Merchant Approval Verification ===');
  
  const merchantEmail = `merchant_${crypto.randomBytes(4).toString('hex')}@test.com`;

  try {
    console.log('1. Registering new merchant...');
    const regRes = await fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: merchantEmail,
        password: 'password123',
        full_name: 'Test Merchant',
        role: 'merchant'
      })
    });
    console.log('Merchant registered with ID:', regRes.data.user.id);
    const merchantId = regRes.data.user.id;

    console.log('2. Verifying merchant cannot login yet (PENDING)...');
    try {
      await fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: merchantEmail,
          password: 'password123',
          role: 'merchant' // our proxy/login doesn't take role, but let's just pass it
        })
      });
      throw new Error('Merchant should not be able to login while pending!');
    } catch (err) {
      if (err.message.includes('pending approval')) {
        console.log('✅ Merchant correctly blocked from login: ' + err.message);
      } else {
        throw err;
      }
    }

    console.log('3. Admin login...');
    const adminRes = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@foodiego.com',
        password: 'Admin@123'
      })
    });
    const adminToken = adminRes.data.token;
    console.log('Admin logged in.');

    console.log('4. Admin fetch pending merchants...');
    const pendingRes = await fetchAPI('/users/admin/merchants/pending', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const pendingMerchants = pendingRes.data;
    const found = pendingMerchants.find(m => m.id === merchantId);
    if (!found) {
      throw new Error('Newly registered merchant not found in pending list!');
    }
    console.log('✅ Merchant found in pending list.');

    console.log('5. Admin approves merchant...');
    await fetchAPI(`/users/admin/merchants/${merchantId}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Merchant approved.');

    console.log('6. Verifying merchant can login now...');
    const merchantLoginRes = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: merchantEmail,
        password: 'password123'
      })
    });
    if (merchantLoginRes.data.token) {
      console.log('✅ Merchant successfully logged in after approval!');
    } else {
      throw new Error('Merchant login failed after approval!');
    }

    console.log('=== SUCCESS ===');
  } catch (err) {
    console.error('❌ E2E failed:', err.message);
    process.exit(1);
  }
}

run();
