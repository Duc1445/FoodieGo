# PDR-001: No Guest Checkout Support

## Goal
Quyết định về việc FoodieGo có hỗ trợ khách hàng không có tài khoản (Guest) thực hiện thanh toán hay không.

## Status
Approved / Frozen

## Context
Nền tảng Food Delivery cần thu thập địa chỉ giao hàng chính xác, số điện thoại người nhận để Shipper có thể liên lạc, và lịch sử đơn hàng để đối soát thanh toán trực tuyến. Việc hỗ trợ Guest Checkout tạo ra rủi ro cao về Boom hàng (đặt ảo) và khó khăn trong việc Customer Support theo dõi đơn.

## Decision
**FoodieGo KHÔNG hỗ trợ Guest Checkout.** Mọi khách hàng bắt buộc phải tạo tài khoản (Login/OTP) trước khi tiến hành thêm món vào giỏ hàng và thanh toán.

## Business Impact
- **Tradeoff:** Có thể làm giảm Conversion Rate ở những khách hàng lười tạo tài khoản.
- **Lợi ích:** Đảm bảo chất lượng đơn hàng, giảm rủi ro boom hàng, bảo mật dữ liệu giao hàng và hỗ trợ cá nhân hóa (Recommendation) tốt hơn.

## Alternatives Considered
- *Guest Checkout với SĐT:* Vẫn phải xác thực OTP, vô tình biến quá trình Guest Checkout dài tương đương việc đăng ký tài khoản. Do đó, việc đăng ký tài khoản từ đầu là hợp lý hơn.