// zabezpiecz_telefon.js
const STORAGE_KEY = 'secure_phone_progress';
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const taskItems = document.querySelectorAll('.task-item');
const resetBtn = document.getElementById('reset-progress');

// Load state
let state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

function init() {
    render();

    taskItems.forEach(item => {
        item.addEventListener('click', () => {
            const id = item.dataset.id;
            state[id] = !state[id];
            save();
            render();
        });
    });

    resetBtn.addEventListener('click', () => {
        if (confirm('Zresetować postępy?')) {
            state = {};
            save();
            render();
        }
    });
}

function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function render() {
    let completed = 0;
    const total = taskItems.length;

    taskItems.forEach(item => {
        const id = item.dataset.id;
        if (state[id]) {
            item.classList.add('completed');
            completed++;
        } else {
            item.classList.remove('completed');
        }
    });

    const percent = Math.round((completed / total) * 100);
    progressBar.style.width = `${percent}%`;
    progressText.textContent = `${percent}% Zabezpieczone`;
}

init();
