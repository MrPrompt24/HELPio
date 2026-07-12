document.addEventListener('DOMContentLoaded', () => {

    const bannerSection = document.getElementById('banner-carousel');
    const dotsContainer = document.querySelector('.banner-dots');

    if (!bannerSection || typeof bannerSlides === 'undefined' || !bannerSlides.length) return;

    // 1. Inject styling for patterns if not exists
    if (!document.getElementById('banner-patterns-style')) {
        const style = document.createElement('style');
        style.id = 'banner-patterns-style';
        style.innerHTML = `
            .banner-pattern-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 0;
                opacity: 0.1; /* Subtle effect */
                transition: opacity 0.5s ease;
            }
            .pattern-grid {
                background-image: linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px);
                background-size: 30px 30px;
            }
            .pattern-dots {
                background-image: radial-gradient(#fff 1.5px, transparent 1.5px);
                background-size: 20px 20px;
            }
            .pattern-circles {
                background-image: radial-gradient(circle, #fff 2px, transparent 2.5px);
                background-size: 30px 30px;
            }
            .banner-content {
                position: relative;
                z-index: 2; /* Content above pattern */
            }
            .banner-section {
                position: relative;
                overflow: hidden; /* Ensure pattern stays inside */
            }
        `;
        document.head.appendChild(style);
    }

    // 2. Setup Pattern Container
    let patternOverlay = document.querySelector('.banner-pattern-overlay');
    if (!patternOverlay) {
        patternOverlay = document.createElement('div');
        patternOverlay.className = 'banner-pattern-overlay';
        bannerSection.prepend(patternOverlay);
    }

    // Pobierz kontener treści lub stwórz dynamiczną strukturę jeśli to konieczne
    let bannerContent = document.querySelector('.banner-content');
    if (!bannerContent) {
        bannerContent = document.createElement('div');
        bannerContent.className = 'banner-content';
        bannerSection.append(bannerContent);
    }

    // Reset styles
    bannerContent.style.opacity = '1';
    bannerContent.style.transform = 'translateY(0)';

    let currentSlide = parseInt(sessionStorage.getItem('currentBanner')) || 0;
    if (currentSlide >= bannerSlides.length) currentSlide = 0;

    let autoRotateInterval;

    // Inicjalizacja kropek
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        bannerSlides.forEach((_, i) => {
            const dot = document.createElement('span');
            dot.classList.add('banner-dot');
            if (i === currentSlide) dot.classList.add('active');
            dotsContainer.appendChild(dot);

            dot.addEventListener('click', () => {
                updateBanner(i);
                stopAutoRotate();
                setTimeout(startAutoRotate, 3000);
            });
        });
    }

    const dots = document.querySelectorAll('.banner-dot');

    function updateBanner(slideIndex) {
        currentSlide = slideIndex;
        sessionStorage.setItem('currentBanner', currentSlide);
        const slide = bannerSlides[slideIndex];

        // Animacja wyjścia
        bannerContent.style.opacity = '0';
        bannerContent.style.transform = 'translateY(10px)';
        patternOverlay.style.opacity = '0'; // Fade out pattern

        setTimeout(() => {
            // Generowanie nowej treści HTML dla banera
            bannerContent.innerHTML = `
                <h2 class="banner-title" style="margin-bottom: 0.5rem; font-size: 1.8rem;">${slide.title}</h2>
                <div class="banner-subtitle" style="font-size: 1rem; opacity: 0.95; margin-bottom: 1.5rem; font-weight: 500; letter-spacing: 0.5px;">
                    ${slide.subtitle || ''}
                </div>
                <a href="${slide.link}" target="_blank" class="banner-button" style="text-decoration: none; display: inline-block; background-color: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); backdrop-filter: blur(5px); color: #fff; padding: 0.6rem 1.2rem; border-radius: 2rem; transition: all 0.3s ease;">
                    Dowiedz się więcej &rarr;
                </a>
            `;

            // Aktualizacja tła sekcji
            bannerSection.style.background = slide.gradient;
            bannerSection.style.color = '#ffffff';

            // Aktualizacja Wzoru
            patternOverlay.className = 'banner-pattern-overlay'; // Reset class
            if (slide.pattern) {
                patternOverlay.classList.add(`pattern-${slide.pattern}`);
            }

            // Animacja wejścia
            bannerContent.style.transition = 'all 0.3s ease-out';
            bannerContent.style.opacity = '1';
            bannerContent.style.transform = 'translateY(0)';

            patternOverlay.style.transition = 'opacity 0.3s ease-out';
            patternOverlay.style.opacity = '0.15'; // Pattern visible slightly

        }, 300);

        // Aktualizacja kropek
        dots.forEach((dot, i) => dot.classList.toggle('active', i === slideIndex));
    }

    function nextSlide() {
        updateBanner((currentSlide + 1) % bannerSlides.length);
    }

    function startAutoRotate() {
        stopAutoRotate();
        autoRotateInterval = setInterval(nextSlide, 6000); // 6 sekund
    }

    function stopAutoRotate() {
        if (autoRotateInterval) clearInterval(autoRotateInterval);
    }

    document.addEventListener('visibilitychange', () => {
        document.hidden ? stopAutoRotate() : startAutoRotate();
    });

    // Uruchomienie
    updateBanner(currentSlide);
    startAutoRotate();
});
