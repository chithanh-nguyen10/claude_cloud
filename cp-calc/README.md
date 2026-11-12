# CP Calc

Công cụ cho competitive programming, song ngữ Việt / Anh (nút VI | EN ở góc phải).

| Phần | Cần gì để chạy |
|---|---|
| **Calculator** | Chỉ cần mở `index.html` bằng trình duyệt, không cần mạng |
| **An toàn** | Như trên |
| **Stress test & Benchmark** | Python 3 và g++ hoặc clang++, chạy kèm `runner.py` |

## Mở nhanh

- Chỉ dùng Calculator và An toàn: bấm đúp `index.html`.
- Dùng cả Stress test (Windows): bấm đúp `start-runner.bat`. Trình duyệt tự mở `http://127.0.0.1:8765/#stress`.
- Linux / macOS: chạy lệnh dưới đây trong thư mục `cp-calc`.

```bash
python3 runner.py
```

Tuỳ chọn: `--port 9000` để đổi cổng, `--no-browser` để không tự mở trình duyệt.

## Phần 1: Calculator

- **Máy tính**: mỗi dòng một phép tính, đặt biến `n = 2e5`, số nguyên lớn tính chính xác. `log` là log cơ số 2 (quy ước CP), `ln` là log tự nhiên.
  Hàm có sẵn: `C P fact ! gcd lcm sqrt isqrt d sigma phi isprime primepi maxdiv H sumfloor sumsigma catalan fib partitions bell S1 S2…`
- **Độ phức tạp**: ước lượng thời gian theo Time limit và tốc độ máy chấm (thanh "Máy chấm"), kết luận 🟢 An toàn / 🟡 Sát TL / 🔴 TLE. Có 16 mẫu dựng sẵn, tính ngược n tối đa, bảng so sánh.
- **Tổng & vòng lặp**: harmonic sum, Σ⌊n/i⌋ chính xác (n ≤ 1e14), Σ n/p, tổng tự định nghĩa, đếm vòng lặp lồng nhau (tự suy ra công thức đa thức).
- **Truy hồi & tích phân**: định lý thợ (có trường hợp log mở rộng), Akra–Bazzi, tính trực tiếp T(N), tích phân số.
- **Số học**: phân tích thừa số (Pollard-rho, đến 1e30), d / σ / φ, số ước lớn nhất ≤ N (đến 1e24), π(n) chính xác đến 1e11, Σd(i), Σσ(i).
- **Tổ hợp**: giá trị chính xác, và bảng kiểm tra vét cạn có chạy kịp không.

## Phần 2: An toàn

Kiểm tra tràn số từng bước theo cách C++ tính (int, unsigned, long long, unsigned long long, __int128, double), bảng giới hạn kiểu, kiểm tra phép mod và ước lượng bộ nhớ.

## Phần 3: Stress test & Benchmark

1. Nạp các chương trình: **Code cần kiểm tra** (bắt buộc), **Code trâu**, **Sinh test** (bắt buộc), **Checker**. Mỗi chương trình có thể là C++ hoặc Python, nạp bằng mở file, dán code, hoặc kéo thả.
2. Input / output của từng chương trình: mặc định stdin / stdout. Có thể đổi sang file, vd `BAI.INP` / `BAI.OUT`. Output đem đi so được lấy từ đúng nguồn bạn chọn.
3. Trình sinh test nhận tham số dòng lệnh. `{seed}` và `{i}` được thay bằng seed và số thứ tự test, vd `{seed} 100000`.
4. Biên dịch: chọn g++ / clang++ (hoặc nhập đường dẫn), chuẩn C++ (11/14/17/20/23), mức tối ưu, cờ thêm. Lệnh biên dịch sửa được hoàn toàn:
   `{compiler} -std={std} {opt} {flags} {src} -o {exe}`.
   Trên Windows, cờ mặc định có `-Wl,--stack=268435456` (stack 256MB giống Codeforces).
5. So kết quả:
   - **Có checker**: dùng checker kiểu testlib, gọi `checker input output answer` (thứ tự tham số sửa được), mã thoát 0 là đúng.
   - **Không có checker**: so với output của code trâu theo một trong các kiểu: bỏ qua khoảng trắng (mặc định), theo dòng, chính xác từng byte, số thực với sai số ε.
6. Chế độ:
   - **Stress test**: sinh test ngẫu nhiên liên tục, dừng ở test sai đầu tiên, hiện input, output và đáp án, dòng khác nhau đầu tiên.
   - **Benchmark**: chạy một bộ test cố định (có thể đặt tham số riêng cho từng test, mỗi dòng một test), đo thời gian CPU và bộ nhớ đỉnh, xuất CSV.
7. Kết quả: AC, WA, TLE, MLE, RE (kèm lý do, vd Stack overflow, Access violation), Lỗi trình sinh, Lỗi code trâu, Lỗi checker.

Test sai và test benchmark được lưu trong `cp-calc/work/saved/`.

### Cách đo

- **Windows**: thời gian CPU lấy từ `GetProcessTimes`. Bộ nhớ là đỉnh commit hoặc working set (`GetProcessMemoryInfo`), nên mảng toàn cục khai báo lớn được tính đủ, giống máy chấm chạy Windows.
- **Linux / macOS**: runner tự biên dịch một chương trình C nhỏ để chạy code và đọc `wait4` rusage (thời gian CPU, `ru_maxrss`). Nhờ vậy số đo không bị cộng bộ nhớ của Python.
- Chương trình chạy quá `max(3 × TL, TL + 2s)` thời gian thực, hoặc dùng quá 1.25 × ML bộ nhớ, sẽ bị dừng.

### Bảo mật

Runner chỉ nghe trên `127.0.0.1`, kiểm tra header Host, và yêu cầu một mã bí mật sinh ngẫu nhiên mỗi lần chạy. Mã này được gắn vào trang do chính runner phục vụ, nên trang web khác không gửi code tới runner được.

## Phần 4: Graph Editor

- **Nhập:** mỗi dòng `u v` hoặc `u v w`, một từ là đỉnh lẻ. Tên đỉnh là chữ hay số đều được. Ô **Số đỉnh n** thêm sẵn các đỉnh 1..n (hoặc 0..n−1). Ô **Label đỉnh** nhận mảng `a[i]`, dùng `_` để bỏ qua một đỉnh. Vẽ trên canvas thì ô text tự cập nhật.
- **Tab:** tạo, đổi tên (bấm đúp), nhân bản, đóng.
- **Công cụ** (phím tắt):
  - Di chuyển `V`, Thêm đỉnh/cạnh `A`, Xoá `D`, Tô màu `C`, In đậm `B`, Ghim đỉnh `P`, Bút vẽ `N`, Tẩy `E`, Căn giữa `F`.
  - Bấm đúp vào đỉnh để đổi tên, bấm đúp vào cạnh để sửa trọng số.
  - Lăn chuột để phóng to, kéo nền để cuộn.
- **Chế độ:**
  - Có hướng, Có trọng số, Multiedge, self loop (bấm cùng một đỉnh hai lần khi thêm cạnh).
  - Lock: tắt lực đẩy, mọi đỉnh đứng yên. Edge physics: đỉnh đẩy cả cạnh. Hai phía: tô màu và xếp hai cột.
- **Giao diện:** bán kính đỉnh, cỡ chữ, viền đỉnh, độ dày cạnh, độ dài cạnh, khoảng cách nhãn trọng số, cỡ bút, độ đậm bút, cỡ tẩy, lực đẩy, độ căng.
- **Thuật toán** (bật một cái mỗi lúc; khi không đủ điều kiện, nút ghi rõ lý do):
  - Thành phần liên thông, SCC, Khớp & cầu, MST (forest).
  - Cặp ghép hai phía (Hopcroft–Karp).
  - Topo sort: có nút Thứ tự khác và Lex nhỏ nhất; tên là số thì so theo giá trị số.
  - Đường đi ngắn nhất một nguồn hoặc nhiều nguồn: cạnh không ghi trọng số (hoặc khi tắt "Có trọng số") được tính là 1. Dijkstra, tự chuyển sang Bellman-Ford khi có cạnh âm, đỉnh bị ảnh hưởng hiện −∞.
  - Khoảng cách mọi cặp (Floyd–Warshall, tối đa 400 đỉnh): hiện ma trận khoảng cách, bấm một ô để xem đường đi trên canvas, có nút chép ma trận. Cạnh không có trọng số tính là 1, ô −∞ là cặp đi qua được chu trình âm.
  - Chu trình âm.
- **Xuất:** chép danh sách cạnh (có hoặc không kèm dòng `n m`), tải ảnh PNG.
- **Nối với Stress test:** nút **Mở dạng đồ thị** ở mỗi test. Dòng đầu `n m` (hoặc `n`) của file test được đổi thành ô Số đỉnh, và chỉ m dòng cạnh được lấy vào.

## Cấu trúc thư mục

```
cp-calc/
  index.html          giao diện
  css/app.css
  js/i18n.js          song ngữ
  js/core.js          bộ phân tích biểu thức, số học, tổ hợp
  js/ui.js            tiện ích giao diện
  js/calc.js          Phần 1
  js/safety.js        Phần 2
  js/stress.js        Phần 3 (giao diện)
  js/graph-algos.js   Phần 4 (thuật toán)
  js/graph.js         Phần 4 (canvas, công cụ)
  js/app.js           khởi động
  runner.py           Phần 3 (biên dịch, chạy, đo), chỉ dùng thư viện chuẩn
  start-runner.bat    chạy runner trên Windows
```
