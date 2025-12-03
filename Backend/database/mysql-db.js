// دالة الحصول على مستخدم بالبريد الإلكتروني
async function getUserByEmail(email) {
  const query = 'SELECT * FROM users WHERE email = ? AND is_active = TRUE';
  try {
    const [rows] = await pool.execute(query, [email]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error getting user:', error.message);
    throw error;
  }
}
// MySQL Database connection and queries
const mysql = require('mysql2/promise');
require('dotenv').config();

const bcrypt = require('bcrypt');

// إنشاء pool للاتصال بقاعدة البيانات
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Karim88',
  database: process.env.DB_NAME || 'marjadb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

// فحص الاتصال
pool.getConnection()
  .then(connection => {
    console.log('✅ MySQL Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection error:', err.message);
    console.error('تأكد من تشغيل MySQL وصحة معلومات الاتصال في ملف .env');
  });

  

/**
 * إنشاء مستخدم جديد
 */
async function createUser(userData) {
  const { email, password_hash, name, phone, is_admin = false } = userData;
  const query = `
    INSERT INTO users (email, password_hash, name, phone, is_admin, is_active) 
    VALUES (?, ?, ?, ?, ?, TRUE)
  `;
  try {
    const [result] = await pool.execute(query, [email, password_hash, name, phone, is_admin]);
    return {
      id: result.insertId,
      email,
      name,
      phone,
      is_admin,
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error creating user:', error.message);
    throw error;
  }
}

// دالة لإضافة مستخدم جديد بكلمة مرور مشفرة
async function addUserWithHashedPassword({ email, password, name, phone = '', is_admin = 0, is_active = 1 }) {
  try {
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    const query = `INSERT INTO users (email, password_hash, name, phone, is_admin, is_active) VALUES (?, ?, ?, ?, ?, ?)`;
    await pool.execute(query, [email, password_hash, name, phone, is_admin, is_active]);
    console.log('تمت إضافة المستخدم بنجاح:', email);
    return true;
  } catch (error) {
    console.error('خطأ في إضافة المستخدم:', error.message);
    return false;
  }
}

// مثال للاستخدام:
// addUserWithHashedPassword({
//   email: 'admin@email.com',
//   password: '123456',
//   name: 'node add-admin.js',
//   phone: '0500000000',
//   is_admin: 1,
//   is_active: 1
// });

/**
 * الحصول على مستخدم بالمعرف
 */
async function getUserById(userId) {
  const query = 'SELECT * FROM users WHERE user_id = ? AND is_active = TRUE';
  
  try {
    const [rows] = await pool.execute(query, [userId]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error getting user:', error.message);
    throw error;
  }
}

/**
 * الحصول على جميع المستخدمين
 */
async function getAllUsers() {
  const query = 'SELECT user_id, email, name, phone, is_admin, created_at, last_login FROM users WHERE is_active = TRUE';
  
  try {
    const [rows] = await pool.execute(query);
    return rows;
  } catch (error) {
    console.error('Error getting all users:', error.message);
    throw error;
  }
}

/**
 * تحديث آخر تسجيل دخول للمستخدم
 */
async function updateLastLogin(userId) {
  const query = 'UPDATE users SET last_login = NOW() WHERE user_id = ?';
  
  try {
    await pool.execute(query, [userId]);
  } catch (error) {
    console.error('Error updating last login:', error.message);
  }
}



/**
 * الحصول على جميع الفئات
 */
async function getAllCategories() {
  const query = `
    SELECT category_id, category_name, category_name_en, description, image_url, display_order 
    FROM categories 
    WHERE is_active = TRUE 
    ORDER BY display_order
  `;
  
  try {
    const [rows] = await pool.execute(query);
    return rows;
  } catch (error) {
    console.error('Error getting categories:', error.message);
    throw error;
  }
}

/**
 * الحصول على فئة بالمعرف
 */
async function getCategoryById(categoryId) {
  const query = 'SELECT * FROM categories WHERE category_id = ? AND is_active = TRUE';
  
  try {
    const [rows] = await pool.execute(query, [categoryId]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error getting category:', error.message);
    throw error;
  }
}



/**
 * إنشاء وصفة جديدة
 */
async function createRecipe(recipeData) {
  const { 
    category_id, 
    recipe_name, 
    recipe_name_en, 
    description, 
    price, 
    image_url, 
    preparation_time 
  } = recipeData;
  
  const query = `
    INSERT INTO recipes (category_id, recipe_name, recipe_name_en, description, price, image_url, preparation_time, is_available) 
    VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)
  `;
  
  try {
    const [result] = await pool.execute(query, [
      category_id, 
      recipe_name, 
      recipe_name_en, 
      description, 
      price, 
      image_url, 
      preparation_time
    ]);
    
    return {
      id: result.insertId,
      ...recipeData,
      is_available: true,
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error creating recipe:', error.message);
    throw error;
  }
}

/**
 * الحصول على وصفة بالمعرف
 */
async function getRecipeById(recipeId) {
  const query = `
    SELECT r.*, c.category_name, c.category_name_en 
    FROM recipes r
    JOIN categories c ON r.category_id = c.category_id
    WHERE r.recipe_id = ? AND r.is_available = TRUE
  `;
  
  try {
    const [rows] = await pool.execute(query, [recipeId]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error getting recipe:', error.message);
    throw error;
  }
}

/**
 * الحصول على جميع الوصفات
 */
async function getAllRecipes() {
  const query = `
    SELECT r.*, c.category_name, c.category_name_en 
    FROM recipes r
    JOIN categories c ON r.category_id = c.category_id
    WHERE r.is_available = TRUE
    ORDER BY c.display_order, r.recipe_name
  `;
  
  try {
    const [rows] = await pool.execute(query);
    return rows;
  } catch (error) {
    console.error('Error getting all recipes:', error.message);
    throw error;
  }
}

/**
 * الحصول على الوصفات حسب الفئة
 */
async function getRecipesByCategory(categoryId) {
  const query = `
    SELECT r.*, c.category_name, c.category_name_en 
    FROM recipes r
    JOIN categories c ON r.category_id = c.category_id
    WHERE r.category_id = ? AND r.is_available = TRUE
    ORDER BY r.average_rating DESC, r.recipe_name
  `;
  
  try {
    const [rows] = await pool.execute(query, [categoryId]);
    return rows;
  } catch (error) {
    console.error('Error getting recipes by category:', error.message);
    throw error;
  }
}

/**
 * تحديث وصفة
 */
async function updateRecipe(recipeId, updates) {
  const allowedFields = [
    'recipe_name', 
    'recipe_name_en', 
    'description', 
    'price', 
    'image_url', 
    'preparation_time', 
    'is_available'
  ];
  
  const fields = [];
  const values = [];
  
  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }
  
  if (fields.length === 0) {
    return null;
  }
  
  values.push(recipeId);
  const query = `UPDATE recipes SET ${fields.join(', ')}, updated_at = NOW() WHERE recipe_id = ?`;
  
  try {
    await pool.execute(query, values);
    return await getRecipeById(recipeId);
  } catch (error) {
    console.error('Error updating recipe:', error.message);
    throw error;
  }
}

/**
 * حذف وصفة (soft delete)
 */
async function deleteRecipe(recipeId) {
  const query = 'UPDATE recipes SET is_available = FALSE WHERE recipe_id = ?';
  
  try {
    const [result] = await pool.execute(query, [recipeId]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error deleting recipe:', error.message);
    throw error;
  }
}

/**
 * الحصول على مكونات وصفة
 */
async function getRecipeIngredients(recipeId) {
  const query = `
    SELECT i.ingredient_name, i.ingredient_name_en, ri.quantity, ri.unit
    FROM recipe_ingredients ri
    JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
    WHERE ri.recipe_id = ?
    ORDER BY i.ingredient_name
  `;
  
  try {
    const [rows] = await pool.execute(query, [recipeId]);
    return rows;
  } catch (error) {
    console.error('Error getting recipe ingredients:', error.message);
    throw error;
  }
}


/**
 * إنشاء طلب جديد
 */
async function createOrder(orderData) {
  const {
    user_id,
    customer_name,
    customer_phone,
    customer_email,
    order_type,
    delivery_address,
    total_amount,
    notes,
    items
  } = orderData;
  
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // إدراج الطلب
    const orderQuery = `
      INSERT INTO orders (user_id, customer_name, customer_phone, customer_email, order_type, delivery_address, total_amount, notes, order_status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `;
    
    const [orderResult] = await connection.execute(orderQuery, [
      user_id || null,
      customer_name,
      customer_phone,
      customer_email || null,
      order_type,
      delivery_address || null,
      total_amount,
      notes || null
    ]);
    
    const orderId = orderResult.insertId;
    
    // إدراج عناصر الطلب
    const itemQuery = `
      INSERT INTO order_items (order_id, recipe_id, recipe_name, quantity, unit_price, subtotal, special_instructions) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    for (const item of items) {
      await connection.execute(itemQuery, [
        orderId,
        item.recipe_id,
        item.recipe_name,
        item.quantity,
        item.unit_price,
        item.subtotal,
        item.special_instructions || null
      ]);
    }
    
    await connection.commit();
    
    return {
      order_id: orderId,
      ...orderData,
      order_status: 'pending',
      order_date: new Date().toISOString()
    };
  } catch (error) {
    await connection.rollback();
    console.error('Error creating order:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * الحصول على طلب بالمعرف
 */
async function getOrderById(orderId) {
  const orderQuery = 'SELECT * FROM orders WHERE order_id = ?';
  const itemsQuery = 'SELECT * FROM order_items WHERE order_id = ?';
  
  try {
    const [orderRows] = await pool.execute(orderQuery, [orderId]);
    const [itemRows] = await pool.execute(itemsQuery, [orderId]);
    
    if (orderRows.length === 0) {
      return null;
    }
    
    return {
      ...orderRows[0],
      items: itemRows
    };
  } catch (error) {
    console.error('Error getting order:', error.message);
    throw error;
  }
}

/**
 * الحصول على جميع الطلبات
 */
async function getAllOrders() {
  const query = `
    SELECT o.*, COUNT(oi.order_item_id) as item_count
    FROM orders o
    LEFT JOIN order_items oi ON o.order_id = oi.order_id
    GROUP BY o.order_id
    ORDER BY o.order_date DESC
  `;
  
  try {
    const [rows] = await pool.execute(query);
    return rows;
  } catch (error) {
    console.error('Error getting all orders:', error.message);
    throw error;
  }
}

/**
 * الحصول على طلبات المستخدم
 */
async function getUserOrders(userId) {
  const query = `
    SELECT o.*, COUNT(oi.order_item_id) as item_count
    FROM orders o
    LEFT JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.user_id = ?
    GROUP BY o.order_id
    ORDER BY o.order_date DESC
  `;
  
  try {
    const [rows] = await pool.execute(query, [userId]);
    return rows;
  } catch (error) {
    console.error('Error getting user orders:', error.message);
    throw error;
  }
}

/**
 * تحديث حالة الطلب
 */
async function updateOrderStatus(orderId, status) {
  const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
  
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid order status');
  }
  
  let query = 'UPDATE orders SET order_status = ?';
  const params = [status];
  
  if (status === 'completed') {
    query += ', completed_at = NOW()';
  }
  
  query += ' WHERE order_id = ?';
  params.push(orderId);
  
  try {
    const [result] = await pool.execute(query, params);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error updating order status:', error.message);
    throw error;
  }
}

/**
 * الحصول على الطلبات المعلقة
 */
async function getPendingOrders() {
  const query = `
    SELECT o.*, COUNT(oi.order_item_id) as item_count
    FROM orders o
    LEFT JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.order_status IN ('pending', 'confirmed', 'preparing')
    GROUP BY o.order_id
    ORDER BY o.order_date ASC
  `;
  
  try {
    const [rows] = await pool.execute(query);
    return rows;
  } catch (error) {
    console.error('Error getting pending orders:', error.message);
    throw error;
  }
}



/**
 * إنشاء تقييم جديد
 */
async function createReview(reviewData) {
  const { recipe_id, user_id, rating, review_text } = reviewData;
  
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // إدراج التقييم
    const reviewQuery = `
      INSERT INTO reviews (recipe_id, user_id, rating, review_text) 
      VALUES (?, ?, ?, ?)
    `;
    
    await connection.execute(reviewQuery, [recipe_id, user_id, rating, review_text || null]);
    
    // تحديث متوسط التقييم
    const updateQuery = `
      UPDATE recipes 
      SET average_rating = (SELECT AVG(rating) FROM reviews WHERE recipe_id = ?),
          total_reviews = (SELECT COUNT(*) FROM reviews WHERE recipe_id = ?)
      WHERE recipe_id = ?
    `;
    
    await connection.execute(updateQuery, [recipe_id, recipe_id, recipe_id]);
    
    await connection.commit();
    
    return true;
  } catch (error) {
    await connection.rollback();
    console.error('Error creating review:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * الحصول على تقييمات وصفة
 */
async function getRecipeReviews(recipeId) {
  const query = `
    SELECT r.*, u.name as user_name
    FROM reviews r
    JOIN users u ON r.user_id = u.user_id
    WHERE r.recipe_id = ?
    ORDER BY r.created_at DESC
  `;
  
  try {
    const [rows] = await pool.execute(query, [recipeId]);
    return rows;
  } catch (error) {
    console.error('Error getting recipe reviews:', error.message);
    throw error;
  }
}



/**
 * إنشاء جلسة جديدة
 */
async function createSession(userId, tokenHash, ipAddress, userAgent) {
  const query = `
    INSERT INTO sessions (user_id, token_hash, ip_address, user_agent, expires_at) 
    VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))
  `;
  
  try {
    const [result] = await pool.execute(query, [userId, tokenHash, ipAddress, userAgent]);
    return result.insertId;
  } catch (error) {
    console.error('Error creating session:', error.message);
    throw error;
  }
}

/**
 * الحصول على جلسة بواسطة التوكن
 */
async function getSessionByToken(tokenHash) {
  const query = `
    SELECT s.*, u.email, u.name, u.is_admin
    FROM sessions s
    JOIN users u ON s.user_id = u.user_id
    WHERE s.token_hash = ? AND s.expires_at > NOW() AND s.is_valid = TRUE
  `;
  
  try {
    const [rows] = await pool.execute(query, [tokenHash]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error getting session:', error.message);
    throw error;
  }
}

/**
 * حذف جلسة
 */
async function deleteSession(tokenHash) {
  const query = 'UPDATE sessions SET is_valid = FALSE WHERE token_hash = ?';
  
  try {
    const [result] = await pool.execute(query, [tokenHash]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error deleting session:', error.message);
    throw error;
  }
}

/**
 * حذف الجلسات المنتهية
 */
async function cleanExpiredSessions() {
  const query = 'DELETE FROM sessions WHERE expires_at < NOW() OR is_valid = FALSE';
  
  try {
    const [result] = await pool.execute(query);
    return result.affectedRows;
  } catch (error) {
    console.error('Error cleaning sessions:', error.message);
    throw error;
  }
}



/**
 * الحصول على الإحصائيات
 */
async function getStats() {
  try {
    const [userCount] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE is_active = TRUE');
    const [recipeCount] = await pool.execute('SELECT COUNT(*) as count FROM recipes WHERE is_available = TRUE');
    const [orderCount] = await pool.execute('SELECT COUNT(*) as count FROM orders');
    const [todayOrders] = await pool.execute('SELECT COUNT(*) as count FROM orders WHERE DATE(order_date) = CURDATE()');
    const [todayRevenue] = await pool.execute('SELECT COALESCE(SUM(total_amount), 0) as revenue FROM orders WHERE DATE(order_date) = CURDATE() AND order_status != "cancelled"');
    
    return {
      totalUsers: userCount[0].count,
      totalRecipes: recipeCount[0].count,
      totalOrders: orderCount[0].count,
      todayOrders: todayOrders[0].count,
      todayRevenue: todayRevenue[0].revenue
    };
  } catch (error) {
    console.error('Error getting stats:', error.message);
    throw error;
  }
}

// تصدير جميع الوظائف
module.exports = {
  pool,
  // User functions
  createUser,
  getUserByEmail,
  getUserById,
  getAllUsers,
  updateLastLogin,
  addUserWithHashedPassword,
  // Category functions
  getAllCategories,
  getCategoryById,
  // Recipe functions
  createRecipe,
  getRecipeById,
  getAllRecipes,
  getRecipesByCategory,
  updateRecipe,
  deleteRecipe,
  getRecipeIngredients,
  // Order functions
  createOrder,
  getOrderById,
  getAllOrders,
  getUserOrders,
  updateOrderStatus,
  getPendingOrders,
  // Review functions
  createReview,
  getRecipeReviews,
  // Session functions
  createSession,
  getSessionByToken,
  deleteSession,
  cleanExpiredSessions,
  // Statistics
  getStats
};
