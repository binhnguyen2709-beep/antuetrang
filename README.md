# AN TUỆ TRANG

Website thương hiệu AN TUỆ TRANG — Tâm linh, Văn hóa, Lễ nghi theo định hướng nhân văn, thẩm mỹ và không mê tín. Xây dựng bằng Node.js + Express + EJS.

## Chạy thử ở local

```bash
npm install
cp .env.example .env
npm run dev
```

Mở http://localhost:3000

## Cấu trúc dự án

```
server.js                Điểm khởi chạy Express (session, static, routes, error handling)
routes/site.js           Route các trang nội dung công khai
routes/cart.js           Giỏ hàng + đặt hàng (COD)
routes/admin.js          Đăng nhập admin + quản lý sản phẩm/đơn hàng (CRUD)
lib/productStore.js      Đọc/ghi data/products.json, sinh slug
lib/orderStore.js        Đọc/ghi data/orders.json, sinh mã đơn
lib/upload.js            Cấu hình multer để upload ảnh sản phẩm
lib/constants.js         Danh mục cửa hàng + danh sách icon dùng chung
views/                   Template EJS (layout công khai + layout admin riêng)
public/css/style.css     Toàn bộ style (bảng màu gốm sơn mài, không dùng framework CSS ngoài)
public/js/               JS thuần cho menu mobile, checklist, tab cửa hàng
public/images/products/  Ảnh sản phẩm do admin upload (không nằm trong git, xem phần Sao lưu)
data/*.json              Nội dung: checklist, sản phẩm, FAQ, đơn hàng
```

## Cập nhật nội dung

- Sản phẩm (thêm/sửa/xóa, kèm ảnh): dùng **trang quản trị** tại `/admin` (xem bên dưới) — không cần sửa file tay nữa.
- Thêm/sửa dịp lễ trong công cụ checklist: sửa `data/checklist.json`
- Thêm/sửa câu hỏi thường gặp: sửa `data/faq.json`
- Icon minh họa dùng chung nằm trong `views/partials/icons.ejs` (sen, hạc, trầm, trúc, mây, phúc, nến, gốm) — có thể thêm icon mới rồi tham chiếu bằng `<use href="#icon-ten-icon">`.

## Giỏ hàng & đặt hàng

Khách chọn sản phẩm → giỏ hàng (lưu theo session trình duyệt, không cần đăng nhập) → điền thông tin giao hàng tại `/dat-hang` → đơn hàng được ghi vào `data/orders.json` với mã đơn dạng `ATT-YYYYMMDD-XXXX`. Đây là mô hình **thanh toán khi nhận hàng (COD)** — chưa tích hợp cổng thanh toán online (VNPay/MoMo/ZaloPay...). Nếu cần thanh toán online thật, đó là hạng mục riêng cần tài khoản merchant và có thể trao đổi thêm sau.

## Trang quản trị (Admin)

Truy cập tại `/admin`, đăng nhập bằng `ADMIN_USERNAME` / mật khẩu tương ứng `ADMIN_PASSWORD_HASH` trong `.env`.

- **Sản phẩm**: thêm/sửa/xóa, có thể upload ảnh thật (JPG/PNG/WEBP, tối đa 4MB) — nếu không có ảnh, hệ thống dùng icon minh họa mặc định.
- **Đơn hàng**: xem danh sách đơn khách đặt, đánh dấu "Đã xử lý".

**Đổi mật khẩu admin:**
```bash
node scripts/hash-password.js "mat-khau-moi-cua-ban"
```
Copy chuỗi hash in ra, dán vào `ADMIN_PASSWORD_HASH` trong `.env`, rồi khởi động lại server.

⚠️ Mật khẩu admin mặc định được tạo ngẫu nhiên khi dựng project — đã gửi riêng cho bạn trong hội thoại lúc bàn giao. Đổi ngay mật khẩu này trước khi đưa site lên môi trường thật.

## Sao lưu dữ liệu "sống"

`data/products.json`, `data/orders.json`, `public/images/products/*` là dữ liệu thay đổi khi vận hành (qua trang admin và khi khách đặt hàng) — trong đó `orders.json` và ảnh upload **không được đưa lên GitHub** (chứa thông tin khách hàng / dung lượng lớn, xem `.gitignore`). Trên server thật, nên sao lưu định kỳ 3 mục này riêng (ví dụ rsync hoặc cron nén gửi email/lưu trữ ngoài), vì `git pull` sau này sẽ không khôi phục được chúng.

## Việc còn thiếu, cần quyết định thêm trước khi vận hành thật

1. **Thanh toán online thật** (VNPay/MoMo/ZaloPay...) — hiện là COD, xem mục Giỏ hàng ở trên.
2. **Gửi email khi có liên hệ mới / đơn hàng mới**: hiện chỉ ghi log/file JSON, chưa gửi email thật. Cần cấu hình SMTP (Nodemailer) hoặc dịch vụ email, phải có tài khoản/API key SMTP.
3. **Thông tin liên hệ**: số điện thoại và email ở footer đang là placeholder — cập nhật lại thông tin thật trong `views/partials/footer.ejs`.
4. **Cố vấn văn hóa cụ thể**: trang Về Chúng Tôi mô tả các lĩnh vực cố vấn (nhà nghiên cứu văn hóa, nghệ nhân, chuyên gia tâm lý) nhưng chưa gắn tên thật — điền tên/ảnh thật khi có hợp tác chính thức.
5. **Ảnh sản phẩm thật**: đã có thể upload qua `/admin` — chỉ cần bạn tự thêm ảnh cho từng sản phẩm hiện có (14 sản phẩm mẫu ban đầu vẫn đang dùng icon minh họa).

## Đưa code lên GitHub

```bash
git init
git add .
git commit -m "Initial commit: AN TUE TRANG website"
git branch -M main
git remote add origin <URL_REPO_CUA_BAN>
git push -u origin main
```

## Deploy lên Hostinger (VPS / gói hỗ trợ Node.js app)

1. SSH vào server Hostinger.
2. Cài Node.js (>=18) và PM2: `npm install -g pm2`
3. Clone repo hoặc kéo code lên: `git clone <URL_REPO> && cd an-tue-trang`
4. Cài dependency: `npm install --production`
5. Tạo file `.env` thật trên server (dựa theo `.env.example`) — nhớ đặt `SESSION_SECRET` riêng (không dùng chung với máy dev) và `ADMIN_PASSWORD_HASH` mới (xem mục Trang quản trị).
6. Chạy bằng PM2: `pm2 start ecosystem.config.js`
7. Lưu tiến trình để tự khởi động lại khi server reboot: `pm2 save && pm2 startup`
8. Trỏ domain/subdomain về server, cấu hình reverse proxy (Nginx) từ cổng 80/443 sang cổng Node (mặc định 3000), bật SSL (Let's Encrypt/Certbot hoặc SSL có sẵn của Hostinger).
9. Sau khi SSL hoạt động, đặt `COOKIE_SECURE=true` và `TRUST_PROXY=true` trong `.env` trên server rồi khởi động lại (`pm2 restart an-tue-trang`) — nếu không, cookie đăng nhập admin/giỏ hàng có thể không hoạt động đúng qua HTTPS phía sau Nginx.

Nếu dùng hosting chia sẻ thông thường (không hỗ trợ Node.js server chạy liên tục), cần build lại site này theo hướng static site (SSG) thay vì Express server.
