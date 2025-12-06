
// Hakee ja näyttää tilaukset admin-sivulla suomeksi
fetch('/api/orders')
  .then(res => res.json())
  .then(orders => {
    const container = document.getElementById('orders');
    if (!orders || !orders.length) {
      container.innerHTML = '<p>Ei tilauksia tällä hetkellä.</p>';
      return;
    }
    container.innerHTML = orders.map(order => `
      <div class="order" data-id="${order.id}">
        <div class="order-user">Asiakas: ${order.user?.name || '-'} </div>
        <div class="order-date">Päiväys: ${order.date ? new Date(order.date).toLocaleString('fi-FI') : '-'}</div>
        <div class="order-items">
          <span>Tilausrivit:</span>
          <ul>
            ${(order.items || []).map(item => `<li class="order-item">${item.name} × ${item.quantity}</li>`).join('')}
          </ul>
        </div>
        <div class="order-total">Yhteensä: ${order.total ? order.total.toFixed(2) : '0.00'} €</div>
        <div class="order-actions">
          <button class="btn-update-status">تحديث الحالة</button>
          <button class="btn-delete-order" style="margin-left:8px;color:red;">حذف الطلب</button>
        </div>
      </div>
    `).join('');

    // إضافة أحداث للأزرار
    document.querySelectorAll('.btn-update-status').forEach((btn, idx) => {
      btn.addEventListener('click', function() {
        const orderId = orders[idx].id;
        const newStatus = prompt('أدخل الحالة الجديدة (مثلاً: delivered):', orders[idx].status || '');
        if (!newStatus) return;
        fetch(`/api/orders/${orderId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        })
        .then(res => res.ok ? location.reload() : alert('فشل تحديث الحالة'));
      });
    });

    document.querySelectorAll('.btn-delete-order').forEach((btn, idx) => {
      btn.addEventListener('click', function() {
        const orderId = orders[idx].id;
        if (!confirm('هل أنت متأكد من حذف الطلب؟')) return;
        fetch(`/api/orders/${orderId}`, {
          method: 'DELETE'
        })
        .then(res => res.ok ? location.reload() : alert('فشل حذف الطلب'));
      });
    });
  })
  .catch(() => {
    document.getElementById('orders').innerHTML = '<p>Virhe tilausten haussa.</p>';
  });
