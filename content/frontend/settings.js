// settings.js - Skript für die Einstellungsseite

function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    } else if (theme === 'light') {
        document.body.classList.remove('dark-mode');
    } else {
        // Devicestandard
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Theme laden
    chrome.storage.local.get(['theme'], (result) => {
        applyTheme(result.theme || 'devicestandard');
    });

    const themeSelect = document.getElementById('theme');
    const langSelect = document.getElementById('languageMode');
    const schoolSelect = document.getElementById('schoolId');
    const hideGradesCheckbox = document.getElementById('hideGrades');
    const accentColorInput = document.getElementById('accentColor');
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

    chrome.storage.local.get(['theme', 'languageMode', 'schoolId', 'hideGrades', 'accentColor', 'warningColorMode'], function(result) {
        if (themeSelect) themeSelect.value = result.theme || 'devicestandard';
        if (langSelect) langSelect.value = result.languageMode || 'du';
        if (schoolSelect) schoolSelect.value = result.schoolId || 'bbzw';
        if (hideGradesCheckbox) hideGradesCheckbox.checked = result.hideGrades || false;
        if (accentColorInput) {
            const color = result.accentColor || '#bb86fc';
            accentColorInput.value = color;
            updateActiveColorDot(color);
        }
        
        const warningMode = result.warningColorMode || 'standard';
        updateActiveWarningDot(warningMode);
    });

    // Color Preset Logic (Accent Color)
    const colorDots = document.querySelectorAll('#colorPresets .color-dot:not(.selector)');
    const customColorInput = document.getElementById('accentColor');

    colorDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const color = dot.getAttribute('data-color');
            if (customColorInput) customColorInput.value = color;
            updateActiveColorDot(color);
        });
    });

    // Warning Color Preset Logic
    const warningDots = document.querySelectorAll('#warningPresets .color-dot');
    let selectedWarningMode = 'standard';

    warningDots.forEach(dot => {
        dot.addEventListener('click', () => {
            selectedWarningMode = dot.getAttribute('data-mode');
            updateActiveWarningDot(selectedWarningMode);
        });
    });

    function updateActiveWarningDot(mode) {
        selectedWarningMode = mode;
        const container = document.getElementById('warningPresets');
        if (container) {
            container.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
            const activeDot = container.querySelector(`.color-dot[data-mode="${mode}"]`);
            if (activeDot) activeDot.classList.add('active');
        }
    }

    if (customColorInput) {
        customColorInput.addEventListener('input', () => {
            updateActiveColorDot(customColorInput.value);
        });
    }

    function updateActiveColorDot(color) {
        if (!color) return;
        
        const container = document.getElementById('colorPresets');
        if (!container) return;

        container.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
        
        const normalizedColor = color.toLowerCase();
        const activeDot = container.querySelector(`.color-dot[data-color="${normalizedColor}"]`);
        
        const selector = container.querySelector('.color-dot.selector');
        if (activeDot) {
            activeDot.classList.add('active');
            if (selector) selector.style.backgroundColor = ''; // Reset custom color preview
        } else {
            // Wenn keine vordefinierte Farbe, dann den Selector markieren
            if (selector) {
                selector.classList.add('active');
                selector.style.backgroundColor = color; // Zeige die gewählte Farbe im Selector
                selector.style.backgroundBlendMode = 'overlay';
            }
        }
    }

    // Speichern bei Klick auf Button
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            const theme = themeSelect.value;
            const lang = langSelect.value;
            const schoolId = schoolSelect ? schoolSelect.value : 'bbzw';
            const hideGrades = hideGradesCheckbox.checked;
            const accentColor = customColorInput ? customColorInput.value : '#bb86fc';
            const warningColorMode = selectedWarningMode;
            
            chrome.storage.local.set({
                theme: theme,
                languageMode: lang,
                schoolId: schoolId,
                hideGrades: hideGrades,
                accentColor: accentColor,
                warningColorMode: warningColorMode
            }, function() {
                applyTheme(theme);
                // Feedback geben
                const originalText = saveButton.textContent;
                saveButton.textContent = "Gespeichert!";
                saveButton.style.backgroundColor = "#2e7d32";
                
                setTimeout(() => {
                    saveButton.textContent = originalText;
                    saveButton.style.backgroundColor = "";
                }, 1500);

                // Refresh all tabs where Schulnetz REvanced is active
                const manifest = chrome.runtime.getManifest();
                const patterns = manifest.content_scripts[0].matches;
                
                chrome.tabs.query({ url: patterns }, function(tabs) {
                    tabs.forEach(tab => {
                        chrome.tabs.reload(tab.id);
                    });
                });
            });
        });
    }
});