/* script.js — Dashflow-style SPA behavior for IELTS wizard */

// CONFIG
const TOTAL_STEPS = 7;
const TIMER_START = 6 * 60; // seconds

// STATE
let currentStep = 1;
let timerSeconds = TIMER_START;
let timerInterval = null;

// DOM SELECTORS
const steps = Array.from(document.querySelectorAll('.step'));
const navLinks = Array.from(document.querySelectorAll('.nav-link'));
const progressLine = document.getElementById('progressLine');

const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

const audioCard = document.getElementById('audio-card');
const videoCard = document.getElementById('video-card');
const mediaBtns = Array.from(document.querySelectorAll('.media-btn'));
const audioEl = document.getElementById('audioEl');
const videoEl = document.getElementById('videoEl');

const timerDisplay = document.getElementById('timerDisplay');
const timerStart = document.getElementById('timerStart');
const timerPause = document.getElementById('timerPause');
const timerReset = document.getElementById('timerReset');

const vocabItems = Array.from(document.querySelectorAll('.vocab-item'));
const accentSelect = document.getElementById('accentSelect');

const finalEssayEl = document.getElementById('final-essay');
const completeBtn = document.getElementById('completeBtn');

// HELPER: show a specific step
function showStep(n) {
  if (n < 1) n = 1;
  if (n > TOTAL_STEPS) n = TOTAL_STEPS;
  currentStep = n;

  steps.forEach(s => {
    const stepNum = Number(s.getAttribute('data-step'));
    s.classList.toggle('step-active', stepNum === n);
  });

  navLinks.forEach(btn => {
    btn.classList.toggle('nav-active', Number(btn.getAttribute('data-step')) === n);
  });

  // update progress dots
  const dots = Array.from({ length: TOTAL_STEPS }, (_, i) => (i+1) === n ? '●' : '○');
  if (progressLine) progressLine.textContent = dots.join(' ');

  // pause media when moving
  try { if (audioEl) audioEl.pause(); } catch(e){}
  try { if (videoEl) videoEl.pause(); } catch(e){}

  // disable prev/next edges
  if (prevBtn) prevBtn.disabled = (n === 1);
  if (nextBtn) nextBtn.disabled = (n === TOTAL_STEPS);

  saveState();
}

// NAV listeners
navLinks.forEach(btn => btn.addEventListener('click', () => {
  const step = Number(btn.getAttribute('data-step'));
  showStep(step);
}));
if (prevBtn) prevBtn.addEventListener('click', () => showStep(currentStep - 1));
if (nextBtn) nextBtn.addEventListener('click', () => showStep(currentStep + 1));

// media toggle
mediaBtns.forEach(b => b.addEventListener('click', () => {
  const m = b.getAttribute('data-media');
  mediaBtns.forEach(x => x.classList.remove('media-active'));
  b.classList.add('media-active');
  if (m === 'audio') {
    audioCard.style.display = 'block';
    videoCard.style.display = 'none';
  } else {
    audioCard.style.display = 'none';
    videoCard.style.display = 'block';
  }
}));

// Timer functions
function formatTime(s) {
  const mm = String(Math.floor(s/60)).padStart(2,'0');
  const ss = String(s%60).padStart(2,'0');
  return `${mm}:${ss}`;
}
function startTimer(){
  if (timerInterval) return;
  timerInterval = setInterval(()=> {
    timerSeconds--;
    if (timerDisplay) timerDisplay.textContent = formatTime(timerSeconds);
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      try { new Audio('https://www.soundjay.com/buttons/sounds/beep-07.mp3').play(); } catch(e){}
    }
  }, 1000);
}
function pauseTimer(){ if(timerInterval){ clearInterval(timerInterval); timerInterval = null; } }
function resetTimer(){ pauseTimer(); timerSeconds = TIMER_START; if (timerDisplay) timerDisplay.textContent = formatTime(timerSeconds); }

if (timerStart) timerStart.addEventListener('click', startTimer);
if (timerPause) timerPause.addEventListener('click', pauseTimer);
if (timerReset) timerReset.addEventListener('click', resetTimer);

// Vocabulary: click to speak
function speak(text) {
  if (!('speechSynthesis' in window)) return alert('Speech synthesis not supported');
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const lang = accentSelect ? accentSelect.value : 'en-GB';
  u.lang = lang;
  u.rate = 0.98;
  const voices = window.speechSynthesis.getVoices();
  const v = voices.find(x => x.lang && x.lang.toLowerCase().startsWith(lang.toLowerCase()));
  if (v) u.voice = v;
  window.speechSynthesis.speak(u);
}
vocabItems.forEach(item => {
  item.addEventListener('click', () => speak(item.dataset.word));
});

// Build final essay (from step content)
function assembleFinal() {
  const intro = document.querySelector('#step-4 .card:first-of-type') ? document.querySelector('#step-4 .card:first-of-type').innerText.trim() : '';
  const overview = document.querySelector('#step-4 .card:nth-of-type(2)') ? document.querySelector('#step-4 .card:nth-of-type(2)').innerText.trim() : '';
  const p1 = document.querySelector('#step-5 .card') ? document.querySelector('#step-5 .card').innerText.trim() : '';
  const p2 = document.querySelector('#step-6 .card') ? document.querySelector('#step-6 .card').innerText.trim() : '';
  const assembled = [intro, overview, p1, p2].filter(Boolean).join('\n\n');
  if (finalEssayEl) finalEssayEl.textContent = assembled;
  return assembled;
}

// confetti and completion
function loadConfettiAndFire() {
  if (window.confetti) {
    confetti({ particleCount: 160, spread: 70, origin: { y: 0.4 } });
    return;
  }
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js';
  s.onload = () => confetti({ particleCount: 160, spread: 70, origin: { y: 0.4 } });
  document.head.appendChild(s);
}
if (completeBtn) {
  completeBtn.addEventListener('click', () => {
    assembleFinal();
    loadConfettiAndFire();
    showStep(TOTAL_STEPS);
  });
}

// simple placeholders
const quizBtn = document.getElementById('quizBtn');
const reportBtn = document.getElementById('reportBtn');
if (quizBtn) quizBtn.addEventListener('click', ()=> alert('Quiz placeholder — implement or link quiz page.'));
if (reportBtn) reportBtn.addEventListener('click', ()=> alert('Tutor report placeholder — implement or link report page.'));

// local storage state
const STATE_KEY = 'ielts_dashflow_state_v1';
function saveState() {
  const state = { step: currentStep, timer: timerSeconds };
  try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch(e){}
}
function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem(STATE_KEY) || '{}');
    if (s && typeof s.step === 'number') showStep(s.step);
    if (s && typeof s.timer === 'number') { timerSeconds = s.timer; if (timerDisplay) timerDisplay.textContent = formatTime(timerSeconds); }
  } catch(e){}
}

// init
document.addEventListener('DOMContentLoaded', ()=> {
  showStep(1);
  if (timerDisplay) timerDisplay.textContent = formatTime(timerSeconds);
  loadState();
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') showStep(currentStep - 1);
    if (e.key === 'ArrowRight') showStep(currentStep + 1);
  });
});
