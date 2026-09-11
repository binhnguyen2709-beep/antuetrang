require('dotenv').config();

const path = require('path');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');

const siteRoutes = require('./routes/site');

const app = express();
const PORT = process.env.PORT || 3000;

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

const ASSET_VERSION = Date.now().toString(36);

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.siteName = 'AN TUỆ TRANG';
  res.locals.siteTagline = 'Gìn giữ văn hóa — An yên tâm trí';
  res.locals.assetVersion = ASSET_VERSION;
  next();
});

app.use('/', siteRoutes);

app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Không tìm thấy trang — AN TUỆ TRANG',
    description: 'Trang bạn tìm không tồn tại hoặc đã được chuyển.',
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
});

app.listen(PORT, () => {
  console.log(`AN TUỆ TRANG đang chạy tại http://localhost:${PORT}`);
});
