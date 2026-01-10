// settings.js - Skript für die Einstellungsseite

document.getElementById('settingsForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const theme = document.getElementById('theme').value;
    const notifications = document.getElementById('notifications').checked;
    const autoSave = document.getElementById('autoSave').checked;
    
    // Speichere Einstellungen in chrome.storage
    chrome.storage.sync.set({
        theme: theme,
        notifications: notifications,
        autoSave: autoSave
    }, function() {
        alert('Einstellungen gespeichert!');
    });
});

// Lade gespeicherte Einstellungen beim Laden der Seite
document.addEventListener('DOMContentLoaded', function() {
    // Back-Button Logik mit Animation
    const backLink = document.querySelector('.back-link');
    if (backLink) {
        backLink.addEventListener('click', function(event) {
            event.preventDefault();
            document.body.classList.add('slide-out-right');
            setTimeout(() => {
                window.location.href = 'index.html?from=settings';
            }, 250);
        });
    }

    chrome.storage.sync.get(['theme', 'notifications', 'autoSave'], function(result) {
        document.getElementById('theme').value = result.theme || 'light';
        document.getElementById('notifications').checked = result.notifications || false;
        document.getElementById('autoSave').checked = result.autoSave || false;
    });
});