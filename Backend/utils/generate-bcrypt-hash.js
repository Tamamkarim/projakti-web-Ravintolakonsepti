// استخدم هذا السكريبت لتوليد bcrypt hash لأي كلمة سر
const bcrypt = require('bcrypt');

const password = process.argv[2];
if (!password) {
  console.log('يرجى تمرير كلمة السر كـ argument');
  process.exit(1);
}

bcrypt.hash(password, 10).then(hash => {
  console.log('Bcrypt hash:', hash);
}).catch(err => {
  console.error('خطأ في التشفير:', err);
});
