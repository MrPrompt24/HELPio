// audio.js
const playBtn = document.getElementById('play-btn');
const playIcon = playBtn.querySelector('i');
const trackTitle = document.getElementById('track-title');
const trackStatus = document.getElementById('track-status');
const trackIcon = document.getElementById('track-icon');
const playlistItems = document.querySelectorAll('.track-item');

let isPlaying = false;
let currentTrackIndex = -1;

// Tracks linked to actual files
const tracks = [
    { title: "Szum Oceanu", icon: "fa-water", src: "audio/fale_morskie.mp3" },
    { title: "Śpiew Ptaków", icon: "fa-dove", src: "audio/spiew_ptakow.mp3" },
    { title: "Szum Wiatru", icon: "fa-wind", src: "audio/szum_wiatru.mp3" },
    { title: "Spokojny Oddech", icon: "fa-lungs", src: "audio/wydechy.mp3" }
];

const audio = new Audio();
audio.loop = true; // Auto-loop for relaxation

playBtn.addEventListener('click', togglePlay);

playlistItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        if (currentTrackIndex === index && isPlaying) {
            togglePlay(); // Pause if clicking active track
        } else {
            loadTrack(index);
            playAudio();
        }
    });
});

function loadTrack(index) {
    // If playing a different track, stop previous
    if (currentTrackIndex !== index) {
        audio.pause();
        audio.currentTime = 0;
    }

    currentTrackIndex = index;

    // Update active class
    playlistItems.forEach(item => item.classList.remove('active'));
    playlistItems[index].classList.add('active');

    // Update meta
    const track = tracks[index];
    trackTitle.textContent = track.title;
    trackIcon.className = `fas ${track.icon} track-icon`;

    // Set audio source
    audio.src = track.src;
}

function togglePlay() {
    if (currentTrackIndex === -1) {
        // If no track selected, select first
        loadTrack(0);
    }

    if (isPlaying) {
        pauseAudio();
    } else {
        playAudio();
    }
}

function playAudio() {
    // Promise handling to avoid race conditions
    const playPromise = audio.play();

    if (playPromise !== undefined) {
        playPromise.then(_ => {
            isPlaying = true;
            playIcon.className = 'fas fa-pause';
            trackStatus.textContent = 'Odtwarzanie...';
            playBtn.classList.add('playing');
        })
            .catch(error => {
                console.error("Audio playback error:", error);
                trackStatus.textContent = 'Błąd odtwarzania';
            });
    }
}

function pauseAudio() {
    audio.pause();
    isPlaying = false;
    playIcon.className = 'fas fa-play';
    trackStatus.textContent = 'Zatrzymano';
    playBtn.classList.remove('playing');
}

