// stress-release.js
const container = document.querySelector('.release-container');
const intro = document.querySelector('.release-intro');
let active = false;

const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

function createParticle(x, y) {
    if (!active) {
        intro.classList.add('fade');
        active = true;
    }

    const particle = document.createElement('div');
    particle.classList.add('particle');

    const size = Math.random() * 20 + 10;
    const color = colors[Math.floor(Math.random() * colors.length)];

    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.background = color;
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;

    container.appendChild(particle);

    // Sometimes add a ripple
    if (Math.random() > 0.7) {
        const ripple = document.createElement('div');
        ripple.classList.add('ripple');
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.style.borderColor = color;
        container.appendChild(ripple);

        setTimeout(() => ripple.remove(), 1000);
    }

    setTimeout(() => {
        particle.remove();
    }, 1000);
}

function handleInput(e) {
    e.preventDefault();
    let x, y;

    if (e.type.includes('touch')) {
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        x = touch.clientX - rect.left;
        y = touch.clientY - rect.top;
    } else {
        const rect = container.getBoundingClientRect();
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    }

    createParticle(x, y);
}

container.addEventListener('mousemove', (e) => {
    if (e.buttons === 1) handleInput(e); // Only on click+drag or just move? User said "reaction to movement", implies move is enough or click. Let's do move.
    // Actually user said "interaction dotykowa", "reakcja na ruch palca lub myszy".
    // I will enable it on simpler mousemove without click to be more responsive.
    handleInput(e);
});

container.addEventListener('touchmove', handleInput);
container.addEventListener('click', handleInput);
