// Polyfill for inert attribute for older browsers
(function() {
    'use strict';
    
    // Check if inert is already supported
    if ('inert' in HTMLElement.prototype) {
        return;
    }
    
    console.warn('⚠️ inert غير مدعوم أصلياً، استخدام polyfill');
    
    // Simple inert polyfill
    Object.defineProperty(HTMLElement.prototype, 'inert', {
        enumerable: true,
        get: function() {
            return this.hasAttribute('inert');
        },
        set: function(value) {
            if (value) {
                this.setAttribute('inert', '');
                // Disable all focusable elements
                this._savedTabIndex = [];
                const focusables = this.querySelectorAll('a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])');
                focusables.forEach((el, index) => {
                    this._savedTabIndex[index] = el.tabIndex;
                    el.tabIndex = -1;
                });
                
                // Add visual indication
                this.style.pointerEvents = 'none';
                this.style.opacity = '0.5';
                this.setAttribute('aria-hidden', 'true');
            } else {
                this.removeAttribute('inert');
                // Restore focusable elements
                if (this._savedTabIndex) {
                    const focusables = this.querySelectorAll('a[href], button, input, textarea, select, details');
                    focusables.forEach((el, index) => {
                        if (this._savedTabIndex[index] !== undefined) {
                            el.tabIndex = this._savedTabIndex[index];
                        }
                    });
                    delete this._savedTabIndex;
                }
                
                // Remove visual indication
                this.style.pointerEvents = '';
                this.style.opacity = '';
                this.removeAttribute('aria-hidden');
            }
        }
    });
    
    // Process existing inert attributes
    document.querySelectorAll('[inert]').forEach(el => {
        el.inert = true;
    });
    
    console.log('✅ inert polyfill تم تحميله');
})();