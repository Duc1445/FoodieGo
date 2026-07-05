# 🍔 FoodieGo — Food Ordering & Delivery System

[![CI](https://github.com/your-org/foodiego/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/foodiego/actions)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=foodiego&metric=coverage)](https://sonarcloud.io/summary/foodiego)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=foodiego&metric=alert_status)](https://sonarcloud.io/summary/foodiego)

Đồ án môn học — Hệ thống đặt món và giao đồ ăn xây dựng theo kiến trúc Microservices.

---

## 🏗️ Kiến trúc

```text
                    Internet
                        │
                        ▼
              API Gateway (:3000)
                        │
      ┌─────────────────┼─────────────────┐
      │                 │                 │
      ▼                 ▼                 ▼
User Service       Food Service     Order Service
   (:3001)            (:3002)          (:3003)

      └──────────────────┬──────────────────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
         PostgreSQL              Redis
              │
              ▼
  Prometheus ←── Metrics ──→ Grafana
```

---

## 🚀 Chạy nhanh

### Prerequisites
- Docker Desktop
- Node.js 20+
- Git

### Start

```bash
# 1. Clone
git clone https://github.com/your-org/foodiego.git
cd foodiego

# 2. Copy env
cp .env.example .env

# 3. Start all services
docker compose up --build
```

### URLs

| Service | URL |
|---|---|
| API Gateway | http://localhost:3000 |
| User Service | http://localhost:3001 |
| Food Service | http://localhost:3002 |
| Order Service | http://localhost:3003 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3100 (admin/admin123) |

---

## 📁 Cấu trúc dự án

```
foodiego/
├── gateway/              # API Gateway (Express)
├── user-service/         # Auth, User management
├── food-service/         # Food, Category CRUD + Redis cache
├── order-service/        # Cart, Order, Delivery workflow
├── shared/               # Shared utilities
├── infrastructure/
│   ├── postgres/         # init.sql
│   ├── prometheus/       # prometheus.yml
│   └── grafana/          # Dashboards & datasources
├── scripts/
│   ├── setup.sh          # Dev bootstrap
│   └── load-test.js      # k6 load test
├── .github/workflows/    # GitHub Actions CI
├── sonar-project.properties
└── docker-compose.yml
```

---

## 🔌 API Documentation

### Auth

```
POST /api/auth/register   — Đăng ký tài khoản
POST /api/auth/login      — Đăng nhập
GET  /api/auth/profile    — Xem thông tin cá nhân (JWT)
PUT  /api/auth/profile    — Cập nhật thông tin (JWT)
```

### Food

```
GET    /api/foods            — Danh sách món ăn (có pagination & search)
GET    /api/foods/:id        — Chi tiết món ăn
POST   /api/foods            — Tạo món ăn (admin)
PUT    /api/foods/:id        — Cập nhật (admin)
DELETE /api/foods/:id        — Xóa (admin)
```

### Category

```
GET    /api/categories       — Danh sách category
POST   /api/categories       — Tạo (admin)
PUT    /api/categories/:id   — Cập nhật (admin)
DELETE /api/categories/:id   — Xóa (admin)
```

### Order

```
GET   /api/cart              — Xem giỏ hàng
POST  /api/cart              — Thêm vào giỏ hàng
PUT   /api/cart/:foodId      — Cập nhật số lượng
DELETE /api/cart/:foodId     — Xóa khỏi giỏ
POST  /api/orders            — Đặt hàng (checkout)
GET   /api/orders            — Lịch sử đơn
GET   /api/orders/:id        — Chi tiết đơn
PATCH /api/orders/:id/status — Cập nhật trạng thái (admin/shipper)
```

---

## 🔄 Workflow đơn hàng

```
customer tạo đơn
        ↓
     pending
        ↓
admin xác nhận
        ↓
    confirmed
        ↓
   đang nấu (preparing)
        ↓
shipper nhận đơn
        ↓
   delivering
        ↓
    completed
```

---

## 🧪 Testing

```bash
# Unit + Integration test (1 service)
cd user-service && npm test

# Load test (cần k6 cài sẵn)
k6 run scripts/load-test.js
```

---

## 📊 SPQM Metrics

| Metric | Target | Tool |
|---|---|---|
| Code Coverage | ≥ 80% | Jest + SonarQube |
| CI Pass Rate | ≥ 95% | GitHub Actions |
| Lead Time | Đo hàng ngày | GitHub |
| p95 Latency | < 500ms | k6 + Grafana |
| Error Rate | < 1% | Prometheus |

---

## 👥 Nhóm

| Thành viên | Vai trò |
|---|---|
| [Bạn] | Technical Lead + Full-stack Dev |
| [Thành viên 1] | SPQM Report + Metrics collection |
| [Thành viên 2] | Grafana Dashboard + Video demo |
| [Thành viên 3] | Data entry + Testing support |
