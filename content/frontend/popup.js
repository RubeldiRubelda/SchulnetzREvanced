// popup.js - Skript für das Hauptmenü (index.html)

document.addEventListener('DOMContentLoaded', function() {
    // Check if we came back from settings to play reverse animation
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('from') === 'settings') {
        document.body.style.animation = 'none'; // Stop default animation
        // Force reflow
        void document.body.offsetWidth;
        document.body.classList.add('slide-in-left');
    }

    const settingsLink = document.querySelector('.settings-link');
    if (settingsLink) {
        settingsLink.addEventListener('click', function(event) {
            event.preventDefault();
            // Animation: Seite geht nach links weg
            document.body.classList.add('slide-out-left');
            
            // Warte auf Animation, dann Seitenwechsel
            setTimeout(() => {
                window.location.href = 'settings.html';
            }, 250);
        });
    }

    const revancedToggle = document.getElementById('revancedToggle');
    const statusText = document.getElementById('statusText');

    // QR Code Logic
    const qrButton = document.getElementById('qrButton');
    const qrModal = document.getElementById('qrModal');
    const qrImage = document.getElementById('qrImage');
    const qrPlaceholder = document.getElementById('qrPlaceholder');
    const closeBtn = document.querySelector('.close');

    if (qrButton && qrModal) {
        qrButton.addEventListener('click', () => {
            qrModal.style.display = 'block';
            
            // Lade QR Code aus Storage
            chrome.storage.local.get(['handyQrCodeUrl'], (result) => {
                const qrImage = document.getElementById('qrImage');
                const qrPlaceholder = document.getElementById('qrPlaceholder');
                
                if (result.handyQrCodeUrl) {
                    console.log("Schulnetz REvanced: QR URL gefunden:", result.handyQrCodeUrl);
                    qrImage.src = result.handyQrCodeUrl;
                    qrImage.style.display = 'block';
                    qrPlaceholder.style.display = 'none';
                } else {
                    console.warn("Schulnetz REvanced: Kein QR Code im Storage gefunden.");
                    qrImage.style.display = 'none';
                    qrPlaceholder.style.display = 'block';
                }
            });
        });

        if (closeBtn) {
            closeBtn.onclick = () => qrModal.style.display = 'none';
        }

        window.onclick = (event) => {
            if (event.target == qrModal) {
                qrModal.style.display = 'none';
            }
        };
    }

    if (revancedToggle) {
        // Load settings
        chrome.storage.local.get(['revancedEnabled'], function(result) {
            // Default to true if not set
            const enabled = result.revancedEnabled !== false;
            revancedToggle.checked = enabled;
            updateStatusText(enabled);
        });

        revancedToggle.addEventListener('change', function() {
            const enabled = revancedToggle.checked;
            chrome.storage.local.set({ revancedEnabled: enabled }, function() {
                console.log("Revanced Modus " + (enabled ? "aktiviert" : "deaktiviert"));
                updateStatusText(enabled);
            });
        });
    }

    function updateStatusText(enabled) {
        if (statusText) {
            statusText.textContent = enabled ? "Aktiviert" : "Deaktiviert";
            statusText.style.color = enabled ? "#4CAF50" : "#f44336";
        }
    }
});