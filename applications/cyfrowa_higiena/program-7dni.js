// program-7dni.js
const days = [
    { title: "Dzień 1: Czysty start", desc: "Usuń 3 nieużywane aplikacje i wyłącz wszystkie powiadomienia (poza telefonem)." },
    { title: "Dzień 2: Sypialnia bez ekranu", desc: "Zostaw telefon w innym pokoju na noc. Kup tradycyjny budzik." },
    { title: "Dzień 3: Analogowy posiłek", desc: "Zjedz wszystkie posiłki bez patrzenia w telefon lub TV." },
    { title: "Dzień 4: Jedno zadanie", desc: "Pracuj/czuj się bez multitaskingu. Jedno okno przeglądarki na raz." },
    { title: "Dzień 5: Spacer offline", desc: "Idź na 30-minutowy spacer bez telefonu (lub w trybie samolotowym)." },
    { title: "Dzień 6: Społeczny detoks", desc: "Nie wchodź na social media przez całe 24 godziny." },
    { title: "Dzień 7: Godzina ciszy", desc: "Wyłącz wszystko na pełną godzinę przed snem. Czytaj książkę." }
];

const listContainer = document.getElementById('days-list');
const progressText = document.getElementById('progress-text');
const progressFill = document.getElementById('progress-fill');

let progress = JSON.parse(localStorage.getItem('detox_progress')) || new Array(7).fill(false);

function render() {
    listContainer.innerHTML = '';
    let completedCount = 0;

    days.forEach((day, index) => {
        const isDone = progress[index];
        if (isDone) completedCount++;

        const card = document.createElement('div');
        card.className = `day-card ${isDone ? 'completed' : ''}`;

        card.innerHTML = `
            <div class="day-number">${index + 1}</div>
            <div class="day-content">
                <div class="day-title">${day.title}</div>
                <div class="day-desc">${day.desc}</div>
            </div>
            <button class="check-btn" onclick="toggleDay(${index})">
                <i class="fas fa-check"></i>
            </button>
        `;
        listContainer.appendChild(card);
    });

    // Update progress bar
    const percentage = Math.round((completedCount / 7) * 100);
    progressText.textContent = `${percentage}% Ukończono`;
    progressFill.style.width = `${percentage}%`;
}

window.toggleDay = function (index) {
    progress[index] = !progress[index];
    localStorage.setItem('detox_progress', JSON.stringify(progress));
    render();
};

render();
