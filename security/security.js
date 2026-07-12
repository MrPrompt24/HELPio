/*
    HELPio Security Module
    - Manages Encryption (AES-GCM)
    - Manages IndexedDB (HelpKartaICEio)
    - Manages PIN (PBKDF2 hash verification)
*/

const DB_NAME = 'HelpKartaICEio';
const DB_VERSION = 1;
const STORE_NAME = 'ice_data';

class Security {
    
    // --- Public API ---

    /**
     * Checks if a PIN is set in the system.
     * @returns {Promise<boolean>}
     */
    static async hasPIN() {
        const data = await this._getDBData();
        return !!(data && data.salt && data.pinHash);
    }

    /**
     * Set a new PIN.
     * Use this for initial setup or changing PIN.
     * If data exists, it should be re-encrypted with the new PIN (logic to be handled by caller usually, but basic setup here).
     * @param {string} pin 
     */
    static async setPIN(pin) {
        // 1. Generate new Salt
        const salt = window.crypto.getRandomValues(new Uint8Array(16));
        
        // 2. Hash PIN for storage (verification)
        const pinHash = await this._hashPIN(pin, salt);

        // 3. Save to DB (preserve existing data if any, or init new)
        let data = await this._getDBData() || {};
        data.salt = this._bufferToHex(salt);
        data.pinHash = this._bufferToHex(pinHash);
        
        // If we are just setting PIN without data, ensure structure exists
        if (!data.rescueData) data.rescueData = {}; 

        await this._saveDBData(data);
        console.log("PIN set successfully.");
    }

    /**
     * Verify if the provided PIN is correct.
     * @param {string} pin 
     * @returns {Promise<boolean>}
     */
    static async verifyPIN(pin) {
        const data = await this._getDBData();
        if (!data || !data.salt || !data.pinHash) return false;

        const salt = this._hexToBuffer(data.salt);
        const storedHash = data.pinHash;
        
        const inputHashBuffer = await this._hashPIN(pin, salt);
        const inputHash = this._bufferToHex(inputHashBuffer);

        return inputHash === storedHash;
    }

    /**
     * Save Full ICE Data (Encrypted) + Rescue Data (Plain/Refined)
     * @param {string} pin - Current valid PIN (needed for encryption)
     * @param {Object} fullData - Complete ICE form data
     */
    static async saveData(pin, fullData) {
        // 1. Verify PIN first
        if (!(await this.verifyPIN(pin))) {
            throw new Error("Nieprawidłowy PIN.");
        }

        // 2. Extract Public/Rescue Data
        const rescueData = this._extractRescueData(fullData);

        // 3. Encrypt Full Data
        const data = await this._getDBData();
        const salt = this._hexToBuffer(data.salt); // Use existing salt for simplicity or rotate
        const key = await this._deriveKey(pin, salt);
        
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encodedData = new TextEncoder().encode(JSON.stringify(fullData));
        
        const ciphertextBuffer = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv: iv },
            key,
            encodedData
        );

        // 4. Update DB
        data.encryptedData = this._bufferToHex(ciphertextBuffer);
        data.iv = this._bufferToHex(iv);
        data.rescueData = rescueData;
        data.lastUpdated = new Date().toISOString();

        await this._saveDBData(data);
        console.log("Data saved securely.");
    }

    /**
     * Load Full Data (Decrypted)
     * @param {string} pin 
     * @returns {Promise<Object|null>}
     */
    static async loadFullData(pin) {
        const data = await this._getDBData();
        if (!data || !data.encryptedData) return null;

        if (!(await this.verifyPIN(pin))) {
            throw new Error("Nieprawidłowy PIN.");
        }

        const salt = this._hexToBuffer(data.salt);
        const iv = this._hexToBuffer(data.iv);
        const ciphertext = this._hexToBuffer(data.encryptedData);
        
        const key = await this._deriveKey(pin, salt);

        try {
            const decryptedBuffer = await window.crypto.subtle.decrypt(
                { name: "AES-GCM", iv: iv },
                key,
                ciphertext
            );
            const decryptedText = new TextDecoder().decode(decryptedBuffer);
            return JSON.parse(decryptedText);
        } catch (e) {
            console.error("Decryption failed:", e);
            throw new Error("Błąd deszyfrowania.");
        }
    }

    /**
     * Load Rescue Data (No PIN required)
     * @returns {Promise<Object>}
     */
    static async loadRescueData() {
        const data = await this._getDBData();
        return data ? (data.rescueData || {}) : {};
    }

    // --- Internal Helpers ---

    static _extractRescueData(fullData) {
        const publicData = {};
        // Iterate over keys, if key starts with "show" and is true, 
        // find the corresponding value field (convention: showName -> name)
        // Assumption: Checkbox name "showX" corresponds to input name "X"
        for (const [key, value] of Object.entries(fullData)) {
            if (key.startsWith('show') && value === true) {
                // 'showOneArg' -> 'oneArg'
                // This simple slice assumes camelCase e.g. showFullName -> fullName
                // But we must be careful with casing. 
                // 'showFullName'.substring(4) -> 'FullName'. We need 'fullName'.
                
                // Let's try to map dynamically or strictly. 
                // Given the HTML: name="fullName" and checkbox name="showFullName".
                // We can derive the data key.
                const dataKeyRaw = key.substring(4); // Remove 'show'
                // Lowercase first letter to match variable name convention
                const dataKey = dataKeyRaw.charAt(0).toLowerCase() + dataKeyRaw.slice(1);

                if (fullData[dataKey]) {
                    publicData[dataKey] = fullData[dataKey];
                }
            }
        }
        return publicData;
    }

    static async _deriveKey(password, salt) {
        const enc = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
            "raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveKey"]
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
            false,
            ["encrypt", "decrypt"]
        );
    }

    static async _hashPIN(pin, salt) {
        // We use PBKDF2 for hashing PIN for storage/verification too
        // Not using the same parameters as encryption key to separate concerns, but for simplicity here we can.
        // Or simply hash the derived key material? No, standard is to hash with salt.
        const enc = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
            "raw", enc.encode(pin), { name: "PBKDF2" }, false, ["deriveBits"]
        );
        
        const derivedBits = await window.crypto.subtle.deriveBits(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: 100000,
                hash: "SHA-256"
            },
            keyMaterial,
            256 // 256 bits
        );
        return derivedBits;
    }

    // --- DB Wrappers ---

    static _getDBData() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            };

            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction([STORE_NAME], "readonly");
                const store = transaction.objectStore(STORE_NAME);
                const query = store.get("main"); // Singleton record

                query.onsuccess = () => resolve(query.result);
                query.onerror = () => reject(query.error);
            };

            request.onerror = () => reject(request.error);
        });
    }

    static _saveDBData(data) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            
            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction([STORE_NAME], "readwrite");
                const store = transaction.objectStore(STORE_NAME);
                const putRequest = store.put(data, "main");

                putRequest.onsuccess = () => resolve();
                putRequest.onerror = () => reject(putRequest.error);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // --- Utils ---

    static _bufferToHex(buffer) {
        return Array.from(new Uint8Array(buffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    static _hexToBuffer(hex) {
        const bytes = new Uint8Array(Math.ceil(hex.length / 2));
        for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
        return bytes;
    }
}
