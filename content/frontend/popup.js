// popup.js - Skript für das Hauptmenü (index.html)

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
    // Versionsnummer aus Manifest laden
    const versionSpan = document.getElementById('addonVersion');
    if (versionSpan) {
        versionSpan.textContent = chrome.runtime.getManifest().version;
    }

    // Theme laden
    chrome.storage.local.get(['theme'], (result) => {
        applyTheme(result.theme || 'devicestandard');
    });

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
    const openSchulnetzBtn = document.getElementById('openSchulnetz');

    if (openSchulnetzBtn) {
        openSchulnetzBtn.addEventListener('click', () => {
            chrome.storage.local.get(['schoolId'], (result) => {
                const schoolId = result.schoolId || 'bbzw';
                let targetUrl = `https://schulnetz.lu.ch/${schoolId}`;
                
                // Suche die URL in der Schools Liste
                if (window.Schools) {
                    const school = window.Schools.find(s => s.id === schoolId);
                    if (school && school.url) {
                        targetUrl = school.url;
                    }
                }
                
                window.open(targetUrl, '_blank');
            });
        });
    }

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
                    qrImage.src = result.handyQrCodeUrl;
                    qrImage.style.display = 'block';
                    qrPlaceholder.style.display = 'none';
                } else {
                    // Kein QR Code gefunden - Placeholder wird bereits angezeigt
                    qrImage.style.display = 'none';
                    qrPlaceholder.style.display = 'block';
                }
            });
        });

        if (closeBtn) {
            closeBtn.onclick = () => qrModal.style.display = 'none';
        }
    }

    // Modal click-outside handler
    window.onclick = (event) => {
        if (qrModal && event.target == qrModal) {
            qrModal.style.display = 'none';
        }
        if (calendarModal && event.target == calendarModal) {
            calendarModal.style.display = 'none';
        }
    };

    // Calendar logic
    const calendarButton = document.getElementById('calendarButton');
    const calendarModal = document.getElementById('calendarModal');
    const calendarLinksContainer = document.getElementById('calendarLinks');
    const closeCalendarBtn = document.querySelector('.close-calendar');

    if (calendarButton && calendarModal) {
        calendarButton.addEventListener('click', () => {
            calendarModal.style.display = 'block';
            
            // Lade Links aus Storage
            chrome.storage.local.get(['stundenplanLinks'], (result) => {
                calendarLinksContainer.innerHTML = '';
                
                if (result.stundenplanLinks && (result.stundenplanLinks.email || result.stundenplanLinks.sperren)) {
                    if (result.stundenplanLinks.email) {
                        const emailBtn = document.createElement('a');
                        emailBtn.href = result.stundenplanLinks.email;
                        emailBtn.target = '_blank';
                        emailBtn.className = 'calendar-action-btn';
                        emailBtn.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
                            </svg>
                            Per E-Mail senden
                        `;
                        calendarLinksContainer.appendChild(emailBtn);

    
                    }
                    
                    if (result.stundenplanLinks.sperren) {
                        const sperrenBtn = document.createElement('a');
                        sperrenBtn.href = result.stundenplanLinks.sperren;
                        sperrenBtn.target = '_blank';
                        sperrenBtn.className = 'calendar-action-btn danger';
                        sperrenBtn.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"/>
                                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                            </svg>
                            Stundenplan-Abo sperren
                        `;
                        calendarLinksContainer.appendChild(sperrenBtn);
                    }
                } else {
                    calendarLinksContainer.innerHTML = '<p class="empty-msg">Noch keine Daten vorhanden.<br><br>Bitte lade die Schulnetz-Startseite einmal neu, damit das Addon die Links finden kann.</p>';
                }
            });
        });

        if (closeCalendarBtn) {
            closeCalendarBtn.onclick = () => calendarModal.style.display = 'none';
        }
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
                updateStatusText(enabled);
                
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

    function updateStatusText(enabled) {
        if (statusText) {
            statusText.textContent = enabled ? "Aktiviert" : "Deaktiviert";
            statusText.style.color = enabled ? "#4CAF50" : "#f44336";
        }
    }

    // Update Banner Logic
    function checkAndDisplayUpdateBanner() {
        chrome.storage.local.get(['updateAvailable', 'latestVersion', 'latestReleaseUrl'], (result) => {
            const updateBanner = document.getElementById('updateBanner');
            const updateDownloadBtn = document.getElementById('updateDownloadBtn');
            const updateCloseBtn = document.getElementById('updateCloseBtn');
            const newVersionSpan = document.getElementById('newVersion');

            if (result.updateAvailable) {
                newVersionSpan.textContent = result.latestVersion;
                updateBanner.style.display = 'block';

                updateDownloadBtn.addEventListener('click', () => {
                    chrome.tabs.create({ url: result.latestReleaseUrl });
                    updateBanner.style.display = 'none';
                });

                updateCloseBtn.addEventListener('click', () => {
                    updateBanner.style.display = 'none';
                });
            }
        });
    }

    // Beim Laden das Update-Banner prüfen
    checkAndDisplayUpdateBanner();
});