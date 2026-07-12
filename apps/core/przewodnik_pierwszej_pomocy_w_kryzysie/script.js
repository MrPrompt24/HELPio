const appData = {
    emotional: {
        title: "Kryzys Emocjonalny",
        color: "emotional",
        items: [
            {
                id: "emo_breathe",
                title: "Technika Oddechowa 4-7-8",
                icon: "fa-lungs",
                description: "Szybka redukcja stresu poprzez regulację oddechu.",
                steps: [
                    { type: "info", text: "Usiądź wygodnie lub połóż się." },
                    { type: "step", text: "Wdychaj powietrze nosem przez 4 sekundy." },
                    { type: "step", text: "Zatrzymaj oddech na 7 sekund." },
                    { type: "step", text: "Wydychaj powietrze ustami przez 8 sekund (z dźwiękiem świstu)." },
                    { type: "info", text: "Powtórz cykl 4 razy." }
                ]
            },
            {
                id: "emo_ground",
                title: "Uziemienie 5-4-3-2-1",
                icon: "fa-anchor",
                description: "Technika pomagająca wrócić do rzeczywistości w ataku paniki.",
                steps: [
                    { type: "step", text: "Znajdź 5 rzeczy, które widzisz." },
                    { type: "step", text: "Znajdź 4 rzeczy, które możesz dotknąć." },
                    { type: "step", text: "Znajdź 3 rzeczy, które słyszysz." },
                    { type: "step", text: "Znajdź 2 rzeczy, które czujesz (węch)." },
                    { type: "step", text: "Znajdź 1 dobrą rzecz o sobie." }
                ]
            }
        ]
    },
    online: {
        title: "Zagrożenia Online",
        color: "online",
        items: [
            {
                id: "net_sext",
                title: "Sextortion (Szantaż)",
                icon: "fa-user-lock",
                description: "Co robić, gdy ktoś grozi ujawnieniem Twoich intymnych zdjęć.",
                steps: [
                    { type: "urgent", text: "NIE PŁAĆ! Płacenie nie kończy szantażu." },
                    { type: "step", text: "Zrób zrzuty ekranu wszystkich rozmów i profilu szantażysty." },
                    { type: "step", text: "Zablokuj sprawcę we wszystkich mediach społecznościowych." },
                    { type: "step", text: "Zgłoś profil do administracji serwisu." },
                    { type: "step", text: "Zgłoś sprawę na policję lub do dyzurnet.pl." }
                ],
                actions: [
                    { label: "Zgłoś (Dyżurnet.pl)", url: "https://dyzurnet.pl/zglos-nielegalne-tresci", urgent: true }
                ]
            },
            {
                id: "net_hack",
                title: "Włam na konto",
                icon: "fa-key",
                description: "Procedura odzyskiwania bezpieczeństwa konta.",
                steps: [
                    { type: "step", text: "Spróbuj zmienić hasło natychmiast." },
                    { type: "step", text: "Wyloguj się ze wszystkich sesji (w ustawieniach bezpieczeństwa)." },
                    { type: "step", text: "Włącz weryfikację dwuetapową (2FA)." },
                    { type: "step", text: "Sprawdź, czy nie wysłano dziwnych wiadomości do znajomych." }
                ]
            }
        ]
    },
    emergency: {
        title: "Sytuacje Awaryjne",
        color: "emergency",
        items: [
            {
                id: "em_numbers",
                title: "Ważne telefony",
                icon: "fa-phone-alt",
                description: "Lista numerów alarmowych i pomocowych.",
                steps: [
                    { type: "urgent", text: "112 - Numer alarmowy (zagrożenie życia)" },
                    { type: "step", text: "116 111 - Telefon Zaufania dla Dzieci i Młodzieży" },
                    { type: "step", text: "116 123 - Kryzysowy Telefon Zaufania dla Dorosłych" },
                    { type: "step", text: "800 12 12 12 - Rzecznik Praw Dziecka" }
                ],
                actions: [
                    { label: "Zadzwoń na 112", url: "tel:112", urgent: true }
                ]
            }
        ]
    }
};

// State
let currentView = 'home'; // home, list, detail
let pins = JSON.parse(localStorage.getItem('crisisGuidePins')) || [];

// Elements
const mainMenu = document.getElementById('main-menu');
const detailView = document.getElementById('detail-view');
const backBtn = document.getElementById('back-btn');
const headerTitle = document.querySelector('.main-header h1');
const pinnedSection = document.getElementById('pinned-section');
const pinnedContainer = document.getElementById('pinned-container');

// Init
document.addEventListener('DOMContentLoaded', () => {
    initCategoryListeners();
    renderPins();
    
    // Check offline status
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    backBtn.addEventListener('click', handleBack);
});

function updateOnlineStatus() {
    const status = document.getElementById('offline-status');
    if (!navigator.onLine) {
        status.textContent = "Jesteś offline. Aplikacja działa z zapisanymi danymi.";
        status.classList.remove('hidden');
    } else {
        status.classList.add('hidden');
    }
}

function initCategoryListeners() {
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const categoryKey = card.dataset.category;
            showCategoryList(categoryKey);
        });
    });
}

function showCategoryList(categoryKey) {
    const category = appData[categoryKey];
    if (!category) return;

    const listHtml = `
        <div class="procedure-header">
            <h2 style="color: var(--${category.color}-color)">${category.title}</h2>
        </div>
        <ul class="module-list">
            ${category.items.map(item => `
                <li class="module-item" onclick="showDetail('${categoryKey}', '${item.id}')">
                    <span class="title"><i class="fas ${item.icon}" style="margin-right:10px; color: #555;"></i> ${item.title}</span>
                    <i class="fas fa-chevron-right" style="color: #ccc;"></i>
                </li>
            `).join('')}
        </ul>
    `;

    renderView(listHtml, category.title);
    currentView = 'list';
}

function showDetail(categoryKey, itemId) {
    const category = appData[categoryKey];
    const item = category.items.find(i => i.id === itemId);
    if (!item) return;

    const isPinned = pins.includes(itemId);

    const stepsHtml = item.steps.map((step, index) => {
        let className = 'step-card';
        if (step.type === 'urgent') className += ' action';
        
        return `
            <div class="${className}">
                ${step.type !== 'info' ? `<span class="step-number">Krok ${index + 1}</span>` : ''}
                <p>${step.text}</p>
            </div>
        `;
    }).join('');

    const actionsHtml = item.actions ? `
        <div class="quick-actions">
            ${item.actions.map(action => `
                <a href="${action.url}" class="action-btn ${action.urgent ? 'urgent' : ''}" target="_blank">${action.label}</a>
            `).join('')}
        </div>
    ` : '';

    const detailHtml = `
        <div class="procedure-content">
            <div class="procedure-header">
                <button class="pin-btn ${isPinned ? 'pinned' : ''}" onclick="togglePin('${itemId}', this)">
                    <i class="fas fa-thumbtack"></i> ${isPinned ? 'Odpięcie' : 'Przypnij do startu'}
                </button>
                <h2 class="procedure-title">${item.title}</h2>
                <p>${item.description}</p>
            </div>
            <div class="steps-container">
                ${stepsHtml}
            </div>
            ${actionsHtml}
        </div>
    `;

    renderView(detailHtml, item.title);
    currentView = 'detail';
}

function renderView(html, title) {
    mainMenu.classList.add('hidden');
    pinnedSection.classList.add('hidden');
    detailView.classList.remove('hidden');
    detailView.innerHTML = html;
    
    headerTitle.textContent = title;
    backBtn.classList.remove('hidden');
    
    // Scroll to top
    window.scrollTo(0, 0);
}

function handleBack() {
    if (currentView === 'detail') {
        // Find which category we were in to go back to list, or just go home for simplicity in V1
        // We can check the DOM or store history. For now, simple back to home is safest UX MVP.
        goHome();
    } else {
        goHome();
    }
}

function goHome() {
    mainMenu.classList.remove('hidden');
    pinnedSection.classList.remove('hidden');
    detailView.classList.add('hidden');
    backBtn.classList.add('hidden');
    headerTitle.textContent = "Przewodnik Kryzysowy";
    currentView = 'home';
    renderPins(); // Refresh pins incase changed
}

window.togglePin = function(id, btnElement) {
    // Find item to get details if needed, or just store ID
    const index = pins.indexOf(id);
    if (index === -1) {
        pins.push(id);
        btnElement.classList.add('pinned');
        btnElement.innerHTML = '<i class="fas fa-thumbtack"></i> Odpięcie';
    } else {
        pins.splice(index, 1);
        btnElement.classList.remove('pinned');
        btnElement.innerHTML = '<i class="fas fa-thumbtack"></i> Przypnij do startu';
    }
    localStorage.setItem('crisisGuidePins', JSON.stringify(pins));
};

function renderPins() {
    if (pins.length === 0) {
        pinnedSection.classList.add('hidden');
        return;
    }

    pinnedSection.classList.remove('hidden');
    pinnedContainer.innerHTML = '';

    // Need to find items by ID across all categories
    pins.forEach(pinId => {
        let foundItem = null;
        let foundCategory = null;

        Object.keys(appData).forEach(catKey => {
            const item = appData[catKey].items.find(i => i.id === pinId);
            if (item) {
                foundItem = item;
                foundCategory = catKey;
            }
        });

        if (foundItem) {
            const pinCard = document.createElement('div');
            pinCard.className = 'card';
            pinCard.style.padding = '15px';
            pinCard.style.display = 'flex';
            pinCard.style.flexDirection = 'row';
            pinCard.style.alignItems = 'center';
            pinCard.style.textAlign = 'left';
            pinCard.onclick = () => showDetail(foundCategory, foundItem.id);

            pinCard.innerHTML = `
                <div class="icon-wrapper ${appData[foundCategory].color}" style="width: 40px; height: 40px; font-size: 1.2rem; margin-bottom: 0; margin-right: 15px;">
                    <i class="fas ${foundItem.icon}"></i>
                </div>
                <div>
                    <h3 style="font-size: 1rem; margin:0;">${foundItem.title}</h3>
                </div>
            `;
            pinnedContainer.appendChild(pinCard);
        }
    });
}
