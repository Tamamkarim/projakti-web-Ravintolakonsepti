
const express = require('express');
const router = express.Router();
const { getDishes } = require('./data');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../database/mysql-db');
const { JWT_SECRET } = require('./shared');

// Main route
router.get('/', (req, res) => {
    res.send('Recipe API Endpoint');
});

// تسجيل مستخدم جديد (MySQL فقط)
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // التحقق من المدخلات
        if (!name || !email || !password) {
            return res.status(400).json({ 
                error: 'Kaikki kentät ovat pakollisia' 
            });
        }
        // التحقق من عدم وجود المستخدم مسبقاً
        const existingUser = await db.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ 
                error: 'Sähköposti on jo käytössä' 
            });
        }
        // تشفير كلمة المرور
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);
        // إنشاء المستخدم
        const user = await db.createUser({
            email,
            password_hash,
            name,
            phone: req.body.phone || null,
            is_admin: false
        });
        // إنشاء التوكن
        const token = jwt.sign(
            { 
                id: user.id, 
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
                id: user.id, 
                name: user.name, 
                email: user.email, 
                isAdmin: user.is_admin 
            }, 
            message: 'Rekisteröinti onnistui!' 
        });
    } catch (error) {
        console.error('خطأ في التسجيل:', error);
        res.status(500).json({ 
            error: 'Rekisteröinti epäonnistui'
        });
    }
});

// Recipe management endpoints only (menu endpoints are in menu.js)

module.exports = router;
