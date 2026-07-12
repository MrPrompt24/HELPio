// edukacja_i_swiadomosc.js
document.addEventListener('DOMContentLoaded', () => {
    // Staggered animation for grid items
    const boxes = document.querySelectorAll('.edu-box');
    boxes.forEach((box, index) => {
        box.style.opacity = '0';
        box.style.transform = 'translateY(20px)';
        box.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out, box-shadow 0.3s';

        setTimeout(() => {
            box.style.opacity = '1';
            box.style.transform = 'translateY(0)';

            // Remove inline transition to allow hover effects to work properly after animation
            setTimeout(() => {
                box.style.transition = '';
            }, 500);
        }, index * 100);
    });
});
