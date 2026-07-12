// quick-reset.js
const resetCards = document.querySelectorAll('.reset-card');
const overlay = document.querySelector('.reset-overlay');
const overlayTitle = document.querySelector('.reset-title');
const overlayText = document.querySelector('.reset-text');
const closeBtn = document.querySelector('.reset-close');

const actions = {
    'count': {
        title: 'Licz do 10',
        text: 'Powoli licz od 10 w dół.\nZ każdym numerem czuj, jak napięcie opada.\n10... 9... 8...'
    },
    'water': {
        title: 'Chłodna Woda',
        text: 'Wypij szklankę chłodnej wody lub przemyj nią twarz.\nTo natychmiast resetuje układ nerwowy.'
    },
    'grounding': {
        title: 'Uziemienie 5-4-3-2-1',
        text: 'Znajdź:\n5 rzeczy, które widzisz\n4, które możesz dotknąć\n3, które słyszysz\n2, które czujesz (zapach)\n1 dobrą rzecz o sobie'
    },
    'shake': {
        title: 'Strząśnij To',
        text: 'Wstań i przez 15 sekund potrząsaj rękami i nogami.\nWyobraź sobie, że strzepujesz z siebie stres jak kurz.'
    },
    'breath': {
        title: 'Jeden Głęboki Oddech',
        text: 'Weź wdech nosem (4 sekundy)...\nZatrzymaj (4 sekundy)...\nWypuść ustami (6 sekund).\nZrób to teraz.'
    },
    'visual': {
        title: 'Bezpieczne Miejsce',
        text: 'Zamknij oczy. Wyobraź sobie miejsce, gdzie czujesz się całkowicie bezpiecznie.\nZostań tam przez chwilę.'
    }
};

resetCards.forEach(card => {
    card.addEventListener('click', () => {
        const actionType = card.dataset.action;
        const content = actions[actionType];

        if (content) {
            overlayTitle.textContent = content.title;
            overlayText.innerText = content.text; // innerText preserves newlines
            overlay.classList.add('active');
        }
    });
});

closeBtn.addEventListener('click', closeModal);
overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
});

function closeModal() {
    overlay.classList.remove('active');
}
