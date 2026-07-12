// Silent Mode (Tryb Cichy) Application
(function () {
    'use strict';

    let clickCount = 0;
    let clickTimeout = null;

    // DOM Elements
    const sendButton = document.getElementById('sendSmsButton');
    const statusText = document.querySelector('.status-text');
    const clickDots = document.querySelectorAll('.click-dot');
    const recipientNumber = document.getElementById('recipientNumber');
    const previewText = document.getElementById('previewText');
    const goToSettingsBtn = document.getElementById('goToSettings');

    // Get setting from LocalStorage
    function getSetting(key) {
        return localStorage.getItem(key);
    }

    // Load settings and update UI
    async function loadSettings() {
        try {
            const phoneNumber = getSetting('emergencyPhone');
            const messageTemplate = getSetting('emergencyMessage');

            if (phoneNumber) {
                recipientNumber.textContent = phoneNumber;
                recipientNumber.style.color = '#10b981';
                document.querySelector('.settings-link-btn').style.display = 'none';
            } else {
                recipientNumber.textContent = 'Nie skonfigurowano';
                recipientNumber.style.color = '#ef4444';
            }

            if (messageTemplate) {
                previewText.textContent = messageTemplate;
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    // Get current location
    function getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject('Geolocation not supported');
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    resolve({ lat, lon });
                },
                (error) => reject(error),
                {
                    enableHighAccuracy: true,
                    timeout: 30000,
                    maximumAge: 0
                }
            );
        });
    }

    // Send SMS with location
    async function sendEmergencySMS() {
        statusText.textContent = 'Pobieranie lokalizacji...';
        statusText.classList.add('sending');

        try {
            // Get settings from LocalStorage
            const phoneNumber = getSetting('emergencyPhone');
            const messageTemplate = getSetting('emergencyMessage') || 'Potrzebuję Pomocy!';

            if (!phoneNumber) {
                alert('Proszę skonfigurować numer telefonu w Ustawieniach!');
                resetClickCounter();
                return;
            }

            // Get location
            const location = await getCurrentLocation();
            const mapsUrl = `https://maps.google.com/?q=${location.lat},${location.lon}`;

            // Construct message
            const message = `${messageTemplate}\n\nMoja lokalizacja:\n${mapsUrl}`;

            // Create SMS URL
            const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;

            statusText.textContent = 'Otwieranie SMS...';

            // Open SMS app (user must manually send)
            window.location.href = smsUrl;

            // Reset after delay
            setTimeout(() => {
                resetClickCounter();
                statusText.textContent = 'Gotowy do wysłania';
                statusText.classList.remove('sending');
            }, 2000);

        } catch (error) {
            console.error('Error sending SMS:', error);
            statusText.textContent = 'Błąd: ' + error.message;
            statusText.style.color = '#ef4444';

            setTimeout(() => {
                resetClickCounter();
                statusText.textContent = 'Gotowy do wysłania';
                statusText.style.color = '#10b981';
            }, 3000);
        }
    }

    // Reset click counter
    function resetClickCounter() {
        clickCount = 0;
        clickDots.forEach(dot => dot.classList.remove('active'));
        if (clickTimeout) {
            clearTimeout(clickTimeout);
            clickTimeout = null;
        }
    }

    // Handle button click with triple-click mechanism
    function handleSendButtonClick() {
        clickCount++;

        // Update visual feedback
        if (clickCount <= 3) {
            clickDots[clickCount - 1].classList.add('active');
            sendButton.classList.add('activating');
            setTimeout(() => sendButton.classList.remove('activating'), 300);
        }

        // Update status text
        if (clickCount < 3) {
            statusText.textContent = `Naciśnij jeszcze ${3 - clickCount}x`;
            statusText.style.color = '#6366f1';
        }

        // Clear existing timeout
        if (clickTimeout) {
            clearTimeout(clickTimeout);
        }

        // If 3 clicks reached, send SMS
        if (clickCount >= 3) {
            statusText.textContent = 'Wysyłanie wiadomości...';
            setTimeout(() => {
                sendEmergencySMS();
            }, 500);
        } else {
            // Reset counter after 2 seconds of inactivity
            clickTimeout = setTimeout(() => {
                resetClickCounter();
                statusText.textContent = 'Gotowy do wysłania';
                statusText.style.color = '#10b981';
            }, 2000);
        }
    }

    // Event listeners
    if (sendButton) {
        sendButton.addEventListener('click', handleSendButtonClick);
    }

    // Improved navigation to settings
    if (goToSettingsBtn) {
        goToSettingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Use window.location for simpler navigation if app router isn't available
            if (window.app) {
                window.app.loadView('settings'); // Assuming this routing exists
            } else {
                window.location.href = '../ustawienia/ustawienia.html';
            }
        });
    }

    // Load settings on init
    loadSettings();

    console.log('Silent Mode loaded');

})();
