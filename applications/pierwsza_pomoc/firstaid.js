// First Aid Application with Web Speech API
(function () {
    'use strict';

    // DOM Elements
    const mainMenu = document.getElementById('mainMenu');
    const instructionsView = document.getElementById('instructionsView');
    const categoriesGrid = document.getElementById('categoriesGrid');
    const voiceTestBtn = document.getElementById('voiceTestBtn');
    const voiceStatus = document.getElementById('voiceStatus');
    const backBtn = document.getElementById('backBtn');
    const categoryTitle = document.getElementById('categoryTitle');
    const stepsContainer = document.getElementById('stepsContainer');
    const playAllBtn = document.getElementById('playAllBtn');
    const stopBtn = document.getElementById('stopBtn');

    // Speech Synthesis
    let synthesis = window.speechSynthesis;
    let currentUtterance = null;
    let isReading = false;
    let currentCategory = null;

    // Initialize app
    function init() {
        renderCategories();
        checkVoiceSupport();
    }

    // Check if voice synthesis is supported
    function checkVoiceSupport() {
        if ('speechSynthesis' in window) {
            voiceStatus.textContent = '✓ Funkcja mowy jest dostępna';
            voiceStatus.style.color = '#10b981';
        } else {
            voiceStatus.textContent = '✗ Funkcja mowy niedostępna w tej przeglądarce';
            voiceStatus.style.color = '#ef4444';
            playAllBtn.disabled = true;
        }
    }

    // Test voice synthesis
    function testVoice() {
        if (!synthesis) {
            alert('Funkcja mowy niedostępna w tej przeglądarce');
            return;
        }

        stopSpeech();

        const utterance = new SpeechSynthesisUtterance('Test funkcji czytania głosowego. Jeśli słyszysz ten komunikat, funkcja działa poprawnie.');
        utterance.lang = 'pl-PL';
        utterance.rate = 0.9;
        utterance.pitch = 1;

        utterance.onstart = () => {
            voiceStatus.textContent = '🔊 Test mowy w trakcie...';
            voiceStatus.style.color = '#3b82f6';
        };

        utterance.onend = () => {
            voiceStatus.textContent = '✓ Test zakończony pomyślnie';
            voiceStatus.style.color = '#10b981';
        };

        utterance.onerror = (event) => {
            voiceStatus.textContent = '✗ Błąd: ' + event.error;
            voiceStatus.style.color = '#ef4444';
        };

        synthesis.speak(utterance);
    }

    // Render categories grid
    function renderCategories() {
        categoriesGrid.innerHTML = '';

        firstAidData.categories.forEach(category => {
            const card = document.createElement('div');
            card.className = 'category-card';
            card.innerHTML = `
                <i class="fas ${category.icon}" style="color: ${category.color}"></i>
                <h3>${category.title}</h3>
                <p class="category-subtitle">${category.subtitle}</p>
            `;
            card.addEventListener('click', () => openCategory(category));
            categoriesGrid.appendChild(card);
        });
    }

    // Open category instructions
    function openCategory(category) {
        currentCategory = category;
        categoryTitle.textContent = category.title;
        categoryTitle.style.color = category.color;

        // Render steps
        stepsContainer.innerHTML = '';
        category.steps.forEach((step, index) => {
            const stepItem = document.createElement('div');
            stepItem.className = 'step-item';
            stepItem.dataset.index = index;
            stepItem.innerHTML = `
                <div class="step-number">${index + 1}</div>
                <div class="step-text">${step}</div>
            `;

            // Click to read individual step
            stepItem.addEventListener('click', () => readStep(step, stepItem));

            stepsContainer.appendChild(stepItem);
        });

        // Switch views
        mainMenu.classList.remove('view-active');
        mainMenu.classList.add('view-hidden');
        instructionsView.classList.remove('view-hidden');
        instructionsView.classList.add('view-active');
    }

    // Read single step
    function readStep(text, element) {
        stopSpeech();

        // Remove previous highlighting
        document.querySelectorAll('.step-item').forEach(item => {
            item.classList.remove('reading');
        });

        // Highlight current step
        element.classList.add('reading');

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pl-PL';
        utterance.rate = 0.85;
        utterance.pitch = 1;

        utterance.onend = () => {
            element.classList.remove('reading');
        };

        synthesis.speak(utterance);
        currentUtterance = utterance;
    }

    // Read all steps
    function readAllSteps() {
        if (!currentCategory) return;

        stopSpeech();
        isReading = true;

        const steps = currentCategory.steps;
        let currentStepIndex = 0;

        function readNextStep() {
            if (currentStepIndex >= steps.length || !isReading) {
                document.querySelectorAll('.step-item').forEach(item => {
                    item.classList.remove('reading');
                });
                isReading = false;
                return;
            }

            const stepText = steps[currentStepIndex];
            const stepElement = stepsContainer.children[currentStepIndex];

            // Remove previous highlighting
            document.querySelectorAll('.step-item').forEach(item => {
                item.classList.remove('reading');
            });

            // Highlight current
            stepElement.classList.add('reading');

            // Add step number to speech
            const textToRead = `Krok ${currentStepIndex + 1}. ${stepText}`;

            const utterance = new SpeechSynthesisUtterance(textToRead);
            utterance.lang = 'pl-PL';
            utterance.rate = 0.85;
            utterance.pitch = 1;

            utterance.onend = () => {
                currentStepIndex++;
                setTimeout(readNextStep, 500); // 500ms pause between steps
            };

            utterance.onerror = () => {
                isReading = false;
                stepElement.classList.remove('reading');
            };

            synthesis.speak(utterance);
            currentUtterance = utterance;
        }

        readNextStep();
    }

    // Stop speech
    function stopSpeech() {
        if (synthesis) {
            synthesis.cancel();
        }
        isReading = false;
        document.querySelectorAll('.step-item').forEach(item => {
            item.classList.remove('reading');
        });
    }

    // Back to main menu
    function goBack() {
        stopSpeech();
        currentCategory = null;

        mainMenu.classList.remove('view-hidden');
        mainMenu.classList.add('view-active');
        instructionsView.classList.remove('view-active');
        instructionsView.classList.add('view-hidden');
    }

    // Event listeners
    if (voiceTestBtn) {
        voiceTestBtn.addEventListener('click', testVoice);
    }

    if (backBtn) {
        backBtn.addEventListener('click', goBack);
    }

    if (playAllBtn) {
        playAllBtn.addEventListener('click', readAllSteps);
    }

    if (stopBtn) {
        stopBtn.addEventListener('click', stopSpeech);
    }

    // Stop speech when leaving page
    window.addEventListener('beforeunload', stopSpeech);

    // Initialize
    init();

    console.log('First Aid application loaded');

})();
