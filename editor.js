(function(window, document) {
  function sanitizeHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = html;
    const removeUnsafe = node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName.toLowerCase() === 'script') {
          node.parentNode.removeChild(node);
          return;
        }
        Array.from(node.attributes).forEach(attr => {
          const name = attr.name;
          const value = attr.value;
          if (/^on/i.test(name) || (['href', 'src'].includes(name.toLowerCase()) && /^javascript:/i.test(value))) {
            node.removeAttribute(name);
          }
        });
      }
      Array.from(node.childNodes).forEach(removeUnsafe);
    };
    Array.from(template.content.childNodes).forEach(removeUnsafe);
    return template.innerHTML;
  }

  class Editor {
    constructor(container, configs = [], initialContent = '') {
      this.container = typeof container === 'string' ? document.querySelector(container) : container;
      if (!this.container) {
        throw new Error('Editor container not found: ' + container);
      }
      this.toolbar = document.createElement('div');
      this.toolbar.className = 'editor-toolbar flex space-x-1 mb-2';
      this.toolbar.setAttribute('role', 'toolbar');
      this.editorArea = document.createElement('div');
      this.editorArea.className = 'editor-area border p-2 min-h-[200px]';
      this.editorArea.contentEditable = 'true';
      this.editorArea.setAttribute('role', 'textbox');
      this.editorArea.setAttribute('aria-multiline', 'true');
      this.editorArea.innerHTML = initialContent;
      this.container.appendChild(this.toolbar);
      this.container.appendChild(this.editorArea);
      this.callbacks = [];
      this.metrics = { words: 0, chars: 0, headings: 0, paragraphs: 0, links: 0 };
      this._initContentListener();
      if (Array.isArray(configs)) {
        this.registerToolbarButtons(configs);
      }
      this.updateMetrics(this.editorArea.innerHTML);
    }

    _initContentListener() {
      this.editorArea.addEventListener('input', () => {
        const content = this.editorArea.innerHTML;
        this.updateMetrics(content);
        this.callbacks.forEach(cb => {
          try {
            cb(content, this.metrics);
          } catch (e) {
            console.error('Editor onContentChange callback error:', e);
          }
        });
      });
    }

    registerToolbarButtons(configs) {
      configs.forEach(cfg => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = cfg.className || 'px-2 py-1 text-gray-700 hover:bg-gray-200 rounded';
        if (cfg.icon && typeof cfg.icon === 'string') {
          btn.innerHTML = sanitizeHTML(cfg.icon);
        } else if (cfg.label) {
          btn.textContent = cfg.label;
        } else {
          btn.textContent = cfg.command;
        }
        if (cfg.tooltip) {
          btn.setAttribute('aria-label', cfg.tooltip);
          btn.title = cfg.tooltip;
        }
        btn.addEventListener('click', () => {
          this.applyFormat(cfg.command, cfg.value);
        });
        this.toolbar.appendChild(btn);
      });
    }

    applyFormat(command, value = null) {
      this.editorArea.focus();
      if (document.queryCommandSupported && !document.queryCommandSupported(command)) {
        console.warn(`Command "${command}" is not supported and may not work as expected.`);
      }
      try {
        document.execCommand(command, false, value);
      } catch (e) {
        console.error('applyFormat error:', e);
      }
      const content = this.editorArea.innerHTML;
      this.updateMetrics(content);
      this.callbacks.forEach(cb => {
        try {
          cb(content, this.metrics);
        } catch (e) {
          console.error('Editor callback error:', e);
        }
      });
    }

    onContentChange(callback) {
      if (typeof callback === 'function') {
        this.callbacks.push(callback);
      }
    }

    updateMetrics(content) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      const text = tempDiv.innerText || '';
      const words = text.trim().split(/\s+/).filter(w => w).length;
      const chars = text.length;
      const headings = tempDiv.querySelectorAll('h1,h2,h3,h4,h5,h6').length;
      const paragraphs = tempDiv.querySelectorAll('p').length;
      const links = tempDiv.querySelectorAll('a').length;
      this.metrics = { words, chars, headings, paragraphs, links };
    }

    exportContent(format = 'html') {
      const content = this.editorArea.innerHTML;
      switch (format) {
        case 'html':
          return content;
        case 'text':
          return this.editorArea.innerText;
        case 'json':
          return JSON.stringify({ content, metrics: this.metrics });
        default:
          throw new Error('Unsupported format: ' + format);
      }
    }
  }

  window.Editor = Editor;
})(window, document);