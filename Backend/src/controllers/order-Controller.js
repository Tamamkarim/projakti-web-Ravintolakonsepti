// نموذج مبسط لطلب واحد
const orders = [
  {
    id: 1,
    user: {
      id: 101,
      name: "tamam"
    },
    items: [
      { name: "بيتزا", quantity: 2 },
      { name: "عصير", quantity: 1 }
    ],
    total: 50,
    date: "2025-12-05"
  }
];

// جلب جميع الطلبات
const getOrders = (req, res) => {
  res.json(orders);
};

module.exports = { getOrders };
