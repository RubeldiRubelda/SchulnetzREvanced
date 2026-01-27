// Schulnetz REvanced Background Script

// Konfiguration für GitHub Release Checker
const GITHUB_REPO = 'RubeldiRubelda/SchulnetzREvanced';
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
const CHECK_INTERVAL_HOURS = 6; // Alle 6 Stunden prüfen

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        chrome.tabs.create({
            url: chrome.runtime.getURL("content/frontend/oobe.html")
        });
    }

    // Standardmäßig aktivieren
    chrome.storage.local.get(['revancedEnabled'], function(result) {
        if (result.revancedEnabled === undefined) {
            chrome.storage.local.set({ revancedEnabled: true });
        }
    });
    
    // Beim ersten Install sofort auf Updates prüfen
    checkForUpdates();
    
    // Alarm für regelmäßige Update-Checks setzen
    chrome.alarms.create('checkUpdates', { periodInMinutes: CHECK_INTERVAL_HOURS * 60 });
});

// Regelmäßig auf Updates prüfen
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'checkUpdates') {
        checkForUpdates();
    }
});

// Funktion zum Prüfen von Updates
async function checkForUpdates() {
    try {
        const response = await fetch(GITHUB_API_URL);
        const latestRelease = await response.json();
        
        if (!response.ok) {
            console.error('GitHub API Error:', latestRelease);
            return;
        }
        
        // Parse Version aus verschiedenen Formaten: v1.0.0, Version1-0-0, 1.0.0 usw.
        let latestVersion = latestRelease.tag_name;
        // Entferne alle nicht-numerischen Zeichen außer Punkten am Anfang
        latestVersion = latestVersion.replace(/^[^0-9]+/i, ''); // Entferne nicht-numerische Zeichen am Anfang
        latestVersion = latestVersion.replace(/-/g, '.'); // Ersetze Bindestriche durch Punkte
        latestVersion = latestVersion.trim();
        
        const currentVersion = chrome.runtime.getManifest().version;
        
        console.log('GitHub Tag:', latestRelease.tag_name);
        console.log('Parsed Latest Version:', latestVersion);
        console.log('Current Version:', currentVersion);
        
        // Speichere die neueste verfügbare Version
        chrome.storage.local.set({
            latestVersion: latestVersion,
            latestReleaseUrl: latestRelease.html_url,
            lastUpdateCheck: new Date().toISOString()
        });
        
        // Vergleiche Versionen
        if (isNewerVersion(latestVersion, currentVersion)) {
            // Zeige Badge und speichere Update-Info
            chrome.storage.local.set({ updateAvailable: true });
            chrome.action.setBadgeText({ text: '!' });
            chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
            
            // Optional: Benachrichtigung anzeigen
            chrome.notifications.create('updateAvailable', {
                type: 'basic',
                iconUrl: 'icons/icon128.png',
                title: 'Schulnetz REVANCED Update verfügbar',
                message: `Version ${latestVersion} ist jetzt verfügbar!`,
                buttons: [
                    { title: 'Jetzt herunterladen' },
                    { title: 'Später' }
                ]
            });
        } else {
            chrome.storage.local.set({ updateAvailable: false });
            chrome.action.setBadgeText({ text: '' });
        }
    } catch (error) {
        console.error('Update check failed:', error);
    }
}

// Hilfsfunktion: Vergleiche zwei Versionsnummern
function isNewerVersion(latestVersion, currentVersion) {
    try {
        const latest = latestVersion.split('.').map(part => parseInt(part) || 0);
        const current = currentVersion.split('.').map(part => parseInt(part) || 0);
        
        // Fülle auf die gleiche Länge mit 0en auf
        const maxLen = Math.max(latest.length, current.length);
        while (latest.length < maxLen) latest.push(0);
        while (current.length < maxLen) current.push(0);
        
        // Vergleiche jede Komponente
        for (let i = 0; i < maxLen; i++) {
            if (latest[i] > current[i]) return true;
            if (latest[i] < current[i]) return false;
        }
        
        return false;
    } catch (error) {
        console.error('Version comparison error:', error);
        return false;
    }
}

// Benachrichtigungsklicks verarbeiten
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
    if (notificationId === 'updateAvailable') {
        chrome.storage.local.get(['latestReleaseUrl'], (result) => {
            if (buttonIndex === 0) {
                // "Jetzt herunterladen" geklickt
                chrome.tabs.create({ url: result.latestReleaseUrl });
            }
        });
        chrome.notifications.clear(notificationId);
    }
});