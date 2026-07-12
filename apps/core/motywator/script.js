// DOM Elements
const quoteText = document.getElementById('quoteText');
const categoryBadge = document.getElementById('categoryBadge');
const quoteCard = document.getElementById('quoteCard');
const nextBtn = document.getElementById('nextBtn');
const likeBtn = document.getElementById('likeBtn');
const viewsCountEl = document.getElementById('viewsCount');
const likesCountEl = document.getElementById('likesCount');

const settingsBtn = document.getElementById('settingsBtn');
const settingsOverlay = document.getElementById('settingsOverlay');
const closeSettings = document.getElementById('closeSettings');
const themeToggle = document.getElementById('themeToggle');
const notifyToggle = document.getElementById('notifyToggle');

const customQuoteText = document.getElementById('customQuoteText');
const customQuoteCategory = document.getElementById('customQuoteCategory');
const addQuoteBtn = document.getElementById('addQuoteBtn');

// State
let allQuotes = [];
let displayedQuote = null;

const STATE_KEY = 'motywator_state';
const QUOTES_KEY = 'motywator_custom_quotes';

let appState = {
    theme: 'light',
    notificationsEnabled: false,
    dailyStats: {
        date: new Date().toDateString(),
        views: 0,
        likes: 0
    }
};

// Initialization
async function init() {
    loadState();
    await loadQuotes();
    applyTheme();
    renderQuote();
    checkDailyReset();
    setupNotifications();
}

function loadState() {
    const saved = localStorage.getItem(STATE_KEY);
    if (saved) {
        const parsed = JSON.parse(saved);
        // Merge stats only if date matches, otherwise reset
        if (parsed.dailyStats && parsed.dailyStats.date === new Date().toDateString()) {
            appState = { ...appState, ...parsed };
        } else {
            // Keep preferences but reset stats
            appState = { 
                ...appState, 
                theme: parsed.theme || 'light',
                notificationsEnabled: parsed.notificationsEnabled || false
            };
        }
    }
    updateStatsDisplay();
}

function saveState() {
    localStorage.setItem(STATE_KEY, JSON.stringify(appState));
    updateStatsDisplay();
}

async function loadQuotes() {
    try {
        const response = await fetch('quotes.json');
        const defaultQuotes = await response.json();
        
        const customQuotes = JSON.parse(localStorage.getItem(QUOTES_KEY) || '[]');
        allQuotes = [...defaultQuotes, ...customQuotes];
    } catch (error) {
        console.error('Failed to load quotes:', error);
        // Fallback if offline/error
        allQuotes = [
            { text: "Błąd ładowania, ale damy radę!", category: "motivation" },
            { text: "Sprawdź połączenie, ale najpierw odetchnij.", category: "calm" }
        ];
    }
}

// Logic
function getRandomQuote() {
    if (allQuotes.length === 0) return { text: "...", category: "neutral" };
    const randomIndex = Math.floor(Math.random() * allQuotes.length);
    return allQuotes[randomIndex];
}

function renderQuote() {
    // Animation reset
    quoteCard.style.animation = 'none';
    quoteCard.offsetHeight; /* trigger reflow */
    quoteCard.style.animation = 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards';

    const quote = getRandomQuote();
    displayedQuote = quote;

    quoteText.textContent = quote.text;
    
    // Update Badge
    categoryBadge.className = 'quote-category-badge'; // reset
    categoryBadge.classList.add(`badge-${quote.category}`);
    
    // Map category names to PL
    const categoryMap = {
        'motivation': 'Motywacja',
        'calm': 'Spokój',
        'humor': 'Humor'
    };
    categoryBadge.textContent = categoryMap[quote.category] || quote.category;

    // Reset Like button state
    likeBtn.classList.remove('liked');
    likeBtn.querySelector('i').className = 'fa-regular fa-thumbs-up';

    // Update Stats
    appState.dailyStats.views++;
    saveState();
}

function handleLike() {
    if (likeBtn.classList.contains('liked')) return; // prevent double like

    likeBtn.classList.add('liked');
    likeBtn.classList.add('animate-pulse');
    likeBtn.querySelector('i').className = 'fa-solid fa-thumbs-up';
    
    setTimeout(() => likeBtn.classList.remove('animate-pulse'), 300);

    // Provide micro-feedback (vibration if supported)
    if (navigator.vibrate) navigator.vibrate(50);

    // Update Stats
    appState.dailyStats.likes++;
    saveState();
}

function updateStatsDisplay() {
    viewsCountEl.textContent = appState.dailyStats.views;
    likesCountEl.textContent = appState.dailyStats.likes;
}

function checkDailyReset() {
    if (appState.dailyStats.date !== new Date().toDateString()) {
        appState.dailyStats = {
            date: new Date().toDateString(),
            views: 0,
            likes: 0
        };
        saveState();
    }
}

// Settings & Customization
function toggleTheme() {
    appState.theme = appState.theme === 'light' ? 'dark' : 'light';
    applyTheme();
    saveState();
}

function applyTheme() {
    document.documentElement.setAttribute('data-theme', appState.theme);
    const icon = themeToggle.querySelector('i');
    icon.className = appState.theme === 'light' ? 'fa-regular fa-moon' : 'fa-regular fa-sun';
}

function addCustomQuote() {
    const text = customQuoteText.value.trim();
    if (!text) return;

    const category = customQuoteCategory.value;
    const newQuote = { id: Date.now(), text, category };

    const customQuotes = JSON.parse(localStorage.getItem(QUOTES_KEY) || '[]');
    customQuotes.push(newQuote);
    localStorage.setItem(QUOTES_KEY, JSON.stringify(customQuotes));

    // Update local list
    allQuotes.push(newQuote);

    // Clear input and close modal
    customQuoteText.value = '';
    alert('Dodano nowy komunikat!');
}

// Notifications
function setupNotifications() {
     updateNotifyIcon();
}

function toggleNotifications() {
    if (!('Notification' in window)) {
        alert("Twoja przeglądarka nie obsługuje powiadomień.");
        return;
    }

    if (Notification.permission === "granted") {
        // If already granted, we treat this toggle as an enable/disable switch in logic
       appState.notificationsEnabled = !appState.notificationsEnabled;
       saveState();
       updateNotifyIcon();
       if(appState.notificationsEnabled) scheduleNotification();

    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
                appState.notificationsEnabled = true;
                saveState();
                updateNotifyIcon();
                scheduleNotification();
            }
        });
    } else {
        alert("Powiadomienia są zablokowane w ustawieniach przeglądarki.");
    }
}

function updateNotifyIcon() {
     const icon = notifyToggle.querySelector('i');
     icon.className = appState.notificationsEnabled ? 'fa-solid fa-bell' : 'fa-regular fa-bell slash';
}

function scheduleNotification() {
    // Simple logic: If enabled, try to send one after a set time (demo purpose: 10 seconds for testing, then longer)
    // Real app would use Service Workers or more complex alarms which are limited in standard web page without PWA install
    if(!appState.notificationsEnabled) return;

    console.log("Scheduling notification...");
    setTimeout(() => {
        if(appState.notificationsEnabled && document.hidden) {
             new Notification("Motywator", {
                body: "Hej! Czas na chwilę dla Ciebie. Zobacz nowy komunikat.",
                icon: "favicon.ico" // You might want to add an icon later
            });
        }
        // Reschedule
        scheduleNotification();
    }, 10800000); // Every 3 hours (3 * 60 * 60 * 1000)
}


// Event Listeners
nextBtn.addEventListener('click', renderQuote);
likeBtn.addEventListener('click', handleLike);

settingsBtn.addEventListener('click', () => {
    settingsOverlay.classList.add('active');
});

closeSettings.addEventListener('click', () => {
    settingsOverlay.classList.remove('active');
});

settingsOverlay.addEventListener('click', (e) => {
    if (e.target === settingsOverlay) {
        settingsOverlay.classList.remove('active');
    }
});

themeToggle.addEventListener('click', toggleTheme);
addQuoteBtn.addEventListener('click', addCustomQuote);
notifyToggle.addEventListener('click', toggleNotifications);

// Start
init();
