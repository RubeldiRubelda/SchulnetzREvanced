# Datenschutzerklärung - Schulnetz REvanced

Der Schutz Ihrer persönlichen Daten ist uns ein wichtiges Anliegen. Diese Datenschutzerklärung informiert Sie darüber, wie die Browser-Erweiterung **Schulnetz REvanced** mit Daten umgeht.

## 1. Grundsatz
Die Erweiterung wurde mit dem Fokus auf Datensparsamkeit entwickelt. Es werden **keine** personenbezogenen Daten erhoben, übertragen oder auf externen Servern gespeichert. 

## 2. Datenerhebung und -verarbeitung
Schulnetz REvanced arbeitet primär lokal in Ihrem Browser und modifiziert die Darstellung der Webseite `schulnetz.lu.ch`.

### 2.1 Lokale Verarbeitung
*   **Keine Inhaltsübertragung:** Es findet keine Kommunikation Ihrer Schuldaten (Noten, Absenzen, Personendaten) mit Servern des Entwicklers oder Dritten statt.
*   **Website-Interaktion:** Die Erweiterung liest und modifiziert Inhalte ausschließlich lokal auf Ihrem Endgerät. Diese sensiblen Daten verlassen niemals Ihren Browser.

### 2.2 Nutzungsstatistiken & Google Analytics
Um die Erweiterung stetig zu verbessern und die Relevanz der Funktionen zu bewerten, nutzt Schulnetz REvanced **Google Analytics** sowie die systemseitigen Telemetrie-Funktionen der Browser-Hersteller (Google, Microsoft, Mozilla).
*   **Zweck:** Es werden rein technische Nutzungsdaten erhoben (z.B. Anzahl aktiver Nutzer, welche Funktionen wie oft angeklickt werden, Version der Erweiterung).
*   **Keine Personenbezogenen Daten:** Diese Statistiken enthalten **zu keinem Zeitpunkt** Informationen über Ihre Noten, Ihren Namen, Ihre Schule oder sonstige schulische Inhalte. Es geht ausschließlich um die Interaktion mit der Erweiterung selbst.
*   **Browser-Hersteller:** Wir nutzen die offiziellen Store-Statistiken von Chrome (Google), Edge (Microsoft) und Firefox (Mozilla). Diese Daten dienen der Reichweitenmessung und Fehleranalyse.

## 3. Speicherung (Browser Storage)
Die Erweiterung nutzt die `chrome.storage.local` API Ihres Browsers, um folgende Informationen lokal auf Ihrem Gerät zu speichern:
*   **Einstellungen:** Ihre gewählten Präferenzen (z. B. Design-Modus, Sprachform "Du/Sie", Status der Noten-Anzeige).
*   **Temporäre Daten:** Die URL des Login-QR-Codes von Schulnetz wird kurzzeitig lokal gespeichert, um sie im Popup der Erweiterung anzuzeigen.
Diese Daten werden nicht synchronisiert und verbleiben ausschließlich in Ihrem lokalen Browser-Profil.

## 4. Berechtigungen
Die von der Erweiterung angeforderten Berechtigungen werden ausschließlich für die beschriebenen Funktionen genutzt:
*   `storage`: Zum Speichern Ihrer Einstellungen.
*   `host permissions` (*.lu.ch): Erforderlich, um die Design-Anpassungen auf der Schulnetz-Seite vorzunehmen. -- In Zukunft wird Support für weitere Schulen hinzukommen. Diese werden nach dem selben Prinzip angefügt.

## 5. Änderungen
Da keine Daten gesammelt werden, haben Änderungen an der Erweiterung in der Regel keine Auswirkungen auf Ihre Privatsphäre. Sollten künftige Funktionen eine Datenerhebung notwendig machen, wird diese Datenschutzerklärung aktualisiert und Sie werden über die Erweiterung informiert.

## 6. Kontakt
Bei Fragen zur Sicherheit oder zum Datenschutz können Sie mich unter der im Repository oder im Web Store hinterlegten E-Mail-Adresse kontaktieren.

*Stand: Januar 2026*
