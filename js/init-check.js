/* init-check.js */
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Check if setup is already complete
    if (localStorage.getItem('app_fully_setup') === 'true') {
        return;
    }

    // 2. Avoid redirect loops if we are already on the target pages
    // We check purely for filename presence in the path
    const path = window.location.pathname;
    const isPinPage = path.indexOf('pin.html') !== -1;
    const isSettingsPage = path.indexOf('ustawienia.html') !== -1;

    if (isPinPage || isSettingsPage) {
        return;
    }

    // 3. Check for PIN
    // We assume Security class is available (loaded externally before this script or globally)
    // If running in index.html, paths are relative from root.
    if (typeof Security === 'undefined') {
        console.warn("Security module not loaded. Skipping init check.");
        return;
    }

    try {
        const hasPIN = await Security.hasPIN();

        // Define base path relative to where this script is running.
        // Assuming this script is included in index.html (root).
        // If included in subpages, this simple path logic might fail, 
        // but the requirement implies "opening the page" (entry point).

        let basePath = 'applications/';

        // Simple detection if we are deeper in the structure (e.g. 1 level down)
        // If we are not in root, 'applications/' won't work.
        // But for now, we optimize for index.html.

        if (!hasPIN) {
            console.log("No PIN found. Redirecting to PIN setup.");
            window.location.href = basePath + 'pin/pin.html';
        } else {
            console.log("PIN found but setup incomplete. Redirecting to Settings.");
            // PIN exists, but flow not complete -> Settings
            window.location.href = basePath + 'ustawienia/ustawienia.html';
        }

    } catch (e) {
        console.error("Init check failed:", e);
    }
});
