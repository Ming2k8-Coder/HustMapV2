# HustMap V2 - Standalone Interactive Campus Map & A* Navigation

Hệ thống bản đồ số và điều hướng thông minh cho khuôn viên **Đại học Bách Khoa Hà Nội (HUST)**.

Dự án là sự kết hợp tối ưu giữa:
1. **Giao diện & Trải nghiệm 100% nguyên bản của [HustMap.com](https://hustmap.com/)**: Bản đồ vector 3D sắc nét với MapLibre GL JS, font Montserrat tùy biến, sprite SVG, tra cứu phòng học, bãi đỗ xe và giao diện đa ngôn ngữ (VI/EN).
2. **Thuật toán tìm đường thông minh A\* từ [tkproboy-cmd/hustmapfinal](https://github.com/tkproboy-cmd/hustmapfinal)**: Trích xuất toàn bộ mạng lưới đường bộ nội bộ Bách Khoa (88 tuyến đường, 338 nút giao thông) và chuyển đổi thành công cụ tìm đường thuần JavaScript (Client-side A* Graph Router).
3. **Kiến trúc 100% Offline / Standalone**: Toàn bộ dữ liệu vector tiles (`.pbf`), glyph fonts, hình ảnh tòa nhà (`.webp`), cơ sở dữ liệu phòng ban (`.json`) và đồ thị giao thông đều nằm cục bộ tại thư mục `public/`. Không cần phụ thuộc vào bất kỳ server online hay backend nào khi vận hành.

---

## 🌟 Điểm nổi bật & Tính năng chính

### 1. Thuật toán tìm đường thông minh (Client-side A* Routing)
- **Kế thừa từ `algorithm_engine` của `hustmapfinal`**: Mạng lưới đường xá nội bộ HUST được trích xuất từ dữ liệu PostGIS không gian thực tế.
- **Snapping thông minh**: Tự động chiếu vị trí click chuột hoặc GPS của người dùng vào giao lộ gần nhất của mạng lưới.
- **Tính toán lộ trình tức thì**: Tìm đường ngắn nhất qua thuật toán A\* với trọng số khoảng cách thực tế (mét) và ước tính thời gian đi bộ.
- **Hiển thị trực quan**: Vẽ tuyến đường phát sáng (polyline với casing và dash glow) trên bản đồ 3D cùng 2 marker điểm xuất phát (Xanh) và đích đến (Đỏ), tự động zoom vừa vặn (`fitBounds`).
- **Chọn điểm linh hoạt**: Cho phép chọn nhanh từ danh sách 69 tòa nhà hoặc nhấp trực tiếp vào bất kỳ vị trí nào trên bản đồ.

### 2. Tra cứu tòa nhà & phòng học chi tiết
- Click trực tiếp vào tòa nhà bất kỳ (D3, C1, B1, D9, TV Tạ Quang Bửu, KTX...) để xem ảnh chụp thật và số tầng.
- Lọc phòng học theo tầng và phân loại: Phòng học lý thuyết, Phòng thí nghiệm / Nghiên cứu, Văn phòng viện/khoa, Khu tự học.
- Đầy đủ thông tin liên hệ: Số điện thoại văn phòng, Email, Website.

### 3. Tìm kiếm tức thì & Định vị (Quick Search & Locate)
- Thanh tìm kiếm thông minh tìm theo mã phòng (`101`, `CTSV`, `202-D3`), tên tòa nhà (`C1`, `D3`), bãi xe.
- Nút **"Định vị"** chuyển động camera mượt mà (`flyTo`) đến vị trí tìm kiếm.
- Nút **"Tìm đường"** tích hợp ngay trong kết quả tìm kiếm để bắt đầu điều hướng đến mục tiêu trong 1 click.

### 4. Thông tin bãi giữ xe toàn trường
- Bãi đỗ xe máy và ô tô với thông tin chi tiết: Giờ mở cửa, bảng giá có thẻ SV / không thẻ SV, quy định gửi qua đêm.

### 5. Đa ngôn ngữ (Tiếng Việt & English)
- Chuyển đổi ngôn ngữ tức thì giữa Tiếng Việt và Tiếng Anh chỉ với 1 click.

---

## 🏗 Kiến trúc kỹ thuật (Technical Architecture)

```
d:\HustMapV2/
├── public/
│   ├── api_style_vi.json      # Map style tiếng Việt (Local Vector Tiles)
│   ├── api_style_en.json      # Map style tiếng Anh (Local Vector Tiles)
│   ├── campus_roads.json      # 88 tuyến đường nội bộ Bách Khoa (từ PostGIS của hustmapfinal)
│   ├── buildings.json         # Danh mục 69 tòa nhà khuôn viên HUST
│   ├── parkings.json          # Danh mục bãi gửi xe máy & ô tô
│   ├── rooms_all.json         # Cơ sở dữ liệu phòng học và văn phòng HUST
│   ├── tiles/16..18/          # 261 mảnh vector tiles (.pbf) lưu trữ offline
│   ├── fonts/                 # Bộ glyph font Montserrat tùy biến
│   └── building_images/       # Ảnh chụp thực tế các tòa nhà HUST (.webp)
├── src/
│   ├── router.js              # A* Pathfinding Engine thuần JavaScript (Client-side)
│   ├── App.jsx                # Giao diện chính React + MapLibre GL JS + RoutePanel
│   ├── index.css              # Styling TailwindCSS
│   └── main.jsx               # Entry point ứng dụng
└── vite.config.js             # Cấu hình Vite độc lập hoàn toàn (không proxy)
```

---

## 🚀 Hướng dẫn chạy cục bộ (Getting Started)

### Yêu cầu môi trường
- **Node.js**: Phiên bản 18+ trở lên.
- **npm** hoặc **yarn/pnpm**.

### Cài đặt và khởi chạy

1. **Cài đặt thư viện dependencies:**
   ```bash
   npm install
   ```

2. **Chạy ở chế độ phát triển (Development):**
   ```bash
   npm run dev
   ```
   Mở trình duyệt truy cập: [http://localhost:3000](http://localhost:3000)

3. **Đóng gói sản phẩm (Production Build):**
   ```bash
   npm run build
   npm run preview
   ```

---

## 🤝 Ghi nhận & Bản quyền (Credits & Attributions)
- Giao diện, thiết kế UI và dữ liệu khuôn viên gốc: **[HustMap.com](https://hustmap.com/)**.
- Dữ liệu mạng lưới đường bộ và ý tưởng thuật toán A\*: **[tkproboy-cmd/hustmapfinal](https://github.com/tkproboy-cmd/hustmapfinal)**.
- Thư viện bản đồ: **MapLibre GL JS**.
