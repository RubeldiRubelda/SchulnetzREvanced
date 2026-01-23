/**
 * modders.js - Enthält alle visuellen und funktionalen Änderungen für schulnetz.lu.ch
 */

const Modders = {
    initialized: false,
    translations: [],
    observer: null,
    hideGradesActive: false,
    warningColorMode: 'standard',
    
    /**
     * Extrahiert den Handy-Login QR-Code und speichert ihn für das Addon
     * @param {Node} root - Startpunkt für die Suche
     */
    handleHandyQR: function(root = document) {
        // Erweiterte Selektoren für den QR-Code
        const qrSelectors = [
            '#qrimage_pwa_appstore img',
            '#qrimage_pwa img',
            'img.cls-page--login-qr-code',
            'img[src*="qr_img.php"]',
            'img[src*="qrcode"]'
        ];

        let qrImg = null;
        for (const selector of qrSelectors) {
            // Falls root selbst das Bild ist oder es enthält
            if (root.matches && root.matches(selector)) {
                qrImg = root;
            } else if (root.querySelector) {
                qrImg = root.querySelector(selector);
            }
            if (qrImg) break;
        }

        if (qrImg && qrImg.src) {
            // Speichere die URL im Storage
            chrome.storage.local.set({ handyQrCodeUrl: qrImg.src });
            
            // Den Container oder das Bild selbst verstecken
            const container = qrImg.closest('#qrimage_pwa_appstore') || 
                              qrImg.closest('.mdl-card') || 
                              qrImg.parentElement;
            
            if (container) {
                container.style.display = 'none';
                container.style.opacity = '0';
                container.style.pointerEvents = 'none';
            }
            qrImg.style.display = 'none';
        }
    },

    /**
     * Spezielle Styles für die Landingpage (ohne Pfad)
     */
    styleLandingPage: function() {
        // Prüfen, ob wir uns auf der Landingpage befinden
        const hasLandingContent = document.querySelector('a[href="ksalp"]') || document.querySelector('a[href="bbzw"]');
        const isLandingPath = window.location.pathname === '/' || window.location.pathname === '/index.php';
        
        if (!hasLandingContent && !isLandingPath) return;

        // Sobald wir wissen, dass es die Landingpage ist, Klasse am Body setzen
        document.body.classList.add('revanced-landingpage');
        
        // Die eigentliche Inhalts-Box finden (die mit dem blauen Hintergrund im Original)
        const contentBox = document.querySelector('div[style*="background-color: #5e80bb"]') || 
                           document.querySelector('body > div > div[style*="background-color"]') ||
                           document.querySelector('.revanced-landingpage > div');
        
        if (!contentBox) return;

        // Header hinzufügen falls nicht vorhanden
        if (!document.querySelector('.revanced-landing-header')) {
            const header = document.createElement('div');
            header.className = 'revanced-landing-header';
            header.innerHTML = `
                <div class="revanced-logo-glow"></div>
                <img src="${chrome.runtime.getURL('icons/icon128.png')}" style="width: 64px; height: 64px;">
                <h1>Schulnetz REvanced</h1>
                <p class="revanced-tagline">Dein personalisiertes Portal für den Kanton Luzern</p>
            `;
            contentBox.prepend(header);
        }

        // Footer / Info Section hinzufügen
        if (!document.querySelector('.revanced-landing-footer')) {
            const footer = document.createElement('div');
            footer.className = 'revanced-landing-footer';
            footer.innerHTML = `
                <div class="footer-grid">
                    <div class="footer-item">
                        <h3>Lokal & Sicher</h3>
                        <p>Deine Daten werden Lokal verarbeitet.</p>
                    </div>
                    <div class="footer-item">
                        <h3>Support</h3>
                        <a href="https://github.com/RubeldiRubelda/SchulnetzREvanced" target="_blank">Projekt auf GitHub</a>
                    </div>
                    <div class="footer-item">
                        <h3>Version</h3>
                        <p>${chrome.runtime.getManifest().version} ("Luzern Edition")</p>
                    </div>
                </div>
            `;
            contentBox.appendChild(footer);
        }

        // Sicherstellen, dass die Original-Zentrierung nicht stört
        const outerContainer = document.querySelector('body > div');
        if (outerContainer && outerContainer !== contentBox) {
            outerContainer.style.position = 'static';
            outerContainer.style.marginLeft = '0';
            outerContainer.style.width = '100%';
            outerContainer.style.display = 'flex';
            outerContainer.style.flexDirection = 'column';
            outerContainer.style.alignItems = 'center';
            outerContainer.style.justifyContent = 'center';
            outerContainer.style.minHeight = '100vh';
        }
    },

    /**
     * Ersetzt das Schulnetz-Logo durch das REvanced-Logo
     * @param {Node} root - Startpunkt für die Suche
     */
    replaceLogo: function(root = document) {
        const logoSelectors = [
            'img.cls-page--header-row--sn-logo',
            'img[src*="snlogo-192x192.png"]',
            'img[src*="snlogo"]',
            'img[src*="favicon"]'
        ];
        
        const swap = (img) => {
            const newSrc = chrome.runtime.getURL('icons/icon128.png');
            if (img.src !== newSrc) {
                img.src = newSrc;
                img.classList.add('revanced-ready');
            }
        };

        const selectorString = logoSelectors.join(',');

        if (root.nodeType === 1 && root.matches(selectorString)) {
            swap(root);
        }
        
        if (root.querySelectorAll) {
            const found = root.querySelectorAll(selectorString);
            found.forEach(swap);
        }
    },

    /**
     * Verarbeitet einen einzelnen Textknoten
     */
    processTextNode: function(node, mappings) {
        if (!node || node.nodeType !== 3 || !mappings || mappings.length === 0) return;
        
        let content = node.nodeValue;
        if (!content || content.trim() === '') return;

        let changed = false;

        mappings.forEach(m => {
            if (m.old instanceof RegExp) {
                if (m.old.test(content)) {
                    content = content.replace(m.old, m.new);
                    changed = true;
                }
            } else if (content.includes(m.old)) {
                content = content.split(m.old).join(m.new);
                changed = true;
            }
        });

        if (changed) {
            node.nodeValue = content;
        }
    },

    /**
     * Ersetzt Texte in einem DOM-Bereich
     */
    replaceTexts: function(mappings, root = document.body) {
        if (!mappings || mappings.length === 0 || !root) return;

        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while (node = walker.nextNode()) {
            this.processTextNode(node, mappings);
        }
    },

    /**
     * Versteckt Noten, bis sie angeklickt werden
     */
    applyGradeHider: function(root = document) {
        // Falls weder HideGrades noch Warnfarben aktiv sind, können wir abbrechen
        if (!this.hideGradesActive && (!this.warningColorMode || this.warningColorMode === 'standard')) return;

        // Selektoren für Schulnetz Noten-Elemente
        const selectors = [
            'td.cls-noten--note-cell',
            'span.cls-noten--note',
            '.cls-page--last-grades-note',
            '.cls-noten--note',
            '.cls-noten--note-value',
            '.cls-page--table-noten-note'
        ];

        let elements = [];
        if (root.querySelectorAll) {
            elements = Array.from(root.querySelectorAll(selectors.join(',')));
            
            // Zusätzlich alle Tabellenzellen prüfen, die wie Noten aussehen
            const cells = root.querySelectorAll('td');
            cells.forEach(td => {
                const text = td.innerText.trim().replace(',', '.');
                
                // Prüfen, ob es eine Gewichtung ist (Spaltenüberschrift prüfen)
                const table = td.closest('table');
                if (table) {
                    const index = td.cellIndex;
                    const header = table.querySelectorAll('th')[index] || table.querySelector('thead tr')?.children[index];
                    if (header && (header.innerText.toLowerCase().includes('gewicht') || header.innerText.toLowerCase().includes('weight'))) {
                        return; // Gewichtung überspringen
                    }
                }

                // Erkenne Zahlen von 1.0 bis 6.0
                if (/^[1-6](\.[0-9]+)?$/.test(text)) {
                    if (!elements.includes(td)) elements.push(td);
                }
            });
        }

        elements.forEach(el => {
            const text = el.innerText.trim().replace(',', '.');
            const gradeNum = parseFloat(text);

            // Warnfarben für schlechte Noten (< 4.0)
            if (!isNaN(gradeNum) && gradeNum < 4.0 && gradeNum > 0 && this.warningColorMode && this.warningColorMode !== 'standard') {
                el.classList.remove('revanced-grade-warning-softred', 'revanced-grade-warning-alarmred', 'revanced-grade-warning-darkred');
                
                if (this.warningColorMode === 'softred') el.classList.add('revanced-grade-warning-softred');
                else if (this.warningColorMode === 'alarmred') el.classList.add('revanced-grade-warning-alarmred');
                else if (this.warningColorMode === 'darkred') el.classList.add('revanced-grade-warning-darkred');
            }

            // Falls die Note zu lang ist (z.B. 4.066666...), runden wir sie für die Optik
            if (/^[1-6]\.[0-9]{4,}$/.test(text)) {
                const rounded = parseFloat(text).toFixed(3);
                el.innerText = rounded;
                el.title = `Original: ${text}`;
            }

            if (this.hideGradesActive) {
                this.hideElementGrade(el);
            }
        });
    },

    /**
     * Hilfsfunktion zum Verstecken eines einzelnen Elements
     */
    hideElementGrade: function(el) {
        if (!el || el.classList.contains('revanced-grade-hidden') || el.classList.contains('revanced-grade-visible')) return;
        
        // Nur verstecken, wenn wirklich Text drin ist
        if (el.innerText.trim() === '') return;

        el.classList.add('revanced-grade-hidden');
        el.title = 'Klicken zum Anzeigen';
        
        const reveal = (e) => {
            e.preventDefault();
            e.stopPropagation();
            el.classList.remove('revanced-grade-hidden');
            el.classList.add('revanced-grade-visible');
            el.title = '';
            el.removeEventListener('click', reveal);
        };

        el.addEventListener('click', reveal);
    },

    /**
     * Aktiviert den Darkmode auf der Webseite
     */
    applyDarkMode: function(theme) {
        const isDark = theme === 'dark' || (theme === 'devicestandard' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        if (isDark) {
            document.documentElement.classList.add('revanced-dark');
        } else {
            document.documentElement.classList.remove('revanced-dark');
        }
    },

    /**
     * Wendet die Akzentfarbe an
     */
    applyAccentColor: function(color) {
        if (!color) return;
        
        // CSS Variable im :root setzen
        document.documentElement.style.setProperty('--accent', color);
        
        // Hover-Farbe berechnen (etwas heller)
        // Einfache Methode für Hex-Farben
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            const hoverColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
            document.documentElement.style.setProperty('--accent-hover', hoverColor);
        }
    },

    /**
     * Ändert das Favicon der Seite
     */
    faviconChange: function() {
        const iconUrl = chrome.runtime.getURL('icons/icon128.png');
        const links = document.querySelectorAll("link[rel*='icon']");
        
        if (links.length > 0) {
            links.forEach(link => link.href = iconUrl);
        } else {
            const link = document.createElement('link');
            link.rel = 'icon';
            link.href = iconUrl;
            document.head.appendChild(link);
        }
    },

    /**
     * Startet den Beobachter für dynamische Änderungen
     */
    initObserver: function() {
        if (this.observer) return;

        this.observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element
                            this.replaceLogo(node);
                            this.replaceTexts(this.translations, node);
                            this.applyGradeHider(node);
                            this.handleHandyQR(node);
                            this.styleLandingPage(); // Sicherstellen, dass Landingpage-Elemente erkannt werden
                        } else if (node.nodeType === 3) { // Text
                            this.processTextNode(node, this.translations);
                        }
                    });
                } else if (mutation.type === 'characterData') {
                    this.processTextNode(mutation.target, this.translations);
                    this.styleLandingPage();
                }
            }
        });

        this.observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            characterData: true
        });
    },

    /**
     * Hauptfunktion: Lädt Einstellungen und führt Modifizierungen aus
     */
    runAll: function() {
        if (this.initialized) return;

        chrome.storage.local.get(['revancedEnabled', 'theme', 'languageMode', 'hideGrades', 'accentColor', 'warningColorMode'], (result) => {
            if (result.revancedEnabled === false) return;

            this.applyDarkMode(result.theme || 'devicestandard');
            this.applyAccentColor(result.accentColor || '#bb86fc');
            this.faviconChange();
            this.hideGradesActive = result.hideGrades || false;
            this.warningColorMode = result.warningColorMode || 'standard';

            // Übersetzungen laden
            let rawTranslations = [];
            const langMode = result.languageMode || 'du';
            if (langMode === 'du' && window.REvanced_Translations_Du) {
                rawTranslations = window.REvanced_Translations_Du;
            } else if (langMode === 'sie' && window.REvanced_Translations_Sie) {
                rawTranslations = window.REvanced_Translations_Sie;
            }

            // Mappings nach Länge sortieren (längere zuerst), um Kollisionen zu vermeiden
            this.translations = [...rawTranslations].sort((a, b) => {
                const lenA = (typeof a.old === 'string') ? a.old.length : (a.old.source ? a.old.source.length : 0);
                const lenB = (typeof b.old === 'string') ? b.old.length : (b.old.source ? b.old.source.length : 0);
                return lenB - lenA;
            });

            this.replaceLogo();
            
            const scan = () => {
                if (document.body) {
                    this.replaceTexts(this.translations, document.body);
                    this.applyGradeHider(document.body);
                    this.handleHandyQR(document.body);
                    this.styleLandingPage();
                    this.initObserver();
                } else {
                    setTimeout(scan, 10);
                }
            };
            scan();
            this.initialized = true;
        });
    }
};

// Starten
Modders.runAll();
window.Modders = Modders;
