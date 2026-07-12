// ===== FUNKCJONALNOŚĆ UDOSTĘPNIANIA =====
class ShareManager {
    constructor() {
        this.init();
    }

    init() {
        // Dodajemy event listener do przycisku udostępniania
        const shareButton = document.getElementById('shareIconButton');
        if (shareButton) {
            shareButton.addEventListener('click', () => this.handleShare());
        }
    }

    async handleShare() {
        const shareData = {
            title: 'AquaMotiv - Aplikacja do monitorowania nawodnienia',
            text: 'Sprawdź tę świetną aplikację do śledzenia picia wody i wymiany filtrów!',
            url: window.location.href
        };

        try {
            // Sprawdzamy czy przeglądarka obsługuje Web Share API
            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
                this.showShareSuccess();
            } else {
                // Fallback - kopiowanie do schowka
                await this.copyToClipboard(shareData.url);
                this.showCopySuccess();
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                // Jeśli sharing się nie powiedzie, próbujemy skopiować link
                await this.copyToClipboard(shareData.url);
                this.showCopySuccess();
            }
        }
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
        } catch (error) {
            // Fallback dla starszych przeglądarek
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    }

    showShareSuccess() {
        this.showNotification('Udostępniono pomyślnie! 🚀', 'success');
    }

    showCopySuccess() {
        this.showNotification('Link skopiowany do schowka! 📋', 'success');
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `share-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Animacja pojawiania się
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Usuwanie po 3 sekundach
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }
}

// ===== SYSTEM MOTYWACYJNYCH KOMUNIKATÓW =====
class MotivationalMessages {
    constructor() {
        this.messages = [
            {
                text: "💧 Twoje ciało składa się w 60% z wody - czas je uzupełnić!",
                icon: "💧",
                type: "educational"
            },
            {
                text: "🌟 Każda kropla wody to inwestycja w Twoje zdrowie!",
                icon: "🌟",
                type: "motivational"
            },
            {
                text: "🧠 Nawet 2% odwodnienia może wpłynąć na Twoją koncentrację!",
                icon: "🧠",
                type: "educational"
            },
            {
                text: "🏃‍♀️ Woda to najlepszy napój energetyczny - bez kalorii!",
                icon: "🏃‍♀️",
                type: "fun"
            },
            {
                text: "✨ Pijesz wodę = Twoja skóra Ci dziękuje!",
                icon: "✨",
                type: "beauty"
            },
            {
                text: "🎯 Małe łyki, wielkie rezultaty - pij regularnie!",
                icon: "🎯",
                type: "motivational"
            },
            {
                text: "🌊 Bądź jak ocean - pełen życia i energii!",
                icon: "🌊",
                type: "philosophical"
            },
            {
                text: "💪 Woda to paliwo dla Twoich mięśni!",
                icon: "💪",
                type: "fitness"
            },
            {
                text: "🧘‍♀️ Chwila przy wodzie = chwila dla siebie",
                icon: "🧘‍♀️",
                type: "mindful"
            },
            {
                text: "🌱 Każde napełnienie to krok ku zdrowszemu Ja!",
                icon: "🌱",
                type: "growth"
            },
            {
                text: "🔥 Twój metabolizm potrzebuje wody jak ogień drewna!",
                icon: "🔥",
                type: "educational"
            },
            {
                text: "🎨 Kreuj swoje zdrowie kropla po kropli!",
                icon: "🎨",
                type: "creative"
            },
            {
                text: "🚀 H2O = Formula na sukces!",
                icon: "🚀",
                type: "fun"
            },
            {
                text: "💎 Czysta woda to skarb cenniejszy niż złoto!",
                icon: "💎",
                type: "philosophical"
            },
            {
                text: "🌈 Po każdej butelce czeka Cię tęcza zdrowia!",
                icon: "🌈",
                type: "optimistic"
            }
        ];
        
        this.init();
    }

    init() {
        // Uruchamiamy pierwszy komunikat po 30 sekundach
        setTimeout(() => this.startMotivationalCycle(), 30000);
        
        // Dodajemy komunikaty przy dodawaniu napełnień
        this.observeAddButton();
        
        // Komunikat powitalny po załadowaniu strony
        setTimeout(() => this.showWelcomeMessage(), 2000);
    }

    startMotivationalCycle() {
        // Pokazuj komunikat co 5-10 minut (losowo)
        const showMessage = () => {
            this.showRandomMessage();
            const nextInterval = Math.random() * (600000 - 300000) + 300000; // 5-10 min
            setTimeout(showMessage, nextInterval);
        };
        showMessage();
    }

    observeAddButton() {
        const addButton = document.getElementById('addButton');
        if (addButton) {
            addButton.addEventListener('click', () => {
                // Pokazuj motywacyjny komunikat po dodaniu napełnienia (z małym opóźnieniem)
                setTimeout(() => {
                    if (Math.random() < 0.7) { // 70% szansy na komunikat
                        this.showRandomMessage('congratulations');
                    }
                }, 1500);
            });
        }
    }

    showWelcomeMessage() {
        const welcomeMessages = [
            "🌊 Witaj w AquaMotiv! Czas zadbać o nawodnienie!",
            "💧 Gotowy na wodną przygodę? Zaczynajmy!",
            "🌟 Dzisiaj każda kropla ma znaczenie!"
        ];
        
        const message = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
        this.showMessage(message, 'welcome');
    }

    showRandomMessage(context = 'general') {
        let filteredMessages = this.messages;
        
        // Filtrujemy komunikaty w zależności od kontekstu
        if (context === 'congratulations') {
            const congratsMessages = [
                "🎉 Świetnie! Kolejna kropla w ocean zdrowia!",
                "👏 Brawo! Twoje ciało Ci dziękuje!",
                "⭐ Excellent choice! Tak trzymaj!",
                "💪 Power move! Jesteś niesamowity!",
                "🏆 Champion level unlocked!"
            ];
            const message = congratsMessages[Math.floor(Math.random() * congratsMessages.length)];
            this.showMessage(message, 'congratulations');
            return;
        }
        
        const randomMessage = filteredMessages[Math.floor(Math.random() * filteredMessages.length)];
        this.showMessage(randomMessage.text, randomMessage.type);
    }

    showMessage(text, type = 'general') {
        // Sprawdzamy czy nie ma już wyświetlonego komunikatu
        if (document.querySelector('.motivational-popup')) {
            return;
        }

        const popup = document.createElement('div');
        popup.className = `motivational-popup ${type}`;
        popup.innerHTML = `
            <div class="motivational-content">
                <button class="motivational-close">&times;</button>
                <div class="motivational-text">${text}</div>
                <div class="motivational-actions">
                    <button class="motivational-btn thanks">Dzięki! 😊</button>
                </div>
            </div>
        `;

        document.body.appendChild(popup);

        // Event listeners dla przycisków
        const closeBtn = popup.querySelector('.motivational-close');
        const thanksBtn = popup.querySelector('.thanks');
        
        const closePopup = () => {
            popup.classList.add('closing');
            setTimeout(() => {
                if (document.body.contains(popup)) {
                    document.body.removeChild(popup);
                }
            }, 300);
        };

        closeBtn.addEventListener('click', closePopup);
        thanksBtn.addEventListener('click', () => {
            thanksBtn.innerHTML = '❤️ Super!';
            setTimeout(closePopup, 1000);
        });

        // Auto-close po 8 sekundach
        setTimeout(closePopup, 8000);

        // Animacja pojawiania się
        setTimeout(() => popup.classList.add('show'), 100);
    }
}

// ===== DODATKOWE EFEKTY WIZUALNE =====
class VisualEffects {
    constructor() {
        this.init();
    }

    init() {
        this.addWaterDropEffect();
        this.enhanceButtons();
    }

    addWaterDropEffect() {
        // Dodaje efekt kropli wody na hover nad przyciskami
        const buttons = document.querySelectorAll('.main-button, .save-settings-button');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', (e) => {
                this.createWaterDrop(e.target);
            });
        });
    }

    createWaterDrop(element) {
        const drop = document.createElement('div');
        drop.className = 'water-drop-effect';
        drop.innerHTML = '💧';
        
        const rect = element.getBoundingClientRect();
        drop.style.left = (rect.left + Math.random() * rect.width) + 'px';
        drop.style.top = (rect.top - 20) + 'px';
        
        document.body.appendChild(drop);
        
        setTimeout(() => {
            if (document.body.contains(drop)) {
                document.body.removeChild(drop);
            }
        }, 2000);
    }

    enhanceButtons() {
        // Dodaje dodatkowe efekty do przycisków
        const mainButton = document.getElementById('addButton');
        if (mainButton) {
            let clickCount = 0;
            mainButton.addEventListener('click', () => {
                clickCount++;
                if (clickCount % 5 === 0) {
                    this.showSpecialEffect(mainButton);
                }
            });
        }
    }

    showSpecialEffect(element) {
        const effect = document.createElement('div');
        effect.className = 'special-water-effect';
        effect.innerHTML = '🌊💧✨🌊💧✨';
        
        const rect = element.getBoundingClientRect();
        effect.style.left = (rect.left + rect.width / 2 - 50) + 'px';
        effect.style.top = (rect.top - 30) + 'px';
        
        document.body.appendChild(effect);
        
        setTimeout(() => {
            if (document.body.contains(effect)) {
                document.body.removeChild(effect);
            }
        }, 3000);
    }
}

// ===== INICJALIZACJA WSZYSTKICH FUNKCJONALNOŚCI =====
document.addEventListener('DOMContentLoaded', () => {
    // Małe opóźnienie aby upewnić się, że główna aplikacja się załadowała
    setTimeout(() => {
        new ShareManager();
        new MotivationalMessages();
        new VisualEffects();
    }, 1000);
});