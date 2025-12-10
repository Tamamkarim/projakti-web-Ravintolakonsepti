const express = require('express');
const router = express.Router();
const { validateRequired } = require('../../middleware/validation');
const database = require('../../database/db');

// جلب جميع الطلبات للإدارة
router.get('/orders', (req, res) => {
  try {
    const orders = database.getAllOrders();
    res.json({
      success: true,
      data: orders,
      count: orders.length
    });
  } catch (error) {
    console.error('خطأ في جلب الطلبات:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في جلب الطلبات'
    });
  }
});

// حذف طلب
router.delete('/orders/:id', (req, res) => {
  try {
    const { id } = req.params;
    // حذف الطلب من قاعدة البيانات أو المصفوفة
    const deleted = database.deleteOrder(id);
    if (deleted) {
      res.json({
        success: true,
        message: 'تم حذف الطلب بنجاح'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'الطلب غير موجود'
      });
    }
  } catch (error) {
    console.error('خطأ في حذف الطلب:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في حذف الطلب'
    });
  }
});

// تحديث حالة الطلب
router.patch('/orders/:id/status', validateRequired(['status']), (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'حالة الطلب غير صحيحة',
        validStatuses
      });
    }
    
    const updatedOrder = database.updateOrderStatus(id, status);
    
    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        error: 'الطلب غير موجود'
      });
    }
    
    res.json({
      success: true,
      message: 'تم تحديث حالة الطلب بنجاح',
      data: updatedOrder
    });
  } catch (error) {
    console.error('خطأ في تحديث حالة الطلب:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في تحديث حالة الطلب'
    });
  }
});

// إضافة وصفة جديدة
router.post('/recipes', validateRequired(['name', 'description', 'price', 'category']), (req, res) => {
  try {
    const { 
      name, 
      nameEn, 
      description, 
      price, 
      category, 
      image, 
      ingredients, 
      preparationTime, 
      isAvailable 
    } = req.body;
    
    // التحقق من وجود الفئة
    const categoryData = database.getCategoryById(category);
    if (!categoryData) {
      return res.status(400).json({
        success: false,
        error: 'الفئة غير موجودة'
      });
    }
    
    // التحقق من صحة السعر
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return res.status(400).json({
        success: false,
        error: 'السعر يجب أن يكون رقم موجب'
      });
    }
    
    const recipeData = {
      name,
      nameEn: nameEn || name,
      description,
      price: priceNum,
      category,
      image: image || '/assets/img/placeholder.jpg',
      ingredients: Array.isArray(ingredients) ? ingredients : [],
      preparationTime: parseInt(preparationTime) || 30,
      isAvailable: isAvailable !== false, // افتراضياً متوفر
      rating: 0
    };
    
    const recipe = database.createRecipe(recipeData);
    
    res.status(201).json({
      success: true,
      message: 'تم إضافة الوصفة بنجاح',
      data: recipe
    });
  } catch (error) {
    console.error('خطأ في إضافة الوصفة:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في إضافة الوصفة'
    });
  }
});

// تحديث وصفة
router.put('/recipes/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // التحقق من وجود الوصفة
    const existingRecipe = database.getRecipeById(id);
    if (!existingRecipe) {
      return res.status(404).json({
        success: false,
        error: 'الوصفة غير موجودة'
      });
    }
    
    // التحقق من صحة السعر إذا تم تحديثه
    if (updates.price !== undefined) {
      const priceNum = parseFloat(updates.price);
      if (isNaN(priceNum) || priceNum <= 0) {
        return res.status(400).json({
          success: false,
          error: 'السعر يجب أن يكون رقم موجب'
        });
      }
      updates.price = priceNum;
    }
    
    // التحقق من وجود الفئة إذا تم تحديثها
    if (updates.category) {
      const categoryData = database.getCategoryById(updates.category);
      if (!categoryData) {
        return res.status(400).json({
          success: false,
          error: 'الفئة غير موجودة'
        });
      }
    }
    
    const updatedRecipe = database.updateRecipe(id, updates);
    
    res.json({
      success: true,
      message: 'تم تحديث الوصفة بنجاح',
      data: updatedRecipe
    });
  } catch (error) {
    console.error('خطأ في تحديث الوصفة:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في تحديث الوصفة'
    });
  }
});

// حذف وصفة
router.delete('/recipes/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // التحقق من وجود الوصفة
    const recipe = database.getRecipeById(id);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: 'الوصفة غير موجودة'
      });
    }
    
    const deleted = database.deleteRecipe(id);
    
    if (deleted) {
      res.json({
        success: true,
        message: 'تم حذف الوصفة بنجاح'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'فشل في حذف الوصفة'
      });
    }
  } catch (error) {
    console.error('خطأ في حذف الوصفة:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في حذف الوصفة'
    });
  }
});

// جلب الإحصائيات
router.get('/stats', async (req, res) => {
  try {
    const stats = await database.getStats();
    // إضافة إحصائيات إضافية
    const orders = await database.getAllOrders();
    const today = new Date().toDateString();
    const todayOrders = orders.filter(order => 
      new Date(order.createdAt).toDateString() === today
    );
    const totalRevenue = orders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + order.totalAmount, 0);
    const todayRevenue = todayOrders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + order.totalAmount, 0);
    res.json({
      success: true,
      data: {
        ...stats,
        todayOrders: todayOrders.length,
        totalRevenue,
        todayRevenue,
        ordersByStatus: {
          pending: orders.filter(o => o.status === 'pending').length,
          confirmed: orders.filter(o => o.status === 'confirmed').length,
          preparing: orders.filter(o => o.status === 'preparing').length,
          ready: orders.filter(o => o.status === 'ready').length,
          delivered: orders.filter(o => o.status === 'delivered').length,
          cancelled: orders.filter(o => o.status === 'cancelled').length
        }
      }
    });
  } catch (error) {
    console.error('خطأ في جلب الإحصائيات:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في جلب الإحصائيات'
    });
  }
});

// جلب المستخدمين (للإدارة)
router.get('/users', (req, res) => {
  try {
    const users = database.getAllUsers().map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt
      // لا نرسل كلمة المرور
    }));
    
    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    console.error('خطأ في جلب المستخدمين:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في جلب المستخدمين'
    });
  }
});

module.exports = router;