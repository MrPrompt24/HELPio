share.jsdocument.addEventListener('DOMContentLoaded', function() {
    const shareButton = document.getElementById('shareIconButton');
    const appUrl = 'https://mrprompt.pl/aquamotiv/';
    const appTitle = 'AquaMotiv - Aplikacja do śledzenia nawodnienia';
    const appDescription = 'Monitoruj swoje nawodnienie i zużycie filtra w butelce filtrującej z AquaMotiv!';

    shareButton.addEventListener('click', function() {
        showShareModal();
    });

    function showShareModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay share-modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <i class="fas fa-share-alt modal-icon primary"></i>
                <h3 class="modal-title">Udostępnij aplikację</h3>
                <p class="modal-text">Wybierz sposób udostępnienia:</p>
                <div class="share-buttons">
                    <button class="share-option facebook" data-platform="facebook">
                        <i class="fab fa-facebook-f"></i> Facebook
                    </button>
                    <button class="share-option twitter" data-platform="twitter">
                        <i class="fab fa-twitter"></i> Twitter
                    </button>
                    <button class="share-option whatsapp" data-platform="whatsapp">
                        <i class="fab fa-whatsapp"></i> WhatsApp
                    </button>
                    <button class="share-option email" data-platform="email">
                        <i class="fas fa-envelope"></i> Email
                    </button>
                    <button class="share-option copy" data-platform="copy">
                        <i class="fas fa-copy"></i> Kopiuj link
                    </button>
                </div>
                <div class="modal-buttons">
                    <button class="modal-btn cancel" id="cancelShare">
                        <i class="fas fa-times"></i> Anuluj
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Obsługa kliknięć w opcje udostępniania
        modal.querySelectorAll('.share-option').forEach(button => {
            button.addEventListener('click', function() {
                const platform = this.dataset.platform;
                shareToPlatform(platform);
            });
        });

        // Obsługa przycisku Anuluj
        modal.querySelector('#cancelShare').addEventListener('click', function() {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
            }, 300);
        });
    }

    function shareToPlatform(platform) {
        let shareUrl = '';
        
        switch(platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}`;
                window.open(shareUrl, '_blank', 'width=600,height=400');
                break;
                
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(appTitle)}&url=${encodeURIComponent(appUrl)}`;
                window.open(shareUrl, '_blank', 'width=600,height=400');
                break;
                
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodeURIComponent(`${appTitle}: ${appUrl}`)}`;
                window.open(shareUrl, '_blank', 'width=600,height=600');
                break;
                
            case 'email':
                shareUrl = `mailto:?subject=${encodeURIComponent(appTitle)}&body=${encodeURIComponent(`${appDescription}\n\n${appUrl}`)}`;
                window.location.href = shareUrl;
                break;
                
            case 'copy':
                navigator.clipboard.writeText(appUrl)
                    .then(() => {
                        showNotification('Link skopiowany do schowka!');
                    })
                    .catch(() => {
                        // Fallback dla przeglądarek bez Clipboard API
                        const textarea = document.createElement('textarea');
                        textarea.value = appUrl;
                        document.body.appendChild(textarea);
                        textarea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textarea);
                        showNotification('Link skopiowany do schowka!');
                    });
                break;
        }
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'share-notification show success';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
});