// دالة: حذف وصفة حسب المعرف
async function deleteRecipe(id) {
    try {
        const [result] = await pool.query('DELETE FROM recipes WHERE recipe_id = ?', [id]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Virhe deleteRecipe:', error);
        return false;
    }
}
// Funktio: Hae kaikki käyttäjät
async function getAllUsers() {
    const [rows] = await pool.query('SELECT * FROM users');
    return rows;
}
// دالة: جلب كل الوصفات حسب الفئة
async function getRecipesByCategory(categoryId) {
    const [rows] = await pool.query('SELECT * FROM recipes WHERE category_id = ? AND is_available = TRUE', [categoryId]);
    return rows;
}
const mysql = require('mysql2/promise');
require('dotenv').config();
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Funktio: Hae kaikki reseptit
async function getAllRecipes() {
    try {
        const [rows] = await pool.query('SELECT * FROM recipes');
        return rows;
    } catch (error) {
        console.error('Virhe getAllRecipes:', error);
        throw error;
    }
}

// Funktio: Hae kaikki tilaukset
async function getAllOrders() {
    const [rows] = await pool.query('SELECT * FROM orders ORDER BY order_date DESC');
    return rows;
}

// Funktio: Hae kaikki kategoriat
async function getAllCategories() {
    try {
        const [rows] = await pool.query('SELECT * FROM categories');
        return rows;
    } catch (error) {
        console.error('Virhe getAllCategories:', error);
        throw error;
    }
}

// Funktio: Hae kategoria ID:llä
async function getCategoryById(id) {
    const [rows] = await pool.query('SELECT * FROM categories WHERE category_id = ?', [id]);
    return rows[0] || null;
}

// Funktio: Hae tilastot
async function getStats() {
    try {
        // Hae käyttäjien, reseptien ja tilausten määrät
        const [[{ userCount }]] = await pool.query('SELECT COUNT(*) AS userCount FROM users');
        const [[{ recipeCount }]] = await pool.query('SELECT COUNT(*) AS recipeCount FROM recipes');
        const [[{ orderCount }]] = await pool.query('SELECT COUNT(*) AS orderCount FROM orders');
        return {
            userCount,
            recipeCount,
            orderCount
        };
    } catch (error) {
        console.error('Virhe getStats:', error);
        throw error;
    }
}

module.exports = {
    pool,
    getAllRecipes,
    getAllCategories,
    getCategoryById,
    getRecipesByCategory,
    getAllOrders,
    getStats,
    getAllUsers,
    deleteRecipe
};
