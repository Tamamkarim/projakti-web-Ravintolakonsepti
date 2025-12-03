
// MenuItem.models.js
// Menu item schema/model definition


const sequelize = require('../utils/database');


/**
 * Map SQL category to UI category
 * UI categories: base, sauce, cheese, topping (all others)
 * @param {string} sqlCategory
 * @returns {string} UI category
 */
function mapSqlCategoryToUiCategory(sqlCategory) {
  if (!sqlCategory) return "topping";
  const lower = sqlCategory.toLowerCase();
  if (lower === "base") return "base";
  if (lower === "sauce") return "sauce";
  if (lower === "cheese") return "cheese";
  return "topping";
}

module.exports = { MenuItem, mapSqlCategoryToUiCategory };
