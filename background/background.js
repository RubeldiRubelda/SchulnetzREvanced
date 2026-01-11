// Schulnetz REvanced Background Script

chrome.runtime.onInstalled.addListener(() => {
    console.log('Schulnetz REvanced installiert.');
    // Standardmäßig aktivieren
    chrome.storage.local.get(['revancedEnabled'], function(result) {
        if (result.revancedEnabled === undefined) {
            chrome.storage.local.set({ revancedEnabled: true });
        }
    });
});

// Listener für Nachrichten vom Popup oder Content Script (falls nötig)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getStatus") {
        chrome.storage.local.get(['revancedEnabled'], function(result) {
            sendResponse({ enabled: result.revancedEnabled !== false });
        });
        return true; // Hält den Kanal offen für asynchrone Antwort
    }
});