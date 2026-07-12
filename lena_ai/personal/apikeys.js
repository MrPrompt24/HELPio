/* MrPrompt AI Chat – Additional API Keys
   - wstrzykuje sekcję "API Keys (opcjonalne)" do Ustawień
   - zapis/odczyt z localStorage (prefiksy: api_hf_token, api_extra_*)
*/

(function(){
  const $ = (s,r=document)=>r.querySelector(s);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init(){
    const settingsPanel = $('#settings-panel');
    const content = settingsPanel?.querySelector('.sidepanel-content');
    if (!content) return;

    const box = document.createElement('section');
    box.className = 'field';
    box.innerHTML = `
      <details class="tips">
        <summary><i class="fa-solid fa-key"></i> API Keys (opcjonalne)</summary>
        <div style="display:grid; gap:12px; padding-top:10px;">
          <label class="field">
            <span>Hugging Face Token (darmowy, do generowania grafiki) </span>
            <input id="hf-token" type="password" placeholder="hf_xxx..." />
          </label>
          <div style="display:flex; gap:8px; flex-wrap:wrap">
            <button id="hf-save" class="icon-btn xs"><i class="fa-solid fa-floppy-disk"></i> Zapisz</button>
            <button id="hf-clear" class="icon-btn xs"><i class="fa-regular fa-trash-can"></i> Usuń</button>
          </div>
          <p class="muted mini">Token uzyskasz na huggingface.co → Settings → Access Tokens (free). Użyjemy go do prostych endpointów Inference API (np. Stable Diffusion).</p>
        </div>
      </details>
    `;
    content.appendChild(box);

    const hfInput = $('#hf-token');
    const saved = localStorage.getItem('api_hf_token');
    if (saved) hfInput.value = saved.replace(/./g,'•'); // maska

    $('#hf-save').addEventListener('click', (e)=>{
      e.preventDefault();
      // nie czytamy z masked; prosimy o wklejenie ponownie jeśli puste
      const val = prompt('Wklej nowy Hugging Face token (zastąpi ewentualny stary):', '');
      if (!val) return;
      localStorage.setItem('api_hf_token', val.trim());
      toast('Zapisano Hugging Face token.');
    });
    $('#hf-clear').addEventListener('click', (e)=>{
      e.preventDefault();
      localStorage.removeItem('api_hf_token');
      hfInput.value = '';
      toast('Usunięto token.');
    });

    function toast(msg){
      const d=document.createElement('div');
      d.textContent=msg;
      d.style.cssText=`position:fixed;bottom:18px;left:50%;transform:translateX(-50%);background:#0aa9ee;color:#001018;padding:10px 14px;border-radius:12px;font-weight:700;z-index:1000;box-shadow:0 10px 30px rgba(0,0,0,.35)`;
      document.body.appendChild(d); setTimeout(()=>d.remove(), 2000);
    }
  }
})();
