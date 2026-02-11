/**
 * lu_modder.js - Luzern spezifische Modifikationen
 */

const LU_Modder = {
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
    }
};

window.LU_Modder = LU_Modder;
