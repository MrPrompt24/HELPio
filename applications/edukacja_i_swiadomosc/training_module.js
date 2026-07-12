// training_module.js
document.addEventListener('DOMContentLoaded', () => {
    // Simple fade-in for content
    const card = document.querySelector('.training-card');
    if (card) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';

        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100);
    }
});
