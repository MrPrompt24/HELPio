// =======================
// Groq Chat – app.js (motywy: base/light/glass)
// =======================
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const DOM = {
  // Layout / UI
  layout: document.getElementById('layout'),
  messages: $('#messages'),
  input: $('#input'),
  send: $('#send'),
  stop: $('#stop-btn'),
  clear: $('#clear-chat'),
  composer: $('#composer'),
  msgTemplate: $('#msg-template'),

  // Settings panel
  openSettings: $('#open-settings'),
  closeSettings: $('#close-settings'),
  settingsPanel: $('#settings-panel'),
  model: $('#model'),
  temperature: $('#temperature'),
  tempVal: $('#temp-val'),
  promptSelect: $('#prompt-select'),
  promptDesc: $('#prompt-desc'),
  refreshModelsBtn: $('#refresh-models'),
  exportHistory: $('#export-history'),
  importHistory: $('#import-history'),
  themeSelect: $('#theme-select'),

  // API key modal
  openApi: $('#open-api'),
  apiModal: $('#api-modal'),
  apiForm: $('#api-form'),
  apiKeyInput: $('#api-key'),
  apiClose: $('#api-close'),

  // Help modal
  openHelp: $('#open-help'),
  helpModal: $('#help-modal'),
  helpForm: $('#help-form'),
  helpClose: $('#help-close'),

  // Confirm modal
  confirmModal: $('#confirm-modal'),
  confirmForm: $('#confirm-form'),
  confirmClose: $('#confirm-close'),
  confirmMsg: $('#confirm-message'),

  // Stylesheets
  themeStyle: document.getElementById('theme-style'),
};

const STORAGE_KEYS = {
  apiKey: 'groq_api_key',
  history: 'groq_chat_history_v1',
  settings: 'groq_chat_settings_v2'
};

let controller = null;
let isStreaming = false;

// ===== Utils =====
function saveLocal(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function loadLocal(key, fallback = null) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function download(filename, text) {
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function autoGrowTextarea(el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 200) + 'px'; }
function scrollToBottom() { DOM.messages.scrollTop = DOM.messages.scrollHeight; }

function copyToClipboard(text) {
  navigator.clipboard?.writeText(text)
    .then(() => toast('Skopiowano do schowka.'))
    .catch(() => toast('Nie udało się skopiować.', true));
}

function toast(msg, danger=false) {
  const div = document.createElement('div');
  div.className = 'toast';
  div.textContent = msg;
  div.style.cssText = `
    position: fixed; bottom: 18px; left: 50%; transform: translateX(-50%);
    background: ${danger ? '#ff6b6b' : '#0aa9ee'};
    color: #001018; padding: 10px 14px; border-radius: 12px; font-weight: 700;
    z-index: 1000; box-shadow: 0 10px 30px rgba(0,0,0,.35);
  `;
  document.body.appendChild(div);
  setTimeout(()=>div.remove(), 2000);
}

function confirmInApp(message = 'Czy na pewno?') {
  return new Promise((resolve) => {
    DOM.confirmMsg.textContent = message;
    DOM.confirmModal.showModal();
    const onClose = () => {
      resolve(DOM.confirmModal.returnValue === 'ok');
      DOM.confirmModal.removeEventListener('close', onClose);
    };
    DOM.confirmModal.addEventListener('close', onClose);
    DOM.confirmClose.onclick = (ev) => { ev.preventDefault(); DOM.confirmModal.close('cancel'); };
  });
}

// ===== Markdown (bez HTML) =====
function escapeHTML(s) {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function mdToHtml(md) {
  let s = escapeHTML(md);
  s = s.replace(/```([\s\S]*?)```/g, (_, code) => `<pre><code>${code.trim()}</code></pre>`);
  s = s.replace(/`([^`]+)`/g, (_, code) => `<code>${code}</code>`);
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_, txt, url) => `<a href="${url}" target="_blank" rel="noopener">${txt}</a>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/_([^_]+)_/g, '<em>$1</em>');
  s = s.replace(/^(?:-|\*)\s.+(?:\n(?:-|\*)\s.+)*/gm, block => {
    const items = block.split('\n').map(line => line.replace(/^(?:-|\*)\s/, '').trim());
    return `<ul>${items.map(li => `<li>${li}</li>`).join('')}</ul>`;
  });
  s = s.split(/\n{2,}/).map(p => `<p>${p.replace(/\n/g,'<br>')}</p>`).join('');
  return s;
}

// ===== Render =====
function renderMessage(role, content, isMarkdown=false) {
  const li = DOM.msgTemplate.content.firstElementChild.cloneNode(true);
  li.classList.add(role === 'user' ? 'user' : 'assistant');
  li.querySelector('.role').textContent = role === 'user' ? 'Ty' : 'AI';
  const contentEl = li.querySelector('.content');
  if (isMarkdown) contentEl.innerHTML = mdToHtml(content); else contentEl.textContent = content;
  li.querySelector('.copy').addEventListener('click', () => copyToClipboard(contentEl.textContent));
  DOM.messages.appendChild(li);
  scrollToBottom();
  return contentEl;
}
function updateLastAssistantMessage(text) {
  const items = $$('.msg.assistant .content', DOM.messages);
  const last = items[items.length - 1];
  if (last) { last.innerHTML = mdToHtml(text); scrollToBottom(); }
}

// ===== Historia =====
function loadHistory() {
  const hist = loadLocal(STORAGE_KEYS.history, []);
  hist.forEach(m => renderMessage(m.role, m.content, m.role === 'assistant'));
}
function pushHistory(role, content) {
  const hist = loadLocal(STORAGE_KEYS.history, []);
  hist.push({ role, content });
  saveLocal(STORAGE_KEYS.history, hist);
}
function clearHistory() { saveLocal(STORAGE_KEYS.history, []); DOM.messages.innerHTML = ''; }
function collectHistoryAsMessages() {
  const hist = loadLocal(STORAGE_KEYS.history, []);
  const last = hist.slice(-16);
  return last.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }));
}
function finalizeLastAssistantInHistory(text) {
  const hist = loadLocal(STORAGE_KEYS.history, []);
  for (let i = hist.length - 1; i >= 0; i--) {
    if (hist[i].role === 'assistant' && hist[i].content === '') { hist[i].content = text; break; }
  }
  saveLocal(STORAGE_KEYS.history, hist);
}
function getLastAssistantText() {
  const items = $$('.msg.assistant .content', DOM.messages);
  const last = items[items.length - 1];
  return last ? last.textContent : '';
}

// ===== Prompty =====
let availablePrompts = [];

async function loadPromptsManifest() {
  try {
    const res = await fetch('prompts/manifest.json');
    if (!res.ok) throw new Error('Brak manifestu promptów');
    availablePrompts = await res.json();
    
    // Render opcji
    DOM.promptSelect.innerHTML = '';
    availablePrompts.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      DOM.promptSelect.appendChild(opt);
    });

    // Przywróć zapisany wybór
    const s = loadLocal(STORAGE_KEYS.settings, null);
    if (s && s.promptId && availablePrompts.find(x => x.id === s.promptId)) {
      DOM.promptSelect.value = s.promptId;
    } else {
      DOM.promptSelect.value = 'default';
    }
    updatePromptDesc();

  } catch (e) {
    console.error('Błąd ładowania promptów:', e);
    DOM.promptSelect.innerHTML = '<option value="default">Domyślny (Błąd ładowania)</option>';
  }
}

function updatePromptDesc() {
  const pid = DOM.promptSelect.value;
  // Jeśli mamy załadowane, spróbujmy pobrać opis z manifestu (jeśli tam jest) lub fetchować plik? 
  // W manifeście nie dałem opisu, więc fetchowanie pliku może być potrzebne, 
  // ALE dla wydajności lepiej trzymać opis też w manifeście albo fetchować on-demand.
  // Zróbmy fetch on-demand małego pliku JSON.
  
  const p = availablePrompts.find(x => x.id === pid);
  if (!p) return;
  
  // Opcjonalnie: pobierz treść, żeby wyświetlić opis w UI
  fetch(`prompts/${p.file}`).then(r => r.json()).then(data => {
    DOM.promptDesc.textContent = data.description || '';
  }).catch(() => DOM.promptDesc.textContent = '');
}

async function getSystemPromptContent() {
  const pid = DOM.promptSelect.value;
  const p = availablePrompts.find(x => x.id === pid);
  if (!p) return 'Jesteś pomocnym asystentem.'; // Fallback

  try {
    const res = await fetch(`prompts/${p.file}`);
    const data = await res.json();
    return data.content || '';
  } catch (e) {
    console.error(e);
    return 'Jesteś pomocnym asystentem.';
  }
}

// ===== Ustawienia + Motywy =====
function applyTheme(theme) {
  // base = bez dodatkowego pliku
  const map = {
    base: '',
    light: 'styles.light.css',
    glass: 'styles.glass.css'
  };
  DOM.themeStyle.setAttribute('href', map[theme] || '');
}
function loadSettings() {
  const s = loadLocal(STORAGE_KEYS.settings, null);
  if (s) {
    if (s.model) DOM.model.value = s.model;
    if (typeof s.temperature === 'number') { DOM.temperature.value = String(s.temperature); DOM.tempVal.textContent = String(s.temperature); }
    // promptId jest ładowany w loadPromptsManifest po fetchu
    if (s.theme) { DOM.themeSelect.value = s.theme; applyTheme(s.theme); }
  } else {
    DOM.tempVal.textContent = DOM.temperature.value;
    DOM.themeSelect.value = 'base';
    applyTheme('base');
  }
}
function saveSettings() {
  const s = {
    model: DOM.model.value,
    temperature: Number(DOM.temperature.value),
    promptId: DOM.promptSelect.value,
    theme: DOM.themeSelect.value
  };
  saveLocal(STORAGE_KEYS.settings, s);
  applyTheme(s.theme);
}

// ===== API Key modal =====
function openApiModal() {
  DOM.apiKeyInput.value = (loadLocal(STORAGE_KEYS.apiKey) ?? '');
  DOM.apiModal.showModal();
  setTimeout(()=> DOM.apiKeyInput.focus(), 50);
}
function saveApiKeyFromModal(returnValue) {
  if (returnValue === 'save') {
    const key = DOM.apiKeyInput.value.trim();
    if (!/^gsk_/.test(key)) toast('To nie wygląda na klucz Groq (gsk_...).', true);
    saveLocal(STORAGE_KEYS.apiKey, key);
    toast('Klucz API zapisany.');
  }
  if (DOM.apiModal.open) DOM.apiModal.close();
}

// ===== Modele Groq =====
async function refreshModelsList() {
  const apiKey = loadLocal(STORAGE_KEYS.apiKey);
  if (!apiKey) return;
  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} – ${res.statusText}`);
    const data = await res.json();
    const models = (data.data || [])
      .map(m => m.id)
      .filter(id => !/image|vision|audio|whisper|embed|embedding|preview/i.test(id))
      .sort();
    if (models.length === 0) throw new Error('Brak dostępnych modeli do czatu.');
    const prevDOM = DOM.model.value;
    const saved = (loadLocal(STORAGE_KEYS.settings, {}) || {}).model;
    DOM.model.innerHTML = '';
    for (const id of models) {
      const opt = document.createElement('option'); opt.value = id; opt.textContent = id;
      DOM.model.appendChild(opt);
    }
    const target = (saved && models.includes(saved)) ? saved : (models.includes(prevDOM) ? prevDOM : models[0]);
    DOM.model.value = target;
    saveSettings();
    if (!saved || saved !== target) toast('Zaktualizowano listę modeli z Groq.');
  } catch (e) {
    console.error(e); toast('Nie udało się pobrać listy modeli z Groq.', true);
  }
}

// ===== Wysyłanie/streaming =====
let lastUserTextForRetry = '';
async function sendMessage(evt, _retry = false) {
  evt?.preventDefault();
  if (isStreaming) return;

  const apiKey = loadLocal(STORAGE_KEYS.apiKey);
  if (!apiKey) { openApiModal(); return; }

  const userText = _retry ? lastUserTextForRetry : DOM.input.value.trim();
  if (!userText && !_retry) return;

  if (!_retry) {
    lastUserTextForRetry = userText;
    renderMessage('user', userText, false);
    pushHistory('user', userText);
    DOM.input.value = ''; autoGrowTextarea(DOM.input);
    renderMessage('assistant', '…', true);
    pushHistory('assistant', '');
  }

  const s = loadLocal(STORAGE_KEYS.settings) || {};
  const model = s.model || DOM.model.value;
  const temperature = (typeof s.temperature === 'number') ? s.temperature : Number(DOM.temperature.value);
  const systemPrompt = await getSystemPromptContent();

  controller = new AbortController();
  isStreaming = true;
  DOM.stop.disabled = false;
  DOM.send.disabled = true;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model, temperature, stream: true,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          ...collectHistoryAsMessages()
        ]
      }),
      signal: controller.signal
    });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status} – ${response.statusText}\n${text}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let assistantText = _retry ? (getLastAssistantText() || '') : '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').map(l => l.trim()).filter(Boolean);
      for (const line of lines) {
        if (!line.startsWith('data:')) continue;
        const data = line.replace(/^data:\s?/, '');
        if (data === '[DONE]') continue;
        try {
          const json = JSON.parse(data);
          const delta = json.choices?.[0]?.delta?.content ?? '';
          if (delta) { assistantText += delta; updateLastAssistantMessage(assistantText); }
        } catch { /* keepalive */ }
      }
    }
    finalizeLastAssistantInHistory(assistantText);

  } catch (err) {
    console.error(err);
    const msg = String(err.message || err);
    if (/_?model_?decommissioned|no longer supported/i.test(msg) && !_retry) {
      try { await refreshModelsList(); return await sendMessage(undefined, true); } catch {}
    }
    const hint = msg.includes('TypeError: Failed to fetch')
      ? '\n\nPodpowiedź: uruchom przez HTTPS lub lokalny serwer (CORS).'
      : msg.includes('401') ? '\n\nPodpowiedź: nieprawidłowy lub wygasły klucz API.' : '';
    updateLastAssistantMessage(`⚠️ Błąd: ${escapeHTML(msg)}${hint}`);
    finalizeLastAssistantInHistory(`Błąd: ${msg}`);
  } finally {
    isStreaming = false; DOM.stop.disabled = true; DOM.send.disabled = false; controller = null;
  }
}

// ===== Start/zdarzenia =====
window.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  loadPromptsManifest();
  loadHistory();

  DOM.input.addEventListener('input', () => autoGrowTextarea(DOM.input));
  autoGrowTextarea(DOM.input);
  DOM.input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); DOM.composer.requestSubmit(); }});
  DOM.composer.addEventListener('submit', sendMessage);
  DOM.stop.addEventListener('click', () => { if (controller) controller.abort(); });

  DOM.openSettings.addEventListener('click', () => {
    DOM.settingsPanel.classList.remove('hidden','slide-out');
    DOM.settingsPanel.classList.add('slide-in');
    DOM.settingsPanel.setAttribute('aria-hidden','false');
    DOM.layout.classList.remove('panel-hidden');
    if (loadLocal(STORAGE_KEYS.apiKey)) refreshModelsList();
  });
  DOM.closeSettings.addEventListener('click', () => {
    saveSettings(); toast('Ustawienia zapisane.');
    DOM.settingsPanel.classList.remove('slide-in'); DOM.settingsPanel.classList.add('slide-out');
    setTimeout(() => {
      DOM.settingsPanel.classList.add('hidden');
      DOM.settingsPanel.setAttribute('aria-hidden','true');
      DOM.layout.classList.add('panel-hidden');
    }, 200);
  });

  DOM.temperature.addEventListener('input', () => { DOM.tempVal.textContent = DOM.temperature.value; });
  DOM.model.addEventListener('change', saveSettings);
  DOM.promptSelect.addEventListener('change', () => {
    updatePromptDesc();
    saveSettings();
  });
  DOM.themeSelect.addEventListener('change', saveSettings);

  if (DOM.refreshModelsBtn) DOM.refreshModelsBtn.addEventListener('click', () => {
    if (!loadLocal(STORAGE_KEYS.apiKey)) return openApiModal();
    refreshModelsList();
  });

  DOM.openApi.addEventListener('click', openApiModal);
  DOM.apiModal.addEventListener('close', (e) => saveApiKeyFromModal(e.target.returnValue));
  DOM.apiForm.addEventListener('submit', (e) => { e.preventDefault(); DOM.apiModal.close('save'); });
  DOM.apiClose.addEventListener('click', (e) => { e.preventDefault(); DOM.apiModal.close('close'); });

  DOM.openHelp.addEventListener('click', () => DOM.helpModal.showModal());
  DOM.helpClose.addEventListener('click', (e) => { e.preventDefault(); DOM.helpModal.close('close'); });

  DOM.clear.addEventListener('click', async () => {
    const yes = await confirmInApp('Na pewno wyczyścić historię rozmowy?');
    if (yes) { clearHistory(); toast('Czat wyczyszczony.'); }
  });

  DOM.exportHistory.addEventListener('click', () => {
    const hist = loadLocal(STORAGE_KEYS.history, []);
    download(`groq-chat-history-${new Date().toISOString().slice(0,19)}.json`, JSON.stringify(hist, null, 2));
  });
  DOM.importHistory.addEventListener('change', async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error('Zły format pliku.');
      saveLocal(STORAGE_KEYS.history, parsed);
      DOM.messages.innerHTML = ''; loadHistory(); toast('Zaimportowano historię.');
    } catch { toast('Nie udało się zaimportować historii.', true); }
    finally { e.target.value = ''; }
  });

  if (loadLocal(STORAGE_KEYS.apiKey)) refreshModelsList(); else setTimeout(openApiModal, 400);
});
