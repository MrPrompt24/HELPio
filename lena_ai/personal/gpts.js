/* MrPrompt AI Chat – GPTs module (IndexedDB)
   - tworzenie / edycja / usuwanie profili „GPT”
   - zapis w IndexedDB
   - aktywacja profilu: ustawia model/temperaturę/systemPrompt w istniejącym UI
   - import / eksport JSON
*/

(function(){
  const DB_NAME = 'mrprompt_gpts_db';
  const DB_VERSION = 1;
  const STORE = 'profiles';

  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // Czekaj aż istniejący UI się załaduje
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  async function init(){
    const settingsPanel = $('#settings-panel');
    const settingsContent = settingsPanel?.querySelector('.sidepanel-content');
    if (!settingsPanel || !settingsContent) return;

    // UI kontener
    const box = document.createElement('section');
    box.className = 'gpts-box field';
    box.innerHTML = `
      <details class="tips" open>
        <summary><i class="fa-solid fa-robot"></i> Moje GPTs (beta)</summary>
        <div class="gpts-wrap" style="display:grid; gap:12px; padding-top:10px;">
          <div class="gpts-row" style="display:grid; gap:10px">
            <label class="field">
              <span>Nazwa</span>
              <input id="gpt-name" type="text" placeholder="Asystent Finansowy" />
            </label>
            <label class="field">
              <span>Id (unikalny, bez spacji)</span>
              <input id="gpt-id" type="text" placeholder="gpt_finanse" />
            </label>
          </div>

          <div class="gpts-row" style="display:grid; gap:10px">
            <label class="field">
              <span>Ikona (Font Awesome klasa)</span>
              <input id="gpt-icon" type="text" placeholder="fa-solid fa-coins" />
            </label>
            <label class="field">
              <span>Opis (krótko)</span>
              <input id="gpt-desc" type="text" placeholder="Doradca budżetu domowego" />
            </label>
          </div>

          <div class="gpts-row" style="display:grid; gap:10px">
            <label class="field">
              <span>Model</span>
              <select id="gpt-model"></select>
            </label>
            <label class="field">
              <span>Temperatura <small id="gpt-temp-val">0.3</small></span>
              <input id="gpt-temp" type="range" min="0" max="1" step="0.1" value="0.3" />
            </label>
          </div>

          <label class="field">
            <span>System prompt</span>
            <textarea id="gpt-system" rows="5" placeholder="Jesteś ekspertem ..."></textarea>
          </label>

          <div class="gpts-actions" style="display:flex; gap:8px; flex-wrap:wrap">
            <button id="gpt-save" class="icon-btn xs"><i class="fa-solid fa-floppy-disk"></i> Zapisz/aktualizuj</button>
            <button id="gpt-new" class="icon-btn xs"><i class="fa-solid fa-plus"></i> Nowy</button>
            <button id="gpt-export" class="icon-btn xs"><i class="fa-regular fa-file"></i> Eksportuj</button>
            <label class="icon-btn xs" style="cursor:pointer">
              <i class="fa-solid fa-file-arrow-up"></i> Importuj
              <input id="gpt-import" type="file" accept="application/json" hidden />
            </label>
          </div>

          <div>
            <h4 style="margin:6px 0 8px 0; color:var(--muted)">Twoje profile</h4>
            <ol id="gpt-list" style="list-style:none; margin:0; padding:0; display:grid; gap:8px"></ol>
          </div>
        </div>
      </details>
    `;
    settingsContent.appendChild(box);

    // Podłączamy model select do listy z istniejącego #model
    const mainModelSelect = $('#model');
    const gptModel = $('#gpt-model');
    function syncModels() {
      gptModel.innerHTML = '';
      if (mainModelSelect && mainModelSelect.options.length) {
        [...mainModelSelect.options].forEach(opt => {
          const o = document.createElement('option');
          o.value = opt.value; o.textContent = opt.textContent;
          gptModel.appendChild(o);
        });
      } else {
        // fallback
        ['llama-3.3-70b-versatile','llama-3.3-8b-instant','mixtral-8x7b-32768','gemma2-9b-it']
          .forEach(id => {
            const o = document.createElement('option'); o.value = id; o.textContent = id;
            gptModel.appendChild(o);
          });
      }
    }
    syncModels();
    mainModelSelect?.addEventListener('change', syncModels);

    // temp label
    const temp = $('#gpt-temp'), tempVal = $('#gpt-temp-val');
    temp.addEventListener('input', () => tempVal.textContent = temp.value);

    // IndexedDB core
    const db = await openDB();
    await renderList();

    // Handlery
    $('#gpt-new').addEventListener('click', (e)=>{ e.preventDefault(); clearForm(); });
    $('#gpt-save').addEventListener('click', async (e)=>{
      e.preventDefault();
      const profile = readForm();
      if (!profile.id) { toast('Podaj ID profilu (bez spacji).', true); return; }
      await putProfile(db, profile);
      toast('Profil zapisany.');
      await renderList();
    });
    $('#gpt-export').addEventListener('click', async (e)=>{
      e.preventDefault();
      const all = await getAll(db);
      const blob = new Blob([JSON.stringify(all, null, 2)], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `mrprompt-gpts-${Date.now()}.json`; a.click();
      URL.revokeObjectURL(url);
    });
    $('#gpt-import').addEventListener('change', async (e)=>{
      const file = e.target.files?.[0]; if (!file) return;
      try {
        const text = await file.text();
        const arr = JSON.parse(text);
        if (!Array.isArray(arr)) throw new Error('Zły JSON');
        for (const p of arr) { if (p && p.id) await putProfile(db, p); }
        toast('Zaimportowano GPTs.');
        await renderList();
      } catch {
        toast('Import nieudany.', true);
      } finally {
        e.target.value = '';
      }
    });

    function readForm(){
      return {
        id: $('#gpt-id').value.trim(),
        name: $('#gpt-name').value.trim() || $('#gpt-id').value.trim(),
        desc: $('#gpt-desc').value.trim(),
        icon: $('#gpt-icon').value.trim() || 'fa-solid fa-robot',
        systemPrompt: $('#gpt-system').value,
        temperature: Number($('#gpt-temp').value || '0.3'),
        model: $('#gpt-model').value
      };
    }
    function fillForm(p){
      $('#gpt-id').value = p.id || '';
      $('#gpt-name').value = p.name || '';
      $('#gpt-desc').value = p.desc || '';
      $('#gpt-icon').value = p.icon || '';
      $('#gpt-system').value = p.systemPrompt || '';
      $('#gpt-temp').value = String(p.temperature ?? 0.3);
      $('#gpt-temp-val').textContent = String(p.temperature ?? 0.3);
      $('#gpt-model').value = p.model || $('#gpt-model').value;
    }
    function clearForm(){ fillForm({ id:'', name:'', desc:'', icon:'', systemPrompt:'', temperature:0.3, model: $('#gpt-model').value }); }

    async function renderList(){
      const list = $('#gpt-list');
      list.innerHTML = '';
      const all = await getAll(db);
      if (!all.length) {
        const li = document.createElement('li');
        li.style.color = 'var(--muted)';
        li.textContent = 'Brak profili. Utwórz pierwszy powyżej.';
        list.appendChild(li);
        return;
      }
      for (const p of all) {
        const li = document.createElement('li');
        li.style.border = 'var(--border)';
        li.style.borderRadius = '12px';
        li.style.padding = '8px 10px';
        li.style.display = 'grid';
        li.style.gridTemplateColumns = '1fr auto auto auto';
        li.style.gap = '8px';
        li.innerHTML = `
          <div style="display:flex; gap:8px; align-items:center;">
            <i class="${p.icon}" aria-hidden="true"></i>
            <div style="display:grid;">
              <strong>${p.name}</strong>
              <small style="color:var(--muted)">${p.id} • ${p.model} • temp ${p.temperature}</small>
            </div>
          </div>
          <button class="icon-btn xs gpt-activate"><i class="fa-solid fa-play"></i> Aktywuj</button>
          <button class="icon-btn xs gpt-edit"><i class="fa-regular fa-pen-to-square"></i> Edytuj</button>
          <button class="icon-btn xs gpt-del"><i class="fa-regular fa-trash-can"></i> Usuń</button>
        `;
        list.appendChild(li);

        li.querySelector('.gpt-edit').addEventListener('click', ()=> fillForm(p));
        li.querySelector('.gpt-del').addEventListener('click', async ()=>{
          if (await confirmInApp('Usunąć ten profil?')) {
            await delProfile(db, p.id);
            toast('Usunięto profil.');
            await renderList();
          }
        });
        li.querySelector('.gpt-activate').addEventListener('click', ()=>{
          // Wstrzykuj do istniejącego UI
          const modelSel = $('#model');
          const tempRange = $('#temperature');
          const sys = $('#system-prompt');

          if (modelSel) { modelSel.value = p.model; modelSel.dispatchEvent(new Event('change')); }
          if (tempRange) {
            tempRange.value = String(p.temperature ?? 0.3);
            const tv = $('#temp-val'); if (tv) tv.textContent = tempRange.value;
            tempRange.dispatchEvent(new Event('input'));
          }
          if (sys) { sys.value = p.systemPrompt || ''; sys.dispatchEvent(new Event('blur')); }

          toast(`Aktywowano profil: ${p.name}`);
        });
      }
    }

    // IndexedDB helpers
    function openDB(){
      return new Promise((resolve, reject)=>{
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e)=>{
          const db = e.target.result;
          if (!db.objectStoreNames.contains(STORE)) {
            db.createObjectStore(STORE, { keyPath: 'id' });
          }
        };
        req.onsuccess = ()=> resolve(req.result);
        req.onerror = ()=> reject(req.error);
      });
    }
    function putProfile(db, profile){
      return new Promise((resolve, reject)=>{
        const tx = db.transaction(STORE, 'readwrite');
        tx.oncomplete = ()=> resolve();
        tx.onerror = ()=> reject(tx.error);
        tx.objectStore(STORE).put(profile);
      });
    }
    function delProfile(db, id){
      return new Promise((resolve, reject)=>{
        const tx = db.transaction(STORE, 'readwrite');
        tx.oncomplete = ()=> resolve();
        tx.onerror = ()=> reject(tx.error);
        tx.objectStore(STORE).delete(id);
      });
    }
    function getAll(db){
      return new Promise((resolve, reject)=>{
        const tx = db.transaction(STORE, 'readonly');
        const req = tx.objectStore(STORE).getAll();
        req.onsuccess = ()=> resolve(req.result || []);
        req.onerror = ()=> reject(req.error);
      });
    }

    function toast(msg, danger=false){
      const div = document.createElement('div');
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
    function confirmInApp(message='Czy na pewno?'){
      const dlg = $('#confirm-modal');
      const msg = $('#confirm-message');
      if (!dlg || !msg) return Promise.resolve(confirm(message));
      msg.textContent = message;
      return new Promise(res=>{
        dlg.showModal();
        dlg.addEventListener('close', function onClose(){
          dlg.removeEventListener('close', onClose);
          res(dlg.returnValue === 'ok');
        });
      });
    }
  }
})();
