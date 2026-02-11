/**
 * ag_modder.js - Aargau spezifische Modifikationen (BBBaden etc.)
 */

const AG_Modder = {
    /**
     * Fix für das doppelte Logo bei BBBaden
     */
    fixBBBadenLogo: function(root = document) {
        // BBBaden spezifische Logo-Elemente
        const bbbSelectors = [
            '.cls-page--header-row--logo-span img:not(.revanced-ready)',
            'img[src*="logo-bbb"]',
            'img[src*="bbb-logo"]',
            '#header-logo img'
        ];
        
        bbbSelectors.forEach(selector => {
            const logos = root.querySelectorAll ? root.querySelectorAll(selector) : [];
            logos.forEach(logo => {
                // Wenn es nicht unser Logo ist, verstecken oder ersetzen wir es
                if (!logo.src.includes('chrome-extension')) {
                    // Falls wir es nicht ersetzen können, verstecken wir es zumindest
                    // Aber eigentlich sollte Modders.replaceLogo es schon getauscht haben
                    // Wenn es ÜBEREINANDER liegt, ist es vielleicht ein anderes Element
                    logo.style.display = 'none';
                    logo.style.opacity = '0';
                }
            });
        });

        // Manchmal ist das Logo ein Hintergrundbild in einem Span oder Div
        const backgroundLogos = root.querySelectorAll ? root.querySelectorAll('.cls-page--header-row--logo-span, .header-logo') : [];
        backgroundLogos.forEach(el => {
            const style = window.getComputedStyle(el);
            if (style.backgroundImage !== 'none' && !style.backgroundImage.includes('icon128.png')) {
                el.style.backgroundImage = 'none';
            }
        });
    },

    run: function(root = document) {
        this.fixBBBadenLogo(root);
    }
};

window.AG_Modder = AG_Modder;
