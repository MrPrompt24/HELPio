// quote.js
const quoteText = document.getElementById('quote-text');
const quoteAuthor = document.getElementById('quote-author');
const newQuoteBtn = document.getElementById('new-quote-btn');
const quoteCard = document.querySelector('.quote-card');

const quotes = [
    { text: "Tylko spokój nas uratuje.", author: "Przysłowie" },
    { text: "Stres to nie to, co nam się przydarza, ale to, jak na to reagujemy.", author: "Hans Selye" },
    { text: "Oddychaj. To tylko gorszy dzień, a nie gorsze życie.", author: "Anonim" },
    { text: "Największą bronią przeciw stresowi jest nasza zdolność do wyboru jednej myśli zamiast drugiej.", author: "William James" },
    { text: "Spokój jest wewnątrz ciebie. Nie szukaj go na zewnątrz.", author: "Budda" },
    { text: "Prawie wszystko będzie działać lepiej, jeśli to wyłączysz na chwilę i włączysz z powrotem. Ty też.", author: "Anne Lamott" },
    { text: "Nie martw się o jutro, bo jutro zatroszczy się o siebie samo.", author: "Ewangelia wg św. Mateusza" },
    { text: "Zwolnij. Nie musisz gonić świata.", author: "Anonim" },
    { text: "Twoim domem jest twoje ciało. Zadbaj o nie.", author: "Jim Rohn" },
    { text: "Cierpliwość to sztuka bycia wściekłym... bardzo powoli.", author: "Anonim" }
];

newQuoteBtn.addEventListener('click', showRandomQuote);

function showRandomQuote() {
    // Add fade out effect
    quoteCard.style.opacity = 0;
    quoteCard.style.transform = 'translateY(10px) scale(0.98)';

    setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const quote = quotes[randomIndex];

        quoteText.textContent = `"${quote.text}"`;
        quoteAuthor.textContent = `— ${quote.author}`;

        // Fade in
        quoteCard.style.opacity = 1;
        quoteCard.style.transform = 'translateY(0) scale(1)';
    }, 300);
}

// Initial quote
showRandomQuote();
