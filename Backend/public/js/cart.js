// Tee funktiot saataville window-oliolla
// مسح السلة تلقائياً عند بداية التطبيق
localStorage.removeItem('rm_cart_v1');
window.loadCart = loadCart;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQty = updateQty;
window.clearCart = clearCart;
window.cartTotal = cartTotal;
const CART_KEY = 'rm_cart_v1';
export function loadCart(){
  try{ return JSON.parse(localStorage.getItem(CART_KEY)||'[]'); }catch(e){ return [] }
}
export function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
export function addToCart(dish, qty=1){
  const cart = loadCart();
  const item = cart.find(i=>i.id===dish.id);
  if(item) item.qty += qty;
  else cart.push({ 
    id: dish.id || dish.recipe_id, 
    name: dish.name || dish.recipe_name || dish.name_fi || dish.name_en || 'Ruoka', 
    price: parseFloat(dish.price) || 0, 
    qty, 
    image: dish.image ? dish.image : (dish.image_url ? dish.image_url : 'placeholder.jpg')
  });
  saveCart(cart);
  // تحديث واجهة السلة بعد الإضافة
  if (typeof window.updateCartUI === 'function') {
    window.updateCartUI();
  }
  return cart;
}
export function removeFromCart(dishId){
  let cart = loadCart();
  // تأكد أن المقارنة تتم باستخدام نص
  cart = cart.filter(i => String(i.id) !== String(dishId));
  saveCart(cart);
  // تحديث واجهة السلة بعد الحذف
  if (typeof window.updateCartUI === 'function') {
    window.updateCartUI();
  }
  return cart;
}
export function updateQty(dishId, qty){
  console.log('updateQty called with:', dishId, qty);
  let cart = loadCart();
  // تأكد أن dishId يتم تحويله إلى نص للمقارنة الصحيحة
  const it = cart.find(i => String(i.id) === String(dishId));
  if(it) {
    const oldQty = it.qty;
    if (qty < 1) {
      cart = cart.filter(i => String(i.id) !== String(dishId));
      saveCart(cart);
      if (typeof showNotification === 'function') {
        showNotification('Tuote poistettu korista', 'info');
      }
    } else {
      it.qty = qty;
      saveCart(cart);
      if (typeof showNotification === 'function') {
        if (qty > oldQty) {
          showNotification('Määrää lisätty korissa', 'info');
        } else if (qty < oldQty) {
          showNotification('Määrää vähennetty korissa', 'info');
        }
      }
    }
  }
  // تحديث واجهة السلة بعد تغيير الكمية أو الحذف
  if (typeof window.updateCartUI === 'function') {
    window.updateCartUI();
  }
  return cart;
}
export function clearCart(){ 
  localStorage.removeItem(CART_KEY); 
  // تحديث واجهة السلة بعد التفريغ
  if (typeof window.updateCartUI === 'function') {
    window.updateCartUI();
  }
  return []; 
}
export function cartTotal(cart){
  return (cart||loadCart()).reduce((s,i)=>s + (parseFloat(i.price)||0) * (parseInt(i.qty)||1), 0);
}

// Make functions globally available for main-clean.js
