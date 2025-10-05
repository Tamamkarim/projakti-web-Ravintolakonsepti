// Kattava kirjasto API-pyyntöihin
class RestaurantAPI {
  constructor() {
    this.baseURL = window.location.origin + '/api';
    // Etsi token eri paikoista
    this.token = localStorage.getItem('jwt_token') || localStorage.getItem('authToken');
  }

  // Tokenin asetus
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('jwt_token', token);
      localStorage.setItem('authToken', token); // Yhteensopivuus vanhan järjestelmän kanssa
    } else {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('authToken');
    }
  }

  // Peruspyyntöjen asetus
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Lisää token jos saatavilla
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP-virhe! tila: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API-pyyntövirhe:', error);
      throw error;
    }
  }

  // GET-pyynnöt
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url);
  }

  // POST-pyynnöt
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // PUT-pyynnöt
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // PATCH-pyynnöt
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  // DELETE-pyynnöt
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }

  // === Tunnistautumispyynnöt ===
  async login(email, password) {
    const response = await this.post('/auth/login', { email, password });
    if (response.success && response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async register(userData) {
    return this.post('/auth/register', userData);
  }

  async logout() {
    this.setToken(null);
    return { success: true, message: 'Kirjauduttu ulos onnistuneesti' };
  }

  // === Menu- ja reseptipyynnöt ===
  async getCategories() {
    return this.get('/categories');
  }

  async getCategoryById(id) {
    return this.get(`/categories/${id}`);
  }

  async getRecipesByCategory(categoryId) {
    return this.get(`/categories/${categoryId}/recipes`);
  }

  async getAllRecipes(filters = {}) {
    return this.get('/recipes', filters);
  }

  async getRecipeById(id) {
    return this.get(`/recipes/${id}`);
  }

  async getTodayMenu() {
    return this.get('/menu/today');
  }

  // === Tilauskyselyt ===
  async createOrder(orderData) {
    return this.post('/orders', orderData);
  }

  async getOrderById(id) {
    return this.get(`/orders/${id}`);
  }

  // === Hallintapyynnöt ===
  async getAdminStats() {
    return this.get('/admin/stats');
  }

  async getAllOrders(filters = {}) {
    return this.get('/admin/orders', filters);
  }

  async updateOrderStatus(orderId, status) {
    return this.patch(`/admin/orders/${orderId}/status`, { status });
  }

  async createRecipe(recipeData) {
    return this.post('/admin/recipes', recipeData);
  }

  async updateRecipe(id, updates) {
    return this.put(`/admin/recipes/${id}`, updates);
  }

  async deleteRecipe(id) {
    return this.delete(`/admin/recipes/${id}`);
  }

  async getAllUsers() {
    return this.get('/admin/users');
  }

  // === API للقائمة ===
  async fetchTodayMenu(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const endpoint = `/menu/today${qs ? ('?' + qs) : ''}`;
    const response = await this.get(endpoint);
    
    // Extract menu data and convert to array format expected by frontend
    if (response && response.data && response.data.menu) {
      const menuArray = [];
      Object.values(response.data.menu).forEach(categoryData => {
        if (categoryData.recipes) {
          menuArray.push(...categoryData.recipes);
        }
      });
      return menuArray;
    }
    
    return [];
  }

  async postOrder(orderData) {
    return this.post('/orders', orderData);
  }

  // === API للمصادقة ===
  async registerUser(userData) {
    return this.post('/auth/register', userData);
  }

  async loginUser(credentials) {
    const result = await this.post('/auth/login', credentials);
    if (result.token) {
      this.setToken(result.token);
    }
    return result;
  }

  async logoutUser() {
    this.setToken(null);
    return { success: true };
  }

  // === وظائف مساعدة ===
  isAuthenticated() {
    return !!this.token;
  }

  async checkAdminAccess() {
    try {
      await this.get('/admin/secret');
      return true;
    } catch {
      return false;
    }
  }
}

// إنشاء instance واحد للاستخدام العام
const api = new RestaurantAPI();

// تصدير الدوال المطلوبة للتوافق مع النظام القديم
window.RestaurantAPI = RestaurantAPI;
window.api = api;

// تصدير الدوال الفردية للتوافق مع main.js
window.fetchTodayMenu = (params) => api.fetchTodayMenu(params);
window.postOrder = (orderData) => api.postOrder(orderData);
window.registerUser = (userData) => api.registerUser(userData);
window.loginUser = (credentials) => api.loginUser(credentials);

// دالة مساعدة لتجنب XSS attacks - متاحة عالمياً
window.escapeHtml = function(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// تصدير ES6 modules للملفات التي تحتاجها
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    RestaurantAPI, 
    api, 
    fetchTodayMenu: api.fetchTodayMenu.bind(api),
    postOrder: api.postOrder.bind(api),
    registerUser: api.registerUser.bind(api),
    loginUser: api.loginUser.bind(api),
    escapeHtml: window.escapeHtml
  };
}