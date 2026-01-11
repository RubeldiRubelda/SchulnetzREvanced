// Schulnetz REvanced Content Script

function init() {
    chrome.storage.local.get(['revancedEnabled'], function(result) {
        const enabled = result.revancedEnabled !== false;
        if (enabled) {
            // Modders sofort starten (nutzt MutationObserver für frühe Elemente)
            if (window.Modders) {
                window.Modders.runAll();
            }
            
            // Warten bis Body da ist für die CSS-Klasse
            ensureBodyClass('revanced-active');
        } else {
            ensureBodyClass('revanced-disabled');
        }
    });
}

function ensureBodyClass(className) {
    if (document.body) {
        document.body.classList.add(className);
    } else {
        // Falls Body noch nicht da ist, auf DOMContentLoaded warten
        document.addEventListener('DOMContentLoaded', () => {
            document.body.classList.add(className);
        });
    }
}

function applyModifications() {
    // Diese Funktion wird nun indirekt über init gesteuert
}

function removeModifications() {
    if (document.body) {
        document.body.classList.remove('revanced-active');
        document.body.classList.add('revanced-disabled');
    }
}

// Auf Änderungen reagieren
chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (changes.revancedEnabled) {
        if (changes.revancedEnabled.newValue) {
            if (window.Modders) window.Modders.runAll();
            ensureBodyClass('revanced-active');
            document.body.classList.remove('revanced-disabled');
        } else {
            removeModifications();
            document.body.classList.remove('revanced-active');
        }
    }
});

init();