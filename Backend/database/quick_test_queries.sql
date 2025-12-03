
USE apricus_restaurant;
SHOW TABLES;


-- 1. All users
SELECT user_id, email, name, is_admin, created_at FROM users;

-- 2. All categories
SELECT category_id, category_name_en, is_active FROM categories;

-- 3. All recipes with category
SELECT r.recipe_id, r.recipe_name_en, c.category_name_en, r.price, r.average_rating
FROM recipes r
JOIN categories c ON r.category_id = c.category_id;

-- 4. All ingredients
SELECT ingredient_id, ingredient_name_en, stock_quantity, unit, is_available 
FROM ingredients 
LIMIT 10;

-- 5. All orders summary
SELECT order_id, customer_name, order_type, order_status, total_amount, order_date
FROM orders;

-- 6. All reviews with ratings
SELECT r.review_id, rec.recipe_name_en, u.name as customer, r.rating, r.review_text
FROM reviews r
JOIN recipes rec ON r.recipe_id = rec.recipe_id
JOIN users u ON r.user_id = u.user_id;


-- VIEW: Available menu items
SELECT * FROM vw_available_menu;

-- VIEW: Order summary
SELECT * FROM vw_order_summary;

-- Count records in all tables
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL SELECT 'categories', COUNT(*) FROM categories
UNION ALL SELECT 'recipes', COUNT(*) FROM recipes
UNION ALL SELECT 'ingredients', COUNT(*) FROM ingredients
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL SELECT 'reviews', COUNT(*) FROM reviews
UNION ALL SELECT 'sessions', COUNT(*) FROM sessions;


-- UC1: Browse Main Dishes
SELECT r.recipe_name, r.recipe_name_en, r.price, r.average_rating
FROM recipes r
JOIN categories c ON r.category_id = c.category_id
WHERE c.category_name_en = 'Main Dishes' AND r.is_available = TRUE
ORDER BY r.average_rating DESC;

-- UC2: View Recipe with Ingredients (Kebab example)
SELECT 
    r.recipe_name_en,
    i.ingredient_name_en,
    ri.quantity,
    ri.unit
FROM recipes r
JOIN recipe_ingredients ri ON r.recipe_id = ri.recipe_id
JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
WHERE r.recipe_id = 2
ORDER BY i.ingredient_name_en;

-- UC3: Search recipes by keyword
SELECT recipe_id, recipe_name, recipe_name_en, price, average_rating
FROM recipes
WHERE (recipe_name LIKE '%tea%' OR recipe_name_en LIKE '%tea%')
  AND is_available = TRUE
ORDER BY average_rating DESC;

-- UC4: Top rated dishes
SELECT recipe_name_en, price, average_rating, total_reviews
FROM recipes
WHERE is_available = TRUE AND total_reviews > 0
ORDER BY average_rating DESC, total_reviews DESC
LIMIT 5;


-- OM1: View pending orders
SELECT o.order_id, o.customer_name, o.order_type, o.total_amount, o.order_date
FROM orders o
WHERE o.order_status = 'pending'
ORDER BY o.order_date ASC;

-- OM2: View order details with items
SELECT 
    o.order_id,
    o.customer_name,
    o.order_type,
    oi.recipe_name,
    oi.quantity,
    oi.unit_price,
    oi.subtotal
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.order_id = 1;

-- OM3: Customer order history
SELECT 
    o.order_id,
    o.order_date,
    o.order_type,
    o.total_amount,
    o.order_status
FROM orders o
WHERE o.user_id = 2
ORDER BY o.order_date DESC;

-- OM4: Daily sales summary
SELECT 
    DATE(order_date) as sale_date,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as avg_order_value
FROM orders
WHERE DATE(order_date) = '2025-11-25'
  AND order_status != 'cancelled'
GROUP BY DATE(order_date);


-- IM1: Low stock alerts
SELECT 
    ingredient_name_en,
    stock_quantity,
    min_stock_level,
    (min_stock_level - stock_quantity) as shortage,
    unit
FROM ingredients
WHERE stock_quantity < min_stock_level
ORDER BY shortage DESC;

-- IM2: Ingredients for a recipe
SELECT 
    i.ingredient_name_en,
    ri.quantity,
    ri.unit,
    i.stock_quantity as available_stock
FROM recipe_ingredients ri
JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
WHERE ri.recipe_id = 2;

-- IM3: Most used ingredients
SELECT 
    i.ingredient_name_en,
    COUNT(ri.recipe_id) as used_in_recipes
FROM ingredients i
JOIN recipe_ingredients ri ON i.ingredient_id = ri.ingredient_id
GROUP BY i.ingredient_id
ORDER BY used_in_recipes DESC
LIMIT 10;


-- AN1: Most popular dishes (by orders)
SELECT 
    r.recipe_name_en,
    COUNT(oi.order_item_id) as times_ordered,
    SUM(oi.quantity) as total_quantity,
    SUM(oi.subtotal) as total_revenue
FROM order_items oi
JOIN recipes r ON oi.recipe_id = r.recipe_id
GROUP BY r.recipe_id
ORDER BY times_ordered DESC
LIMIT 10;

-- AN2: Revenue by category
SELECT 
    c.category_name_en,
    COUNT(DISTINCT oi.order_id) as orders,
    SUM(oi.subtotal) as revenue
FROM order_items oi
JOIN recipes r ON oi.recipe_id = r.recipe_id
JOIN categories c ON r.category_id = c.category_id
GROUP BY c.category_id
ORDER BY revenue DESC;

-- AN3: Customer activity
SELECT 
    u.name,
    COUNT(DISTINCT o.order_id) as total_orders,
    SUM(o.total_amount) as total_spent,
    COUNT(DISTINCT r.review_id) as reviews_written
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id
LEFT JOIN reviews r ON u.user_id = r.user_id
WHERE u.is_admin = FALSE
GROUP BY u.user_id
ORDER BY total_orders DESC;

-- AN4: Rating distribution
SELECT 
    rating,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM reviews), 2) as percentage
FROM reviews
GROUP BY rating
ORDER BY rating DESC;


-- AD1: Active sessions
SELECT 
    s.session_id,
    u.name,
    u.email,
    s.created_at,
    s.expires_at,
    s.is_valid
FROM sessions s
JOIN users u ON s.user_id = u.user_id
WHERE s.expires_at > NOW() AND s.is_valid = TRUE;

-- AD2: Recent reviews
SELECT 
    r.review_id,
    rec.recipe_name_en,
    u.name as customer,
    r.rating,
    r.review_text,
    r.created_at
FROM reviews r
JOIN recipes rec ON r.recipe_id = rec.recipe_id
JOIN users u ON r.user_id = u.user_id
ORDER BY r.created_at DESC
LIMIT 10;

-- AD3: Recipes needing attention (low rating or no reviews)
SELECT 
    recipe_id,
    recipe_name_en,
    average_rating,
    total_reviews,
    is_available
FROM recipes
WHERE (total_reviews = 0 OR average_rating < 4.0)
  AND is_available = TRUE
ORDER BY average_rating ASC, total_reviews ASC;


-- Example 1: Add new customer
INSERT INTO users (email, password_hash, name, phone)
VALUES ('new.customer@email.com', '$2b$10$test123hash', 'New Customer', '+358111222333');

-- Example 2: Add new recipe
INSERT INTO recipes (category_id, recipe_name, recipe_name_en, description, price, preparation_time)
VALUES (1, 'Uusi resepti', 'New Recipe', 'Description here', 20.00, 15);

-- Example 3: Update order status
UPDATE orders 
SET order_status = 'confirmed'
WHERE order_id = 5 AND order_status = 'pending';

-- Example 4: Add review
INSERT INTO reviews (recipe_id, user_id, rating, review_text)
VALUES (1, 2, 5, 'Excellent dish!');

-- Example 5: Update ingredient stock
UPDATE ingredients
SET stock_quantity = stock_quantity + 10.00
WHERE ingredient_id = 1;


-- Clean expired sessions
DELETE FROM sessions
WHERE expires_at < NOW() OR is_valid = FALSE;

-- Find orders older than 30 days
SELECT order_id, customer_name, order_date, order_status
FROM orders
WHERE order_date < DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY order_date DESC;

-- Recalculate recipe ratings (if needed)
UPDATE recipes r
SET 
    average_rating = (
        SELECT COALESCE(AVG(rating), 0) 
        FROM reviews 
        WHERE recipe_id = r.recipe_id
    ),
    total_reviews = (
        SELECT COUNT(*) 
        FROM reviews 
        WHERE recipe_id = r.recipe_id
    );


-- Check referential integrity
SELECT 
    'Orders without valid user' as issue,
    COUNT(*) as count
FROM orders o
LEFT JOIN users u ON o.user_id = u.user_id
WHERE o.user_id IS NOT NULL AND u.user_id IS NULL

UNION ALL

SELECT 
    'Recipes without valid category',
    COUNT(*)
FROM recipes r
LEFT JOIN categories c ON r.category_id = c.category_id
WHERE c.category_id IS NULL

UNION ALL

SELECT 
    'Order items without valid order',
    COUNT(*)
FROM order_items oi
LEFT JOIN orders o ON oi.order_id = o.order_id
WHERE o.order_id IS NULL;

-- Check for orphaned records
SELECT 
    'Recipe ingredients without recipe' as orphan_type,
    COUNT(*) as count
FROM recipe_ingredients ri
LEFT JOIN recipes r ON ri.recipe_id = r.recipe_id
WHERE r.recipe_id IS NULL

UNION ALL

SELECT 
    'Recipe ingredients without ingredient',
    COUNT(*)
FROM recipe_ingredients ri
LEFT JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
WHERE i.ingredient_id IS NULL;

-- Table sizes
SELECT 
    table_name,
    table_rows,
    ROUND((data_length + index_length) / 1024 / 1024, 2) as size_mb
FROM information_schema.tables
WHERE table_schema = 'apricus_restaurant'
ORDER BY (data_length + index_length) DESC;

