(function(window, document) {
  const STORAGE_KEYS = {
    serp: 'seowidgetplus_serpKey',
    textRazor: 'seowidgetplus_textRazorKey'
  };
  let overlay, modal, serpInput, textRazorInput, saveButton;
  function initSettingsPanel(container) {
    if (overlay) return;
    if (!container) container = document.body;
    overlay = document.createElement('div');
    overlay.className = 'sewp-overlay fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50';
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeSettings();
    });
    modal = document.createElement('div');
    modal.className = 'sewp-modal bg-white rounded-lg w-full max-w-md p-6 relative';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'sewp-settings-title');
    overlay.appendChild(modal);
    const title = document.createElement('h2');
    title.className = 'text-lg font-semibold mb-4';
    title.id = 'sewp-settings-title';
    title.textContent = 'Settings';
    modal.appendChild(title);
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'absolute top-3 right-3 text-gray-500 hover:text-gray-700';
    closeBtn.setAttribute('aria-label', 'Close settings');
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', closeSettings);
    modal.appendChild(closeBtn);
    function createField(id, labelText, placeholder) {
      const wrapper = document.createElement('div');
      wrapper.className = 'mb-4';
      const label = document.createElement('label');
      label.setAttribute('for', id);
      label.className = 'block text-sm font-medium text-gray-700 mb-1';
      label.textContent = labelText;
      const input = document.createElement('input');
      input.type = 'password';
      input.id = id;
      input.name = id;
      input.placeholder = placeholder;
      input.className = 'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300';
      const toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.textContent = 'Show';
      toggleBtn.className = 'mt-1 text-sm text-blue-600 hover:text-blue-800 focus:outline-none';
      toggleBtn.addEventListener('click', function() {
        if (input.type === 'password') {
          input.type = 'text';
          toggleBtn.textContent = 'Hide';
        } else {
          input.type = 'password';
          toggleBtn.textContent = 'Show';
        }
      });
      const error = document.createElement('p');
      error.className = 'mt-1 text-sm text-red-600 hidden';
      wrapper.appendChild(label);
      wrapper.appendChild(input);
      wrapper.appendChild(toggleBtn);
      wrapper.appendChild(error);
      return { wrapper, input, error };
    }
    const serpField = createField('sewp-serp-key', 'SerpApi API Key', 'Enter SerpApi API Key');
    modal.appendChild(serpField.wrapper);
    const textRazorField = createField('sewp-textrazor-key', 'TextRazor API Key', 'Enter TextRazor API Key');
    modal.appendChild(textRazorField.wrapper);
    serpInput = serpField.input;
    textRazorInput = textRazorField.input;
    function updateSaveState() {
      const valid = validateKey(serpInput.value) && validateKey(textRazorInput.value);
      saveButton.disabled = !valid;
      if (saveButton.disabled) saveButton.classList.add('opacity-50', 'cursor-not-allowed');
      else saveButton.classList.remove('opacity-50', 'cursor-not-allowed');
    }
    serpInput.addEventListener('input', function() {
      if (!validateKey(serpInput.value)) {
        serpField.error.textContent = 'Please enter a valid key.';
        serpField.error.classList.remove('hidden');
      } else {
        serpField.error.classList.add('hidden');
      }
      updateSaveState();
    });
    textRazorInput.addEventListener('input', function() {
      if (!validateKey(textRazorInput.value)) {
        textRazorField.error.textContent = 'Please enter a valid key.';
        textRazorField.error.classList.remove('hidden');
      } else {
        textRazorField.error.classList.add('hidden');
      }
      updateSaveState();
    });
    saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.className = 'mt-4 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300 opacity-50 cursor-not-allowed';
    saveButton.textContent = 'Save';
    saveButton.disabled = true;
    saveButton.addEventListener('click', function() {
      const serpVal = serpInput.value.trim();
      const textRazorVal = textRazorInput.value.trim();
      let valid = true;
      if (!validateKey(serpVal)) {
        serpField.error.textContent = 'Please enter a valid key.';
        serpField.error.classList.remove('hidden');
        valid = false;
      }
      if (!validateKey(textRazorVal)) {
        textRazorField.error.textContent = 'Please enter a valid key.';
        textRazorField.error.classList.remove('hidden');
        valid = false;
      }
      if (!valid) return;
      saveApiKeys(serpVal, textRazorVal);
      closeSettings();
    });
    modal.appendChild(saveButton);
    container.appendChild(overlay);
    const stored = loadApiKeys();
    if (stored.serpKey) serpInput.value = stored.serpKey;
    if (stored.textRazorKey) textRazorInput.value = stored.textRazorKey;
    updateSaveState();
  }
  function openSettings() {
    if (!overlay) return;
    overlay.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    setTimeout(function() {
      serpInput.focus();
    }, 100);
  }
  function closeSettings() {
    if (!overlay) return;
    overlay.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }
  function saveApiKeys(serpKey, textRazorKey) {
    try {
      localStorage.setItem(STORAGE_KEYS.serp, serpKey);
      localStorage.setItem(STORAGE_KEYS.textRazor, textRazorKey);
    } catch (e) {
      console.error('Failed to save API keys', e);
    }
  }
  function loadApiKeys() {
    let serpKey = '', textRazorKey = '';
    try {
      serpKey = localStorage.getItem(STORAGE_KEYS.serp) || '';
      textRazorKey = localStorage.getItem(STORAGE_KEYS.textRazor) || '';
    } catch (e) {
      console.error('Failed to load API keys', e);
    }
    return { serpKey, textRazorKey };
  }
  function validateKey(key) {
    return typeof key === 'string' && key.trim().length >= 10;
  }
  window.SettingsPanel = {
    init: initSettingsPanel,
    open: openSettings,
    close: closeSettings,
    saveApiKeys: saveApiKeys,
    loadApiKeys: loadApiKeys,
    validateKey: validateKey
  };
})(window, document);