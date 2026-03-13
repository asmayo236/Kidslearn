/* ===== BRUNO APRENDE - Utilidades Compartidas ===== */

/* ---- Sonidos con Web Audio API ---- */
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let ctx = null;

function getCtx() {
  if (!ctx) ctx = new AudioCtx();
  return ctx;
}

function playTone(freq, type = 'sine', duration = 0.18, vol = 0.25) {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    gain.gain.setValueAtTime(vol, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + duration);
  } catch (e) {}
}

function playCorrect() {
  playTone(523, 'sine', 0.12);
  setTimeout(() => playTone(659, 'sine', 0.12), 100);
  setTimeout(() => playTone(784, 'sine', 0.18), 200);
}

function playWrong() {
  playTone(300, 'sawtooth', 0.25, 0.2);
  setTimeout(() => playTone(250, 'sawtooth', 0.2, 0.15), 180);
}

function playClick() {
  playTone(440, 'sine', 0.08, 0.15);
}

function playCelebration() {
  const notes = [523, 587, 659, 698, 784, 880];
  notes.forEach((n, i) => setTimeout(() => playTone(n, 'sine', 0.15), i * 80));
}

/* ---- Confetti ---- */
const canvas = document.getElementById('confetti-canvas');
let confettiParticles = [];
let confettiRunning = false;

function launchConfetti(duration = 3000) {
  if (!canvas) return;
  const ctx2 = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#FF6B6B','#FFD93D','#6BCB77','#4D96FF','#FF6FB4','#845EC2','#FF9A3C'];
  confettiParticles = [];

  for (let i = 0; i < 120; i++) {
    confettiParticles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * -100 - 20,
      w: Math.random() * 12 + 6,
      h: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * 4 + 2,
      angle: Math.random() * 360,
      spin: (Math.random() - 0.5) * 8
    });
  }

  confettiRunning = true;
  const start = performance.now();

  function draw(now) {
    if (!confettiRunning) { ctx2.clearRect(0, 0, canvas.width, canvas.height); return; }
    if (now - start > duration) {
      confettiRunning = false;
      ctx2.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    ctx2.clearRect(0, 0, canvas.width, canvas.height);
    confettiParticles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.angle += p.spin;
      ctx2.save();
      ctx2.translate(p.x, p.y);
      ctx2.rotate(p.angle * Math.PI / 180);
      ctx2.fillStyle = p.color;
      ctx2.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      ctx2.restore();
    });
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}

/* ---- Celebration modal ---- */
function showCelebration(msg = '¡Excelente!', sub = '¡Muy bien hecho, Bruno!', emoji = '🌟') {
  const modal = document.getElementById('celebration-modal');
  if (!modal) return;
  modal.querySelector('.cel-emoji').textContent = emoji;
  modal.querySelector('.cel-msg').textContent = msg;
  modal.querySelector('.cel-sub').textContent = sub;
  modal.classList.add('show');
  playCelebration();
  launchConfetti(3500);
}

function hideCelebration() {
  const modal = document.getElementById('celebration-modal');
  if (modal) modal.classList.remove('show');
}

/* ---- Tab system ---- */
function initTabs(color) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.style.setProperty('--tab-color', color || 'var(--purple)');
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.tab);
      if (target) target.classList.add('active');
      playClick();
    });
  });
}

/* ---- Score system ---- */
function updateStars(correct, total) {
  const stars = document.getElementById('stars-display');
  const scoreText = document.getElementById('score-text');
  if (!stars || !scoreText) return;
  const filled = Math.min(correct, 5);
  stars.textContent = '⭐'.repeat(filled) + '☆'.repeat(Math.max(0, 5 - filled));
  scoreText.textContent = `${correct} / ${total} correctas`;
}

/* ---- Feedback messages ---- */
function showFeedback(el, correct) {
  if (!el) return;
  el.className = 'feedback show ' + (correct ? 'correct' : 'wrong');
  el.textContent = correct
    ? ['¡Correcto! 🎉','¡Muy bien! ⭐','¡Excelente! 🌟','¡Genial! 🚀','¡Súper! 💪'][Math.floor(Math.random()*5)]
    : ['Casi... inténtalo otra vez 😊','¡Tú puedes! 💪','Sigue intentando 🌈'][Math.floor(Math.random()*3)];
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), 2200);
}
