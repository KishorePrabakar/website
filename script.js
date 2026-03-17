// ── Typewriter hero ───────────────────────────────────
(function () {
  const phrases = [
    'backend & ai developer',
    'i build things that scale',
    'i break things to understand them',
    'currently shipping something new',
    'backend & ai developer',
  ];

  const el     = document.getElementById('typewriter-text');
  if (!el) return;

  let phraseIdx = 0;
  let charIdx   = 0;
  let deleting  = false;
  let started   = false;

  function tick() {
    const phrase = phrases[phraseIdx];

    if (!deleting) {
      charIdx++;
      el.textContent = phrase.slice(0, charIdx);
      if (charIdx === phrase.length) {
        // Pause before deleting — but don't delete the last (base) phrase
        if (phraseIdx === phrases.length - 1) return; // stop on final phrase
        deleting = true;
        setTimeout(tick, 1800);
        return;
      }
      setTimeout(tick, 55);
    } else {
      charIdx--;
      el.textContent = phrase.slice(0, charIdx);
      if (charIdx === 0) {
        deleting  = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(tick, 300);
        return;
      }
      setTimeout(tick, 28);
    }
  }

  // Start after hero entrance animation settles
  setTimeout(tick, 900);
})();

// ── Floating nav ──────────────────────────────────────
(function () {
  const nav      = document.getElementById('float-nav');
  const items    = document.querySelectorAll('.float-nav-item');
  const sections = ['about', 'skills', 'projects', 'blogs', 'reading', 'stats'];
  let heroBottom = 0;

  function getHeroBottom() {
    const hero = document.querySelector('.hero-center');
    if (hero) heroBottom = hero.getBoundingClientRect().bottom + window.scrollY + 40;
  }

  getHeroBottom();
  window.addEventListener('resize', getHeroBottom);

  function updateNav() {
    const scrollY = window.scrollY;

    // Show / hide
    if (scrollY > heroBottom - 200) {
      nav.classList.add('visible');
    } else {
      nav.classList.remove('visible');
    }

    // Active section highlight
    let current = '';
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      if (el.getBoundingClientRect().top <= window.innerHeight * 0.45) current = id;
    });

    items.forEach(item => {
      item.classList.toggle('active', item.dataset.section === current);
    });
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();
})();

// ── Scroll reveal ─────────────────────────────────────
(function () {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  revealEls.forEach(el => observer.observe(el));
})();

// ── Theme toggle ──────────────────────────────────────
const toggle   = document.getElementById('theme-toggle');
const html     = document.documentElement;
const moonIcon = document.getElementById('icon-moon');
const sunIcon  = document.getElementById('icon-sun');

function setTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  moonIcon.style.display = theme === 'dark' ? '' : 'none';
  sunIcon.style.display  = theme === 'dark' ? 'none' : '';
}

const savedTheme = localStorage.getItem('theme') ||
  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
setTheme(savedTheme);

toggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
  toggle.classList.remove('is-spinning');
  void toggle.offsetWidth;
  toggle.classList.add('is-spinning');
  setTimeout(() => toggle.classList.remove('is-spinning'), 520);
  toggle.classList.remove('ripple');
  void toggle.offsetWidth;
  toggle.classList.add('ripple');
  setTimeout(() => toggle.classList.remove('ripple'), 420);
});

// ── Project toggle ────────────────────────────────────
const toggleBtn   = document.getElementById('toggle-projects');
const hiddenCards = document.querySelectorAll('.hidden-card');
let expanded = false;

if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    expanded = !expanded;
    hiddenCards.forEach(c => { c.style.display = expanded ? '' : 'none'; });
    toggleBtn.textContent = expanded ? 'show less ↑' : 'show 6 more ↓';
  });
}

// ── Smooth scroll ─────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});

// ── Local time clock ─────────────────────────────────
(function () {
  const el = document.getElementById('local-time');
  if (!el) return;
  function tick() {
    const now = new Date().toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: true
    });
    el.textContent = now;
  }
  tick();
  setInterval(tick, 1000);
})();

// ── Chess.com ─────────────────────────────────────────
async function loadChessStats() {
  const loadingEl = document.getElementById('chess-loading');
  const bodyEl    = document.getElementById('chess-body');
  const ratingsEl = document.getElementById('chess-ratings');
  const recordEl  = document.getElementById('chess-record');
  const errorEl   = document.getElementById('chess-error');
  if (!loadingEl) return;
  try {
    const res   = await fetch('https://api.chess.com/pub/player/kraxonknight/stats');
    if (!res.ok) throw new Error();
    const stats = await res.json();
    const modes = [
      { key: 'chess_rapid',  label: 'Rapid'  },
      { key: 'chess_blitz',  label: 'Blitz'  },
      { key: 'chess_bullet', label: 'Bullet' },
    ];
    let wins = 0, losses = 0, draws = 0;
    ratingsEl.innerHTML = modes.map(({ key, label }) => {
      const m = stats[key];
      if (!m) return `<div class="chess-mode"><div class="chess-mode-name">${label}</div><div class="chess-mode-rating" style="font-size:0.85rem;color:var(--text-light)">—</div><div class="chess-mode-best">no games</div></div>`;
      const r = m.record ?? {};
      wins += r.win ?? 0; losses += r.loss ?? 0; draws += r.draw ?? 0;
      return `<div class="chess-mode"><div class="chess-mode-name">${label}</div><div class="chess-mode-rating">${m.last?.rating ?? '—'}</div><div class="chess-mode-best">best ${m.best?.rating ?? '—'}</div></div>`;
    }).join('');
    const total = wins + losses + draws;
    const pct   = total > 0 ? Math.round((wins / total) * 100) : 0;
    recordEl.innerHTML = `<span class="chess-w">▲ ${wins}W</span><span class="chess-l">▼ ${losses}L</span><span>◆ ${draws}D</span><span style="margin-left:auto;font-size:0.6rem;color:var(--text-light)">${pct}% · ${total}g</span>`;
    loadingEl.style.display = 'none';
    bodyEl.style.display    = 'block';
  } catch {
    loadingEl.style.display = 'none';
    errorEl.style.display   = 'block';
  }
}

// ── LeetCode — segmented donut ────────────────────────
async function loadLeetCode() {
  const loadingEl = document.getElementById('lc-loading');
  const bodyEl    = document.getElementById('lc-body');
  const numEl     = document.getElementById('lc-solved-num');
  const legendEl  = document.getElementById('lc-legend');
  const rankEl    = document.getElementById('lc-rank');
  const errorEl   = document.getElementById('lc-error');
  if (!loadingEl) return;
  try {
    const res = await fetch('https://leetcode-stats-api.herokuapp.com/KishorePrabakar');
    if (!res.ok) throw new Error();
    const d = await res.json();
    if (d.status === 'error') throw new Error();

    // r=38, circumference = 2*pi*38 ≈ 238.76
    const C     = 2 * Math.PI * 38;
    const total = d.totalEasy + d.totalMedium + d.totalHard;

    numEl.textContent = d.totalSolved;

    const segs = [
      { id: 'arc-easy',   val: d.easySolved,  color: '#00b8a3', label: 'Easy',   tot: d.totalEasy   },
      { id: 'arc-medium', val: d.mediumSolved, color: '#ffc01e', label: 'Medium', tot: d.totalMedium },
      { id: 'arc-hard',   val: d.hardSolved,   color: '#ef4743', label: 'Hard',   tot: d.totalHard   },
    ];

    legendEl.innerHTML = segs.map(s => `
      <div class="lc-legend-row">
        <span class="lc-dot" style="background:${s.color};box-shadow:0 0 4px ${s.color}"></span>
        <span class="lc-legend-label">${s.label}</span>
        <span class="lc-legend-count">${s.val}<span style="color:var(--text-light);font-size:0.55rem">/${s.tot}</span></span>
      </div>`).join('');

    rankEl.innerHTML = `rank <span>#${d.ranking?.toLocaleString() ?? '—'}</span>${d.acceptanceRate ? ' · ' + d.acceptanceRate.toFixed(1) + '% acc' : ''}`;

    loadingEl.style.display = 'none';
    bodyEl.style.display    = 'block';

    // Animate after paint — stroke-dashoffset in SVG = positive means "skip ahead"
    // SVG circles start at 3 o'clock; SVG is rotated -90deg in CSS so starts at 12
    requestAnimationFrame(() => {
      // Start all arcs collapsed (dash=0, gap=full circumference)
      segs.forEach(s => {
        const el = document.getElementById(s.id);
        if (el) { el.setAttribute('stroke-dasharray', `0 ${C}`); el.setAttribute('stroke-dashoffset', '0'); }
      });

      // Then on next frame, set final values
      requestAnimationFrame(() => {
        let consumed = 0; // how much of circumference is used so far
        segs.forEach(s => {
          const el = document.getElementById(s.id);
          if (!el) return;
          const frac = total > 0 ? s.val / total : 0;
          const len  = Math.max(frac * C - 1.5, 0); // 1.5px gap between segments
          // dashoffset: negative = shift arc clockwise by that amount
          el.setAttribute('stroke-dasharray', `${len} ${C - len}`);
          el.setAttribute('stroke-dashoffset', `${-consumed}`);
          consumed += frac * C;
        });
      });
    });
  } catch {
    loadingEl.style.display = 'none';
    errorEl.style.display   = 'block';
  }
}

// ── Letterboxd ────────────────────────────────────────
async function loadLetterboxd() {
  const loadingEl = document.getElementById('lb-loading');
  const bodyEl    = document.getElementById('lb-body');
  const filmsEl   = document.getElementById('lb-films');
  const footerEl  = document.getElementById('lb-footer');
  const errorEl   = document.getElementById('lb-error');
  if (!loadingEl) return;
  try {
    const rssUrl   = 'https://letterboxd.com/kraxondrafts/rss/';
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;
    const res      = await fetch(proxyUrl);
    if (!res.ok) throw new Error();
    const json     = await res.json();
    const doc      = new DOMParser().parseFromString(json.contents, 'application/xml');
    const items    = Array.from(doc.querySelectorAll('item')).slice(0, 4);
    if (!items.length) throw new Error();

    const stars = s => { if (!s) return ''; const n = (s.match(/★/g)||[]).length; const h = s.includes('½') ? '½' : ''; return n > 0 ? '★'.repeat(n)+h : ''; };
    const title = s => s.replace(/^Watched\s+/i,'').replace(/,\s*\d{4}.*$/,'').trim();
    const year  = s => { const m = s.match(/,\s*(\d{4})/); return m ? m[1] : ''; };

    filmsEl.innerHTML = items.map(item => {
      const raw  = item.querySelector('title')?.textContent || '—';
      const desc = item.querySelector('description')?.textContent || '';
      const st   = stars(desc) || stars(raw);
      return `<div class="lb-film-chip"><div class="lb-title">${title(raw)}</div><div class="lb-year">${year(raw)}</div><div class="lb-stars">${st || '·'}</div></div>`;
    }).join('');

    footerEl.innerHTML = `<span>recent watches</span><span>kraxondrafts</span>`;
    loadingEl.style.display = 'none';
    bodyEl.style.display    = 'block';
  } catch {
    loadingEl.style.display = 'none';
    errorEl.style.display   = 'block';
  }
}

// ── WakaTime — JSONP ──────────────────────────────────
function loadWakatime() {
  const loadingEl = document.getElementById('waka-loading');
  const bodyEl    = document.getElementById('waka-body');
  const totalEl   = document.getElementById('waka-total');
  const subEl     = document.getElementById('waka-sub');
  const langsEl   = document.getElementById('waka-langs');
  const daysEl    = document.getElementById('waka-days');
  const errorEl   = document.getElementById('waka-error');
  if (!loadingEl) return;

  window._wakaCallback = function (response) {
    try {
      const data = response.data;
      totalEl.textContent = data.grand_total?.human_readable_total ?? '—';
      const avg = data.grand_total?.human_readable_daily_average;
      subEl.textContent   = avg ? `this week · ${avg}/day avg` : 'this week';

      const langs = (data.languages || []).slice(0, 5);
      langsEl.innerHTML = langs.map(l => `
        <div class="waka-bar-row">
          <span class="waka-bar-name">${l.name}</span>
          <div class="waka-bar-track"><div class="waka-bar-fill" style="width:0%" data-pct="${l.percent.toFixed(1)}%"></div></div>
          <span class="waka-bar-pct">${l.percent.toFixed(1)}%</span>
        </div>`).join('');

      const days    = data.days || [];
      const names   = ['Su','Mo','Tu','We','Th','Fr','Sa'];
      const maxSecs = Math.max(...days.map(d => d.grand_total?.total_seconds ?? 0), 1);
      daysEl.innerHTML = days.slice(-7).map(d => {
        const secs = d.grand_total?.total_seconds ?? 0;
        const h    = Math.round((secs / maxSecs) * 100);
        const lbl  = names[new Date(d.date).getDay()];
        return `<div class="waka-day-col" title="${lbl}: ${(secs/3600).toFixed(1)}h"><div style="flex:1;width:100%;display:flex;align-items:flex-end;"><div class="waka-day-bar" style="height:${Math.max(h,2)}%"></div></div><span class="waka-day-lbl">${lbl}</span></div>`;
      }).join('');

      loadingEl.style.display = 'none';
      bodyEl.style.display    = 'block';
      requestAnimationFrame(() => {
        document.querySelectorAll('.waka-bar-fill').forEach(b => { b.style.width = b.dataset.pct; });
      });
    } catch {
      loadingEl.style.display = 'none';
      errorEl.style.display   = 'block';
    }
  };

  const script = document.createElement('script');
  script.onerror = () => { loadingEl.style.display = 'none'; errorEl.style.display = 'block'; };
  script.src = 'https://wakatime.com/share/@kraxonyanks/6804776e-f4c6-4051-b7b7-3607a7851030.json?callback=_wakaCallback';
  document.head.appendChild(script);
}

// ── Fire all ──────────────────────────────────────────
loadChessStats();
loadLeetCode();
loadLetterboxd();
loadWakatime();

// ── Console vibe ──────────────────────────────────────
console.log('%c portfolio loaded 🚀', 'color:#e8c547; font-size:13px; font-weight:bold;');
