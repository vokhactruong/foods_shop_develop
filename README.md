# 🍿 Snack Shop — Hệ thống đặt đồ ăn vặt qua QR

## Cấu trúc project

```
snack-shop/
├── backend/           # Node.js + Express + MongoDB + Socket.IO
├── frontend-customer/ # React app (khách hàng quét QR đặt món)
└── frontend-kitchen/  # React app (màn hình bếp nhận đơn real-time)
```

## Cài đặt & Chạy

### 1. Yêu cầu
- Node.js >= 18
- MongoDB (local hoặc MongoDB Atlas)

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env   # Điền MONGODB_URI và JWT_SECRET
npm run dev
```
Backend chạy tại: http://localhost:5000

### 3. Frontend khách hàng
```bash
cd frontend-customer
npm install
npm run dev
```
Chạy tại: http://localhost:5173

Khách hàng truy cập: http://localhost:5173/order?table=1

### 4. Frontend bếp
```bash
cd frontend-kitchen
npm install
npm run dev
```
Chạy tại: http://localhost:5174

### 5. Tạo QR code cho từng bàn
Truy cập: http://localhost:5174/admin/qr

---

## Luồng hoạt động

1. Chủ quán in QR code cho từng bàn (từ trang admin)
2. Khách quét QR → mở trang menu trên điện thoại
3. Khách chọn món → bấm Đặt món → đơn gửi lên backend
4. Backend lưu MongoDB + emit Socket.IO event
5. Màn hình bếp nhận real-time → chuyển trạng thái (Mới → Đang làm → Xong)

## API Endpoints

| Method | URL | Mô tả |
|--------|-----|-------|
| GET | /api/menu | Lấy danh sách món |
| POST | /api/menu | Thêm món (admin) |
| PUT | /api/menu/:id | Sửa món (admin) |
| DELETE | /api/menu/:id | Xóa món (admin) |
| GET | /api/orders | Lấy danh sách đơn |
| POST | /api/orders | Tạo đơn mới |
| PUT | /api/orders/:id/status | Cập nhật trạng thái đơn |
| GET | /api/tables | Lấy danh sách bàn |
| POST | /api/tables | Thêm bàn |

## Socket.IO Events

| Event | Chiều | Mô tả |
|-------|-------|-------|
| `new_order` | Server → Kitchen | Có đơn mới |
| `order_updated` | Server → All | Trạng thái đơn thay đổi |
| `join_kitchen` | Client → Server | Bếp kết nối |
