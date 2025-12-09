// نموذج مبسط لطلب واحد
const orders = [
  {
    id: 1,
    user: {
      id: 101,
      name: "tamam"
    },
    items: [
      { name: "بيتزا", quantity: 2, image_url: "Fattoush-salaatti.jpg" },
      { name: "عصير", quantity: 1, image_url: "juice.jpg" }
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
