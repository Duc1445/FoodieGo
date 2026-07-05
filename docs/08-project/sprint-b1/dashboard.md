# Sprint Dashboard: B1 - Restaurant Discovery

## Sprint Goal
Trong vòng 2–3 phút sau khi mở ứng dụng, một người dùng mới phải có thể tìm thấy nhà hàng, mở menu và quyết định mình muốn ăn gì.

## KPIs
- **Home load:** < 2s
- **Restaurant load:** < 1.5s
- **Menu load:** < 1s
- **User tìm được món:** < 30s
- **Dead-end screens:** 0

## Definition of Ready (DoR)
- [x] Product Specs & Feature Specs (Restaurant Discovery) đã hoàn tất.
- [x] UX Wireframe & Navigation Flow đã duyệt.
- [x] Database Schema đã chuẩn bị.
- [x] API Contract đã thống nhất.

## Definition of Done (DoD)
- [ ] Tính năng Discovery (GET restaurants, GET details, GET menu) hoạt động E2E.
- [ ] Không có dead-end flow.
- [ ] Analytics tracking (HomeViewed, RestaurantViewed, MenuViewed) hoạt động.
- [ ] Pass Unit Test & API Tests.
- [ ] CI xanh (Linter, Security).

## Sprint Backlog
- Thiết lập Analytics Endpoint (Mock)
- Tối ưu hoá `GET /api/restaurants` (Search, Pagination)
- Tối ưu hoá `GET /api/restaurants/:id/menu` (Group by Category in 1 request)
- Viết Unit Tests
- Xây dựng Client Simulator Demo

## Risks
- **Technical Risk:** Khó đảm bảo Menu load < 1s nếu nhà hàng có hàng ngàn món ăn, cần tối ưu index và query.

## Velocity
- Planned: N/A
- Actual: N/A

## Retrospective
- *To be filled after sprint review*
