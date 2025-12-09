// APRICUS - Modern Restaurant Application
// Enhanced with Finnish language and improved UI/UX

console.log('🍽️ Apricus - Ravintolasovellus käynnistyy...');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM valmis, tarkistetaan riippuvuudet...');
    
    // Check for required dependencies
    function checkDependencies() {
        const required = ['fetchTodayMenu', 'escapeHtml'];
        const cartRequired = ['loadCart', 'addToCart', 'removeFromCart', 'updateQty', 'clearCart', 'cartTotal'];
        
        const apiReady = required.every(name => typeof window[name] === 'function');
        const cartReady = cartRequired.every(name => typeof window[name] === 'function');
        
        return apiReady && cartReady;
    }
    
    // Initialize when dependencies are ready
    let checkCount = 0;
    const maxChecks = 50;
    
    function initWhenReady() {
        if (checkDependencies()) {
            console.log('✅ Kaikki riippuvuudet valmiina, käynnistetään sovellus');
            initializeModernApp();
        } else if (checkCount < maxChecks) {
            checkCount++;
            console.log(`⏳ Odotetaan riippuvuuksia... (${checkCount}/${maxChecks})`);
            setTimeout(initWhenReady, 100);
        } else {
            console.error('❌ Riippuvuudet eivät ole valmiina');
            showNotification('Sovelluksen lataus epäonnistui. Päivitä sivu.', 'error');
        }
    }
    
    initWhenReady();
});

// Main application initialization
function initializeModernApp() {
    console.log('🎯 Käynnistetään moderni Apricus-sovellus...');
    
    // Get required functions from window
    const { fetchTodayMenu, registerUser, loginUser, postOrder, escapeHtml } = window;
    const { loadCart, saveCart, addToCart, removeFromCart, updateQty, clearCart, cartTotal } = window;

    // Application state
    const appState = {
        menu: [],
        filteredMenu: [],
        favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),
        cart: loadCart(),
        user: null,
        currentCategory: 'all',
        filters: {
            vegan: false,
            vegetarian: false,
            glutenFree: false,
            lactoseFree: false,
            allergens: [],
            maxPrice: 50
        },
        // Add cart methods that components expect
        addToCart: function(recipe) {
            if (typeof window.addToCart === 'function') {
                window.addToCart(recipe.id || recipe, 1);
            }
        },
        updateCartQuantity: function(itemId, quantity) {
            if (typeof window.updateQty === 'function') {
                window.updateQty(itemId, quantity);
            }
        },
        removeFromCart: function(itemId) {
            if (typeof window.removeFromCart === 'function') {
                window.removeFromCart(itemId);
            }
        }
    };

    // Make appState globally available for components
    window.appState = appState;

    // Initialize UI components
    initializeHeader();
    initializeFilters();
    initializeMenu();
    initializeCart();
    initializeFavorites();
    initializeAuth();
    
    // جعل updateCartUI متاحة عالمياً قبل أي شيء
    window.updateCartUI = updateCartUI;
    
    // تحديث واجهة السلة أولاً لإخفاء/إظهار العداد بشكل صحيح
    updateCartUI();
    
    // Load initial data
    loadMenuData();
    checkAuthStatus();

    // Header functionality
    function initializeHeader() {
        console.log('🎯 Alustetaan navigaatio...');
        
        // Mobile menu toggle
        const mobileToggle = document.getElementById('mobileMenuToggle');
        const navigation = document.querySelector('.main-navigation');
        
        if (mobileToggle && navigation) {
            mobileToggle.addEventListener('click', () => {
                navigation.classList.toggle('active');
                mobileToggle.classList.toggle('active');
                document.getElementById('overlay').classList.toggle('active');
            });
        }

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        if (searchInput) {
            searchInput.addEventListener('input', debounce(handleSearch, 300));
            searchInput.addEventListener('input', debounce(showSearchSuggestions, 200));
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleSearch();
                    hideSearchSuggestions();
                }
            });
            
            // Hide suggestions when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.search-container')) {
                    hideSearchSuggestions();
                }
            });
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', handleSearch);
        }

        // Navigation links smooth scrolling
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = e.target.getAttribute('href');
                if (target && target.startsWith('#')) {
                    const element = document.querySelector(target);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        // Close mobile menu if open
                        navigation.classList.remove('active');
                        mobileToggle.classList.remove('active');
                        document.getElementById('overlay').classList.remove('active');
                    }
                }
            });
        });
    }

    // Enhanced Search functionality
    function handleSearch() {
        const query = document.getElementById('searchInput').value.toLowerCase().trim();
        console.log('🔍 Parannettu haku:', query);
        
        if (!query) {
            appState.filteredMenu = appState.menu;
        } else {
            appState.filteredMenu = appState.menu.filter(item => {
                // Haku nimessä (suomi ja englanti)
                const nameMatch = item.name.toLowerCase().includes(query) ||
                                (item.nameEn && item.nameEn.toLowerCase().includes(query));
                
                // Haku kuvauksessa
                const descMatch = item.description && item.description.toLowerCase().includes(query);
                
                // Haku ainesosissa
                const ingredientMatch = item.ingredients && 
                                      Array.isArray(item.ingredients) &&
                                      item.ingredients.some(ing => 
                                        typeof ing === 'string' && ing.toLowerCase().includes(query)
                                      );
                
                // Haku kategoriassa (support both string and number)
                const categoryMatch = item.category && 
                                    String(item.category).toLowerCase().includes(query);
                
                // Sumea haku (fuzzy search) nimille
                const fuzzyNameMatch = fuzzySearch(query, item.name.toLowerCase()) ||
                                     (item.nameEn && fuzzySearch(query, item.nameEn.toLowerCase()));
                
                return nameMatch || descMatch || ingredientMatch || categoryMatch || fuzzyNameMatch;
            });
        }
        
        renderMenu();
        showSearchResults(query);
        
        if (appState.filteredMenu.length === 0 && query) {
            showNotification(`Ei tuloksia haulle "${query}"`, 'info');
        }
    }

    // Fuzzy search function for better search results
    function fuzzySearch(query, text, threshold = 0.6) {
        if (query.length > text.length) return false;
        
        let score = 0;
        let queryIndex = 0;
        
        for (let i = 0; i < text.length && queryIndex < query.length; i++) {
            if (text[i] === query[queryIndex]) {
                score++;
                queryIndex++;
            }
        }
        
        return (score / query.length) >= threshold;
    }

    // Show search results summary
    function showSearchResults(query) {
        const searchResultsContainer = document.getElementById('searchResults');
        
        if (!searchResultsContainer) {
            // Create search results container if it doesn't exist
            const container = document.createElement('div');
            container.id = 'searchResults';
            container.className = 'search-results-summary';
            
            const menuSection = document.getElementById('menu');
            if (menuSection) {
                menuSection.insertBefore(container, menuSection.firstChild);
            }
        }
        
        const resultsContainer = document.getElementById('searchResults');
        
        if (query && resultsContainer) {
            const count = appState.filteredMenu.length;
            resultsContainer.innerHTML = `
                <div class="search-summary">
                    <h3>Hakutulokset: "${query}"</h3>
                    <p>Löydetty ${count} ${count === 1 ? 'tulos' : 'tulosta'}</p>
                    <button class="clear-search-btn" onclick="clearSearch()">Tyhjennä haku</button>
                </div>
            `;
            resultsContainer.style.display = 'block';
        } else if (resultsContainer) {
            resultsContainer.style.display = 'none';
        }
    }

    // Clear search function (make it global)
    window.clearSearch = function() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
        }
        appState.filteredMenu = appState.menu;
        renderMenu();
        const resultsContainer = document.getElementById('searchResults');
        if (resultsContainer) {
            resultsContainer.style.display = 'none';
        }
    };

    // Search suggestions functionality
    function showSearchSuggestions() {
        const query = document.getElementById('searchInput').value.toLowerCase().trim();
        
        if (query.length < 2) {
            hideSearchSuggestions();
            return;
        }
        
        const suggestions = appState.menu
            .filter(item => {
                return item.name.toLowerCase().includes(query) ||
                       (item.nameEn && item.nameEn.toLowerCase().includes(query)) ||
                       item.ingredients.some(ing => ing.toLowerCase().includes(query));
            })
            .slice(0, 5); // Show only top 5 suggestions
        
        displaySuggestions(suggestions);
    }

    function displaySuggestions(suggestions) {
        let suggestionsContainer = document.querySelector('.search-suggestions');
        
        if (!suggestionsContainer) {
            suggestionsContainer = document.createElement('div');
            suggestionsContainer.className = 'search-suggestions';
            document.querySelector('.search-container').appendChild(suggestionsContainer);
        }
        
        if (suggestions.length === 0) {
            hideSearchSuggestions();
            return;
        }
        
        suggestionsContainer.innerHTML = suggestions.map(item => `
            <div class="search-suggestion" onclick="selectSuggestion('${item.name}')">
                <div class="suggestion-name">${item.name}</div>
                <div class="suggestion-category">${getCategoryDisplayName(item.category)}</div>
            </div>
        `).join('');
        
        suggestionsContainer.style.display = 'block';
    }

    function hideSearchSuggestions() {
        const container = document.querySelector('.search-suggestions');
        if (container) {
            container.style.display = 'none';
        }
    }

    // Select suggestion (make it global)
    window.selectSuggestion = function(itemName) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = itemName;
        }
        handleSearch();
        hideSearchSuggestions();
    };

    // Get category display name
    function getCategoryDisplayName(category) {
        const categoryNames = {
            'appetizers': 'Alkuruoat',
            'main-dishes': 'Pääruoat', 
            'desserts': 'Jälkiruoat',
            'beverages': 'Juomat',
            'hot-beverages': 'Kuumat juomat'
        };
        return categoryNames[category] || category;
    }

    // Filters functionality
    function initializeFilters() {
        console.log('🎯 Alustetaan suodattimet...');
        
        // Filter checkboxes
        const filterCheckboxes = {
            'filter-vegan': 'vegan',
            'filter-vegetarian': 'vegetarian', 
            'filter-gluten-free': 'glutenFree',
            'filter-lactose-free': 'lactoseFree'
        };
        
        Object.entries(filterCheckboxes).forEach(([id, key]) => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    appState.filters[key] = e.target.checked;
                    console.log(`📋 Suodatin ${key}:`, e.target.checked);
                });
            }
        });

        // Allergen filter
        const allergenSelect = document.getElementById('allergenFilter');
        if (allergenSelect) {
            allergenSelect.addEventListener('change', (e) => {
                appState.filters.allergens = Array.from(e.target.selectedOptions).map(opt => opt.value);
                console.log('🚫 Allergeenit:', appState.filters.allergens);
            });
        }

        // Price range
        const priceRange = document.getElementById('priceRange');
        const maxPriceDisplay = document.getElementById('maxPrice');
        if (priceRange && maxPriceDisplay) {
            priceRange.addEventListener('input', (e) => {
                appState.filters.maxPrice = parseInt(e.target.value);
                maxPriceDisplay.textContent = appState.filters.maxPrice + '€';
            });
        }

        // Apply filters button
        const applyBtn = document.getElementById('applyFilters');
        if (applyBtn) {
            applyBtn.addEventListener('click', applyFilters);
        }

        // Clear filters button
        const clearBtn = document.getElementById('clearFilters');
        if (clearBtn) {
            clearBtn.addEventListener('click', clearFilters);
        }
    }

    function applyFilters() {
        console.log('🔧 Käytetään suodattimia:', appState.filters);
        
        appState.filteredMenu = appState.menu.filter(item => {
            // Category filter (use category_id for matching)
            if (appState.currentCategory !== 'all' && String(item.category_id) !== String(appState.currentCategory)) {
                return false;
            }
            // Dietary filters
            if (appState.filters.vegan && !item.vegan) return false;
            if (appState.filters.vegetarian && !item.vegetarian) return false;
            if (appState.filters.glutenFree && !item.glutenFree) return false;
            if (appState.filters.lactoseFree && !item.lactoseFree) return false;
            // Price filter
            if (item.price > appState.filters.maxPrice) return false;
            // Allergen filter
            if (appState.filters.allergens.length > 0) {
                const hasAllergen = appState.filters.allergens.some(allergen => 
                    item.allergens && item.allergens.includes(allergen)
                );
                if (hasAllergen) return false;
            }
            return true;
        });
        
        renderMenu();
        showNotification(`Suodattimet käytetty - ${appState.filteredMenu.length} tuotetta löytyi`, 'success');
    }

    function clearFilters() {
        console.log('🧹 Tyhjennetään suodattimet');
        
        // Reset filter state
        appState.filters = {
            vegan: false,
            vegetarian: false,
            glutenFree: false,
            lactoseFree: false,
            allergens: [],
            maxPrice: 50
        };
        
        // Reset UI elements
        document.querySelectorAll('#filters input[type="checkbox"]').forEach(cb => cb.checked = false);
        
        const allergenSelect = document.getElementById('allergenFilter');
        if (allergenSelect) {
            allergenSelect.selectedIndex = -1;
        }
        
        const priceRange = document.getElementById('priceRange');
        const maxPriceDisplay = document.getElementById('maxPrice');
        if (priceRange && maxPriceDisplay) {
            priceRange.value = 50;
            maxPriceDisplay.textContent = '50€';
        }
        
        // Reset menu
        appState.filteredMenu = appState.menu;
        renderMenu();
        
        showNotification('Suodattimet tyhjennetty', 'info');
    }

    // Menu functionality
    function initializeMenu() {
        console.log('🎯 Alustetaan ruokalista...');
        
        // Category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active state
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                // Update current category (use category_id if available)
                const catId = e.target.dataset.categoryId || e.target.dataset.category;
                appState.currentCategory = catId;
                console.log('📂 Kategoria vaihdettu:', appState.currentCategory);
                // Filter and render menu
                filterByCategory();
            });
        });
    }

    function filterByCategory() {
        if (appState.currentCategory === 'all') {
            appState.filteredMenu = appState.menu;
        } else {
            appState.filteredMenu = appState.menu.filter(item => {
                // Support both string and number comparison
                const itemCategory = String(item.category || '');
                const selectedCategory = String(appState.currentCategory || '');
                return itemCategory === selectedCategory;
            });
        }
        renderMenu();
    }

    async function loadMenuData() {
        console.log('📥 Ladataan ruokalistaa...');
        const loadingElement = document.querySelector('.loading-spinner');
        
        try {
            if (loadingElement) {
                loadingElement.style.display = 'block';
            }
            // امسح القائمة القديمة قبل تحميل الجديدة
            appState.menu = [];
            appState.filteredMenu = [];
            renderMenu();

            // احصل على اللغة المختارة من القائمة
            let lang = 'fi';
            const langSelect = document.getElementById('langSelect');
            if (langSelect && langSelect.value) {
                lang = langSelect.value;
            }
            const menuData = await fetchTodayMenu({ lang });
            console.log('📋 Ruokalista ladattu:', menuData.length, 'tuotetta');

            // بناء عناصر القائمة فقط من الحقول الصحيحة حسب اللغة
            appState.menu = menuData.map(item => {
                let ingredients = [];
                if (Array.isArray(item.ingredients)) {
                    ingredients = item.ingredients.map(ing => {
                        if (typeof ing === 'object' && ing !== null) {
                            return ing.ingredient_name || ing.name || String(ing);
                        }
                        return String(ing);
                    });
                }
                return {
                    ...item,
                    id: item.id || item.recipe_id,
                    name: lang === 'en' ? (item.nameEn || item.name_en || item.recipe_name_en || item.name) : (item.name || item.recipe_name),
                    description: lang === 'en' ? (item.descriptionEn || item.description_en || item.description) : (item.description || item.description_fi || ''),
                    price: parseFloat(item.price) || 0,
                    image: (item.image_url ? item.image_url.split('/').pop() : (item.image ? item.image.split('/').pop() : 'placeholder.jpg')),
                    category: item.category_id || item.category || 'mains',
                    vegan: item.vegan || false,
                    vegetarian: item.vegetarian || false,
                    glutenFree: item.glutenFree || item.gluten_free || false,
                    lactoseFree: item.lactoseFree || item.lactose_free || false,
                    allergens: item.allergens || [],
                    ingredients: ingredients
                };
            });

            appState.filteredMenu = appState.menu;
            renderMenu();

        } catch (error) {
            console.error('❌ Virhe ruokalistan lataamisessa:', error);
            showNotification('Ruokalistan lataus epäonnistui', 'error');
            
            // Show error state
            const menuGrid = document.getElementById('menuGrid');
            if (menuGrid) {
                menuGrid.innerHTML = `
                    <div class="error-state">
                        <div class="error-icon">😞</div>
                        <h3>Ruokalistan lataus epäonnistui</h3>
                        <p>Tarkista internetyhteytesi ja yritä uudelleen</p>
                        <button class="btn primary" onclick="location.reload()">Yritä uudelleen</button>
                    </div>
                `;
            }
        } finally {
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
        }
    }

    function renderMenu() {
        const menuGrid = document.getElementById('menuGrid');
        if (!menuGrid) return;
        
        if (appState.filteredMenu.length === 0) {
            menuGrid.innerHTML = `
                <div class="empty-menu">
                    <div class="empty-icon">🍽️</div>
                    <h3>Ei tuotteita löytynyt</h3>
                    <p>Kokeile erilaisia suodattimia tai hakuehtoja</p>
                </div>
            `;
            return;
        }
        
        // Get current language and translations
        let lang = 'fi';
        const langSelect = document.getElementById('langSelect');
        if (langSelect && langSelect.value) {
            lang = langSelect.value;
        }
        const t = (key) => (window.translations && window.translations[lang] && window.translations[lang][key]) ? window.translations[lang][key] : key;

        menuGrid.innerHTML = appState.filteredMenu.map(item => {
            // اختر الاسم والوصف الصحيحين حسب اللغة المختارة دائماً
            const itemName = lang === 'en'
                ? (item.nameEn || item.name_en || item.recipe_name_en || item.name)
                : (item.name || item.recipe_name);
            const itemDescription = lang === 'en'
                ? (item.descriptionEn || item.description_en || item.description)
                : (item.description || item.description_fi || '');
            return `
              <div class="menu-item" data-id="${item.id}">
                 <img src="${item.image_url || item.image || 'assets/img/placeholder.jpg'}" 
                     alt="${escapeHtml(itemName)}" 
                     class="menu-item-image"
                     onerror="this.src='assets/img/placeholder.jpg'">
                
                 <div class="menu-item-content">
                    <div class="menu-item-header">
                        <div>
                            <h3 class="menu-item-title">${escapeHtml(itemName)}</h3>
                            <div class="menu-item-price">${parseFloat(item.price || 0).toFixed(2)} €</div>
                        </div>
                        <button class="favorite-btn ${appState.favorites.includes(item.id) ? 'active' : ''}" 
                                onclick="toggleFavorite('${item.id}')" 
                                title="Lisää suosikkeihin">
                            ❤️
                        </button>
                    </div>
                    
                    <p class="menu-item-description">${escapeHtml(itemDescription)}</p>
                    
                    <div class="menu-item-tags">
                        ${item.vegan ? '<span class="menu-tag vegan">🌱 ' + t('vegan') + '</span>' : ''}
                        ${item.vegetarian ? '<span class="menu-tag vegetarian">🥬 ' + t('vegetarian') + '</span>' : ''}
                        ${item.glutenFree ? '<span class="menu-tag gluten-free">🌾 ' + t('glutenFree') + '</span>' : ''}
                        ${item.lactoseFree ? '<span class="menu-tag lactose-free">🥛 ' + t('lactoseFree') + '</span>' : ''}
                    </div>
                    
                    <div class="menu-item-actions">
                        <button class="btn secondary" onclick="showItemDetails('${item.id}')">
                            ${t('showDetails')}
                        </button>
                        <button class="btn primary" onclick="addToCartFromMenu('${item.id}')">
                            ${t('addToCart')}
                        </button>
                    </div>
                </div>
            </div>
        `;
        }).join('');
    }

    // Cart functionality
    function initializeCart() {
        console.log('🎯 Alustetaan ostoskori...');
        
        const cartBtn = document.getElementById('cartBtn');
        const cartSidebar = document.getElementById('cartSidebar');
        const closeCartBtn = document.getElementById('closeCart');
        const checkoutBtn = document.getElementById('checkoutBtn');
        
        if (cartBtn && cartSidebar) {
            cartBtn.addEventListener('click', () => {
                cartSidebar.classList.add('active');
                document.getElementById('overlay').classList.add('active');
                updateCartUI();
            });
        }
        
        if (closeCartBtn) {
            closeCartBtn.addEventListener('click', closeCart);
        }
        
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', handleCheckout);
        }
        
        
    }

    function closeCart() {
        console.log('🚪 إغلاق السلة');
        document.getElementById('cartSidebar').classList.remove('active');
        document.getElementById('overlay').classList.remove('active');
    }

    function updateCartUI() {
        const cartCount = document.getElementById('cartCount');
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        const checkoutBtn = document.getElementById('checkoutBtn');
        
        const cart = loadCart(); // هذا يعطي مصفوفة من cart.js
        const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
        const total = calculateCartTotal();
        
        console.log('🛒 Ostoskorin käyttöliittymän päivitys - tuotteiden määrä:', totalItems, 'ostoskorissa:', cart);
        
        if (cartCount) {
            if (totalItems > 0) {
                cartCount.textContent = totalItems;
                cartCount.style.display = 'block';
            } else {
                cartCount.textContent = '';
                cartCount.style.display = 'none';
            }
        }
        
        if (cartTotal) {
            cartTotal.textContent = total.toFixed(2) + ' €';
        }
        
        if (checkoutBtn) {
            checkoutBtn.disabled = totalItems === 0;
        }
        
        if (cartItems) {
            if (totalItems === 0) {
                cartItems.innerHTML = `
                    <div class="empty-cart">
                        <div class="empty-cart-icon">🛒</div>
                        <p>Ostoskorisi on tyhjä</p>
                        <small>Lisää tuotteita ruokalistasta</small>
                    </div>
                `;
            } else {
                cartItems.innerHTML = cart.map(cartItem => {
                    // ابحث عن العنصر في القائمة باستخدام id كنص
                    const item = appState.menu.find(m => String(m.id) === String(cartItem.id));
                    if (!item) return '';
                    const imageName = cartItem.image || item.image || 'placeholder.jpg';
                    return `
                        <div class="cart-item">
                            <img src="assets/img/${imageName}" 
                                 alt="${escapeHtml(cartItem.name || item.name)}" 
                                 class="cart-item-image" onerror="this.onerror=null;this.src='assets/img/placeholder.jpg';">
                            <div class="cart-item-details">
                                <h4>${escapeHtml(cartItem.name || item.name)}</h4>
                                <p class="cart-item-price">${parseFloat(cartItem.price || item.price || 0).toFixed(2)} €</p>
                            </div>
                            <div class="item-quantity">
                                <button onclick="updateCartQuantity('${cartItem.id}', ${cartItem.qty - 1})" class="quantity-btn minus">-</button>
                                <span class="quantity">${cartItem.qty}</span>
                                <button onclick="updateCartQuantity('${cartItem.id}', ${cartItem.qty + 1})" class="quantity-btn plus">+</button>
                            </div>
                            <button onclick="removeFromCartCompletely('${cartItem.id}')" class="remove-item" title="Poista korista">
                                ×
                            </button>
                        </div>
                    `;
                }).join('');
            }
        }
    }

    function calculateCartTotal() {
        const cart = loadCart(); // مصفوفة من العناصر
        return cart.reduce((total, cartItem) => {
            return total + (cartItem.price || 0) * (cartItem.qty || 1);
        }, 0);
    }

    async function handleCheckout() {
        if (!appState.user) {
            showNotification('Kirjaudu sisään tehdäksesi tilauksen', 'info');
            document.getElementById('userBtn').click(); // Open login form
            return;
        }
        
        const cart = loadCart(); // مصفوفة من العناصر
        const orderItems = cart.map(cartItem => ({
            id: parseInt(cartItem.id),
            quantity: cartItem.qty
        }));
        
        console.log('💳 Käsitellään tilaus:', orderItems);
        
        try {
            document.getElementById('loadingIndicator').style.display = 'flex';
            
            const response = await postOrder(orderItems);
            console.log('✅ Tilaus lähetetty:', response);
            
            clearCart();
            // لا نغلق السلة هنا، تبقى مفتوحة
            
            showNotification('Tilaus lähetetty onnistuneesti! Kiitos tilauksestasi.', 'success');
            
        } catch (error) {
            console.error('❌ Virhe tilauksessa:', error);
            showNotification('Tilauksen lähettäminen epäonnistui: ' + error.message, 'error');
        } finally {
            document.getElementById('loadingIndicator').style.display = 'none';
        }
    }

    // Favorites functionality
    function initializeFavorites() {
        console.log('🎯 Alustetaan suosikit...');
        
        const favBtn = document.getElementById('favoritesBtn');
        const favSidebar = document.getElementById('favoritesSidebar');
        const closeFavBtn = document.getElementById('closeFavorites');
        
        if (favBtn && favSidebar) {
            favBtn.addEventListener('click', () => {
                favSidebar.classList.add('active');
                document.getElementById('overlay').classList.add('active');
                updateFavoritesUI();
            });
        }
        
        if (closeFavBtn) {
            closeFavBtn.addEventListener('click', () => {
                favSidebar.classList.remove('active');
                document.getElementById('overlay').classList.remove('active');
            });
        }
    }

    function updateFavoritesUI() {
        const favoritesList = document.getElementById('favoritesList');
        if (!favoritesList) return;
        
        if (appState.favorites.length === 0) {
            favoritesList.innerHTML = `
                <div class="empty-favorites">
                    <div class="empty-favorites-icon">❤️</div>
                    <p>Ei suosikkeja vielä</p>
                    <small>Lisää suosikkeja klikkaamalla sydäntä</small>
                </div>
            `;
        } else {
            favoritesList.innerHTML = appState.favorites.map(itemId => {
                const item = appState.menu.find(m => m.id == itemId);
                if (!item) return '';
                // استخدم image_url أو image أو صورة افتراضية
                const imageSrc = item.image_url || item.image || 'assets/img/placeholder.jpg';
                return `
                    <div class="favorite-item">
                        <img src="${imageSrc}" 
                             alt="${escapeHtml(item.name)}" 
                             class="favorite-item-image"
                             onerror="this.onerror=null;this.src='assets/img/placeholder.jpg';">
                        <div class="favorite-item-details">
                            <h4>${escapeHtml(item.name)}</h4>
                            <p class="favorite-item-price">${parseFloat(item.price || 0).toFixed(2)} €</p>
                        </div>
                        <div class="favorite-item-actions">
                            <button onclick="addToCartFromMenu('${itemId}')" class="btn primary small">Lisää koriin</button>
                            <button onclick="toggleFavorite('${itemId}')" class="btn secondary small">Poista</button>
                        </div>
                    </div>
                `;
            }).filter(html => html).join('');
        }
    }

    // Authentication functionality
    function initializeAuth() {
        console.log('🎯 Alustetaan autentikointi...');
        
        const userBtn = document.getElementById('userBtn');
        const userDropdown = document.getElementById('userDropdown');
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const adminBtn = document.getElementById('adminBtn');
        
        if (userBtn && userDropdown) {
            userBtn.addEventListener('click', () => {
                userDropdown.classList.toggle('active');
            });
        }
        
        if (loginBtn) {
            loginBtn.addEventListener('click', handleLogin);
        }
        
        if (registerBtn) {
            registerBtn.addEventListener('click', handleRegister);
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
        
        if (adminBtn) {
            adminBtn.addEventListener('click', () => {
                window.open('/admin.html', '_blank');
            });
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });
    }

    async function handleLogin() {
        const email = document.getElementById('authEmail').value.trim();
        const password = document.getElementById('authPassword').value;
        
        if (!email || !password) {
            showNotification('Täytä kaikki kentät', 'error');
            return;
        }
        
        try {
            document.getElementById('loadingIndicator').style.display = 'flex';
            
            const response = await loginUser({ email, password });
            console.log('✅ Kirjautuminen onnistui:', response);
            
            localStorage.setItem('jwt_token', response.token);
            appState.user = response.user;
            
            updateAuthUI();
            document.getElementById('userDropdown').classList.remove('active');
            
            showNotification(`Tervetuloa takaisin, ${response.user.name}!`, 'success');
            
        } catch (error) {
            console.error('❌ Kirjautumisvirhe:', error);
            showNotification('Kirjautuminen epäonnistui: ' + error.message, 'error');
        } finally {
            document.getElementById('loadingIndicator').style.display = 'none';
        }
    }

    async function handleRegister() {
        const name = document.getElementById('authName').value.trim();
        const email = document.getElementById('authEmail').value.trim();
        const password = document.getElementById('authPassword').value;
        const isStudent = document.getElementById('authStudent').checked;

        if (!name || !email || !password) {
            showNotification('Täytä kaikki kentät rekisteröitymistä varten', 'error');
            return;
        }

        if (password.length < 6) {
            showNotification('Salasanan tulee olla vähintään 6 merkkiä pitkä', 'error');
            return;
        }

        try {
            document.getElementById('loadingIndicator').style.display = 'flex';

            const payload = {
                name,
                email,
                password,
                phone: isStudent ? 'student' : null
            };
            console.log('Register payload:', payload);
            const response = await registerUser(payload);
            console.log('✅ Rekisteröityminen onnistui:', response);

            localStorage.setItem('jwt_token', response.token);
            appState.user = response.user;

            updateAuthUI();
            document.getElementById('userDropdown').classList.remove('active');

            showNotification(`Tervetuloa, ${response.user.name}! Tilisi on luotu.`, 'success');

        } catch (error) {
            console.error('❌ Rekisteröitymisvirhe:', error);
            showNotification('Rekisteröityminen epäonnistui: ' + error.message, 'error');
        } finally {
            document.getElementById('loadingIndicator').style.display = 'none';
        }
    }

    function handleLogout() {
        localStorage.removeItem('jwt_token');
        appState.user = null;
        updateAuthUI();
        showNotification('Kirjauduit ulos onnistuneesti', 'info');
    }

    function checkAuthStatus() {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            // Here you would typically verify the token with the server
            // For now, we'll just assume it's valid if it exists
            console.log('🔐 JWT token löytyi, käyttäjä todennäköisesti kirjautunut');
            // You might want to decode the token to get user info
        }
        updateAuthUI();
    }

    function updateAuthUI() {
        const authForm = document.getElementById('authForm');
        const userInfo = document.getElementById('userInfo');
        const adminBtn = document.getElementById('adminBtn');
        
        if (appState.user) {
            if (authForm) authForm.style.display = 'none';
            if (userInfo) {
                userInfo.style.display = 'block';
                const userName = document.getElementById('userName');
                if (userName) {
                    userName.textContent = appState.user.name;
                }
            }
            
            // Show admin button if user is admin
            if (adminBtn && appState.user.role === 'admin') {
                adminBtn.style.display = 'block';
            }
        } else {
            if (authForm) authForm.style.display = 'block';
            if (userInfo) userInfo.style.display = 'none';
            if (adminBtn) adminBtn.style.display = 'none';
        }
    }

    // Global helper functions
    window.toggleFavorite = function(itemId) {
        const index = appState.favorites.indexOf(itemId);
        if (index > -1) {
            appState.favorites.splice(index, 1);
            showNotification('Poistettu suosikeista', 'info');
        } else {
            appState.favorites.push(itemId);
            showNotification('Lisätty suosikkeihin', 'success');
        }
        
        localStorage.setItem('favorites', JSON.stringify(appState.favorites));
        
        // Update UI
        renderMenu();
        updateFavoritesUI();
    };

    window.addToCartFromMenu = function(itemId) {
        const item = appState.menu.find(m => m.id == itemId);
        if (item) {
            console.log('🛒 إضافة منتج إلى السلة:', item.name);
            // استخدام دالة addToCart من cart.js التي تتطلب كائن العنصر
            addToCart(item, 1);
            // فتح السلة دائماً عند إضافة منتج (حتى لو كانت مفتوحة)
            const cartSidebar = document.getElementById('cartSidebar');
            const overlay = document.getElementById('overlay');
            if (cartSidebar) {
                cartSidebar.classList.add('active');
                console.log('✅ السلة مفتوحة الآن');
            }
            if (overlay) {
                overlay.classList.add('active');
            }
            showNotification(`${item.name} lisätty koriin`, 'success');
        } else {
            console.error('لم يتم العثور على العنصر بالمعرف:', itemId);
            showNotification('خطأ في إضافة العنصر', 'error');
        }
    };

    window.updateCartQuantity = function(itemId, newQuantity) {
        // استخدم updateQty دائماً، فهي تحذف العنصر إذا أصبحت الكمية أقل من 1
        updateQty(itemId, newQuantity);
        // إعادة رسم السلة مباشرة بعد التغيير
        if (typeof window.updateCartUI === 'function') {
            window.updateCartUI();
        }
    };

    window.removeFromCartCompletely = function(itemId) {
        const item = appState.menu.find(m => m.id == itemId);
        removeFromCart(itemId);
        // إعادة رسم السلة مباشرة بعد الحذف
        if (typeof window.updateCartUI === 'function') {
            window.updateCartUI();
        }
        if (item) {
            showNotification(`${item.name} poistettu korista`, 'info');
        }
    };

    window.showItemDetails = function(itemId) {
        const item = appState.menu.find(m => m.id == itemId);
        if (!item) return;

        // Get current language
        let lang = 'fi';
        const langSelect = document.getElementById('langSelect');
        if (langSelect && langSelect.value) {
            lang = langSelect.value;
        }
        // Pick correct name/description for modal
        const name = lang === 'en' ? (item.nameEn || item.name_en || item.name) : (item.name || item.recipe_name);
        const description = lang === 'en' ? (item.descriptionEn || item.description_en || item.description) : (item.description || item.description_fi || '');

        // Create modal for item details
        const modal = document.createElement('div');
        modal.className = 'item-detail-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${escapeHtml(name)}</h2>
                    <button class="close-btn" onclick="this.closest('.item-detail-modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <img src="${!item.image ? 'assets/img/placeholder.jpg' : (item.image.startsWith('assets/img/') ? item.image : 'assets/img/' + item.image)}" alt="${escapeHtml(name)}" class="item-detail-image">
                    <div class="item-detail-info">
                        <p class="item-description">${escapeHtml(description)}</p>
                        <div class="item-price">${parseFloat(item.price || 0).toFixed(2)} €</div>
                        <div class="item-tags">
                            ${item.vegan ? '<span class="tag vegan">🌱 Vegaani</span>' : ''}
                            ${item.vegetarian ? '<span class="tag vegetarian">🥬 Kasvis</span>' : ''}
                            ${item.glutenFree ? '<span class="tag gluten-free">🌾 Gluteeniton</span>' : ''}
                            ${item.lactoseFree ? '<span class="tag lactose-free">🥛 Laktoositon</span>' : ''}
                        </div>
                        ${item.ingredients && item.ingredients.length > 0 ? `
                            <div class="ingredients">
                                <h4>Ainekset:</h4>
                                <p>${item.ingredients.map(ing => escapeHtml(ing)).join(', ')}</p>
                            </div>
                        ` : ''}
                        ${item.allergens && item.allergens.length > 0 ? `
                            <div class="allergens">
                                <h4>⚠️ Allergeenit:</h4>
                                <p>${item.allergens.map(all => escapeHtml(all)).join(', ')}</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn secondary" onclick="this.closest('.item-detail-modal').remove()">Sulje</button>
                    <button class="btn primary" onclick="addToCartFromMenu('${itemId}'); this.closest('.item-detail-modal').remove();">Lisää koriin</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    };

    console.log('✅ Apricus-sovellus käynnistetty onnistuneesti!');
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Global notification function
function showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; margin-left: 1rem;">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
    
    // Add slide-out animation before removal
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 4700);
}

console.log('📱 Apricus - Main.js ladattu onnistuneesti!');