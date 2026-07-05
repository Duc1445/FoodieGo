import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up
    { duration: '1m',  target: 50 },   // Hold
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% requests < 500ms
    http_req_failed:   ['rate<0.01'],  // Error rate < 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export function setup() {
  // Login to get token
  const res = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: 'admin@foodiego.com',
    password: 'Admin@123',
  }), { headers: { 'Content-Type': 'application/json' } });

  return { token: res.json('data.token') };
}

export default function (data) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.token}`,
  };

  // Test 1: Get foods list
  const foodsRes = http.get(`${BASE_URL}/api/foods`, { headers });
  check(foodsRes, { 'foods status 200': (r) => r.status === 200 });

  // Test 2: Health check
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, { 'health ok': (r) => r.status === 200 });

  sleep(1);
}
