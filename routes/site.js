const express = require('express');
const fs = require('fs');
const path = require('path');

const productStore = require('../lib/productStore');
const { DANH_MUC_SHOP } = require('../lib/constants');

const router = express.Router();

function loadJSON(file) {
  const raw = fs.readFileSync(path.join(__dirname, '..', 'data', file), 'utf-8');
  return JSON.parse(raw);
}

function getData() {
  return {
    checklist: loadJSON('checklist.json'),
    products: productStore.readAll(),
    faq: loadJSON('faq.json'),
  };
}

router.get('/', (req, res) => {
  const { products } = getData();
  const noiBat = products.filter((p) =>
    ['tuong-sen-go-mit', 'bo-do-tho-gom-men-ngoc', 'tram-huong-nguyen-mieng', 'nen-thom-tinh-tam-sen'].includes(p.slug)
  );
  res.render('home', {
    title: 'AN TUỆ TRANG — Gìn giữ văn hóa, An yên tâm trí',
    description:
      'AN TUỆ TRANG đồng hành cùng bạn trong các nghi lễ truyền thống Việt Nam theo hướng nhân văn, thẩm mỹ, không mê tín — cùng vật phẩm văn hóa và không gian thờ cúng tinh tế.',
    noiBat,
  });
});

router.get('/so-tay-le-nghi', (req, res) => {
  const { checklist } = getData();
  const nhomLe = ['Nghi lễ Vòng đời', 'Nghi lễ Sống & Tưởng nhớ', 'Nghi lễ Theo mùa'];
  const theoNhom = nhomLe.map((ten) => ({
    ten,
    danhSach: checklist.filter((c) => c.nhom_le === ten),
  }));
  res.render('so-tay-le-nghi', {
    title: 'Sổ Tay Lễ Nghi — Hướng dẫn nghi lễ truyền thống | AN TUỆ TRANG',
    description:
      'Hướng dẫn chuẩn mực các nghi lễ Vòng đời, Tưởng nhớ và Theo mùa của người Việt — kèm công cụ checklist chuẩn bị lễ vật, không mê tín, không rườm rà.',
    theoNhom,
    checklist,
  });
});

router.get('/cua-hang', (req, res) => {
  const { products } = getData();
  const theoDanhMuc = DANH_MUC_SHOP.map((dm) => ({
    ...dm,
    sanPham: products.filter((p) => p.danh_muc === dm.slug),
  }));
  res.render('cua-hang', {
    title: 'Cửa Hàng — Vật phẩm văn hóa & thờ cúng tinh tế | AN TUỆ TRANG',
    description:
      'Không gian thờ cúng, quà tặng văn hóa, sản phẩm thư giãn tĩnh tâm và vàng mã tối giản — chất liệu rõ ràng, ý nghĩa biểu tượng, không cam kết đổi vận.',
    danhMucShop: DANH_MUC_SHOP,
    theoDanhMuc,
  });
});

router.get('/cua-hang/:slug', (req, res, next) => {
  const { products } = getData();
  const sp = products.find((p) => p.slug === req.params.slug);
  if (!sp) return next();
  const danhMuc = DANH_MUC_SHOP.find((d) => d.slug === sp.danh_muc);
  const lienQuan = products.filter((p) => p.danh_muc === sp.danh_muc && p.slug !== sp.slug).slice(0, 3);
  res.render('san-pham', {
    title: `${sp.ten} | AN TUỆ TRANG`,
    description: sp.mo_ta,
    sp,
    danhMuc,
    lienQuan,
  });
});

router.get('/goc-van-hoa', (req, res) => {
  res.render('goc-van-hoa', {
    title: 'Góc Văn Hóa — Biểu tượng, Tâm lý & Phong thủy | AN TUỆ TRANG',
    description:
      'Tri thức chuẩn mực về biểu tượng văn hóa Á Đông, góc nhìn tâm lý tinh thần và phong thủy không gian sống — phân biệt rõ tri thức truyền thống và trải nghiệm cá nhân.',
  });
});

router.get('/ve-chung-toi', (req, res) => {
  res.render('ve-chung-toi', {
    title: 'Về Chúng Tôi | AN TUỆ TRANG',
    description:
      'Câu chuyện thương hiệu, triết lý "Tâm linh Văn minh" và đội ngũ cố vấn văn hóa đứng sau AN TUỆ TRANG.',
  });
});

router.get('/ho-tro-lien-he', (req, res) => {
  const { faq } = getData();
  res.render('ho-tro', {
    title: 'Hỗ Trợ & Liên Hệ | AN TUỆ TRANG',
    description:
      'Tư vấn nghi lễ, chuẩn bị mâm cúng, chính sách đổi trả - giao hàng và câu hỏi thường gặp về AN TUỆ TRANG.',
    faq,
    sent: false,
  });
});

router.post('/ho-tro-lien-he', (req, res) => {
  const { faq } = getData();
  const { ho_ten, dien_thoai, noi_dung } = req.body;

  if (ho_ten && noi_dung) {
    const logLine = `${new Date().toISOString()} | ${ho_ten} | ${dien_thoai || ''} | ${String(noi_dung).replace(/\r?\n/g, ' ')}\n`;
    const logPath = path.join(__dirname, '..', 'data', 'lien-he.log');
    fs.appendFile(logPath, logLine, () => {});
  }

  res.render('ho-tro', {
    title: 'Hỗ Trợ & Liên Hệ | AN TUỆ TRANG',
    description: 'Tư vấn nghi lễ, chuẩn bị mâm cúng, chính sách đổi trả - giao hàng và câu hỏi thường gặp.',
    faq,
    sent: true,
  });
});

router.get('/robots.txt', (req, res) => {
  res.type('text/plain').send('User-agent: *\nAllow: /\nSitemap: /sitemap.xml\n');
});

router.get('/sitemap.xml', (req, res) => {
  const { products } = getData();
  const staticUrls = [
    '/', '/so-tay-le-nghi', '/cua-hang', '/goc-van-hoa', '/ve-chung-toi', '/ho-tro-lien-he',
  ];
  const productUrls = products.map((p) => `/cua-hang/${p.slug}`);
  const urls = [...staticUrls, ...productUrls];
  const body = urls
    .map((u) => `  <url><loc>${req.protocol}://${req.get('host')}${u}</loc></url>`)
    .join('\n');
  res.type('application/xml').send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`
  );
});

module.exports = router;
