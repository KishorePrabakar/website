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
    hiddenCards.forEach(c => { c.style.display = expanded ? 'block' : 'none'; });
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

// ── Chess.com ─────────────────────────────────────────
async function loadChessStats() {
  const loadingEl = document.getElementById('chess-loading');
  const contentEl = document.getElementById('chess-content');
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

    let totalWins = 0, totalLosses = 0, totalDraws = 0;

    ratingsEl.innerHTML = modes.map(({ key, label }) => {
      const mode = stats[key];
      if (!mode) return `<div class="chess-mode"><div class="chess-mode-name">${label}</div><div class="chess-mode-rating" style="font-size:0.9rem;color:var(--text-light)">—</div><div class="chess-mode-best">no games</div></div>`;
      const current = mode.last?.rating ?? '—';
      const best    = mode.best?.rating ?? '—';
      const record  = mode.record ?? {};
      totalWins   += record.win  ?? 0;
      totalLosses += record.loss ?? 0;
      totalDraws  += record.draw ?? 0;
      return `<div class="chess-mode"><div class="chess-mode-name">${label}</div><div class="chess-mode-rating">${current}</div><div class="chess-mode-best">best ${best}</div></div>`;
    }).join('');

    const totalGames = totalWins + totalLosses + totalDraws;
    const winPct     = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;

    recordEl.innerHTML = `
      <span><span class="chess-w">▲ ${totalWins}W</span></span>
      <span><span class="chess-l">▼ ${totalLosses}L</span></span>
      <span><span class="chess-d">◆ ${totalDraws}D</span></span>
      <span style="margin-left:auto;color:var(--text-light)">${winPct}% win rate · ${totalGames} games</span>
    `;

    loadingEl.style.display = 'none';
    contentEl.style.display = 'block';
  } catch {
    loadingEl.style.display = 'none';
    errorEl.style.display   = 'block';
  }
}

// ── LeetCode ──────────────────────────────────────────
async function loadLeetCode() {
  const loadingEl = document.getElementById('lc-loading');
  const contentEl = document.getElementById('lc-content');
  const statsEl   = document.getElementById('lc-stats');
  const totalsEl  = document.getElementById('lc-totals');
  const errorEl   = document.getElementById('lc-error');
  if (!loadingEl) return;

  try {
    const res  = await fetch('https://leetcode-stats-api.herokuapp.com/KishorePrabakar');
    if (!res.ok) throw new Error();
    const data = await res.json();
    if (data.status === 'error') throw new Error();

    const { easySolved, totalEasy, mediumSolved, totalMedium,
            hardSolved, totalHard, totalSolved, acceptanceRate, ranking } = data;

    const diffs = [
      { label: 'Easy',   solved: easySolved,   total: totalEasy,   cls: 'easy'   },
      { label: 'Medium', solved: mediumSolved, total: totalMedium, cls: 'medium' },
      { label: 'Hard',   solved: hardSolved,   total: totalHard,   cls: 'hard'   },
    ];

    statsEl.innerHTML = diffs.map(d => {
      const pct = d.total > 0 ? Math.round((d.solved / d.total) * 100) : 0;
      return `
        <div class="lc-row">
          <span class="lc-difficulty lc-${d.cls}">${d.label}</span>
          <div class="lc-bar-wrap"><div class="lc-bar-fill ${d.cls}" style="width:0%" data-pct="${pct}%"></div></div>
          <span class="lc-count">${d.solved}<span style="color:var(--text-light);font-size:0.6rem;">/${d.total}</span></span>
        </div>`;
    }).join('');

    totalsEl.innerHTML = `
      <div class="lc-total-stat"><span class="lc-total-val">${totalSolved}</span><span class="lc-total-lbl">solved</span></div>
      <div class="lc-total-stat"><span class="lc-total-val">#${ranking?.toLocaleString() ?? '—'}</span><span class="lc-total-lbl">rank</span></div>
      <div class="lc-total-stat"><span class="lc-total-val">${acceptanceRate ? acceptanceRate.toFixed(1) + '%' : '—'}</span><span class="lc-total-lbl">acceptance</span></div>
    `;

    loadingEl.style.display = 'none';
    contentEl.style.display = 'block';

    requestAnimationFrame(() => {
      document.querySelectorAll('.lc-bar-fill').forEach(bar => { bar.style.width = bar.dataset.pct; });
    });
  } catch {
    loadingEl.style.display = 'none';
    errorEl.style.display   = 'block';
  }
}

// ── Letterboxd — RSS via allorigins proxy ─────────────
async function loadLetterboxd() {
  const loadingEl = document.getElementById('lb-loading');
  const contentEl = document.getElementById('lb-content');
  const filmsEl   = document.getElementById('lb-films');
  const footerEl  = document.getElementById('lb-footer');
  const errorEl   = document.getElementById('lb-error');
  if (!loadingEl) return;

  try {
    const rssUrl   = 'https://letterboxd.com/`kraxondrafts/rss/';
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;
    const res      = await fetch(proxyUrl);
    if (!res.ok) throw new Error();
    const json     = await res.json();

    const parser = new DOMParser();
    const doc    = parser.parseFromString(json.contents, 'application/xml');
    const items  = Array.from(doc.querySelectorAll('item')).slice(0, 4);
    if (items.length === 0) throw new Error();

    function parseStars(desc) {
      if (!desc) return '';
      const stars = (desc.match(/★/g) || []).length;
      const half  = desc.includes('½') ? '½' : '';
      return stars > 0 ? '★'.repeat(stars) + half : '';
    }

    function parseFilmTitle(rawTitle) {
      // Letterboxd item titles look like: "Watched Inception, 2010 - ★★★★"
      return rawTitle
        .replace(/^Watched\s+/i, '')
        .replace(/,\s*\d{4}.*$/, '')
        .trim();
    }

    function parseYear(rawTitle) {
      const m = rawTitle.match(/,\s*(\d{4})/);
      return m ? m[1] : '';
    }

    filmsEl.innerHTML = items.map(item => {
      const rawTitle = item.querySelector('title')?.textContent || '—';
      const desc     = item.querySelector('description')?.textContent || '';
      const title    = parseFilmTitle(rawTitle);
      const year     = parseYear(rawTitle);
      const stars    = parseStars(desc) || parseStars(rawTitle);
      return `
        <div class="lb-film">
          <div class="lb-film-title">${title}</div>
          <div class="lb-film-year">${year}</div>
          <div class="lb-stars">${stars || '·'}</div>
        </div>`;
    }).join('');

    footerEl.innerHTML = `
      <span>recent watches</span>
      <span class="lb-count">kraxondrafts</span>
    `;

    loadingEl.style.display = 'none';
    contentEl.style.display = 'block';
  } catch {
    loadingEl.style.display = 'none';
    errorEl.style.display   = 'block';
  }
}

// ── Wakatime — JSONP share endpoint ───────────────────
function loadWakatime() {
  const loadingEl = document.getElementById('waka-loading');
  const contentEl = document.getElementById('waka-content');
  const totalEl   = document.getElementById('waka-total');
  const subEl     = document.getElementById('waka-sub');
  const langsEl   = document.getElementById('waka-langs');
  const daysEl    = document.getElementById('waka-days');
  const errorEl   = document.getElementById('waka-error');
  if (!loadingEl) return;

  // JSONP callback
  window._wakaCallback = function (response) {
    try {
      const data = response.data;

      // ── Weekly total ──
      const total    = data.grand_total?.human_readable_total ?? '—';
      const dailyAvg = data.grand_total?.human_readable_daily_average ?? '—';
      totalEl.textContent = total;
      subEl.textContent   = `this week · ${dailyAvg}/day avg`;

      // ── Top languages ──
      const langs = (data.languages || []).slice(0, 5);
      langsEl.innerHTML = langs.map(lang => `
        <div class="waka-lang-row">
          <span class="waka-lang-name">${lang.name}</span>
          <div class="waka-bar-wrap"><div class="waka-bar-fill" style="width:0%" data-pct="${lang.percent.toFixed(1)}%"></div></div>
          <span class="waka-pct">${lang.percent.toFixed(1)}%</span>
        </div>`).join('');

      // ── Daily breakdown ──
      const days     = data.days || [];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const maxSecs  = Math.max(...days.map(d => d.grand_total?.total_seconds ?? 0), 1);

      daysEl.innerHTML = days.slice(-7).map(d => {
        const secs    = d.grand_total?.total_seconds ?? 0;
        const heightPct = Math.round((secs / maxSecs) * 100);
        const dateObj = new Date(d.date);
        const label   = dayNames[dateObj.getDay()];
        const hrs     = (secs / 3600).toFixed(1);
        return `
          <div class="waka-day-col" title="${label}: ${hrs}h">
            <div style="flex:1;width:100%;display:flex;align-items:flex-end;">
              <div class="waka-day-bar" style="height:${Math.max(heightPct, 2)}%"></div>
            </div>
            <span class="waka-day-lbl">${label}</span>
          </div>`;
      }).join('');

      loadingEl.style.display = 'none';
      contentEl.style.display = 'block';

      requestAnimationFrame(() => {
        document.querySelectorAll('.waka-bar-fill').forEach(bar => { bar.style.width = bar.dataset.pct; });
      });
    } catch {
      loadingEl.style.display = 'none';
      errorEl.style.display   = 'block';
    }
  };

  // Inject JSONP script tag
  const script   = document.createElement('script');
  script.onerror = () => { loadingEl.style.display = 'none'; errorEl.style.display = 'block'; };
  script.src     = 'https://wakatime.com/share/@kraxonyanks/6804776e-f4c6-4051-b7b7-3607a7851030.json?callback=_wakaCallback';
  document.head.appendChild(script);
}

// ── Fire all ──────────────────────────────────────────
loadChessStats();
loadLeetCode();
loadLetterboxd();
loadWakatime();
// Spotify & Duolingo are static embed images — no JS needed.

// ── Console vibe ──────────────────────────────────────
console.log('%c portfolio loaded 🚀', 'color:#e8c547; font-size:13px; font-weight:bold;');
