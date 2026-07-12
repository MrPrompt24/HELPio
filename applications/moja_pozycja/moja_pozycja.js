// moja_pozycja.js
document.addEventListener('DOMContentLoaded', () => {
    const locateBtn = document.getElementById('locate-btn');
    const statusMsg = document.getElementById('status-message');
    const resultsArea = document.getElementById('results-area');
    const latValue = document.getElementById('lat-value');
    const lngValue = document.getElementById('lng-value');
    const accValue = document.getElementById('acc-value');
    const mapLink = document.getElementById('map-link');

    // 5.1 Check browser support
    if (!('geolocation' in navigator)) {
        statusMsg.textContent = "Twoja przeglądarka nie obsługuje geolokalizacji.";
        statusMsg.className = "status-message status-error";
        locateBtn.disabled = true;
        locateBtn.style.opacity = '0.5';
        locateBtn.style.cursor = 'not-allowed';
        return;
    }

    locateBtn.addEventListener('click', () => {
        // Clear previous state
        statusMsg.textContent = "Pobieranie lokalizacji...";
        statusMsg.className = "status-message";
        resultsArea.classList.remove('visible');

        // 5.2 Get location
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // 5.3 Success
                const lat = position.coords.latitude.toFixed(6);
                const lng = position.coords.longitude.toFixed(6);
                const acc = Math.round(position.coords.accuracy) + " m";

                latValue.textContent = lat;
                lngValue.textContent = lng;
                accValue.textContent = acc;

                // 5.4 Map Link
                const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
                mapLink.href = mapUrl;

                resultsArea.classList.add('visible');
                statusMsg.textContent = "Lokalizacja pobrana pomyślnie.";
                statusMsg.className = "status-message status-success";
            },
            (error) => {
                // 5.5 Error handling
                let errorMsg = "Wystąpił nieznany błąd.";
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMsg = "Użytkownik zablokował dostęp do lokalizacji.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMsg = "Informacja o lokalizacji jest niedostępna.";
                        break;
                    case error.TIMEOUT:
                        errorMsg = "Przekroczono czas oczekiwania na lokalizację.";
                        break;
                    case error.UNKNOWN_ERROR:
                        errorMsg = "Wystąpił nieznany błąd.";
                        break;
                }
                statusMsg.textContent = errorMsg;
                statusMsg.className = "status-message status-error";
            },
            {
                enableHighAccuracy: true,
                timeout: 30000,
                maximumAge: 0
            }
        );
    });
});
