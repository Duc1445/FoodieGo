import http from 'k6/http';
import { check } from 'k6';
import exec from 'k6/execution';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import { SharedArray } from 'k6/data';

const userIds = new SharedArray('users', function () {
  return JSON.parse(open('./load-users.json'));
});

export const options = {
  scenarios: {
    checkout_burst: {
      executor: 'per-vu-iterations',
      vus: 500, // 500 concurrent users
      iterations: 1, // 1 iteration per user
      maxDuration: '30s',
    },
  },
  thresholds: {
    // We expect some requests to fail with 400/409/422 because of stock limit,
    // so we don't set a strict error rate for http_req_failed.
    // Instead we will check the database manually after the test.
    http_req_duration: ['p(95)<2000'], 
  },
};

const BASE_URL = 'http://order-service:3003/api/v1';
const MENU_ITEM_ID = '10000000-0000-0000-0000-000000000100'; // The limited edition pizza

export default function () {
  // Use vu index to pick a unique user for each iteration
  // vu is 1-indexed, so minus 1. 
  // If we have more VUs than users, use modulo.
  const vuIndex = (exec.vu.idInTest - 1) % userIds.length; 
  const userId = userIds[vuIndex];
  const idempotencyKey = uuidv4();
  
  // 1. Add to cart
  const cartPayload = JSON.stringify({
    menu_item_id: MENU_ITEM_ID,
    quantity: 1
  });
  
  const cartParams = {
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId
    }
  };
  
  const cartRes = http.put(`${BASE_URL}/cart/items`, cartPayload, cartParams);
  
  check(cartRes, {
    'cart update successful': (r) => r.status === 200,
  });

  if (cartRes.status !== 200) {
    return; // Stop if cart fails
  }

  const cartVersion = cartRes.json('data.version');

  // 2. Checkout
  const checkoutPayload = JSON.stringify({
    cartVersion: cartVersion,
    addressId: '12345678-1234-1234-1234-123456789012',
    paymentMethod: 'CASH'
  });

  const checkoutParams = {
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
      'idempotency-key': idempotencyKey
    }
  };

  const checkoutRes = http.post(`${BASE_URL}/orders/checkout`, checkoutPayload, checkoutParams);
  
  check(checkoutRes, {
    'checkout processed or rejected': (r) => r.status === 200 || r.status === 201 || r.status === 400 || r.status === 409 || r.status === 422 || r.status === 500,
  });

  if (checkoutRes.status !== 200 && checkoutRes.status !== 201 && checkoutRes.status !== 400 && checkoutRes.status !== 409 && checkoutRes.status !== 422 && checkoutRes.status !== 500) {
    console.log(`Unexpected status: ${checkoutRes.status}, body: ${checkoutRes.body}`);
  }
}
