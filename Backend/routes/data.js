// Shared data for menu items across admin and public routes
let dishes = [
    {
        id: 1,
        name_fi: 'Riisiruoka (Kabsa)',
        name_en: 'Kabsa',
        description: 'Perinteinen saudiarabialainen riisiruoka.',
        price: 15.90,
        category: 'main',
        available: true,
        vegan: false,
        gluten_free: true,
        lactose_free: true,
        image_url: '/assets/img/food-bg.jpg',
        allergens: ['nuts']
    },
    {
        id: 2,
        name_fi: 'Tuore salaatti',
        name_en: 'Fresh Salad',
        description: 'Tuore vihannessalaatti sesongin vihanneksista.',
        price: 12.50,
        category: 'appetizer',
        available: true,
        vegan: true,
        gluten_free: true,
        lactose_free: true,
        image_url: '/assets/img/salati.jpg',
        allergens: []
    },
    {
        id: 3,
        name_fi: 'Grilliliha riisillä',
        name_en: 'Grilled Meat with Rice',
        description: 'Maustetusti marinoidua grilliliha jasmiiniriisillä.',
        price: 18.90,
        category: 'main',
        available: true,
        vegan: false,
        gluten_free: true,
        lactose_free: false,
        image_url: '/assets/img/food-bg.jpg',
        allergens: ['milk']
    }
];

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
    phone: '+358 12 345 6789',
    email: 'info@apricus.fi',
    address: 'Makuja-katu 12, Kaupunki'
};

let nextDishId = 4;
let nextOrderId = 3;

// Getter and setter functions to maintain data consistency
function getDishes() {
    return dishes;
}

function setDishes(newDishes) {
    dishes = newDishes;
}

function addDish(dish) {
    const newDish = { ...dish, id: nextDishId++ };
    dishes.push(newDish);
    return newDish;
}

function updateDish(id, updates) {
    const index = dishes.findIndex(d => d.id === id);
    if (index === -1) return null;
    dishes[index] = { ...dishes[index], ...updates };
    return dishes[index];
}

function deleteDish(id) {
    const index = dishes.findIndex(d => d.id === id);
    if (index === -1) return false;
    dishes.splice(index, 1);
    return true;
}

function getOrders() {
    return orders;
}

function addOrder(order) {
    const newOrder = { ...order, id: nextOrderId++ };
    orders.push(newOrder);
    return newOrder;
}

function updateOrder(id, updates) {
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) return null;
    orders[index] = { ...orders[index], ...updates };
    return orders[index];
}

function getSettings() {
    return settings;
}

function updateSettings(newSettings) {
    settings = { ...settings, ...newSettings };
    return settings;
}

module.exports = {
    getDishes,
    setDishes,
    addDish,
    updateDish,
    deleteDish,
    getOrders,
    addOrder,
    updateOrder,
    getSettings,
    updateSettings
};