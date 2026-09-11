const express = require('express');
const router = express.Router();

const productStore = require('../lib/productStore');
const orderStore = require('../lib/orderStore');

const SO_LUONG_TOI_DA = 20;

function getCart(req) {
  if (!req.session.cart) req.session.cart = {};
  return req.session.cart;
}

function cartToItems(cart) {
  return Object.entries(cart)
    .map(([slug, soLuong]) => {
      const sp = productStore.getBySlug(slug);
      if (!sp) return null;
      return { ...sp, soLuong, thanhTien: sp.gia * soLuong };
    })
    .filter(Boolean);
}

router.post('/gio-hang/them', (req, res) => {
  const { slug, qty, quay_lai } = req.body;
  const sp = productStore.getBySlug(slug);
  if (sp) {
    const cart = getCart(req);
    const soLuongThem = Math.max(1, Math.min(SO_LUONG_TOI_DA, parseInt(qty, 10) || 1));
    cart[slug] = Math.min(SO_LUONG_TOI_DA, (cart[slug] || 0) + soLuongThem);
  }
  res.redirect(quay_lai && quay_lai.startsWith('/') ? quay_lai : '/gio-hang');
});

router.post('/gio-hang/cap-nhat', (req, res) => {
  const { slug, qty } = req.body;
  const cart = getCart(req);
  const soLuong = parseInt(qty, 10);
  if (!soLuong || soLuong < 1) delete cart[slug];
  else cart[slug] = Math.min(SO_LUONG_TOI_DA, soLuong);
  res.redirect('/gio-hang');
});

router.post('/gio-hang/xoa', (req, res) => {
  const cart = getCart(req);
  delete cart[req.body.slug];
  res.redirect('/gio-hang');
});

router.get('/gio-hang', (req, res) => {
  const items = cartToItems(getCart(req));
  const tongTien = items.reduce((sum, i) => sum + i.thanhTien, 0);
  res.render('gio-hang', {
    title: 'Giỏ hàng | AN TUỆ TRANG',
    description: 'Xem lại sản phẩm trong giỏ hàng trước khi đặt.',
    items,
    tongTien,
  });
});

router.get('/dat-hang', (req, res) => {
  const items = cartToItems(getCart(req));
  if (items.length === 0) return res.redirect('/gio-hang');
  const tongTien = items.reduce((sum, i) => sum + i.thanhTien, 0);
  res.render('dat-hang', {
    title: 'Đặt hàng | AN TUỆ TRANG',
    description: 'Hoàn tất thông tin để đặt hàng — thanh toán khi nhận hàng (COD).',
    items,
    tongTien,
    loi: null,
    da_nhap: {},
  });
});

router.post('/dat-hang', (req, res) => {
  const cart = getCart(req);
  const items = cartToItems(cart);
  if (items.length === 0) return res.redirect('/gio-hang');

  const tongTien = items.reduce((sum, i) => sum + i.thanhTien, 0);
  const { ho_ten, dien_thoai, dia_chi, ghi_chu } = req.body;

  if (!ho_ten || !ho_ten.trim() || !dien_thoai || !dien_thoai.trim() || !dia_chi || !dia_chi.trim()) {
    return res.render('dat-hang', {
      title: 'Đặt hàng | AN TUỆ TRANG',
      description: 'Hoàn tất thông tin để đặt hàng — thanh toán khi nhận hàng (COD).',
      items,
      tongTien,
      loi: 'Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ giao hàng.',
      da_nhap: { ho_ten, dien_thoai, dia_chi, ghi_chu },
    });
  }

  const order = orderStore.createOrder({
    khach: {
      ho_ten: ho_ten.trim(),
      dien_thoai: dien_thoai.trim(),
      dia_chi: dia_chi.trim(),
      ghi_chu: (ghi_chu || '').trim(),
    },
    items,
    tongTien,
  });

  req.session.cart = {};
  res.redirect(`/dat-hang/thanh-cong?ma=${order.ma}`);
});

router.get('/dat-hang/thanh-cong', (req, res) => {
  const order = orderStore.getByMa(req.query.ma);
  if (!order) return res.redirect('/');
  res.render('dat-hang-thanh-cong', {
    title: 'Đặt hàng thành công | AN TUỆ TRANG',
    description: 'Cảm ơn bạn đã đặt hàng tại AN TUỆ TRANG.',
    order,
  });
});

module.exports = router;
