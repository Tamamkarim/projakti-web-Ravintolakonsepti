// نظام إدارة متقدم لمشروع المطعم
class AdminPanel {
  constructor() {
    this.currentSection = 'dashboard';
    this.currentRecipe = null;
    this.isLoggedIn = false;
    this.autoRefreshInterval = null;
    this.recipes = [];
    this.orders = [];
    this.categories = [];
    
    this.init();
  }

  async init() {
    this.bindEvents();
    this.checkAuthentication();
    
    // تحميل البيانات الأولية إذا كان المستخدم مسجل دخول
    if (this.isLoggedIn) {
      await this.loadInitialData();
      this.startAutoRefresh();
    }
  }

  bindEvents() {
    // أحداث القائمة الجانبية
    document.querySelectorAll('.admin-menu-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = e.target.closest('.admin-menu-link').dataset.section;
        this.switchSection(section);
      });
    });

    // أحداث تسجيل الدخول
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', this.handleLogin.bind(this));
    }
    
    const logoutBtn = document.getElementById('btnAdminLogout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', this.handleLogout.bind(this));
    }

    // أحداث العودة للصفحة الرئيسية
    const backToMainBtn = document.getElementById('btnBackToMain');
    if (backToMainBtn) {
      backToMainBtn.addEventListener('click', this.handleBackToMain.bind(this));
    }
    
    const backToMainSidebarBtn = document.getElementById('btnBackToMainSidebar');
    if (backToMainSidebarBtn) {
      backToMainSidebarBtn.addEventListener('click', this.handleBackToMain.bind(this));
    }

    // أحداث إدارة الوصفات
    const addDishBtn = document.getElementById('btnAddDish');
    if (addDishBtn) {
      addDishBtn.addEventListener('click', () => this.openRecipeModal());
    }
    
    const recipeForm = document.getElementById('recipeForm');
    if (recipeForm) {
      recipeForm.addEventListener('submit', this.handleRecipeSubmit.bind(this));
    }
    
    // أحداث التصفية والبحث
    const menuSearch = document.getElementById('menuSearch');
    if (menuSearch) {
      menuSearch.addEventListener('input', this.filterRecipes.bind(this));
    }
    
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', this.filterRecipes.bind(this));
    }
    
    const availabilityFilter = document.getElementById('availabilityFilter');
    if (availabilityFilter) {
      availabilityFilter.addEventListener('change', this.filterRecipes.bind(this));
    }
    
    const orderStatusFilter = document.getElementById('orderStatusFilter');
    if (orderStatusFilter) {
      orderStatusFilter.addEventListener('change', this.filterOrders.bind(this));
    }

    // أحداث التحديث
    const refreshStatsBtn = document.getElementById('btnRefreshStats');
    if (refreshStatsBtn) {
      refreshStatsBtn.addEventListener('click', this.loadDashboardStats.bind(this));
    }
    
    const refreshOrdersBtn = document.getElementById('btnRefreshOrders');
    if (refreshOrdersBtn) {
      refreshOrdersBtn.addEventListener('click', this.loadOrders.bind(this));
    }

    // إغلاق النوافذ المنبثقة
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', this.closeModals.bind(this));
    });

    // إغلاق النافذة عند النقر خارجها
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.closeModals();
        }
      });
    });
  }

  checkAuthentication() {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      api.setToken(token);
      this.isLoggedIn = true;
      this.showAdminPanel();
    } else {
      this.showLoginModal();
    }
  }

  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    try {
      this.showLoading(true);
      const response = await api.login(email, password);
      
      if (response.success) {
        // التحقق من صلاحيات الإدارة
        const hasAdminAccess = await api.checkAdminAccess();
        if (hasAdminAccess) {
          this.isLoggedIn = true;
          this.showAdminPanel();
          await this.loadInitialData();
          this.startAutoRefresh();
          notifications.success('Kirjautuminen onnistui');
        } else {
          notifications.error('Sinulla ei ole hallintaoikeuksia');
          api.logout();
        }
      } else {
        notifications.error(response.error || 'Kirjautuminen epäonnistui');
      }
    } catch (error) {
      console.error('Login error:', error);
      notifications.error('Virhe kirjautumisessa');
    } finally {
      this.showLoading(false);
    }
  }

  handleLogout() {
    api.logout();
    this.isLoggedIn = false;
    this.stopAutoRefresh();
    this.showLoginModal();
    notifications.info('Olet kirjautunut ulos');
  }

  handleBackToMain() {
    // إشعار المستخدم بالانتقال
    if (typeof notifications !== 'undefined') {
      notifications.info('جاري الانتقال إلى الصفحة الرئيسية...');
    }
    
    // الانتقال إلى الصفحة الرئيسية مع الحفاظ على حالة تسجيل الدخول
    setTimeout(() => {
      window.location.href = './index.html';
    }, 300);
  }

  showLoginModal() {
    const loginModal = document.getElementById('loginModal');
    const adminMain = document.querySelector('.admin-main');
    const adminHeader = document.querySelector('.admin-header');
    
    if (loginModal) loginModal.style.display = 'flex';
    if (adminMain) adminMain.style.display = 'none';
    if (adminHeader) adminHeader.style.display = 'none';
  }

  showAdminPanel() {
    const loginModal = document.getElementById('loginModal');
    const adminMain = document.querySelector('.admin-main');
    const adminHeader = document.querySelector('.admin-header');
    
    if (loginModal) loginModal.style.display = 'none';
    if (adminMain) adminMain.style.display = 'flex';
    if (adminHeader) adminHeader.style.display = 'block';
  }

  showLoading(show) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
      loadingOverlay.style.display = show ? 'flex' : 'none';
    }
  }

  switchSection(sectionName) {
    // إخفاء جميع الأقسام
    document.querySelectorAll('.admin-section').forEach(section => {
      section.classList.remove('active');
    });

    // إزالة الفئة النشطة من جميع الروابط
    document.querySelectorAll('.admin-menu-link').forEach(link => {
      link.classList.remove('active');
    });

    // إظهار القسم المحدد
    const targetSection = document.getElementById(sectionName);
    const targetLink = document.querySelector(`[data-section="${sectionName}"]`);
    
    if (targetSection) targetSection.classList.add('active');
    if (targetLink) targetLink.classList.add('active');

    this.currentSection = sectionName;

    // تحميل بيانات القسم
    this.loadSectionData(sectionName);
  }

  async loadInitialData() {
    try {
      await Promise.all([
        this.loadCategories(),
        this.loadDashboardStats(),
        this.loadRecipes(),
        this.loadOrders()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      notifications.error('Virhe tietojen lataamisessa');
    }
  }

  async loadSectionData(sectionName) {
    switch (sectionName) {
      case 'dashboard':
        await this.loadDashboardStats();
        break;
      case 'menu-management':
        await this.loadRecipes();
        break;
      case 'orders':
        await this.loadOrders();
        break;
      case 'categories':
        await this.loadCategories();
        break;
      case 'customers':
        await this.loadCustomers();
        break;
    }
  }

  async loadDashboardStats() {
    try {
      const response = await api.getAdminStats();
      if (response.success) {
        const stats = response.data;
        
        const totalOrdersEl = document.getElementById('totalOrders');
        const totalRevenueEl = document.getElementById('totalRevenue');
        const totalRecipesEl = document.getElementById('totalRecipes');
        const totalUsersEl = document.getElementById('totalUsers');
        
        if (totalOrdersEl) totalOrdersEl.textContent = stats.totalOrders || 0;
        if (totalRevenueEl) totalRevenueEl.textContent = `${(stats.totalRevenue || 0).toFixed(2)} €`;
        if (totalRecipesEl) totalRecipesEl.textContent = stats.totalRecipes || 0;
        if (totalUsersEl) totalUsersEl.textContent = stats.totalUsers || 0;

        // عرض الطلبات الأخيرة
        this.renderRecentOrders(stats.recentOrders || []);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      notifications.error('Virhe tilastojen lataamisessa');
    }
  }

  renderRecentOrders(orders) {
    const container = document.getElementById('recentOrdersList');
    if (!container) return;
    
    if (!orders.length) {
      container.innerHTML = '<p class="empty-state">Ei viimeaikaisia tilauksia</p>';
      return;
    }

    container.innerHTML = orders.map(order => `
      <div class="recent-order-item">
        <div class="order-info">
          <strong>#${order.id}</strong>
          <span>${order.customerName}</span>
        </div>
        <div class="order-details">
          <span class="order-status status-${order.status}">${this.getStatusText(order.status)}</span>
          <span class="order-total">${parseFloat(order.totalAmount || order.total_amount || 0).toFixed(2)} €</span>
        </div>
      </div>
    `).join('');
  }

  async loadCategories() {
    try {
      const response = await api.getCategories();
      if (response.success) {
        this.categories = response.data;
        this.renderCategories(response.data);
        this.populateCategorySelects(response.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  populateCategorySelects(categories) {
    const selects = ['#categoryFilter', '#recipeCategory'];
    
    selects.forEach(selector => {
      const select = document.querySelector(selector);
      if (select) {
        // الاحتفاظ بالخيار الأول
        const firstOption = select.querySelector('option');
        select.innerHTML = '';
        if (firstOption) select.appendChild(firstOption);
        
        categories.forEach(category => {
          const option = document.createElement('option');
          option.value = category.id;
          option.textContent = category.name;
          select.appendChild(option);
        });
      }
    });
  }

  renderCategories(categories) {
    const container = document.getElementById('categoriesGrid');
    if (!container) return;

    container.innerHTML = categories.map(category => `
      <div class="category-card">
        <img src="${category.image || '/assets/img/placeholder.jpg'}" alt="${category.name}">
        <div class="category-info">
          <h3>${category.name}</h3>
          <p>${category.description}</p>
        </div>
        <div class="category-actions">
          <button class="btn secondary small" data-action="edit" data-category-id="${category.id}">
            Muokkaa
          </button>
        </div>
      </div>
    `).join('');
    
    // Add event delegation for category action buttons
    this.setupCategoryEventListeners();
  }
  
  setupCategoryEventListeners() {
    const container = document.getElementById('categoriesGrid');
    if (!container) return;
    
    container.addEventListener('click', (e) => {
      const button = e.target.closest('button[data-action]');
      if (!button) return;
      
      const action = button.dataset.action;
      const categoryId = button.dataset.categoryId;
      
      if (action === 'edit') {
        this.editCategory(categoryId);
      }
    });
  }

  async loadRecipes() {
    try {
      const response = await api.getAllRecipes();
      if (response.success) {
        this.recipes = response.data;
        this.renderRecipes(this.recipes);
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
      notifications.error('Virhe ruokalistaa ladattaessa');
    }
  }

  renderRecipes(recipes) {
    const tbody = document.getElementById('menuTableBody');
    if (!tbody) return;

    if (!recipes.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Ei ruokalajeja</td></tr>';
      return;
    }

    tbody.innerHTML = recipes.map(recipe => {
      return `
      <tr>
        <td>
          <img src="${recipe.image || '/assets/img/placeholder.jpg'}" alt="${recipe.name}" class="recipe-thumbnail">
        </td>
        <td>
          <div class="recipe-name-cell">
            <strong>${recipe.name}</strong>
            <small>${recipe.nameEn || ''}</small>
          </div>
        </td>
        <td>${this.getCategoryName(recipe.category)}</td>
        <td>${parseFloat(recipe.price || 0).toFixed(2)} €</td>
        <td>
          <span class="status-badge ${recipe.isAvailable ? 'available' : 'unavailable'}">
            ${recipe.isAvailable ? 'Saatavilla' : 'Ei saatavilla'}
          </span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn secondary small" data-action="edit" data-recipe-id="${recipe.id}">
              Muokkaa
            </button>
            <button class="btn danger small" data-action="delete" data-recipe-id="${recipe.id}">
              Poista
            </button>
          </div>
        </td>
      </tr>
      `;
    }).join('');
    
    // Add event delegation for recipe action buttons
    this.setupRecipeEventListeners();
  }
  
  setupRecipeEventListeners() {
    const tbody = document.getElementById('menuTableBody');
    if (!tbody) return;
    
    tbody.addEventListener('click', (e) => {
      const button = e.target.closest('button[data-action]');
      if (!button) return;
      
      const action = button.dataset.action;
      const recipeId = button.dataset.recipeId;
      
      if (action === 'edit') {
        this.editRecipe(recipeId);
      } else if (action === 'delete') {
        this.deleteRecipe(recipeId);
      }
    });
  }

  filterRecipes() {
    if (!this.recipes) return;

    const searchInput = document.getElementById('menuSearch');
    const categorySelect = document.getElementById('categoryFilter');
    const availabilitySelect = document.getElementById('availabilityFilter');
    
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const categoryFilter = categorySelect ? categorySelect.value : '';
    const availabilityFilter = availabilitySelect ? availabilitySelect.value : '';

    const filtered = this.recipes.filter(recipe => {
      const matchesSearch = !searchTerm || 
        recipe.name.toLowerCase().includes(searchTerm) ||
        (recipe.nameEn && recipe.nameEn.toLowerCase().includes(searchTerm)) ||
        recipe.description.toLowerCase().includes(searchTerm);

      const matchesCategory = !categoryFilter || recipe.category === categoryFilter;
      
      const matchesAvailability = !availabilityFilter || 
        recipe.isAvailable.toString() === availabilityFilter;

      return matchesSearch && matchesCategory && matchesAvailability;
    });

    this.renderRecipes(filtered);
  }

  async loadOrders() {
    try {
      const response = await api.getAllOrders();
      if (response.success) {
        this.orders = response.data;
        this.renderOrders(this.orders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      notifications.error('Virhe tilauksia ladattaessa');
    }
  }

  renderOrders(orders) {
    const container = document.getElementById('ordersGrid');
    if (!container) return;

    if (!orders.length) {
      container.innerHTML = '<p class="empty-state">Ei tilauksia</p>';
      return;
    }

    container.innerHTML = orders.map(order => `
      <div class="order-card">
        <div class="order-header">
          <span class="order-id">#${order.id}</span>
          <span class="order-date">${new Date(order.createdAt).toLocaleDateString('fi-FI')}</span>
        </div>
        
        <div class="order-customer">
          <strong>${order.customerName}</strong>
          <p>${order.customerPhone}</p>
          ${order.customerEmail ? `<p>${order.customerEmail}</p>` : ''}
        </div>
        
        <div class="order-items">
          <h4>Tilauksen sisältö:</h4>
          <ul>
            ${order.items.map(item => `
              <li>${item.quantity}x ${item.recipeName} - ${parseFloat(item.total || item.subtotal || 0).toFixed(2)} €</li>
            `).join('')}
          </ul>
        </div>
        
        <div class="order-total">
          <strong>Yhteensä: ${parseFloat(order.totalAmount || order.total_amount || 0).toFixed(2)} €</strong>
        </div>
        
        <div class="order-status">
          <select class="status-select" data-order-id="${order.id}">
            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Odottaa</option>
            <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Vahvistettu</option>
            <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Valmistetaan</option>
            <option value="ready" ${order.status === 'ready' ? 'selected' : ''}>Valmis</option>
            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Toimitettu</option>
            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Peruutettu</option>
          </select>
        </div>
        
        ${order.notes ? `<div class="order-notes"><strong>Huomautukset:</strong> ${order.notes}</div>` : ''}
      </div>
    `).join('');
    
    // Add event delegation for order status selects
    this.setupOrderEventListeners();
  }
  
  setupOrderEventListeners() {
    const container = document.getElementById('ordersGrid');
    if (!container) return;
    
    container.addEventListener('change', (e) => {
      if (e.target.classList.contains('status-select')) {
        const orderId = e.target.dataset.orderId;
        const newStatus = e.target.value;
        this.updateOrderStatus(orderId, newStatus);
      }
    });
  }

  filterOrders() {
    if (!this.orders) return;

    const statusFilter = document.getElementById('orderStatusFilter');
    const filterValue = statusFilter ? statusFilter.value : '';
    
    const filtered = filterValue ? 
      this.orders.filter(order => order.status === filterValue) : 
      this.orders;

    this.renderOrders(filtered);
  }

  async updateOrderStatus(orderId, newStatus) {
    try {
      const response = await api.updateOrderStatus(orderId, newStatus);
      if (response.success) {
        notifications.success('Tilauksen tila päivitetty');
        // تحديث البيانات المحلية
        const orderIndex = this.orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
          this.orders[orderIndex].status = newStatus;
        }
      } else {
        notifications.error('Tilauksen tilan päivittäminen epäonnistui');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      notifications.error('Virhe tilauksen tilan päivittämisessä');
    }
  }

  openRecipeModal(recipeId = null) {
    this.currentRecipe = recipeId;
    const modal = document.getElementById('recipeModal');
    const title = document.getElementById('recipeModalTitle');
    const form = document.getElementById('recipeForm');

    if (!modal || !title || !form) return;

    if (recipeId) {
      const recipe = this.recipes.find(r => r.id === recipeId);
      if (recipe) {
        title.textContent = 'Muokkaa ruokalajia';
        this.populateRecipeForm(recipe);
      }
    } else {
      title.textContent = 'Lisää uusi ruokalaji';
      form.reset();
      const availableCheckbox = document.getElementById('recipeAvailable');
      if (availableCheckbox) availableCheckbox.checked = true;
    }

    modal.style.display = 'flex';
  }

  populateRecipeForm(recipe) {
    const fields = [
      { id: 'recipeName', value: recipe.name || '' },
      { id: 'recipeNameEn', value: recipe.nameEn || '' },
      { id: 'recipeDescription', value: recipe.description || '' },
      { id: 'recipePrice', value: recipe.price || '' },
      { id: 'recipeCategory', value: recipe.category || '' },
      { id: 'recipePreparationTime', value: recipe.preparationTime || '' },
      { id: 'recipeImage', value: recipe.image || '' }
    ];

    fields.forEach(field => {
      const element = document.getElementById(field.id);
      if (element) element.value = field.value;
    });

    const ingredientsEl = document.getElementById('recipeIngredients');
    if (ingredientsEl) {
      ingredientsEl.value = recipe.ingredients ? recipe.ingredients.join('\n') : '';
    }

    const availableEl = document.getElementById('recipeAvailable');
    if (availableEl) {
      availableEl.checked = recipe.isAvailable !== false;
    }
  }

  async handleRecipeSubmit(e) {
    e.preventDefault();
    
    const formData = {
      name: document.getElementById('recipeName').value,
      nameEn: document.getElementById('recipeNameEn').value,
      description: document.getElementById('recipeDescription').value,
      price: parseFloat(document.getElementById('recipePrice').value),
      category: document.getElementById('recipeCategory').value,
      preparationTime: parseInt(document.getElementById('recipePreparationTime').value) || 30,
      image: document.getElementById('recipeImage').value,
      ingredients: document.getElementById('recipeIngredients').value.split('\n').filter(i => i.trim()),
      isAvailable: document.getElementById('recipeAvailable').checked
    };

    try {
      let response;
      if (this.currentRecipe) {
        response = await api.updateRecipe(this.currentRecipe, formData);
      } else {
        response = await api.createRecipe(formData);
      }

      if (response.success) {
        notifications.success(this.currentRecipe ? 'Ruokalaji päivitetty' : 'Ruokalaji lisätty');
        this.closeModals();
        await this.loadRecipes();
      } else {
        notifications.error(response.error || 'Ruokalajin tallentaminen epäonnistui');
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      notifications.error('Virhe ruokalajin tallentamisessa');
    }
  }

  async editRecipe(recipeId) {
    this.openRecipeModal(recipeId);
  }

  async deleteRecipe(recipeId) {
    if (!confirm('Oletko varma, että haluat poistaa tämän ruokalajin?')) return;

    try {
      const response = await api.deleteRecipe(recipeId);
      if (response.success) {
        notifications.success('Ruokalaji poistettu');
        await this.loadRecipes();
      } else {
        notifications.error('Ruokalajin poistaminen epäonnistui');
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
      notifications.error('Virhe ruokalajin poistamisessa');
    }
  }

  async loadCustomers() {
    try {
      const response = await api.getAllUsers();
      if (response.success) {
        this.renderCustomers(response.data);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      notifications.error('Virhe asiakkaiden lataamisessa');
    }
  }

  renderCustomers(customers) {
    const tbody = document.getElementById('customersTableBody');
    if (!tbody) return;

    if (!customers.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Ei rekisteröityneitä asiakkaita</td></tr>';
      return;
    }

    tbody.innerHTML = customers.map(customer => `
      <tr>
        <td>${customer.name}</td>
        <td>${customer.email}</td>
        <td>${new Date(customer.createdAt).toLocaleDateString('fi-FI')}</td>
        <td>0</td>
        <td>
          <button class="btn secondary small" data-action="view" data-customer-id="${customer.id}">
            Näytä tiedot
          </button>
        </td>
      </tr>
    `).join('');
    
    // Add event delegation for customer action buttons
    this.setupCustomerEventListeners();
  }
  
  setupCustomerEventListeners() {
    const tbody = document.getElementById('customersTableBody');
    if (!tbody) return;
    
    tbody.addEventListener('click', (e) => {
      const button = e.target.closest('button[data-action]');
      if (!button) return;
      
      const action = button.dataset.action;
      const customerId = button.dataset.customerId;
      
      if (action === 'view') {
        this.viewCustomerDetails(customerId);
      }
    });
  }

  closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.style.display = 'none';
    });
    this.currentRecipe = null;
  }

  startAutoRefresh() {
    const autoRefreshEl = document.getElementById('autoRefresh');
    const autoRefreshEnabled = autoRefreshEl ? autoRefreshEl.checked : false;
    
    if (autoRefreshEnabled) {
      this.autoRefreshInterval = setInterval(() => {
        this.loadSectionData(this.currentSection);
      }, 30000); // كل 30 ثانية
    }
  }

  stopAutoRefresh() {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
      this.autoRefreshInterval = null;
    }
  }

  getCategoryName(categoryId) {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  }

  getStatusText(status) {
    const statusTexts = {
      'pending': 'Odottaa',
      'confirmed': 'Vahvistettu',
      'preparing': 'Valmistetaan',
      'ready': 'Valmis',
      'delivered': 'Toimitettu',
      'cancelled': 'Peruutettu'
    };
    return statusTexts[status] || status;
  }
}

// إنشاء instance عندما يتم تحميل الصفحة
let adminPanel;

document.addEventListener('DOMContentLoaded', () => {
  adminPanel = new AdminPanel();
});

// وظائف عامة للاستخدام في HTML
function closeRecipeModal() {
  const modal = document.getElementById('recipeModal');
  if (modal) modal.style.display = 'none';
}

async function fetchOrders() {
  try {
    const response = await fetch('http://localhost:3000/api/orders');
    if (!response.ok) throw new Error('حدث خطأ في جلب البيانات');
    const orders = await response.json();
    // هنا يمكنك عرض الطلبات في الصفحة
    console.log(orders);
  } catch (error) {
    console.error(error);
  }
}