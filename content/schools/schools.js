/**
 * schools.js - Centralized school and canton configuration
 */

const Cantons = [
    { id: 'LU', name: 'Luzern' },
    { id: 'AG', name: 'Aargau' },
    { id: 'BE', name: 'Bern' },
    { id: 'ZH', name: 'Zürich' },
    { id: 'ZG', name: 'Zug' },
    { id: 'SZ', name: 'Schwyz' },
    { id: 'UR', name: 'Uri' },
    { id: 'NW', name: 'Nidwalden' },
    { id: 'OW', name: 'Obwalden' }
];

const Schools = [
    // Luzern
    { id: 'ksalp', name: 'Kantonsschule Alpenquai Luzern', canton: 'LU', url: 'https://schulnetz.lu.ch/ksalp' },
    { id: 'ksber', name: 'Kantonsschule Beromünster', canton: 'LU', url: 'https://schulnetz.lu.ch/ksber' },
    { id: 'ksmus', name: 'Kantonsschule Musegg Luzern', canton: 'LU', url: 'https://schulnetz.lu.ch/ksmus' },
    { id: 'ksreu', name: 'Kantonsschule Reussbühl Luzern', canton: 'LU', url: 'https://schulnetz.lu.ch/ksreu' },
    { id: 'kssch', name: 'Kantonsschule Schüpfheim', canton: 'LU', url: 'https://schulnetz.lu.ch/kssch' },
    { id: 'kssee', name: 'Kantonsschule Seetal', canton: 'LU', url: 'https://schulnetz.lu.ch/kssee' },
    { id: 'kssur', name: 'Kantonsschule Sursee', canton: 'LU', url: 'https://schulnetz.lu.ch/kssur' },
    { id: 'kswil', name: 'Kantonsschule Willisau', canton: 'LU', url: 'https://schulnetz.lu.ch/kswil' },
    { id: 'bbzb', name: 'BBZ Bau und Gewerbe', canton: 'LU', url: 'https://schulnetz.lu.ch/bbzb' },
    { id: 'bbzg', name: 'BBZ Gesundheit und Soziales', canton: 'LU', url: 'https://schulnetz.lu.ch/bbzg' },
    { id: 'bbzn', name: 'BBZ Natur und Ernährung', canton: 'LU', url: 'https://schulnetz.lu.ch/bbzn' },
    { id: 'bbzw', name: 'BBZ Wirtschaft, Informatik und Technik', canton: 'LU', url: 'https://schulnetz.lu.ch/bbzw' },
    { id: 'fmz', name: 'FMZ Luzern', canton: 'LU', url: 'https://schulnetz.lu.ch/fmz' },
    { id: 'wbzlu', name: 'WBZ Luzern', canton: 'LU', url: 'https://schulnetz.lu.ch/wbzlu' },
    { id: 'zba', name: 'ZBA Luzern', canton: 'LU', url: 'https://schulnetz.lu.ch/zba' },
    { id: 'zentrale', name: 'Zentraler Mandant', canton: 'LU', url: 'https://schulnetz.lu.ch/zentrale' },
    
    // Aargau
    { id: 'bbaden', name: 'Berufsfachschule BBBaden', canton: 'AG', url: 'https://schulnetz.bbaden.ch' }
];

if (typeof window !== 'undefined') {
    window.Cantons = Cantons;
    window.Schools = Schools;
}
