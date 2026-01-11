// Schulnetz REvanced Background Script

chrome.runtime.onInstalled.addListener(() => {
    // Standardmäßig aktivieren
    chrome.storage.local.get(['revancedEnabled'], function(result) {
        if (result.revancedEnabled === undefined) {
            chrome.storage.local.set({ revancedEnabled: true });
        }
    });
});