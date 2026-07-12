// digital-silence.js
const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('start-silence');
const container = document.querySelector('.silence-container');

let duration = 5 * 60; // 5 minutes default
let timeLeft = duration;
let timerId = null;
let isRunning = false;

startBtn.addEventListener('click', toggleSilence);
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isRunning) {
        stopSilence();
    }
});

function toggleSilence() {
    if (isRunning) {
        stopSilence();
    } else {
        startSilence();
    }
}

function startSilence() {
    isRunning = true;
    startBtn.textContent = 'Przerwij';
    startBtn.classList.add('active');

    // Enter immersive mode
    container.classList.add('focus-mode');
    document.body.style.overflow = 'hidden';



    timerId = setInterval(tick, 1000);
}

function stopSilence() {
    isRunning = false;
    startBtn.textContent = 'Start (5 min)';
    startBtn.classList.remove('active');

    container.classList.remove('focus-mode');
    document.body.style.overflow = '';



    clearInterval(timerId);
    timeLeft = duration;
    updateDisplay();
}

function tick() {
    timeLeft--;
    updateDisplay();

    if (timeLeft <= 0) {
        stopSilence();
        // Maybe play a gentle chime
    }
}

function updateDisplay() {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${m}:${s}`;
}
