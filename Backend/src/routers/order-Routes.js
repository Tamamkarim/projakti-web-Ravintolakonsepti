const express = require('express');
const router = express.Router();
const { getOrders } = require('../controllers/order-Controller');

// Endpoint لجلب الطلبات
router.get('/', getOrders);

module.exports = router;
