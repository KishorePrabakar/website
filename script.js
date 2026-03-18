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

// ── Local clock ──────────────────────────────────────
(function () {
  const el = document.getElementById('local-time');
  if (!el) return;
  function tick() {
    el.textContent = new Date().toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    });
  }
  tick();
  setInterval(tick, 1000);
})();

// ── Chess.com ─────────────────────────────────────────
async function loadChessStats() {
  const load = document.getElementById('chess-loading');
  const body = document.getElementById('chess-body');
  const rat  = document.getElementById('chess-ratings');
  const rec  = document.getElementById('chess-record');
  const err  = document.getElementById('chess-error');
  const pip  = document.getElementById('chess-pip');
  if (!load) return;
  try {
    const res = await fetch('https://api.chess.com/pub/player/kraxonknight/stats');
    if (!res.ok) throw new Error();
    const s = await res.json();
    let w = 0, l = 0, d = 0;
    rat.innerHTML = [
      { key: 'chess_rapid',  lbl: 'Rapid'  },
      { key: 'chess_blitz',  lbl: 'Blitz'  },
      { key: 'chess_bullet', lbl: 'Bullet' },
    ].map(({ key, lbl }) => {
      const m = s[key];
      if (!m) return `<div class="ch-mode"><div class="ch-label">${lbl}</div><div class="ch-rating" style="font-size:.8rem;color:var(--text-light)">—</div></div>`;
      const r = m.record ?? {};
      w += r.win ?? 0; l += r.loss ?? 0; d += r.draw ?? 0;
      return `<div class="ch-mode"><div class="ch-label">${lbl}</div><div class="ch-rating">${m.last?.rating ?? '—'}</div><div class="ch-best">best ${m.best?.rating ?? '—'}</div></div>`;
    }).join('');
    const tot = w + l + d;
    const pct = tot > 0 ? Math.round(w / tot * 100) : 0;
    rec.innerHTML = `<span class="ch-w">▲ ${w}W</span><span class="ch-l">▼ ${l}L</span><span>◆ ${d}D</span><span style="margin-left:auto;font-size:.56rem;color:var(--text-light)">${pct}% · ${tot}g</span>`;
    load.style.display = 'none';
    body.style.display = 'block';
    if (pip) pip.style.cssText = 'background:#4ade80;box-shadow:0 0 5px #4ade80';
  } catch {
    load.style.display = 'none';
    err.style.display  = 'block';
    if (pip) pip.style.cssText = 'background:#f87171;box-shadow:0 0 5px #f87171';
  }
}

// ── Cache helpers (1hr TTL) ──────────────────────────
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function cacheGet(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) { localStorage.removeItem(key); return null; }
    return data;
  } catch { return null; }
}

function cacheSet(key, data) {
  try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data })); } catch {}
}

// ── LeetCode — faster API + cache ────────────────────
async function loadLeetCode() {
  const load = document.getElementById('lc-loading');
  const body = document.getElementById('lc-body');
  const num  = document.getElementById('lc-solved-num');
  const rows = document.getElementById('lc-rows');
  const foot = document.getElementById('lc-foot');
  const err  = document.getElementById('lc-error');
  const pip  = document.getElementById('lc-pip');
  if (!load) return;

  function render(d) {
    const C   = 2 * Math.PI * 32;
    const all = d.totalEasy + d.totalMedium + d.totalHard;
    num.textContent = d.totalSolved;

    const segs = [
      { id:'seg-easy',   val:d.easySolved,  tot:d.totalEasy,   c:'#00b8a3', lbl:'Easy'   },
      { id:'seg-medium', val:d.mediumSolved, tot:d.totalMedium, c:'#ffc01e', lbl:'Medium' },
      { id:'seg-hard',   val:d.hardSolved,   tot:d.totalHard,   c:'#ef4743', lbl:'Hard'   },
    ];

    rows.innerHTML = segs.map(s =>
      `<div class="lc-row">
        <span class="lc-dot" style="background:${s.c};box-shadow:0 0 4px ${s.c}66"></span>
        <span class="lc-dname">${s.lbl}</span>
        <span class="lc-cnt">${s.val}<span style="color:var(--text-light);font-size:.5rem">/${s.tot}</span></span>
      </div>`).join('');

    foot.innerHTML = `rank <strong>#${d.ranking?.toLocaleString() ?? '—'}</strong>${d.acceptanceRate ? ' · ' + d.acceptanceRate.toFixed(1) + '% acc' : ''}`;

    load.style.display = 'none';
    body.style.display = 'block';
    if (pip) pip.style.cssText = 'background:#4ade80;box-shadow:0 0 5px #4ade80';

    requestAnimationFrame(() => {
      segs.forEach(s => {
        const el = document.getElementById(s.id);
        if (el) el.setAttribute('stroke-dasharray', `0 ${C}`);
      });
      requestAnimationFrame(() => {
        let used = 0;
        segs.forEach(s => {
          const el = document.getElementById(s.id);
          if (!el) return;
          const frac = all > 0 ? s.val / all : 0;
          const len  = Math.max(frac * C - 1.5, 0);
          el.setAttribute('stroke-dasharray', `${len} ${C - len}`);
          el.setAttribute('stroke-dashoffset', `${-used}`);
          used += frac * C;
        });
      });
    });
  }

  // Show cached immediately, then refresh in background
  const cached = cacheGet('lc_stats');
  if (cached) { render(cached); }

  try {
    // API list: Vercel community deploy first (no cold start), then fallbacks
    const apis = [
      { url: 'https://leetcode-stats-api.vercel.app/KishorePrabakar', timeout: 8000 },
      { url: 'https://leetcode-stats-api.herokuapp.com/KishorePrabakar', timeout: 15000 },
      { url: 'https://alfa-leetcode-api.onrender.com/KishorePrabakar', timeout: 12000 },
    ];

    let d = null;
    for (const { url, timeout } of apis) {
      try {
        const res = await Promise.race([
          fetch(url),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout))
        ]);
        if (!res.ok) continue;
        const raw = await res.json();
        if (raw.status === 'error') continue;

        // Normalize — all three APIs have slightly different shapes
        d = {
          easySolved:   raw.easySolved   ?? raw.easy   ?? 0,
          totalEasy:    raw.totalEasy    ?? 876,
          mediumSolved: raw.mediumSolved ?? raw.medium ?? 0,
          totalMedium:  raw.totalMedium  ?? 1844,
          hardSolved:   raw.hardSolved   ?? raw.hard   ?? 0,
          totalHard:    raw.totalHard    ?? 808,
          totalSolved:  raw.totalSolved  ?? raw.solvedProblem ?? (raw.easy + raw.medium + raw.hard) ?? 0,
          acceptanceRate: raw.acceptanceRate ?? null,
          ranking:      raw.ranking      ?? null,
        };
        if ((d.totalSolved ?? 0) > 0) break;
        d = null;
      } catch { continue; }
    }

    if (!d) throw new Error('all apis failed');
    cacheSet('lc_stats', d);
    if (!cached) render(d);
  } catch {
    if (!cached) {
      load.style.display = 'none';
      err.style.display  = 'block';
      if (pip) pip.style.cssText = 'background:#f87171;box-shadow:0 0 5px #f87171';
    }
  }
}

// ── WakaTime — arc donut, multi-strategy fetch ────────
function loadWakatime() {
  const load    = document.getElementById('waka-loading');
  const body    = document.getElementById('waka-body');
  const errEl   = document.getElementById('waka-error');
  const arcSvg  = document.getElementById('wk-arc-svg');
  const legend  = document.getElementById('wk-legend');
  const totalEl = document.getElementById('wk-arc-total');
  const pip     = document.getElementById('waka-pip');
  if (!load) return;

  const PAL = ['#e8c547','#f0a500','#c47ed4','#5ba4cf','#4ade80','#f87171','#60a5fa','#fb923c'];

  function renderArc(langs, totalText) {
    // If no total provided, sum up from first lang time or show top lang
    const abbr = (t) => (t||'').replace(/\s*hours?/gi,'h').replace(/\s*mins?/gi,'m').replace(/\s*secs?/gi,'s').trim();
    let display = abbr(totalText);
    if (!display && langs.length > 0) {
      // Use top language time as proxy
      display = abbr(langs[0].text || '') || langs[0].name.split(' ')[0];
    }
    if (totalEl) totalEl.textContent = display || '—';
    const R=50,CX=60,CY=60,C=2*Math.PI*R,G=2;
    const top = langs.slice(0,5);
    arcSvg.innerHTML = `<circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="var(--tag-bg)" stroke-width="10"/>`;
    let off=0;
    top.forEach((l,i)=>{
      const len=Math.max((l.percent/100)*C-G,0);
      const el=document.createElementNS('http://www.w3.org/2000/svg','circle');
      el.setAttribute('cx',CX); el.setAttribute('cy',CY); el.setAttribute('r',R);
      el.setAttribute('fill','none'); el.setAttribute('stroke',PAL[i]);
      el.setAttribute('stroke-width','10'); el.setAttribute('stroke-linecap','butt');
      el.setAttribute('stroke-dasharray',`0 ${C}`);
      el.setAttribute('stroke-dashoffset',`-${off}`);
      el.style.transition=`stroke-dasharray 0.9s cubic-bezier(.4,0,.2,1) ${i*.08}s`;
      el.style.filter=`drop-shadow(0 0 3px ${PAL[i]}88)`;
      arcSvg.appendChild(el);
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        el.setAttribute('stroke-dasharray',`${len} ${C-len}`);
      }));
      off+=(l.percent/100)*C;
    });
    legend.innerHTML=top.map((l,i)=>`
      <div class="wk-leg-row">
        <span class="wk-leg-dot" style="background:${PAL[i]};box-shadow:0 0 4px ${PAL[i]}88"></span>
        <span class="wk-leg-name">${l.name}</span>
        <span class="wk-leg-time">${l.text||''}</span>
        <span class="wk-leg-pct">${l.percent.toFixed(0)}%</span>
      </div>`).join('');
    load.style.display='none'; body.style.display='block';
    if(pip) pip.style.cssText='background:#4ade80;box-shadow:0 0 5px #4ade80';
  }

  function showFallback() {
    load.style.display='none'; errEl.style.display='block';
    if(pip) pip.style.cssText='background:#f87171;box-shadow:0 0 5px #f87171';
  }

  const cached = cacheGet('waka_v3');
  if (cached?.languages?.length) { renderArc(cached.languages, cached.total||''); return; }

  async function tryAPI() {
    try {
      const url   = 'https://wakatime.com/api/v1/users/kraxonyanks/stats/last_7_days';
      const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const res   = await Promise.race([fetch(proxy),new Promise((_,r)=>setTimeout(()=>r(),6000))]);
      if(!res?.ok) throw 0;
      const {contents}=await res.json();
      const d=JSON.parse(contents)?.data;
      if(!d?.languages?.length) throw 0;
      const ls=d.languages.map(l=>({name:l.name,text:l.text,percent:l.percent}));
      const tot=d.grand_total?.human_readable_total||d.grand_total?.text||'';
      cacheSet('waka_v3',{languages:ls,total:tot});
      return {ls,total:tot};
    } catch { return null; }
  }

  async function run() {
    const api = await tryAPI();
    if(api) { renderArc(api.ls, api.total); return; }

    // JSONP fallback
    const timer = setTimeout(showFallback, 5000);
    window._wakaCallback = function(r) {
      clearTimeout(timer);
      try {
        const data=r?.data??r;
        if(!data?.languages?.length) throw 0;
        const ls=data.languages.map(l=>({name:l.name,text:l.text,percent:l.percent}));
        const tot=data.grand_total?.human_readable_total||data.grand_total?.text||'';
        cacheSet('waka_v3',{languages:ls,total:tot});
        renderArc(ls,tot);
      } catch { showFallback(); }
    };
    const s=document.createElement('script');
    s.onerror=()=>{clearTimeout(timer);showFallback();};
    s.src='https://wakatime.com/share/@kraxonyanks/6804776e-f4c6-4051-b7b7-3607a7851030.json?callback=_wakaCallback';
    document.head.appendChild(s);
  }
  run();
}

// ── GitHub contribution canvas ────────────────────────
async function loadGithubCanvas() {
  const canvas   = document.getElementById('gh-canvas');
  const totalEl  = document.getElementById('gh-total');
  const streakEl = document.getElementById('gh-streak');
  const longEl   = document.getElementById('gh-longest');
  if (!canvas) return;

  function applyFallback() {
    if(totalEl)  totalEl.textContent='233';
    if(streakEl) streakEl.textContent='5';
    if(longEl)   longEl.textContent='6';
    canvas.style.display='none';
  }

  const cached = cacheGet('gh_contrib_v2');
  if (cached?.contributions?.length) {
    computeStats(cached);
    drawCanvas(canvas, cached.contributions);
    return;
  }

  try {
    // jogruber API — dedicated public GitHub contributions API with CORS
    const urls = [
      'https://github-contributions-api.jogruber.de/v4/KishorePrabakar?y=last',
      `https://api.allorigins.win/get?url=${encodeURIComponent('https://github-contributions-api.jogruber.de/v4/KishorePrabakar?y=last')}`,
    ];
    let data = null;
    for (const url of urls) {
      try {
        const res = await Promise.race([fetch(url),new Promise((_,r)=>setTimeout(()=>r(),7000))]);
        if (!res?.ok) continue;
        const json = await res.json();
        data = json.contributions ? json : (json.contents ? JSON.parse(json.contents) : null);
        if (data?.contributions?.length) break;
        data = null;
      } catch { continue; }
    }
    if (!data?.contributions?.length) throw 0;
    cacheSet('gh_contrib_v2', data);
    computeStats(data);
    drawCanvas(canvas, data.contributions);
  } catch { applyFallback(); }

  function computeStats(data) {
    const days=data.contributions;
    const total=Object.values(data.total||{}).reduce((s,v)=>s+v,0)||days.reduce((s,d)=>s+d.count,0);
    let cur=0,longest=0,run=0;
    // Find last day with actual data (skip today if no commit yet)
    let lastActive=days.length-1;
    while(lastActive>0 && days[lastActive].count===0) lastActive--;
    for(let i=lastActive;i>=0;i--){ if(days[i].count>0)cur++; else break; }
    days.forEach(d=>{ if(d.count>0){run++;longest=Math.max(longest,run);}else run=0; });
    if(totalEl)  totalEl.textContent=total;
    if(streakEl) streakEl.textContent=cur;
    if(longEl)   longEl.textContent=longest;
  }
}

function drawCanvas(canvas, days) {
  const COLS=52,ROWS=7,S=9,GAP=2;
  canvas.width=COLS*(S+GAP)-GAP; canvas.height=ROWS*(S+GAP)-GAP;
  canvas.style.width='100%'; canvas.style.height='auto';
  const ctx=canvas.getContext('2d');
  const dark=document.documentElement.getAttribute('data-theme')!=='light';
  const fills=dark
    ?['#1e2126','rgba(232,197,71,.18)','rgba(232,197,71,.48)','#e8c547']
    :['#e5e7eb','#bbf7d0','#4ade80','#16a34a'];
  days.slice(-COLS*ROWS).forEach((d,i)=>{
    const x=Math.floor(i/ROWS)*(S+GAP), y=(i%ROWS)*(S+GAP);
    const lvl=Math.min(d.level??(d.count===0?0:d.count<3?1:d.count<6?2:3),3);
    ctx.fillStyle=fills[lvl];
    ctx.beginPath();
    if(ctx.roundRect) ctx.roundRect(x,y,S,S,2); else ctx.rect(x,y,S,S);
    ctx.fill();
  });
}

// ── Fire all ──────────────────────────────────────────
loadChessStats();
loadLeetCode();
loadWakatime();
loadGithubCanvas();

// ── Console vibe ──────────────────────────────────────
console.log('%c portfolio loaded 🚀', 'color:#e8c547; font-size:13px; font-weight:bold;');
