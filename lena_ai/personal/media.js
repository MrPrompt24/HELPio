/* MrPrompt AI Chat – Media generator (Images via Hugging Face Inference API)
   - dodaje przycisk "Media" do topbara
   - otwiera modal z promptem i generuje obraz (SD 2.1 domyślnie)
   - wynik wstrzykuje do listy wiadomości jako „AI” (bez zapisu binarki w historii)
*/

(function(){
  const $ = (s,r=document)=>r.querySelector(s);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init(){
    const topbarActions = document.querySelector('.topbar .actions');
    const messages = $('#messages');
    if (!topbarActions || !messages) return;

    // Dodaj przycisk
    const btn = document.createElement('button');
    btn.id = 'open-media';
    btn.className = 'icon-btn';
    btn.title = 'Media (grafika)';
    btn.innerHTML = `<i class="fa-regular fa-image"></i><span class="hide-sm">Media</span>`;
    topbarActions.insertBefore(btn, topbarActions.firstChild);

    // Dodaj modal
    const dlg = document.createElement('dialog');
    dlg.id = 'media-modal';
    dlg.innerHTML = `
      <form method="dialog" class="modal-card" id="media-form">
        <div class="modal-head">
          <h3><i class="fa-regular fa-image"></i> Generator obrazu</h3>
          <button value="close" class="icon-btn" id="media-close" title="Zamknij">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div style="display:grid; gap:12px">
          <label class="field">
            <span>Model (HF)</span>
            <select id="media-model">
              <option value="stabilityai/stable-diffusion-2-1">stabilityai/stable-diffusion-2-1</option>
              <option value="stabilityai/sdxl-turbo">stabilityai/sdxl-turbo</option>
            </select>
          </label>
          <label class="field">
            <span>Prompt</span>
            <textarea id="media-prompt" rows="4" placeholder="high quality, 35mm photo of ..."></textarea>
          </label>
          <div class="modal-actions">
            <button value="gen" class="primary"><i class="fa-solid fa-wand-magic-sparkles"></i> Generuj</button>
          </div>
          <p class="mini muted">Uwaga: potrzebny darmowy token Hugging Face (dodaj w Ustawieniach → API Keys). Wynik może być limitowany przez darmowe limity HF i CORS.</p>
        </div>
      </form>
    `;
    document.body.appendChild(dlg);

    // Handlery
    btn.addEventListener('click', ()=> dlg.showModal());
    $('#media-close').addEventListener('click', (e)=>{ e.preventDefault(); dlg.close('close'); });

    $('#media-form').addEventListener('submit', async (e)=>{
      e.preventDefault();
      const token = localStorage.getItem('api_hf_token');
      if (!token) { toast('Dodaj token Hugging Face w Ustawieniach (API Keys).', true); return; }

      const model = $('#media-model').value;
      const prompt = $('#media-prompt').value.trim();
      if (!prompt) { toast('Podaj prompt.', true); return; }

      try{
        // pokaż wpis użytkownika i placeholder AI
        renderUser(prompt);
        const contentEl = renderAI('Generuję obraz…');

        const res = await fetch(`https://api-inference.huggingface.co/models/${encodeURIComponent(model)}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ inputs: prompt })
        });

        if (!res.ok) {
          const txt = await res.text().catch(()=> '');
          throw new Error(`HF ${res.status}: ${res.statusText}\n${txt}`);
        }

        // HF może zwracać obraz (application/json lub image/*). Jeśli json – to błąd/queue.
        const ctype = res.headers.get('content-type') || '';
        if (ctype.includes('application/json')) {
          const json = await res.json();
          throw new Error(`HF: ${json.error || 'kolejka / limit'}`);
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        // wstaw obraz w bańkę AI (nie zapisujemy do historii jako blob-URL)
        const img = document.createElement('img');
        img.src = url;
        img.alt = 'Wygenerowany obraz';
        img.style.maxWidth = '100%';
        img.style.borderRadius = '12px';
        img.style.border = 'var(--border)';

        contentEl.textContent = ''; // wyczyść placeholder
        contentEl.appendChild(img);

        toast('Obraz gotowy.');

      } catch(err){
        renderAI(`⚠️ Błąd generatora: ${String(err.message || err)}`);
      } finally {
        dlg.close('close');
      }
    });

    // Helpers do renderu zgodnego ze stylem czatu
    function renderUser(text){
      const tpl = $('#msg-template').content.firstElementChild.cloneNode(true);
      tpl.classList.add('user');
      tpl.querySelector('.role').textContent = 'Ty';
      tpl.querySelector('.content').textContent = text;
      tpl.querySelector('.copy').addEventListener('click', ()=> copy(text));
      messages.appendChild(tpl);
      messages.scrollTop = messages.scrollHeight;
    }
    function renderAI(initialText='…'){
      const tpl = $('#msg-template').content.firstElementChild.cloneNode(true);
      tpl.classList.add('assistant');
      tpl.querySelector('.role').textContent = 'AI';
      const c = tpl.querySelector('.content');
      c.textContent = initialText;
      tpl.querySelector('.copy').addEventListener('click', ()=> copy(c.textContent || ''));
      messages.appendChild(tpl);
      messages.scrollTop = messages.scrollHeight;
      return c;
    }
    function copy(t){
      navigator.clipboard?.writeText(t).then(()=>toast('Skopiowano.')).catch(()=>toast('Nie skopiowano.', true));
    }
    function toast(msg, danger=false){
      const d=document.createElement('div');
      d.textContent=msg;
      d.style.cssText=`position:fixed;bottom:18px;left:50%;transform:translateX(-50%);background:${danger?'#ff6b6b':'#0aa9ee'};color:#001018;padding:10px 14px;border-radius:12px;font-weight:700;z-index:1000;box-shadow:0 10px 30px rgba(0,0,0,.35)`;
      document.body.appendChild(d); setTimeout(()=>d.remove(), 2000);
    }
  }
})();
