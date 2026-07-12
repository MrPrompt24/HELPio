document.addEventListener('DOMContentLoaded', function() {
    const motivateButton = document.getElementById('motivateButton');
   const motivationalMessages = [
    "Każda kropla wody to krok ku lepszemu zdrowiu! 💧",
    "Twój organizm ci podziękuje za każde nawodnienie! 🌱",
    "Pamiętaj, woda to źródło życia - pij regularnie! 🌊",
    "Jesteś na dobrej drodze! Kontynuuj picie wody! 💪",
    "Nawodnienie to klucz do energii i dobrego samopoczucia! 🔑",
    "Każda szklanka wody to inwestycja w Twoje zdrowie! 💎",
    "Woda pomaga oczyścić organizm i poprawić koncentrację! 🧠",
    "Twoja skóra już ci dziękuje za regularne picie wody! ✨",
    "Nie zapominaj - odpowiednie nawodnienie to podstawa! 🏆",
    "Jesteś mistrzem nawodnienia! Tak trzymaj! 🏅",
    "Woda to Twój naturalny eliksir młodości! 🧴",
    "Picie wody to najprostszy sposób na dobre samopoczucie! 😊",
    "Twoje komórki uwielbiają gdy je nawadniasz! 🧫",
    "Nawodniony mózg to sprawniejszy mózg! 🧠⚡",
    "Woda to najlepszy napój energetyczny - naturalny i zdrowy! ⚡",
    "Każdy łyk wody to mały sukces! 🎯",
    "Twoje nerki pracują lepiej gdy pijesz wodę! 🏭",
    "Woda to sekret pięknej skóry! 💆‍♀️",
    "Nawodnienie = więcej energii w ciągu dnia! 🔋",
    "Pijąc wodę, dbasz o swoje stawy i mięśnie! 🦵",
    "Woda pomaga utrzymać prawidłowe ciśnienie krwi! 🩸",
    "Twoje jelita pracują lepiej gdy jesteś nawodniony! 🌀",
    "Woda to naturalny detoks dla Twojego organizmu! 🚿",
    "Picie wody poprawia metabolizm! 🔥",
    "Nawodnienie pomaga walczyć ze zmęczeniem! 😴⚡",
    "Woda to Twój sprzymierzeniec w walce ze stresem! 🧘‍♂️",
    "Każda butelka wody to prezent dla Twojego ciała! 🎁",
    "Nawodnienie poprawia jakość Twojego snu! 🌙",
    "Woda pomaga utrzymać równowagę elektrolitową! ⚖️",
    "Picie wody to prosty sposób na lepsze zdrowie! 👍",
    "Twoje serce pracuje lepiej gdy pijesz wodę! ❤️",
    "Woda to najlepszy przyjaciel Twojego organizmu! 🤝",
    "Nawodnienie poprawia wydolność fizyczną! 🏃‍♂️",
    "Woda pomaga kontrolować apetyt! 🍽️",
    "Picie wody to inwestycja w długie i zdrowe życie! 🕰️",
    "Twoje oczy są bardziej nawilżone gdy pijesz wodę! 👀",
    "Woda to naturalny sposób na lepsze trawienie! 🍏",
    "Nawodnienie poprawia nastrój! 😃",
    "Picie wody to dbanie o swoją przyszłość! 🔮",
    "Twoje włosy są zdrowsze gdy pijesz wodę! 💇‍♀️",
    "Woda to podstawa każdej zdrowej diety! 🥗",
    "Nawodnienie pomaga zwalczać bóle głowy! 🤕",
    "Picie wody to szacunek dla własnego ciała! 🙏",
    "Twoje paznokcie są mocniejsze gdy pijesz wodę! 💅",
    "Woda to najtańszy kosmetyk pielęgnacyjny! 💄",
    "Nawodnienie poprawia krążenie krwi! 🩸",
    "Picie wody to sposób na lepszą odporność! 🛡️",
    "Twoje zęby są zdrowsze gdy pijesz wodę! 🦷",
    "Woda pomaga utrzymać prawidłową wagę! ⚖️",
    "Nawodnienie to klucz do dobrego samopoczucia! 🔐",
    "Picie wody to dbanie o swoją witalność! 🌟",
    "Twoje stawy są lepiej nawilżone gdy pijesz wodę! 🦴",
    "Woda to naturalny sposób na detoksykację! 🚮",
    "Nawodnienie poprawia funkcje poznawcze! 🧩",
    "Picie wody to prosty sposób na lepszą cerę! 👩",
    "Twoje mięśnie pracują lepiej gdy pijesz wodę! 💪",
    "Woda to najlepszy napój dla sportowców! 🏅",
    "Nawodnienie pomaga zwalczać zmęczenie! 😫⚡",
    "Picie wody to dbanie o swoją produktywność! 📈",
    "Twoje ciało składa się w 60% z wody - dbaj o nie! 🧬",
    "Woda to podstawa każdego zdrowego stylu życia! 🏋️‍♂️",
    "Nawodnienie poprawia jakość Twojego życia! 🌈",
    "Picie wody to szansa na lepsze jutro! 🌅"
];

const waterFacts = [
    "Woda stanowi około 60% masy ciała dorosłego człowieka.",
    "Nawet lekkie odwodnienie może wpłynąć na Twoją koncentrację i nastrój.",
    "Woda pomaga regulować temperaturę ciała i usuwać toksyny.",
    "Picie wody przed posiłkiem może pomóc w kontroli wagi.",
    "Odwodnienie może powodować bóle głowy i zmęczenie.",
    "Woda wspomaga trawienie i zapobiega zaparciom.",
    "Nawodniony organizm lepiej radzi sobie z wysiłkiem fizycznym.",
    "Woda pomaga utrzymać elastyczność i młody wygląd skóry.",
    "Picie wody może zmniejszyć ryzyko kamieni nerkowych.",
    "Woda jest niezbędna dla prawidłowego funkcjonowania wszystkich narządów.",
    "Człowiek może przeżyć bez jedzenia około miesiąca, ale bez wody tylko 3-7 dni.",
    "Mózg w 75% składa się z wody.",
    "Krew w 92% składa się z wody.",
    "Kość w 22% składa się z wody.",
    "Woda pomaga transportować składniki odżywcze do komórek.",
    "Picie zimnej wody może przyspieszyć metabolizm.",
    "Woda pomaga utrzymać równowagę pH organizmu.",
    "Odwodnienie o zaledwie 2% może obniżyć wydajność fizyczną o 25%.",
    "Woda pomaga zmniejszyć obciążenie serca.",
    "Picie wody może zmniejszyć ryzyko zawału serca.",
    "Woda jest głównym składnikiem limfy, która transportuje białe krwinki.",
    "Nawodnienie pomaga zmniejszyć ból stawów.",
    "Woda pomaga zapobiegać skurczom mięśni.",
    "Picie wody może zmniejszyć ryzyko niektórych nowotworów.",
    "Woda pomaga utrzymać świeży oddech.",
    "Odwodnienie może powodować zawroty głowy.",
    "Woda jest niezbędna do produkcji hormonów i neuroprzekaźników.",
    "Picie wody może poprawić pamięć krótkotrwałą.",
    "Woda pomaga zmniejszyć stres oksydacyjny.",
    "Nawodnienie poprawia funkcjonowanie układu limfatycznego.",
    "Picie wody może zmniejszyć ryzyko infekcji dróg moczowych.",
    "Woda pomaga w produkcji śliny, która chroni zęby.",
    "Odwodnienie może powodować suchość w ustach.",
    "Woda jest niezbędna do prawidłowego funkcjonowania nerek.",
    "Picie wody może zmniejszyć ryzyko udaru.",
    "Woda pomaga utrzymać prawidłowe ciśnienie śródgałkowe.",
    "Nawodnienie poprawia elastyczność tkanek.",
    "Picie wody może zmniejszyć ryzyko zwyrodnienia stawów.",
    "Woda pomaga w produkcji mazi stawowej.",
    "Odwodnienie może powodować zaparcia.",
    "Woda jest niezbędna do prawidłowego funkcjonowania wątroby.",
    "Picie wody może zmniejszyć ryzyko chorób serca.",
    "Woda pomaga w transporcie tlenu do komórek.",
    "Nawodnienie poprawia funkcjonowanie układu odpornościowego.",
    "Picie wody może zmniejszyć ryzyko cukrzycy typu 2.",
    "Woda pomaga w usuwaniu produktów przemiany materii.",
    "Odwodnienie może powodować problemy z koncentracją.",
    "Woda jest niezbędna do prawidłowego funkcjonowania płuc.",
    "Picie wody może zmniejszyć ryzyko chorób neurodegeneracyjnych.",
    "Woda pomaga w utrzymaniu prawidłowego poziomu elektrolitów.",
    "Nawodnienie poprawia funkcjonowanie układu nerwowego.",
    "Picie wody może zmniejszyć ryzyko osteoporozy.",
    "Woda pomaga w utrzymaniu prawidłowego poziomu cukru we krwi.",
    "Odwodnienie może powodować drażliwość.",
    "Woda jest niezbędna do prawidłowego funkcjonowania tarczycy.",
    "Picie wody może zmniejszyć ryzyko chorób autoimmunologicznych.",
    "Woda pomaga w utrzymaniu prawidłowego poziomu cholesterolu.",
    "Nawodnienie poprawia funkcjonowanie układu pokarmowego.",
    "Picie wody może zmniejszyć ryzyko chorób skóry.",
    "Woda pomaga w utrzymaniu prawidłowego poziomu hormonów.",
    "Odwodnienie może powodować suchość skóry.",
    "Woda jest niezbędna do prawidłowego funkcjonowania mięśni.",
    "Picie wody może zmniejszyć ryzyko chorób układu krążenia.",
    "Woda pomaga w utrzymaniu prawidłowego poziomu kwasu moczowego."
];

    motivateButton.addEventListener('click', function() {
        showMotivationalMessage();
    });

    function showMotivationalMessage() {
        // Losowanie typu komunikatu (50% szans na motywację, 50% na ciekawostkę)
        const isMotivational = Math.random() > 0.5;
        const messages = isMotivational ? motivationalMessages : waterFacts;
        const randomIndex = Math.floor(Math.random() * messages.length);
        const message = messages[randomIndex];
        
        // Tworzenie okienka motywacyjnego
        const popup = document.createElement('div');
        popup.className = 'motivational-popup';
        popup.innerHTML = `
            <div class="motivational-content">
                <button class="motivational-close">&times;</button>
                <div class="motivational-text">${message}</div>
                <div class="motivational-actions">
                    <button class="motivational-btn">Rozumiem</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Animacja pojawienia się
        setTimeout(() => {
            popup.classList.add('show');
        }, 10);
        
        // Obsługa zamknięcia
        const closeBtn = popup.querySelector('.motivational-close');
        const okBtn = popup.querySelector('.motivational-btn');
        
        function closePopup() {
            popup.classList.remove('show');
            popup.classList.add('closing');
            setTimeout(() => {
                popup.remove();
            }, 300);
        }
        
        closeBtn.addEventListener('click', closePopup);
        okBtn.addEventListener('click', closePopup);
    }
});