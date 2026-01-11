// settings.js - Skript für die Einstellungsseite

document.addEventListener('DOMContentLoaded', function() {
    const themeSelect = document.getElementById('theme');
    const langSelect = document.getElementById('languageMode');
    const hideGradesCheckbox = document.getElementById('hideGrades');
    const saveButton = document.getElementById('revancedStatusButton');

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

    // Lade gespeicherte Einstellungen
    chrome.storage.local.get(['theme', 'languageMode', 'hideGrades'], function(result) {
        if (themeSelect) themeSelect.value = result.theme || 'devicestandard';
        if (langSelect) langSelect.value = result.languageMode || 'du';
        if (hideGradesCheckbox) hideGradesCheckbox.checked = result.hideGrades || false;
    });

    // Speichern bei Klick auf Button
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            const theme = themeSelect.value;
            const lang = langSelect.value;
            const hideGrades = hideGradesCheckbox.checked;
            
            chrome.storage.local.set({
                theme: theme,
                languageMode: lang,
                hideGrades: hideGrades
            }, function() {
                // Feedback geben
                const originalText = saveButton.textContent;
                saveButton.textContent = "Gespeichert!";
                saveButton.style.backgroundColor = "#2e7d32";
                
                setTimeout(() => {
                    saveButton.textContent = originalText;
                    saveButton.style.backgroundColor = "";
                }, 1500);
            });
        });
    }
});