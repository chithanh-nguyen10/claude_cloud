# CP Tracker

Phần mềm Windows để quản lý bài lập trình thi đấu: một **Queue** bài đang làm, một **Kho bài thú vị** kèm ghi chú và lời giải, và các **bộ sưu tập** do bạn tự đặt.

## Cài đặt (Windows 10 / 11)

Tải một trong ba file dưới đây ở mục **Artifacts** của lần build mới nhất trong tab **Actions** của repo (workflow "CP Tracker - Windows build"), hoặc ở trang **Releases** nếu đã phát hành:

| File | Dùng khi |
|---|---|
| `CP Tracker_x.y.z_x64-setup.exe` | Cài bình thường (khuyên dùng). Không cần quyền admin |
| `CP Tracker_x.y.z_x64_en-US.msi` | Cài bằng MSI (máy công ty / trường) |
| `CP-Tracker-portable.exe` | Không cần cài, bấm đúp là chạy (cần WebView2, có sẵn trên Windows 10/11) |

Windows có thể hiện cảnh báo SmartScreen vì file chưa được ký số. Khi đó bấm **More info** rồi **Run anyway**.

## Dùng thế nào

- **Thêm bài:** dán link vào ô trên cùng rồi Enter. Hoặc bấm Ctrl+V ở bất kỳ đâu ngoài ô nhập. Hoặc dùng "Thêm nhiều" để dán nhiều link, mỗi dòng một link.
  - Viết tắt kiểu `CF1900A` cũng được.
  - Đang ở trang nào thì bài được thêm vào trang đó (Queue, Kho, hay một Bộ sưu tập).
- **Queue:**
  - Kéo ⋮⋮ để xếp thứ tự ưu tiên.
  - **Làm bài tiếp theo** mở đề bài đầu tiên chưa làm và chuyển bài đó sang "Đang làm".
  - **Dọn bài đã xong** bỏ các bài Đã AC / Bỏ qua khỏi Queue.
- **Trạng thái** (đánh dấu tay): Chưa làm, Đang làm, Bí, Đã AC, Bỏ qua. Đổi ngay ở danh sách hoặc ở bảng chi tiết.
- **Kho bài thú vị:**
  - Bấm ☆ để đưa bài vào kho. Chấm 1 đến 5 sao.
  - Gắn tag riêng, viết ghi chú bằng Markdown, dán code lời giải (có tô màu), lưu link editorial.
- **Bộ sưu tập:** bấm `+` ở thanh bên để tạo, bấm đúp để đổi tên. Mở một bài rồi chọn bộ sưu tập để thêm vào.
- **Tìm kiếm và lọc:** tìm trong tên, mã bài, tag, ghi chú. Lọc theo nền tảng, trạng thái, tag. Sắp xếp theo độ khó, ngày thêm, ngày AC, số sao.
- **Phím tắt:** `/` để tìm, `n` để nhập link mới, bấm đúp một dòng để mở đề.

## Nền tảng hỗ trợ

| Nền tảng | Tự lấy thông tin |
|---|---|
| Codeforces | tên, rating, tag |
| AtCoder | tên, độ khó (theo AtCoder Problems) |
| DMOJ | tên, điểm, loại bài |
| CodeChef | tên, độ khó, tag |
| oj.uz | tên |
| VNOJ, CS Academy, Codeforces Gym | mã bài lấy từ link, tên bài sửa tay (các trang này chặn chương trình đọc tự động) |

Link của trang khác vẫn thêm được, dưới dạng "Other".

## Dữ liệu

- Toàn bộ dữ liệu nằm trong **một file JSON** trên máy, mặc định ở `%APPDATA%\io.github.cptracker\cp-tracker.json`.
- Mỗi ngày tự sao lưu một bản vào thư mục `backups`, giữ 14 ngày gần nhất.
- **Cài đặt → Đổi thư mục** để chuyển dữ liệu vào OneDrive hoặc Google Drive, dùng chung giữa nhiều máy.
- **Xuất JSON** (đầy đủ), **xuất CSV** (mở bằng Excel), **nhập JSON** (gộp hoặc thay thế).

## Phát triển

```
cp-tracker/
  src/              giao diện (HTML/CSS/JS thuần, mở index.html bằng trình duyệt để xem thử)
    js/platforms.js nhận diện link và lấy thông tin bài
    js/store.js     dữ liệu, xuất/nhập
    js/app.js       giao diện
  src-tauri/        phần Rust: lưu file, sao lưu, gọi mạng, hộp thoại, mở trình duyệt
```

Cần Node.js 18 trở lên và Rust.

```bash
npm install
```

Chạy thử:

```bash
npx tauri dev
```

Tạo bộ cài (trên Windows):

```bash
npx tauri build
```

Workflow `.github/workflows/cp-tracker-windows.yml` tự build trên Windows mỗi lần đổi code trong `cp-tracker/`. Đẩy tag `cp-tracker-v0.1.0` thì workflow tạo luôn một Release.
