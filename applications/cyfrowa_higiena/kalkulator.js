/* kalkulator.js */
const form = document.getElementById('calc-form');
const resultBox = document.getElementById('result-box');
const scoreCircle = document.getElementById('score-circle');
const scoreLabel = document.getElementById('score-label');
const scoreDesc = document.getElementById('score-desc');

// Range slider outputs
document.querySelectorAll('input[type="range"]').forEach(input => {
    const valSpan = document.getElementById(input.id + '-val');
    input.addEventListener('input', () => {
        valSpan.textContent = input.value;
    });
});

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const screenTime = parseFloat(document.getElementById('screen-time').value) || 0; // Hours
    const notifications = parseInt(document.getElementById('notifications').value) || 0; // Count
    const anxiety = parseInt(document.getElementById('anxiety').value) || 0; // 0-10
    const sleep = parseInt(document.getElementById('sleep').value) || 0; // 0-10 (quality)

    // Calculation Logic (Normalized to approx 0-100)
    // 1. Screen Time: >8h is bad (max 40 pts)
    let scoreTime = Math.min(40, (screenTime / 8) * 40);

    // 2. Notifications: >50 is distracting (max 20 pts)
    let scoreNotif = Math.min(20, (notifications / 50) * 20);

    // 3. Anxiety: 10 is high (max 25 pts)
    let scoreAnxiety = (anxiety / 10) * 25;

    // 4. Sleep Quality: 0 is bad (max 15 pts inverted)
    // If sleep is 10 (good), add 0 overload. If sleep is 0 (bad), add 15 overload.
    let scoreSleep = ((10 - sleep) / 10) * 15;

    let totalScore = Math.round(scoreTime + scoreNotif + scoreAnxiety + scoreSleep);
    totalScore = Math.min(100, Math.max(0, totalScore));

    displayResult(totalScore);
});

function displayResult(score) {
    resultBox.classList.add('visible');
    scoreCircle.textContent = score;

    let color, label, desc;

    if (score < 30) {
        color = '#10b981'; // Green
        label = "Niskie Przeciążenie";
        desc = "Twoja cyfrowa higiena jest na wysokim poziomie. Tak trzymaj!";
    } else if (score < 60) {
        color = '#f59e0b'; // Orange
        label = "Umiarkowane Przeciążenie";
        desc = "Odczuwasz wpływ technologii. Spróbuj ograniczyć czas ekranowy wieczorem.";
    } else {
        color = '#ef4444'; // Red
        label = "Wysokie Przeciążenie";
        desc = "Technologia mocno Cię obciąża. Rozważ natychmiastowy cyfrowy detoks.";
    }

    scoreCircle.style.borderColor = color;
    scoreCircle.style.color = color;
    scoreCircle.style.background = color + '15'; // 10% opacity
    scoreLabel.textContent = label;
    scoreLabel.style.color = color;
    scoreDesc.textContent = desc;

    // Scroll to result
    resultBox.scrollIntoView({ behavior: 'smooth' });
}
