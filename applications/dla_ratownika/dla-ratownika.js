/* dla-ratownika.js */

document.addEventListener('DOMContentLoaded', async () => {
    const contentSection = document.getElementById('content-section');

    // Labels mapping
    const LABELS = {
        fullName: "Imię i nazwisko",
        birthDate: "Data urodzenia",
        pesel: "PESEL",
        address: "Adres zamieszkania",
        language: "Język komunikacji",
        gender: "Płeć",
        bloodType: "Grupa krwi",
        height: "Wzrost (cm)",
        weight: "Waga (kg)",
        allergies: "Alergie",
        conditions: "Choroby przewlekłe",
        medications: "Leki",
        doctorName: "Lekarz prowadzący",
        doctorPhone: "Telefon do lekarza",
        doctorClinic: "Przychodnia",
        contactName: "Osoba kontaktowa (ICE)",
        contactRelation: "Pokrewieństwo",
        contactPhone: "Telefon alarmowy (ICE)",
        additionalInfo: "Informacje dodatkowe"
    };

    try {
        const rescueData = await Security.loadRescueData();

        // Header
        let html = `
            <div class="ice-header">
                <h1>⛑️ Dla Ratownika</h1>
                <p class="ice-subtitle">Dane udostępnione przez użytkownika dla ratowników</p>
            </div>
        `;

        // Check if data exists
        if (!rescueData || Object.keys(rescueData).length === 0) {
            html += `
                <div class="ice-info-section" style="text-align: center; padding: 40px;">
                    <h2>Brak danych</h2>
                    <p>Użytkownik nie udostępnił jeszcze żadnych informacji dla ratownika lub nie wypełnił Karty ICE.</p>
                    <a href="../karta_ice/karta-ice.html" class="btn-link" style="display:inline-block; margin-top:20px;">Przejdź do edycji Karty ICE</a>
                </div>
            `;
            contentSection.innerHTML = html;
            return;
        }

        // Render Data Groups
        html += `<div class="rescue-data-grid">`;

        // We can group them logically if we want, or just list them.
        // Let's list non-empty fields using the LABELS order if possible, or key order.

        // Helper to render a row
        const renderRow = (key, value) => {
            if (!value) return '';
            const label = LABELS[key] || key;
            return `
                <div class="rescue-card">
                    <div class="rescue-label">${label}</div>
                    <div class="rescue-value">${value}</div>
                </div>
            `;
        };

        // Render in specific order
        Object.keys(LABELS).forEach(key => {
            if (rescueData[key]) {
                html += renderRow(key, rescueData[key]);
            }
        });

        html += `</div>`;

        // Add "Back" button
        html += `
            <div style="text-align: center; margin-top: 30px; margin-bottom: 80px;">
                <button onclick="window.location.href='../../index.html'" class="btn-link">← Powrót</button>
            </div>
        `;

        contentSection.innerHTML = html;

        // Add some inline styles dynamically if needed, or we rely on existing.
        // Let's add simple grid style here or in a style block
        const style = document.createElement('style');
        style.textContent = `
            .rescue-data-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 16px;
                max-width: 800px;
                margin: 0 auto;
            }
            .rescue-card {
                background: #fff;
                border: 1px solid #ddd;
                border-left: 5px solid #e53935; /* Red accent for rescue */
                padding: 16px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            .rescue-label {
                font-size: 0.85rem;
                color: #666;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 4px;
            }
            .rescue-value {
                font-size: 1.1rem;
                font-weight: 600;
                color: #000;
            }
            @media (min-width: 600px) {
                .rescue-data-grid {
                    grid-template-columns: 1fr 1fr;
                }
            }
        `;
        document.head.appendChild(style);

    } catch (err) {
        console.error(err);
        contentSection.innerHTML = `<div class="ice-info-section"><h2>Błąd</h2><p>Nie udało się załadować danych.</p></div>`;
    }
});
