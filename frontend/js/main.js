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
        }
    };

    // Initialize UI components
    initializeHeader();
    initializeFilters();
    initializeMenu();
    initializeCart();
    initializeFavorites();
    initializeAuth();
    
    // Load initial data
    loadMenuData();
    updateCartUI();
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
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleSearch();
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

    // Search functionality
    function handleSearch() {
        const query = document.getElementById('searchInput').value.toLowerCase().trim();
        console.log('🔍 Haku:', query);
        
        if (!query) {
            appState.filteredMenu = appState.menu;
        } else {
            appState.filteredMenu = appState.menu.filter(item => 
                item.name.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query) ||
                item.ingredients.some(ing => ing.toLowerCase().includes(query))
            );
        }
        
        renderMenu();
        
        if (appState.filteredMenu.length === 0 && query) {
            showNotification(`Ei tuloksia haulle "${query}"`, 'info');
        }
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
            // Category filter
            if (appState.currentCategory !== 'all' && item.category !== appState.currentCategory) {
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
                
                // Update current category
                appState.currentCategory = e.target.dataset.category;
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
            appState.filteredMenu = appState.menu.filter(item => 
                item.category === appState.currentCategory
            );
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
            
            const menuData = await fetchTodayMenu();
            console.log('📋 Ruokalista ladattu:', menuData.length, 'tuotetta');
            
            appState.menu = menuData.map(item => ({
                ...item,
                // Ensure Finnish translations
                name: item.name_fi || item.name,
                description: item.description_fi || item.description,
                // Add default values
                category: item.category || 'mains',
                vegan: item.vegan || false,
                vegetarian: item.vegetarian || false,
                glutenFree: item.glutenFree || false,
                lactoseFree: item.lactoseFree || false,
                allergens: item.allergens || [],
                ingredients: item.ingredients || []
            }));
            
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
        
        menuGrid.innerHTML = appState.filteredMenu.map(item => `
            <div class="menu-item" data-id="${item.id}">
                <img src="${item.image || 'assets/img/placeholder.jpg'}" 
                     alt="${escapeHtml(item.name)}" 
                     class="menu-item-image"
                     onerror="this.src='assets/img/placeholder.jpg'">
                
                <div class="menu-item-content">
                    <div class="menu-item-header">
                        <div>
                            <h3 class="menu-item-title">${escapeHtml(item.name)}</h3>
                            <div class="menu-item-price">${item.price.toFixed(2)} €</div>
                        </div>
                        <button class="favorite-btn ${appState.favorites.includes(item.id) ? 'active' : ''}" 
                                onclick="toggleFavorite(${item.id})" 
                                title="Lisää suosikkeihin">
                            ❤️
                        </button>
                    </div>
                    
                    <p class="menu-item-description">${escapeHtml(item.description)}</p>
                    
                    <div class="menu-item-tags">
                        ${item.vegan ? '<span class="menu-tag vegan">🌱 Vegaani</span>' : ''}
                        ${item.vegetarian ? '<span class="menu-tag vegetarian">🥬 Kasvis</span>' : ''}
                        ${item.glutenFree ? '<span class="menu-tag gluten-free">🌾 Gluteeniton</span>' : ''}
                        ${item.lactoseFree ? '<span class="menu-tag lactose-free">🥛 Laktoositon</span>' : ''}
                    </div>
                    
                    <div class="menu-item-actions">
                        <button class="btn secondary" onclick="showItemDetails(${item.id})">
                            Näytä tiedot
                        </button>
                        <button class="btn primary" onclick="addToCartFromMenu(${item.id})">
                            Lisää koriin
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
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
        
        // Close cart when clicking overlay
        document.getElementById('overlay').addEventListener('click', closeCart);
    }

    function closeCart() {
        document.getElementById('cartSidebar').classList.remove('active');
        document.getElementById('overlay').classList.remove('active');
    }

    function updateCartUI() {
        const cartCount = document.getElementById('cartCount');
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        const checkoutBtn = document.getElementById('checkoutBtn');
        
        const cart = loadCart();
        const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
        const total = calculateCartTotal();
        
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'block' : 'none';
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
                cartItems.innerHTML = Object.entries(cart).map(([itemId, quantity]) => {
                    const item = appState.menu.find(m => m.id == itemId);
                    if (!item) return '';
                    
                    return `
                        <div class="cart-item">
                            <img src="${item.image || 'assets/img/placeholder.jpg'}" 
                                 alt="${escapeHtml(item.name)}" 
                                 class="cart-item-image">
                            <div class="cart-item-details">
                                <h4>${escapeHtml(item.name)}</h4>
                                <p class="cart-item-price">${item.price.toFixed(2)} €</p>
                            </div>
                            <div class="cart-item-controls">
                                <button onclick="updateCartQuantity(${itemId}, ${quantity - 1})" class="qty-btn">-</button>
                                <span class="quantity">${quantity}</span>
                                <button onclick="updateCartQuantity(${itemId}, ${quantity + 1})" class="qty-btn">+</button>
                            </div>
                            <button onclick="removeFromCartCompletely(${itemId})" class="remove-btn" title="Poista korista">🗑️</button>
                        </div>
                    `;
                }).filter(html => html).join('');
            }
        }
    }

    function calculateCartTotal() {
        const cart = loadCart();
        return Object.entries(cart).reduce((total, [itemId, quantity]) => {
            const item = appState.menu.find(m => m.id == itemId);
            return total + (item ? item.price * quantity : 0);
        }, 0);
    }

    async function handleCheckout() {
        if (!appState.user) {
            showNotification('Kirjaudu sisään tehdäksesi tilauksen', 'info');
            document.getElementById('userBtn').click(); // Open login form
            return;
        }
        
        const cart = loadCart();
        const orderItems = Object.entries(cart).map(([itemId, quantity]) => ({
            id: parseInt(itemId),
            quantity
        }));
        
        console.log('💳 Käsitellään tilaus:', orderItems);
        
        try {
            document.getElementById('loadingIndicator').style.display = 'flex';
            
            const response = await postOrder(orderItems);
            console.log('✅ Tilaus lähetetty:', response);
            
            clearCart();
            updateCartUI();
            closeCart();
            
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
                
                return `
                    <div class="favorite-item">
                        <img src="${item.image || 'assets/img/placeholder.jpg'}" 
                             alt="${escapeHtml(item.name)}" 
                             class="favorite-item-image">
                        <div class="favorite-item-details">
                            <h4>${escapeHtml(item.name)}</h4>
                            <p class="favorite-item-price">${item.price.toFixed(2)} €</p>
                        </div>
                        <div class="favorite-item-actions">
                            <button onclick="addToCartFromMenu(${itemId})" class="btn primary small">Lisää koriin</button>
                            <button onclick="toggleFavorite(${itemId})" class="btn secondary small">Poista</button>
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
            
            const response = await loginUser(email, password);
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
            
            const response = await registerUser(name, email, password, isStudent);
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
        addToCart(itemId, 1);
        updateCartUI();
        
        const item = appState.menu.find(m => m.id == itemId);
        if (item) {
            showNotification(`${item.name} lisätty koriin`, 'success');
        }
    };

    window.updateCartQuantity = function(itemId, newQuantity) {
        if (newQuantity <= 0) {
            removeFromCart(itemId);
        } else {
            updateQty(itemId, newQuantity);
        }
        updateCartUI();
    };

    window.removeFromCartCompletely = function(itemId) {
        removeFromCart(itemId);
        updateCartUI();
        
        const item = appState.menu.find(m => m.id == itemId);
        if (item) {
            showNotification(`${item.name} poistettu korista`, 'info');
        }
    };

    window.showItemDetails = function(itemId) {
        const item = appState.menu.find(m => m.id == itemId);
        if (!item) return;
        
        // Create modal for item details
        const modal = document.createElement('div');
        modal.className = 'item-detail-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${escapeHtml(item.name)}</h2>
                    <button class="close-btn" onclick="this.closest('.item-detail-modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <img src="${item.image || 'assets/img/placeholder.jpg'}" alt="${escapeHtml(item.name)}" class="item-detail-image">
                    <div class="item-detail-info">
                        <p class="item-description">${escapeHtml(item.description)}</p>
                        <div class="item-price">${item.price.toFixed(2)} €</div>
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
                    <button class="btn primary" onclick="addToCartFromMenu(${itemId}); this.closest('.item-detail-modal').remove();">Lisää koriin</button>
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