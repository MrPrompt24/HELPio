/* guide.js */
document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.guide-nav-btn');
    const sections = document.querySelectorAll('.guide-section');

    function switchTab(targetId) {
        // Update Tabs
        tabs.forEach(tab => {
            if (tab.dataset.target === targetId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Update Sections
        sections.forEach(sec => {
            if (sec.id === targetId) {
                sec.classList.add('active');
            } else {
                sec.classList.remove('active');
            }
        });

        // Scroll to top of section container slightly to focus user
        const content = document.querySelector('.guide-sections');
        if (content) {
            content.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.target;
            switchTab(target);
        });
    });
});
