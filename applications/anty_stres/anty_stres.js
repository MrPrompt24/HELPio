// anty_stres.js
// Main entry point for Anti-Stress application
console.log('Anti-Stress Dashboard Loaded');

// Add any dashboard-specific logic here if needed in the future
document.addEventListener('DOMContentLoaded', () => {
    // Animation for tiles on load
    const tiles = document.querySelectorAll('.stress-tile');
    tiles.forEach((tile, index) => {
        tile.style.opacity = '0';
        tile.style.transform = 'translateY(20px)';
        setTimeout(() => {
            tile.style.transition = 'all 0.4s ease';
            tile.style.opacity = '1';
            tile.style.transform = 'translateY(0)';
        }, index * 50);
    });
});
