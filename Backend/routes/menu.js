const express = require('express');
const router = express.Router();
const database = require('../database/memory-db');
const { validateRequired } = require('../middleware/validation');

// Hae kaikki kategoriat
router.get('/categories', (req, res) => {
  try {
    const categories = database.getAllCategories();
    res.json({
      success: true,
      data: categories,
      count: categories.length
    });
  } catch (error) {
    console.error('Virhe kategorioiden haussa:', error);
    res.status(500).json({
      success: false,
      error: 'Virhe kategorioiden haussa'
    });
  }
});

// Hae tietty kategoria
router.get('/categories/:id', (req, res) => {
  try {
    const { id } = req.params;
    const category = database.getCategoryById(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Kategoriaa ei löydy'
      });
    }
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Virhe kategorian haussa:', error);
    res.status(500).json({
      success: false,
      error: 'Virhe kategorian haussa'
    });
  }
});

// جلب الوصفات حسب الفئة
router.get('/categories/:id/recipes', (req, res) => {
  try {
    const { id } = req.params;
    const category = database.getCategoryById(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'الفئة غير موجودة'
      });
    }
    
    const recipes = database.getRecipesByCategory(id);
    
    res.json({
      success: true,
      data: {
        category,
        recipes,
        count: recipes.length
      }
    });
  } catch (error) {
    console.error('خطأ في جلب وصفات الفئة:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في جلب وصفات الفئة'
    });
  }
});

// Hae kaikki reseptit
router.get('/recipes', (req, res) => {
  try {
    const { category, available, search } = req.query;
    let recipes = database.getAllRecipes();
    
    // تصفية حسب الفئة
    if (category) {
      recipes = recipes.filter(recipe => recipe.category === category);
    }
    
    // تصفية حسب التوفر
    if (available !== undefined) {
      const isAvailable = available === 'true';
      recipes = recipes.filter(recipe => recipe.isAvailable === isAvailable);
    }
    
    // البحث في الاسم والوصف
    if (search) {
      const searchTerm = search.toLowerCase();
      recipes = recipes.filter(recipe => 
        recipe.name.toLowerCase().includes(searchTerm) ||
        recipe.nameEn.toLowerCase().includes(searchTerm) ||
        recipe.description.toLowerCase().includes(searchTerm)
      );
    }
    
    res.json({
      success: true,
      data: recipes,
      count: recipes.length,
      filters: { category, available, search }
    });
  } catch (error) {
    console.error('خطأ في جلب الوصفات:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في جلب الوصفات'
    });
  }
});

// جلب وصفة محددة
router.get('/recipes/:id', (req, res) => {
  try {
    const { id } = req.params;
    const recipe = database.getRecipeById(id);
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: 'الوصفة غير موجودة'
      });
    }
    
    res.json({
      success: true,
      data: recipe
    });
  } catch (error) {
    console.error('خطأ في جلب الوصفة:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في جلب الوصفة'
    });
  }
});

// قائمة اليوم (وصفات مميزة)
router.get('/today', (req, res) => {
  try {
    const allRecipes = database.getAllRecipes();
    const availableRecipes = allRecipes.filter(recipe => recipe.isAvailable !== false);
    
    console.log('📦 Kaikki reseptit:', allRecipes.length);
    console.log('📦 Saatavilla olevat reseptit:', availableRecipes.length);
    
    // Ryhmittele reseptit kategorian mukaan
    const menuByCategory = {};
    const categories = database.getAllCategories();
    
    categories.forEach(category => {
      const categoryRecipes = availableRecipes.filter(recipe => recipe.category === category.id);
      if (categoryRecipes.length > 0) {
        menuByCategory[category.id] = {
          category,
          recipes: categoryRecipes.slice(0, 3) // أول 3 وصفات من كل فئة
        };
      }
    });
    
    res.json({
      success: true,
      data: {
        menu: menuByCategory,
        totalRecipes: availableRecipes.length,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('خطأ في جلب قائمة اليوم:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في جلب قائمة اليوم'
    });
  }
});

// إنشاء طلب جديد
router.post('/orders', validateRequired(['customerName', 'customerPhone', 'items']), (req, res) => {
  try {
    const { customerName, customerPhone, customerEmail, items, notes, deliveryAddress } = req.body;
    
    // التحقق من صحة العناصر
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'يجب أن يحتوي الطلب على عنصر واحد على الأقل'
      });
    }
    
    // حساب المجموع الكلي
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of items) {
      const recipe = database.getRecipeById(item.recipeId);
      if (!recipe) {
        return res.status(400).json({
          success: false,
          error: `الوصفة غير موجودة: ${item.recipeId}`
        });
      }
      
      if (!recipe.isAvailable) {
        return res.status(400).json({
          success: false,
          error: `الوصفة غير متوفرة: ${recipe.name}`
        });
      }
      
      const quantity = parseInt(item.quantity) || 1;
      const itemTotal = recipe.price * quantity;
      totalAmount += itemTotal;
      
      orderItems.push({
        recipeId: recipe.id,
        recipeName: recipe.name,
        price: recipe.price,
        quantity,
        total: itemTotal
      });
    }
    
    const orderData = {
      customerName,
      customerPhone,
      customerEmail: customerEmail || null,
      items: orderItems,
      totalAmount,
      notes: notes || '',
      deliveryAddress: deliveryAddress || null,
      orderType: deliveryAddress ? 'delivery' : 'pickup'
    };
    
    const order = database.createOrder(orderData);
    
    res.status(201).json({
      success: true,
      message: 'تم إنشاء الطلب بنجاح',
      data: order
    });
  } catch (error) {
    console.error('خطأ في إنشاء الطلب:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في إنشاء الطلب'
    });
  }
});

// جلب طلب محدد
router.get('/orders/:id', (req, res) => {
  try {
    const { id } = req.params;
    const order = database.getOrderById(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'الطلب غير موجود'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('خطأ في جلب الطلب:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في جلب الطلب'
    });
  }
});

module.exports = router;