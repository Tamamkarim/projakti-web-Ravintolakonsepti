
const express = require('express');
const router = express.Router();
const { getDishes } = require('./data');

// Main route
router.get('/', (req, res) => {
    res.send('Recipe API Endpoint');
});

// Recipe management endpoints only (menu endpoints are in menu.js)

module.exports = router;
