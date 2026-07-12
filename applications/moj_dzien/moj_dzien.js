(function () {
    const DB_NAME = 'MojDzienHelpIO';
    const DB_VERSION = 1;
    const STORE_NAME = 'tasks';

    let db;
    let currentEditId = null;
    let currentFilter = 'all';
    let deleteCandidateId = null;
    let lastDeletedTask = null;

    // DOM Elements
    const taskList = document.getElementById('task-list');
    const addTaskBtn = document.getElementById('add-task-btn');
    const modalOverlay = document.getElementById('task-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const cancelTaskBtn = document.getElementById('cancel-task');
    const taskForm = document.getElementById('task-form');
    const modalTitle = document.getElementById('modal-title');
    const totalCountEl = document.getElementById('total-count');
    const doneCountEl = document.getElementById('done-count');

    // --- Initialization ---
    document.addEventListener('DOMContentLoaded', async () => {
        // Security Check
        try {
            const hasPin = await Security.hasPIN();
            const container = document.querySelector('.my-day-container');

            if (hasPin) {
                try {
                    await PinUI.showVerify();
                    if (container) container.style.display = 'block';
                    initDB();
                    setupEventListeners();
                    document.getElementById('task-date').valueAsDate = new Date();
                } catch (e) {
                    console.warn('PIN cancelled/failed', e);
                    window.location.href = '../../index.html';
                }
            } else {
                if (container) container.style.display = 'block';
                initDB();
                setupEventListeners();
                document.getElementById('task-date').valueAsDate = new Date();
            }
        } catch (err) {
            console.error("Security init error", err);
            alert("Błąd zabezpieczeń");
            window.location.href = '../../index.html';
        }
    });

    // --- Event Listeners ---
    function setupEventListeners() {
        addTaskBtn.addEventListener('click', () => openModal());
        closeModalBtn.addEventListener('click', closeModal);
        cancelTaskBtn.addEventListener('click', closeModal);
        taskForm.addEventListener('submit', handleFormSubmit);

        // Click outside modal
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                renderTasks();
            });
        });

        // Confirm modal buttons
        document.getElementById('confirm-no').onclick = () => {
            deleteCandidateId = null;
            document.getElementById('confirm-modal').classList.remove('active');
        };
        document.getElementById('confirm-yes').onclick = () => {
            if (deleteCandidateId) {
                deleteTaskFromDB(deleteCandidateId);
                deleteCandidateId = null;
            }
            document.getElementById('confirm-modal').classList.remove('active');
        };
    }

    // --- IndexedDB ---
    function initDB() {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (e) => console.error('DB Error', e);

        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
                store.createIndex("status", "status", { unique: false });
                store.createIndex("category", "category", { unique: false });
                store.createIndex("date", "date", { unique: false });
            }
        };

        request.onsuccess = (e) => {
            db = e.target.result;
            renderTasks();
        };
    }

    function saveTask(task) {
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        if (!task.date) task.date = new Date().toISOString().split('T')[0];
        store.add(task).onsuccess = () => {
            showToast("Zadanie dodane");
            closeModal();
            renderTasks();
        };
    }

    function updateTaskInDB(id, updates) {
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        store.get(id).onsuccess = e => {
            const data = e.target.result;
            const updated = { ...data, ...updates };
            store.put(updated).onsuccess = () => {
                showToast("Zadanie zaktualizowane");
                if (currentEditId) closeModal();
                renderTasks();
            };
        };
    }

    function deleteTaskFromDB(id) {
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        store.get(id).onsuccess = e => {
            lastDeletedTask = e.target.result;
            store.delete(id).onsuccess = () => {
                showUndoToast();
                renderTasks();
            };
        };
    }

    function getAllTasks(callback) {
        const transaction = db.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);
        store.getAll().onsuccess = e => callback(e.target.result);
    }

    // --- Render Tasks ---
    function renderTasks() {
        getAllTasks((tasks) => {
            updateStats(tasks);

            // Apply filter
            const today = new Date().toISOString().split('T')[0];
            if (currentFilter === 'today') tasks = tasks.filter(t => t.date === today && t.status !== 'done');
            if (currentFilter === 'done') tasks = tasks.filter(t => t.status === 'done');

            taskList.innerHTML = '';
            if (tasks.length === 0) {
                taskList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-clipboard-list"></i>
                        <p>Brak zadań na dziś.</p>
                    </div>
                `;
                return;
            }

            tasks.sort((a, b) => {
                if (a.status === 'done' && b.status !== 'done') return 1;
                if (a.status !== 'done' && b.status === 'done') return -1;
                return new Date(b.date) - new Date(a.date);
            });

            tasks.forEach(task => {
                const el = document.createElement('div');
                el.className = `task-item ${task.status === 'done' ? 'done' : ''}`;
                el.innerHTML = `
                    <div class="task-content">
                        <div class="task-status" onclick="toggleStatus(${task.id}, '${task.status}')">
                            ${task.status === 'done' ? '<span class="status-done">✔ Wykonane</span>'
                        : '<span class="status-todo">⏳ Nie wykonane</span>'}
                        </div>
                        <div class="task-main">
                            <div class="task-header">
                                <h3 class="task-title">${escapeHtml(task.title)}</h3>
                                <span class="badge badge-category-${task.category.toLowerCase()}">${task.category}</span>
                            </div>
                            <div class="task-meta">
                                <i class="far fa-calendar"></i> ${task.date} 
                                ${task.time ? `<span><i class="far fa-clock"></i> ${task.time}</span>` : ''}
                            </div>
                            <div class="task-desc">${escapeHtml(task.description || '')}</div>
                        </div>
                    </div>
                    <div class="task-actions">
                        <button class="task-btn edit" onclick="editTask(${task.id})" title="Edytuj">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="task-btn delete" onclick="confirmDelete(${task.id})" title="Usuń">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                taskList.appendChild(el);
            });
        });
    }

    function updateStats(tasks) {
        totalCountEl.textContent = tasks.length;
        doneCountEl.textContent = tasks.filter(t => t.status === 'done').length;
    }

    // --- Form Handlers ---
    function handleFormSubmit(e) {
        e.preventDefault();
        const task = {
            title: document.getElementById('task-title').value,
            description: document.getElementById('task-desc').value,
            category: document.getElementById('task-category').value,
            date: document.getElementById('task-date').value,
            time: document.getElementById('task-time').value,
            status: 'todo'
        };
        if (currentEditId) updateTaskInDB(currentEditId, task);
        else saveTask(task);
        closeModal();
    }

    // --- Global Functions ---
    window.toggleStatus = (id, status) => {
        const newStatus = status === 'done' ? 'todo' : 'done';
        updateTaskInDB(id, { status: newStatus });
    };

    window.editTask = (id) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        transaction.objectStore(STORE_NAME).get(id).onsuccess = e => {
            const task = e.target.result;
            fillForm(task);
            currentEditId = id;
            modalTitle.textContent = "Edytuj Zadanie";
            document.getElementById('btn-submit').textContent = "Zapisz Zmiany";
            openModal();
        };
    };

    window.confirmDelete = (id) => {
        deleteCandidateId = id;
        document.getElementById('confirm-modal').classList.add('active');
    };

    // --- Modal ---
    function openModal() { modalOverlay.classList.add('active'); }
    function closeModal() {
        modalOverlay.classList.remove('active');
        taskForm.reset();
        currentEditId = null;
        modalTitle.textContent = "Nowe Zadanie";
        document.getElementById('btn-submit').textContent = "Dodaj Zadanie";
        document.getElementById('task-date').valueAsDate = new Date();
    }

    function fillForm(task) {
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-desc').value = task.description;
        document.getElementById('task-category').value = task.category;
        document.getElementById('task-date').value = task.date;
        document.getElementById('task-time').value = task.time;
    }

    // --- Toasts ---
    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        toast.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => { toast.style.animation = 'slideOut 0.3s forwards'; setTimeout(() => toast.remove(), 300); }, 3000);
    }

    function showUndoToast() {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span>Zadanie usunięte</span><button class="undo-btn">Cofnij</button>`;
        toast.querySelector('.undo-btn').onclick = () => {
            if (lastDeletedTask) {
                saveTask(lastDeletedTask);
                lastDeletedTask = null;
            }
            toast.remove();
        };
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    }

    // --- Utils ---
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

})();
