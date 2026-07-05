# DUY TAN UNIVERSITY - INTERNATIONAL SCHOOL
## CMU-SE 433 · Software Process & Quality Management
### BÁO CÁO SPQM - MINI PROJECT

**Thông tin nhóm & dự án**
* **Tên nhóm**: FoodieGo Team
* **Mã đề tài / Tên đề tài**: MP-03 · FoodieGo (Microservices Food Delivery Platform)
* **Level đăng ký mục tiêu**: Level 3
* **Link GitHub repository**: [https://github.com/Duc1445/FoodieGo](https://github.com/Duc1445/FoodieGo)
* **Link video demo (≤ 5 phút)**: (Sẽ bổ sung sau)
* **Ngày nộp**: 05/07/2026

---

## 1. Phân công công việc & vai trò

| STT | Họ tên / MSSV | Vai trò | Trách nhiệm chính | % đóng góp |
|---|---|---|---|---|
| 1 | Duc1445 | Team Lead / Process Owner | Điều phối Sprint, định hình kiến trúc (Platform/ADR), sở hữu quy trình Observability & CI/CD. | 40% |
| 2 | Member 2 | Backend Developer | Phát triển các Core Services (Gateway, Identity, Restaurant, Order), tích hợp RabbitMQ. | 30% |
| 3 | Member 3 | QA / DevOps Engineer | Viết Unit/Integration Test (Jest), thiết lập Docker Compose, Load Test (k6) và Grafana Dashboards. | 30% |

**Quy ước làm việc nhóm (Definition of Done, Git workflow)**
* **Branching model**: Feature Branching (VD: `feature/order-service` → PR → review → merge vào `main`).
* **Commit convention**: Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).
* **Definition of Done của một User Story**: Code hoàn thiện + Pass 100% Test + Không có ESLint/Husky errors + Review PR được duyệt + CI pipeline báo xanh.
* **Quy tắc review**: Mỗi PR cần ít nhất 1 người duyệt (Approve) trước khi merge. Không push code trực tiếp lên `main`.

---

## 2. Quy trình áp dụng (Process)

### 2.1 Mô hình cải tiến đã chọn

| Mục | Nội dung nhóm điền |
|---|---|
| **Mô hình cải tiến**: PDCA / ODA | Nhóm chọn **PDCA** (Plan-Do-Check-Act). Dễ dàng áp dụng vào chu kỳ Sprint để đánh giá nợ kỹ thuật (technical debt) và liên tục tinh chỉnh kiến trúc nền tảng (VD: từ gọi API đồng bộ sang RabbitMQ). |
| **Quy trình phát triển** | Scrum kết hợp Agile. Mỗi Sprint kéo dài 2 tuần. Daily sync qua Discord/Zalo. |
| **Vòng lặp cải tiến** | Quan sát (API timeout khi order) → Phân tích nguyên nhân (Database lock) → Hành động (Áp dụng Outbox Pattern & RabbitMQ) → Đo lường lại (k6 load test cho thấy p95 latency giảm mạnh). |

### 2.2 Quy trình mô tả bằng ETVX
**Tên quy trình: Quy trình Review & Merge Pull Request (PR)**

* **E - Entry (Điều kiện đầu vào)**: Developer đã push code lên feature branch. Issue đã được gắn link. Husky pre-commit (ESLint, Prettier) chạy pass local.
* **T - Tasks (Các việc thực hiện)**: 
  1. Tạo PR trên GitHub kèm mô tả chi tiết thay đổi.
  2. CI tự động trigger (chạy tests, build docker image).
  3. Reviewer kiểm tra logic code, conventions, và security vulnerabilities.
* **V - Verification & Validation**: CI Pipeline màu xanh (Pass). Reviewer thả Approve. Không có unresolved comments.
* **X - Exit (Điều kiện hoàn thành)**: Nút Squash & Merge được kích hoạt. PR merge vào `main`. Branch cũ tự động bị xóa. Issue tương ứng tự động close.

---

## 3. Bảng chỉ số đo lường (Measurement)

### 3.1 Chỉ số chất lượng & quy trình

| Chỉ số (Metric) | Cách đo / Công cụ | Baseline (Bắt đầu) | Kết quả cuối | Mục tiêu |
|---|---|---|---|---|
| **Test coverage (%)** | Jest (`--coverage`) | 0% | 85% | ≥ 80% (Level 3) |
| **Số unit test / integration test** | Jest Test Runner | 0 test | > 45 tests | Tăng dần qua Sprint |
| **ESLint / Prettier errors** | `npm run lint` | > 120 errors | 0 error | 0 error (chặn từ pre-commit) |
| **Số defect phát hiện / Sprint** | GitHub Issues | ~15 lỗi/sprint | ~3 lỗi/sprint | Giảm dần qua thời gian |
| **CI pipeline pass rate (%)** | GitHub Actions | 40% | 95% | → 100% |
| **p95 response time (ms)** | k6 Load Test | > 800ms | ~120ms | < 200ms |
| **Distributed Trace Completeness** | Grafana Tempo | N/A | 100% | 100% E2E tracing |

### 3.2 Chỉ số giao hàng DORA

| DORA metric | Ý nghĩa | Giá trị nhóm đạt | Ghi chú |
|---|---|---|---|
| **Deployment frequency** | Tần suất deploy/merge | ~3-4 PRs / tuần | Ổn định và liên tục |
| **Lead time for changes** | Commit → chạy được | < 10 phút | Nhờ Docker Compose tối ưu hóa build cache |
| **Change failure rate** | % thay đổi gây lỗi | < 5% | Các lỗi lớn bị chặn ở khâu E2E Testing |

**Nhận xét xu hướng**: 
Số liệu từ baseline đến kết thúc dự án cho thấy sự cải thiện vượt bậc về **độ ổn định và hiệu năng**. Việc áp dụng nghiêm ngặt Husky (chặn lint error), tích hợp RabbitMQ (giảm latency), và triển khai Observability SDK (giúp debug nhanh) là những hành động cải tiến cốt lõi tạo ra sự thay đổi này.

---

## 4. Retrospective theo Sprint

**Sprint 1 (Tuần 1–2): Khởi tạo & Định hình Kiến trúc**
* ✅ **Keep**: Chọn đúng mô hình Monorepo (pnpm workspaces) và Layered DDD giúp code tái sử dụng tốt.
* ⚠ **Problem**: Cấu trúc thư mục ban đầu lộn xộn, thiếu quy chuẩn logging.
* → **Act**: Refactor lại shared packages (`@foodiego/core`). Thống nhất dùng Pino logging và ErrorHandler chung.

**Sprint 2 (Tuần 3–4): Phát triển Core Services (Identity, Restaurant, Gateway)**
* ✅ **Keep**: Dùng Docker Compose để anh em dev không cần cài cắm local DB/Redis.
* ⚠ **Problem**: Lỗi liên quan đến caching Redis và đồng bộ dữ liệu.
* → **Act**: Cập nhật ADR-004 về chiến lược cache. Viết thêm Integration Test cho Redis.

**Sprint 3 (Tuần 5–6): Xử lý Nghiệp vụ Phức tạp (Order, Cart, RabbitMQ)**
* ✅ **Keep**: Review code chéo rất kỹ khi đụng đến Transaction DB và thanh toán.
* ⚠ **Problem**: High latency và Timeout khi Order gọi đồng bộ sang Restaurant để trừ tồn kho.
* → **Act**: Quyết định chuyển sang kiến trúc Event-Driven, cài RabbitMQ và Outbox Pattern (ADR-005, ADR-007) để xử lý bất đồng bộ.

**Sprint 4 (Tuần 7–8): Observability, Load Test & Tối ưu hóa**
* ✅ **Keep**: Load testing bằng k6 chỉ ra chính xác bottle-neck (N+1 query, Index DB).
* ⚠ **Problem**: Khó debug lỗi trên môi trường Microservices phân tán.
* → **Act**: Xây dựng toàn bộ nền tảng Observability (OpenTelemetry, Grafana, Loki, Tempo, Prometheus). Bổ sung PII Policy và Golden Signals.

---

## 5. Tự đánh giá CMMI (CMMI Self-Assessment)

### 5.1 Thang trưởng thành
* [ ] 1 - Initial
* [ ] 2 - Repeatable
* [X] **3 - Defined** *(Quy trình được định nghĩa & tài liệu hóa thành các chuẩn mực nền tảng (ADR, Guidelines), cả nhóm tuân thủ nghiêm ngặt).*
* [ ] 4 - Managed
* [ ] 5 - Optimizing

### 5.2 Tự đánh giá theo Process Area

| Process Area | Điểm (0–5) | Bằng chứng |
|---|---|---|
| **Requirements & Architecture** | 4 | Sử dụng [ADR (Architecture Decision Records)](docs/platform/adr-index.md) để quyết định mọi công nghệ. |
| **Project Planning** | 3 | Lên task và chia Milestone rõ ràng trên GitHub Projects. |
| **Configuration Management** | 4 | Áp dụng Husky pre-commit, Gitignore chuẩn, Git flow branching. |
| **Measurement & Analysis** | 4 | Bảng [Golden Signals](docs/platform/observability/golden-signals.md), Grafana dashboards, k6 metrics. |
| **Process & Quality Assurance** | 4 | SDK có sẵn PII Redaction, [Trace Quality KPI](docs/platform/observability/trace-quality-kpi.md). |
| **Verification & Validation** | 4 | E2E Testing, CI pipeline GitHub Actions, Review approval required. |

### 5.3 Kế hoạch cải tiến tiếp theo
* **Điểm yếu**: Chưa có CI/CD tự động deploy lên Cloud thực tế (như AWS/GCP), mới chỉ chạy ở mức Docker Compose local.
* **Thay đổi**: Cấu hình Terraform và GitHub Actions để auto-deploy lên Kubernetes cluster (EKS/GKE).
* **Đo lường**: Dùng DORA metrics (Deployment Frequency) trên môi trường Prod để kiểm chứng.

---

## 6. Tổng kết & cam kết

Dự án FoodieGo đã vượt qua mức một bài tập môn học thông thường để đạt đến **Level 3 (Platform Engineering & Observability)**. Kết quả nổi bật nhất là hệ thống không chỉ "chạy được" mà còn được thiết kế với tư duy vận hành (operational readiness): áp dụng chuẩn W3C Trace Context, Outbox Pattern, PII Redaction tự động, và Dashboard as Code. Bài học lớn nhất của nhóm là quy trình (Process) và các rào cản kiến trúc (Guardrails) càng được định nghĩa rõ ràng từ sớm, thì technical debt về sau càng ít.

*Chúng tôi cam kết báo cáo phản ánh trung thực quá trình làm việc và số liệu của nhóm.*
**Ký tên**: Duc1445 & FoodieGo Team (100%)
