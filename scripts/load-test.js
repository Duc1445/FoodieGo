import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2s', target: 50 },
    { duration: '10s', target: 50 },
    { duration: '2s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% of requests must complete below 500ms, 99% below 1s
    http_req_failed: ['rate<0.01'],                 // Error rate must be less than 1%
  },
};

const BASE_URL = 'http://localhost:3000/api/v1';

export default function () {
  // Test 1: Get all restaurants (paginated)
  const res1 = http.get(`${BASE_URL}/restaurants?page=1&limit=20`);
  check(res1, {
    'GET /restaurants status is 200': (r) => r.status === 200,
    'GET /restaurants returns data': (r) => r.json('data.items') !== undefined,
  });

  sleep(1);

  // Test 2: Search restaurants (fuzzy match)
  const res2 = http.get(`${BASE_URL}/restaurants?search=Burger`);
  check(res2, {
    'GET /restaurants?search status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
