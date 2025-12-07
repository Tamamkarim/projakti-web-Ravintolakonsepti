
const express = require('express');
const router = express.Router();
const db = require('../../database/db');
const { validateRequired } = require('../../middleware/validation');

// Hae kaikki kategoriat
router.get('/categories', async (req, res) => {
	try {
		const categories = await db.getAllCategories();
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
router.get('/categories/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const category = await db.getCategoryById(id);
    
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
router.get('/categories/:id/recipes', async (req, res) => {
	try {
		const { id } = req.params;
		const category = await db.getCategoryById(id);
    
		if (!category) {
			return res.status(404).json({
				success: false,
				error: 'الفئة غير موجودة'
			});
		}
    
		const recipes = await db.getRecipesByCategory(id);
    
		res.json({
			success: true,
			data: {
				category,
				recipes,
				count: recipes.length
			}
		});
	   } catch (error) {
		   console.error('Virhe kategorian reseptien haussa:', error);
		   res.status(500).json({
			   success: false,
			   error: 'Virhe haettaessa kategorian reseptejä',
			   details: error && error.message ? error.message : error
		   });
	   }
});

// Hae kaikki reseptit
router.get('/recipes', async (req, res) => {
	try {
		const { category, available, search, lang } = req.query;
		let recipes = await db.getAllRecipes();

		// تصفية حسب الفئة
		if (category) {
			recipes = recipes.filter(recipe => recipe.category_id == category);
		}

		// تصفية حسب التوفر
		if (available !== undefined) {
			const isAvailable = available === 'true';
			recipes = recipes.filter(recipe => recipe.is_available === isAvailable);
		}

		// البحث في الاسم والوصف
		if (search) {
			const searchTerm = search.toLowerCase();
			recipes = recipes.filter(recipe => 
				recipe.recipe_name.toLowerCase().includes(searchTerm) ||
				(recipe.recipe_name_en && recipe.recipe_name_en.toLowerCase().includes(searchTerm)) ||
				(recipe.description && recipe.description.toLowerCase().includes(searchTerm))
			);
		}

		// تجهيز البيانات حسب اللغة
		const selectedLang = (lang && lang.toLowerCase() === 'en') ? 'en' : 'fi';
		const mappedRecipes = recipes.map(recipe => ({
			id: recipe.recipe_id,
			name: selectedLang === 'en' ? (recipe.recipe_name_en || recipe.recipe_name) : recipe.recipe_name,
			description: selectedLang === 'en' ? (recipe.description_en || recipe.description) : recipe.description,
			price: recipe.price,
			image_url: recipe.image_url,
			preparation_time: recipe.preparation_time,
			is_available: recipe.is_available,
			average_rating: recipe.average_rating,
			total_reviews: recipe.total_reviews,
			category_id: recipe.category_id
		}));

		res.json({
			success: true,
			data: mappedRecipes,
			count: mappedRecipes.length,
			filters: { category, available, search, lang: selectedLang }
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
router.get('/recipes/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const recipe = await db.getRecipeById(id);
    
		try {
			const { category, available, search, lang } = req.query;
			let recipes = await db.getAllRecipes();

			// تصفية حسب الفئة
			if (category) {
				recipes = recipes.filter(recipe => recipe.category_id == category);
			}
			// تصفية حسب التوفر
			if (available !== undefined) {
				const isAvailable = available === 'true';
				recipes = recipes.filter(recipe => recipe.is_available === isAvailable);
			}
			// البحث في الاسم والوصف
			if (search) {
				const searchTerm = search.toLowerCase();
				recipes = recipes.filter(recipe => 
					recipe.recipe_name.toLowerCase().includes(searchTerm) ||
					recipe.recipe_name_en.toLowerCase().includes(searchTerm) ||
					(recipe.description && recipe.description.toLowerCase().includes(searchTerm))
				);
			}

			// تجهيز البيانات حسب اللغة
			const selectedLang = (lang && lang.toLowerCase() === 'en') ? 'en' : 'fi';
			const mappedRecipes = recipes.map(recipe => ({
				id: recipe.recipe_id,
				name: selectedLang === 'en' ? recipe.recipe_name_en : recipe.recipe_name,
				description: selectedLang === 'en' ? recipe.description_en : recipe.description,
				price: recipe.price,
				image_url: recipe.image_url,
				preparation_time: recipe.preparation_time,
				is_available: recipe.is_available,
				average_rating: recipe.average_rating,
				total_reviews: recipe.total_reviews,
				category_id: recipe.category_id
			}));

			res.json({
				success: true,
				data: mappedRecipes,
				count: mappedRecipes.length,
				filters: { category, available, search, lang: selectedLang }
			});
		} catch (error) {
			console.error('خطأ في جلب الوصفات:', error);
			res.status(500).json({
				success: false,
				error: 'خطأ في جلب الوصفات'
			});
		}
		const menuByCategory = {};
		const categories = await db.getAllCategories();
    
		for (const category of categories) {
			const categoryRecipes = availableRecipes.filter(recipe => recipe.category_id === category.category_id);
			if (categoryRecipes.length > 0) {
				menuByCategory[category.category_id] = {
					category,
					recipes: categoryRecipes.slice(0, 3) // أول 3 وصفات من كل فئة
				};
			}
		}
    
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
		   if (error && error.stack) {
			   console.error('Stack trace:', error.stack);
		   }
		   res.status(500).json({
			   success: false,
			   error: 'خطأ في جلب قائمة اليوم',
			   details: error && error.message ? error.message : error
		   });
	   }
	});

// إنشاء طلب جديد
router.post('/orders', validateRequired(['customerName', 'customerPhone', 'items']), async (req, res) => {
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
			const recipe = await db.getRecipeById(item.recipeId || item.recipe_id);
			if (!recipe) {
				return res.status(400).json({
					success: false,
					error: `الوصفة غير موجودة: ${item.recipeId || item.recipe_id}`
				});
			}
      
			if (!recipe.is_available) {
				return res.status(400).json({
					success: false,
					error: `الوصفة غير متوفرة: ${recipe.recipe_name}`
				});
			}
      
			const quantity = parseInt(item.quantity) || 1;
			const itemTotal = parseFloat(recipe.price) * quantity;
			totalAmount += itemTotal;
      
			orderItems.push({
				recipe_id: recipe.recipe_id,
				recipe_name: recipe.recipe_name,
				quantity,
				unit_price: parseFloat(recipe.price),
				subtotal: itemTotal,
				special_instructions: item.special_instructions || null
			});
		}
    
		const orderData = {
			user_id: req.user ? req.user.id : null,
			customer_name: customerName,
			customer_phone: customerPhone,
			customer_email: customerEmail || null,
			order_type: deliveryAddress ? 'delivery' : 'pickup',
			delivery_address: deliveryAddress || null,
			total_amount: totalAmount,
			notes: notes || null,
			items: orderItems
		};
    
		const order = await db.createOrder(orderData);
    
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
router.get('/orders/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const order = await db.getOrderById(id);
    
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
