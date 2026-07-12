// generator_hasel.js
const lengthSlider = document.getElementById('length');
const lengthValue = document.getElementById('length-val');
const passwordOutput = document.getElementById('password-output');
const generateBtn = document.getElementById('generate-btn');
const copyBtn = document.getElementById('copy-btn');
const strengthText = document.getElementById('strength-text');

const chars = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-='
};

lengthSlider.addEventListener('input', () => {
    lengthValue.textContent = lengthSlider.value;
    generatePassword();
});

generateBtn.addEventListener('click', generatePassword);

copyBtn.addEventListener('click', () => {
    if (!passwordOutput.value) return;
    navigator.clipboard.writeText(passwordOutput.value);

    const icon = copyBtn.querySelector('i');
    icon.className = 'fas fa-check';
    setTimeout(() => icon.className = 'fas fa-copy', 1500);
});

function generatePassword() {
    const length = +lengthSlider.value;
    const hasUpper = document.getElementById('uppercase').checked;
    const hasLower = document.getElementById('lowercase').checked;
    const hasNumber = document.getElementById('numbers').checked;
    const hasSymbol = document.getElementById('symbols').checked;

    let allowedChars = '';
    if (hasUpper) allowedChars += chars.uppercase;
    if (hasLower) allowedChars += chars.lowercase;
    if (hasNumber) allowedChars += chars.numbers;
    if (hasSymbol) allowedChars += chars.symbols;

    if (allowedChars === '') {
        passwordOutput.value = '';
        strengthText.textContent = 'Wybierz przynajmniej jeden typ znaków.';
        return;
    }

    let password = '';

    // Ensure at least one of each selected type is included
    if (hasUpper) password += getRandomChar(chars.uppercase);
    if (hasLower) password += getRandomChar(chars.lowercase);
    if (hasNumber) password += getRandomChar(chars.numbers);
    if (hasSymbol) password += getRandomChar(chars.symbols);

    // Fill the rest
    for (let i = password.length; i < length; i++) {
        password += getRandomChar(allowedChars);
    }

    // Shuffle
    password = password.split('').sort(() => 0.5 - Math.random()).join('');

    passwordOutput.value = password;
    calculateStrength(length, hasUpper, hasLower, hasNumber, hasSymbol);
}

function getRandomChar(str) {
    return str[Math.floor(Math.random() * str.length)];
}

// Simple time-to-crack estimation (educational)
function calculateStrength(length, u, l, n, s) {
    let poolSize = 0;
    if (u) poolSize += 26;
    if (l) poolSize += 26;
    if (n) poolSize += 10;
    if (s) poolSize += 30;

    const combinations = Math.pow(poolSize, length);
    // Assuming 1 billion guesses per second (very rough average for simple offline attacks)
    const seconds = combinations / 1e9;

    let timeString = '';
    if (seconds < 1) timeString = 'Natychmiast';
    else if (seconds < 60) timeString = 'Kilka sekund';
    else if (seconds < 3600) timeString = 'Kilka minut';
    else if (seconds < 86400) timeString = 'Kilka godzin';
    else if (seconds < 31536000) timeString = 'Kilka dni/miesięcy';
    else timeString = 'Lata / Wieki';

    strengthText.innerHTML = `Szacowany czas łamania (brute-force): <strong>${timeString}</strong>`;
}

// Init
generatePassword();
