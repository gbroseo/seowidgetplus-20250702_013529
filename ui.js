const UI = {
    container: null,
    tabs: ['research', 'outline', 'entities'],
    currentTab: '',

    initUI(container) {
      this.container = typeof container === 'string' ? document.querySelector(container) : container;
      if (!this.container) return;
      this.renderTabs(this.tabs);
      if (!document.getElementById('toast-container')) {
        const toasts = document.createElement('div');
        toasts.id = 'toast-container';
        toasts.className = 'fixed top-5 right-5 space-y-2 z-50';
        document.body.appendChild(toasts);
      }
      const nav = this.container.querySelector('[data-ui-nav]');
      if (nav) {
        nav.addEventListener('click', e => {
          const btn = e.target.closest('button');
          if (btn && btn.dataset.tab) {
            this.switchTab(btn.dataset.tab);
          }
        });
      }
      this.currentTab = this.tabs[0];
    },

    renderTabs(tabIds) {
      this.tabs = tabIds;
      this.container.innerHTML = '';
      const nav = document.createElement('div');
      nav.setAttribute('data-ui-nav', '');
      nav.className = 'flex border-b border-gray-200';
      this.tabs.forEach((tab, i) => {
        const btn = document.createElement('button');
        btn.innerText = tab.charAt(0).toUpperCase() + tab.slice(1);
        btn.dataset.tab = tab;
        btn.className = 'px-4 py-2 -mb-px focus:outline-none';
        if (i === 0) {
          btn.classList.add('border-b-2', 'border-blue-500', 'text-blue-600');
        } else {
          btn.classList.add('text-gray-600', 'hover:text-gray-800');
        }
        nav.appendChild(btn);
      });
      this.container.appendChild(nav);
      const content = document.createElement('div');
      content.className = 'p-4';
      this.tabs.forEach((tab, i) => {
        const panel = document.createElement('div');
        panel.id = `tab-content-${tab}`;
        panel.className = i === 0 ? 'block' : 'hidden';
        content.appendChild(panel);
      });
      this.container.appendChild(content);
    },

    switchTab(tabId) {
      if (!this.tabs.includes(tabId)) return;
      this.container.querySelectorAll('[data-tab]').forEach(btn => {
        if (btn.dataset.tab === tabId) {
          btn.classList.add('border-b-2', 'border-blue-500', 'text-blue-600');
          btn.classList.remove('text-gray-600');
        } else {
          btn.classList.remove('border-b-2', 'border-blue-500', 'text-blue-600');
          btn.classList.add('text-gray-600');
        }
      });
      this.tabs.forEach(tab => {
        const panel = this.container.querySelector(`#tab-content-${tab}`);
        if (panel) {
          if (tab === tabId) {
            panel.classList.remove('hidden');
            panel.classList.add('block');
          } else {
            panel.classList.add('hidden');
            panel.classList.remove('block');
          }
        }
      });
      this.currentTab = tabId;
    },

    renderResearchTab(data) {
      const panel = this.container.querySelector('#tab-content-research');
      if (!panel) return;
      panel.innerHTML = '';
      if (data && data.loading) {
        this.showSpinner(panel);
        return;
      }
      this.hideSpinner(panel);
      if (data && data.results && data.results.length) {
        const sec = document.createElement('div');
        const h = document.createElement('h3');
        h.innerText = 'Top SERP Results';
        h.className = 'text-lg font-semibold mb-2';
        sec.appendChild(h);
        data.results.forEach(item => {
          const div = document.createElement('div');
          div.className = 'mb-2';
          const a = document.createElement('a');
          a.href = item.link;
          a.target = '_blank';
          a.rel = 'noopener';
          a.className = 'text-blue-500 hover:underline';
          a.innerText = item.title;
          const p = document.createElement('p');
          p.className = 'text-sm text-gray-600';
          p.innerText = item.snippet;
          div.appendChild(a);
          div.appendChild(p);
          sec.appendChild(div);
        });
        panel.appendChild(sec);
      }
      if (data && data.questions && data.questions.length) {
        const sec = document.createElement('div');
        const h = document.createElement('h3');
        h.innerText = 'People Also Ask';
        h.className = 'text-lg font-semibold mt-4 mb-2';
        sec.appendChild(h);
        const ul = document.createElement('ul');
        ul.className = 'list-disc list-inside';
        data.questions.forEach(q => {
          const li = document.createElement('li');
          li.innerText = q;
          ul.appendChild(li);
        });
        sec.appendChild(ul);
        panel.appendChild(sec);
      }
      if (data && data.related && data.related.length) {
        const sec = document.createElement('div');
        const h = document.createElement('h3');
        h.innerText = 'Related Searches';
        h.className = 'text-lg font-semibold mt-4 mb-2';
        sec.appendChild(h);
        const ul = document.createElement('ul');
        ul.className = 'list-disc list-inside';
        data.related.forEach(r => {
          const li = document.createElement('li');
          const span = document.createElement('span');
          span.className = 'text-blue-500';
          span.innerText = r;
          li.appendChild(span);
          ul.appendChild(li);
        });
        sec.appendChild(ul);
        panel.appendChild(sec);
      }
    },

    renderOutlineTab(data) {
      const panel = this.container.querySelector('#tab-content-outline');
      if (!panel) return;
      panel.innerHTML = '';
      if (data && data.loading) {
        this.showSpinner(panel);
        return;
      }
      this.hideSpinner(panel);
      const h = document.createElement('h3');
      h.innerText = 'Suggested Outline';
      h.className = 'text-lg font-semibold mb-2';
      panel.appendChild(h);
      if (data && data.outline && data.outline.length) {
        const ul = document.createElement('ul');
        ul.className = 'list-decimal list-inside';
        data.outline.forEach(item => {
          const li = document.createElement('li');
          const input = document.createElement('input');
          input.type = 'text';
          input.value = item;
          input.className = 'w-full border px-2 py-1 rounded mb-1';
          li.appendChild(input);
          ul.appendChild(li);
        });
        panel.appendChild(ul);
      } else {
        const p = document.createElement('p');
        p.className = 'text-gray-600';
        p.innerText = 'No outline suggestions available.';
        panel.appendChild(p);
      }
    },

    renderEntitiesTab(data) {
      const panel = this.container.querySelector('#tab-content-entities');
      if (!panel) return;
      panel.innerHTML = '';
      if (data && data.loading) {
        this.showSpinner(panel);
        return;
      }
      this.hideSpinner(panel);
      const h = document.createElement('h3');
      h.innerText = 'Extracted Entities';
      h.className = 'text-lg font-semibold mb-2';
      panel.appendChild(h);
      if (data && data.entities && data.entities.length) {
        const table = document.createElement('table');
        table.className = 'min-w-full text-sm';
        const thead = document.createElement('thead');
        thead.innerHTML = '<tr><th class="px-2 py-1 text-left">Entity</th><th class="px-2 py-1 text-left">Type</th></tr>';
        table.appendChild(thead);
        const tbody = document.createElement('tbody');
        data.entities.forEach(ent => {
          const tr = document.createElement('tr');
          const td1 = document.createElement('td');
          td1.className = 'px-2 py-1';
          td1.innerText = ent.entity;
          const td2 = document.createElement('td');
          td2.className = 'px-2 py-1';
          td2.innerText = ent.type;
          tr.appendChild(td1);
          tr.appendChild(td2);
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        panel.appendChild(table);
      } else {
        const p = document.createElement('p');
        p.className = 'text-gray-600';
        p.innerText = 'No entities extracted.';
        panel.appendChild(p);
      }
    },

    showToast(message, type = 'info') {
      const container = document.getElementById('toast-container');
      if (!container) return;
      const toast = document.createElement('div');
      const colors = {
        info: 'bg-blue-100 text-blue-800 border-blue-200',
        success: 'bg-green-100 text-green-800 border-green-200',
        error: 'bg-red-100 text-red-800 border-red-200'
      };
      toast.className = `border ${colors[type] || colors.info} px-4 py-2 rounded shadow flex items-center justify-between`;
      toast.setAttribute('role', 'alert');
      const msg = document.createElement('span');
      msg.innerText = message;
      toast.appendChild(msg);
      const btn = document.createElement('button');
      btn.innerText = '?';
      btn.className = 'ml-4 font-bold focus:outline-none';
      btn.setAttribute('aria-label', 'Close');
      btn.onclick = () => {
        if (container.contains(toast)) {
          container.removeChild(toast);
        }
      };
      toast.appendChild(btn);
      container.appendChild(toast);
      setTimeout(() => {
        if (container.contains(toast)) {
          container.removeChild(toast);
        }
      }, 5000);
    },

    showSpinner(target) {
      if (!target) return;
      this.hideSpinner(target);
      const spinner = document.createElement('div');
      spinner.className = 'spinner-overlay absolute inset-0 flex items-center justify-center bg-white bg-opacity-75';
      spinner.innerHTML = '<svg class="animate-spin h-8 w-8 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>';
      const style = getComputedStyle(target).position;
      if (style === 'static') {
        target.style.position = 'relative';
      }
      target.appendChild(spinner);
    },

    hideSpinner(target) {
      if (!target) return;
      target.querySelectorAll('.spinner-overlay').forEach(el => el.remove());
    }
  };

  window.SEOWidgetUI = UI;