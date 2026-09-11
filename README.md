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
server.js              Điểm khởi chạy Express
routes/site.js          Toàn bộ route của site
views/                  Template EJS (layout dùng chung + từng trang)
public/css/style.css    Toàn bộ style (bảng màu gốm sơn mài, không dùng framework CSS ngoài)
public/js/              JS thuần cho menu mobile, công cụ checklist, tab cửa hàng
data/*.json             Nội dung: checklist nghi lễ, sản phẩm, FAQ — sửa trực tiếp các file này để cập nhật nội dung mà không cần đụng code
```

## Cập nhật nội dung

- Thêm/sửa sản phẩm: sửa `data/products.json`
- Thêm/sửa dịp lễ trong công cụ checklist: sửa `data/checklist.json`
- Thêm/sửa câu hỏi thường gặp: sửa `data/faq.json`
- Icon minh họa dùng chung nằm trong `views/partials/icons.ejs` (sen, hạc, trầm, trúc, mây, phúc, nến, gốm) — có thể thêm icon mới rồi tham chiếu bằng `<use href="#icon-ten-icon">`.

## Việc còn thiếu, cần quyết định thêm trước khi vận hành thật

1. **Thanh toán online**: hiện tại Cửa Hàng ở dạng catalogue — khách bấm "Liên hệ đặt hàng" thay vì thanh toán trực tuyến. Nếu cần giỏ hàng + thanh toán (VNPay, MoMo, ZaloPay...), đây là hạng mục riêng cần tài khoản merchant thật.
2. **Gửi email khi có liên hệ mới**: form liên hệ hiện chỉ ghi log vào `data/lien-he.log`. Cần cấu hình SMTP (Nodemailer) hoặc dịch vụ email thật để nhận thông báo, phải có tài khoản/API key SMTP.
3. **Thông tin liên hệ**: số điện thoại và email ở footer đang là placeholder — cập nhật lại thông tin thật trong `views/partials/footer.ejs`.
4. **Cố vấn văn hóa cụ thể**: trang Về Chúng Tôi mô tả các lĩnh vực cố vấn (nhà nghiên cứu văn hóa, nghệ nhân, chuyên gia tâm lý) nhưng chưa gắn tên thật — điền tên/ảnh thật khi có hợp tác chính thức.
5. **Ảnh sản phẩm thật**: hiện dùng icon minh họa thay ảnh chụp thật (tránh dùng ảnh giả). Khi có ảnh sản phẩm thật, thay `<svg><use href="#icon-...">` trong `views/san-pham.ejs` và `views/cua-hang.ejs` bằng `<img>`.

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
5. Tạo file `.env` thật trên server (dựa theo `.env.example`)
6. Chạy bằng PM2: `pm2 start ecosystem.config.js`
7. Lưu tiến trình để tự khởi động lại khi server reboot: `pm2 save && pm2 startup`
8. Trỏ domain/subdomain về server, cấu hình reverse proxy (Nginx) từ cổng 80/443 sang cổng Node (mặc định 3000), bật SSL (Let's Encrypt/Certbot hoặc SSL có sẵn của Hostinger).

Nếu dùng hosting chia sẻ thông thường (không hỗ trợ Node.js server chạy liên tục), cần build lại site này theo hướng static site (SSG) thay vì Express server.
