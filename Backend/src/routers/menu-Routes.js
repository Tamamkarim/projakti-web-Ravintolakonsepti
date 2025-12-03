
const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu-Controller');

// مثال: جلب كل عناصر المنيو
router.get('/', menuController.getAllMenuItems);

// يمكنك إضافة المزيد من المسارات (routes) هنا

module.exports = router;
