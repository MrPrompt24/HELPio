// hygge.js
const rules = [
    "Przez pierwszą godzinę dnia telefon pozostaje w trybie samolotowym.",
    "Jeden dzień w tygodniu w pełni offline.",
    "Podczas spotkań z przyjaciółmi telefon zostaje w kieszeni.",
    "Wyłącz wszystkie powiadomienia, które nie pochodzą od ludzi.",
    "Zastąp scrollowanie czytaniem książki w komunikacji miejskiej.",
    "Nie używaj telefonu w sypialni.",
    "Usuń aplikacje społecznościowe z telefonu – sprawdzaj je tylko na komputerze.",
    "Ustal strefy bez telefonu w domu (np. stół jadalny, łazienka).",
    "Gdy pracujesz, telefon leży poza zasięgiem wzroku.",
    "Zastąp budzik w telefonie tradycyjnym zegarkiem.",
    "Zanim odblokujesz ekran, weź trzy głębokie oddechy."
];

const quoteEl = document.getElementById('hygge-quote');
const drawBtn = document.getElementById('draw-btn');
const favBtn = document.getElementById('fav-btn');
const favList = document.getElementById('fav-list');

let currentRule = "";
let favorites = JSON.parse(localStorage.getItem('hygge_favorites')) || [];

function drawRule() {
    const randomIndex = Math.floor(Math.random() * rules.length);
    currentRule = rules[randomIndex];

    // Animate
    quoteEl.style.opacity = 0;
    setTimeout(() => {
        quoteEl.textContent = currentRule;
        quoteEl.style.opacity = 1;
    }, 200);
}

function addToFavorites() {
    if (!favorites.includes(currentRule)) {
        favorites.push(currentRule);
        updateStorage();
        renderFavorites();
    }
}

function removeFavorite(index) {
    favorites.splice(index, 1);
    updateStorage();
    renderFavorites();
}

function updateStorage() {
    localStorage.setItem('hygge_favorites', JSON.stringify(favorites));
}

function renderFavorites() {
    favList.innerHTML = '';
    if (favorites.length === 0) {
        favList.innerHTML = '<li style="color: #9ca3af; padding: 1rem; text-align: center;">Brak ulubionych zasad</li>';
        return;
    }

    favorites.forEach((rule, index) => {
        const li = document.createElement('li');
        li.className = 'fav-item';
        li.innerHTML = `
            <span>${rule}</span>
            <i class="fas fa-trash fav-remove" onclick="removeFavorite(${index})"></i>
        `;
        favList.appendChild(li);
    });
}

drawBtn.addEventListener('click', drawRule);
favBtn.addEventListener('click', addToFavorites);

// Init
drawRule();
renderFavorites();
