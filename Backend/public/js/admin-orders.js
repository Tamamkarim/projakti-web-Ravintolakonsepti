
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
          <button class="btn-close-order" style="float:right;background:#fff;color:#e74c3c;border:none;font-size:2rem;cursor:pointer;border-radius:50%;width:40px;height:40px;box-shadow:0 2px 8px #e74c3c33;display:flex;align-items:center;justify-content:center;" title="إغلاق الطلب">×</button>
        <div class="order-user">Asiakas: ${order.user?.name || '-'} </div>
        <div class="order-date">Päiväys: ${order.date ? new Date(order.date).toLocaleString('fi-FI') : '-'}</div>
        <div class="order-items">
          <span>Tilausrivit:</span>
          <ul>
              ${(order.items || []).map(item => {
                let imgSrc = item.image_url || item.image || '';
                if (!imgSrc) imgSrc = 'assets/img/placeholder.jpg';
                else if (!imgSrc.startsWith('assets/img/')) imgSrc = 'assets/img/' + imgSrc;
                return `<li class="order-item">
                  <img src="${imgSrc}" alt="${item.name}" style="width:40px;height:40px;object-fit:cover;margin-right:8px;vertical-align:middle;" onerror="this.onerror=null;this.src='assets/img/placeholder.jpg';">
                  ${item.name} × ${item.quantity}
                </li>`;
              }).join('')}
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
      document.querySelectorAll('.btn-close-order').forEach(btn => {
        btn.addEventListener('click', function() {
          const orderDiv = btn.closest('.order');
          if (orderDiv) orderDiv.style.display = 'none';
        });
      });
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
