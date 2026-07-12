// cyfrowa_higiena.js
document.addEventListener('DOMContentLoaded', () => {
    console.log('Cyfrowa Higiena loaded');
    // Simple entry animation for tiles
    const tiles = document.querySelectorAll('.hygiene-tile');
    tiles.forEach((tile, index) => {
        tile.style.opacity = '0';
        tile.style.transform = 'translateY(20px)';
        setTimeout(() => {
            tile.style.transition = 'opacity 0.5s, transform 0.5s';
            tile.style.opacity = '1';
            tile.style.transform = 'translateY(0)';
        }, index * 100);
    });
});
