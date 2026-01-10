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

    const startButton = document.getElementById('revancedStatusButton');
    if (startButton) {
        startButton.addEventListener('click', function() {
            console.log("Revanced Modus wird aktiviert...");
            // Hier könnte die Logik zum Starten hin
        });
    }
});