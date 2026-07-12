// Alarm Application - Multi-tone Sound Generator
(function () {
    'use strict';

    let audioContext = null;
    let isPlaying = false;
    let clickCount = 0;
    let clickTimeout = null;
    let oscillators = [];
    let gainNodes = [];

    // DOM Elements
    const alarmButton = document.getElementById('alarmButton');
    const stopButton = document.getElementById('stopButton');
    const statusText = document.querySelector('.status-text');
    const clickDots = document.querySelectorAll('.click-dot');

    // Initialize Audio Context on first user interaction
    function initAudioContext() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    // Generate multi-tone alarm sound
    function startAlarm() {
    initAudioContext();

    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    isPlaying = true;

    // Główny oscillator (syrena)
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'square'; // ostry, alarmowy dźwięk

    // Gain (głośność)
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.8; // BARDZO GŁOŚNO (0.0–1.0)

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const lowFreq = 600;   // niski ton syreny
    const highFreq = 1200; // wysoki ton syreny
    const interval = 600;  // czas przełączania (ms)

    oscillator.frequency.setValueAtTime(lowFreq, audioContext.currentTime);
    oscillator.start();

    let isHigh = false;

    // Naprzemienne WEE–WOO
    const sirenInterval = setInterval(() => {
        if (!isPlaying) {
            clearInterval(sirenInterval);
            return;
        }

        const now = audioContext.currentTime;
        oscillator.frequency.cancelScheduledValues(now);
        oscillator.frequency.linearRampToValueAtTime(
            isHigh ? lowFreq : highFreq,
            now + 0.15
        );

        isHigh = !isHigh;
    }, interval);

    oscillators.push(oscillator);
    gainNodes.push(gainNode);

    updateUI(true);
}

    // Stop alarm sound
    function stopAlarm() {
        oscillators.forEach(osc => {
            try {
                osc.stop();
            } catch (e) {
                // Oscillator might already be stopped
            }
        });

        oscillators = [];
        gainNodes = [];
        isPlaying = false;
        updateUI(false);
        resetClickCounter();
    }

    // Update UI based on alarm state
    function updateUI(active) {
        if (active) {
            statusText.textContent = 'ALARM AKTYWNY!';
            statusText.classList.add('alarm-active');
            alarmButton.classList.add('hidden');
            stopButton.classList.remove('hidden');
        } else {
            statusText.textContent = 'Gotowy do aktywacji';
            statusText.classList.remove('alarm-active');
            alarmButton.classList.remove('hidden');
            stopButton.classList.add('hidden');
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
    function handleAlarmButtonClick() {
        if (isPlaying) return;

        initAudioContext();
        clickCount++;

        // Update visual feedback
        if (clickCount <= 3) {
            clickDots[clickCount - 1].classList.add('active');
            alarmButton.classList.add('activating');
            setTimeout(() => alarmButton.classList.remove('activating'), 300);
        }

        // Update status text
        if (clickCount < 3) {
            statusText.textContent = `Naciśnij jeszcze ${3 - clickCount}x`;
        }

        // Clear existing timeout
        if (clickTimeout) {
            clearTimeout(clickTimeout);
        }

        // If 3 clicks reached, activate alarm
        if (clickCount >= 3) {
            statusText.textContent = 'Aktywacja alarmu...';
            setTimeout(() => {
                startAlarm();
            }, 500);
        } else {
            // Reset counter after 2 seconds of inactivity
            clickTimeout = setTimeout(() => {
                resetClickCounter();
                statusText.textContent = 'Gotowy do aktywacji';
            }, 2000);
        }
    }

    // Event listeners
    if (alarmButton) {
        alarmButton.addEventListener('click', handleAlarmButtonClick);
    }

    if (stopButton) {
        stopButton.addEventListener('click', stopAlarm);
    }

    // Cleanup when leaving the page
    window.addEventListener('beforeunload', () => {
        if (isPlaying) {
            stopAlarm();
        }
    });

    // Handle visibility change (stop alarm when page is hidden)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && isPlaying) {
            stopAlarm();
        }
    });

})();
