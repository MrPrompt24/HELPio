// breathing.js

const container = document.querySelector('.breathing-circle-container');
const instructionText = document.querySelector('.breathing-instruction');
const timerDisplay = document.querySelector('.breathing-timer');
const startBtn = document.getElementById('start-btn');
const techniqueSelect = document.getElementById('technique-select');

let isRunning = false;
let timeoutId = null;
let timerInterval = null;

const techniques = {
    '4-7-8': {
        name: 'Relaksacja (4-7-8)',
        steps: [
            { text: 'Wdech', duration: 4000, action: 'inhale' },
            { text: 'Trzymaj', duration: 7000, action: 'hold' },
            { text: 'Wydech', duration: 8000, action: 'exhale' }
        ]
    },
    'box': {
        name: 'Pudełkowe (4-4-4-4)',
        steps: [
            { text: 'Wdech', duration: 4000, action: 'inhale' },
            { text: 'Trzymaj', duration: 4000, action: 'hold' },
            { text: 'Wydech', duration: 4000, action: 'exhale' },
            { text: 'Trzymaj', duration: 4000, action: 'hold' }
        ]
    },
    'calm': {
        name: 'Spokój (5-5)',
        steps: [
            { text: 'Wdech', duration: 5000, action: 'inhale' },
            { text: 'Wydech', duration: 5000, action: 'exhale' }
        ]
    }
};

startBtn.addEventListener('click', toggleBreathing);

function toggleBreathing() {
    if (isRunning) {
        stopBreathing();
    } else {
        startBreathing();
    }
}

function startBreathing() {
    const techniqueKey = techniqueSelect.value;
    if (!techniques[techniqueKey]) return;

    isRunning = true;
    startBtn.textContent = 'Stop';
    startBtn.classList.add('active');
    techniqueSelect.disabled = true;

    runCycle(techniques[techniqueKey].steps, 0);
}

function stopBreathing() {
    isRunning = false;
    startBtn.textContent = 'Start';
    startBtn.classList.remove('active');
    techniqueSelect.disabled = false;

    clearTimeout(timeoutId);
    clearInterval(timerInterval);

    // Reset visual state
    container.classList.remove('inhale', 'hold', 'exhale');
    container.style.removeProperty('--duration');

    instructionText.textContent = 'Gotowy?';
    timerDisplay.textContent = '';
}

function runCycle(steps, stepIndex) {
    if (!isRunning) return;

    const step = steps[stepIndex % steps.length];

    instructionText.textContent = step.text;

    // Set animation duration variable
    container.style.setProperty('--duration', `${step.duration}ms`);

    // Reset animation by removing all classes first
    container.classList.remove('inhale', 'hold', 'exhale');

    // Trigger reflow to restart animation
    void container.offsetWidth;

    // Add current action class (inhale/hold/exhale)
    // Note: The previous logic mapped keys like 'grow' -> 'inhale'. 
    // I updated the techniques object above to use 'inhale', 'hold', 'exhale' directly matching CSS classes.
    // If we want to support 'grow'/'shrink' keys from old config, we could map them, but I updated the object.

    // Map old keys if they persist, or use new ones
    let actionClass = step.action;
    if (actionClass === 'grow') actionClass = 'inhale';
    if (actionClass === 'shrink') actionClass = 'exhale';

    container.classList.add(actionClass);

    // Timer Logic
    let remainingSeconds = Math.ceil(step.duration / 1000);
    timerDisplay.textContent = remainingSeconds;

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        remainingSeconds--;
        if (remainingSeconds > 0) {
            timerDisplay.textContent = remainingSeconds;
        } else {
            timerDisplay.textContent = ''; // Clear at end or keep 0?
        }
    }, 1000);

    timeoutId = setTimeout(() => {
        if (isRunning) {
            runCycle(steps, stepIndex + 1);
        }
    }, step.duration);
}

// Initial state
instructionText.textContent = 'Gotowy?';
