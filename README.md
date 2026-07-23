<div align="center">

# HELPio

**Here, Help Meets Technology** — Twoje bezpieczeństwo w jednej aplikacji.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![PWA](https://img.shields.io/badge/PWA-ready-10b981)
![No build step](https://img.shields.io/badge/build-none%20required-blue)

**[Polski](#-polski) | [English](#-english)**

</div>

---

## 🇵🇱 Polski

### Spis treści
- [O projekcie](#o-projekcie)
- [Funkcje](#funkcje)
- [Stack technologiczny](#stack-technologiczny)
- [Wymagania](#wymagania)
- [Instalacja](#instalacja)
- [Uruchomienie](#uruchomienie)
- [Konfiguracja](#konfiguracja)
- [Użycie](#użycie)
- [Struktura projektu](#struktura-projektu)
- [Testy](#testy)
- [Współtworzenie](#współtworzenie)
- [Licencja](#licencja)
- [Kontakt](#kontakt)

### O projekcie

**HELPio** to progresywna aplikacja webowa (PWA) stworzona z myślą o zapewnieniu
szybkiego, prywatnego i zawsze dostępnego wsparcia w sytuacjach kryzysowych i
codziennym dbaniu o siebie. Zamiast rozproszonych narzędzi, HELPio łączy w
jednym miejscu funkcje alarmowe, lokalizacyjne, medyczne, antystresowe i
edukacyjne — tak, aby w krytycznym momencie pomoc była o jedno kliknięcie.

Aplikacja działa w całości po stronie klienta: **żadne dane użytkownika nie są
wysyłane na zewnętrzny serwer** — wszystko (PIN, karta ICE, kontakty, ustawienia)
jest przechowywane lokalnie w przeglądarce (`localStorage` / `IndexedDB`).
Dzięki wsparciu dla Service Workera, HELPio działa również offline i można ją
zainstalować na telefonie lub komputerze jak natywną aplikację.

### Funkcje

- 🆘 **SOS** — szybkie połączenie z numerem alarmowym (112).
- 🔔 **Alarm dźwiękowy** — głośny alarm wielotonowy zwracający uwagę otoczenia.
- 🤫 **Tryb Cichy** — dyskretne powiadomienie SMS zamiast głośnego alarmu.
- 🔋 **Tryb Awaryjny** — oszczędzanie baterii w sytuacji kryzysowej.
- 📍 **Moja Pozycja / Pomoc w Pobliżu** — udostępnianie lokalizacji i wyszukiwanie pobliskiej pomocy.
- 🩺 **Karta ICE** (In Case of Emergency) — chroniona kodem PIN karta z danymi medycznymi i kontaktami awaryjnymi.
- 🩹 **Pierwsza Pomoc** — instrukcje pierwszej pomocy, także w formie głosowej (Web Speech API).
- 🧘 **Antystres** — ćwiczenia oddechowe, body scan, dźwięki natury, szybki reset i inne techniki relaksacyjne.
- 🔐 **Cyber Ochrona** — generator i analizator haseł, porady dotyczące zabezpieczenia telefonu.
- 📵 **Cyfrowa Higiena** — kalkulator czasu ekranowego, test dominacji cyfrowej, program 7 dni.
- 📚 **Edukacja i Świadomość** — moduły edukacyjne dotyczące bezpieczeństwa.
- 👥 **Moje Kontakty / Mój Dzień** — chronione PIN-em kontakty i planer dnia.
- 🤖 **Lena AI** — wbudowany asystent czatu z opcjonalną integracją własnego klucza API (przechowywanego lokalnie).
- ♿ **Dostępność** — nakładka ułatwień dostępu (czcionka OpenDyslexic, dostosowania wizualne).
- 📦 **Eksport / Import danych** — chroniona PIN-em kopia zapasowa danych użytkownika.
- 📲 **PWA** — instalacja na urządzeniu i działanie offline dzięki Service Workerowi.

### Stack technologiczny

- **HTML5, CSS3, JavaScript (Vanilla)** — bez frameworków i bez kroku budowania (build step).
- **Progressive Web App** — `manifest.json` + `service-worker.js` (cache-first, tryb offline).
- **Przechowywanie danych po stronie klienta** — `localStorage` i `IndexedDB` (brak backendu/bazy danych).
- Zewnętrzne zasoby z CDN: Font Awesome 6.4.0, Google Fonts (Inter).

### Wymagania

- Dowolna nowoczesna przeglądarka (Chrome, Edge, Firefox, Safari).
- Serwer HTTP do serwowania plików statycznych — np. [XAMPP](https://www.apachefriends.org/) (Apache) lub dowolny inny serwer statyczny. Nie jest wymagany PHP, Node.js ani żadna baza danych.

### Instalacja

Projekt nie wymaga instalacji zależności ani kroku budowania — wystarczy
skopiować pliki na serwer WWW.

```bash
git clone https://github.com/MrPrompt24/HELPio.git
```

Umieść skopiowany folder w katalogu głównym serwera WWW (np. `htdocs` w XAMPP).

### Uruchomienie

1. Uruchom Apache (np. panel sterowania XAMPP).
2. Otwórz w przeglądarce:

```
http://localhost/HELPio/
```

> **Uwaga:** `manifest.json` i `service-worker.js` zakładają wdrożenie aplikacji
> pod ścieżką `/app/` (`start_url`/`scope` wskazują na `/app/index.html`).
> <!-- TODO: potwierdź docelową ścieżkę wdrożenia produkcyjnego i w razie
> potrzeby dopasuj `start_url`/`scope` w manifest.json oraz ścieżki cache
> w service-worker.js do rzeczywistej struktury hostingu. -->

### Konfiguracja

Aplikacja nie wymaga plików konfiguracyjnych ani zmiennych środowiskowych.
Jedynym opcjonalnym ustawieniem jest własny klucz API (np. Hugging Face) dla
modułu Lena AI, który można wprowadzić w Ustawieniach aplikacji — jest on
zapisywany wyłącznie lokalnie w przeglądarce (`localStorage`) i nigdy nie
opuszcza urządzenia użytkownika.

### Użycie

Po otwarciu aplikacji w przeglądarce dostępny jest ekran główny (dashboard) z
kafelkami prowadzącymi do poszczególnych modułów (SOS, Alarm, Karta ICE,
Antystres itd.). Sekcje zawierające dane wrażliwe (Karta ICE, Kontakty, Mój
Dzień, Eksport/Import) są zabezpieczone kodem PIN ustawianym przy pierwszym
użyciu. Aplikację można zainstalować na urządzeniu poprzez opcję "Zainstaluj
aplikację" dostępną w przeglądarce (funkcja PWA).

### Struktura projektu

```
HELPio/
├── index.html              # Główny punkt wejścia / dashboard
├── manifest.json            # Manifest PWA
├── service-worker.js        # Obsługa trybu offline / cache
├── applications/             # Moduły funkcjonalne (SOS, alarm, ICE, antystres, ...)
├── apps/                     # Dodatkowe mini-aplikacje (aqua_motiv, notatnik kryzysowy, ...)
├── security/                  # System blokady PIN
├── lena_ai/                   # Asystent czatu AI (Lena)
├── availability/              # Widget ułatwień dostępu
├── content/                   # Strony treściowe (o aplikacji, bezpieczeństwo, ...)
├── notifications/             # System powiadomień
├── guide/                     # Przewodnik użytkownika
├── partners/                  # Karuzela partnerów/sponsorów
├── business_cards/            # Statyczne wizytówki
├── css/, js/, images/         # Wspólne style, skrypty i grafiki
└── LICENSE, README.md
```

### Testy

Projekt nie posiada obecnie zautomatyzowanych testów ani konfiguracji CI/CD.
<!-- TODO: rozważ dodanie testów (np. Playwright/Jest) oraz pipeline'u CI
(np. GitHub Actions), jeśli projekt ma być rozwijany zespołowo. -->

### Współtworzenie

Chcesz zgłosić pomysł lub błąd? Skorzystaj z formularza "Zgłoś pomysł"
dostępnego w aplikacji lub skontaktuj się bezpośrednio (patrz sekcja
[Kontakt](#kontakt)). Pull requesty są mile widziane — przed większymi
zmianami warto najpierw omówić proponowany kierunek w zgłoszeniu (issue).

### Licencja

Ten projekt jest objęty licencją MIT — zobacz plik [LICENSE](LICENSE).

### Kontakt

Twórca: **MrPrompt - Centrum Otwartych Innowacji** — [mrprompt.eu](https://mrprompt.eu)

---

## 🇬🇧 English

### Table of Contents
- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Requirements](#requirements)
- [Installation](#installation)
- [Running the App](#running-the-app)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Tests](#tests)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

### About

**HELPio** is a Progressive Web App (PWA) built to provide fast, private, and
always-available support in crisis situations and everyday self-care. Instead
of scattered tools, HELPio brings together alarm, location, medical,
stress-relief, and educational features in one place — so that in a critical
moment, help is just one tap away.

The app runs entirely client-side: **no user data is ever sent to an external
server** — everything (PIN, ICE card, contacts, settings) is stored locally in
the browser (`localStorage` / `IndexedDB`). Thanks to Service Worker support,
HELPio also works offline and can be installed on a phone or computer like a
native app.

### Features

- 🆘 **SOS** — quick call to the emergency number (112).
- 🔔 **Audible alarm** — a loud multi-tone alarm to draw attention.
- 🤫 **Silent Mode** — a discreet SMS alert instead of a loud alarm.
- 🔋 **Emergency Mode** — battery-saving mode for crisis situations.
- 📍 **My Location / Nearby Help** — location sharing and finding nearby help.
- 🩺 **ICE Card** (In Case of Emergency) — a PIN-protected card with medical data and emergency contacts.
- 🩹 **First Aid** — first-aid instructions, including voice guidance (Web Speech API).
- 🧘 **Anti-Stress** — breathing exercises, body scan, nature sounds, quick reset, and other relaxation techniques.
- 🔐 **Cyber Protection** — password generator and strength analyzer, phone security tips.
- 📵 **Digital Hygiene** — screen-time calculator, digital dominance test, 7-day program.
- 📚 **Education & Awareness** — educational modules on personal safety.
- 👥 **My Contacts / My Day** — PIN-protected contacts and daily planner.
- 🤖 **Lena AI** — a built-in chat assistant with optional support for your own API key (stored locally).
- ♿ **Accessibility** — an accessibility overlay (OpenDyslexic font, visual adjustments).
- 📦 **Data Export / Import** — PIN-protected backup of user data.
- 📲 **PWA** — installable on device and works offline via a Service Worker.

### Tech Stack

- **HTML5, CSS3, Vanilla JavaScript** — no frameworks, no build step.
- **Progressive Web App** — `manifest.json` + `service-worker.js` (cache-first, offline mode).
- **Client-side storage only** — `localStorage` and `IndexedDB` (no backend/database).
- External CDN resources: Font Awesome 6.4.0, Google Fonts (Inter).

### Requirements

- Any modern browser (Chrome, Edge, Firefox, Safari).
- An HTTP server to serve static files — e.g. [XAMPP](https://www.apachefriends.org/) (Apache) or any other static server. No PHP, Node.js, or database is required.

### Installation

The project has no dependencies to install and no build step — just copy the
files to a web server.

```bash
git clone https://github.com/MrPrompt24/HELPio.git
```

Place the cloned folder in your web server's document root (e.g. `htdocs` in XAMPP).

### Running the App

1. Start Apache (e.g. via the XAMPP control panel).
2. Open in your browser:

```
http://localhost/HELPio/
```

> **Note:** `manifest.json` and `service-worker.js` currently assume the app
> is deployed under an `/app/` path (`start_url`/`scope` point to
> `/app/index.html`).
> <!-- TODO: confirm the intended production deployment path and adjust
> `start_url`/`scope` in manifest.json and the cached paths in
> service-worker.js to match the real hosting structure if needed. -->

### Configuration

No configuration files or environment variables are required. The only
optional setting is a custom API key (e.g. Hugging Face) for the Lena AI
module, which can be entered in the app's Settings screen — it is stored only
locally in the browser (`localStorage`) and never leaves the user's device.

### Usage

Once opened in a browser, the app shows a home screen (dashboard) with tiles
linking to each module (SOS, Alarm, ICE Card, Anti-Stress, etc.). Sections
containing sensitive data (ICE Card, Contacts, My Day, Export/Import) are
protected by a PIN set on first use. The app can be installed on a device via
the browser's "Install app" option (PWA support).

### Project Structure

```
HELPio/
├── index.html              # Main entry point / dashboard
├── manifest.json            # PWA manifest
├── service-worker.js        # Offline mode / caching
├── applications/             # Feature modules (SOS, alarm, ICE, anti-stress, ...)
├── apps/                     # Extra mini-apps (aqua_motiv, crisis notebook, ...)
├── security/                  # PIN lock system
├── lena_ai/                   # AI chat assistant (Lena)
├── availability/              # Accessibility widget
├── content/                   # Content pages (about, safety, ...)
├── notifications/             # Notification system
├── guide/                     # User guide
├── partners/                  # Partner/sponsor carousel
├── business_cards/            # Static business card pages
├── css/, js/, images/         # Shared styles, scripts, and images
└── LICENSE, README.md
```

### Tests

The project currently has no automated tests or CI/CD configuration.
<!-- TODO: consider adding tests (e.g. Playwright/Jest) and a CI pipeline
(e.g. GitHub Actions) if the project grows into a team effort. -->

### Contributing

Have an idea or found a bug? Use the "Report an idea" form inside the app, or
reach out directly (see [Contact](#contact)). Pull requests are welcome — for
larger changes, please open an issue first to discuss the proposed direction.

### License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

### Contact

Created by: **MrPrompt - Centrum Otwartych Innowacji** — [mrprompt.eu](https://mrprompt.eu)

