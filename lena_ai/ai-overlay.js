(function () {
  // === Auto-dołączenie stylu z folderu lena_ai ===
  const CSS_HREF = 'lena_ai/ai-overlay.css';
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = CSS_HREF;
  document.head.appendChild(link);

  // === Tworzymy overlay “na żądanie” ===
  let overlay, iframe;

  function ensureOverlay() {
    if (overlay) return overlay;

    overlay = document.createElement('div');
    overlay.id = 'helpio-ai-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = `
      <div class="ai-head">
        <div class="ai-title">Chat AI (Lena)</div>
        <div class="ai-spacer"></div>
        <button class="ai-close" type="button" aria-label="Zamknij">✕</button>
      </div>
      <div class="ai-body">
        <iframe class="ai-frame" title="Helpio Chat AI" loading="lazy" referrerpolicy="no-referrer" allow="clipboard-read; clipboard-write" src="about:blank"></iframe>
      </div>
    `;
    document.body.appendChild(overlay);

    iframe = overlay.querySelector('.ai-frame');
    overlay.querySelector('.ai-close').addEventListener('click', closeOverlay);

    // zamknięcie na ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeOverlay();
    });

    // klik w tło — zamknij (ale nie klik w zawartość)
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeOverlay();
    });

    // Sygnał z wnętrza chat-a (opcjonalnie możesz wysłać postMessage z lena_ai/index.html)
    window.addEventListener('message', (e) => {
      if (typeof e.data === 'string' && e.data === 'HELPIO_AI_CLOSE') {
        closeOverlay();
      }
    });

    return overlay;
  }

  function openOverlay() {
    ensureOverlay();
    // ładujemy dopiero przy pierwszym otwarciu
    if (iframe && iframe.src === 'about:blank') {
      // pełna ścieżka do Twojej aplikacji AI
      iframe.src = 'lena_ai/index.html';
    }
    document.documentElement.classList.add('helpio-ai-lock');
    document.body.classList.add('helpio-ai-lock');
    requestAnimationFrame(() => overlay.classList.add('open'));
  }

  function closeOverlay() {
    if (!overlay) return;
    overlay.classList.remove('open');
    document.documentElement.classList.remove('helpio-ai-lock');
    document.body.classList.remove('helpio-ai-lock');
  }

  // === Podpięcie pod istniejącą ikonkę “Chat AI” ===
  // Minimalna ingerencja: przechwytujemy klik w <a class="header-icon" href="index.php?page=chat"><div>Chat AI</div></a>
  function isChatAiAnchor(a) {
    if (!(a && a.tagName === 'A')) return false;
    const hrefOk = (a.getAttribute('href') || '').includes('index.php?page=chat');
    const text = (a.textContent || '').toLowerCase();
    const textOk = text.includes('chat ai') || text.includes('lena');
    return hrefOk || textOk;
  }

  // Delegacja zdarzeń — działa nawet jeśli DOM się przebuduje
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (isChatAiAnchor(a)) {
      e.preventDefault();
      e.stopPropagation();
      openOverlay();
    }
  });

  // Opcjonalnie: API globalne (gdybyś chciał otwierać z innych miejsc)
  window.HelpioAIOverlay = { open: openOverlay, close: closeOverlay };
})();