
// نظام الإشعارات
class NotificationSystem {
  constructor() {
    this.container = null;
    this.notifications = [];
    this.maxNotifications = 5;
    this.defaultDuration = 5000; // 5 ثواني
    
    this.init();
  }

  init() {
    // إنشاء container للإشعارات
    this.container = document.createElement('div');
    this.container.id = 'notifications-container';
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      max-width: 400px;
      pointer-events: none;
    `;
    
    document.body.appendChild(this.container);
  }

  // إنشاء إشعار جديد
  show(message, type = 'info', duration = this.defaultDuration) {
    const notification = this.createNotification(message, type, duration);
    this.addNotification(notification);
    
    // إزالة الإشعار تلقائياً
    if (duration > 0) {
      setTimeout(() => {
        this.remove(notification.id);
      }, duration);
    }
    
    return notification.id;
  }

  // إنشاء عنصر الإشعار
  createNotification(message, type, duration) {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const notification = document.createElement('div');
    notification.id = id;
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      background: ${this.getBackgroundColor(type)};
      color: ${this.getTextColor(type)};
      padding: 16px 20px;
      margin-bottom: 10px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateX(100%);
      transition: all 0.3s ease;
      pointer-events: auto;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 14px;
      line-height: 1.4;
      position: relative;
      border-left: 4px solid ${this.getBorderColor(type)};
    `;

    // إضافة أيقونة
    const icon = document.createElement('span');
    icon.innerHTML = this.getIcon(type);
    icon.style.cssText = `
      display: inline-block;
      margin-right: 8px;
      font-size: 16px;
    `;

    // إضافة النص
    const text = document.createElement('span');
    text.textContent = message;

    // زر الإغلاق
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
      position: absolute;
      top: 8px;
      left: 8px;
      background: none;
      border: none;
      color: inherit;
      font-size: 18px;
      cursor: pointer;
      opacity: 0.7;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    closeBtn.onmouseover = () => closeBtn.style.opacity = '1';
    closeBtn.onmouseout = () => closeBtn.style.opacity = '0.7';
    closeBtn.onclick = () => this.remove(id);

    notification.appendChild(icon);
    notification.appendChild(text);
    notification.appendChild(closeBtn);

    return { id, element: notification, type, duration };
  }

  // إضافة الإشعار للشاشة
  addNotification(notification) {
    this.notifications.push(notification);
    this.container.appendChild(notification.element);
    
    // تطبيق الأنيميشن
    setTimeout(() => {
      notification.element.style.transform = 'translateX(0)';
    }, 10);

    // إزالة الإشعارات الزائدة
    while (this.notifications.length > this.maxNotifications) {
      const oldest = this.notifications.shift();
      this.remove(oldest.id, false);
    }
  }

  // إزالة إشعار
  remove(id, animate = true) {
    const notificationIndex = this.notifications.findIndex(n => n.id === id);
    if (notificationIndex === -1) return;

    const notification = this.notifications[notificationIndex];
    
    if (animate) {
      notification.element.style.transform = 'translateX(100%)';
      notification.element.style.opacity = '0';
      
      setTimeout(() => {
        if (notification.element.parentNode) {
          notification.element.parentNode.removeChild(notification.element);
        }
      }, 300);
    } else {
      if (notification.element.parentNode) {
        notification.element.parentNode.removeChild(notification.element);
      }
    }

    this.notifications.splice(notificationIndex, 1);
  }

  // إزالة جميع الإشعارات
  clear() {
    this.notifications.forEach(notification => {
      this.remove(notification.id, false);
    });
    this.notifications = [];
  }

  // ألوان حسب النوع
  getBackgroundColor(type) {
    const colors = {
      success: '#d4edda',
      error: '#f8d7da',
      warning: '#fff3cd',
      info: '#d1ecf1'
    };
    return colors[type] || colors.info;
  }

  getTextColor(type) {
    const colors = {
      success: '#155724',
      error: '#721c24',
      warning: '#856404',
      info: '#0c5460'
    };
    return colors[type] || colors.info;
  }

  getBorderColor(type) {
    const colors = {
      success: '#28a745',
      error: '#dc3545',
      warning: '#ffc107',
      info: '#17a2b8'
    };
    return colors[type] || colors.info;
  }

  getIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  }

  // طرق مختصرة
  success(message, duration) {
    return this.show(message, 'success', duration);
  }

  error(message, duration) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration) {
    return this.show(message, 'info', duration);
  }
}

// إنشاء instance واحد للاستخدام العام
const notifications = new NotificationSystem();

// تصدير للاستخدام في الوحدات الأخرى
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { NotificationSystem, notifications };
} else {
  window.NotificationSystem = NotificationSystem;
  window.notifications = notifications;
}