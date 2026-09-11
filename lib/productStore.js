const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'products.json');

function readAll() {
  const raw = fs.readFileSync(FILE, 'utf-8');
  return JSON.parse(raw);
}

function writeAll(list) {
  fs.writeFileSync(FILE, `${JSON.stringify(list, null, 2)}\n`, 'utf-8');
}

function getBySlug(slug) {
  return readAll().find((p) => p.slug === slug) || null;
}

function slugify(str) {
  return String(str)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function uniqueSlug(base, list) {
  let slug = base || 'san-pham';
  let i = 2;
  while (list.some((p) => p.slug === slug)) {
    slug = `${base}-${i}`;
    i += 1;
  }
  return slug;
}

function create(data) {
  const list = readAll();
  const slug = uniqueSlug(slugify(data.ten), list);
  const product = {
    slug,
    ten: String(data.ten || '').trim(),
    danh_muc: data.danh_muc,
    icon: data.icon || 'phuc',
    chat_lieu: String(data.chat_lieu || '').trim(),
    mo_ta: String(data.mo_ta || '').trim(),
    gia: Math.max(0, Math.round(Number(data.gia) || 0)),
    hinh_anh: data.hinh_anh || null,
  };
  list.push(product);
  writeAll(list);
  return product;
}

function update(slug, data) {
  const list = readAll();
  const idx = list.findIndex((p) => p.slug === slug);
  if (idx === -1) return null;

  const anhCu = list[idx].hinh_anh;
  list[idx] = {
    ...list[idx],
    ten: String(data.ten || '').trim(),
    danh_muc: data.danh_muc,
    icon: data.icon || list[idx].icon,
    chat_lieu: String(data.chat_lieu || '').trim(),
    mo_ta: String(data.mo_ta || '').trim(),
    gia: Math.max(0, Math.round(Number(data.gia) || 0)),
  };
  if (data.hinh_anh) list[idx].hinh_anh = data.hinh_anh;
  writeAll(list);
  return { product: list[idx], anhCuThayThe: data.hinh_anh ? anhCu : null };
}

function remove(slug) {
  const list = readAll();
  const target = list.find((p) => p.slug === slug);
  const filtered = list.filter((p) => p.slug !== slug);
  writeAll(filtered);
  return target || null;
}

module.exports = { readAll, getBySlug, create, update, remove, slugify };
