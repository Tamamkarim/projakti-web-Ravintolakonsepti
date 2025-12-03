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
    image: dish.image || dish.image_url || ''
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
  cart = cart.filter(i=>i.id!==dishId);
  saveCart(cart);
  // تحديث واجهة السلة بعد الحذف
  if (typeof window.updateCartUI === 'function') {
    window.updateCartUI();
  }
  return cart;
}
export function updateQty(dishId, qty){
  const cart = loadCart();
  const it = cart.find(i=>i.id===dishId);
  if(it) it.qty = Math.max(1, qty);
  saveCart(cart);
  // تحديث واجهة السلة بعد تغيير الكمية
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
window.loadCart = loadCart;
window.saveCart = saveCart;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQty = updateQty;
window.clearCart = clearCart;
window.cartTotal = cartTotal;
