require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');

const siteRoutes = require('./routes/site');
const cartRoutes = require('./routes/cart');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'partials/layout');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", 'fonts.googleapis.com'],
      fontSrc: ["'self'", 'fonts.gstatic.com'],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
    },
  },
}));
app.use(compression());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '7d' }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7,
    secure: process.env.COOKIE_SECURE === 'true',
  },
}));

const ASSET_VERSION = Date.now().toString(36);

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.siteName = 'AN TUỆ TRANG';
  res.locals.siteTagline = 'Gìn giữ văn hóa — An yên tâm trí';
  res.locals.assetVersion = ASSET_VERSION;
  const cart = req.session.cart || {};
  res.locals.cartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  next();
});

app.use('/', cartRoutes);
app.use('/', adminRoutes);
app.use('/', siteRoutes);

app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Không tìm thấy trang — AN TUỆ TRANG',
    description: 'Trang bạn tìm không tồn tại hoặc đã được chuyển.',
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  if (err && err.message && (err.code === 'LIMIT_FILE_SIZE' || /^Chỉ chấp nhận ảnh/.test(err.message))) {
    return res.status(400).send(
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Ảnh tải lên quá lớn (tối đa 4MB). Vui lòng quay lại và chọn ảnh nhỏ hơn.'
        : err.message + ' Vui lòng quay lại và thử lại.'
    );
  }
  res.status(500).send('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
});

app.listen(PORT, () => {
  console.log(`AN TUỆ TRANG đang chạy tại http://localhost:${PORT}`);
});
