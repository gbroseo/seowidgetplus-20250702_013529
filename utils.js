function getLocal(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (e) {
      console.error('getLocal error:', e);
      return null;
    }
  }

  function setLocal(key, value) {
    try {
      const v = JSON.stringify(value);
      localStorage.setItem(key, v);
    } catch (e) {
      console.error('setLocal error:', e);
    }
  }

  function removeLocal(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('removeLocal error:', e);
    }
  }

  function showToast(message, options = {}) {
    const { duration = 3000, type = 'info' } = options;
    const typeClasses = {
      info: 'bg-blue-500 text-white',
      success: 'bg-green-500 text-white',
      warning: 'bg-yellow-400 text-black',
      error: 'bg-red-500 text-white'
    };
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.setAttribute('aria-live', 'polite');
      container.className = 'fixed top-5 right-5 z-50 flex flex-col items-end space-y-2';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `${typeClasses[type] || typeClasses.info} px-4 py-2 rounded shadow transition-opacity duration-300`;
    toast.style.opacity = '1';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        if (container.contains(toast)) {
          container.removeChild(toast);
          if (!container.hasChildNodes()) {
            document.body.removeChild(container);
          }
        }
      }, 300);
    }, duration);
  }

  function debounce(func, wait = 300) {
    let timeout;
    return function(...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  function throttle(func, limit = 300) {
    let inThrottle = false;
    return function(...args) {
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  window.SEOWidgetPlus = window.SEOWidgetPlus || {};
  if (!window.SEOWidgetPlus.utils) {
    window.SEOWidgetPlus.utils = {
      getLocal,
      setLocal,
      removeLocal,
      showToast,
      debounce,
      throttle
    };
  } else {
    console.warn('SEOWidgetPlus.utils already exists. Skipping utils assignment.');
  }