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