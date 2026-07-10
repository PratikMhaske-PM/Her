/* =========================================================
   WILL YOU BE MINE — script.js
   Handles: screen flow, mini-games, effects, audio, canvas fx
   ========================================================= */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     SCREEN NAVIGATION
  --------------------------------------------------------- */
  const screens = Array.from(document.querySelectorAll('.screen'));

  function goToScreen(id) {
    const target = document.getElementById(id);
    if (!target) return;
    screens.forEach(s => { s.classList.remove('active', 'enter'); });
    target.classList.add('active');
    requestAnimationFrame(() => target.classList.add('enter'));
    window.scrollTo({ top: 0, behavior: 'auto' });

    if (id === 'level3') initQuiz();
    if (id === 'loveMeter') runLoveMeter();
    if (id === 'catchGame') initCatchGame();
    if (id === 'runningBtn') initRunningButton();
    if (id === 'luckWheel') initWheel();
    if (id === 'memories') initMemoryScroll();
    if (id === 'finalProposal') runFinalSequence();
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-next]');
    if (btn) {
      playTick();
      goToScreen(btn.dataset.next);
    }
  });

  /* Ripple effect on every .btn click */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    btn.classList.remove('rippling');
    void btn.offsetWidth;
    btn.classList.add('rippling');
  });

  /* ---------------------------------------------------------
     PRELOADER
  --------------------------------------------------------- */
  window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('preloader').classList.add('active', 'enter');
    const fill = document.getElementById('loaderFill');
    let pct = 0;
    const timer = setInterval(() => {
      pct += Math.random() * 18 + 6;
      if (pct >= 100) {
        pct = 100;
        clearInterval(timer);
        setTimeout(() => goToScreen('reveal'), 500);
      }
      fill.style.width = pct + '%';
    }, 220);
  });

  /* ---------------------------------------------------------
     LEVEL 1 — always correct
  --------------------------------------------------------- */
  document.getElementById('level1Choices').addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-choice');
    if (!btn) return;
    document.getElementById('level1Feedback').textContent = 'Correct Answer ✅';
    burstHeartsAt(btn);
    document.getElementById('level1Next').classList.remove('hidden');
  });

  /* ---------------------------------------------------------
     LEVEL 2
  --------------------------------------------------------- */
  document.getElementById('level2Choices').addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-choice');
    if (!btn) return;
    const feedback = document.getElementById('level2Feedback');
    if (btn.dataset.answer === 'right') {
      feedback.textContent = "It's actually me ❤️";
      heartExplosion();
    } else {
      feedback.textContent = 'Nice try 😂';
      setTimeout(() => { feedback.textContent = "It's actually me ❤️"; heartExplosion(); }, 1000);
    }
    document.getElementById('level2Next').classList.remove('hidden');
  });

  /* ---------------------------------------------------------
     LEVEL 3 — mini love quiz
  --------------------------------------------------------- */
  const quizData = [
    {
      q: 'Favorite food?',
      options: [{ t: 'Chocolate 🍫' }, { t: 'Pizza 🍕' }, { t: 'You ❤️', right: true }]
    },
    {
      q: 'What is the safest place?',
      options: [{ t: 'Home' }, { t: 'Bank' }, { t: 'Your Hug ❤️', right: true }]
    }
  ];
  let quizIndex = 0;

  function initQuiz() {
    quizIndex = 0;
    document.getElementById('level3Feedback').textContent = '';
    document.getElementById('level3Next').classList.add('hidden');
    renderQuizStep();
  }

  function renderQuizStep() {
    const step = quizData[quizIndex];
    document.getElementById('quizQuestion').textContent = step.q;
    const wrap = document.getElementById('quizChoices');
    wrap.innerHTML = '';
    step.options.forEach(opt => {
      const b = document.createElement('button');
      b.className = 'btn btn-choice';
      b.textContent = opt.t;
      b.dataset.right = opt.right ? '1' : '0';
      wrap.appendChild(b);
    });
  }

  document.getElementById('quizChoices').addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-choice');
    if (!btn) return;
    const feedback = document.getElementById('level3Feedback');
    if (btn.dataset.right === '1') {
      feedback.textContent = 'Sweetest answer ❤️';
      burstHeartsAt(btn);
    } else {
      feedback.textContent = 'Hmm, try again with your heart 😉';
    }
    quizIndex++;
    if (quizIndex < quizData.length) {
      setTimeout(renderQuizStep, 750);
    } else {
      document.getElementById('quizWrap').style.opacity = '0.5';
      setTimeout(() => {
        feedback.textContent = 'You know the right answers ❤️';
        document.getElementById('level3Next').classList.remove('hidden');
      }, 750);
    }
  });

  /* ---------------------------------------------------------
     LOVE METER
  --------------------------------------------------------- */
  const METER_CIRC = 2 * Math.PI * 88;

  function runLoveMeter() {
    const progress = document.getElementById('meterProgress');
    const label = document.getElementById('meterLabel');
    const status = document.getElementById('meterStatus');
    const nextBtn = document.getElementById('meterNext');
    progress.style.strokeDasharray = METER_CIRC;
    progress.style.strokeDashoffset = METER_CIRC;
    label.textContent = '0%';
    status.textContent = 'Calculating…';
    nextBtn.classList.add('hidden');

    let pct = 0;
    const rise = setInterval(() => {
      pct += Math.random() * 9 + 4;
      if (pct >= 99) {
        pct = 99;
        clearInterval(rise);
        setPct(99);
        setTimeout(() => {
          status.textContent = 'Recalculating…';
          setTimeout(() => {
            label.textContent = '999999999%';
            status.textContent = 'Error. Too much love detected ❤️';
            heartExplosion();
            nextBtn.classList.remove('hidden');
          }, 900);
        }, 700);
        return;
      }
      setPct(pct);
    }, 140);

    function setPct(p) {
      label.textContent = Math.round(p) + '%';
      const offset = METER_CIRC - (p / 100) * METER_CIRC;
      progress.style.strokeDashoffset = offset;
    }
  }

  /* ---------------------------------------------------------
     CATCH MY HEART GAME
  --------------------------------------------------------- */
  function initCatchGame() {
    const field = document.getElementById('catchField');
    const heart = document.getElementById('catchHeart');
    const hint = document.getElementById('catchHint');
    const feedback = document.getElementById('catchFeedback');
    const nextBtn = document.getElementById('catchNext');
    feedback.textContent = '';
    nextBtn.classList.add('hidden');
    hint.textContent = 'Tap it before it runs away…';

    let dodges = 0;
    const maxDodges = 3;

    function moveHeart() {
      const fw = field.clientWidth, fh = field.clientHeight;
      const hw = heart.offsetWidth, hh = heart.offsetHeight;
      const x = Math.random() * (fw - hw - 10);
      const y = Math.random() * (fh - hh - 10);
      heart.style.left = x + 'px';
      heart.style.top = y + 'px';
    }

    function dodge() {
      if (dodges >= maxDodges) { catchHeart(); return; }
      dodges++;
      moveHeart();
      hint.textContent = dodges < maxDodges ? 'So close! Try again 😄' : 'One more try…';
    }

    function catchHeart() {
      heart.style.left = '50%';
      heart.style.top = '50%';
      heart.style.transform = 'translate(-50%,-50%) scale(1.4)';
      feedback.textContent = 'You finally caught my heart.';
      heartExplosion();
      nextBtn.classList.remove('hidden');
      heart.replaceWith(heart.cloneNode(true)); // remove listeners
    }

    heart.style.left = '50%';
    heart.style.top = '50%';
    heart.style.transform = 'translate(-50%,-50%)';
    heart.onmouseenter = dodge;
    heart.onclick = () => { if (dodges >= maxDodges) catchHeart(); else dodge(); };
    heart.ontouchstart = (ev) => { ev.preventDefault(); heart.onclick(); };
  }

  /* ---------------------------------------------------------
     RUNNING BUTTON
  --------------------------------------------------------- */
  const runTexts = ['You missed 😂', 'Nope 😎', 'Try harder', 'Nice try', 'I choose happiness'];

  function initRunningButton() {
    const field = document.getElementById('runField');
    const notYet = document.getElementById('notYetBtn');
    const yesBtn = document.getElementById('yesRunBtn');
    const nextBtn = document.getElementById('runNext');
    notYet.textContent = 'NOT YET 😅';
    notYet.classList.remove('positioned');
    field.classList.remove('armed');
    nextBtn.classList.add('hidden');
    notYet.style.left = '';
    notYet.style.top = '';

    function runAway(clientX, clientY) {
      const rect = field.getBoundingClientRect();
      field.classList.add('armed');
      const bw = notYet.offsetWidth, bh = notYet.offsetHeight;
      const maxX = rect.width - bw - 10;
      const maxY = rect.height - bh - 10;
      let x = Math.random() * maxX;
      let y = Math.random() * maxY;
      notYet.style.left = Math.max(0, x) + 'px';
      notYet.style.top = Math.max(0, y) + 'px';
      notYet.textContent = runTexts[Math.floor(Math.random() * runTexts.length)];
    }

    function proximityCheck(e) {
      const rect = notYet.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      if (dist < 90) runAway(e.clientX, e.clientY);
    }

    field.onmousemove = proximityCheck;
    notYet.ontouchstart = (e) => { e.preventDefault(); runAway(); };

    yesBtn.onclick = () => {
      heartExplosion();
      nextBtn.classList.remove('hidden');
      field.onmousemove = null;
    };
  }

  /* ---------------------------------------------------------
     LUCK WHEEL
  --------------------------------------------------------- */
  const wheelOptions = [
    { label: 'Coffee Date ☕', color: '#7C5CFF' },
    { label: 'Movie 🍿', color: '#FF5D8F' },
    { label: 'Ice Cream 🍦', color: '#FFD166' },
    { label: 'Road Trip 🚗', color: '#5CD6C0' },
    { label: 'Surprise Gift 🎁', color: '#FF9FBB' },
    { label: 'Forever ❤️', color: '#F5EEFF' }
  ];
  let wheelSpun = false;

  function initWheel() {
    const svg = document.getElementById('wheelSvg');
    const wheel = document.getElementById('wheel');
    const feedback = document.getElementById('wheelFeedback');
    const nextBtn = document.getElementById('wheelNext');
    const spinBtn = document.getElementById('spinBtn');
    feedback.textContent = '';
    nextBtn.classList.add('hidden');
    wheel.style.transform = 'rotate(0deg)';
    wheelSpun = false;
    spinBtn.disabled = false;

    if (!svg.dataset.built) {
      svg.dataset.built = '1';
      const cx = 200, cy = 200, r = 195;
      const n = wheelOptions.length;
      const slice = (2 * Math.PI) / n;
      let html = '';
      wheelOptions.forEach((opt, i) => {
        const start = i * slice - Math.PI / 2;
        const end = start + slice;
        const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
        const x2 = cx + r * Math.cos(end), y2 = cy + r * Math.sin(end);
        html += `<path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z" fill="${opt.color}" fill-opacity="0.85" stroke="#0B0714" stroke-width="2"/>`;
        const mid = start + slice / 2;
        const tx = cx + (r * 0.62) * Math.cos(mid);
        const ty = cy + (r * 0.62) * Math.sin(mid);
        const deg = (mid * 180 / Math.PI) + 90;
        html += `<text x="${tx}" y="${ty}" fill="#0B0714" font-size="15" font-weight="700" font-family="Poppins, sans-serif" text-anchor="middle" transform="rotate(${deg} ${tx} ${ty})">${opt.label}</text>`;
      });
      svg.innerHTML = html;
    }

    spinBtn.onclick = () => {
      if (wheelSpun) return;
      wheelSpun = true;
      spinBtn.disabled = true;
      const winnerIndex = Math.floor(Math.random() * wheelOptions.length);
      const sliceDeg = 360 / wheelOptions.length;
      const targetCenter = winnerIndex * sliceDeg + sliceDeg / 2;
      const spins = 5;
      const rotation = spins * 360 + (360 - targetCenter);
      wheel.style.transform = `rotate(${rotation}deg)`;
      playTick();
      setTimeout(() => {
        feedback.textContent = `Landed on: ${wheelOptions[winnerIndex].label}`;
        heartExplosion();
        nextBtn.classList.remove('hidden');
      }, 4600);
    };
  }

  /* ---------------------------------------------------------
     MEMORY SCROLL REVEAL + SECRET HEART
  --------------------------------------------------------- */
  let memoryObserver = null;

  function initMemoryScroll() {
    const cards = document.querySelectorAll('.memory-card');
    if (memoryObserver) memoryObserver.disconnect();
    memoryObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.25 });
    cards.forEach((c, i) => {
      c.style.transitionDelay = (i * 90) + 'ms';
      memoryObserver.observe(c);
    });
  }

  document.getElementById('secretHeart').addEventListener('click', () => {
    const overlay = document.getElementById('secretOverlay');
    overlay.classList.remove('hidden');
    fireworks();
    confettiBurst();
    roseFall();
    setTimeout(() => overlay.classList.add('hidden'), 2600);
  });

  /* ---------------------------------------------------------
     FINAL PROPOSAL SEQUENCE
  --------------------------------------------------------- */
  let finalStarted = false;

  function runFinalSequence() {
    if (finalStarted) return;
    finalStarted = true;
    const lines = [
      { el: document.getElementById('tw1'), text: "I don't know what the future looks like…" },
      { el: document.getElementById('tw2'), text: 'But I know one thing…' },
      { el: document.getElementById('tw3'), text: 'I want you in it.' },
      { el: document.getElementById('tw4'), text: 'So…' }
    ];
    let i = 0;
    function typeNext() {
      if (i >= lines.length) {
        setTimeout(() => document.getElementById('finalCard').classList.remove('hidden'), 500);
        return;
      }
      typewrite(lines[i].el, lines[i].text, () => {
        i++;
        setTimeout(typeNext, 500);
      });
    }
    typeNext();
  }

  function typewrite(el, text, done) {
    el.classList.add('typing');
    let idx = 0;
    if (prefersReducedMotion) {
      el.textContent = text;
      el.classList.remove('typing');
      done();
      return;
    }
    const timer = setInterval(() => {
      idx++;
      el.textContent = text.slice(0, idx);
      if (idx >= text.length) {
        clearInterval(timer);
        el.classList.remove('typing');
        done();
      }
    }, 42);
  }

  function celebrate() {
    document.getElementById('finalCard').classList.add('hidden');
    document.getElementById('celebration').classList.remove('hidden');
    fireworks();
    confettiBurst();
    roseFall();
    heartExplosion();
    setTimeout(fireworks, 700);
    setTimeout(confettiBurst, 1100);
  }
  document.getElementById('finalYes1').addEventListener('click', celebrate);
  document.getElementById('finalYes2').addEventListener('click', celebrate);

  /* ---------------------------------------------------------
     CANVAS: STARFIELD (ambient)
  --------------------------------------------------------- */
  const starCanvas = document.getElementById('starfield');
  const starCtx = starCanvas.getContext('2d');
  let stars = [];

  function sizeCanvas(canvas) {
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
  }

  function initStars() {
    sizeCanvas(starCanvas);
    const count = Math.min(140, Math.floor(window.innerWidth / 10));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.4 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.005
    }));
  }

  function drawStars(t) {
    starCtx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    starCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    stars.forEach(s => {
      const alpha = 0.35 + 0.5 * Math.sin(t * s.speed + s.phase);
      starCtx.beginPath();
      starCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      starCtx.fillStyle = `rgba(245,238,255,${Math.max(0, alpha)})`;
      starCtx.fill();
    });
    requestAnimationFrame(drawStars);
  }

  initStars();
  window.addEventListener('resize', initStars);
  if (!prefersReducedMotion) requestAnimationFrame(drawStars);
  else drawStars(0);

  /* ---------------------------------------------------------
     CANVAS: PARTICLE EFFECTS (fireworks / confetti / hearts / roses)
  --------------------------------------------------------- */
  const pCanvas = document.getElementById('particles');
  const pCtx = pCanvas.getContext('2d');
  let particles = [];
  sizeCanvas(pCanvas);
  window.addEventListener('resize', () => sizeCanvas(pCanvas));

  function loopParticles() {
    pCtx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    pCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      p.vy += p.gravity || 0;
      p.life -= 1;
      p.rotation = (p.rotation || 0) + (p.vr || 0);
      pCtx.save();
      pCtx.globalAlpha = Math.max(0, p.life / p.maxLife);
      pCtx.translate(p.x, p.y);
      pCtx.rotate(p.rotation);
      if (p.type === 'heart') {
        drawHeartShape(pCtx, 0, 0, p.size, p.color);
      } else if (p.type === 'confetti') {
        pCtx.fillStyle = p.color;
        pCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
      } else if (p.type === 'spark') {
        pCtx.fillStyle = p.color;
        pCtx.beginPath();
        pCtx.arc(0, 0, p.size, 0, Math.PI * 2);
        pCtx.fill();
      } else if (p.type === 'rose') {
        pCtx.font = p.size + 'px serif';
        pCtx.fillText('🌹', -p.size / 2, p.size / 2);
      }
      pCtx.restore();
    });
    particles = particles.filter(p => p.life > 0 && p.y < window.innerHeight + 60);
    requestAnimationFrame(loopParticles);
  }
  requestAnimationFrame(loopParticles);

  function drawHeartShape(ctx, x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    const s = size / 20;
    ctx.moveTo(x, y + 5 * s);
    ctx.bezierCurveTo(x, y, x - 10 * s, y, x - 10 * s, y + 5 * s);
    ctx.bezierCurveTo(x - 10 * s, y + 10 * s, x, y + 14 * s, x, y + 18 * s);
    ctx.bezierCurveTo(x, y + 14 * s, x + 10 * s, y + 10 * s, x + 10 * s, y + 5 * s);
    ctx.bezierCurveTo(x + 10 * s, y, x, y, x, y + 5 * s);
    ctx.fill();
  }

  const palette = ['#FF5D8F', '#FFD166', '#7C5CFF', '#F5EEFF', '#FF9FBB'];

  function heartExplosion() {
    if (prefersReducedMotion) return;
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    for (let i = 0; i < 34; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      particles.push({
        type: 'heart', x: cx, y: cy,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 2,
        gravity: 0.12, size: Math.random() * 14 + 10,
        color: palette[Math.floor(Math.random() * palette.length)],
        life: 90, maxLife: 90, vr: (Math.random() - 0.5) * 0.1
      });
    }
  }

  function burstHeartsAt(el) {
    if (prefersReducedMotion) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1.5;
      particles.push({
        type: 'heart', x: cx, y: cy,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 1.5,
        gravity: 0.1, size: Math.random() * 10 + 8,
        color: palette[Math.floor(Math.random() * palette.length)],
        life: 70, maxLife: 70
      });
    }
  }

  function confettiBurst() {
    if (prefersReducedMotion) return;
    for (let i = 0; i < 60; i++) {
      particles.push({
        type: 'confetti',
        x: Math.random() * window.innerWidth,
        y: -20,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2 + 2,
        gravity: 0.05,
        size: Math.random() * 8 + 6,
        color: palette[Math.floor(Math.random() * palette.length)],
        life: 220, maxLife: 220,
        rotation: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.2
      });
    }
  }

  function fireworks() {
    if (prefersReducedMotion) return;
    const bursts = 3;
    for (let b = 0; b < bursts; b++) {
      setTimeout(() => {
        const cx = Math.random() * window.innerWidth * 0.7 + window.innerWidth * 0.15;
        const cy = Math.random() * window.innerHeight * 0.4 + window.innerHeight * 0.1;
        const color = palette[Math.floor(Math.random() * palette.length)];
        for (let i = 0; i < 40; i++) {
          const angle = (Math.PI * 2 * i) / 40;
          const speed = Math.random() * 4 + 3;
          particles.push({
            type: 'spark', x: cx, y: cy,
            vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
            gravity: 0.05, size: Math.random() * 3 + 2,
            color, life: 60, maxLife: 60
          });
        }
      }, b * 350);
    }
  }

  function roseFall() {
    if (prefersReducedMotion) return;
    for (let i = 0; i < 16; i++) {
      particles.push({
        type: 'rose',
        x: Math.random() * window.innerWidth,
        y: -30,
        vx: (Math.random() - 0.5) * 1,
        vy: Math.random() * 1.2 + 0.8,
        gravity: 0.01,
        size: Math.random() * 16 + 18,
        color: '#fff',
        life: 260, maxLife: 260,
        rotation: 0, vr: (Math.random() - 0.5) * 0.03
      });
    }
  }

  /* ---------------------------------------------------------
     CURSOR TRAIL / GLOW
  --------------------------------------------------------- */
  const glow = document.getElementById('cursorGlow');
  const dot = document.getElementById('cursorDot');
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let gx = mx, gy = my;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
  });

  function animateGlow() {
    gx += (mx - gx) * 0.12;
    gy += (my - gy) * 0.12;
    glow.style.left = gx + 'px';
    glow.style.top = gy + 'px';
    requestAnimationFrame(animateGlow);
  }
  if (!prefersReducedMotion) requestAnimationFrame(animateGlow);

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('.btn') || e.target.closest('button')) {
      dot.style.transform = 'translate(-50%,-50%) scale(2)';
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('.btn') || e.target.closest('button')) {
      dot.style.transform = 'translate(-50%,-50%) scale(1)';
    }
  });

  /* ---------------------------------------------------------
     SOUND (WebAudio synth chimes — no external files needed)
  --------------------------------------------------------- */
  let audioCtx = null;
  let ambientOn = false;
  let ambientNodes = null;

  function ensureAudio() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    return audioCtx;
  }

  function playTick() {
    const ctx = ensureAudio();
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = 660;
    g.gain.value = 0.0001;
    o.connect(g); g.connect(ctx.destination);
    const now = ctx.currentTime;
    g.gain.exponentialRampToValueAtTime(0.05, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
    o.start(now); o.stop(now + 0.3);
  }

  function startAmbient() {
    const ctx = ensureAudio();
    if (!ctx) return;
    const master = ctx.createGain();
    master.gain.value = 0.035;
    master.connect(ctx.destination);
    const notes = [261.6, 329.6, 392.0, 493.9];
    const oscs = notes.map((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.value = 0;
      o.connect(g); g.connect(master);
      o.start();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.05 + i * 0.02;
      lfoGain.gain.value = 0.02;
      lfo.connect(lfoGain); lfoGain.connect(g.gain);
      g.gain.value = 0.015;
      lfo.start();
      return { o, g, lfo };
    });
    ambientNodes = { master, oscs };
  }

  function stopAmbient() {
    if (!ambientNodes) return;
    ambientNodes.oscs.forEach(({ o, lfo }) => { try { o.stop(); lfo.stop(); } catch (e) {} });
    ambientNodes = null;
  }

  document.getElementById('soundToggle').addEventListener('click', function () {
    ambientOn = !ambientOn;
    this.classList.toggle('playing', ambientOn);
    if (ambientOn) {
      const ctx = ensureAudio();
      if (ctx && ctx.state === 'suspended') ctx.resume();
      startAmbient();
    } else {
      stopAmbient();
    }
  });

})();