INSERT INTO users (email, password_hash, name, phone, is_admin, is_active, last_login) VALUES
('admin@apricus.fi', '$2b$10$abcdefghijklmnopqrstuv', 'Karim Admin', '+358123456789', TRUE, TRUE, NOW()),
('john.doe@email.com', '$2b$10$xyz123456789abcdefghij', 'John Doe', '+358987654321', FALSE, TRUE, NOW()),
('maria.garcia@email.com', '$2b$10$qwerty123456789abcdefg', 'Maria Garcia', '+358555123456', FALSE, TRUE, NULL),
('ahmed.hassan@email.com', '$2b$10$zxcvbn123456789abcdefg', 'Ahmed Hassan', '+358444987654', FALSE, TRUE, '2025-11-24 18:30:00'),
('sara.virtanen@email.com', '$2b$10$mnbvcx123456789abcdefg', 'Sara Virtanen', '+358333456789', FALSE, TRUE, '2025-11-25 10:15:00'),
('karim@email.com', '$2b$10$w1Qw8Qn8QwQwQwQwQwQwQeQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQ', 'Karim', '+358000000000', FALSE, TRUE, NOW());
-- تحديث مسarat الصور للأطباق
UPDATE recipes SET image_url = 'assets/img/Fattoush-salaatti.jpg' WHERE recipe_name = 'Fattoush-salaatti';
UPDATE recipes SET image_url = 'assets/img/Grillattu lihakebab.jpg' WHERE recipe_name = 'Grillattu lihakebab';
UPDATE recipes SET image_url = 'assets/img/Shawarma-lautanen.jpg' WHERE recipe_name = 'Shawarma-lautanen';
UPDATE recipes SET image_url = 'assets/img/Falafel-lautanen.jpg' WHERE recipe_name = 'Falafel-lautanen';

-- Create the database if it doesn't exist
DROP DATABASE IF EXISTS web_ravintola;
CREATE DATABASE web_ravintola;
USE web_ravintola;
    
-- Ensure description_en exists in recipes table
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS description_en TEXT AFTER description;


-- --------------
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    is_admin BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    
    INDEX idx_email (email),
    INDEX idx_is_admin (is_admin)
) ENGINE=InnoDB;


-- ----------------------------------------------------------------------------
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    category_name_en VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_display_order (display_order),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB;


-- ----------------------------------------------------------------------------
CREATE TABLE recipes (
    recipe_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    recipe_name VARCHAR(200) NOT NULL,
    recipe_name_en VARCHAR(200) NOT NULL,
    description TEXT,
    description_en TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(500),
    preparation_time INT DEFAULT 0 COMMENT 'Time in minutes',
    is_available BOOLEAN DEFAULT TRUE,
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT,
    INDEX idx_category (category_id),
    INDEX idx_is_available (is_available),
    INDEX idx_rating (average_rating),
    INDEX idx_price (price)
) ENGINE=InnoDB;


-- ----------------------------------------------------------------------------
CREATE TABLE ingredients (
    ingredient_id INT AUTO_INCREMENT PRIMARY KEY,
    ingredient_name VARCHAR(100) NOT NULL UNIQUE,
    ingredient_name_en VARCHAR(100) NOT NULL,
    unit VARCHAR(20) DEFAULT 'g' COMMENT 'e.g., g, ml, pcs',
    stock_quantity DECIMAL(10, 2) DEFAULT 0,
    min_stock_level DECIMAL(10, 2) DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_is_available (is_available)
) ENGINE=InnoDB;


-- ----------------------------------------------------------------------------
CREATE TABLE recipe_ingredients (
    recipe_ingredient_id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'g',
    
    FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id) ON DELETE RESTRICT,
    UNIQUE KEY unique_recipe_ingredient (recipe_id, ingredient_id),
    INDEX idx_recipe (recipe_id),
    INDEX idx_ingredient (ingredient_id)
) ENGINE=InnoDB;


-- ----------------------------------------------------------------------------
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL COMMENT 'NULL for guest orders',
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    order_type ENUM('pickup', 'delivery') NOT NULL DEFAULT 'pickup',
    delivery_address TEXT,
    total_amount DECIMAL(10, 2) NOT NULL,
    order_status ENUM('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_status (order_status),
    INDEX idx_order_date (order_date),
    INDEX idx_order_type (order_type)
) ENGINE=InnoDB;


-- ----------------------------------------------------------------------------
CREATE TABLE order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    recipe_id INT NOT NULL,
    recipe_name VARCHAR(200) NOT NULL COMMENT 'Snapshot of name at order time',
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL COMMENT 'Price at order time',
    subtotal DECIMAL(10, 2) NOT NULL,
    special_instructions TEXT,
    
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE RESTRICT,
    INDEX idx_order (order_id),
    INDEX idx_recipe (recipe_id)
) ENGINE=InnoDB;


-- ----------------------------------------------------------------------------
CREATE TABLE reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_recipe_review (user_id, recipe_id),
    INDEX idx_recipe (recipe_id),
    INDEX idx_user (user_id),
    INDEX idx_rating (rating)
) ENGINE=InnoDB;


-- ----------------------------------------------------------------------------
CREATE TABLE sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_valid BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_token (token_hash),
    INDEX idx_expires (expires_at),
    INDEX idx_valid (is_valid)
) ENGINE=InnoDB;


-- ----------------------------------------------------------------------------
INSERT INTO users (email, password_hash, name, phone, is_admin, is_active, last_login) VALUES
('admin@apricus.fi', '$2b$10$abcdefghijklmnopqrstuv', 'Karim Admin', '+358123456789', TRUE, TRUE, NOW()),
('admin2@email.com', '12345678', 'Admin Two', '+358111111111', TRUE, TRUE, NOW());

-- ----------------------------------------------------------------------------
-- INSERT: Categories
-- ----------------------------------------------------------------------------
INSERT INTO categories (category_name, category_name_en, description, image_url, display_order) VALUES
('Alkuruoat', 'Appetizers', 'Herkullisia alkuruokia täydelliseen aloitukseen', 'assets/img/appetizers.jpg', 1),
('Pääruoat', 'Main Dishes', 'Erityisiä ja herkullisia pääruokia', 'assets/img/main-dishes.jpg', 2),
('Jälkiruoat', 'Desserts', 'Tuoreita ja herkullisia jälkiruokia', 'assets/img/desserts.jpg', 3),
('Kylmät juomat', 'Cold Beverages', 'Virkistäviä kylmiä juomia', 'assets/img/beverages.jpg', 4),
('Kuumat juomat', 'Hot Beverages', 'Perinteisiä ja herkullisia kuumia juomia', 'assets/img/hot-beverages.jpg', 5);


-- ----------------------------------------------------------------------------
INSERT INTO ingredients (ingredient_name, ingredient_name_en, unit, stock_quantity, min_stock_level) VALUES
('Salaatti', 'Lettuce', 'kg', 50.00, 10.00),
('Tomaatti', 'Tomato', 'kg', 40.00, 8.00),
('Kurkku', 'Cucumber', 'kg', 35.00, 7.00),
('Retiisi', 'Radish', 'kg', 20.00, 5.00),
('Paahdettu leipä', 'Toasted Bread', 'pcs', 100.00, 20.00),
('Sumakki', 'Sumac', 'g', 500.00, 100.00),
('Oliiviöljy', 'Olive Oil', 'ml', 5000.00, 1000.00),
('Lampaanliha', 'Lamb Meat', 'kg', 30.00, 5.00),
('Naudan jauheliha', 'Ground Beef', 'kg', 40.00, 10.00),
('Kana', 'Chicken', 'kg', 50.00, 10.00),
('Sipuli', 'Onion', 'kg', 25.00, 5.00),
('Persilja', 'Parsley', 'kg', 10.00, 2.00),
('Mausteet', 'Spices', 'g', 2000.00, 500.00),
('Basmati-riisi', 'Basmati Rice', 'kg', 60.00, 15.00),
('Maito', 'Milk', 'ml', 10000.00, 2000.00),
('Tärkkelys', 'Starch', 'g', 3000.00, 500.00),
('Sokeri', 'Sugar', 'kg', 20.00, 5.00),
('Ruusuvesi', 'Rose Water', 'ml', 1000.00, 200.00),
('Pistaasi', 'Pistachio', 'g', 2000.00, 400.00),
('Kaneli', 'Cinnamon', 'g', 500.00, 100.00),
('Kikherneet', 'Chickpeas', 'kg', 25.00, 5.00),
('Tahini', 'Tahini', 'kg', 15.00, 3.00),
('Valkosipuli', 'Garlic', 'kg', 8.00, 2.00),
('Sitruunamehu', 'Lemon Juice', 'ml', 2000.00, 500.00),
('Pähkinät', 'Nuts', 'g', 3000.00, 500.00),
('Paprika', 'Paprika', 'g', 800.00, 200.00),
('Musta tee', 'Black Tea', 'g', 1000.00, 200.00),
('Minttu', 'Mint', 'kg', 5.00, 1.00),
('Arabialainen kahvi', 'Arabic Coffee', 'kg', 10.00, 2.00),
('Kardemumma', 'Cardamom', 'g', 500.00, 100.00),
('Sahrami', 'Saffron', 'g', 50.00, 10.00),
('Punaiset linssit', 'Red Lentils', 'kg', 30.00, 5.00),
('Porkkana', 'Carrot', 'kg', 25.00, 5.00),
('Juustokumina', 'Cumin', 'g', 600.00, 100.00),
('Kurkuma', 'Turmeric', 'g', 400.00, 100.00),
('Hibiskus', 'Hibiscus', 'g', 1000.00, 200.00);

-- ----------------------------------------------------------------------------
-- INSERT: Recipes
-- ----------------------------------------------------------------------------
INSERT INTO recipes (category_id, recipe_name, recipe_name_en, description, description_en, price, image_url, preparation_time, average_rating, total_reviews) VALUES
(1, 'Fattoush-salaatti', 'Fattoush Salad', 'Tuore fattoush-salaatti rapeiden vihannesten ja paahdetun leivän kanssa', 'Fresh fattoush salad with crispy vegetables and toasted bread', 25.00, 'assets/img/Fattoush-salaatti.jpg', 15, 4.50, 12),
(2, 'Grillattu lihakebab', 'Grilled Meat Kebab', 'Hiilillä grillattu lihakebab riisin ja salaatin kanssa', 'Charcoal-grilled meat kebab with rice and salad', 45.00, 'assets/img/Grillattu lihakebab.jpg', 30, 4.80, 24),
(3, 'Muhallabia', 'Muhallabia', 'Kermainen muhallabia pähkinöiden ja kanelin kanssa', 'Creamy muhallabia with nuts and cinnamon', 15.00, 'assets/img/Muhallabia.png', 20, 4.30, 8),
(1, 'Hummus tahinin kanssa', 'Hummus with Tahini', 'Kermainen tuore hummus tahinin, oliiviöljyn ja pähkinöiden kanssa', 'Creamy fresh hummus with tahini, olive oil, and nuts', 18.00, 'assets/img/hummus.jpg', 15, 4.60, 16),
(5, 'Minttutee', 'Mint Black Tea', 'Perinteinen musta tee tuoreen mintun ja sokerin kanssa', 'Traditional black tea with fresh mint and sugar', 8.00, 'assets/img/mint-tea.jpg', 5, 4.40, 10),
(5, 'Arabialainen kahvi', 'Arabic Coffee', 'Aito arabialainen kahvi kardemumman ja sahramilla', 'Authentic Arabic coffee with cardamom and saffron', 12.00, 'assets/img/arabic-coffee.jpg', 10, 4.70, 15),
(1, 'Linssisoppa', 'Lentil Soup', 'Perinteinen linssisoppa vihannesten ja arabialaisien mausteiden kanssa', 'Traditional lentil soup with vegetables and Arabic spices', 22.00, 'assets/img/lentil-soup.jpg', 25, 4.40, 9),
(5, 'Hibiskustee', 'Hibiscus Tea', 'Virkistävä hibiskusjuoma kylmänä tai kuumana mintun kanssa', 'Refreshing hibiscus drink served cold or hot with mint', 10.00, 'assets/img/hibiscus-tea.jpg', 8, 4.20, 6),
(2, 'Shawarma-lautanen', 'Shawarma Plate', 'Mausteinen shawarma-liha riisin, salaatin ja tahini-kastikkeen kanssa', 'Spicy shawarma meat with rice, salad, and tahini sauce', 38.00, 'assets/img/shawarma.jpg', 25, 4.75, 20),
(3, 'Baklava', 'Baklava', 'Perinteinen arabialainen baklava hunajalla ja pähkinöillä', 'Traditional Arabic baklava with honey and nuts', 18.00, 'assets/img/baklava.jpg', 45, 4.90, 18);


-- ----------------------------------------------------------------------------
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES
-- Fattoush-salaatti (recipe_id: 1)
(1, 1, 200, 'g'),   -- Salaatti
(1, 2, 150, 'g'),   -- Tomaatti
(1, 3, 100, 'g'),   -- Kurkku
(1, 4, 50, 'g'),    -- Retiisi
(1, 5, 2, 'pcs'),   -- Paahdettu leipä
(1, 6, 10, 'g'),    -- Sumakki
(1, 7, 30, 'ml'),   -- Oliiviöljy

-- Grillattu lihakebab (recipe_id: 2)
(2, 8, 300, 'g'),   -- Lampaanliha
(2, 11, 100, 'g'),  -- Sipuli
(2, 12, 20, 'g'),   -- Persilja
(2, 13, 15, 'g'),   -- Mausteet
(2, 14, 200, 'g'),  -- Basmati-riisi

-- Muhallabia (recipe_id: 3)
(3, 15, 500, 'ml'), -- Maito
(3, 16, 50, 'g'),   -- Tärkkelys
(3, 17, 80, 'g'),   -- Sokeri
(3, 18, 10, 'ml'),  -- Ruusuvesi
(3, 19, 30, 'g'),   -- Pistaasi
(3, 20, 5, 'g'),    -- Kaneli

-- Hummus (recipe_id: 4)
(4, 21, 300, 'g'),  -- Kikherneet
(4, 22, 100, 'g'),  -- Tahini
(4, 23, 20, 'g'),   -- Valkosipuli
(4, 24, 50, 'ml'),  -- Sitruunamehu
(4, 7, 40, 'ml'),   -- Oliiviöljy
(4, 25, 30, 'g'),   -- Pähkinät
(4, 26, 5, 'g'),    -- Paprika

-- Minttutee (recipe_id: 5)
(5, 27, 10, 'g'),   -- Musta tee
(5, 28, 20, 'g'),   -- Minttu
(5, 17, 15, 'g'),   -- Sokeri

-- Arabialainen kahvi (recipe_id: 6)
(6, 29, 30, 'g'),   -- Arabialainen kahvi
(6, 30, 5, 'g'),    -- Kardemumma
(6, 31, 0.1, 'g'),  -- Sahrami

-- Linssisoppa (recipe_id: 7)
(7, 32, 250, 'g'),  -- Punaiset linssit
(7, 33, 100, 'g'),  -- Porkkana
(7, 11, 80, 'g'),   -- Sipuli
(7, 23, 15, 'g'),   -- Valkosipuli
(7, 34, 8, 'g'),    -- Juustokumina
(7, 35, 5, 'g'),    -- Kurkuma
(7, 24, 30, 'ml'),  -- Sitruunamehu

-- Hibiskustee (recipe_id: 8)
(8, 36, 20, 'g'),   -- Hibiskus
(8, 28, 10, 'g'),   -- Minttu
(8, 17, 20, 'g');   -- Sokeri  


-- ----------------------------------------------------------------------------
-- INSERT: Orders
-- ----------------------------------------------------------------------------
INSERT INTO orders (user_id, customer_name, customer_phone, customer_email, order_type, delivery_address, total_amount, order_status, order_date, completed_at) VALUES
(2, 'John Doe', '+358987654321', 'john.doe@email.com', 'delivery', 'Mannerheimintie 10, 00100 Helsinki', 88.00, 'completed', '2025-11-20 12:30:00', '2025-11-20 13:45:00'),
(3, 'Maria Garcia', '+358555123456', 'maria.garcia@email.com', 'pickup', NULL, 43.00, 'completed', '2025-11-22 16:15:00', '2025-11-22 16:45:00'),
(4, 'Ahmed Hassan', '+358444987654', 'ahmed.hassan@email.com', 'delivery', 'Aleksanterinkatu 5, 00170 Helsinki', 120.00, 'preparing', '2025-11-25 11:00:00', NULL),
(5, 'Sara Virtanen', '+358333456789', 'sara.virtanen@email.com', 'pickup', NULL, 33.00, 'ready', '2025-11-25 14:20:00', NULL),
(NULL, 'Guest Customer', '+358111222333', 'guest@email.com', 'pickup', NULL, 26.00, 'pending', '2025-11-25 15:00:00', NULL);

-- ----------------------------------------------------------------------------
-- INSERT: Order Items
-- ----------------------------------------------------------------------------
INSERT INTO order_items (order_id, recipe_id, recipe_name, quantity, unit_price, subtotal, special_instructions) VALUES
-- Order 1: John Doe
(1, 1, 'Fattoush-salaatti', 1, 25.00, 25.00, NULL),
(1, 2, 'Grillattu lihakebab', 1, 45.00, 45.00, 'Medium cooked please'),
(1, 6, 'Arabialainen kahvi', 1, 12.00, 12.00, NULL),
(1, 3, 'Muhallabia', 1, 15.00, 15.00, 'Extra pistachio'),

-- Order 2: Maria Garcia
(2, 4, 'Hummus tahinin kanssa', 1, 18.00, 18.00, NULL),
(2, 5, 'Minttutee', 2, 8.00, 16.00, NULL),
(2, 3, 'Muhallabia', 1, 15.00, 15.00, NULL),

-- Order 3: Ahmed Hassan
(3, 2, 'Grillattu lihakebab', 2, 45.00, 90.00, NULL),
(3, 7, 'Linssisoppa', 1, 22.00, 22.00, NULL),
(3, 8, 'Hibiskustee', 1, 10.00, 10.00, 'Cold, please'),

-- Order 4: Sara Virtanen
(4, 1, 'Fattoush-salaatti', 1, 25.00, 25.00, NULL),
(4, 5, 'Minttutee', 1, 8.00, 8.00, NULL),

-- Order 5: Guest
(5, 4, 'Hummus tahinin kanssa', 1, 18.00, 18.00, NULL),
(5, 5, 'Minttutee', 1, 8.00, 8.00, NULL);

-- ----------------------------------------------------------------------------
-- INSERT: Reviews
-- ----------------------------------------------------------------------------
INSERT INTO reviews (recipe_id, user_id, rating, review_text, created_at) VALUES
(1, 2, 5, 'Amazing fresh salad! The toasted bread adds great texture.', '2025-11-21 14:00:00'),
(2, 2, 5, 'Best kebab I have ever had! Perfectly grilled and seasoned.', '2025-11-21 14:05:00'),
(3, 3, 4, 'Delicious dessert, very creamy. Would love more pistachio.', '2025-11-23 10:30:00'),
(4, 4, 5, 'Authentic hummus taste! Reminds me of home.', '2025-11-24 18:45:00'),
(5, 5, 4, 'Great mint tea, very refreshing.', '2025-11-25 10:20:00'),
(6, 4, 5, 'Perfect Arabic coffee with cardamom. Excellent!', '2025-11-24 19:00:00'),
(2, 5, 5, 'Absolutely delicious! Will order again.', '2025-11-25 10:25:00'),
(7, 2, 4, 'Hearty and flavorful soup. Good portion size.', '2025-11-21 14:10:00');

-- ----------------------------------------------------------------------------
-- INSERT: Sessions
-- ----------------------------------------------------------------------------
INSERT INTO sessions (user_id, token_hash, ip_address, user_agent, created_at, expires_at, is_valid) VALUES
(1, 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '2025-11-25 09:00:00', '2025-11-26 09:00:00', TRUE),
(2, 'xyz987wvu654tsr321qpo098nml765kji432hgf109edc876', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', '2025-11-25 10:15:00', '2025-11-26 10:15:00', TRUE),
(5, 'mno456pqr789stu012vwx345yz678abc901def234ghi567jkl', '192.168.1.102', 'Mozilla/5.0 (X11; Linux x86_64)', '2025-11-25 10:20:00', '2025-11-26 10:20:00', TRUE),
(4, 'qwe789rty012uio345pas678dfg901hjk234lzx567cvb890bnm', '192.168.1.103', 'Mozilla/5.0 (iPhone; CPU iPhone OS)', '2025-11-24 18:30:00', '2025-11-25 18:30:00', FALSE);


-- ----------------------------------------------------------------------------
SELECT 
    r.recipe_id,
    r.recipe_name,
    r.recipe_name_en,
    r.description,
    r.price,
    r.preparation_time,
    r.average_rating,
    c.category_name
FROM recipes r
JOIN categories c ON r.category_id = c.category_id
WHERE c.category_name_en = 'Main Dishes' 
    AND r.is_available = TRUE
ORDER BY r.average_rating DESC;


-- ----------------------------------------------------------------------------
SELECT 
    r.recipe_name,
    r.recipe_name_en,
    r.description,
    r.price,
    r.average_rating,
    i.ingredient_name,
    i.ingredient_name_en,
    ri.quantity,
    ri.unit
FROM recipes r
JOIN recipe_ingredients ri ON r.recipe_id = ri.recipe_id
JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
WHERE r.recipe_id = 2
ORDER BY i.ingredient_name;

---------------------------------------
-- First, insert the order header
INSERT INTO orders (user_id, customer_name, customer_phone, customer_email, order_type, total_amount, order_status, notes)
VALUES (3, 'Maria Garcia', '+358555123456', 'maria.garcia@email.com', 'pickup', 26.00, 'pending', 'Please call when ready');

-- Then, insert order items (assuming order_id = LAST_INSERT_ID())
INSERT INTO order_items (order_id, recipe_id, recipe_name, quantity, unit_price, subtotal)
VALUES 
    (LAST_INSERT_ID(), 4, 'Hummus tahinin kanssa', 1, 18.00, 18.00),
    (LAST_INSERT_ID(), 5, 'Minttutee', 1, 8.00, 8.00);


-- ----------------------------------------------------------------------------
SELECT 
    o.order_id,
    o.customer_name,
    o.customer_phone,
    o.order_type,
    o.total_amount,
    o.order_status,
    o.order_date,
    COUNT(oi.order_item_id) as total_items
FROM orders o
LEFT JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.order_status IN ('pending', 'preparing')
GROUP BY o.order_id
ORDER BY o.order_date ASC;


-- ----------------------------------------------------------------------------
UPDATE orders 
SET order_status = 'ready'
WHERE order_id = 4 AND order_status = 'preparing';

-- ----------
UPDATE orders 
SET 
    order_status = 'completed',
    completed_at = NOW()
WHERE order_id = 4 AND order_status = 'ready';


INSERT INTO reviews (recipe_id, user_id, rating, review_text)
VALUES (1, 3, 5, 'Excellent salad! Fresh ingredients and perfect dressing.');

-- Update recipe average rating and review count
UPDATE recipes
SET 
    average_rating = (
        SELECT AVG(rating) 
        FROM reviews 
        WHERE recipe_id = 1
    ),
    total_reviews = (
        SELECT COUNT(*) 
        FROM reviews 
        WHERE recipe_id = 1
    )
WHERE recipe_id = 1;

-- ------------------------------------------------------------------------
SELECT 
    recipe_id,
    recipe_name,
    recipe_name_en,
    description,
    price,
    average_rating
FROM recipes
WHERE 
    (recipe_name LIKE '%kebab%' OR 
     recipe_name_en LIKE '%kebab%' OR 
     description LIKE '%kebab%')
    AND is_available = TRUE
ORDER BY average_rating DESC;


-- ------------------------------------------------------------------------
SELECT 
    r.recipe_name,
    r.recipe_name_en,
    r.price,
    r.average_rating,
    r.total_reviews,
    c.category_name_en
FROM recipes r
JOIN categories c ON r.category_id = c.category_id
WHERE r.total_reviews > 0 AND r.is_available = TRUE
ORDER BY r.average_rating DESC, r.total_reviews DESC
LIMIT 5;

-- ----------------------------------------------------------------------------
-- USE CASE 10: Check ingredient stock levels
SELECT 
    ingredient_name,
    ingredient_name_en,
    stock_quantity,
    min_stock_level,
    unit,
    (min_stock_level - stock_quantity) as shortage
FROM ingredients
WHERE stock_quantity < min_stock_level
ORDER BY shortage DESC;


-- ----------------------------------------------------------------------------
UPDATE ingredients i
JOIN recipe_ingredients ri ON i.ingredient_id = ri.ingredient_id
SET i.stock_quantity = i.stock_quantity - (ri.quantity * 1) -- 1 = quantity ordered
WHERE ri.recipe_id = 2;


-- ------------------------------------------------------------------------
SELECT 
    o.order_id,
    o.order_date,
    o.order_type,
    o.total_amount,
    o.order_status,
    COUNT(oi.order_item_id) as items_count,
    GROUP_CONCAT(oi.recipe_name SEPARATOR ', ') as ordered_items
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.user_id = 2
GROUP BY o.order_id
ORDER BY o.order_date DESC;


-- ----------------------------------------------------------------------------
SELECT 
    DATE(order_date) as sale_date,
    COUNT(DISTINCT order_id) as total_orders,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as average_order_value,
    SUM(CASE WHEN order_type = 'delivery' THEN 1 ELSE 0 END) as delivery_orders,
    SUM(CASE WHEN order_type = 'pickup' THEN 1 ELSE 0 END) as pickup_orders
FROM orders
WHERE DATE(order_date) = '2025-11-25'
    AND order_status != 'cancelled'
GROUP BY DATE(order_date);


-- ----------------------------------------------------------------------------
SELECT 
    r.recipe_name,
    r.recipe_name_en,
    COUNT(oi.order_item_id) as times_ordered,
    SUM(oi.quantity) as total_quantity,
    SUM(oi.subtotal) as total_revenue
FROM order_items oi
JOIN recipes r ON oi.recipe_id = r.recipe_id
GROUP BY r.recipe_id
ORDER BY times_ordered DESC
LIMIT 10;


-- ----------------------------------------------------------------------------
INSERT INTO recipes (category_id, recipe_name, recipe_name_en, description, description_en, price, image_url, preparation_time)
VALUES (2, 'Falafel-lautanen', 'Falafel Plate', 
    'Rapeat falafel-pallot humuksen, tahini-kastikkeen ja salaatin kanssa', 
    'Crispy falafel balls with hummus, tahini sauce, and salad', 
    32.00, '/assets/img/falafel.jpg', 20);

-- Then add ingredients for the new recipe
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
VALUES 
    (LAST_INSERT_ID(), 21, 200, 'g'),  -- Chickpeas
    (LAST_INSERT_ID(), 12, 30, 'g'),   -- Parsley
    (LAST_INSERT_ID(), 23, 15, 'g'),   -- Garlic
    (LAST_INSERT_ID(), 13, 10, 'g');   -- Spices


-- ----------------------------------------------------------------------------
UPDATE recipes
SET is_available = FALSE
WHERE recipe_id IN (
    SELECT DISTINCT ri.recipe_id
    FROM recipe_ingredients ri
    JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
    WHERE i.is_available = FALSE OR i.stock_quantity < ri.quantity
);


-- ----------------------------------------------------------------------------
DELETE FROM sessions
WHERE expires_at < NOW() OR is_valid = FALSE;


-- ----------------------------------------------------------------------------
UPDATE orders
SET order_status = 'cancelled'
WHERE order_id = 5 
    AND order_status = 'pending';


-- ----------------------------------------------------------------------------
SELECT 
    o.order_id,
    o.customer_name,
    o.customer_phone,
    o.order_type,
    o.delivery_address,
    o.order_date,
    o.order_status,
    oi.recipe_name,
    oi.quantity,
    oi.unit_price,
    oi.subtotal,
    oi.special_instructions,
    o.total_amount
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.order_id = 1;


-- ----------------------------------------------------------------------------
UPDATE recipes
SET price = 48.00
WHERE recipe_id = 2;


-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_available_menu AS
SELECT 
    r.recipe_id,
    c.category_name,
    c.category_name_en,
    r.recipe_name,
    r.recipe_name_en,
    r.description,
    r.price,
    r.image_url,
    r.preparation_time,
    r.average_rating,
    r.total_reviews
FROM recipes r
JOIN categories c ON r.category_id = c.category_id
WHERE r.is_available = TRUE AND c.is_active = TRUE
ORDER BY c.display_order, r.recipe_name;

-- ------------------------------------------------------------------------


CREATE OR REPLACE VIEW vw_order_summary AS
SELECT 
    o.order_id,
    o.customer_name,
    o.customer_phone,
    o.order_type,
    o.order_status,
    o.order_date,
    o.total_amount,
    COUNT(oi.order_item_id) as item_count,
    u.name as user_name,
    u.email as user_email
FROM orders o
LEFT JOIN order_items oi ON o.order_id = oi.order_id
LEFT JOIN users u ON o.user_id = u.user_id
GROUP BY o.order_id;


-- ----------------------------------------------------------------------------
DELIMITER $$
CREATE TRIGGER trg_after_review_insert
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    UPDATE recipes
    SET 
        average_rating = (
            SELECT AVG(rating) 
            FROM reviews 
            WHERE recipe_id = NEW.recipe_id
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE recipe_id = NEW.recipe_id
        )
    WHERE recipe_id = NEW.recipe_id;
END$$
DELIMITER ;


-- ----------------------------------------------------------------------------
DELIMITER $$
CREATE TRIGGER trg_after_review_update
AFTER UPDATE ON reviews
FOR EACH ROW
BEGIN
    UPDATE recipes
    SET 
        average_rating = (
            SELECT AVG(rating) 
            FROM reviews 
            WHERE recipe_id = NEW.recipe_id
        )
    WHERE recipe_id = NEW.recipe_id;
END$$
DELIMITER ;


-- ----------------------------------------------------------------------------
DELIMITER $$
CREATE TRIGGER trg_validate_order_total
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
    IF NEW.total_amount < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Order total cannot be negative';
    END IF;
END$$
DELIMITER ;




-- Additional composite indexes for common queries
CREATE INDEX idx_recipes_category_available ON recipes(category_id, is_available);
CREATE INDEX idx_orders_user_status ON orders(user_id, order_status);
CREATE INDEX idx_reviews_recipe_rating ON reviews(recipe_id, rating);
CREATE INDEX idx_order_items_order_recipe ON order_items(order_id, recipe_id);



-- Database statistics
SELECT 
    'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'recipes', COUNT(*) FROM recipes
UNION ALL
SELECT 'ingredients', COUNT(*) FROM ingredients
UNION ALL
SELECT 'recipe_ingredients', COUNT(*) FROM recipe_ingredients
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL
SELECT 'reviews', COUNT(*) FROM reviews
UNION ALL
SELECT 'sessions', COUNT(*) FROM sessions;

SELECT user_id, email, is_active, password_hash
FROM users
WHERE email = 'sahkoposti@esimerkki.com';
