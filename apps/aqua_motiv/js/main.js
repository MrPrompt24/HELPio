         class DafiCounter {
            constructor() {
                this.count = 0; // Aktualna liczba napełnień dla bieżącego filtra
                this.dailyCount = 0; // Liczba napełnień w danym dniu
                this.lastDailyResetDate = ''; // Data ostatniego resetu dziennego licznika

                this.storageKeys = {
                    count: 'dafi-v2-counter-current-fills',
                    dailyCount: 'dafi-v2-daily-fills',
                    filterCapacityL: 'dafi-v2-filter-capacity-l',
                    bottleCapacityMl: 'dafi-v2-bottle-capacity-ml',
                    alarmThreshold: 'dafi-v2-alarm-threshold',
                    userName: 'dafi-v2-user-name',
                    dailyLimitFills: 'dafi-v2-daily-limit-fills',
                    lastDailyResetDate: 'dafi-v2-last-daily-reset-date'
                };
                this.settings = {
                    userName: '',
                    filterCapacityL: 300,
                    bottleCapacityMl: 500,
                    alarmThreshold: 50,
                    dailyLimitFills: null
                };

                this.initializeElements();
                this.loadSettings();
                this.loadDailyCount();
                this.loadCount();
                this.checkDailyReset(); // Sprawdzanie i resetowanie dziennego licznika przy starcie
                this.attachEventListeners();
                this.updateDateTime();
                setInterval(() => this.updateDateTime(), 1000);
                this.checkFilterAlarmOnLoad();
            }

            initializeElements() {
                this.currentFilterFillsElement = document.getElementById('currentFilterFills');
                this.remainingFilterFillsElement = document.getElementById('remainingFilterFills');
                this.totalFilterCapacityFillsElement = document.getElementById('totalFilterCapacityFills');
                this.dailyFillsElement = document.getElementById('dailyFills');
                this.dailyLimitInfoElement = document.getElementById('dailyLimitInfo');

                this.addButton = document.getElementById('addButton');
                this.resetFullButton = document.getElementById('resetButton');
                this.resetDailyButton = document.getElementById('resetDailyButton');
                this.saveSettingsButton = document.getElementById('saveSettingsButton');
                this.settingsIconButton = document.getElementById('settingsIconButton');
                this.infoIconButton = document.getElementById('infoIconButton');

                this.userNameInput = document.getElementById('userName');
                this.filterCapacityLInput = document.getElementById('filterCapacityL');
                this.bottleCapacityMlInput = document.getElementById('bottleCapacityMl');
                this.dailyLimitFillsInput = document.getElementById('dailyLimitFills');
                this.alarmThresholdInput = document.getElementById('alarmThreshold');

                this.confirmModal = document.getElementById('confirmModal');
                this.resetFullModal = document.getElementById('resetFullModal');
                this.resetDailyModal = document.getElementById('resetDailyModal');
                this.alarmModal = document.getElementById('alarmModal');
                this.settingsSavedModal = document.getElementById('settingsSavedModal');

                this.confirmAdd = document.getElementById('confirmAdd');
                this.cancelAdd = document.getElementById('cancelAdd');
                this.confirmResetFull = document.getElementById('confirmResetFull');
                this.cancelResetFull = document.getElementById('cancelResetFull');
                this.confirmResetDaily = document.getElementById('confirmResetDaily');
                this.cancelResetDaily = document.getElementById('cancelResetDaily');
                this.closeAlarmModal = document.getElementById('closeAlarmModal');
                this.closeSettingsSavedModal = document.getElementById('closeSettingsSavedModal');
                this.alarmMessageElement = document.getElementById('alarmMessage');

                this.currentDateTimeElement = document.getElementById('currentDateTime');
                this.welcomeMessageHomeElement = document.getElementById('welcomeMessageHome');

                // Elements for statistics section
                this.statDailyFills = document.getElementById('statDailyFills');
                this.statCurrentFilterFills = document.getElementById('statCurrentFilterFills');
                this.statRemainingFilterFills = document.getElementById('statRemainingFilterFills');
                this.statTotalFilterCapacityFills = document.getElementById('statTotalFilterCapacityFills');
                this.statDailyLimit = document.getElementById('statDailyLimit');
                this.statAlarmThreshold = document.getElementById('statAlarmThreshold');
                this.rewardSection = document.getElementById('rewardSection');


                this.navLinks = document.querySelectorAll('.app-nav ul li a');
                this.sections = document.querySelectorAll('.app-section');
            }

            attachEventListeners() {
                this.addButton.addEventListener('click', () => this.showConfirmModal());
                this.resetFullButton.addEventListener('click', () => this.showResetFullModal());
                this.resetDailyButton.addEventListener('click', () => this.showResetDailyModal());
                this.saveSettingsButton.addEventListener('click', () => this.saveSettings());
                this.settingsIconButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.switchSection('settings-section');
                    this.navLinks.forEach(navLink => navLink.classList.remove('active'));
                });
                this.infoIconButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.switchSection('about-section');
                    this.navLinks.forEach(navLink => navLink.classList.remove('active'));
                });

                this.confirmAdd.addEventListener('click', () => this.addFill());
                this.cancelAdd.addEventListener('click', () => this.hideConfirmModal());

                this.confirmResetFull.addEventListener('click', () => this.resetAllCounters());
                this.cancelResetFull.addEventListener('click', () => this.hideResetFullModal());

                this.confirmResetDaily.addEventListener('click', () => this.resetDailyCounter());
                this.cancelResetDaily.addEventListener('click', () => this.hideResetDailyModal());

                this.closeAlarmModal.addEventListener('click', () => this.hideAlarmModal());
                this.closeSettingsSavedModal.addEventListener('click', () => this.hideSettingsSavedModal());

                this.confirmModal.addEventListener('click', (e) => { if (e.target === this.confirmModal) this.hideConfirmModal(); });
                this.resetFullModal.addEventListener('click', (e) => { if (e.target === this.resetFullModal) this.hideResetFullModal(); });
                this.resetDailyModal.addEventListener('click', (e) => { if (e.target === this.resetDailyModal) this.hideResetDailyModal(); });
                this.alarmModal.addEventListener('click', (e) => { if (e.target === this.alarmModal) this.hideAlarmModal(); });
                this.settingsSavedModal.addEventListener('click', (e) => { if (e.target === this.settingsSavedModal) this.hideSettingsSavedModal(); });

                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {
                        this.hideConfirmModal();
                        this.hideResetFullModal();
                        this.hideResetDailyModal();
                        this.hideAlarmModal();
                        this.hideSettingsSavedModal();
                    }
                });

                this.navLinks.forEach(link => {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        const targetSectionId = link.dataset.section + '-section';
                        this.switchSection(targetSectionId);
                        this.navLinks.forEach(navLink => navLink.classList.remove('active'));
                        link.classList.add('active');
                    });
                });
            }

            // --- Obsługa danych ---
            loadSettings() {
                for (const key in this.settings) {
                    const storedValue = localStorage.getItem(this.storageKeys[key]);
                    if (storedValue !== null) {
                        if (key === 'userName') {
                            this.settings[key] = storedValue;
                        } else if (key === 'dailyLimitFills') {
                            this.settings[key] = (storedValue === '' || storedValue === 'null') ? null : parseFloat(storedValue);
                        } else {
                            const parsedValue = parseFloat(storedValue);
                            if (!isNaN(parsedValue)) {
                                this.settings[key] = parsedValue;
                            }
                        }
                    }
                }
                this.userNameInput.value = this.settings.userName;
                this.filterCapacityLInput.value = this.settings.filterCapacityL;
                this.bottleCapacityMlInput.value = this.settings.bottleCapacityMl;
                this.dailyLimitFillsInput.value = this.settings.dailyLimitFills !== null ? this.settings.dailyLimitFills : '';
                this.alarmThresholdInput.value = this.settings.alarmThreshold;
                this.updateWelcomeMessage();
            }

            saveSettings() {
                this.settings.userName = this.userNameInput.value.trim();
                this.settings.filterCapacityL = parseFloat(this.filterCapacityLInput.value);
                this.settings.bottleCapacityMl = parseFloat(this.bottleCapacityMlInput.value);

                const dailyLimitValue = this.dailyLimitFillsInput.value.trim();
                this.settings.dailyLimitFills = dailyLimitValue === '' ? null : parseFloat(dailyLimitValue);

                this.settings.alarmThreshold = parseFloat(this.alarmThresholdInput.value);

                for (const key in this.settings) {
                     localStorage.setItem(this.storageKeys[key], this.settings[key] !== null ? this.settings[key].toString() : '');
                }
                this.updateAllDisplays();
                this.updateWelcomeMessage();
                this.showSettingsSavedModal();
            }

            loadCount() {
                const stored = localStorage.getItem(this.storageKeys.count);
                this.count = stored ? parseInt(stored) : 0;
                this.updateAllDisplays();
            }

            saveCount() {
                localStorage.setItem(this.storageKeys.count, this.count.toString());
            }

            loadDailyCount() {
                const storedDailyCount = localStorage.getItem(this.storageKeys.dailyCount);
                this.dailyCount = storedDailyCount ? parseInt(storedDailyCount) : 0;
                this.lastDailyResetDate = localStorage.getItem(this.storageKeys.lastDailyResetDate) || '';
                this.updateAllDisplays();
            }

            saveDailyCount() {
                localStorage.setItem(this.storageKeys.dailyCount, this.dailyCount.toString());
                localStorage.setItem(this.storageKeys.lastDailyResetDate, this.lastDailyResetDate);
            }

            getFormattedDate(date) {
                const year = date.getFullYear();
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const day = date.getDate().toString().padStart(2, '0');
                return `${year}-${month}-${day}`;
            }

            checkDailyReset() {
                const today = this.getFormattedDate(new Date());
                if (this.lastDailyResetDate !== today) {
                    this.dailyCount = 0;
                    this.lastDailyResetDate = today;
                    this.saveDailyCount();
                    this.updateAllDisplays();
                }
            }

            // --- Obliczenia ---
            getTotalFilterCapacityInFills() {
                if (this.settings.bottleCapacityMl <= 0) return 0;
                return Math.floor((this.settings.filterCapacityL * 1000) / this.settings.bottleCapacityMl);
            }

            getRemainingFilterFills() {
                const totalFills = this.getTotalFilterCapacityInFills();
                return Math.max(0, totalFills - this.count);
            }

            // --- Aktualizacja UI ---
            updateAllDisplays() {
                this.dailyFillsElement.textContent = this.dailyCount;
                this.currentFilterFillsElement.textContent = this.count;
                this.remainingFilterFillsElement.textContent = this.getRemainingFilterFills();
                this.totalFilterCapacityFillsElement.textContent = this.getTotalFilterCapacityInFills();

                const dailyLimit = this.settings.dailyLimitFills;
                if (dailyLimit !== null && dailyLimit > 0) {
                    const dailyVolumeDrank = (this.dailyCount * this.settings.bottleCapacityMl / 1000).toFixed(1);
                    const dailyVolumeLimit = (dailyLimit * this.settings.bottleCapacityMl / 1000).toFixed(1);
                    let infoHtml = `Limit: ${dailyVolumeDrank}L/${dailyVolumeLimit}L<br>`;

                    if (this.dailyCount >= dailyLimit) {
                        const overflowFills = this.dailyCount - dailyLimit;
                        infoHtml += `<span class="overflow">Osiągnięto! (${overflowFills} nadwyżki)</span>`;
                    } else {
                        const remainingDailyFills = dailyLimit - this.dailyCount;
                        infoHtml += `Pozostało: <span class="exceeded">${remainingDailyFills} but.</span>`;
                    }

                    this.dailyLimitInfoElement.innerHTML = infoHtml;
                    this.dailyLimitInfoElement.classList.add('visible');
                } else {
                    this.dailyLimitInfoElement.textContent = '';
                    this.dailyLimitInfoElement.classList.remove('visible');
                }
                this.updateWelcomeMessage(); // Update welcome message on home screen
                this.updateStatisticsContent(); // Ensure statistics are updated
            }

            updateDateTime() {
                const now = new Date();
                const optionsDate = { month: 'short', day: 'numeric' };
                const optionsDay = { weekday: 'short' };
                const optionsTime = { hour: '2-digit', minute: '2-digit' };

                const day = now.toLocaleDateString('pl-PL', optionsDay);
                const date = now.toLocaleDateString('pl-PL', optionsDate);
                const time = now.toLocaleTimeString('pl-PL', optionsTime);

                this.currentDateTimeElement.textContent = `${day}, ${date} ${time}`;
            }

            updateWelcomeMessage() {
                const name = this.settings.userName;
                if (name) {
                    this.welcomeMessageHomeElement.textContent = `Witaj ${name}! Miłego Dnia!`;
                } else {
                    this.welcomeMessageHomeElement.textContent = 'Witaj! Miłego Dnia!';
                }
            }

            updateStatisticsContent() {
                // Update elements in current stats card
                this.statDailyFills.textContent = this.dailyCount;
                this.statCurrentFilterFills.textContent = this.count;
                this.statRemainingFilterFills.textContent = this.getRemainingFilterFills();
                this.statTotalFilterCapacityFills.textContent = this.getTotalFilterCapacityInFills();
                this.statAlarmThreshold.textContent = this.settings.alarmThreshold;

                const dailyLimit = this.settings.dailyLimitFills;
                if (dailyLimit !== null) {
                    this.statDailyLimit.textContent = `${dailyLimit} napełnień (${(dailyLimit * this.settings.bottleCapacityMl / 1000).toFixed(1)} L)`;
                } else {
                    this.statDailyLimit.textContent = 'Brak ustawionego limitu.';
                }
                this.updateRewardSection();
            }

            updateRewardSection() {
                const dailyLimit = this.settings.dailyLimitFills;
                let rewardHtml = '';

                if (dailyLimit !== null && dailyLimit > 0) {
                    if (this.dailyCount >= dailyLimit) {
                        rewardHtml = `
                            <i class="fas fa-trophy reward-icon"></i>
                            <h3 class="reward-title">Gratulacje!</h3>
                            <p class="reward-message">Osiągnąłeś swój dzienny cel nawodnienia! Jesteś na dobrej drodze do zdrowia. Twoje ciało Ci dziękuje!</p>
                        `;
                        this.rewardSection.classList.remove('not-achieved');
                    } else {
                        const remaining = dailyLimit - this.dailyCount;
                        rewardHtml = `
                            <i class="fas fa-glass-whiskey reward-icon"></i>
                            <h3 class="reward-title">Pamiętaj o nawodnieniu!</h3>
                            <p class="reward-message">Jeszcze ${remaining} napełnień do Twojego dziennego celu. Pamiętaj, każda kropla się liczy!</p>
                        `;
                        this.rewardSection.classList.add('not-achieved');
                    }
                } else {
                    rewardHtml = `
                        <i class="fas fa-info-circle reward-icon"></i>
                        <h3 class="reward-title">Ustaw swój cel!</h3>
                        <p class="reward-message">Ustaw dzienny limit napełnień w <a href="#settings" data-section="settings" id="rewardSettingsLink">Ustawieniach</a>, aby śledzić postępy i otrzymywać motywacyjne komunikaty!</p>
                    `;
                    this.rewardSection.classList.remove('not-achieved'); // Reset style if no limit
                    // Add event listener for the link
                    this.rewardSection.innerHTML = rewardHtml; // Set HTML first
                    const rewardSettingsLink = document.getElementById('rewardSettingsLink');
                    if(rewardSettingsLink) {
                        rewardSettingsLink.addEventListener('click', (e) => {
                            e.preventDefault();
                            this.switchSection('settings-section');
                            this.navLinks.forEach(navLink => navLink.classList.remove('active'));
                        });
                    }
                    return; // Exit function after setting neutral message
                }
                this.rewardSection.innerHTML = rewardHtml;
            }


            // --- Obsługa Modali ---
            showConfirmModal() {
                this.confirmModal.classList.add('show');
                document.body.style.overflow = 'hidden';
            }

            hideConfirmModal() {
                this.confirmModal.classList.remove('show');
                document.body.style.overflow = 'auto';
            }

            showResetFullModal() {
                this.resetFullModal.classList.add('show');
                document.body.style.overflow = 'hidden';
            }

            hideResetFullModal() {
                this.resetFullModal.classList.remove('show');
                document.body.style.overflow = 'auto';
            }

            showResetDailyModal() {
                this.resetDailyModal.classList.add('show');
                document.body.style.overflow = 'hidden';
            }

            hideResetDailyModal() {
                this.resetDailyModal.classList.remove('show');
                document.body.style.overflow = 'auto';
            }

            showAlarmModal(message) {
                this.alarmMessageElement.textContent = message;
                this.alarmModal.classList.add('show');
                document.body.style.overflow = 'hidden';
            }

            hideAlarmModal() {
                this.alarmModal.classList.remove('show');
                document.body.style.overflow = 'auto';
            }

            showSettingsSavedModal() {
                this.settingsSavedModal.classList.add('show');
                document.body.style.overflow = 'hidden';
            }

            hideSettingsSavedModal() {
                this.settingsSavedModal.classList.remove('show');
                document.body.style.overflow = 'auto';
            }

            // --- Funkcje główne ---
            addFill() {
                this.count++;
                this.dailyCount++;
                this.saveCount();
                this.saveDailyCount();
                this.updateAllDisplays();
                this.hideConfirmModal();
                this.checkFilterAlarm();

                this.addButton.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.addButton.style.transform = '';
                }, 150);
            }

            resetAllCounters() {
                this.count = 0;
                this.dailyCount = 0;
                this.lastDailyResetDate = this.getFormattedDate(new Date()); // Reset date to today
                this.saveCount();
                this.saveDailyCount();
                this.updateAllDisplays();
                this.hideResetFullModal();

                this.currentFilterFillsElement.style.color = 'var(--danger-color)';
                this.dailyFillsElement.style.color = 'var(--danger-color)';
                this.remainingFilterFillsElement.style.color = 'var(--danger-color)';
                this.totalFilterCapacityFillsElement.style.color = 'var(--danger-color)';

                setTimeout(() => {
                    this.currentFilterFillsElement.style.color = 'var(--primary-color)';
                    this.dailyFillsElement.style.color = 'var(--primary-color)';
                    this.remainingFilterFillsElement.style.color = 'var(--primary-color)';
                    this.totalFilterCapacityFillsElement.style.color = 'var(--primary-color)';
                }, 500);
            }

            resetDailyCounter() {
                const today = this.getFormattedDate(new Date());
                this.dailyCount = 0;
                this.lastDailyResetDate = today; // Update last reset date to today
                this.saveDailyCount();
                this.updateAllDisplays();
                this.hideResetDailyModal();

                this.dailyFillsElement.style.color = 'var(--danger-color)';
                setTimeout(() => {
                    this.dailyFillsElement.style.color = 'var(--primary-color)';
                }, 500);
            }

            checkFilterAlarm() {
                const remainingFills = this.getRemainingFilterFills();
                const alarmThreshold = this.settings.alarmThreshold;

                if (remainingFills <= alarmThreshold && remainingFills >= 0) {
                    let message;
                    if (remainingFills === 0) {
                        message = `Filtr wymaga wymiany! Osiągnięto limit napełnień (${this.getTotalFilterCapacityInFills()}).`;
                    } else if (remainingFills === 1) {
                        message = `Filtr wymaga wymiany! Pozostało tylko ${remainingFills} napełnienie.`;
                    } else if (remainingFills > 1 && remainingFills <= 5) {
                         message = `Filtr wymaga wymiany! Pozostały tylko ${remainingFills} napełnienia.`;
                    }
                    else {
                        message = `Pamiętaj o wymianie filtra! Pozostało ${remainingFills} napełnień.`;
                    }
                    this.showAlarmModal(message);
                }
            }

            checkFilterAlarmOnLoad() {
                if (document.getElementById('home-section').classList.contains('active') && !this.alarmModal.classList.contains('show')) {
                    this.checkFilterAlarm();
                }
            }

            switchSection(targetSectionId) {
                this.sections.forEach(section => {
                    if (section.id === targetSectionId) {
                        section.classList.add('active');
                        if (targetSectionId === 'home-section') {
                            this.checkFilterAlarmOnLoad();
                            this.updateWelcomeMessage();
                        } else if (targetSectionId === 'statistics-section') {
                            this.updateStatisticsContent(); // Update statistics content when navigating to it
                        }
                    } else {
                        section.classList.remove('active');
                    }
                });
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            new DafiCounter();
        });

        window.addEventListener('online', () => {
            console.log('Aplikacja online');
        });

        window.addEventListener('offline', () => {
            console.log('Aplikacja offline - dane zapisywane lokalnie');
        });