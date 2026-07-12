// body-scan.js
const scanText = document.getElementById('scan-text');
const scanIndicator = document.getElementById('scan-indicator');
const startBtn = document.getElementById('start-scan-btn');
const nextBtn = document.getElementById('next-scan-btn');
const controls = document.querySelector('.scan-controls');
const bodyOutline = document.querySelector('.body-outline');

const bodyParts = [
    { name: "Głowa i Czoło", text: "Rozluźnij czoło, oczy i szczękę. Pozwól myślom odpłynąć.", pos: "10%" },
    { name: "Szyja i Ramiona", text: "Opuść ramiona. Poczuj, jak napięcie spływa w dół.", pos: "25%" },
    { name: "Klatka Piersiowa", text: "Oddychaj spokojnie. Poczuj rytm swojego serca.", pos: "40%" },
    { name: "Ręce i Dłonie", text: "Poczuj ciężar swoich rąk. Rozluźnij palce.", pos: "50%" },
    { name: "Brzuch", text: "Pozwól brzuchowi być miękkim. Oddychaj do przepony.", pos: "60%" },
    { name: "Nogi i Stopy", text: "Poczuj kontakt stóp z podłożem. Jesteś uziemiony.", pos: "85%" },
    { name: "Całe Ciało", text: "Poczuj całe swoje ciało jako jedność. Spokojne i zrelaksowane.", pos: "50%" }
];

let currentIndex = -1;
let isScanning = false;

startBtn.addEventListener('click', startScan);
nextBtn.addEventListener('click', nextStep);

function startScan() {
    isScanning = true;
    startBtn.style.display = 'none';
    nextBtn.style.display = 'inline-block';
    nextStep();
}

function nextStep() {
    currentIndex++;

    if (currentIndex >= bodyParts.length) {
        finishScan();
        return;
    }

    const part = bodyParts[currentIndex];
    updateUI(part);
}

function updateUI(part) {
    // Animate text
    scanText.style.opacity = 0;
    setTimeout(() => {
        scanText.innerHTML = `<strong>${part.name}</strong><br>${part.text}`;
        scanText.style.opacity = 1;
    }, 300);

    // Move indicator
    scanIndicator.style.top = part.pos;
    if (part.name === "Całe Ciało") {
        scanIndicator.style.height = "100%";
        scanIndicator.style.top = "0";
        scanIndicator.style.background = "rgba(16, 185, 129, 0.2)";
    } else {
        scanIndicator.style.height = "4px";
        scanIndicator.style.background = "#10b981";
    }
}

function finishScan() {
    currentIndex = -1;
    isScanning = false;
    startBtn.style.display = 'inline-block';
    nextBtn.style.display = 'none';
    startBtn.textContent = 'Rozpocznij Ponownie';

    scanText.textContent = "Skanowanie zakończone. Zabierz ten spokój ze sobą.";
    scanIndicator.style.opacity = 0;
}
