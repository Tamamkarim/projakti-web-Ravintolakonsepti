// سكريبت لإضافة مستخدم جديد بكلمة مرور مشفرة في قاعدة البيانات
const db = require('./database/mysql-db');

(async () => {
  await db.addUserWithHashedPassword({
    email: 'admin@email.com',
    password: '123456', // غيّر كلمة المرور إذا أردت
    name: 'Admin',
    phone: '0500000000',
    is_admin: 1,
    is_active: 1
  });
  process.exit();
})();
