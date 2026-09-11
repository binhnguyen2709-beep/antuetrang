const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'orders.json');

function readAll() {
  if (!fs.existsSync(FILE)) return [];
  const raw = fs.readFileSync(FILE, 'utf-8').trim();
  if (!raw) return [];
  return JSON.parse(raw);
}

function writeAll(list) {
  fs.writeFileSync(FILE, `${JSON.stringify(list, null, 2)}\n`, 'utf-8');
}

function genMa() {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ATT-${stamp}-${rand}`;
}

function createOrder({ khach, items, tongTien }) {
  const list = readAll();
  const order = {
    ma: genMa(),
    ngay_tao: new Date().toISOString(),
    trang_thai: 'moi',
    khach,
    items: items.map((i) => ({
      slug: i.slug,
      ten: i.ten,
      gia: i.gia,
      so_luong: i.soLuong,
      thanh_tien: i.thanhTien,
    })),
    tong_tien: tongTien,
  };
  list.unshift(order);
  writeAll(list);
  return order;
}

function getByMa(ma) {
  return readAll().find((o) => o.ma === ma) || null;
}

function updateStatus(ma, trangThai) {
  const list = readAll();
  const idx = list.findIndex((o) => o.ma === ma);
  if (idx === -1) return false;
  list[idx].trang_thai = trangThai;
  writeAll(list);
  return true;
}

function removeOrder(ma) {
  const list = readAll();
  const filtered = list.filter((o) => o.ma !== ma);
  writeAll(filtered);
  return filtered.length !== list.length;
}

module.exports = { readAll, createOrder, getByMa, updateStatus, removeOrder };
