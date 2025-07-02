const currentScript = document.currentScript || (function(){
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();
  const config = {};
  if (currentScript.dataset) {
    for (const key in currentScript.dataset) {
      config[key] = currentScript.dataset[key];
    }
  } else {
    for (let i = 0; i < currentScript.attributes.length; i++) {
      const attr = currentScript.attributes[i];
      if (attr.name.indexOf('data-') === 0) {
        const prop = attr.name.slice(5).replace(/-([a-z])/g, function(_, c){ return c.toUpperCase(); });
        config[prop] = attr.value;
      }
    }
  }
  const scriptSrc = currentScript.src || '';
  const defaultBase = scriptSrc.slice(0, scriptSrc.lastIndexOf('/'));
  const baseUrl = config.baseUrl || defaultBase;
  const cssUrls = [
    'https://cdn.jsdelivr.net/npm/tailwindcss@^2/dist/tailwind.min.css',
    baseUrl + '/widget.css'
  ];
  function normalize(url) {
    try {
      const base = document.baseURI || window.location.href;
      return new URL(url, base).href;
    } catch (e) {
      return url;
    }
  }
  function loadCSS(href) {
    const hrefNorm = normalize(href);
    const links = document.getElementsByTagName('link');
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      if (link.rel === 'stylesheet' && normalize(link.href) === hrefNorm) {
        return;
      }
    }
    const linkEl = document.createElement('link');
    linkEl.rel = 'stylesheet';
    linkEl.href = href;
    linkEl.onerror = function(e) {
      console.error('Error loading CSS:', href, e);
    };
    document.head.appendChild(linkEl);
  }
  function loadScript(src, callback) {
    const srcNorm = normalize(src);
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      if (normalize(scripts[i].src) === srcNorm) {
        if (callback) callback();
        return;
      }
    }
    const scriptEl = document.createElement('script');
    scriptEl.src = src;
    scriptEl.async = true;
    scriptEl.onload = function() {
      if (callback) callback();
    };
    scriptEl.onerror = function(e) {
      console.error('Error loading script:', src, e);
    };
    document.head.appendChild(scriptEl);
  }
  function bootstrapWidget() {
    if (typeof window.SEOWidgetPlus === 'undefined') {
      window.SEOWidgetPlus = {};
    }
    if (!window.SEOWidgetPlus.init && typeof window.initMain === 'function') {
      window.SEOWidgetPlus.init = window.initMain;
    }
    if (typeof window.SEOWidgetPlus.init === 'function') {
      window.SEOWidgetPlus.init(config);
    } else {
      console.error('SEOWidgetPlus.init is not available');
    }
  }
  cssUrls.forEach(loadCSS);
  loadScript(baseUrl + '/widget.js', bootstrapWidget);
})();