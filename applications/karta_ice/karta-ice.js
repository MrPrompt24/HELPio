/* karta-ice.js */

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('ice-form');
    // Hide form content until unlocked
    form.style.visibility = 'hidden';

    let currentPIN = null;

    // 1. Initial Logic: Check PIN status
    const hasPIN = await Security.hasPIN();

    if (!hasPIN) {
        // First run -> Force Set PIN
        PinUI.showSetNew().then(pin => {
            currentPIN = pin;
            form.style.visibility = 'visible';
            PinUI.showAlert("Sukces", "PIN ustawiony. Możesz teraz wypełnić kartę.\n\nPamiętaj, aby zapisać dane po wypełnieniu formularza.");
        }).catch(() => {
            // If cancelled, redirect
            window.location.href = "../../index.html";
        });
    } else {
        // Has PIN -> Verify
        PinUI.showVerify().then(pin => {
            currentPIN = pin;
            form.style.visibility = 'visible';
            loadData(pin);
        }).catch(() => {
            window.location.href = "../../index.html";
        });
    }

    // 2. Handle Form Submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Safety check
        if (!currentPIN) {
            return;
        }

        const formData = new FormData(form);
        const data = {};

        Array.from(form.elements).forEach(el => {
            if (el.name) {
                if (el.type === 'checkbox') {
                    data[el.name] = el.checked;
                } else if (el.type !== 'submit' && el.type !== 'button') {
                    data[el.name] = el.value;
                }
            }
        });

        try {
            await Security.saveData(currentPIN, data);
            PinUI.showAlert("Zapisano", "Dane zostały bezpiecznie zapisane i zaszyfrowane.");
        } catch (err) {
            console.error(err);
            PinUI.showAlert("Błąd", "Wystąpił błąd podczas zapisu danych: " + err.message);
        }
    });

    async function loadData(pin) {
        try {
            const data = await Security.loadFullData(pin);
            if (!data) return;

            Object.keys(data).forEach(key => {
                const el = form.elements[key];
                if (el) {
                    if (el.type === 'checkbox') {
                        el.checked = data[key];
                    } else {
                        el.value = data[key];
                    }
                }
            });
        } catch (err) {
            console.error("Load error:", err);
            PinUI.showAlert("Błąd", "Nie udało się odczytać danych (błędne hasło lub uszkodzenie bazy).");
        }
    }

    // "Change PIN" button logic
    const changePinBtn = document.getElementById('change-pin-btn');
    if (changePinBtn) {
        changePinBtn.addEventListener('click', async () => {
            // 1. Load current data first to keep it in memory
            let currentData = null;
            try {
                currentData = await Security.loadFullData(currentPIN);
            } catch (e) { /* ignore if empty */ }

            PinUI.showChange().then(async (newPin) => {
                // PinUI already called Security.setPIN(newPin) and updated the hash/salt.
                currentPIN = newPin;

                // 2. Re-save data with new key if we had data
                if (currentData) {
                    await Security.saveData(newPin, currentData);
                }
                PinUI.showAlert("Sukces", "PIN został zmieniony.");
            }).catch(() => { });
        });
    }

    // "Back" button
    const backBtn = document.getElementById('back-to-app');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = "../../index.html";
        });
    }
});
