/* ustawienia.js */

document.addEventListener('DOMContentLoaded', async () => {
    const content = document.getElementById('content-section');
    content.innerHTML = '<div style="padding:20px; text-align:center;">Ładowanie...</div>';

    try {
        const hasPIN = await Security.hasPIN();
        if (!hasPIN) {
            await PinUI.showSetNew();
        } else {
            await PinUI.showVerify();
        }

        // Render Settings UI
        renderSettingsUI(content);
        loadSettingsValues();

    } catch (e) {
        console.error("PIN verification failed or cancelled", e);
        window.location.href = "../../index.html";
    }
});

function renderSettingsUI(container) {
    container.innerHTML = `
        <div class="settings-container">
            <div class="settings-header">
                <h1>Ustawienia Aplikacji</h1>
                <p style="color: #ef4444; font-weight: bold; margin-top: 10px; border: 1px solid #7f1d1d; padding: 15px; border-radius: 8px; background: rgba(127, 29, 29, 0.2);">
                    <i class="fas fa-exclamation-triangle"></i> UWAGA: Ustawienie numeru telefonu oraz treści komunikatu jest NIEZBĘDNE do działania aplikacji. <br><br>Bez tego aplikacja nie zadziała!<br><br>
                    <i class="fas fa-user-shield"></i> BEZPIECZEŃSTWO: Twoje dane są przechowywane TYLKO na tym urządzeniu. Aplikacja NIE wysyła ich na żaden zewnętrzny serwer.
                </p>
            </div>

            <form id="settingsForm">
                <!-- Silent Mode Settings -->
                <div class="settings-card">
                    <div class="card-title">
                        <i class="fas fa-bell-slash"></i>
                        Tryb Cichy (Silent Mode)
                    </div>
                    <div style="margin-bottom: 20px; font-size: 0.9rem; color: #d1d5db; line-height: 1.6; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 6px;">
                       <strong>Co to robi?</strong> Umożliwia ciche wezwanie pomocy poprzez automatyczne wysłanie wiadomości SMS do wcześniej wskazanych bliskich bez dźwięków i bez widocznych alertów.<br>
<strong>Dlaczego to ważne?</strong> Pozwala wezwać pomoc w sytuacjach realnego zagrożenia (np. w obecności napastnika), gdy nie możesz zadzwonić ani otwarcie korzystać z telefonu, zwiększając Twoje bezpieczeństwo.

                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="emergencyPhone">Numer Telefonu Alarmowego</label>
                        <input type="tel" id="emergencyPhone" class="form-input" placeholder="+48 123 456 789">
                        <p class="helper-text">Na ten numer zostanie wysłany SMS w sytuacji awaryjnej.</p>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="emergencyMessage">Treść Wiadomości SMS</label>
                        <textarea id="emergencyMessage" class="form-input" placeholder="Wpisz treść wiadomości..."></textarea>
                        <p class="helper-text">Do wiadomości automatycznie zostanie dodana Twoja lokalizacja.</p>
                    </div>
                </div>

                <!-- Save Button -->
                <button type="submit" class="btn-primary" id="saveButton">
                    <i class="fas fa-save"></i>
                    Zapisz Ustawienia
                </button>
            </form>
            
            <div style="text-align:center; margin-top:20px;">
                 <button onclick="window.location.href='../../index.html'" style="background:none; border:none; color:#6b7280; cursor:pointer;">
                    ← Wróć do ekranu głównego
                 </button>
            </div>
        </div>
    `;

    // Attach event listener
    document.getElementById('settingsForm').addEventListener('submit', handleSaveSettings);
}

function loadSettingsValues() {
    const phone = localStorage.getItem('emergencyPhone') || '';
    const message = localStorage.getItem('emergencyMessage') || '';

    document.getElementById('emergencyPhone').value = phone;
    document.getElementById('emergencyMessage').value = message;
}

function handleSaveSettings(e) {
    e.preventDefault();

    const phone = document.getElementById('emergencyPhone').value.trim();
    const message = document.getElementById('emergencyMessage').value.trim();
    const btn = document.getElementById('saveButton');
    const originalBtnContent = btn.innerHTML;

    // Basic Validation
    if (!phone) {
        alert('Proszę podać numer telefonu!');
        return;
    }

    // Save to LocalStorage
    localStorage.setItem('emergencyPhone', phone);
    localStorage.setItem('emergencyMessage', message);

    // Visual Feedback
    btn.innerHTML = '<i class="fas fa-check"></i> Zapisano!';
    btn.style.backgroundColor = '#059669';

    setTimeout(() => {
        btn.innerHTML = originalBtnContent;
        btn.style.backgroundColor = '';
    }, 1500);

    // Mark setup as complete if this was the initial run
    if (localStorage.getItem('app_fully_setup') !== 'true') {
        localStorage.setItem('app_fully_setup', 'true');
        // Redirect to home after short delay
        setTimeout(() => {
            window.location.href = "../../index.html";
        }, 1500);
    }
}
