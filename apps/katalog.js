document.addEventListener('DOMContentLoaded', () => {

    // --- Accordion Logic ---
    const readMoreBtns = document.querySelectorAll('.btn-read-more');

    readMoreBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Stop propagation to prevent card click issues if any
            e.stopPropagation();

            const card = btn.closest('.app-card');
            const details = card.querySelector('.card-details');
            const isExpanded = btn.getAttribute('aria-expanded') === 'true';

            // Toggle current
            if (isExpanded) {
                // Close
                details.style.maxHeight = null;
                details.classList.remove('open');
                btn.setAttribute('aria-expanded', 'false');
                btn.innerHTML = 'Czytaj więcej... <i class="fas fa-chevron-down"></i>';
            } else {
                // Open
                // Close others if we want "accordion" behavior (one at a time)
                // For now, let's allow multiple open

                details.classList.add('open');
                details.style.maxHeight = details.scrollHeight + "px"; // Dynamic height
                btn.setAttribute('aria-expanded', 'true');
                btn.innerHTML = 'Zwiń <i class="fas fa-chevron-up"></i>';
            }
        });
    });


    // --- Add to My Apps Logic ---
    const addButtons = document.querySelectorAll('.btn-add-to-apps');

    addButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const appData = {
                id: btn.dataset.id,
                name: btn.dataset.name,
                icon: btn.dataset.icon, // Class string e.g. "fas fa-tint"
                link: btn.dataset.link
            };

            // Get existing apps
            let myApps = JSON.parse(localStorage.getItem('helios_my_apps')) || [];

            // Check duplicate
            if (!myApps.find(app => app.id === appData.id)) {
                myApps.push(appData);
                localStorage.setItem('helios_my_apps', JSON.stringify(myApps));

                // Visual feedback
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i> Dodano!';
                btn.style.background = '#0ea5e9';
                btn.style.color = 'white';

                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = 'transparent';
                    btn.style.color = '#0ea5e9';
                }, 2000);
            } else {
                alert('Ta aplikacja jest już w Twoich aplikacjach.');
            }
        });
    });

    // --- Search Logic ---
    const searchInput = document.getElementById('app-search');
    const sections = document.querySelectorAll('.catalog-section');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();

            sections.forEach(section => {
                const cards = section.querySelectorAll('.app-card');
                let hasVisibleCards = false;

                cards.forEach(card => {
                    const title = card.querySelector('.card-title').textContent.toLowerCase();
                    const desc = card.querySelector('.card-short-desc').textContent.toLowerCase();
                    const details = card.querySelector('.card-details p').textContent.toLowerCase();

                    if (title.includes(searchTerm) || desc.includes(searchTerm) || details.includes(searchTerm)) {
                        card.style.display = 'block'; // Or flex, depending on layout, block works for grid item
                        hasVisibleCards = true;
                    } else {
                        card.style.display = 'none';
                    }
                });

                // Hide empty sections
                section.style.display = hasVisibleCards ? 'block' : 'none';
            });
        });
    }
});
