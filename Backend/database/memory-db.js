// Muistissa toimiva tietokanta ravintolasovellukselle
class InMemoryDatabase {
  constructor() {
    this.users = new Map();
    this.recipes = new Map();
    this.orders = new Map();
    this.categories = new Map();
    this.sessions = new Map();
    
    // Alusta näytetiedot
    this.initializeData();
  }
  
  initializeData() {
    // Oletusadministraattori
    this.users.set('admin@email.com', {
      id: 'admin-001',
      email: 'admin@email.com',
      name: 'karim',
      password: 'admin123', // Tuotannossa salasana tulisi salata
      isAdmin: true,
      createdAt: new Date().toISOString()
    });
    
    // Ruokakategoriat
    this.categories.set('appetizers', {
      id: 'appetizers',
      name: 'Alkuruoat',
      nameEn: 'Appetizers',
      description: 'Herkullisia alkuruokia täydelliseen aloitukseen',
      image: '/assets/img/appetizers.jpg'
    });
    
    this.categories.set('main-dishes', {
      id: 'main-dishes',
      name: 'Pääruoat',
      nameEn: 'Main Dishes',
      description: 'Erityisiä ja herkullisia pääruokia',
      image: '/assets/img/main-dishes.jpg'
    });
    
    this.categories.set('desserts', {
      id: 'desserts',
      name: 'Jälkiruoat',
      nameEn: 'Desserts',
      description: 'Tuoreita ja herkullisia jälkiruokia',
      image: '/assets/img/desserts.jpg'
    });
    
    this.categories.set('beverages', {
      id: 'beverages',
      name: 'Juomat',
      nameEn: 'Beverages',
      description: 'Virkistäviä ja monipuolisia juomia',
      image: '/assets/img/beverages.jpg'
    });
    
    // Näytereseptejä
    this.recipes.set('recipe-001', {
      id: 'recipe-001',
      name: 'Fattoush-salaatti',
      nameEn: 'Fattoush Salad',
      description: 'Tuore fattoush-salaatti rapeiden vihannesten ja paahdetun leivän kanssa',
      price: 25.00,
      category: 'appetizers',
      image: '/assets/img/Fattoush-salaatti.jpg',
      ingredients: ['Salaatti', 'Tomaatti', 'Kurkku', 'Retiisi', 'Paahdettu leipä', 'Sumakki', 'Oliiviöljy'],
      preparationTime: 15,
      isAvailable: true,
      rating: 4.5,
      createdAt: new Date().toISOString()
    });
    
    this.recipes.set('recipe-002', {
      id: 'recipe-002',
      name: 'Grillattu lihakebab',
      nameEn: 'Grilled Meat Kebab',
      description: 'Hiilillä grillattu lihakebab riisin ja salaatin kanssa',
      price: 45.00,
      category: 'main-dishes',
      image: '/assets/img/Grillattu lihakebab.jpg',
      ingredients: ['Lampaanliha', 'Sipuli', 'Persilja', 'Mausteet', 'Basmati-riisi'],
      preparationTime: 30,
      isAvailable: true,
      rating: 4.8,
      createdAt: new Date().toISOString()
    });
    
    this.recipes.set('recipe-003', {
      id: 'recipe-003',
      name: 'Muhallabia',
      nameEn: 'Muhallabia',
      description: 'Kermainen muhallabia pähkinöiden ja kanelin kanssa',
      price: 15.00,
      category: 'desserts',
      image: '/assets/img/Muhallabia.png',
      ingredients: ['Maito', 'Tärkkelys', 'Sokeri', 'Ruusuvesi', 'Pistaasi', 'Kaneli'],
      preparationTime: 20,
      isAvailable: true,
      rating: 4.3,
      createdAt: new Date().toISOString()
    });
  }
  
  // Käyttäjänhallintafunktiot
  createUser(userData) {
    const id = `user-${Date.now()}`;
    const user = {
      id,
      ...userData,
      isAdmin: false,
      createdAt: new Date().toISOString()
    };
    this.users.set(userData.email, user);
    return user;
  }
  
  getUserByEmail(email) {
    return this.users.get(email);
  }
  
  getAllUsers() {
    return Array.from(this.users.values());
  }
  
  // Reseptinhallintafunktiot
  createRecipe(recipeData) {
    const id = `recipe-${Date.now()}`;
    const recipe = {
      id,
      ...recipeData,
      createdAt: new Date().toISOString()
    };
    this.recipes.set(id, recipe);
    return recipe;
  }
  
  getRecipeById(id) {
    return this.recipes.get(id);
  }
  
  getAllRecipes() {
    return Array.from(this.recipes.values());
  }
  
  getRecipesByCategory(category) {
    return this.getAllRecipes().filter(recipe => recipe.category === category);
  }
  
  updateRecipe(id, updates) {
    const recipe = this.recipes.get(id);
    if (recipe) {
      const updated = { ...recipe, ...updates, updatedAt: new Date().toISOString() };
      this.recipes.set(id, updated);
      return updated;
    }
    return null;
  }
  
  deleteRecipe(id) {
    return this.recipes.delete(id);
  }
  
  // Tilaustenhallintafunktiot
  createOrder(orderData) {
    const id = `order-${Date.now()}`;
    const order = {
      id,
      ...orderData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    this.orders.set(id, order);
    return order;
  }
  
  getOrderById(id) {
    return this.orders.get(id);
  }
  
  getAllOrders() {
    return Array.from(this.orders.values());
  }
  
  updateOrderStatus(id, status) {
    const order = this.orders.get(id);
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
      return order;
    }
    return null;
  }
  
  // Kategorianhallintafunktiot
  getAllCategories() {
    return Array.from(this.categories.values());
  }
  
  getCategoryById(id) {
    return this.categories.get(id);
  }
  
  // وظائف إدارة الجلسات
  createSession(userId, token) {
    const sessionId = `session-${Date.now()}`;
    const session = {
      id: sessionId,
      userId,
      token,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 ساعة
    };
    this.sessions.set(token, session);
    return session;
  }
  
  getSessionByToken(token) {
    const session = this.sessions.get(token);
    if (session && new Date(session.expiresAt) > new Date()) {
      return session;
    }
    if (session) {
      this.sessions.delete(token); // حذف الجلسة المنتهية الصلاحية
    }
    return null;
  }
  
  deleteSession(token) {
    return this.sessions.delete(token);
  }
  
  // وظائف إحصائية
  getStats() {
    return {
      totalUsers: this.users.size,
      totalRecipes: this.recipes.size,
      totalOrders: this.orders.size,
      totalCategories: this.categories.size,
      activeSessions: this.sessions.size,
      recentOrders: this.getAllOrders()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
    };
  }
}

// إنشاء instance واحد للاستخدام في التطبيق
const database = new InMemoryDatabase();

module.exports = database;