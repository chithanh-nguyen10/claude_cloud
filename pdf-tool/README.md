# PDF Tách Ghép

Công cụ tách và ghép file PDF chạy ngay trong trình duyệt. File được xử lý trên máy bạn, không tải lên mạng, và chạy được khi không có internet (thư viện đã nằm sẵn trong `lib/`).

## Cách mở

### Windows (khuyên dùng): một file duy nhất

Tải file **`PDF-Tach-Ghep.html`** rồi bấm đúp để mở bằng Edge hoặc Chrome. File này đã chứa sẵn mọi thư viện: không cần thư mục `lib/`, không cần cài gì, không cần mạng. Chép sang USB hay gửi cho người khác chỉ cần đúng một file đó.

Nếu bấm đúp mà Windows mở bằng chương trình khác, bấm chuột phải vào file, chọn **Open with**, rồi chọn **Microsoft Edge** hoặc **Google Chrome**.

Khi sửa mã nguồn (`index.html`), tạo lại file đơn bằng lệnh `python build-standalone.py`.

### Bản nhiều file

Mở file `index.html` bằng Chrome, Edge hoặc Firefox (bấm đúp là được). Muốn dùng trên máy khác thì chép cả thư mục `pdf-tool/`, gồm cả `lib/`.

## Tách trang

1. Mở một file PDF (bấm nút hoặc kéo thả vào cửa sổ).
2. Bấm vào ảnh trang để chọn hoặc bỏ chọn. Giữ `Shift` khi bấm để chọn cả một dải trang, hoặc gõ nhanh `1-3, 5, 8-10` rồi bấm **Chọn**.
3. Bấm biểu tượng kính lúp trên trang để xem lớn (dùng phím ← → để lật trang, `Space` để chọn).
4. Thứ tự nối:
   - **Tăng dần theo số trang** (mặc định).
   - **Theo thứ tự tôi chọn**: theo thứ tự bạn bấm chọn. Có thể kéo các ô "Tr. x" ở cột phải để sắp lại; khi kéo, chế độ này tự bật.
5. Kiểu xuất: gộp các trang đã chọn thành 1 file PDF, hoặc mỗi trang 1 file (tải về một file .zip).

## Ghép file

1. Thêm nhiều file PDF cùng lúc (chọn hoặc kéo thả).
2. Mặc định xếp theo tên tăng dần (A→Z, hiểu số đúng: `2.pdf` đứng trước `10.pdf`).
3. Đổi thứ tự bằng cách kéo tay nắm ⋮⋮ hoặc dùng mũi tên ↑ ↓. Bấm ảnh thu nhỏ để xem trước các trang của file đó.
4. Ô **Trang** của từng file (tuỳ chọn): để trống là lấy cả file, hoặc nhập vd `1-3, 7`.
5. Bấm **Ghép & tải về**.

## Thư viện dùng

- [pdf.js](https://github.com/mozilla/pdf.js) 3.11.174: hiển thị trang
- [pdf-lib](https://github.com/Hopding/pdf-lib) 1.17.1: tách và ghép
- [JSZip](https://github.com/Stuk/jszip) 3.10.1: nén khi xuất mỗi trang 1 file
- [SortableJS](https://github.com/SortableJS/Sortable) 1.15.2: kéo thả sắp xếp

File có mật khẩu cần gỡ mật khẩu trước khi dùng.
