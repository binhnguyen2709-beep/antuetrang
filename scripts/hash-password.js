const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.log('Dùng: node scripts/hash-password.js "mat-khau-moi"');
  process.exit(1);
}

console.log(bcrypt.hashSync(password, 10));
