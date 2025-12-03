// login.js - user login route with MySQL
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../database/mysql-db');
const { JWT_SECRET } = require('./shared');

// تسجيل دخول
router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // التحقق من المدخلات
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Sähköposti ja salasana ovat pakollisia' 
      });
    }
    
    // البحث عن المستخدم
    const user = await db.getUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Kirjautumistiedot ovat virheelliset' 
      });
    }
    
    // التحقق من كلمة المرور
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Kirjautumistiedot ovat virheelliset' 
      });
    }
    
    // تحديث آخر تسجيل دخول
    await db.updateLastLogin(user.user_id);
    
    // إنشاء التوكن
    const token = jwt.sign(
      { 
        id: user.user_id, 
        name: user.name, 
        email: user.email, 
        isAdmin: user.is_admin 
      }, 
      JWT_SECRET, 
      { expiresIn: '1d' }
    );
    
    res.json({ 
      token, 
      user: { 
        id: user.user_id, 
        name: user.name, 
        email: user.email, 
        isAdmin: user.is_admin 
      }, 
      message: 'Kirjautuminen onnistui!' 
    });
  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    res.status(500).json({ 
      error: 'Kirjautuminen epäonnistui' 
    });
  }
});

module.exports = router;
