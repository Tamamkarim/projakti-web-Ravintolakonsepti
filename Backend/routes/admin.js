const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./shared');
const {
    getDishes,
    addDish,
    updateDish,
    deleteDish,
    getOrders,
    addOrder,
    updateOrder,
    getSettings,
    updateSettings
} = require('./data');

let orders = [
    {
        id: 1,
        customerId: 1,
        customerName: 'Testi Asiakas',
        status: 'pending',
        items: [
            { id: 1, name: 'Riisiruoka (Kabsa)', quantity: 2, price: 15.90 },
            { id: 2, name: 'Tuore salaatti', quantity: 1, price: 12.50 }
        ],
        total: 44.30,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 2,
        customerId: 2,
        customerName: 'Toinen Asiakas',
        status: 'preparing',
        items: [
            { id: 3, name: 'Grilliliha riisillä', quantity: 1, price: 18.90 }
        ],
        total: 18.90,
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
        updatedAt: new Date(Date.now() - 1800000)  // 30 min ago
    }
];

let settings = {
    name: 'Apricus Kahvila & Ravintola',
    phone: '+358 406745768',
    email: 'TK@apricus.fi',
    address: 'mellunkyläntie 6, 00920 Helsinki',
};

let nextDishId = 4;
let nextOrderId = 3;

// Middleware to verify admin token
function authMiddleware(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization token required' });
    }

    try {
        const token = auth.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        
        if (!decoded.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

// Apply auth middleware to all admin routes
router.use(authMiddleware);

// Verify admin access
router.get('/verify', (req, res) => {
    res.json({ 
        success: true, 
        user: { 
            name: req.user.name,
            email: req.user.email,
            isAdmin: req.user.isAdmin
        } 
    });
});

// Menu Management Routes
// Get all dishes
router.get('/menu', (req, res) => {
    const dishes = getDishes();
    res.json({ dishes });
});

// Add new dish
router.post('/menu', (req, res) => {
    try {
        const {
            name_fi,
            name_en,
            description,
            price,
            category,
            available = true,
            vegan = false,
            gluten_free = false,
            lactose_free = false,
            image_url,
            allergens = []
        } = req.body;

        // Validate required fields
        if (!name_fi || !price || !category) {
            return res.status(400).json({ 
                error: 'Vaaditut kentät: name_fi, price, category' 
            });
        }

        const dishData = {
            name_fi,
            name_en: name_en || '',
            description: description || '',
            price: parseFloat(price),
            category,
            available: Boolean(available),
            vegan: Boolean(vegan),
            gluten_free: Boolean(gluten_free),
            lactose_free: Boolean(lactose_free),
            image_url: image_url || '',
            allergens: Array.isArray(allergens) ? allergens : []
        };

        const newDish = addDish(dishData);
        res.status(201).json({ success: true, dish: newDish });
    } catch (error) {
        console.error('Error adding dish:', error);
        res.status(500).json({ error: 'Virhe lisättäessä ruokalajia' });
    }
});

// Update dish
router.put('/menu/:id', (req, res) => {
    try {
        const dishId = parseInt(req.params.id);
        const updates = req.body;

        const updatedDish = updateDish(dishId, updates);
        if (!updatedDish) {
            return res.status(404).json({ error: 'Ruokalajia ei löytynyt' });
        }

        res.json({ success: true, dish: updatedDish });
    } catch (error) {
        console.error('Error updating dish:', error);
        res.status(500).json({ error: 'Virhe päivittäessä ruokalajia' });
    }
});

// Delete dish
router.delete('/menu/:id', (req, res) => {
    try {
        const dishId = parseInt(req.params.id);
        const success = deleteDish(dishId);

        if (!success) {
            return res.status(404).json({ error: 'Ruokalajia ei löytynyt' });
        }

        res.json({ success: true, message: 'Ruokalaji poistettu' });
    } catch (error) {
        console.error('Error deleting dish:', error);
        res.status(500).json({ error: 'Virhe poistettaessa ruokalajia' });
    }
});

// Order Management Routes
// Get all orders
router.get('/orders', (req, res) => {
    const orders = getOrders();
    // Sort orders by creation date (newest first)
    const sortedOrders = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ orders: sortedOrders });
});

// Update order status
router.put('/orders/:id/status', (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const { status } = req.body;

        const validStatuses = ['pending', 'preparing', 'ready', 'delivered'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Virheellinen tila' });
        }

        const updatedOrder = updateOrder(orderId, { status, updatedAt: new Date() });
        if (!updatedOrder) {
            return res.status(404).json({ error: 'Tilausta ei löytynyt' });
        }

        res.json({ success: true, order: updatedOrder });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Virhe päivittäessä tilauksen tilaa' });
    }
});

// Analytics Routes
router.get('/analytics', (req, res) => {
    try {
        const orders = getOrders();
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Today's stats
        const todayOrders = orders.filter(order => 
            new Date(order.createdAt) >= today
        );
        const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);

        // Week's stats
        const weekOrders = orders.filter(order => 
            new Date(order.createdAt) >= weekAgo
        );
        const weekRevenue = weekOrders.reduce((sum, order) => sum + order.total, 0);

        // Popular dishes
        const dishCounts = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                if (dishCounts[item.name]) {
                    dishCounts[item.name] += item.quantity;
                } else {
                    dishCounts[item.name] = item.quantity;
                }
            });
        });

        const popularDishes = Object.entries(dishCounts)
            .map(([name, orders]) => ({ name, orders }))
            .sort((a, b) => b.orders - a.orders)
            .slice(0, 5);

        res.json({
            today: {
                orders: todayOrders.length,
                revenue: todayRevenue
            },
            week: {
                orders: weekOrders.length,
                revenue: weekRevenue
            },
            popularDishes
        });
    } catch (error) {
        console.error('Error getting analytics:', error);
        res.status(500).json({ error: 'Virhe ladattaessa tilastoja' });
    }
});

// Settings Routes
// Get settings
router.get('/settings', (req, res) => {
    const settings = getSettings();
    res.json({ settings });
});

// Update settings
router.put('/settings', (req, res) => {
    try {
        const updatedSettings = updateSettings(req.body);
        res.json({ success: true, settings: updatedSettings });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Virhe tallennettaessa asetuksia' });
    }
});

// Create new order (for testing)
router.post('/orders', (req, res) => {
    try {
        const { customerId, customerName, items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Tilaus on tyhjä' });
        }

        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const orderData = {
            customerId: customerId || 999,
            customerName: customerName || 'Tuntematon asiakas',
            status: 'pending',
            items,
            total,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const newOrder = addOrder(orderData);
        res.status(201).json({ success: true, order: newOrder });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Virhe luotaessa tilausta' });
    }
});

module.exports = router;