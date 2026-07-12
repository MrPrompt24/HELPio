// First Aid Emergency Categories and Instructions
const firstAidData = {
    categories: [
        {
            id: 'brak-oddechu',
            title: 'Brak oddechu / RKO',
            subtitle: 'Absolutny priorytet',
            icon: 'fa-heartbeat',
            color: '#dc2626',
            steps: [
                'Sprawdź bezpieczeństwo swoje i poszkodowanego',
                'Sprawdź przytomność: potrząśnij za ramiona i głośno zapytaj "Czy wszystko w porządku?"',
                'Jeśli brak reakcji: głośno wołaj o pomoc',
                'Udrożnij drogi oddechowe: odchyl głowę do tyłu i unieś brodę',
                'Sprawdź oddech przez 10 sekund (wzrok, słuch, dotyk)',
                'Jeśli brak oddechu lub oddech nieprawidłowy: zadzwoń pod 999 lub 112',
                'Rozpocznij uciskanie klatki piersiowej: środek mostka, głębokość 5-6 cm, tempo 100-120/min',
                'Jeśli nie wiesz, nie umiesz lub nie możesz wykonywać oddechów ratowniczych wykonuj WYŁĄCZNIE UCISKI klatki piersiowej',
                'Wykonaj 30 uciśnięć',
                'Wykonaj 2 oddechy ratownicze (jeśli potrafisz i jest to bezpieczne, w przeciwnym razie kontynuuj tylko uciskanie)',
                'Kontynuuj cykl 30:2 do przyjazdu pomocy lub powrotu funkcji życiowych'
            ]
        },
        {
            id: 'zadlawienie',
            title: 'Zadławienie',
            subtitle: 'Natychmiastowa reakcja fizyczna',
            icon: 'fa-hands-helping',
            color: '#f97316',
            steps: [
                'Oceń kaszel: jeśli efektywny (głośny) - zachęcaj do kaszlu, nie klep po plecach',
                'Jeśli kaszel nieefektywny (cichy/brak) i osoba przytomna: pochyl ją do przodu',
                'Wykonaj do 5 energicznych uderzeń w plecy (między łopatkami)',
                'Jeśli brak efektu: wykonaj do 5 uciśnięć nadbrzusza (rękoczyn Heimlicha)',
                'Stań za poszkodowanym, obejmij go, jedną dłoń zwiń w pięść, połóż nad pępkiem, drugą chwyć pięść i energicznie pociągnij do siebie i w górę',
                'Kontynuuj na zmianę: 5 uderzeń w plecy, 5 uciśnięć nadbrzusza',
                'Jeśli osoba straci przytomność: delikatnie połóż ją na ziemi i rozpocznij RKO (uciskanie klatki piersiowej)',
                'Wezwij pogotowie (999 lub 112)'
            ]
        },
        {
            id: 'krwotok',
            title: 'Silny Krwotok',
            subtitle: 'Ryzyko wstrząsu',
            icon: 'fa-tint',
            color: '#b91c1c',
            steps: [
                'Dbaj o własne bezpieczeństwo (załóż rękawiczki, jeśli masz)',
                'Posadź lub połóż poszkodowanego',
                'Bezpośrednio uciskaj miejsce krwawienia (np. gazą, ubraniem lub dłonią)',
                'Jeśli rana jest na kończynie, unieś ją powyżej poziomu serca (jeśli nie ma złamania)',
                'Załóż opatrunek uciskowy nie zdejmuj przesiąkniętego opatrunku, dokładaj kolejne warstwy',
                'Jeśli krwotok jest masywny i nie ustaje: rozważ użycie opaski uciskowej (stazy) powyżej rany (tylko w ostateczności)',
                'Wezwij pogotowie (999 lub 112)',
                'Okryj poszkodowanego i monitoruj funkcje życiowe (ryzyko wstrząsu)'
            ]
        },
        {
            id: 'wstrzas-anafilaktyczny',
            title: 'Wstrząs Anafilaktyczny',
            subtitle: 'Ryzyko zamknięcia dróg oddechowych',
            icon: 'fa-lungs-virus',
            color: '#7c3aed',
            steps: [
                'Rozpoznaj objawy: trudności w oddychaniu, obrzęk twarzy/języka, wysypka, szybkie tętno',
                'Po napadzie sprawdź oddech, jeżeli jest oddech ułóż na bok',
                'Natychmiast zadzwoń pod 999 lub 112',
                'Zapytaj poszkodowanego czy ma adrenalinę (np. EpiPen) i pomóż mu jej użyć',
                'Podaj adrenalinę w mięsień uda (nawet przez ubranie)',
                'Ułóż poszkodowanego w pozycji wygodnej do oddychania (zwykle półsiedząca)',
                'Jeśli poszkodowany czuje się słabo/mdleje - połóż go płasko z uniesionymi nogami',
                'Monitoruj oddech i przytomność',
                'W razie zatrzymania krążenia rozpocznij RKO'
            ]
        },
        {
            id: 'udar',
            title: 'Udar Mózgu',
            subtitle: 'Czas to mózg',
            icon: 'fa-brain',
            color: '#4f46e5',
            steps: [
                'Wykonaj test FAST: Twarz (opadająca?), Ramię (osłabione?), Mowa (bełkotliwa?), Czas (zadzwoń po pomoc)',
                'Natychmiast zadzwoń pod 999 lub 112, poinformuj o podejrzeniu udaru',
                'Ułóż chorego w pozycji bezpiecznej lub leżącej z lekko uniesioną głową',
                'Zapewnij spokój i dostęp świeżego powietrza',
                'NIE podawaj nic do jedzenia ani picia (ryzyko zadławienia)',
                'NIE podawaj żadnych leków (np. aspiryny)',
                'Notuj czas wystąpienia pierwszych objawów (kluczowe dla lekarzy)',
                'Monitoruj stan przytomności do przyjazdu karetki'
            ]
        },
        {
            id: 'atak-serca',
            title: 'Atak Serca',
            subtitle: 'Czas to mięsień sercowy',
            icon: 'fa-heart-broken',
            color: '#9f1239',
            steps: [
                'Objawy: silny ból w klatce piersiowej (gniotący, piekący), duszność, poty, lęk',
                'Zadzwoń pod 999 lub 112',
                'Poleć poszkodowanemu zaprzestanie wysiłku, posadź go w pozycji półsiedzącej (oparte plecy)',
                'Zapewnij dostęp świeżego powietrza, rozluźnij ciasną odzież',
                'Zapytaj, czy leczy się na serce i czy ma swoje leki (pomóż mu je przyjąć)',
                'Jeśli nie ma przeciwwskazań, można podać 300mg aspiryny (do rozgryzienia)',
                'Uspokajaj poszkodowanego',
                'Bądź gotowy do RKO w razie utraty przytomności'
            ]
        },
        {
            id: 'wypadek-samochodowy',
            title: 'Wypadek Samochodowy',
            subtitle: 'Bezpieczeństwo i triaż',
            icon: 'fa-car-crash',
            color: '#ea580c',
            steps: [
                'Zadbaj o bezpieczeństwo własne: kamizelka odblaskowa, trójkąt ostrzegawczy, światła awaryjne',
                'Oceń liczbę poszkodowanych i ich stan',
                'Wezwij służby (112), podaj dokładną lokalizację i liczbę ofiar',
                'Wyłącz stacyjkę w rozbitym pojeździe (jeśli bezpieczne)',
                'Nie wyciągaj rannych z pojazdu, chyba że grozi im bezpośrednie niebezpieczeństwo (pożar, zatrzymanie krążenia)',
                'Jeśli ranny nie oddycha - ewakuuj go (chwyt Rauteka) i rozpocznij RKO',
                'Zatamuj widoczne krwotoki',
                'Wspieraj psychicznie przytomnych, zapewnij komfort termiczny'
            ]
        },
        {
            id: 'pozar',
            title: 'Pożar',
            subtitle: 'Bezpieczeństwo i ewakuacja',
            icon: 'fa-fire',
            color: '#c2410c',
            steps: [
                'Ostrzeż osoby zagrożone, uruchom alarm',
                'Wezwij straż pożarną (998 lub 112)',
                'Rozpocznij ewakuację najkrótszą bezpieczną drogą',
                'Poruszaj się nisko przy podłodze (mniej dymu, niższa temperatura)',
                'Sprawdzaj drzwi grzbietem dłoni przed otwarciem (jeśli gorące - nie otwieraj)',
                'Jeśli odcięta droga ucieczki: uszczelnij drzwi mokrymi ręcznikami, stań w oknie i wzywaj pomocy',
                'Jeśli płonie na kimś ubranie: przewróć go na ziemię i stłum ogień kocem lub turlaj go',
                'Nie wracaj do płonącego budynku'
            ]
        },
        {
            id: 'padaczka',
            title: 'Atak Padaczki',
            subtitle: 'Ochrona przed urazami',
            icon: 'fa-bolt',
            color: '#6d28d9',
            steps: [
                'Zachowaj spokój, zmierz czas trwania ataku',
                'Zabezpiecz głowę poszkodowanego przed urazami (podłóż coś miękkiego)',
                'Usuń niebezpieczne przedmioty z otoczenia',
                'NIE wkładaj niczego do ust',
                'NIE krępuj ruchów, nie przytrzymuj na siłę',
                'Poluzuj ciasną odzież wokół szyi',
                'Po ustąpieniu drgawek sprawdź oddech, a następnie jeśli oddycha ułóż poszkodowanego NA BOK, pozycja bezpieczna',
                'Po ustąpieniu drgawek ułóż w pozycji bocznej ustalonej i monitoruj oddech',
                'Wezwij karetkę, jeśli: to pierwszy atak, trwa >5 min, wystąpiła seria ataków lub doszło do urazu'
            ]
        },
        {
            id: 'zlamanie',
            title: 'Złamanie / Urazy',
            subtitle: 'Stabilizacja i ból',
            icon: 'fa-crutch',
            color: '#4b5563',
            steps: [
                'Nie poruszaj uszkodzoną kończyną, nie próbuj nastawiać kości',
                'Jeśli złamanie otwarte (kość na wierzchu) - załóż jałowy opatrunek na ranę',
                'Unieruchom dwa sąsiednie stawy (dla kości) lub dwie sąsiednie kości (dla stawu)',
                'Można schłodzić miejsce urazu (zmniejsza ból i obrzęk)',
                'Kończynę górną można unieruchomić temblakiem (np. z chusty)',
                'W przypadku urazu kręgosłupa/szyi - nie ruszaj poszkodowanego, stabilizuj głowę',
                'Wezwij pomoc lub udaj się na SOR (zależnie od stanu)'
            ]
        },
        {
            id: 'oparzenia',
            title: 'Oparzenia',
            subtitle: 'Schładzanie i zabezpieczenie',
            icon: 'fa-temperature-high',
            color: '#be123c',
            steps: [
                'Przerwij kontakt z czynnikiem parzącym (ogień, wrzątek, prąd)',
                'Natychmiast schładzaj oparzone miejsce chłodną (nie lodowatą) wodą przez min. 10-20 minut',
                'Zdejmij biżuterię/zegarek z oparzonej okolicy (zanim pojawi się obrzęk)',
                'Po schłodzeniu wodą, jeśli masz zastosuj hydrożel na oparzenia',
                'Nie zrywaj odzieży przyklejonej do skóry',
                'Nałóż jałowy, luźny opatrunek (lub folię spożywczą przy dużych oparzeniach)',
                'Nie przebijaj pęcherzy, nie smaruj tłuszczami ani maściami',
                'Chroń przed wychłodzeniem (duże oparzenia)',
                'Wezwij pomoc przy oparzeniach rozległych, twarzy, szyi, krocza lub dróg oddechowych'
            ]
        }
    ]
};