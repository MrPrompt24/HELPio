// Help Nearby (Pomoc W Pobliżu) Application
(function () {
    'use strict';

    // Get all category buttons
    const categoryButtons = document.querySelectorAll('.category-btn');

    // Function to open Google Maps with search query
    function openGoogleMaps(category) {
        // Encode the search term for URL
        const searchTerm = encodeURIComponent(category);

        // Try to open in Google Maps app first (works on mobile)
        // Format: geo:0,0?q=search_term
        const geoUrl = `geo:0,0?q=${searchTerm}`;

        // Alternative: Google Maps web URL with search API
        // This will open in browser if app is not available
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${searchTerm}`;

        // Try geo URL first (opens app on mobile)
        window.location.href = geoUrl;

        // Fallback to web URL after a short delay if app doesn't open
        setTimeout(() => {
            // This will only execute if geo: URL didn't work
            window.open(mapsUrl, '_blank');
        }, 500);
    }

    // Add click event listeners to all category buttons
    categoryButtons.forEach(button => {
        button.addEventListener('click', function () {
            const category = this.getAttribute('data-category');

            if (category) {
                // Add visual feedback
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 200);

                // Open Google Maps
                openGoogleMaps(category);

                // Log for debugging
                console.log(`Opening Google Maps for: ${category}`);
            }
        });
    });

    // Check if geolocation is available
    if ('geolocation' in navigator) {
        console.log('✓ Geolocation is available');
    } else {
        console.warn('⚠ Geolocation is not available on this device');
    }

    // Log available categories
    console.log('Help Nearby categories loaded:', categoryButtons.length);

})();
