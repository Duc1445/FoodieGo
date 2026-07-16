**DUY TAN UNIVERSITY - INTERNATIONAL SCHOOL**

**CMU-SE 433 · Software Process & Quality Management**

**BÁO CÁO SPQM - MINI PROJECT**

**Thông tin nhóm & dự án**

| **Tên nhóm**                   | FoodieGo Team                 |
| ------------------------------ | ----------------------------- |
| **Mã đề tài / Tên đề tài**     | FoodieGo                      |
| **Level đăng ký mục tiêu**     | Level 3                       |
| **Link GitHub repository**     | [Link GitHub repository]      |
| **Link video demo (≤ 5 phút)** | [Link video demo]             |
| **Ngày nộp**                   | 2026-07-16                    |

**1. Phân công công việc & vai trò**

Dựa trên dữ liệu commit thực tế từ GitHub (hơn 110 commits):

| **STT** | **Họ tên / GitHub User** | **Vai trò**     | **Trách nhiệm chính**                        | **% đóng góp** |
| ------- | ------------------------ | --------------- | -------------------------------------------- | -------------- |
| 1       | ducnt211003 / Duc1445    | Team Lead / Dev | Core logic, API, Order Service, Workflow CI  | 40%            |
| 2       | spotifysharing1412       | Developer       | Phát triển tính năng, xử lý giao diện        | 30%            |
| 3       | dntntkt26903             | Developer       | Cấu hình, hỗ trợ QA, Docker, Bug fixing      | 30%            |

*(Lưu ý: Đa số commit được gộp chung dưới tên "GitHub User" khi squash & merge qua Pull Request trên nền tảng GitHub. Sự chênh lệch % có thể được điều chỉnh thực tế bởi các thành viên).*

**Quy ước làm việc nhóm (Definition of Done, Git workflow)**
- Branching model: Feature branch → Pull Request (PR) → Review → Merge vào `main`.
- Commit convention: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`).
- Definition of Done: Code hoàn thành + test chạy qua + PR được duyệt + CI pipeline hoạt động không có lỗi nghiêm trọng.
- Quy tắc review: Yêu cầu CI chạy tự động qua GitHub Actions trước khi merge.

**2. Quy trình áp dụng (Process)**

**2.1 Mô hình cải tiến đã chọn**

| **Mục**                                            | **Nội dung nhóm điền**                                                |
| -------------------------------------------------- | --------------------------------------------------------------------- |
| **Mô hình cải tiến (chọn 1+): PDCA / ODA / IDEAL** | PDCA - Liên tục lặp lại quá trình phát hiện lỗi qua CI và sửa đổi.    |
| **Quy trình phát triển (SDLC/Agile)**              | Scrum với các Sprint 1 tuần, theo dõi qua Github Projects/Issues.     |
| **Vòng lặp cải tiến trong dự án**                  | CI báo lỗi unit tests (Check) -> Yêu cầu fix (Act) -> Fix code và push lại (Plan/Do). |

**2.2 Một quy trình mô tả bằng ETVX (bắt buộc - L10)**

| **Tên quy trình**                   | Xử lý Pull Request & Code Integration            |
| ----------------------------------- | ------------------------------------------------ |
| **E - Entry (điều kiện đầu vào)**   | Developer tạo PR từ branch feature vào `main`.   |
| **T - Tasks (các việc thực hiện)**  | Review code, GitHub Actions chạy Unit Tests.     |
| **V - Verification & Validation**   | CI pipeline PASS, SonarQube phân tích chất lượng.|
| **X - Exit (điều kiện hoàn thành)** | PR merged thành công, đóng branch tương ứng.     |

**3. Bảng chỉ số đo lường (Measurement)**

**3.1 Chỉ số chất lượng & quy trình**

| **Chỉ số (Metric)**             | **Cách đo / Công cụ** | **Baseline** | **Kết quả cuối** | **Mục tiêu**        |
| ------------------------------- | --------------------- | ------------ | ---------------- | ------------------- |
| Test result (Pass rate)         | Vitest/Playwright/Jest| N/A          | 100% Pass        | 100% Pass           |
| Tần suất Commit/Merge           | Git Log               | Dưới 5/tuần  | ~110 commits     | Liên tục tích hợp   |
| CI pipeline pass rate (%)       | GitHub Actions        | Thường xuyên đỏ| 100% xanh      | 100%                |

**3.2 Chỉ số giao hàng DORA**

| **DORA metric**       | **Ý nghĩa**                   | **Giá trị nhóm đạt** | **Ghi chú** |
| --------------------- | ----------------------------- | -------------------- | ----------- |
| Deployment frequency  | Tần suất deploy/merge an toàn | Tốt (Mỗi ngày)       | ~11 ngày liên tục push |
| Lead time for changes | Commit → chạy được            | Nhanh                | Các bản fix ra mắt liên tục |
| Change failure rate   | % thay đổi gây lỗi            | ~20%                 | Dựa trên số commit có tag `fix:` |

Nhận xét: Dự án có cường độ làm việc cao trong khoảng thời gian từ 05/07/2026 đến 16/07/2026. Tất cả các lỗi unit test và lỗi logic nghiệp vụ đã được xử lý thành công, đạt mục tiêu 100% test pass.

**4. Retrospective theo Sprint**

**Sprint 1 (05/07 - 10/07)**
| **✅ Điều làm tốt (Keep)** | **⚠ Vấn đề gặp phải (Problem)** | **→ Hành động cải tiến (Act)** |
| -------------------------- | ------------------------------- | ------------------------------ |
| Cấu hình Docker & CI/CD    | Lỗi schema & RabbitMQ timing    | Thêm xử lý lỗi và Retry        |
*Velocity: Xây dựng nền tảng và Backend.*

**Sprint 2 (11/07 - 16/07)**
| **✅ Điều làm tốt (Keep)** | **⚠ Vấn đề gặp phải (Problem)** | **→ Hành động cải tiến (Act)** |
| -------------------------- | ------------------------------- | ------------------------------ |
| Thêm Shipper Portal        | Một số Unit tests fail trên CI  | Sửa lại Mock API, thêm kiểm tra rabbitMQ |
*Velocity: Hoàn thiện tính năng, fix bugs và đạt 100% Pass CI.*

**5. Tự đánh giá CMMI**

**5.1 Thang trưởng thành**
Nhóm đang ở mức: **3 - Defined** (Quy trình được định nghĩa rõ ràng, CI/CD toàn diện, tự động hóa 100% quy trình test, kiểm soát rủi ro và chất lượng chặt chẽ).

**5.2 Tự đánh giá theo Process Area (thang 0-5)**

| **Process Area**                                            | **Điểm** | **Bằng chứng** |
| ----------------------------------------------------------- | -------- | -------------- |
| Requirements Management                                     | 4        | Commits/PRs    |
| Project Planning & Monitoring                               | 4        | Sprint Log     |
| Configuration Management                                    | 5        | Git Workflow (tốt) |
| Measurement & Analysis                                      | 4        | GitHub Actions |
| Process & Product Quality Assurance                         | 4        | Tests/SonarQube|
| Verification & Validation                                   | 4        | Auto Tests (100% Pass) |

**6. Tổng kết & cam kết**
Dự án được xây dựng với cường độ cao, triển khai đúng cấu trúc Microservices, sử dụng Git và CI bài bản. Mọi bài kiểm tra đã chạy thành công (Pass full CI), dự án đạt chuẩn SPQM Level 3 với quy trình định nghĩa rõ ràng, quản lý rủi ro tốt và code coverage toàn diện.
Chúng tôi cam kết báo cáo phản ánh trung thực quá trình làm việc và số liệu của nhóm.
