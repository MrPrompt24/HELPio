// Notifications JavaScript
let notifications = [];

document.addEventListener('DOMContentLoaded', async () => {
    await loadNotifications();
    renderNotifications();

    // Event listeners for action buttons
    document.getElementById('mark-all-read')?.addEventListener('click', markAllAsRead);
    document.getElementById('delete-read')?.addEventListener('click', deleteReadNotifications);
});

// Load notifications from JSON
async function loadNotifications() {
    try {
        const response = await fetch('data/powiadomienia.json');
        notifications = await response.json();

        // Sort by date (newest first)
        notifications.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
        console.error('Error loading notifications:', error);
        notifications = [];
    }
}

// Render all notifications
function renderNotifications() {
    const container = document.getElementById('notifications-list');

    if (!container) return;

    // Clear container
    container.innerHTML = '';

    // Check if empty
    if (notifications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bell-slash"></i>
                <p>Brak powiadomień</p>
            </div>
        `;
        return;
    }

    // Render each notification
    notifications.forEach(notification => {
        const card = createNotificationCard(notification);
        container.appendChild(card);
    });

    updateBadgeCount();
}

// Create notification card element
function createNotificationCard(notification) {
    const card = document.createElement('div');
    card.className = `notification-card ${notification.read ? 'read' : 'unread'}`;
    card.dataset.id = notification.id;

    const date = formatDate(notification.date);

    card.innerHTML = `
        <div class="notification-header-row">
            <span class="notification-type-badge ${notification.type}">${getTypeName(notification.type)}</span>
            <div class="notification-controls">
                <button class="btn-mark-read" title="${notification.read ? 'Oznacz jako nieprzeczytane' : 'Oznacz jako przeczytane'}">
                    <i class="fas ${notification.read ? 'fa-envelope' : 'fa-envelope-open'}"></i>
                </button>
                <button class="btn-delete" title="Usuń powiadomienie">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        
        <div class="notification-body">
            <h3 class="notification-title">${notification.title}</h3>
            <p class="notification-preview">${notification.preview}</p>
            <div class="notification-content">${notification.content}</div>
        </div>
        
        <div class="notification-footer">
            <div class="notification-date">
                <i class="fas fa-clock"></i>
                <span>${date}</span>
            </div>
            <div class="notification-status">
                <span class="status-dot"></span>
                <span>${notification.read ? 'Przeczytane' : 'Nowe'}</span>
            </div>
        </div>
    `;

    // Event listeners
    const body = card.querySelector('.notification-body');
    body.addEventListener('click', () => toggleExpand(card));

    const markReadBtn = card.querySelector('.btn-mark-read');
    markReadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleRead(notification.id);
    });

    const deleteBtn = card.querySelector('.btn-delete');
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteNotification(notification.id);
    });

    return card;
}

// Toggle notification expansion
function toggleExpand(card) {
    card.classList.toggle('expanded');
}

// Toggle read status
function toggleRead(id) {
    const notification = notifications.find(n => n.id === id);
    if (notification) {
        notification.read = !notification.read;
        renderNotifications();
    }
}

// Delete single notification
function deleteNotification(id) {
    const notification = notifications.find(n => n.id === id);
    if (!notification) return;

    showConfirmDialog(
        'Usuń powiadomienie',
        `Czy na pewno chcesz usunąć powiadomienie: "${notification.title}"?`,
        () => {
            notifications = notifications.filter(n => n.id !== id);
            renderNotifications();
        }
    );
}

// Mark all as read
function markAllAsRead() {
    notifications.forEach(n => n.read = true);
    renderNotifications();
}

// Delete all read notifications
function deleteReadNotifications() {
    const readCount = notifications.filter(n => n.read).length;

    if (readCount === 0) {
        showInfoDialog('Brak przeczytanych powiadomień do usunięcia.');
        return;
    }

    showConfirmDialog(
        'Usuń przeczytane',
        `Czy na pewno chcesz usunąć ${readCount} przeczytanych powiadomień?`,
        () => {
            notifications = notifications.filter(n => !n.read);
            renderNotifications();
        }
    );
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Przed chwilą';
    if (diffMins < 60) return `${diffMins} min temu`;
    if (diffHours < 24) return `${diffHours} godz. temu`;
    if (diffDays < 7) return `${diffDays} dni temu`;

    return date.toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Get type name in Polish
function getTypeName(type) {
    const types = {
        'info': 'Info',
        'warning': 'Ostrzeżenie',
        'alert': 'Alert',
        'reminder': 'Przypomnienie'
    };
    return types[type] || 'Info';
}

// Update badge count
function updateBadgeCount() {
    const unreadCount = notifications.filter(n => !n.read).length;
    const badge = document.querySelector('.notification-badge');

    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }

    // Save to localStorage for global access
    localStorage.setItem('unreadNotificationsCount', unreadCount);
}

// Show custom confirmation dialog
function showConfirmDialog(title, message, onConfirm) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('confirm-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'confirm-modal';
        modal.className = 'confirm-modal';
        modal.innerHTML = `
            <div class="confirm-dialog">
                <div class="confirm-header">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3 id="confirm-title"></h3>
                </div>
                <p class="confirm-message" id="confirm-message"></p>
                <div class="confirm-actions">
                    <button class="btn-confirm-cancel">Anuluj</button>
                    <button class="btn-confirm-delete">Usuń</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });

        // Cancel button
        modal.querySelector('.btn-confirm-cancel').addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    // Update content
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;

    // Confirm button - remove old listeners and add new one
    const confirmBtn = modal.querySelector('.btn-confirm-delete');
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    newConfirmBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        onConfirm();
    });

    // Show modal
    modal.classList.add('active');
}

// Show info dialog
function showInfoDialog(message) {
    let modal = document.getElementById('confirm-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'confirm-modal';
        modal.className = 'confirm-modal';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="confirm-dialog">
            <div class="confirm-header">
                <i class="fas fa-info-circle" style="color: #3b82f6;"></i>
                <h3>Informacja</h3>
            </div>
            <p class="confirm-message">${message}</p>
            <div class="confirm-actions">
                <button class="btn-confirm-cancel">OK</button>
            </div>
        </div>
    `;

    modal.classList.add('active');

    const okBtn = modal.querySelector('.btn-confirm-cancel');
    okBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}
