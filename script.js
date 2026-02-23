// ── Theme toggle ──────────────────────────────────────
const toggle   = document.getElementById('theme-toggle');
const html     = document.documentElement;
const moonIcon = document.getElementById('icon-moon');
const sunIcon  = document.getElementById('icon-sun');

function setTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  if (theme === 'dark') {
    moonIcon.style.display = '';
    sunIcon.style.display  = 'none';
  } else {
    moonIcon.style.display = 'none';
    sunIcon.style.display  = '';
  }
}

const savedTheme = localStorage.getItem('theme') ||
  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
setTheme(savedTheme);

toggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');

  // Spin animation
  toggle.classList.remove('is-spinning');
  void toggle.offsetWidth; // reflow to restart
  toggle.classList.add('is-spinning');
  setTimeout(() => toggle.classList.remove('is-spinning'), 520);

  // Ripple burst
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
    hiddenCards.forEach(card => {
      card.style.display = expanded ? 'block' : 'none';
    });
    toggleBtn.textContent = expanded ? 'show less ↑' : 'show 6 more ↓';
  });
}

// ── Smooth scroll ─────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ── Chess.com live stats ──────────────────────────────
async function loadChessStats() {
  const loadingEl = document.getElementById('chess-loading');
  const contentEl = document.getElementById('chess-content');
  const ratingsEl = document.getElementById('chess-ratings');
  const recordEl  = document.getElementById('chess-record');
  const errorEl   = document.getElementById('chess-error');

  if (!loadingEl) return; // not on a page with chess card

  const USERNAME = 'kraxonknight';

  try {
    const [statsRes, profileRes] = await Promise.all([
      fetch(`https://api.chess.com/pub/player/${USERNAME}/stats`),
      fetch(`https://api.chess.com/pub/player/${USERNAME}`)
    ]);

    if (!statsRes.ok) throw new Error('stats fetch failed');
    const stats = await statsRes.json();

    // Modes to display in order of preference
    const modes = [
      { key: 'chess_rapid',  label: 'Rapid'  },
      { key: 'chess_blitz',  label: 'Blitz'  },
      { key: 'chess_bullet', label: 'Bullet' },
    ];

    let totalWins = 0, totalLosses = 0, totalDraws = 0;

    ratingsEl.innerHTML = modes.map(({ key, label }) => {
      const mode = stats[key];
      if (!mode) return `
        <div class="chess-mode">
          <div class="chess-mode-name">${label}</div>
          <div class="chess-mode-rating" style="font-size:0.9rem;color:var(--text-light)">—</div>
          <div class="chess-mode-best">no games</div>
        </div>`;

      const current = mode.last?.rating ?? '—';
      const best    = mode.best?.rating ?? '—';
      const record  = mode.record ?? {};

      totalWins   += record.win  ?? 0;
      totalLosses += record.loss ?? 0;
      totalDraws  += record.draw ?? 0;

      return `
        <div class="chess-mode">
          <div class="chess-mode-name">${label}</div>
          <div class="chess-mode-rating">${current}</div>
          <div class="chess-mode-best">best ${best}</div>
        </div>`;
    }).join('');

    const totalGames = totalWins + totalLosses + totalDraws;
    const winPct = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;

    recordEl.innerHTML = `
      <span><span class="chess-w">▲ ${totalWins}W</span></span>
      <span><span class="chess-l">▼ ${totalLosses}L</span></span>
      <span><span class="chess-d">◆ ${totalDraws}D</span></span>
      <span style="margin-left:auto;color:var(--text-light)">${winPct}% win rate · ${totalGames} games</span>
    `;

    loadingEl.style.display = 'none';
    contentEl.style.display = 'block';

  } catch (err) {
    console.warn('Chess.com fetch failed:', err);
    loadingEl.style.display = 'none';
    errorEl.style.display   = 'block';
  }
}

loadChessStats();

// ── Console vibe ──────────────────────────────────────
console.log('%c portfolio loaded 🚀', 'color:#e8c547; font-size:13px; font-weight:bold;');
