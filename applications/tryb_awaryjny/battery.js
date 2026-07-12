// Emergency Mode – Battery Saver (SAFE VERSION)
(function () {
    'use strict';

    const batteryButton = document.getElementById('openBatterySettings');
    if (!batteryButton) return;

    // Detect platform
    const isAndroid = /android/i.test(navigator.userAgent);
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

    // --- ANDROID ---
    // Intent is handled ONLY by <a href="intent:...">
    // JS does NOTHING here on purpose (security reasons)

    if (isAndroid) {
        console.log('Android detected – intent handled by href');
        return;
    }

    // --- NON ANDROID (iOS / Desktop) ---
    // Block link and show instructions
    batteryButton.removeAttribute('href');

    batteryButton.addEventListener('click', function (e) {
        e.preventDefault();

        let instructions = 'Nie można automatycznie otworzyć ustawień.\n\n';

        if (isIOS) {
            instructions +=
                '📱 iOS:\n' +
                'Ustawienia → Bateria → Tryb niskiego zużycia energii';
        } else {
            instructions +=
                '💻 Inne urządzenie:\n' +
                'Otwórz ustawienia baterii ręcznie';
        }

        alert(instructions);
    });

    console.log('Emergency Mode – fallback instructions enabled');

})();
