(function(){
  const DBKEY = 'groq_rate_stats_v1';

  const $ = (s,r=document)=>r.querySelector(s);
  const human = {
    reset(v){
      if (!v) return '—';
      // akceptuje "7.66s" albo "2m59.56s"
      const m = String(v).match(/(?:(\d+(?:\.\d+)?)s)|(?:(\d+)m(\d+(?:\.\d+)?)s)/);
      if (!m) return v;
      if (m[2]) { // mm ss
        const mm = Number(m[2]||0), ss = Number(m[3]||0);
        return `${mm}m ${Math.round(ss)}s`;
      }
      const ss = Number(m[1]||0);
      if (ss >= 60) return `${Math.floor(ss/60)}m ${Math.round(ss%60)}s`;
      return `${Math.round(ss)}s`;
    },
    int(n){ return n==null ? '—' : String(n); }
  };

  function save(obj){ localStorage.setItem(DBKEY, JSON.stringify(obj)); }
  function load(){ try { return JSON.parse(localStorage.getItem(DBKEY)||'{}'); } catch { return {}; } }

  function upsertFromHeaders(h){
    const prev = load();
    const o = { ...prev, updatedAt: Date.now() };

    // kopiuj popularne nagłówki
    const pick = (k)=> h[k] ?? h[k.toLowerCase()];
    o.limitRequests   = pick('x-ratelimit-limit-requests') ?? o.limitRequests;
    o.remRequests     = pick('x-ratelimit-remaining-requests') ?? o.remRequests;
    o.resetRequests   = pick('x-ratelimit-reset-requests') ?? o.resetRequests;

    o.limitTokens     = pick('x-ratelimit-limit-tokens') ?? o.limitTokens;
    o.remTokens       = pick('x-ratelimit-remaining-tokens') ?? o.remTokens;
    o.resetTokens     = pick('x-ratelimit-reset-tokens') ?? o.resetTokens;

    o.limitDaily      = pick('x-ratelimit-limit-daily-requests') ?? o.limitDaily;     // jeśli Groq zwraca
    o.remDaily        = pick('x-ratelimit-remaining-daily-requests') ?? o.remDaily;   // jeśli Groq zwraca
    o.resetDaily      = pick('x-ratelimit-reset-daily-requests') ?? o.resetDaily;

    o.retryAfter      = pick('retry-after') ?? o.retryAfter;

    // oblicz użycie (jeśli znamy limit i remaining)
    const usedReq = (o.limitRequests!=null && o.remRequests!=null) ? (Number(o.limitRequests) - Number(o.remRequests)) : null;
    const usedTok = (o.limitTokens!=null   && o.remTokens!=null)   ? (Number(o.limitTokens)   - Number(o.remTokens))   : null;
    o.usedRequests = usedReq;
    o.usedTokens   = usedTok;

    save(o);
    render(o);
  }

  function render(state){
    const box = $('#limits-box');
    if (!box) return;
    const s = state || load();

    box.innerHTML = `
      <div style="display:grid; gap:10px">
        <div class="tips" style="padding:10px">
          <div style="display:flex;align-items:center;gap:8px;"><i class="fa-solid fa-gauge"></i><strong>Limity / Zużycie (Groq)</strong></div>
          <div class="mini" style="color:var(--muted);margin-top:6px">Odczyt z nagłówków odpowiedzi API po każdym wywołaniu.</div>
        </div>

        <div style="display:grid; gap:8px">
          <div><strong>Zapytania (okno minutowe)</strong><br>
            Limit: ${human.int(s.limitRequests)} • Użyto: ${human.int(s.usedRequests)} • Pozostało: ${human.int(s.remRequests)}<br>
            Reset okna za: ${human.reset(s.resetRequests)}
          </div>
          <div><strong>Tokeny na minutę (TPM)</strong><br>
            Limit: ${human.int(s.limitTokens)} • Użyto: ${human.int(s.usedTokens)} • Pozostało: ${human.int(s.remTokens)}<br>
            Reset okna za: ${human.reset(s.resetTokens)}
          </div>
          <div><strong>Dzienny limit zapytań</strong><br>
            Limit: ${human.int(s.limitDaily)} • Pozostało: ${human.int(s.remDaily)}<br>
            Reset dzienny: ${s.resetDaily ? s.resetDaily : '—'}
          </div>
          <div class="mini" style="color:var(--muted)">
            Ostatnia aktualizacja: ${s.updatedAt ? new Date(s.updatedAt).toLocaleString() : '—'}
          </div>
        </div>

        <div style="display:flex; gap:8px; flex-wrap:wrap">
          <button id="limits-refresh" class="icon-btn xs"><i class="fa-solid fa-rotate"></i> Odśwież</button>
          <button id="limits-clear" class="icon-btn xs"><i class="fa-regular fa-trash-can"></i> Wyczyść</button>
        </div>
      </div>
    `;

    $('#limits-refresh')?.addEventListener('click', ()=> render(load()));
    $('#limits-clear')?.addEventListener('click', ()=>{ localStorage.removeItem(DBKEY); render({}); });
  }

  function injectUI(){
    const settingsPanel = document.getElementById('settings-panel');
    const content = settingsPanel?.querySelector('.sidepanel-content');
    if (!content) return;
    const sec = document.createElement('section');
    sec.className = 'field';
    sec.innerHTML = `
      <details class="tips" open>
        <summary><i class="fa-solid fa-gauge"></i> Limity / Zużycie</summary>
        <div id="limits-box" style="display:grid; gap:10px; padding-top:10px"></div>
      </details>
    `;
    content.appendChild(sec);
    render(load());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectUI);
  } else {
    injectUI();
  }

  // Nasłuch z app.js: po każdej odpowiedzi (także 429) dostajemy nagłówki
  window.addEventListener('groq:ratelimits', (ev)=>{
    const headers = ev.detail?.headers || {};
    upsertFromHeaders(headers);
  });
})();
