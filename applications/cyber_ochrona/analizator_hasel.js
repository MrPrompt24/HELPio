// analizator_hasel.js
const passwordInput = document.getElementById('password-input');
const toggleBtn = document.getElementById('toggle-visibility');
const resultCard = document.getElementById('result-card');
const scoreFill = document.getElementById('score-fill');
const verdictText = document.getElementById('verdict-text');
const checksList = document.getElementById('checks-list');

toggleBtn.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    toggleBtn.querySelector('i').className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
});

passwordInput.addEventListener('input', analyzePassword);

function analyzePassword() {
    const pwd = passwordInput.value;

    if (pwd.length === 0) {
        resultCard.classList.remove('visible');
        return;
    }

    resultCard.classList.add('visible');

    let score = 0;
    const checks = [];

    // Length Check
    if (pwd.length >= 12) {
        score += 25;
        checks.push({ type: 'pass', text: 'Dobra długość (12+ znaków)' });
    } else if (pwd.length >= 8) {
        score += 10;
        checks.push({ type: 'warn', text: 'Średnia długość (8-11 znaków)' });
    } else {
        checks.push({ type: 'fail', text: 'Hasło jest za krótkie (<8 znaków)' });
    }

    // Complexity
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSymbol = /[^A-Za-z0-9]/.test(pwd);

    let varietyCount = 0;
    if (hasUpper) varietyCount++;
    if (hasLower) varietyCount++;
    if (hasNumber) varietyCount++;
    if (hasSymbol) varietyCount++;

    if (varietyCount >= 4) {
        score += 25;
        checks.push({ type: 'pass', text: 'Znakomita różnorodność znaków' });
    } else if (varietyCount >= 3) {
        score += 15;
        checks.push({ type: 'pass', text: 'Dobra różnorodność znaków' });
    } else {
        checks.push({ type: 'warn', text: 'Użyj więcej typów znaków (duże, małe, cyfry, symbole)' });
    }

    // Patterns (Negative checks)
    if (/^[0-9]+$/.test(pwd)) {
        score -= 20;
        checks.push({ type: 'fail', text: 'S same cyfry – bardzo łatwe do złamania' });
    }
    if (/^[a-zA-Z]+$/.test(pwd)) {
        score -= 10;
        checks.push({ type: 'warn', text: 'Brak cyfr lub symboli' });
    }
    if (/(.)\1{2,}/.test(pwd)) {
        score -= 10;
        checks.push({ type: 'fail', text: 'Powtarzające się znaki (np. aaa)' });
    }
    const sequences = ['123', 'abc', 'qwerty', 'admin', 'password', 'haslo']; // Simple common parts
    let foundSeq = false;
    sequences.forEach(seq => {
        if (pwd.toLowerCase().includes(seq)) foundSeq = true;
    });
    if (foundSeq) {
        score -= 20;
        checks.push({ type: 'fail', text: 'Zawiera popularne sekwencje lub słowa' });
    }

    // Cap score 0-100
    score = Math.max(0, Math.min(100, score));

    // Update UI
    scoreFill.style.width = `${score}%`;

    let color = '#ef4444';
    let label = 'Bardzo Słabe';

    if (score > 20) { color = '#f97316'; label = 'Słabe'; }
    if (score > 40) { color = '#eab308'; label = 'Średnie'; }
    if (score > 60) { color = '#84cc16'; label = 'Dobre'; }
    if (score > 80) { color = '#10b981'; label = 'Silne'; }
    if (score > 90) { color = '#059669'; label = 'Bardzo Silne'; }

    scoreFill.style.backgroundColor = color;
    verdictText.textContent = label;
    verdictText.style.color = color;

    // Render checks
    checksList.innerHTML = checks.map(c => `
        <li class="check-item ${c.type}">
            <i class="fas ${getIcon(c.type)}"></i>
            <span>${c.text}</span>
        </li>
    `).join('');
}

function getIcon(type) {
    if (type === 'pass') return 'fa-check';
    if (type === 'fail') return 'fa-times';
    return 'fa-exclamation-triangle';
}
