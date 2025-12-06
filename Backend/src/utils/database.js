
// إعداد اتصال MySQL
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
	host: process.env.DB_HOST || 'localhost',
	user: process.env.DB_USER || 'root',
	password: process.env.DB_PASS || '',
	database: process.env.DB_NAME || 'restaurant',
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0
});


// جلب كل عناصر المنيو (من جدول recipes والفئات)
async function getAllMenuItems() {
	const [rows] = await pool.query(`
		SELECT r.*, c.category_name, c.category_name_en
		FROM recipes r
		JOIN categories c ON r.category_id = c.category_id
		WHERE r.is_available = TRUE AND c.is_active = TRUE
		ORDER BY c.display_order, r.recipe_name
	`);
	return rows;
}

// جلب كل الوصفات (recipes)
async function getAllRecipes() {
	const [rows] = await pool.query('SELECT * FROM recipes');
	return rows;
}

// جلب كل الفئات (categories)
async function getAllCategories() {
	const [rows] = await pool.query('SELECT * FROM categories');
	return rows;
}

module.exports = {
	pool,
	getAllMenuItems,
	getAllRecipes,
	getAllCategories
};
