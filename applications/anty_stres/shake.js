// shake.js – MOVEMENT/RUB DETECTOR
const icon = document.querySelector('.shake-phone-icon');
const successMsg = document.querySelector('.success-message');
const shakeText = document.querySelector('.shake-text');

let shakeProgress = 0;
const SHAKE_THRESHOLD = 1000; // Amount of "movement distance" needed
const DECAY = 10; // How fast progress drops if you stop moving

let lastX = 0;
let lastY = 0;
let isInteracting = false;
let decayInterval = null;
let completed = false;

// Initialize decay loop
if (!decayInterval) {
    decayInterval = setInterval(() => {
        if (!isInteracting && shakeProgress > 0 && !completed) {
            shakeProgress = Math.max(0, shakeProgress - DECAY);
        }
    }, 50);
}

function handleStart(x, y) {
    if (completed) return;
    isInteracting = true;
    lastX = x;
    lastY = y;
    icon.style.transition = 'none'; // Disable transition for instant follow
}

function handleMove(x, y) {
    if (!isInteracting || completed) return;

    const dx = x - lastX;
    const dy = y - lastY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Only count significant movements (noise filter)
    if (dist > 2) {
        shakeProgress += dist;

        // Visual feedback - shake the icon slightly based on movement direction + random jitter
        const jitterX = Math.random() * 10 - 5;
        const jitterY = Math.random() * 10 - 5;
        const rotate = Math.random() * 20 - 10;

        icon.style.transform = `translate(${dx * 0.5 + jitterX}px, ${dy * 0.5 + jitterY}px) rotate(${rotate}deg) scale(1.1)`;
    }

    lastX = x;
    lastY = y;

    // Check for success
    if (shakeProgress >= SHAKE_THRESHOLD) {
        finishShake();
    }
}

function handleEnd() {
    isInteracting = false;
    if (!completed) {
        icon.style.transition = 'transform 0.3s ease-out';
        icon.style.transform = 'translate(0,0) rotate(0deg) scale(1)';
    }
}

function finishShake() {
    completed = true;
    isInteracting = false;
    shakeProgress = 0;

    icon.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    icon.style.transform = 'scale(0.8)'; // Shrink slightly before success pop

    successMsg.classList.add('show');

    // Optional: Vibrate device if supported
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    setTimeout(() => {
        successMsg.classList.remove('show');
        icon.style.transform = 'translate(0,0) rotate(0deg) scale(1)';
        completed = false;
    }, 3000);
}

// Mouse Events
icon.addEventListener('mousedown', e => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
});
document.addEventListener('mousemove', e => {
    handleMove(e.clientX, e.clientY);
});
document.addEventListener('mouseup', handleEnd);

// Touch Events
icon.addEventListener('touchstart', e => {
    e.preventDefault(); // Prevent scroll
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
});
document.addEventListener('touchmove', e => {
    if (isInteracting) {
        // e.preventDefault(); // Prevent scroll while shaking
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
    }
}, { passive: false });
document.addEventListener('touchend', handleEnd);

// Simulation Button
document.getElementById('simulate-shake').addEventListener('click', () => {
    let simCount = 0;
    const simInterval = setInterval(() => {
        simCount++;
        shakeProgress += 50;

        const rX = Math.random() * 20 - 10;
        const rY = Math.random() * 20 - 10;
        const rot = Math.random() * 20 - 10;
        icon.style.transform = `translate(${rX}px, ${rY}px) rotate(${rot}deg) scale(1.1)`;

        if (shakeProgress >= SHAKE_THRESHOLD) {
            clearInterval(simInterval);
            finishShake();
        }
    }, 50);
});
