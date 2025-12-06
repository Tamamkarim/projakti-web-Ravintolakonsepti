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
    const [rows] = await pool.query('SELECT * FROM recipes');
    return rows;
}

// Funktio: Hae kaikki kategoriat
async function getAllCategories() {
    const [rows] = await pool.query('SELECT * FROM categories');
    return rows;
}

// دالة: جلب فئة واحدة حسب ID
async function getCategoryById(id) {
    const [rows] = await pool.query('SELECT * FROM categories WHERE category_id = ?', [id]);
    return rows[0] || null;
}

// دالة: جلب كل الوصفات حسب الفئة
async function getRecipesByCategory(categoryId) {
    const [rows] = await pool.query('SELECT * FROM recipes WHERE category_id = ? AND is_available = TRUE', [categoryId]);
    return rows;
}

module.exports = {
    pool,
    getAllRecipes,
    getAllCategories,
    getCategoryById,
    getRecipesByCategory
};
