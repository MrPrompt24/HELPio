/* eksport-import.js */

// Global access for HTML inline event handlers
window.exportDB = exportDB;
window.importDB = importDB;
window.handleFileSelect = handleFileSelect;

// Status Log Reference
let statusLog = null;

document.addEventListener('DOMContentLoaded', async () => {
    statusLog = document.getElementById('statusLog');

    // Security Check
    try {
        const hasPin = await Security.hasPIN();
        const container = document.querySelector('.ei-container');

        if (hasPin) {
            try {
                // Prompt for PIN
                await PinUI.showVerify();
                // If success (no error thrown), show content
                if (container) container.style.display = 'block';
                log('Gotowy do pracy...', 'normal');
            } catch (e) {
                // Cancelled or failed
                console.warn('PIN verification failed or cancelled:', e);
                window.location.href = '../../index.html'; // Redirect back
                return;
            }
        } else {
            // No PIN set, allow access (or could prompt to set one, but for now allow)
            if (container) container.style.display = 'block';
            log('Gotowy do pracy... (Brak ustawionego PIN)', 'normal');
        }
    } catch (err) {
        console.error("Security Init Error:", err);
        // Fallback: show content or block? Safe to block if error.
        alert("Błąd inicjalizacji zabezpieczeń.");
        window.location.href = '../../index.html';
    }
});

// --- HELPER FUNCTIONS ---

function log(message, type = 'normal') {
    if (!statusLog) return;
    const div = document.createElement('div');
    div.classList.add('log-entry');
    if (type === 'error') div.classList.add('log-error');
    if (type === 'success') div.classList.add('log-success');
    div.textContent = `> ${message}`;
    statusLog.appendChild(div);
    statusLog.scrollTop = statusLog.scrollHeight;
}

function handleFileSelect(dbName) {
    const fileInput = document.getElementById(`import_${dbName}`);
    const fileNameDisplay = document.getElementById(`file_name_${dbName}`);
    const importBtn = document.getElementById(`btn_import_${dbName}`);

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        fileNameDisplay.textContent = file.name;
        importBtn.disabled = false;
        log(`Wybrano plik dla ${dbName}: ${file.name}`);
    } else {
        fileNameDisplay.textContent = '';
        importBtn.disabled = true;
    }
}

// --- EXPORT FUNCTION ---

async function exportDB(dbName) {
    log(`Rozpoczynanie eksportu bazy: ${dbName}...`, 'normal');

    try {
        const data = await readDatabase(dbName);

        if (!data || Object.keys(data).length === 0) {
            log(`[-] Baza ${dbName} jest pusta lub nie istnieje.`, 'error');
            return;
        }

        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `Backup_${dbName}_${timestamp}.json`;

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        log(`[OK] Wyeksportowano ${dbName} do pliku ${filename}`, 'success');

    } catch (error) {
        log(`[!] Błąd eksportu ${dbName}: ${error.message}`, 'error');
        console.error(error);
    }
}

// --- IMPORT FUNCTION ---

async function importDB(dbName) {
    const fileInput = document.getElementById(`import_${dbName}`);
    const importBtn = document.getElementById(`btn_import_${dbName}`);

    if (!fileInput.files.length) return;

    if (!confirm(`UWAGA! Importowanie danych do ${dbName} może nadpisać istniejące wpisy. Kontynuować?`)) {
        return;
    }

    importBtn.disabled = true;
    importBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
        try {
            const data = JSON.parse(e.target.result);
            log(`Parsowanie pliku dla ${dbName}...`, 'normal');

            await writeDatabase(dbName, data);

            log(`[OK] Import do ${dbName} zakończony sukcesem!`, 'success');
            alert(`Dane do ${dbName} zostały zaimportowane poprawnie.`);

            // Clear input
            fileInput.value = '';
            document.getElementById(`file_name_${dbName}`).textContent = '';

        } catch (error) {
            log(`[!] Błąd importu ${dbName}: ${error.message}`, 'error');
            console.error(error);
            alert(`Błąd: ${error.message}`);
        } finally {
            importBtn.disabled = true; // wait for new file selection
            importBtn.innerHTML = '<i class="fas fa-upload"></i> Importuj';
        }
    };

    reader.readAsText(file);
}

// --- INDEXED DB LOW LEVEL ---

function readDatabase(dbName) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName);

        request.onerror = () => {
            console.warn(`Could not open DB ${dbName}`);
            resolve(null);
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            const objectStoreNames = Array.from(db.objectStoreNames);

            if (objectStoreNames.length === 0) {
                db.close();
                resolve(null);
                return;
            }

            const transaction = db.transaction(objectStoreNames, 'readonly');
            const exportData = {};
            let completed = 0;

            objectStoreNames.forEach(storeName => {
                const store = transaction.objectStore(storeName);
                // Use cursor to get both key and value
                const req = store.openCursor();
                const items = [];

                req.onsuccess = (e) => {
                    const cursor = e.target.result;
                    if (cursor) {
                        // Store primitive values as is, objects as objects
                        // We wrap them to preserve the key: { key: ..., value: ... }
                        items.push({ key: cursor.key, value: cursor.value });
                        cursor.continue();
                    } else {
                        // Cursor finished
                        exportData[storeName] = items;
                        completed++;
                        if (completed === objectStoreNames.length) {
                            db.close();
                            resolve(exportData);
                        }
                    }
                };

                req.onerror = (e) => {
                    console.error(e);
                    reject(e);
                };
            });
        };
    });
}

function writeDatabase(dbName, data) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName);

        request.onsuccess = (event) => {
            const db = event.target.result;
            const storeNames = Object.keys(data);

            // Validate stores exist
            const validStores = storeNames.filter(name => db.objectStoreNames.contains(name));

            if (validStores.length === 0) {
                db.close();
                reject(new Error("Brak pasujących magazynów danych (Object Stores) w bazie. Plik może być nieprawidłowy lub baza pusta."));
                return;
            }

            const transaction = db.transaction(validStores, 'readwrite');

            transaction.oncomplete = () => {
                db.close();
                resolve();
            };

            transaction.onerror = (e) => reject(e.target.error);

            validStores.forEach(storeName => {
                const store = transaction.objectStore(storeName);
                const items = data[storeName];

                if (Array.isArray(items)) {
                    items.forEach(item => {
                        // Check if item matches new format { key: ..., value: ... }
                        // Basic heuristic: is object, has 'key' and 'value' props?
                        // But value could be anything.
                        // Let's assume if we exported it, it has this shape. 
                        // Backward compatibility: Old exports were just arrays of values (or objects).

                        let key = undefined;
                        let value = item;

                        // Check for new format structure
                        if (item && typeof item === 'object' && item.hasOwnProperty('key') && item.hasOwnProperty('value') && Object.keys(item).length === 2) {
                            key = item.key;
                            value = item.value;
                        }

                        try {
                            // If store has keyPath (in-line keys)
                            if (store.keyPath) {
                                // Put uses the keyPath from the value
                                store.put(value);
                            } else {
                                // OOP Key (Out-of-line)
                                if (key !== undefined) {
                                    store.put(value, key);
                                } else {
                                    // Legacy fallback
                                    // Problem: If it was ICE Card (HelpKartaICEio), it needs "main" key.
                                    if (dbName === 'HelpKartaICEio' && storeName === 'ice_data') {
                                        store.put(value, "main");
                                    } else {
                                        // Try put without key (autoIncrement or error if key needed)
                                        store.put(value);
                                    }
                                }
                            }
                        } catch (err) {
                            console.warn(`Failed to put item into ${storeName}:`, err);
                        }
                    });
                }
            });
        };

        request.onerror = (e) => reject(e.target.error);
    });
}
