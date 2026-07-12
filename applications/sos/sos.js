// SOS Emergency Call Application
(function () {
    'use strict';

    let clickCount = 0;
    let clickTimeout = null;

    // DOM Elements
    const sosButton = document.getElementById('sosButton');
    const statusText = document.querySelector('.status-text');
    const clickDots = document.querySelectorAll('.click-dot');

    // Reset click counter
    function resetClickCounter() {
        clickCount = 0;
        clickDots.forEach(dot => dot.classList.remove('active'));
        if (clickTimeout) {
            clearTimeout(clickTimeout);
            clickTimeout = null;
        }
    }

    // Make emergency call
    function makeEmergencyCall() {
        // Change status
        statusText.textContent = 'Łączenie z 112...';
        statusText.classList.add('calling');

        // Wait a moment to show the status, then initiate call
        setTimeout(() => {
            // Create tel: link and trigger it
            window.location.href = 'tel:112';

            // Reset UI after a delay
            setTimeout(() => {
                resetClickCounter();
                statusText.textContent = 'Gotowy do aktywacji';
                statusText.classList.remove('calling');
            }, 2000);
        }, 500);
    }

    // Handle button click with triple-click mechanism
    function handleSOSButtonClick() {
        clickCount++;

        // Update visual feedback
        if (clickCount <= 3) {
            clickDots[clickCount - 1].classList.add('active');
            sosButton.classList.add('activating');
            setTimeout(() => sosButton.classList.remove('activating'), 300);
        }

        // Update status text
        if (clickCount < 3) {
            statusText.textContent = `Naciśnij jeszcze ${3 - clickCount}x`;
            statusText.style.color = '#fbbf24';
        }

        // Clear existing timeout
        if (clickTimeout) {
            clearTimeout(clickTimeout);
        }

        // If 3 clicks reached, make emergency call
        if (clickCount >= 3) {
            statusText.textContent = 'Inicjowanie połączenia...';
            statusText.style.color = '#dc2626';

            // Final confirmation before calling
            setTimeout(() => {
                makeEmergencyCall();
            }, 500);
        } else {
            // Reset counter after 2 seconds of inactivity
            clickTimeout = setTimeout(() => {
                resetClickCounter();
                statusText.textContent = 'Gotowy do aktywacji';
                statusText.style.color = '#10b981';
            }, 2000);
        }
    }

    // Event listener
    if (sosButton) {
        sosButton.addEventListener('click', handleSOSButtonClick);
    }

    // Log warning in console
    console.warn('⚠️ SOS Emergency App loaded. Use only in real emergencies!');
    console.warn('⚠️ False emergency calls are a criminal offense!');

})();
