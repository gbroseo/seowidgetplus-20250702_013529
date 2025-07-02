let state = { serpData: null, entityData: null };

function initMain() {
    runInitSequence();
    attachEventListeners();
}

function runInitSequence() {
    handleTabSwitch('serp');
}

function attachEventListeners() {
    const form = document.getElementById('keyword-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const input = document.getElementById('keyword-input');
            const query = input ? input.value.trim() : '';
            if (query) {
                handleKeywordSubmit(query);
            }
        });
    }
    document.querySelectorAll('[data-tab-target]').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const target = btn.getAttribute('data-tab-target');
            if (target) {
                handleTabSwitch(target);
            }
        });
    });
    document.querySelectorAll('[data-export-format]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const format = btn.getAttribute('data-export-format');
            if (format) {
                handleExport(format);
            }
        });
    });
}

async function handleKeywordSubmit(query) {
    state.serpData = null;
    state.entityData = null;
    showLoading(true);
    try {
        const [serp, entities] = await Promise.all([
            fetchSerpApi(query),
            fetchTextRazor(query)
        ]);
        state.serpData = serp;
        state.entityData = entities;
        renderSerpResults(serp);
        renderEntityResults(entities);
        handleTabSwitch('serp');
    } catch (error) {
        console.error(error);
        alert('Error: ' + (error.message || error));
    } finally {
        showLoading(false);
    }
}

async function fetchSerpApi(query) {
    const url = '/api/serp?query=' + encodeURIComponent(query);
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error('Serp API proxy error: ' + res.status);
    }
    return res.json();
}

async function fetchTextRazor(text) {
    const res = await fetch('/api/textrazor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    });
    if (!res.ok) {
        throw new Error('TextRazor proxy error: ' + res.status);
    }
    return res.json();
}

function renderSerpResults(data) {
    const container = document.getElementById('serp-results');
    if (!container) return;
    container.innerHTML = '';
    const results = data.organic_results || [];
    if (results.length) {
        const list = document.createElement('ul');
        results.forEach(function(item) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = item.link || '#';
            a.textContent = item.title || '';
            a.target = '_blank';
            a.className = 'text-blue-600 hover:underline';
            li.appendChild(a);
            if (item.snippet) {
                const p = document.createElement('p');
                p.textContent = item.snippet;
                p.className = 'text-gray-700';
                li.appendChild(p);
            }
            list.appendChild(li);
        });
        container.appendChild(list);
    } else {
        container.textContent = 'No results.';
    }
}

function renderEntityResults(data) {
    const container = document.getElementById('entity-results');
    if (!container) return;
    container.innerHTML = '';
    const entities = (data.response && data.response.entities) || [];
    if (entities.length) {
        const table = document.createElement('table');
        table.className = 'min-w-full divide-y divide-gray-200';
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const thEntity = document.createElement('th');
        thEntity.className = 'px-4 py-2 text-left';
        thEntity.textContent = 'Entity';
        const thRelevance = document.createElement('th');
        thRelevance.className = 'px-4 py-2 text-left';
        thRelevance.textContent = 'Relevance';
        headerRow.appendChild(thEntity);
        headerRow.appendChild(thRelevance);
        thead.appendChild(headerRow);
        table.appendChild(thead);
        const tbody = document.createElement('tbody');
        entities.forEach(function(ent) {
            const tr = document.createElement('tr');
            const tdEntity = document.createElement('td');
            tdEntity.className = 'border px-4 py-2';
            tdEntity.textContent = ent.entityId || ent.matchedText || '';
            const tdRel = document.createElement('td');
            tdRel.className = 'border px-4 py-2';
            tdRel.textContent = typeof ent.relevanceScore === 'number' ? ent.relevanceScore.toFixed(2) : '';
            tr.appendChild(tdEntity);
            tr.appendChild(tdRel);
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        container.appendChild(table);
    } else {
        container.textContent = 'No entities.';
    }
}

function handleTabSwitch(tabId) {
    document.querySelectorAll('[data-tab-content]').forEach(function(el) {
        el.classList.toggle('hidden', el.getAttribute('data-tab-content') !== tabId);
    });
    document.querySelectorAll('[data-tab-target]').forEach(function(btn) {
        const isActive = btn.getAttribute('data-tab-target') === tabId;
        btn.classList.toggle('border-b-2', isActive);
        btn.classList.toggle('border-blue-500', isActive);
    });
}

function handleExport(format) {
    const serpResults = (state.serpData && state.serpData.organic_results) || [];
    const entities = (state.entityData && state.entityData.response && state.entityData.response.entities) || [];
    if (!serpResults.length && !entities.length) {
        alert('No data to export.');
        return;
    }
    let dataStr, mime, ext;
    if (format === 'json') {
        const exportObj = { serp: state.serpData, entities: state.entityData };
        dataStr = JSON.stringify(exportObj, null, 2);
        mime = 'application/json';
        ext = 'json';
    } else if (format === 'csv') {
        const rows = [['Type','Title','Link','Snippet','Entity','Relevance']];
        serpResults.forEach(function(r) {
            rows.push(['SERP', r.title || '', r.link || '', r.snippet || '', '', '']);
        });
        entities.forEach(function(e) {
            rows.push([
                'ENTITY',
                '',
                '',
                '',
                e.entityId || e.matchedText || '',
                typeof e.relevanceScore === 'number' ? e.relevanceScore.toFixed(2) : ''
            ]);
        });
        dataStr = rows.map(function(r) {
            return r.map(function(f) {
                return '"' + String(f).replace(/"/g, '""') + '"';
            }).join(',');
        }).join('\n');
        mime = 'text/csv';
        ext = 'csv';
    } else {
        alert('Export format not supported.');
        return;
    }
    const blob = new Blob([dataStr], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'seowidgetplus_export.' + ext;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function showLoading(active) {
    const btn = document.getElementById('keyword-submit');
    if (btn) btn.toggleAttribute('disabled', active);
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.classList.toggle('hidden', !active);
}

document.addEventListener('DOMContentLoaded', initMain);