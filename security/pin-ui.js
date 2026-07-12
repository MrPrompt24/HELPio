/* security/pin-ui.js */

class PinUI {
    static init() {
        if (document.getElementById('pin-modal-overlay')) return;
        this._injectStyles();
        this._createModal();
    }

    static _injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .pin-overlay {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.85); z-index: 9999;
                display: flex; align-items: center; justify-content: center;
                backdrop-filter: blur(5px);
            }
            .pin-modal {
                background: #fff; padding: 24px; border-radius: 16px;
                width: 90%; max-width: 340px; text-align: center;
                box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                display: flex; flex-direction: column; align-items: center;
            }
            @keyframes popIn {
                from { opacity: 0; transform: scale(0.8); }
                to { opacity: 1; transform: scale(1); }
            }
            .pin-title { margin: 0 0 8px; color: #111827; font-size: 1.25rem; font-weight: 600; }
            .pin-desc { margin: 0 0 20px; color: #6b7280; font-size: 0.9rem; white-space: pre-wrap; }
            .pin-dots { display: flex; justify-content: center; gap: 12px; margin-bottom: 24px; }
            .pin-dot {
                width: 14px; height: 14px; border-radius: 50%;
                border: 2px solid #d1d5db; transition: all 0.2s;
            }
            .pin-dot.filled { background: #10b981; border-color: #10b981; transform: scale(1.1); }
            .pin-dot.error { border-color: #ef4444; background: #fee2e2; animation: shake 0.4s; }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }

            .pin-keypad {
                display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
                margin-bottom: 16px; width: 100%;
            }
            .pin-key {
                background: #f3f4f6; border: none; border-radius: 12px;
                height: 56px; font-size: 1.5rem; font-weight: 500; color: #374151;
                cursor: pointer; transition: background 0.1s;
                display: flex; align-items: center; justify-content: center;
            }
            .pin-key:active { background: #e5e7eb; transform: scale(0.95); }
            .pin-key.backspace { background: transparent; color: #6b7280; font-size: 1.2rem; }
            
            .pin-cancel {
                background: transparent; border: none; color: #6b7280;
                font-size: 0.9rem; margin-top: 8px; cursor: pointer;
                text-decoration: underline;
            }

            /* Generic Alert Buttons */
            .alert-btn-container {
                display: flex; gap: 10px; width: 100%; justify-content: center; margin-top: 10px;
            }
            .btn-primary-modal {
                background: #10b981; color: white; border: none; padding: 10px 20px;
                border-radius: 8px; font-weight: 600; cursor: pointer; flex: 1;
            }
            .btn-secondary-modal {
                background: #e5e7eb; color: #374151; border: none; padding: 10px 20px;
                border-radius: 8px; font-weight: 600; cursor: pointer; flex: 1;
            }
        `;
        document.head.appendChild(style);
    }

    static _createModal() {
        const overlay = document.createElement('div');
        overlay.id = 'pin-modal-overlay';
        overlay.className = 'pin-overlay';
        overlay.style.display = 'none';

        overlay.innerHTML = `
            <div class="pin-modal">
                <h3 aria-live="polite" class="pin-title" id="pin-title">Podaj PIN</h3>
                <p class="pin-desc" id="pin-desc">Wprowadź kod zabezpieczający</p>
                
                <div class="pin-dots" id="pin-dots">
                    <div class="pin-dot"></div><div class="pin-dot"></div>
                    <div class="pin-dot"></div><div class="pin-dot"></div>
                </div>

                <div class="pin-keypad" id="pin-keypad">
                    <button class="pin-key" data-val="1">1</button>
                    <button class="pin-key" data-val="2">2</button>
                    <button class="pin-key" data-val="3">3</button>
                    <button class="pin-key" data-val="4">4</button>
                    <button class="pin-key" data-val="5">5</button>
                    <button class="pin-key" data-val="6">6</button>
                    <button class="pin-key" data-val="7">7</button>
                    <button class="pin-key" data-val="8">8</button>
                    <button class="pin-key" data-val="9">9</button>
                    <div style="background:none;"></div>
                    <button class="pin-key" data-val="0">0</button>
                    <button class="pin-key backspace"><i class="fas fa-backspace"></i></button>
                </div>

                <div class="alert-btn-container" id="alert-btns" style="display:none;"></div>

                <button class="pin-cancel" id="pin-cancel-btn">Anuluj</button>
            </div>
        `;
        document.body.appendChild(overlay);

        // Bind Events
        overlay.querySelectorAll('.pin-key[data-val]').forEach(btn => {
            btn.addEventListener('click', (e) => this._handleInput(e.target.innerText));
        });
        overlay.querySelector('.backspace').addEventListener('click', () => this._handleBackspace());
        document.getElementById('pin-cancel-btn').addEventListener('click', () => this._handleCancel());
    }

    // --- State ---
    static _state = {
        mode: null, // 'VERIFY', 'SET_NEW', 'CHANGE', 'ALERT'
        step: 0,
        buffer: "",
        tempPin: null,
        resolve: null,
        reject: null
    };

    static _resetState() {
        this._state = { mode: null, step: 0, buffer: "", tempPin: null, resolve: null, reject: null };
        this._updateDots();
        document.getElementById('pin-keypad').style.display = 'grid';
        document.getElementById('pin-dots').style.display = 'flex';
        document.getElementById('alert-btns').style.display = 'none';
        document.getElementById('pin-cancel-btn').style.display = 'block';
    }

    // --- Public API ---

    static showVerify() {
        this.init();
        return new Promise((resolve, reject) => {
            this._resetState();
            this._state.mode = 'VERIFY';
            this._state.resolve = resolve;
            this._state.reject = reject;
            this._show("Weryfikacja", "Wprowadź swój PIN");
        });
    }

    static showSetNew() {
        this.init();
        return new Promise((resolve, reject) => {
            this._resetState();
            this._state.mode = 'SET_NEW';
            this._state.resolve = resolve;
            this._state.reject = reject;
            this._show("Ustaw PIN", "Wprowadź nowy 4-cyfrowy PIN");
        });
    }

    static showChange() {
        this.init();
        return new Promise((resolve, reject) => {
            this._resetState();
            this._state.mode = 'CHANGE';
            this._state.resolve = resolve;
            this._state.reject = reject;
            this._show("Zmiana PIN", "Podaj obecny PIN");
        });
    }

    static showAlert(title, message) {
        this.init();
        return new Promise((resolve) => {
            this._resetState();
            this._state.mode = 'ALERT';

            // Hide PIN specific UI
            document.getElementById('pin-keypad').style.display = 'none';
            document.getElementById('pin-dots').style.display = 'none';
            document.getElementById('pin-cancel-btn').style.display = 'none';

            const btnContainer = document.getElementById('alert-btns');
            btnContainer.style.display = 'flex';
            btnContainer.innerHTML = '';

            const okBtn = document.createElement('button');
            okBtn.className = 'btn-primary-modal';
            okBtn.innerText = 'OK';
            okBtn.onclick = () => {
                this._hide();
                resolve();
            };
            btnContainer.appendChild(okBtn);

            this._show(title, message);
        });
    }

    // --- Logic ---

    static _show(title, desc) {
        document.getElementById('pin-title').innerText = title;
        document.getElementById('pin-desc').innerText = desc;
        document.getElementById('pin-modal-overlay').style.display = 'flex';
        this._state.buffer = "";
        this._updateDots();
    }

    static _hide() {
        document.getElementById('pin-modal-overlay').style.display = 'none';
    }

    static _handleInput(char) {
        if (this._state.mode === 'ALERT') return;

        if (this._state.buffer.length < 4) {
            this._state.buffer += char;
            this._updateDots();

            if (this._state.buffer.length === 4) {
                setTimeout(() => this._submit(), 200);
            }
        }
    }

    static _handleBackspace() {
        this._state.buffer = this._state.buffer.slice(0, -1);
        this._updateDots();
    }

    static _handleCancel() {
        this._hide();
        if (this._state.reject) this._state.reject("Cancelled");
    }

    static _updateDots() {
        if (this._state.mode === 'ALERT') return;
        const len = this._state.buffer.length;
        document.querySelectorAll('.pin-dot').forEach((dot, idx) => {
            dot.classList.toggle('filled', idx < len);
            dot.classList.remove('error');
        });
    }

    static _showError(msg) {
        document.getElementById('pin-title').innerText = "Błąd";
        document.getElementById('pin-desc').innerText = msg;
        document.querySelectorAll('.pin-dot').forEach(d => d.classList.add('error'));
        this._state.buffer = "";
        setTimeout(() => {
            document.querySelectorAll('.pin-dot').forEach(d => d.classList.remove('error'));
            this._updateDots();
        }, 500);
    }

    static async _submit() {
        const pin = this._state.buffer;

        if (this._state.mode === 'VERIFY') {
            const isValid = await Security.verifyPIN(pin);
            if (isValid) {
                this._hide();
                this._state.resolve(pin);
            } else {
                this._showError("Błędny PIN. Spróbuj ponownie.");
            }

        } else if (this._state.mode === 'SET_NEW') {
            if (this._state.step === 0) {
                this._state.tempPin = pin;
                this._state.step = 1;
                this._state.buffer = "";
                this._show("Potwierdź", "Wprowadź PIN ponownie");
            } else {
                if (pin === this._state.tempPin) {
                    await Security.setPIN(pin);
                    this._hide();
                    this._state.resolve(pin);
                } else {
                    this._showError("PIN-y nie są zgodne. Ustaw nowy.");
                    this._state.step = 0;
                    this._state.tempPin = null;
                }
            }

        } else if (this._state.mode === 'CHANGE') {
            if (this._state.step === 0) {
                const isValid = await Security.verifyPIN(pin);
                if (isValid) {
                    this._state.step = 1;
                    this._state.buffer = "";
                    this._show("Nowy PIN", "Wprowadź nowy PIN");
                } else {
                    this._showError("Zły obecny PIN.");
                }
            } else if (this._state.step === 1) {
                this._state.tempPin = pin;
                this._state.step = 2;
                this._state.buffer = "";
                this._show("Potwierdź", "Potwierdź nowy PIN");
            } else {
                if (pin === this._state.tempPin) {
                    // Security.setPIN(pin); // <--- Removed: Caller handles specific logic if needed, or we do it here.
                    // IMPORTANT: setPIN updates the hash globally. If caller is just changing PIN, we should do it.
                    // The issue earlier was re-encryption.
                    // To be safe, we will call setPIN here, as this is "Security UI".
                    await Security.setPIN(pin);
                    this._hide();
                    this._state.resolve(pin);
                } else {
                    this._showError("Niezgodność. Wpisz nowy PIN ponownie.");
                    this._state.step = 1;
                    this._state.tempPin = null;
                }
            }
        }
    }
}
