/* pin.js */

document.addEventListener('DOMContentLoaded', async () => {
    const uiContainer = document.getElementById('pin-manager-ui');
    const btnChange = document.getElementById('btn-change-pin');
    const btnBack = document.getElementById('btn-back');

    // Bind back button immediately
    if (btnBack) {
        btnBack.onclick = () => window.location.href = '../../index.html';
    }

    try {
        const hasPIN = await Security.hasPIN();
        if (!hasPIN) {
            // First time setup
            await PinUI.showSetNew();
            PinUI.showAlert("Sukces", "PIN został ustawiony.").then(() => {
                // Check if this was part of the init flow
                // If app_fully_setup is NOT true, we are likely in the init flow
                if (localStorage.getItem('app_fully_setup') !== 'true') {
                    window.location.href = "../ustawienia/ustawienia.html";
                } else {
                    window.location.href = "../../index.html";
                }
            });
            return;
        }

        // Require PIN verification to enter this screen
        await PinUI.showVerify();

        // Reveal the UI
        if (uiContainer) {
            uiContainer.classList.remove('hidden');
        }

        // Logic for Change PIN
        if (btnChange) {
            btnChange.addEventListener('click', () => {
                PinUI.showChange().then(async (newPin) => {
                    // This is a destructive reset in this context
                    PinUI.showAlert("Sukces", "PIN został zmieniony. Poprzednie zaszyfrowane dane nie będą już dostępne.").then(() => {
                        window.location.href = "../../index.html";
                    });
                }).catch(() => {
                    // Action cancelled 
                });
            });
        }

    } catch (e) {
        // Auth failed or cancelled
        window.location.href = "../../index.html";
    }
});
