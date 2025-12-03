
const db = require('../utils/database');

// جلب كل عناصر المنيو
exports.getAllMenuItems = async (req, res) => {
	try {
		const items = await db.getAllMenuItems();
		res.json({ success: true, data: items });
	} catch (err) {
		res.status(500).json({ success: false, error: err.message });
	}
};
