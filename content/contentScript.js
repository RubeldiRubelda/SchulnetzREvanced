// Schulnetz REvanced Content Script

function init() {
    chrome.storage.local.get(['revancedEnabled', 'schoolId'], function(result) {
        const enabled = result.revancedEnabled !== false;
        if (enabled) {
            // Detect school from URL or use saved schoolId
            const currentUrl = window.location.href;
            let school = null;
            
            if (window.Schools) {
                school = window.Schools.find(s => currentUrl.startsWith(s.url));
            }
            
            const schoolId = school ? school.id : (result.schoolId || 'bbzw');
            const cantonId = school ? school.canton : 'LU';

            // Add school and canton classes to body
            ensureBodyClass(`school-${schoolId}`);
            ensureBodyClass(`canton-${cantonId}`);

            // Modders sofort starten
            if (window.Modders) {
                window.Modders.runAll(schoolId, cantonId);
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
            // Darkmode entfernen, wenn Addon aus
            document.documentElement.classList.remove('revanced-dark');
        }
    }
    
    if (changes.theme && window.Modders) {
        window.Modders.applyDarkMode(changes.theme.newValue);
    }

    if (changes.accentColor && window.Modders) {
        window.Modders.applyAccentColor(changes.accentColor.newValue);
    }

    if (changes.warningColorMode && window.Modders) {
        window.Modders.warningColorMode = changes.warningColorMode.newValue;
        if (document.body) window.Modders.applyGradeHider(document.body);
    }
});

init();