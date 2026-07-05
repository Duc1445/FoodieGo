# Performance: K6 Load Testing

## 1. Objective
Subject the `restaurant-service` to a realistic production load (up to 50 concurrent virtual users) to measure system throughput and latency percentiles (P90, P95, P99). 

## 2. Methodology
- **Tool:** K6
- **Test Script:** Ramp up to 50 VUs, hold for 30s, ramp down over 10s.
- **Targets:**
  - `GET /api/v1/restaurants?page=1&limit=20` (Cache Hit heavy)
  - `GET /api/v1/restaurants?search=Burger` (Fuzzy Search heavy)

## 3. Results (Sample Run)

```text
    http_req_duration....: avg=4.14ms min=1.79µs med=3.05ms max=25.49ms p(90)=8.4ms p(95)=12.62ms p(99)=18.4ms
    http_req_failed......: 0.00% 0 out of 2050
    http_reqs............: 2050    40.257011/s
```

### Metrics Achieved:
- **P50 (Median):** 3.05 ms
- **P90:** 8.4 ms
- **P95:** 12.62 ms
- **P99:** 18.4 ms
- **Error Rate:** 0.0%

## 4. Conclusion
The combination of Node.js + Express + Pino + Redis Cache-Aside + PostgreSQL `pg_trgm` provides extreme performance. The system easily handles 50 concurrent VUs with zero dropped requests and maximum tail latency well under the aggressive 50ms KPI set by the CTO. The architecture is officially **Production Ready** for the Restaurant Discovery vertical slice.
