const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const router = express.Router();

const productStore = require('../lib/productStore');
const orderStore = require('../lib/orderStore');
const { upload, removeImage } = require('../lib/upload');
const { DANH_MUC_SHOP, ICON_OPTIONS } = require('../lib/constants');

function ensureCsrf(req) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(24).toString('hex');
  }
  return req.session.csrfToken;
}

function checkCsrf(req, res, next) {
  if (req.body._csrf && req.body._csrf === req.session.csrfToken) return next();
  if (req.file) removeImage(req.file.filename);
  res.status(403).send('Phiên làm việc đã hết hạn hoặc không hợp lệ. Vui lòng tải lại trang và thử lại.');
}

function requireAdmin(req, res, next) {
  if (req.session.isAdmin) return next();
  res.redirect('/admin/login');
}

router.get('/admin/login', (req, res) => {
  if (req.session.isAdmin) return res.redirect('/admin');
  res.render('admin/login', {
    title: 'Đăng nhập quản trị | AN TUỆ TRANG',
    description: 'Khu vực quản trị nội bộ AN TUỆ TRANG.',
    layout: 'partials/admin-layout',
    showNav: false,
    loi: null,
    csrfToken: ensureCsrf(req),
  });
});

router.post('/admin/login', checkCsrf, (req, res) => {
  const { username, password } = req.body;
  const tenDung = username === process.env.ADMIN_USERNAME;
  const matKhauDung =
    tenDung && process.env.ADMIN_PASSWORD_HASH
      ? bcrypt.compareSync(password || '', process.env.ADMIN_PASSWORD_HASH)
      : false;

  if (tenDung && matKhauDung) {
    req.session.isAdmin = true;
    return res.redirect('/admin');
  }

  res.render('admin/login', {
    title: 'Đăng nhập quản trị | AN TUỆ TRANG',
    description: 'Khu vực quản trị nội bộ AN TUỆ TRANG.',
    layout: 'partials/admin-layout',
    showNav: false,
    loi: 'Sai tên đăng nhập hoặc mật khẩu.',
    csrfToken: ensureCsrf(req),
  });
});

router.post('/admin/logout', requireAdmin, checkCsrf, (req, res) => {
  req.session.isAdmin = false;
  res.redirect('/admin/login');
});

router.get('/admin', requireAdmin, (req, res) => {
  const products = productStore.readAll();
  res.render('admin/dashboard', {
    title: 'Quản trị sản phẩm | AN TUỆ TRANG',
    description: 'Khu vực quản trị nội bộ AN TUỆ TRANG.',
    layout: 'partials/admin-layout',
    showNav: true,
    products,
    danhMucShop: DANH_MUC_SHOP,
    csrfToken: ensureCsrf(req),
  });
});

router.get('/admin/san-pham/moi', requireAdmin, (req, res) => {
  res.render('admin/product-form', {
    title: 'Thêm sản phẩm | AN TUỆ TRANG',
    description: 'Khu vực quản trị nội bộ AN TUỆ TRANG.',
    layout: 'partials/admin-layout',
    showNav: true,
    sp: null,
    danhMucShop: DANH_MUC_SHOP,
    iconOptions: ICON_OPTIONS,
    loi: null,
    csrfToken: ensureCsrf(req),
  });
});

router.post('/admin/san-pham/moi', requireAdmin, upload.single('hinh_anh'), checkCsrf, (req, res) => {
  const { ten, danh_muc, chat_lieu, mo_ta, gia, icon } = req.body;

  if (!ten || !ten.trim() || !danh_muc || !gia) {
    if (req.file) removeImage(req.file.filename);
    return res.render('admin/product-form', {
      title: 'Thêm sản phẩm | AN TUỆ TRANG',
      description: 'Khu vực quản trị nội bộ AN TUỆ TRANG.',
    layout: 'partials/admin-layout',
      showNav: true,
      sp: req.body,
      danhMucShop: DANH_MUC_SHOP,
      iconOptions: ICON_OPTIONS,
      loi: 'Vui lòng điền đầy đủ Tên sản phẩm, Danh mục và Giá.',
      csrfToken: ensureCsrf(req),
    });
  }

  productStore.create({
    ten,
    danh_muc,
    chat_lieu,
    mo_ta,
    gia,
    icon,
    hinh_anh: req.file ? req.file.filename : null,
  });

  res.redirect('/admin');
});

router.get('/admin/san-pham/:slug/sua', requireAdmin, (req, res, next) => {
  const sp = productStore.getBySlug(req.params.slug);
  if (!sp) return next();
  res.render('admin/product-form', {
    title: `Sửa: ${sp.ten} | AN TUỆ TRANG`,
    description: 'Khu vực quản trị nội bộ AN TUỆ TRANG.',
    layout: 'partials/admin-layout',
    showNav: true,
    sp,
    danhMucShop: DANH_MUC_SHOP,
    iconOptions: ICON_OPTIONS,
    loi: null,
    csrfToken: ensureCsrf(req),
  });
});

router.post('/admin/san-pham/:slug/sua', requireAdmin, upload.single('hinh_anh'), checkCsrf, (req, res, next) => {
  const existing = productStore.getBySlug(req.params.slug);
  if (!existing) return next();

  const { ten, danh_muc, chat_lieu, mo_ta, gia, icon } = req.body;

  if (!ten || !ten.trim() || !danh_muc || !gia) {
    if (req.file) removeImage(req.file.filename);
    return res.render('admin/product-form', {
      title: `Sửa: ${existing.ten} | AN TUỆ TRANG`,
      description: 'Khu vực quản trị nội bộ AN TUỆ TRANG.',
    layout: 'partials/admin-layout',
      showNav: true,
      sp: { ...existing, ...req.body },
      danhMucShop: DANH_MUC_SHOP,
      iconOptions: ICON_OPTIONS,
      loi: 'Vui lòng điền đầy đủ Tên sản phẩm, Danh mục và Giá.',
      csrfToken: ensureCsrf(req),
    });
  }

  const ketQua = productStore.update(req.params.slug, {
    ten,
    danh_muc,
    chat_lieu,
    mo_ta,
    gia,
    icon,
    hinh_anh: req.file ? req.file.filename : null,
  });

  if (ketQua && ketQua.anhCuThayThe) removeImage(ketQua.anhCuThayThe);

  res.redirect('/admin');
});

router.post('/admin/san-pham/:slug/xoa', requireAdmin, checkCsrf, (req, res) => {
  const removed = productStore.remove(req.params.slug);
  if (removed && removed.hinh_anh) removeImage(removed.hinh_anh);
  res.redirect('/admin');
});

router.get('/admin/don-hang', requireAdmin, (req, res) => {
  const orders = orderStore.readAll();
  res.render('admin/don-hang', {
    title: 'Đơn hàng | AN TUỆ TRANG',
    description: 'Khu vực quản trị nội bộ AN TUỆ TRANG.',
    layout: 'partials/admin-layout',
    showNav: true,
    orders,
    csrfToken: ensureCsrf(req),
  });
});

router.post('/admin/don-hang/:ma/xu-ly', requireAdmin, checkCsrf, (req, res) => {
  orderStore.updateStatus(req.params.ma, 'da_xu_ly');
  res.redirect('/admin/don-hang');
});

router.post('/admin/don-hang/:ma/xoa', requireAdmin, checkCsrf, (req, res) => {
  orderStore.removeOrder(req.params.ma);
  res.redirect('/admin/don-hang');
});

module.exports = router;
