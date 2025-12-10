const { pool } = require('./db');
const bcrypt = require('bcrypt');




// بيانات المستخدم
const email = 'admin@apricus.fi'; // بريد المدير
const newPassword = 'admin123'; // كلمة المرور الجديدة التي تريدها

async function updatePassword() {
    try {
        const hash = await bcrypt.hash(newPassword, 10);
        const [result] = await pool.query(
            'UPDATE users SET password_hash = ? WHERE email = ?',
            [hash, email]
        );
        if (result.affectedRows > 0) {
            console.log('Password updated and encrypted successfully.');
        } else {
            console.log('User not found.');
        }
    } catch (err) {
        console.error('Error updating password:', err);
    } finally {
        pool.end();
    }
}

updatePassword();


