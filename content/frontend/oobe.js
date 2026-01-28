// oobe.js - Ersteinrichtung für Schulnetz REvanced

const schools = [
    { id: 'ksalp', name: 'Kantonsschule Alpenquai Luzern' },
    { id: 'ksber', name: 'Kantonsschule Beromünster' },
    { id: 'ksmus', name: 'Kantonsschule Musegg Luzern' },
    { id: 'ksreu', name: 'Kantonsschule Reussbühl Luzern' },
    { id: 'kssch', name: 'Kantonsschule Schüpfheim' },
    { id: 'kssee', name: 'Kantonsschule Seetal' },
    { id: 'kssur', name: 'Kantonsschule Sursee' },
    { id: 'kswil', name: 'Kantonsschule Willisau' },
    { id: 'bbzb', name: 'BBZ Bau und Gewerbe' },
    { id: 'bbzg', name: 'BBZ Gesundheit und Soziales' },
    { id: 'bbzn', name: 'BBZ Natur und Ernährung' },
    { id: 'bbzw', name: 'BBZ Wirtschaft, Informatik und Technik' },
    { id: 'fmz', name: 'FMZ Luzern' },
    { id: 'wbzlu', name: 'WBZ Luzern' },
    { id: 'zba', name: 'ZBA Luzern' },
    { id: 'zentrale', name: 'Zentraler Mandant' }
];

let selectedSchoolId = 'bbzw';
let selectedColor = '#bb86fc';

document.addEventListener('DOMContentLoaded', () => {
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const nextBtn = document.getElementById('nextToSetup');
    const finishBtn = document.getElementById('finishOOBE');
    
    const schoolSearch = document.getElementById('schoolSearch');
    const schoolResults = document.getElementById('schoolResults');
    const themeSelect = document.getElementById('themeSelect');
    const langSelect = document.getElementById('langSelect');
    const colorDots = document.querySelectorAll('.color-dot');

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

    // Theme preview
    if (themeSelect) {
        themeSelect.addEventListener('change', () => {
            applyTheme(themeSelect.value);
        });
    }

    // Step navigation
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            step1.classList.remove('active');
            step2.classList.add('active');
        });
    }

    // School search logic
    if (schoolSearch) {
        schoolSearch.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            if (val.length < 1) {
                schoolResults.classList.remove('visible');
                return;
            }

            const filtered = schools.filter(s => 
                s.name.toLowerCase().includes(val) || s.id.toLowerCase().includes(val)
            );

            renderResults(filtered);
        });

        // Close results when clicking outside
        document.addEventListener('click', (e) => {
            if (!schoolSearch.contains(e.target) && !schoolResults.contains(e.target)) {
                schoolResults.classList.remove('visible');
            }
        });
    }

    function renderResults(list) {
        schoolResults.innerHTML = '';
        if (list.length === 0) {
            schoolResults.classList.remove('visible');
            return;
        }

        list.forEach(school => {
            const div = document.createElement('div');
            div.className = 'school-option';
            if (school.id === selectedSchoolId) div.classList.add('selected');
            div.textContent = school.name;
            div.addEventListener('click', () => {
                selectedSchoolId = school.id;
                schoolSearch.value = school.name;
                schoolResults.classList.remove('visible');
            });
            schoolResults.appendChild(div);
        });

        schoolResults.classList.add('visible');
    }

    // Color selector
    colorDots.forEach(dot => {
        dot.addEventListener('click', () => {
            colorDots.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            selectedColor = dot.getAttribute('data-color');
        });
    });

    // Finish OOBE
    if (finishBtn) {
        finishBtn.addEventListener('click', () => {
            const settings = {
                theme: themeSelect.value,
                languageMode: langSelect.value,
                schoolId: selectedSchoolId,
                accentColor: selectedColor,
                oobeCompleted: true,
                revancedEnabled: true
            };

            chrome.storage.local.set(settings, () => {
                // Close the tab or redirect to the main page
                window.location.href = 'index.html';
            });
        });
    }
    
    // Initial color setup if needed
    const defaultColorDot = document.querySelector('.color-dot.active');
    if (defaultColorDot) {
        selectedColor = defaultColorDot.getAttribute('data-color');
    }
});
