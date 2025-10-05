// إدارة حالة التطبيق
class AppState {
  constructor() {
    this.state = {
      user: null,
      cart: [],
      categories: [],
      recipes: [],
      currentMenu: null,
      orders: [],
      isLoading: false,
      error: null
    };
    
    this.listeners = {};
    this.loadFromStorage();
  }

  // تحميل البيانات من localStorage
  loadFromStorage() {
    try {
      const savedCart = localStorage.getItem('restaurantCart');
      if (savedCart) {
        this.state.cart = JSON.parse(savedCart);
      }

      const savedUser = localStorage.getItem('restaurantUser');
      if (savedUser) {
        this.state.user = JSON.parse(savedUser);
      }
    } catch (error) {
      console.error('خطأ في تحميل البيانات من التخزين:', error);
    }
  }

  // حفظ البيانات في localStorage
  saveToStorage() {
    try {
      localStorage.setItem('restaurantCart', JSON.stringify(this.state.cart));
      if (this.state.user) {
        localStorage.setItem('restaurantUser', JSON.stringify(this.state.user));
      } else {
        localStorage.removeItem('restaurantUser');
      }
    } catch (error) {
      console.error('خطأ في حفظ البيانات:', error);
    }
  }

  // إضافة مستمع للتغييرات
  subscribe(key, callback) {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key].push(callback);
    
    // إرجاع دالة لإلغاء الاشتراك
    return () => {
      this.listeners[key] = this.listeners[key].filter(cb => cb !== callback);
    };
  }

  // إشعار المستمعين بالتغييرات
  notify(key, value) {
    if (this.listeners[key]) {
      this.listeners[key].forEach(callback => callback(value, this.state));
    }
  }

  // تحديث الحالة
  setState(updates) {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...updates };
    
    // إشعار المستمعين بالتغييرات
    Object.keys(updates).forEach(key => {
      if (oldState[key] !== this.state[key]) {
        this.notify(key, this.state[key]);
      }
    });

    this.saveToStorage();
  }

  // الحصول على حالة معينة
  getState(key) {
    return key ? this.state[key] : this.state;
  }

  // === إدارة المستخدم ===
  setUser(user) {
    this.setState({ user });
  }

  getUser() {
    return this.state.user;
  }

  isLoggedIn() {
    return !!this.state.user;
  }

  logout() {
    this.setState({ user: null });
    api.logout();
  }

  // === إدارة السلة ===
  addToCart(recipe, quantity = 1) {
    const existingItem = this.state.cart.find(item => item.id === recipe.id);
    
    if (existingItem) {
      this.updateCartQuantity(recipe.id, existingItem.quantity + quantity);
    } else {
      const cartItem = {
        id: recipe.id,
        name: recipe.name,
        price: recipe.price,
        image: recipe.image,
        quantity: quantity
      };
      
      this.setState({
        cart: [...this.state.cart, cartItem]
      });
    }
  }

  removeFromCart(recipeId) {
    this.setState({
      cart: this.state.cart.filter(item => item.id !== recipeId)
    });
  }

  updateCartQuantity(recipeId, quantity) {
    if (quantity <= 0) {
      this.removeFromCart(recipeId);
      return;
    }

    this.setState({
      cart: this.state.cart.map(item => 
        item.id === recipeId 
          ? { ...item, quantity } 
          : item
      )
    });
  }

  clearCart() {
    this.setState({ cart: [] });
  }

  getCartTotal() {
    return this.state.cart.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  getCartItemsCount() {
    return this.state.cart.reduce((count, item) => count + item.quantity, 0);
  }

  // === إدارة البيانات ===
  setCategories(categories) {
    this.setState({ categories });
  }

  setRecipes(recipes) {
    this.setState({ recipes });
  }

  setCurrentMenu(menu) {
    this.setState({ currentMenu: menu });
  }

  addOrder(order) {
    this.setState({
      orders: [order, ...this.state.orders]
    });
  }

  // === إدارة حالة التحميل والأخطاء ===
  setLoading(isLoading) {
    this.setState({ isLoading });
  }

  setError(error) {
    this.setState({ error });
  }

  clearError() {
    this.setState({ error: null });
  }

  // === وظائف مساعدة ===
  async loadInitialData() {
    this.setLoading(true);
    this.clearError();

    try {
      // تحميل الفئات
      const categoriesResponse = await api.getCategories();
      if (categoriesResponse.success) {
        this.setCategories(categoriesResponse.data);
      }

      // تحميل قائمة اليوم
      const menuResponse = await api.getTodayMenu();
      if (menuResponse.success) {
        this.setCurrentMenu(menuResponse.data);
      }

      // تحميل جميع الوصفات
      const recipesResponse = await api.getAllRecipes();
      if (recipesResponse.success) {
        this.setRecipes(recipesResponse.data);
      }

    } catch (error) {
      console.error('خطأ في تحميل البيانات الأولية:', error);
      this.setError('فشل في تحميل البيانات');
    } finally {
      this.setLoading(false);
    }
  }

  // تحديث البيانات دورياً
  startPeriodicUpdates(interval = 5 * 60 * 1000) { // كل 5 دقائق
    this.updateInterval = setInterval(() => {
      this.loadInitialData();
    }, interval);
  }

  stopPeriodicUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

// إنشاء instance واحد للحالة العامة
const appState = new AppState();

// تصدير للاستخدام في الوحدات الأخرى
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AppState, appState };
} else {
  window.AppState = AppState;
  window.appState = appState;
}