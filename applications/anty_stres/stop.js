// stop.js
const stopBtn = document.querySelector('.stop-btn');
const messageEl = document.querySelector('.stop-message');

const sequence = [
    { text: "STOP!", btnText: "STOP", color: "#ef4444" },
    { text: "Zatrzymaj się.\nNie rób nic przez chwilę.", btnText: "Zatrzymaj", color: "#f59e0b" },
    { text: "Weź głęboki wdech...\ni wydech...", btnText: "Oddychaj", color: "#10b981" },
    { text: "Rozejrzyj się.\nCo widzisz? Co słyszysz?", btnText: "Obserwuj", color: "#3b82f6" },
    { text: "Poczuj swoje stopy na ziemi.\nJesteś tutaj.", btnText: "Poczuj", color: "#6366f1" },
    { text: "Wróć do swoich zadań\nz nowym spokojem.", btnText: "Kontynuuj", color: "#8b5cf6" }
];

let stepIndex = 0;
let isStarted = false;

stopBtn.addEventListener('click', nextStep);

function nextStep() {
    if (!isStarted) {
        isStarted = true;
        stepIndex = 1; // Jump simply to next step after initial click
        stopBtn.classList.add('active');
    } else {
        stepIndex++;
    }

    if (stepIndex >= sequence.length) {
        // Reset
        stepIndex = 0;
        isStarted = false;
        stopBtn.classList.remove('active');
        messageEl.classList.remove('visible');
        updateUI(sequence[0]);
    } else {
        updateUI(sequence[stepIndex]);
        messageEl.classList.add('visible');
    }
}

function updateUI(step) {
    stopBtn.style.backgroundColor = step.color;
    stopBtn.style.boxShadow = `0 10px 25px ${step.color}80`; // Adding alpha
    stopBtn.innerHTML = `<span>${step.btnText}</span>`;
    messageEl.innerText = step.text;
}
