/**
 * modders.js - Enthält alle visuellen und funktionalen Änderungen für schulnetz.lu.ch
 */

const Modders = {
    initialized: false,
    
    /**
     * Ersetzt das Schulnetz-Logo durch das REvanced-Logo
     */
    replaceLogo: function() {
        const logoSelector = 'img.cls-page--header-row--sn-logo';
        
        const swap = (img) => {
            const newSrc = chrome.runtime.getURL('icons/icon128.png');
            if (img.src !== newSrc) {
                img.src = newSrc;
                img.classList.add('revanced-ready');
                console.log("Schulnetz REvanced: Logo wurde blitzschnell ersetzt.");
            }
        };

        // 1. Sofort versuchen, falls es schon da ist
        const existingLogo = document.querySelector(logoSelector);
        if (existingLogo) {
            swap(existingLogo);
        }

        // 2. MutationObserver, um es zu erwischen, sobald es im DOM landet
        if (!this.observer) {
            this.observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === 1) { // ELEMENT_NODE
                            if (node.matches && node.matches(logoSelector)) {
                                swap(node);
                            } else {
                                const found = node.querySelector ? node.querySelector(logoSelector) : null;
                                if (found) swap(found);
                            }
                        }
                    }
                }
            });

            this.observer.observe(document.documentElement, {
                childList: true,
                subtree: true
            });
        }
    },

    /**
     * Führt alle Modifikationen aus
     */
    runAll: function() {
        if (this.initialized) return;
        this.replaceLogo();
        // Hier können weitere Modifikationen hinzugefügt werden
        this.initialized = true;
    }
};

// Exportieren für die Verwendung im contentScript.js
window.Modders = Modders;
