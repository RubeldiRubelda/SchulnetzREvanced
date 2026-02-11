/**
 * modders.js - Enthält alle visuellen und funktionalen Änderungen für schulnetz.lu.ch
 */

const Modders = {
    initialized: false,
    translations: [],
    observer: null,
    hideGradesActive: false,
    warningColorMode: 'standard',
    currentSchoolId: null,
    currentCantonId: null,
    
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
     * Extrahiert die Stundenplan-Abo Links und speichert sie für das Addon
     */
    handleStundenplanAbo: function(root = document) {
        const mobileCard = root.querySelector ? root.querySelector('#sn_mobile') : (root.id === 'sn_mobile' ? root : null);
        if (!mobileCard) return;

        const emailLink = mobileCard.querySelector('a[href*="action=cal"]');
        const sperrenLink = mobileCard.querySelector('a[href*="action=sperren"]');

        const links = {
            email: emailLink ? emailLink.href : null,
            sperren: sperrenLink ? sperrenLink.href : null
        };

        if (links.email || links.sperren) {
            chrome.storage.local.set({ stundenplanLinks: links });
        }
    },

    /**
     * Spezielle Styles für die Landingpage (Delegiert an Kantons-Modder)
     */
    styleLandingPage: function(root = document) {
        if (this.currentCantonId === 'LU' && window.LU_Modder) {
            window.LU_Modder.styleLandingPage(root);
        }
        
        // Schul-spezifische Modder rufen
        if (this.currentCantonId === 'AG' && window.AG_Modder) {
            window.AG_Modder.run(root);
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
                            this.handleStundenplanAbo(node);
                            this.styleLandingPage();
                            this.cleanupStartPage();
                            this.styleSettingsPage();
                            this.removeWhiteBackgrounds();
                        } else if (node.nodeType === 3) { // Text
                            this.processTextNode(node, this.translations);
                        }
                    });
                } else if (mutation.type === 'characterData') {
                    this.processTextNode(mutation.target, this.translations);
                    this.styleLandingPage();
                    this.styleSettingsPage();
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
     * Räumt die Startseite auf (entfernt leere Platzhalter und zieht Container hoch)
     */
    cleanupStartPage: function() {
        if (!document.querySelector('#startMenu')) return;
        
        // Entferne leere mdl-cell--12-col Spacer
        document.querySelectorAll('#startMenu .mdl-cell--12-col').forEach(spacer => {
            if (spacer.children.length === 0 || (spacer.innerHTML.trim() === '' && !spacer.innerText.trim())) {
                spacer.style.display = 'none';
            }
        });
        
        // Suche nach leeren mdl-grid oder mdl-cell
        document.querySelectorAll('#startMenu .mdl-cell').forEach(cell => {
             // Wenn die Zelle nur Textknoten mit Whitespace hat oder komplett leer ist
             if (cell.innerHTML.trim() === '' && cell.childNodes.length > 0) {
                 cell.style.display = 'none';
             }
        });

        // Die Startseite ist ein mdl-grid.
        const grid = document.querySelector('#startMenu.mdl-grid');
        if (grid) {
            grid.style.display = 'flex';
            grid.style.flexWrap = 'wrap';
            grid.style.alignContent = 'flex-start';
            grid.style.padding = '10px';
        }
    },

    /**
     * Hauptfunktion: Lädt Einstellungen und führt Modifizierungen aus
     */
    runAll: function(schoolId = 'bbzw', cantonId = 'LU') {
        if (this.initialized) return;
        
        this.currentSchoolId = schoolId;
        this.currentCantonId = cantonId;

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
                    this.handleStundenplanAbo(document.body);
                    this.styleLandingPage();
                    this.cleanupStartPage();
                    this.initObserver();
                    this.styleSettingsPage();
                } else {
                    setTimeout(scan, 10);
                }
            };
            scan();
            this.initialized = true;
        });
    },

    /**
     * Spezielle Styles für die "Mein schulNetz" / "Mein REvanced" Seite
     */
    styleSettingsPage: function() {
        if (!document.querySelector('.cls-form') || !document.getElementById('frm-header-line')) return;

        // NUR im Dark Mode die speziellen Styles anwenden
        const isDarkMode = document.documentElement.classList.contains('revanced-dark');

        // Header verschönern (nur im Dark Mode)
        const header = document.getElementById('frm-header-line');
        if (header && !header.classList.contains('styles-applied') && isDarkMode) {
            header.classList.add('styles-applied');
            
            // Icon vor den Titel setzen (optional)
            const title = header.querySelector('h3');
            if (title && !title.querySelector('i')) {
                const icon = document.createElement('i');
                icon.className = 'fas fa-user-gear';
                icon.style.marginRight = '12px';
                icon.style.color = 'var(--accent)';
                title.prepend(icon);
            }
        }

        // Formgroups optimieren (nur im Dark Mode)
        if (isDarkMode) {
            const cards = document.querySelectorAll('.mdl-card--cls-form');
            cards.forEach(card => {
                // Dropdown-Button (Chevron) Styling fix
                const toggleBtn = card.querySelector('span[onclick*="toggleFormGroup"]');
                if (toggleBtn) {
                    toggleBtn.style.cursor = 'pointer';
                    toggleBtn.style.display = 'flex';
                    toggleBtn.style.alignItems = 'center';
                    toggleBtn.style.justifyContent = 'space-between';
                    toggleBtn.style.width = '100%';
                }
            });
        }

        // WICHTIG: Alle weißen Hintergründe entfernen (nur im Dark Mode)
        this.removeWhiteBackgrounds();
    },

    /**
     * Entfernt alle weißen Hintergründe von Elementen - NUR im Dark Mode!
     */
    removeWhiteBackgrounds: function() {
        const isDarkMode = document.documentElement.classList.contains('revanced-dark');
        
        // Wenn Light Mode: Inline-Styles entfernen (Reset)
        if (!isDarkMode) {
            // Alle Elemente mit gesetzten Inline-Styles zurücksetzen
            document.querySelectorAll('.cls-field-infos').forEach(el => {
                el.style.removeProperty('background-color');
                el.style.removeProperty('color');
            });
            document.querySelectorAll('div[style*="overflow"]').forEach(el => {
                // Nur die von uns gesetzten Properties entfernen
                el.style.removeProperty('border-radius');
            });
            document.querySelectorAll('.cls-field-infos label, div[style*="overflow"] label').forEach(el => {
                el.style.removeProperty('color');
                el.style.removeProperty('background-color');
            });
            const buttonsContainer = document.getElementById('buttons-container');
            if (buttonsContainer) {
                buttonsContainer.style.removeProperty('background-color');
            }
            return;
        }

        // Dark Mode: Styles anwenden

        // Alle Elemente mit cls-field-infos (Checkbox-Listen)
        document.querySelectorAll('.cls-field-infos').forEach(el => {
            el.style.backgroundColor = '#121212';
            el.style.color = '#e0e0e0';
        });

        // Alle overflow:auto divs (Listboxen)
        document.querySelectorAll('div[style*="overflow"]').forEach(el => {
            if (el.style.overflow === 'auto' || el.style.overflowY === 'auto') {
                el.style.backgroundColor = '#121212';
                el.style.color = '#e0e0e0';
                el.style.border = '1px solid #333';
                el.style.borderRadius = '8px';
            }
        });

        // Alle Labels in diesen Bereichen
        document.querySelectorAll('.cls-field-infos label, div[style*="overflow"] label').forEach(el => {
            el.style.color = '#e0e0e0';
            el.style.backgroundColor = 'transparent';
        });

        // Buttons-Container
        const buttonsContainer = document.getElementById('buttons-container');
        if (buttonsContainer) {
            buttonsContainer.style.backgroundColor = '#1e1e1e';
        }

        // Global container und alle children
        const globalContainer = document.getElementById('global-container');
        if (globalContainer) {
            // Alle main-Elemente darin
            globalContainer.querySelectorAll('main').forEach(main => {
                main.style.backgroundColor = '#121212';
            });
            
            // Alle divs die direct children sind
            globalContainer.querySelectorAll(':scope > main > div, :scope > main > main').forEach(el => {
                el.style.backgroundColor = '#121212';
            });
        }

        // nav-drawer und seine Kinder
        const navDrawer = document.getElementById('nav-drawer');
        if (navDrawer) {
            navDrawer.style.backgroundColor = '#121212';
            navDrawer.querySelectorAll('main, :scope > div').forEach(el => {
                el.style.backgroundColor = '#121212';
            });
        }

        // Alle br-Elemente nach dem Formular entfernen
        document.querySelectorAll('.cls-form ~ br, form ~ br, #cls-form ~ br').forEach(br => {
            br.style.display = 'none';
        });

        // Sticky Header Fix - Position zurücksetzen
        const stickyHeader = document.querySelector('.cls-form--header-line');
        if (stickyHeader) {
            stickyHeader.style.position = 'relative';
            stickyHeader.style.zIndex = '1';
        }
    }
};

// window.Modders = Modders wird im Content Script genutzt
window.Modders = Modders;
