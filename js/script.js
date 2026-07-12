// Update notification badge count
async function updateNotificationBadge() {
    try {
        const response = await fetch('notifications/data/powiadomienia.json');
        const notifications = await response.json();
        const unreadCount = notifications.filter(n => !n.read).length;

        const badges = document.querySelectorAll('.notification-badge');
        badges.forEach(badge => {
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        });

        // Store count in localStorage for other pages
        localStorage.setItem('unreadNotificationsCount', unreadCount);
    } catch (error) {
        console.error('Error loading notifications count:', error);
        // Fallback to localStorage if JSON fetch fails
        const storedCount = localStorage.getItem('unreadNotificationsCount');
        if (storedCount) {
            const badges = document.querySelectorAll('.notification-badge');
            badges.forEach(badge => {
                const count = parseInt(storedCount);
                if (count > 0) {
                    badge.textContent = count;
                    badge.style.display = 'flex';
                } else {
                    badge.style.display = 'none';
                }
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {

    // Update notification badge on page load
    updateNotificationBadge();

    // --- UI Interactions ---
    const hamburger = document.getElementById('hamburger-menu');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const appsMenu = document.getElementById('apps-menu');
    const appsPanel = document.getElementById('apps-panel');
    const appsOverlay = document.getElementById('apps-overlay');
    const appsClose = document.getElementById('apps-close');

    if (hamburger && sidebar && sidebarOverlay) {
        hamburger.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            sidebarOverlay.classList.toggle('active');
        });
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('active');
        });
    }

    if (appsMenu && appsPanel && appsOverlay) {
        appsMenu.addEventListener('click', () => {
            appsPanel.classList.toggle('open');
            appsOverlay.classList.toggle('active');
            sidebar?.classList.remove('open');
            sidebarOverlay?.classList.remove('active');
        });
        appsOverlay.addEventListener('click', () => {
            appsPanel.classList.remove('open');
            appsOverlay.classList.remove('active');
        });
        appsClose?.addEventListener('click', () => {
            appsPanel.classList.remove('open');
            appsOverlay.classList.remove('active');
        });

        // --- App Management Logic (Edit, Delete, Reorder) ---
        const appsGrid = document.querySelector('.apps-grid');
        let isEditMode = false;

        // 1. Reorder Default Apps (Static HTML)
        function loadDefaultAppsOrder() {
            const savedOrder = JSON.parse(localStorage.getItem('helios_default_apps_order'));
            if (savedOrder && savedOrder.length > 0) {
                const defaultApps = [];
                // Collect existing elements
                savedOrder.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) defaultApps.push(el);
                });

                // Find any missing ones (if HTML changed)
                const allDefault = appsGrid.querySelectorAll('.app-item[id^="def-"]');
                allDefault.forEach(el => {
                    if (!savedOrder.includes(el.id)) defaultApps.push(el);
                });

                defaultApps.forEach(el => {
                    appsGrid.appendChild(el);
                });
            } else {
                // Initialize drag handlers for default apps even if no saved order
                const allDefault = appsGrid.querySelectorAll('.app-item[id^="def-"]');
                allDefault.forEach(el => setupDragHandlers(el));
            }

            // Ensure they have handlers
            const allDefault = appsGrid.querySelectorAll('.app-item[id^="def-"]');
            allDefault.forEach(el => {
                el.draggable = true;
                setupDragHandlers(el);
                // Prevent navigation in edit mode
                el.addEventListener('click', (e) => {
                    if (isEditMode) e.preventDefault();
                });
            });
        }

        function saveDefaultAppsOrder() {
            const allDefault = appsGrid.querySelectorAll('.app-item[id^="def-"]');
            const ids = Array.from(allDefault).map(el => el.id);
            localStorage.setItem('helios_default_apps_order', JSON.stringify(ids));
        }

        // 2. Render My Apps (Dynamic)
        function renderMyApps() {
            const myApps = JSON.parse(localStorage.getItem('helios_my_apps')) || [];

            // Remove existing custom apps & separator (clean slate)
            const existingCustomApps = appsGrid.querySelectorAll('.app-item[id^="myapp-"]');
            existingCustomApps.forEach(el => el.remove());
            const existingSeparator = document.getElementById('my-apps-separator');
            if (existingSeparator) existingSeparator.remove();

            // Create Separator
            if (myApps.length > 0) {
                const separator = document.createElement('div');
                separator.id = 'my-apps-separator';
                separator.style.width = '100%';
                separator.style.gridColumn = '1 / -1';
                separator.style.borderTop = '1px solid #1f2937';
                separator.style.margin = '1rem 0';
                separator.style.paddingTop = '0.5rem';
                separator.style.fontSize = '0.85rem';
                separator.style.color = '#999';
                separator.style.display = 'flex';
                separator.style.justifyContent = 'space-between';
                separator.style.alignItems = 'center';

                separator.innerHTML = `
                    <span>Moje Aplikacje</span>
                    <i class="fas fa-pen apps-edit-toggle" title="Edytuj"></i>
                `;
                appsGrid.appendChild(separator);

                // Add Listener for Edit Toggle
                const toggle = separator.querySelector('.apps-edit-toggle');
                toggle.addEventListener('click', toggleEditMode);
            } else {
                if (isEditMode) toggleEditMode();
                return;
            }

            // Render Apps
            myApps.forEach(app => {
                const appContainer = document.createElement('div');
                appContainer.className = 'app-item';
                appContainer.id = `myapp-${app.id}`;
                appContainer.draggable = true;
                appContainer.style.position = 'relative';

                // Inner HTML
                appContainer.innerHTML = `
                    <div class="app-delete-btn"><i class="fas fa-times"></i></div>
                    <i class="${app.icon}" style="color: #0ea5e9;"></i>
                    <span>${app.name}</span>
                `;

                // Click Handler
                appContainer.addEventListener('click', (e) => {
                    if (isEditMode) {
                        e.preventDefault();
                        if (e.target.closest('.app-delete-btn')) {
                            confirmDelete(app);
                        }
                    } else {
                        window.location.href = app.link;
                    }
                });

                setupDragHandlers(appContainer);
                appsGrid.appendChild(appContainer);
            });

            updateEditModeClasses();
        }

        function setupDragHandlers(el) {
            // Mouse Events
            el.addEventListener('dragstart', (e) => {
                if (!isEditMode) {
                    e.preventDefault();
                    return;
                }
                el.classList.add('dragging');
                // Store type
                e.dataTransfer.setData('type', el.id.startsWith('def-') ? 'default' : 'custom');
            });

            el.addEventListener('dragend', () => {
                el.classList.remove('dragging');
                if (el.id.startsWith('def-')) saveDefaultAppsOrder();
                else saveMyAppsOrder(); // Renamed from saveReorder logic
            });

            // Touch Events (Mobile)
            el.addEventListener('touchstart', (e) => {
                if (!isEditMode) return;
                // Don't prevent default immediately to allow scrolling if not holding?
                // Standard mobile drag: usually hold to drag. 
                // For simplicity here: if edit mode is on, we assume interaction is drag if on handle or entire item.
                // We'll prevent scroll to allow drag.
                // Only if it's not the delete button
                if (e.target.closest('.app-delete-btn')) return;

                el.classList.add('dragging');
                // Touch start logic
            }, { passive: false });

            el.addEventListener('touchmove', (e) => {
                if (!isEditMode || !el.classList.contains('dragging')) return;
                e.preventDefault(); // Stop scrolling

                const touch = e.touches[0];
                const grid = document.querySelector('.apps-grid');

                // Identify target under finger
                const afterElement = getDragAfterElement(grid, touch.clientY, el.id.startsWith('def-'));

                const separator = document.getElementById('my-apps-separator');
                const isDefault = el.id.startsWith('def-');

                if (isDefault) {
                    if (afterElement == null) {
                        if (separator) grid.insertBefore(el, separator);
                        else grid.appendChild(el);
                    } else {
                        grid.insertBefore(el, afterElement);
                    }
                } else {
                    if (afterElement == null) {
                        grid.appendChild(el);
                    } else {
                        grid.insertBefore(el, afterElement);
                    }
                }
            }, { passive: false });

            el.addEventListener('touchend', (e) => {
                if (!isEditMode) return;
                el.classList.remove('dragging');
                if (el.id.startsWith('def-')) saveDefaultAppsOrder();
                else saveMyAppsOrder();
            });
        }

        function toggleEditMode() {
            isEditMode = !isEditMode;
            updateEditModeClasses();
        }

        function updateEditModeClasses() {
            const toggleBtn = document.querySelector('.apps-edit-toggle');
            if (isEditMode) {
                appsGrid.classList.add('edit-mode');
                if (toggleBtn) toggleBtn.classList.add('active');
            } else {
                appsGrid.classList.remove('edit-mode');
                if (toggleBtn) toggleBtn.classList.remove('active');
            }
        }

        // Drag Over Logic
        appsGrid.addEventListener('dragover', (e) => {
            if (!isEditMode) return;
            e.preventDefault();

            const separator = document.getElementById('my-apps-separator');
            const dragging = document.querySelector('.dragging');
            if (!dragging) return;

            const isDefault = dragging.id.startsWith('def-');
            const afterElement = getDragAfterElement(appsGrid, e.clientY, isDefault);

            // BOUNDARY CHECK
            // If dragging default app, ensure we don't drop after separator
            if (isDefault) {
                if (afterElement == null) {
                    // Start of 'my apps' zone or end of 'default apps' zone? 
                    // Default apps should be inserted before separator.
                    if (separator) appsGrid.insertBefore(dragging, separator);
                    else appsGrid.appendChild(dragging); // No custom apps, simple append
                } else {
                    appsGrid.insertBefore(dragging, afterElement);
                }
            } else {
                // Dragging Custom App
                // Must be AFTER separator.
                if (afterElement == null) {
                    appsGrid.appendChild(dragging);
                } else {
                    appsGrid.insertBefore(dragging, afterElement);
                }
            }
        });

        function getDragAfterElement(container, y, isDefault) {
            // Filter draggable candidates based on type
            const selector = isDefault
                ? '.app-item:not(.dragging)[id^="def-"]'
                : '.app-item:not(.dragging)[id^="myapp-"]';

            const draggableElements = [...container.querySelectorAll(selector)];

            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        }

        function saveMyAppsOrder() {
            const currentItems = appsGrid.querySelectorAll('.app-item[id^="myapp-"]');
            const newOrder = [];
            const currentData = JSON.parse(localStorage.getItem('helios_my_apps')) || [];

            currentItems.forEach(item => {
                const id = item.id.replace('myapp-', '');
                const appData = currentData.find(a => a.id === id);
                if (appData) newOrder.push(appData);
            });

            localStorage.setItem('helios_my_apps', JSON.stringify(newOrder));
        }

        // Custom Confirmation Modal
        function confirmDelete(app) {
            let modalOverlay = document.getElementById('custom-confirm-modal');
            if (!modalOverlay) {
                modalOverlay = document.createElement('div');
                modalOverlay.id = 'custom-confirm-modal';
                modalOverlay.className = 'custom-modal-overlay';
                modalOverlay.innerHTML = `
                    <div class="custom-modal">
                        <h3>Usuń aplikację</h3>
                        <p>Czy na pewno chcesz usunąć "${app.name}" z Moich Aplikacji?</p>
                        <div class="modal-actions">
                            <button class="btn-modal btn-cancel">Anuluj</button>
                            <button class="btn-modal btn-confirm">Usuń</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modalOverlay);

                const cancelBtn = modalOverlay.querySelector('.btn-cancel');
                cancelBtn.onclick = () => {
                    modalOverlay.classList.remove('active');
                };
            } else {
                modalOverlay.querySelector('p').innerText = `Czy na pewno chcesz usunąć "${app.name}" z Moich Aplikacji?`;
            }

            const confirmBtn = modalOverlay.querySelector('.btn-confirm');
            const newConfirmBtn = confirmBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

            newConfirmBtn.onclick = () => {
                deleteApp(app.id);
                modalOverlay.classList.remove('active');
            };

            setTimeout(() => modalOverlay.classList.add('active'), 10);
        }

        function deleteApp(id) {
            let myApps = JSON.parse(localStorage.getItem('helios_my_apps')) || [];
            myApps = myApps.filter(a => a.id !== id);
            localStorage.setItem('helios_my_apps', JSON.stringify(myApps));
            renderMyApps();
        }

        // Initialize
        loadDefaultAppsOrder();
        renderMyApps();
    }


    // --- Lena AI (Chat AI) Integration ---
    const robotIcon = document.querySelector('.header-actions .fa-robot');

    if (robotIcon) {
        robotIcon.addEventListener('click', () => {
            // Check if overlay exists
            let lenaOverlay = document.getElementById('lena-ai-overlay');

            if (!lenaOverlay) {
                // Create overlay structure
                lenaOverlay = document.createElement('div');
                lenaOverlay.id = 'lena-ai-overlay';

                // Content: Iframe + Close Button
                lenaOverlay.innerHTML = `
                    <iframe src="${(function () {
                        const path = window.location.pathname;
                        if (path.includes('/applications/')) return '../../';
                        if (path.includes('/partners/') || path.includes('/content/') || path.includes('/guide/') || path.includes('/apps/') || path.includes('/notifications/')) return '../';
                        return '';
                    })()}lena_ai/index.html"></iframe>
                    <button class="lena-close-btn"><i class="fas fa-times"></i></button>
                `;

                document.body.appendChild(lenaOverlay);

                // Add close functionality
                const closeBtn = lenaOverlay.querySelector('.lena-close-btn');
                closeBtn.addEventListener('click', () => {
                    lenaOverlay.classList.remove('open');
                });
            }

            // Force reflow to ensure transition works if just created
            setTimeout(() => {
                lenaOverlay.classList.add('open');
            }, 10);
        });
    }

});
