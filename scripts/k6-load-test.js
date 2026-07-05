import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 20 }, // Ramp-up to 20 users
    { duration: '30s', target: 20 }, // Steady state
    { duration: '10s', target: 0 },  // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete within 500ms
    http_req_failed: ['rate<0.01'],   // Error rate must be less than 1%
  },
};

const BASE_URL = 'http://localhost:3000'; // Gateway URL

export default function () {
  // Test Health endpoint
  let res = http.get(`${BASE_URL}/health`);
  check(res, {
    'health status is 200': (r) => r.status === 200,
  });

  // Test Categories GET
  res = http.get(`${BASE_URL}/api/categories`);
  check(res, {
    'categories status is 200': (r) => r.status === 200,
  });

  // Test Foods GET
  res = http.get(`${BASE_URL}/api/foods`);
  check(res, {
    'foods status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
