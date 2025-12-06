// نظام المكونات البسيط
class ComponentManager {
  constructor() {
    this.components = new Map();
    this.templates = new Map();
  }

  // تسجيل مكون جديد
  register(name, component) {
    this.components.set(name, component);
  }

  // تسجيل قالب
  registerTemplate(name, template) {
    this.templates.set(name, template);
  }

  // إنشاء مكون
  create(name, props = {}, container = null) {
    const ComponentClass = this.components.get(name);
    if (!ComponentClass) {
      throw new Error(`المكون "${name}" غير مسجل`);
    }

    const instance = new ComponentClass(props);
    if (container) {
      instance.mount(container);
    }
    return instance;
  }

  // الحصول على قالب
  getTemplate(name) {
    return this.templates.get(name);
  }
}

// مكون أساسي
class BaseComponent {
  constructor(props = {}) {
    this.props = props;
    this.element = null;
    this.children = [];
    this.eventListeners = [];
  }

  // إنشاء العنصر
  createElement(tag, className = '', content = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content) element.textContent = content;
    return element;
  }

  // ربط مستمع حدث
  addEventListener(element, event, handler) {
    element.addEventListener(event, handler);
    this.eventListeners.push({ element, event, handler });
  }

  // إزالة جميع مستمعي الأحداث
  removeEventListeners() {
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];
  }

  // تركيب المكون في DOM
  mount(container) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    if (container && this.element) {
      container.appendChild(this.element);
    }
  }

  // إزالة المكون من DOM
  unmount() {
    this.removeEventListeners();
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }

  // تحديث المكون
  update(newProps) {
    this.props = { ...this.props, ...newProps };
    this.render();
  }

  // رندر المكون (يجب تنفيذها في المكونات الفرعية)
  render() {
    throw new Error('يجب تنفيذ دالة render في المكون الفرعي');
  }
}

// مكون بطاقة الوصفة
class RecipeCard extends BaseComponent {
  constructor(props) {
    super(props);
    this.render();
  }

  render() {
    const { recipe } = this.props;
    
    this.element = this.createElement('div', 'recipe-card');
    this.element.innerHTML = `
      <div class="recipe-image">
        <img src="assets/img/${recipe.image ? recipe.image : 'placeholder.jpg'}" alt="${recipe.name}" loading="lazy" onerror="this.onerror=null;this.src='assets/img/placeholder.jpg';">
        <div class="recipe-rating">
          <span class="stars">${this.generateStars(recipe.rating || 0)}</span>
          <span class="rating-text">${recipe.rating || 0}</span>
        </div>
      </div>
      <div class="recipe-content">
        <h3 class="recipe-name">${recipe.name}</h3>
        <p class="recipe-description">${recipe.description}</p>
        <div class="recipe-meta">
          <span class="prep-time">⏱ ${recipe.preparationTime || 30} دقيقة</span>
          <span class="price">${recipe.price} ريال</span>
        </div>
        <div class="recipe-actions">
          <button class="btn btn-primary add-to-cart" ${!recipe.isAvailable ? 'disabled' : ''}>
            ${recipe.isAvailable ? 'إضافة للسلة' : 'غير متوفر'}
          </button>
          <button class="btn btn-secondary view-details">عرض التفاصيل</button>
        </div>
      </div>
    `;

    // ربط الأحداث
    const addToCartBtn = this.element.querySelector('.add-to-cart');
    const viewDetailsBtn = this.element.querySelector('.view-details');

    if (recipe.isAvailable) {
      this.addEventListener(addToCartBtn, 'click', () => {
        appState.addToCart(recipe);
        notifications.success(`تم إضافة ${recipe.name} للسلة`);
      });
    }

    this.addEventListener(viewDetailsBtn, 'click', () => {
      this.showRecipeDetails(recipe);
    });
  }

  generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';

    for (let i = 0; i < fullStars; i++) {
      stars += '★';
    }
    if (hasHalfStar) {
      stars += '☆';
    }
    for (let i = fullStars + (hasHalfStar ? 1 : 0); i < 5; i++) {
      stars += '☆';
    }

    return stars;
  }

  showRecipeDetails(recipe) {
    const modal = componentManager.create('RecipeModal', { recipe });
    modal.show();
  }
}

// مكون عنصر السلة
class CartItem extends BaseComponent {
  constructor(props) {
    super(props);
    this.render();
  }

  render() {
    const { item } = this.props;
    
    this.element = this.createElement('div', 'cart-item');
      this.element.innerHTML = `
        <div class="item-image">
          <img src="${item.image ? item.image : 'assets/img/placeholder.jpg'}" alt="${item.name}" onerror="this.onerror=null;this.src='assets/img/placeholder.jpg';">
        </div>
      <div class="item-details">
        <h4 class="item-name">${item.name}</h4>
        <p class="item-price">${item.price} ريال</p>
      </div>
      <div class="item-quantity">
        <button class="quantity-btn minus">-</button>
        <span class="quantity">${item.quantity}</span>
        <button class="quantity-btn plus">+</button>
      </div>
      <div class="item-total">
        ${(item.price * item.quantity).toFixed(2)} ريال
      </div>
      <button class="remove-item">×</button>
    `;

    // ربط الأحداث
    const minusBtn = this.element.querySelector('.minus');
    const plusBtn = this.element.querySelector('.plus');
    const removeBtn = this.element.querySelector('.remove-item');

      this.addEventListener(minusBtn, 'click', () => {
        if (typeof window.updateCartQuantity === 'function') {
          window.updateCartQuantity(item.id, item.quantity - 1);
        }
      });

      this.addEventListener(plusBtn, 'click', () => {
        if (typeof window.updateCartQuantity === 'function') {
          window.updateCartQuantity(item.id, item.quantity + 1);
        }
      });

      this.addEventListener(removeBtn, 'click', () => {
        if (typeof window.removeFromCartCompletely === 'function') {
          window.removeFromCartCompletely(item.id);
        } else if (typeof appState.removeFromCart === 'function') {
          appState.removeFromCart(item.id);
        }
      });
  }
}

// مكون نافذة منبثقة للوصفة
class RecipeModal extends BaseComponent {
  constructor(props) {
    super(props);
    this.render();
  }

  render() {
    const { recipe } = this.props;
    
    this.element = this.createElement('div', 'modal-overlay');
    this.element.innerHTML = `
      <div class="modal-content recipe-modal">
        <button class="modal-close">×</button>
        <div class="modal-header">
          <img src="${recipe.image || '/assets/img/placeholder.jpg'}" alt="${recipe.name}" class="modal-image">
          <div class="modal-info">
            <h2>${recipe.name}</h2>
            <p class="recipe-price">${recipe.price} ريال</p>
            <div class="recipe-rating">
              <span class="stars">${this.generateStars(recipe.rating || 0)}</span>
              <span class="rating-text">(${recipe.rating || 0})</span>
            </div>
          </div>
        </div>
        <div class="modal-body">
          <div class="recipe-description">
            <h3>الوصف</h3>
            <p>${recipe.description}</p>
          </div>
          ${recipe.ingredients && recipe.ingredients.length > 0 ? `
            <div class="recipe-ingredients">
              <h3>المكونات</h3>
              <ul>
                ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          <div class="recipe-meta">
            <div class="meta-item">
              <strong>وقت التحضير:</strong> ${recipe.preparationTime || 30} دقيقة
            </div>
            <div class="meta-item">
              <strong>الحالة:</strong> ${recipe.isAvailable ? 'متوفر' : 'غير متوفر'}
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary close-modal">إغلاق</button>
          <button class="btn btn-primary add-to-cart" ${!recipe.isAvailable ? 'disabled' : ''}>
            ${recipe.isAvailable ? 'إضافة للسلة' : 'غير متوفر'}
          </button>
        </div>
      </div>
    `;

    // ربط الأحداث
    const closeBtn = this.element.querySelector('.modal-close');
    const closeModalBtn = this.element.querySelector('.close-modal');
    const addToCartBtn = this.element.querySelector('.add-to-cart');

    this.addEventListener(closeBtn, 'click', () => this.hide());
    this.addEventListener(closeModalBtn, 'click', () => this.hide());
    this.addEventListener(this.element, 'click', (e) => {
      if (e.target === this.element) this.hide();
    });

    if (recipe.isAvailable) {
      this.addEventListener(addToCartBtn, 'click', () => {
        appState.addToCart(recipe);
        notifications.success(`تم إضافة ${recipe.name} للسلة`);
        this.hide();
      });
    }
  }

  generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';

    for (let i = 0; i < fullStars; i++) {
      stars += '★';
    }
    if (hasHalfStar) {
      stars += '☆';
    }
    for (let i = fullStars + (hasHalfStar ? 1 : 0); i < 5; i++) {
      stars += '☆';
    }

    return stars;
  }

  show() {
    document.body.appendChild(this.element);
    document.body.style.overflow = 'hidden';
    
    // أنيميشن الظهور
    setTimeout(() => {
      this.element.style.opacity = '1';
      this.element.querySelector('.modal-content').style.transform = 'scale(1)';
    }, 10);
  }

  hide() {
    this.element.style.opacity = '0';
    this.element.querySelector('.modal-content').style.transform = 'scale(0.9)';
    
    setTimeout(() => {
      this.unmount();
      document.body.style.overflow = '';
    }, 300);
  }
}

// مدير المكونات العام
const componentManager = new ComponentManager();

// تسجيل المكونات
componentManager.register('RecipeCard', RecipeCard);
componentManager.register('CartItem', CartItem);
componentManager.register('RecipeModal', RecipeModal);

// تصدير للاستخدام في الوحدات الأخرى
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    ComponentManager, 
    BaseComponent, 
    RecipeCard, 
    CartItem, 
    RecipeModal, 
    componentManager 
  };
} else {
  window.ComponentManager = ComponentManager;
  window.BaseComponent = BaseComponent;
  window.RecipeCard = RecipeCard;
  window.CartItem = CartItem;
  window.RecipeModal = RecipeModal;
  window.componentManager = componentManager;
}