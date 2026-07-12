(function () {
    // Stan aplikacji
    const STORAGE_KEY = 'helpio_contacts_data';

    // Domyślne dane jeśli brak w localStorage
    const defaultData = {
        categories: [
            { id: 'family', name: 'Rodzina', locked: true },
            { id: 'friends', name: 'Przyjaciele', locked: true },
            { id: 'work', name: 'Praca', locked: true },
            { id: 'other', name: 'Inne', locked: true },
            { id: 'business', name: 'Biznes', locked: false }
        ],
        contacts: [
            { id: 1715001, name: 'Ewa Nowak', phone: '500577301', categoryId: 'family' },
            { id: 1715002, name: 'Kasia Kasiowska', phone: '4578214785', categoryId: 'business' }
        ]
    };

    let appData = { ...defaultData };
    let currentCategoryFilter = 'all'; // 'all' lub categoryId
    let contactToDeleteId = null;
    let categoryToDeleteId = null;

    // Elementy DOM
    const elements = {
        contactsList: document.getElementById('mkContactsList'),
        searchInput: document.getElementById('mkSearchInput'),
        categoriesChips: document.getElementById('mkCategoriesChips'),

        // Modals
        contactModal: document.getElementById('mkContactModal'),
        categoryModal: document.getElementById('mkCategoryModal'),
        confirmModal: document.getElementById('mkConfirmModal'),
        infoModal: document.getElementById('mkInfoModal'),

        confirmMessage: document.getElementById('mkConfirmMessage'),

        // Buttons
        addContactBtn: document.getElementById('mkAddContactBtn'),
        manageCategoriesBtn: document.getElementById('mkManageCategoriesBtn'),
        exportBtn: document.getElementById('mkExportBtn'),
        importBtn: document.getElementById('mkImportBtn'),
        importInput: document.getElementById('mkImportInput'),
        confirmYesBtn: document.getElementById('mkConfirmYesBtn'),

        // Forms
        contactForm: document.getElementById('mkContactForm'),
        contactCategorySelect: document.getElementById('mkContactCategory'),
        newCategoryGroup: document.getElementById('mkNewCategoryGroup'),
        categoryListContainer: document.getElementById('mkCategoryListContainer')
    };

    // --- Inicjalizacja ---
    async function init() {
        // Security Check
        try {
            const hasPin = await Security.hasPIN();
            const container = document.querySelector('.mk-app-container');

            if (hasPin) {
                try {
                    await PinUI.showVerify();
                    if (container) container.style.display = 'flex'; // Restore as flex
                    loadData();
                    renderCategories();
                    renderContacts();
                    setupEventListeners();
                } catch (e) {
                    console.warn('PIN cancelled/failed', e);
                    window.location.href = '../../index.html';
                    return;
                }
            } else {
                if (container) container.style.display = 'flex';
                loadData();
                renderCategories();
                renderContacts();
                setupEventListeners();
            }
        } catch (err) {
            console.error("Security init error", err);
            alert("Błąd zabezpieczeń");
            window.location.href = '../../index.html';
        }
    }

    // --- Zarządzanie Danymi ---
    function loadData() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                appData = JSON.parse(stored);
                // Merge if updates (simple check)
                if (!appData.categories) appData.categories = defaultData.categories;
            } catch (e) {
                console.error("Błąd parsowania danych", e);
                appData = { ...defaultData };
            }
        } else {
            saveData();
        }
    }

    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
        renderContacts(); // Refresh UI on save often helps
    }

    // --- Renderowanie UI ---

    function renderCategories() {
        // Chips
        elements.categoriesChips.innerHTML = '';

        // "Wszystkie"
        const allChip = createChip('all', 'Wszystkie', currentCategoryFilter === 'all');
        allChip.onclick = () => { currentCategoryFilter = 'all'; renderCategories(); renderContacts(); };
        elements.categoriesChips.appendChild(allChip);

        appData.categories.forEach(cat => {
            const chip = createChip(cat.id, cat.name, currentCategoryFilter === cat.id);
            if (!cat.locked) chip.classList.add('custom-chip');
            chip.onclick = () => { currentCategoryFilter = cat.id; renderCategories(); renderContacts(); };
            elements.categoriesChips.appendChild(chip);
        });

        // Select w formularzu
        updateCategorySelect();
    }

    function createChip(id, name, isActive) {
        const div = document.createElement('div');
        div.className = `mk-chip ${isActive ? 'active' : ''}`;
        div.textContent = name;
        return div;
    }

    function updateCategorySelect() {
        const select = elements.contactCategorySelect;
        select.innerHTML = '';

        appData.categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = cat.name;
            select.appendChild(opt);
        });

        // Opcja "Nowa kategoria..."
        const newOpt = document.createElement('option');
        newOpt.value = 'new_category_trigger';
        newOpt.textContent = '+ Dodaj nową kategorię...';
        newOpt.style.fontWeight = 'bold';
        select.appendChild(newOpt);
    }

    function renderContacts() {
        const list = elements.contactsList;
        list.innerHTML = '';

        const searchTerm = elements.searchInput.value.toLowerCase();

        const filtered = appData.contacts.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchTerm) || c.phone.includes(searchTerm);
            const matchesCategory = currentCategoryFilter === 'all' || c.categoryId === currentCategoryFilter;
            return matchesSearch && matchesCategory;
        });

        // Sortowanie alfabetyczne
        filtered.sort((a, b) => a.name.localeCompare(b.name));

        if (filtered.length === 0) {
            list.innerHTML = '<div style="text-align:center; color:#999; margin-top:30px;">Brak kontaktów</div>';
            return;
        }

        filtered.forEach(contact => {
            const catObj = appData.categories.find(c => c.id === contact.categoryId) || { name: 'Inne' };
            const initials = contact.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

            const item = document.createElement('div');
            item.className = 'mk-contact-item';
            item.innerHTML = `
                <div class="mk-contact-avatar">${initials}</div>
                <div class="mk-contact-info">
                    <div class="mk-contact-name">${contact.name}</div>
                    <div class="mk-contact-meta">
                        <span class="mk-contact-category">${catObj.name}</span>
                        <span><i class="fas fa-phone-alt"></i> ${contact.phone}</span>
                    </div>
                </div>
                <div class="mk-contact-actions">
                    <a href="tel:${contact.phone}" class="mk-btn mk-btn-secondary mk-btn-icon" title="Zadzwoń"><i class="fas fa-phone"></i></a>
                    <button class="mk-btn mk-btn-danger mk-btn-icon" onclick="deleteContactConfirm(${contact.id})" title="Usuń"><i class="fas fa-trash"></i></button>
                    <button class="mk-btn mk-btn-secondary mk-btn-icon" onclick="editContact(${contact.id})" title="Edytuj"><i class="fas fa-edit"></i></button>
                </div>
            `;
            list.appendChild(item);
        });
    }

    function renderCategoryManager() {
        const container = elements.categoryListContainer;
        container.innerHTML = '';

        appData.categories.forEach(cat => {
            const div = document.createElement('div');
            div.className = 'mk-category-list-item';

            let actions = '';
            if (cat.locked) {
                actions = '<span class="mk-badge-locked">Systemowa</span>';
            } else {
                // Hack: przekazujemy ID jako string w atrybucie
                actions = `<button class="mk-btn mk-btn-danger mk-btn-sm" data-delete-cat="${cat.id}"><i class="fas fa-trash"></i></button>`;
            }

            div.innerHTML = `
                <span>${cat.name}</span>
                <div>${actions}</div>
            `;
            container.appendChild(div);
        });

        // Add listeners for dynamic buttons
        container.querySelectorAll('[data-delete-cat]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = btn.getAttribute('data-delete-cat');
                deleteCategoryConfirm(id);
            });
        });
    }

    // --- Logika Formularzy i Akcji ---

    // Globalne funkcje dla onclick w HTML (przypisujemy do window, bo script jest w module/function scope)
    window.deleteContactConfirm = function (id) {
        contactToDeleteId = id;
        categoryToDeleteId = null;
        elements.confirmMessage.textContent = "Czy na pewno chcesz usunąć ten kontakt?";
        openModal('mkConfirmModal');
    };

    window.editContact = function (id) {
        const contact = appData.contacts.find(c => c.id === id);
        if (!contact) return;

        document.getElementById('mkContactId').value = contact.id;
        document.getElementById('mkContactName').value = contact.name;
        document.getElementById('mkContactPhone').value = contact.phone;
        document.getElementById('mkContactCategory').value = contact.categoryId;

        document.getElementById('mkContactModalTitle').textContent = "Edytuj Kontakt";
        elements.newCategoryGroup.style.display = 'none';

        openModal('mkContactModal');
    };

    function deleteCategoryConfirm(id) {
        // Sprawdź czy są kontakty w tej kategorii
        const hasContacts = appData.contacts.some(c => c.categoryId === id);
        if (hasContacts) {
            showInfo("Nie można usunąć kategorii", "Istnieją kontakty przypisane do tej kategorii. Najpierw je przenieś lub usuń.");
            return;
        }

        categoryToDeleteId = id;
        contactToDeleteId = null;
        elements.confirmMessage.textContent = "Czy na pewno chcesz usunąć tę kategorię?";
        openModal('mkConfirmModal');
    }

    function handleContactSubmit(e) {
        e.preventDefault();

        const id = document.getElementById('mkContactId').value;
        const name = document.getElementById('mkContactName').value;
        const phone = document.getElementById('mkContactPhone').value;
        let category = document.getElementById('mkContactCategory').value;
        const newCategoryName = document.getElementById('mkNewCategoryName').value;

        // Obsługa nowej kategorii
        if (category === 'new_category_trigger') {
            if (!newCategoryName.trim()) {
                alert("Podaj nazwę nowej kategorii");
                return;
            }
            // Tworzenie ID
            const newId = 'cat_' + Date.now();
            appData.categories.push({ id: newId, name: newCategoryName, locked: false });
            category = newId;
            renderCategories(); // Aktualizacja widoku
        }

        if (id) {
            // Edycja
            const index = appData.contacts.findIndex(c => c.id == id);
            if (index > -1) {
                appData.contacts[index] = { ...appData.contacts[index], name, phone, categoryId: category };
            }
        } else {
            // Nowy
            const newContact = {
                id: Date.now(),
                name,
                phone,
                categoryId: category
            };
            appData.contacts.push(newContact);
        }

        saveData();
        closeModal('mkContactModal');
        elements.contactForm.reset();
        document.getElementById('mkContactId').value = '';
    }

    function performDelete() {
        if (contactToDeleteId) {
            appData.contacts = appData.contacts.filter(c => c.id !== contactToDeleteId);
            contactToDeleteId = null;
            saveData();
            closeModal('mkConfirmModal');
        } else if (categoryToDeleteId) {
            appData.categories = appData.categories.filter(c => c.id !== categoryToDeleteId);
            categoryToDeleteId = null;
            saveData();
            renderCategoryManager(); // Refresh manager list
            renderCategories(); // Refresh main chips
            closeModal('mkConfirmModal');
        }
    }

    // --- Import / Eksport ---

    function handleExport() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "moje_kontakty_backup.json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    function handleImport(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (event) {
            try {
                const importedData = JSON.parse(event.target.result);
                if (importedData.contacts && importedData.categories) {
                    appData = importedData;
                    saveData();
                    renderCategories();
                    renderContacts();
                    showInfo("Sukces", "Zaimportowano kontakty pomyślnie.");
                } else {
                    showInfo("Błąd", "Nieprawidłowy format pliku.");
                }
            } catch (err) {
                showInfo("Błąd", "Nie udało się odczytać pliku JSON.");
            }
            elements.importInput.value = ''; // Reset input
        };
        reader.readAsText(file);
    }

    // --- Helpers Modalowe ---

    function openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    function closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    // Umożliwienie zamykania z HTML (data-close)
    document.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.getAttribute('data-close');
            closeModal(modalId);
        });
    });

    function showInfo(title, msg) {
        document.getElementById('mkInfoTitle').textContent = title;
        document.getElementById('mkInfoMessage').textContent = msg;
        openModal('mkInfoModal');
    }

    // --- Event Listeners Setup ---
    function setupEventListeners() {
        elements.searchInput.addEventListener('input', renderContacts);

        elements.addContactBtn.addEventListener('click', () => {
            elements.contactForm.reset();
            document.getElementById('mkContactId').value = '';
            document.getElementById('mkContactModalTitle').textContent = "Nowy Kontakt";
            elements.newCategoryGroup.style.display = 'none';
            // Default select
            elements.contactCategorySelect.value = appData.categories[0].id;
            openModal('mkContactModal');
        });

        elements.manageCategoriesBtn.addEventListener('click', () => {
            renderCategoryManager();
            openModal('mkCategoryModal');
        });

        elements.contactForm.addEventListener('submit', handleContactSubmit);

        elements.contactCategorySelect.addEventListener('change', (e) => {
            if (e.target.value === 'new_category_trigger') {
                elements.newCategoryGroup.style.display = 'block';
                document.getElementById('mkNewCategoryName').focus();
            } else {
                elements.newCategoryGroup.style.display = 'none';
            }
        });

        elements.confirmYesBtn.addEventListener('click', performDelete);

        elements.exportBtn.addEventListener('click', handleExport);
        elements.importBtn.addEventListener('click', () => elements.importInput.click());
        elements.importInput.addEventListener('change', handleImport);
    }

    // Start App
    init();

})();