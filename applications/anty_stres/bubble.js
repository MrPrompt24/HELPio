// bubble.js
// Just decorative background bubbles
const bg = document.querySelector('.bubble-bg');

function createBubble() {
    const bubble = document.createElement('div');
    bubble.classList.add('small-bubble');

    // Random size and position
    const size = Math.random() * 40 + 10;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.random() * 100}%`;
    bubble.style.animationDuration = `${Math.random() * 5 + 5}s`;

    bg.appendChild(bubble);

    setTimeout(() => {
        bubble.remove();
    }, 10000);
}

setInterval(createBubble, 2000);

// Main text guidance
const mainBubble = document.querySelector('.bubble');
const texts = ['Wdech', 'Wydech'];
let textIndex = 0;

setInterval(() => {
    mainBubble.textContent = texts[textIndex % texts.length];
    textIndex++;
}, 4000); // Sync with 8s animation (4s in, 4s out)
