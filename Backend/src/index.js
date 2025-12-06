
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const menuRoutes = require('./routers/menu-Routes');
const orderRoutes = require('./routers/order-Routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes

// إضافة مسار الطلبات
app.use('/api/orders', orderRoutes);
app.use('/api/menu', menuRoutes);

// Health check
app.get('/api', (req, res) => {
	res.json({ success: true, message: 'API is working!' });
});

// 404 handler
app.use((req, res) => {
	res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
