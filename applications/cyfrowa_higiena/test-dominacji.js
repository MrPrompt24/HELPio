// test-dominacji.js
const questions = [
    {
        text: "Kiedy budzisz się rano, co robisz jako pierwsze?",
        options: [
            { text: "Od razu sięgam po telefon", points: 3 },
            { text: "Sprawdzam telefon po kilku minutach", points: 2 },
            { text: "Najpierw wstaję, myję się, jem śniadanie", points: 0 }
        ]
    },
    {
        text: "Czy zdarza Ci się jeść posiłki, patrząc w ekran?",
        options: [
            { text: "Prawie zawsze", points: 3 },
            { text: "Czasami", points: 1 },
            { text: "Rzadko lub wcale", points: 0 }
        ]
    },
    {
        text: "Jak często sprawdzasz powiadomienia bez konkretnego powodu?",
        options: [
            { text: "Wielokrotnie w ciągu godziny", points: 3 },
            { text: "Kilka razy dziennie", points: 1 },
            { text: "Tylko gdy usłyszę dźwięk", points: 0 }
        ]
    },
    {
        text: "Czy czujesz niepokój, gdy nie masz przy sobie telefonu?",
        options: [
            { text: "Tak, wpadam w panikę", points: 3 },
            { text: "Trochę nieswojo", points: 1 },
            { text: "To dla mnie ulga", points: 0 }
        ]
    },
    {
        text: "Ile czasu spędzasz przed ekranami poza pracą/szkołą?",
        options: [
            { text: "Ponad 4 godziny", points: 3 },
            { text: "2-4 godziny", points: 1 },
            { text: "Mniej niż 2 godziny", points: 0 }
        ]
    }
];

const quizContainer = document.getElementById('quiz-questions');
const resultSection = document.getElementById('result-section');
const scoreEl = document.getElementById('result-score');
const descEl = document.getElementById('result-desc');
const detailsEl = document.getElementById('result-details');
const finishBtn = document.getElementById('finish-btn');
const resetBtn = document.getElementById('reset-test');

let answers = new Array(questions.length).fill(null);

// Load previous result
const savedResult = localStorage.getItem('screen_test_result');
if (savedResult) {
    showResult(JSON.parse(savedResult));
    quizContainer.style.display = 'none';
    finishBtn.style.display = 'none';
} else {
    renderQuestions();
}

function renderQuestions() {
    quizContainer.innerHTML = '';
    questions.forEach((q, qIndex) => {
        const div = document.createElement('div');
        div.className = 'question-card';

        let optionsHtml = '';
        q.options.forEach((opt, oIndex) => {
            optionsHtml += `
                <div class="option-btn" onclick="selectOption(${qIndex}, ${oIndex}, ${opt.points}, this)">
                    ${opt.text}
                </div>
            `;
        });

        div.innerHTML = `
            <div class="question-text">${qIndex + 1}. ${q.text}</div>
            <div class="options-grid">${optionsHtml}</div>
        `;
        quizContainer.appendChild(div);
    });
}

window.selectOption = function (qIndex, oIndex, points, el) {
    answers[qIndex] = points;

    // UI update
    const parent = el.parentElement;
    const options = parent.querySelectorAll('.option-btn');
    options.forEach(opt => opt.classList.remove('selected'));
    el.classList.add('selected');

    // Check if all answered
    if (answers.every(a => a !== null)) {
        finishBtn.disabled = false;
        finishBtn.style.opacity = '1';
    }
};

finishBtn.addEventListener('click', () => {
    if (answers.some(a => a === null)) {
        alert('Proszę odpowiedzieć na wszystkie pytania.');
        return;
    }

    const totalPoints = answers.reduce((a, b) => a + b, 0);
    const result = analyzeScore(totalPoints);

    // Save
    localStorage.setItem('screen_test_result', JSON.stringify({ points: totalPoints, ...result }));

    showResult({ points: totalPoints, ...result });
    quizContainer.style.display = 'none';
    finishBtn.style.display = 'none';
});

function analyzeScore(points) {
    if (points <= 4) return {
        title: "Mistrz Cyfrowej Równowagi",
        desc: "Świetnie kontrolujesz swój czas online. Technologia służy Tobie, a nie odwrotnie."
    };
    if (points <= 9) return {
        title: "Umiarkowany Użytkownik",
        desc: "Masz zdrowe nawyki, ale czasem zdarza Ci się odpłynąć w cyfrowy świat. Zwróć na to uwagę."
    };
    return {
        title: "Cyfrowe Przeciążenie",
        desc: "Ekrany dominują w Twoim życiu. Warto rozważyć cyfrowy detoks i wprowadzenie zasad offline."
    };
}

function showResult(data) {
    resultSection.classList.add('visible');
    scoreEl.textContent = data.points + " pkt";
    descEl.textContent = data.title;
    detailsEl.textContent = data.desc;
}

resetBtn.addEventListener('click', () => {
    localStorage.removeItem('screen_test_result');
    location.reload();
});
