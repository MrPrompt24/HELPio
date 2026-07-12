/**
 * Notatnik Kryzysowy (Crisis Notebook) - App Logic
 * Handles IndexedDB, Encryption, and UI interactions.
 */

// --- Constants ---
const DB_NAME = 'CrisisNotebookDB';
const DB_VERSION = 1;
const STORE_NAME = 'notes';

// --- State ---
const state = {
    db: null,
    keyObject: null, // CryptoKey if encryption is enabled
    isEncrypted: false,
    notes: [],
    view: 'list' // list, editor, settings
};

// --- DOM Elements ---
const el = {
    app: document.getElementById('app'),
    views: {
        list: document.getElementById('view-list'),
        editor: document.getElementById('view-editor'),
        settings: document.getElementById('view-settings')
    },
    notesContainer: document.getElementById('notes-container'),
    noteForm: document.getElementById('note-form'),
    searchInput: document.getElementById('search-input'),
    emotionFilter: document.getElementById('emotion-filter'),
    emotionSelector: document.getElementById('emotion-selector'),
    addBtn: document.getElementById('btn-add-note'),
    settingsBtn: document.getElementById('btn-settings'),
    saveBtn: document.getElementById('btn-save-note'),
    backBtns: document.querySelectorAll('.icon-btn i.fa-arrow-left'),
    
    // Auth
    authModal: document.getElementById('auth-modal'),
    authPassword: document.getElementById('auth-password'),
    unlockBtn: document.getElementById('btn-unlock'),
    authError: document.getElementById('auth-error'),

    // Settings
    encryptionStatus: document.getElementById('encryption-status'),
    encryptionPassword: document.getElementById('encryption-password'),
    enableEncryptionBtn: document.getElementById('btn-enable-encryption'),
    decryptDataBtn: document.getElementById('btn-decrypt-data'),
    exportBtn: document.getElementById('btn-export'),
    clearDataBtn: document.getElementById('btn-clear-data')
};

// --- Initialization ---
async function init() {
    console.log('Initializing Notatnik Kryzysowy...');
    
    // Check if encryption is configured in localStorage
    const encryptionConfig = localStorage.getItem('crisis_notebook_encryption');
    
    if (encryptionConfig) {
        state.isEncrypted = true;
        showAuthModal();
    } else {
        await openDB();
        loadNotes();
    }

    setupEventListeners();
}

// --- IndexedDB ---
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error("IndexedDB error:", event.target.error);
            reject(event.target.error);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };

        request.onsuccess = (event) => {
            state.db = event.target.result;
            resolve(state.db);
        };
    });
}

function saveNoteToDB(note) {
    return new Promise((resolve, reject) => {
        const transaction = state.db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(note);

        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e);
    });
}

function getAllNotesFromDB() {
    return new Promise((resolve, reject) => {
        const transaction = state.db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e);
    });
}

function clearDB() {
    return new Promise((resolve, reject) => {
        const transaction = state.db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();
        request.onsuccess = () => resolve();
    });
}

// --- Encryption (PBKDF2 + AES-GCM) ---

async function deriveKey(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );
    
    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false, // Key not extractable
        ["encrypt", "decrypt"]
    );
}

async function encryptData(dataObject, key) {
    const enc = new TextEncoder();
    const encoded = enc.encode(JSON.stringify(dataObject));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        encoded
    );

    return {
        iv: Array.from(iv),
        data: Array.from(new Uint8Array(encrypted)) // Store as regular arrays for JSON serialization
    };
}

async function decryptData(encryptedObject, key) {
    const iv = new Uint8Array(encryptedObject.iv);
    const data = new Uint8Array(encryptedObject.data);

    try {
        const decrypted = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: iv },
            key,
            data
        );
        const dec = new TextDecoder();
        return JSON.parse(dec.decode(decrypted));
    } catch (e) {
        console.error("Decryption failed", e);
        return null; // Incorrect password or corrupted data
    }
}

// --- Logic ---

async function loadNotes() {
    let rawNotes = await getAllNotesFromDB();
    
    if (state.isEncrypted) {
        // Decrypt notes
        const decryptedNotes = [];
        for (const note of rawNotes) {
            if (note.encryptedPayload) {
                const decryptedContent = await decryptData(note.encryptedPayload, state.keyObject);
                if (decryptedContent) {
                    decryptedNotes.push({
                        id: note.id,
                        date: note.date, // Date is kept unencrypted for sorting usually, but here we can check
                        ...decryptedContent
                    });
                }
            } else {
                // Legacy or plain notes mixed? Keep them as is if not encrypted
                decryptedNotes.push(note);
            }
        }
        state.notes = decryptedNotes;
    } else {
        state.notes = rawNotes;
    }

    // Sort by date desc
    state.notes.sort((a, b) => new Date(b.date) - new Date(a.date));
    renderNotes();
}

function renderNotes() {
    el.notesContainer.innerHTML = '';
    
    const searchTerm = el.searchInput.value.toLowerCase();
    const emotionFilter = el.emotionFilter.value;

    const filtered = state.notes.filter(note => {
        const matchesSearch = (note.desc || '').toLowerCase().includes(searchTerm) || 
                              (note.actions || '').toLowerCase().includes(searchTerm);
        const matchesEmotion = emotionFilter ? note.emotion === emotionFilter : true;
        return matchesSearch && matchesEmotion;
    });

    if (filtered.length === 0) {
        el.notesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <p>Nie znaleziono notatek.</p>
            </div>
        `;
        return;
    }

    filtered.forEach(note => {
        const dateObj = new Date(note.date);
        const dateStr = dateObj.toLocaleString('pl-PL', { 
            day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' 
        });

        const card = document.createElement('div');
        card.className = 'note-card';
        card.innerHTML = `
            <div class="note-header">
                <span class="note-date">${dateStr}</span>
                <span class="rating-badge"><i class="fas fa-star" style="color:var(--accent-yellow)"></i> ${note.rating || '-'}</span>
            </div>
            <div class="note-emotion">${getEmotionEmoji(note.emotion)} ${note.emotion}</div>
            <div class="note-preview">${note.desc || 'Brak opisu...'}</div>
        `;
        card.onclick = () => openEditor(note.id);
        el.notesContainer.appendChild(card);
    });
}

function getEmotionEmoji(emotion) {
    const map = {
        'lęk': '😟', 'złość': '😠', 'smutek': '😢', 
        'stres': '😫', 'radość': '🙂', 'inne': '😐'
    };
    return map[emotion] || '😐';
}

function openEditor(noteId = null) {
    switchView('editor');
    el.noteForm.reset();
    document.querySelectorAll('.emotion-chip').forEach(b => b.classList.remove('selected'));
    document.getElementById('note-id').value = '';
    
    // Set default date
    const now = new Date();
    // input datetime-local needs YYYY-MM-DDTHH:mm
    const nowStr = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    document.getElementById('note-date').value = nowStr;

    if (noteId) {
        const note = state.notes.find(n => n.id === noteId);
        if (note) {
            document.getElementById('note-id').value = note.id;
            document.getElementById('note-date').value = note.date; // already ISOish stored?
            document.getElementById('note-desc').value = note.desc;
            document.getElementById('note-actions').value = note.actions;
            document.getElementById('note-rating').value = note.rating;
            selectEmotion(note.emotion);
            document.getElementById('editor-title').innerText = 'Edycja wpisu';
        }
    } else {
        document.getElementById('editor-title').innerText = 'Nowy wpis';
    }
}

async function saveNote() {
    const id = document.getElementById('note-id').value || crypto.randomUUID();
    const date = document.getElementById('note-date').value;
    const emotion = document.getElementById('note-emotion').value;
    const desc = document.getElementById('note-desc').value;
    const actions = document.getElementById('note-actions').value;
    const rating = document.getElementById('note-rating').value;

    if (!emotion) {
        alert('Wybierz emocję!');
        return;
    }

    const noteData = { id, date, emotion, desc, actions, rating };

    let recordToSave;
    if (state.isEncrypted) {
        // Encrypt the sensitive content
        const encryptedPayload = await encryptData(noteData, state.keyObject);
        // We might keep date unencrypted for indexing, but privacy first?
        // Let's keep ID unencrypted as key.
        recordToSave = {
            id: id,
            date: date, // Keep date plain for now for simplicity of sorting logic without full decrypt load? 
                        // Actually, sorting usually done after load. Let's keep date for lighter metadata if needed.
                        // Or encrypt everything. Let's encrypt the payload.
            encryptedPayload: encryptedPayload
        };
    } else {
        recordToSave = noteData;
    }

    await saveNoteToDB(recordToSave);
    await loadNotes(); // Reload
    switchView('list');
}

// --- UI Interaction ---

function switchView(viewName) {
    state.view = viewName;
    Object.values(el.views).forEach(v => v.classList.remove('active'));
    el.views[viewName].classList.add('active');
}

function selectEmotion(val) {
    document.querySelectorAll('.emotion-chip').forEach(b => {
        if (b.dataset.value === val) b.classList.add('selected');
        else b.classList.remove('selected');
    });
    document.getElementById('note-emotion').value = val;
}

function showAuthModal() {
    el.authModal.classList.remove('hidden');
    el.authPassword.focus();
}

async function handleUnlock() {
    const pwd = el.authPassword.value;
    if (!pwd) return;

    try {
        const config = JSON.parse(localStorage.getItem('crisis_notebook_encryption'));
        // Re-derive key
        const salt = new Uint8Array(config.salt);
        const key = await deriveKey(pwd, salt);
        
        // Test key with a known check string or simply try to load?
        // Let's use a "check" value stored in config.
        const decryptedCheck = await decryptData(config.check, key);
        
        if (decryptedCheck && decryptedCheck.valid === true) {
            state.keyObject = key;
            el.authModal.classList.add('hidden');
            await openDB();
            loadNotes();
            updateSettingsUI();
        } else {
            throw new Error('Invalid password');
        }
    } catch (e) {
        console.error(e);
        el.authError.innerText = 'Błędne hasło';
        el.authPassword.value = '';
    }
}

async function enableEncryption() {
    const pwd = el.encryptionPassword.value;
    if (!pwd) {
        alert('Podaj hasło!');
        return;
    }

    if (!confirm('UWAGA: Jeśli zapomnisz hasła, stracisz dostęp do WSZYSTKICH notatek. Kontynuować?')) return;

    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const key = await deriveKey(pwd, salt);
    
    // Create a check object to verify password later
    const checkObj = { valid: true };
    const encryptedCheck = await encryptData(checkObj, key);

    localStorage.setItem('crisis_notebook_encryption', JSON.stringify({
        salt: Array.from(salt),
        check: encryptedCheck
    }));

    state.isEncrypted = true;
    state.keyObject = key;

    // Encrypt existing notes
    // 1. Get all plain notes
    // Note: this function assumes we are currently in plain mode and have loaded notes in state.notes
    const plainNotes = state.notes; // These are currently plain
    
    // 2. Clear DB and save as encrypted
    const transaction = state.db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // We can't use helper saveNoteToDB easily in loop with transaction reuse, better do manual loop
    for (const note of plainNotes) {
        const encryptedPayload = await encryptData(note, key);
        store.put({
            id: note.id,
            date: note.date,
            encryptedPayload: encryptedPayload
        });
    }

    alert('Szyfrowanie włączone!');
    el.encryptionPassword.value = '';
    updateSettingsUI();
    loadNotes(); // Reload to ensure state is consistent
}

async function disableEncryption() {
   if (!confirm('Czy na pewno chcesz wyłączyć szyfrowanie? Notatki będą zapisane jawnym tekstem.')) return;
   
   // 1. Decrypt all notes using current key and save as plain
   // state.notes currently holds the DECRYPTED objects because loadNotes handles it.
   const decryptedNotes = state.notes;

   const transaction = state.db.transaction([STORE_NAME], 'readwrite');
   const store = transaction.objectStore(STORE_NAME);

   for (const note of decryptedNotes) {
       // Save pure note data without wrapper
       store.put(note);
   }

   // 2. Remove localStorage config
   localStorage.removeItem('crisis_notebook_encryption');
   state.isEncrypted = false;
   state.keyObject = null;

   alert('Szyfrowanie wyłączone.');
   updateSettingsUI();
}

function updateSettingsUI() {
    if (state.isEncrypted) {
        el.encryptionStatus.innerHTML = 'Stan: <strong style="color:var(--accent-green)">Zabezpieczone</strong>';
        el.enableEncryptionBtn.classList.add('hidden');
        el.decryptDataBtn.classList.remove('hidden');
        document.querySelector('.setting-card .form-group').classList.add('hidden'); // hide password input
    } else {
        el.encryptionStatus.innerHTML = 'Stan: <strong>Niezaszyfrowane</strong>';
        el.enableEncryptionBtn.classList.remove('hidden');
        el.decryptDataBtn.classList.add('hidden');
        document.querySelector('.setting-card .form-group').classList.remove('hidden');
    }
}

// --- Event Listeners ---
function setupEventListeners() {
    // Navigation
    el.addBtn.onclick = () => openEditor();
    el.settingsBtn.onclick = () => { switchView('settings'); updateSettingsUI(); };
    el.backBtns.forEach(btn => btn.parentElement.onclick = () => switchView('list'));

    // Editor
    el.emotionSelector.addEventListener('click', (e) => {
        if (e.target.classList.contains('emotion-chip')) {
            selectEmotion(e.target.dataset.value);
        }
    });

    el.saveBtn.onclick = saveNote;

    // Filters
    el.searchInput.oninput = renderNotes;
    el.emotionFilter.onchange = renderNotes;

    // Settings
    el.enableEncryptionBtn.onclick = enableEncryption;
    el.decryptDataBtn.onclick = disableEncryption;
    el.clearDataBtn.onclick = async () => {
        if (confirm('Czy na pewno chcesz usunąć WSZYSTKIE notatki?')) {
            await clearDB();
            state.notes = [];
            renderNotes();
            alert('Wyczyszczono.');
        }
    };
    
    el.exportBtn.onclick = () => {
        const dataStr = JSON.stringify(state.notes, null, 2);
        const blob = new Blob([dataStr], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `notatnik_kryzysowy_backup_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
    };

    // Auth
    el.unlockBtn.onclick = handleUnlock;
}

// Start
document.addEventListener('DOMContentLoaded', init);
