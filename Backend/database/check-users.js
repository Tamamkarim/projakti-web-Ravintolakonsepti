
require('dotenv').config({ path: '../.env' });
const { pool } = require('./db');

async function checkUsers() {
  try {
    const [rows] = await pool.query(
      'SELECT user_id, email, is_active, password_hash FROM users'
    );
    console.log('المستخدمون:');
    rows.forEach(user => {
      console.log(`ID: ${user.user_id}, Email: ${user.email}, Active: ${user.is_active}, Password Hash: ${user.password_hash}`);
    });
    process.exit(0);
  } catch (err) {
    console.error('خطأ في جلب المستخدمين:', err);
    process.exit(1);
  }
}

checkUsers();
