import { SEED_DATA } from './conquer-data.js';

// ─── Config ────────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://kbmimkfdhblyrdskdcxc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_fBTnwIh34wJb61_aXNzk6Q_sv5oZkoG';

let supabase = null;
if (window.supabase) {
    try { supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY); }
    catch (e) { console.warn('Supabase init failed', e); }
}

// ─── Section colour palette ─────────────────────────────────────────────────
const SECTION_COLORS = [
    '#f5c542','#4f9ef5','#6ee7b7','#f87171',
    '#c084fc','#fb923c','#34d399','#e879f9','#38bdf8'
];

// ─── App State ──────────────────────────────────────────────────────────────
const state = {
    user: null,
    sections: [],
    goals: [],
    subtasks: [],
    workLogs: [],
    loading: true,
    searchQuery: '',
    expandedSections: new Set(),
    // Layout: { sectionId: { width, columnPos } }
    layout: JSON.parse(localStorage.getItem('cq-layout') || '{}'),
    // Calendar
    cal: { view: 'streak', selected: new Set(), visible: true },
    // Timer
    timer: { active: false, mode: 'pomodoro', secsRemaining: 25*60, secsElapsed: 0, intervalId: null, goalId: null },
    // Modal
    modal: { type: null, contextId: null, resolve: null }
};

// ─── Helpers ────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const today = () => new Date().toISOString().split('T')[0];
const sectionColor = idx => SECTION_COLORS[idx % SECTION_COLORS.length];

function fmt(s) {
    if (!s) return '0s';
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
    if (h >= 24) return `${Math.floor(h/24)}d ${h%24}h`;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m`;
    return `${s}s`;
}

function shortDate(raw) {
    if (!raw) return '';
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return raw;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function shortTime(raw) {
    if (!raw) return '';
    if (/^\d{2}:\d{2}$/.test(raw)) return raw;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return raw;
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

let toastTimer;
function toast(msg, type = 'info') {
    const el = $('toast');
    el.textContent = msg;
    el.className = `cq-toast show ${type}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

function saveLayout() {
    localStorage.setItem('cq-layout', JSON.stringify(state.layout));
}

// ─── Auth ────────────────────────────────────────────────────────────────────
async function init() {
    if (!supabase) {
        $('config-notice').classList.remove('hidden');
        showAuth();
        return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    state.user = session?.user ?? null;
    renderAuth();
    if (state.user) await loadData();

    supabase.auth.onAuthStateChange(async (_ev, sess) => {
        state.user = sess?.user ?? null;
        renderAuth();
        if (state.user) await loadData();
    });

    bindAuth();
    bindGlobal();
    bindTimer();
}

function showAuth() {
    $('loading-view').classList.add('hidden');
    $('auth-view').classList.remove('hidden');
    $('app-view').classList.add('hidden');
}

function renderAuth() {
    $('loading-view').classList.add('hidden');
    if (state.user) {
        $('auth-view').classList.add('hidden');
        $('app-view').classList.remove('hidden');
    } else {
        $('auth-view').classList.remove('hidden');
        $('app-view').classList.add('hidden');
    }
}

function bindAuth() {
    $('btn-login-pw').addEventListener('click', async () => {
        const email = $('input-email').value.trim();
        const pw = $('input-password').value;
        if (!email || !pw) return toast('Enter email and password', 'error');
        const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
        if (error) toast(error.message, 'error');
    });
    $('btn-signup-pw').addEventListener('click', async () => {
        const email = $('input-email').value.trim();
        const pw = $('input-password').value;
        if (!email || !pw) return toast('Enter email and password', 'error');
        const { error } = await supabase.auth.signUp({ email, password: pw });
        if (error) toast(error.message, 'error');
        else toast('Check your email to confirm!', 'success');
    });
    $('btn-magic-link').addEventListener('click', async () => {
        const email = $('input-email').value.trim();
        if (!email) return toast('Enter your email', 'error');
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) toast(error.message, 'error');
        else toast('Magic link sent!', 'success');
    });
    $('btn-logout').addEventListener('click', async () => {
        await supabase.auth.signOut();
    });
}

// ─── Data Loading ────────────────────────────────────────────────────────────
async function loadData() {
    state.loading = true;
    renderLoading();
    try {
        const [s, g, st, wl] = await Promise.all([
            supabase.from('sections').select('*').order('sort_order'),
            supabase.from('tasks').select('*').order('sort_order'),
            supabase.from('subtasks').select('*').order('sort_order'),
            supabase.from('work_logs').select('*').order('created_at')
        ]);
        if (s.error) throw s.error;
        if (g.error) throw g.error;
        state.sections = s.data ?? [];
        state.goals = g.data ?? [];
        state.subtasks = st.data ?? [];
        state.workLogs = wl.data ?? [];

        if (state.sections.length === 0) await seedDB();
        state.sections.forEach(sec => state.expandedSections.add(sec.id));
    } catch (e) {
        toast(e.message, 'error');
    }
    state.loading = false;
    renderAll();
}

function renderLoading() {
    const ws = $('sections-workspace');
    if (ws) ws.innerHTML = '<div style="color:var(--cq-dim);padding:2rem;text-align:center">Loading…</div>';
}

async function seedDB() {
    toast('Seeding initial data…');
    for (let i = 0; i < SEED_DATA.length; i++) {
        const sd = SEED_DATA[i];
        const { data: sec, error: se } = await supabase.from('sections')
            .insert({ user_id: state.user.id, title: sd.title, sort_order: i }).select().single();
        if (se) continue;
        state.sections.push(sec);
        if (sd.tasks?.length) {
            const goals = sd.tasks.map((t, ti) => ({ user_id: state.user.id, section_id: sec.id, title: t, sort_order: ti, completed: false }));
            const { data: gs } = await supabase.from('tasks').insert(goals).select();
            if (gs) state.goals.push(...gs);
        }
    }
}

// ─── Master Render ───────────────────────────────────────────────────────────
function renderAll() {
    renderStats();
    renderHighlights();
    renderCalendar();
    renderWorkspace();
    updateTimerSelect();
    updateAnalyticsVisibility();
}

function toggleAnalyticsVisibility() {
    state.cal.visible = !state.cal.visible;
    updateAnalyticsVisibility();
}

function updateAnalyticsVisibility() {
    const widget = $('analytics-widget');
    if (!widget) return;
    widget.classList.toggle('hidden', !state.cal.visible);
    const btn = $('btn-analytics-toggle');
    if (btn) btn.textContent = state.cal.visible ? 'Hide analytics' : 'Show analytics';
}

// ─── Stats ───────────────────────────────────────────────────────────────────
function renderStats() {
    const total = state.goals.length;
    const done = state.goals.filter(g => g.completed).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    $('stat-pct').textContent = pct + '%';
    $('stat-done').textContent = done;
    $('stat-rem').textContent = total - done;
    $('stat-total').textContent = total;
    $('progress-bar').style.width = pct + '%';

    // Streak calculation
    const logDates = new Set(state.workLogs.map(wl => wl.created_at?.split('T')[0]));
    let streak = 0;
    const d = new Date();
    while (logDates.has(d.toISOString().split('T')[0])) {
        streak++;
        d.setDate(d.getDate() - 1);
    }
    $('stat-streak').textContent = streak + '🔥';
}

// ─── Highlights ───────────────────────────────────────────────────────────────
function renderHighlights() {
    const todayStr = today();

    // Today's focus
    const items = state.subtasks.filter(st => {
        if (st.is_repeatable) return st.last_completed_date !== todayStr;
        const pg = state.goals.find(g => g.id === st.task_id);
        if (st.due_date && st.due_date <= todayStr && !st.completed) return true;
        return !st.completed && pg?.is_pinned;
    });

    const tl = $('today-list');
    tl.innerHTML = '';
    if (!items.length) {
        tl.innerHTML = '<div class="hl-empty">All caught up! 🎉</div>';
    } else {
        items.slice(0, 8).forEach(st => {
            const pg = state.goals.find(g => g.id === st.task_id);
            const ps = state.sections.find(s => s.id === pg?.section_id);
            const isDone = st.completed || (st.is_repeatable && st.last_completed_date === todayStr);
            const div = document.createElement('div');
            div.className = 'today-item';
            div.innerHTML = `
                <div class="cq-checkbox ${isDone ? 'checked' : ''}" data-st="${st.id}" style="cursor:pointer">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="3" class="${isDone ? '' : 'hidden'}"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <span style="flex:1;font-size:0.83rem">${esc(st.title)}${st.is_repeatable ? ' 🔄' : ''}</span>
                <span class="today-item-meta">${ps?.title ?? ''}</span>
            `;
            div.querySelector('.cq-checkbox').addEventListener('click', () => toggleSubtask(st.id));
            tl.appendChild(div);
        });
    }

    // Pinned goals
    const pl = $('pinned-list');
    pl.innerHTML = '';
    const pinned = state.goals.filter(g => g.is_pinned);
    if (!pinned.length) {
        pl.innerHTML = '<div class="hl-empty">No pinned goals yet.</div>';
    } else {
        pinned.forEach(g => {
            const ps = state.sections.find(s => s.id === g.section_id);
            const daysLeft = g.deadline ? Math.ceil((new Date(g.deadline) - new Date()) / 86400000) : null;
            const div = document.createElement('div');
            div.className = 'pinned-item';
            div.innerHTML = `
                <span style="flex:1;font-size:0.83rem">📌 ${esc(g.title)}</span>
                <span class="pinned-tag">${esc(ps?.title ?? '')}</span>
                ${daysLeft !== null ? `<span class="pinned-deadline">${daysLeft >= 0 ? daysLeft + 'd' : 'overdue'}</span>` : ''}
            `;
            pl.appendChild(div);
        });
    }
}

// ─── Calendar / Analytics ─────────────────────────────────────────────────────
function renderCalendar() {
    const filterOptions = $('filter-options');
    if (filterOptions) {
        filterOptions.innerHTML = '';
        const query = $('filter-search')?.value.trim().toLowerCase() || '';

        const allLabel = document.createElement('label');
        allLabel.className = 'cq-filter-option' + (state.cal.selected.size === 0 ? ' checked' : '');
        allLabel.innerHTML = `<input type="checkbox" ${state.cal.selected.size === 0 ? 'checked' : ''} data-value="all"><span>All sections</span>`;
        const allInput = allLabel.querySelector('input');
        allInput?.addEventListener('change', () => {
            state.cal.selected.clear();
            renderCalendar();
        });
        filterOptions.appendChild(allLabel);

        state.sections.forEach((sec) => {
            if (query && !sec.title.toLowerCase().includes(query)) return;
            const checked = state.cal.selected.size === 0 || state.cal.selected.has(sec.id);
            const label = document.createElement('label');
            label.className = 'cq-filter-option' + (checked ? ' checked' : '');
            label.innerHTML = `<input type="checkbox" ${checked ? 'checked' : ''} data-value="${sec.id}"><span>${esc(sec.title)}</span>`;
            const input = label.querySelector('input');
            input?.addEventListener('change', (e) => {
                const isChecked = e.target.checked;
                if (state.cal.selected.size === 0) {
                    if (!isChecked) {
                        state.cal.selected = new Set(state.sections.map(s => s.id));
                        state.cal.selected.delete(sec.id);
                    }
                } else {
                    if (isChecked) state.cal.selected.add(sec.id);
                    else state.cal.selected.delete(sec.id);
                    if (state.cal.selected.size === state.sections.length) state.cal.selected.clear();
                }
                renderCalendar();
            });
            filterOptions.appendChild(label);
        });
    }

    // Compute logs by date per selected sections
    const activeSections = state.cal.selected.size === 0
        ? state.sections.map(s => s.id)
        : [...state.cal.selected];

    // date -> { sectionId -> seconds }
    const dateMap = {};
    state.workLogs.forEach(wl => {
        if (!activeSections.includes(wl.section_id)) return;
        const d = wl.created_at?.split('T')[0];
        if (!d) return;
        dateMap[d] = dateMap[d] ?? {};
        dateMap[d][wl.section_id] = (dateMap[d][wl.section_id] ?? 0) + wl.duration_seconds;
    });

    if (state.cal.view === 'streak') {
        renderHeatmap(dateMap, activeSections);
    } else {
        renderGraph(dateMap, activeSections);
    }

    // Legend
    const leg = $('cal-legend');
    leg.innerHTML = '';
    if (state.cal.selected.size > 0) {
        [...state.cal.selected].forEach(sid => {
            const si = state.sections.findIndex(s => s.id === sid);
            const color = sectionColor(si);
            const sec = state.sections[si];
            leg.innerHTML += `<div class="cq-legend-item"><div class="cq-legend-dot" style="background:${color}"></div>${esc(sec?.title)}</div>`;
        });
    }
}

function renderHeatmap(dateMap, activeSections) {
    const content = $('cal-content');
    const wrap = document.createElement('div');
    wrap.className = 'cq-heatmap-wrap';

    // 7 rows (days), n cols (weeks) for last 16 weeks = 112 days
    const DAYS = 112;
    const today_ = new Date();
    // Pad to start on Sunday
    const startOffset = today_.getDay();// 0=Sun
    const totalCells = DAYS + startOffset;

    // Build columns of 7
    const grid = document.createElement('div');
    grid.className = 'cq-heatmap-grid';

    // Day labels column
    const labelsCol = document.createElement('div');
    labelsCol.className = 'cq-hm-labels';
    ['S','M','T','W','T','F','S'].forEach(l => {
        const lbl = document.createElement('div');
        lbl.className = 'cq-hm-label';
        lbl.textContent = l;
        labelsCol.appendChild(lbl);
    });
    grid.appendChild(labelsCol);

    const numCols = Math.ceil(totalCells / 7);
    for (let c = 0; c < numCols; c++) {
        const col = document.createElement('div');
        col.className = 'cq-hm-col';
        for (let r = 0; r < 7; r++) {
            const cellIdx = c * 7 + r;
            const daysBack = totalCells - 1 - cellIdx;
            const cell = document.createElement('div');
            cell.className = 'cq-hm-cell';

            if (daysBack < 0 || daysBack >= DAYS + startOffset) {
                cell.style.background = 'transparent';
            } else {
                const d = new Date(today_);
                d.setDate(today_.getDate() - (daysBack - startOffset));
                const dStr = d.toISOString().split('T')[0];
                const dayData = dateMap[dStr];
                const total = dayData ? Object.values(dayData).reduce((a, b) => a + b, 0) : 0;

                // Pick dominant section color if multi-select
                let bgColor = 'rgba(255,255,255,0.05)';
                if (total > 0) {
                    if (activeSections.length === 1 || state.cal.selected.size <= 1) {
                        const si = state.sections.findIndex(s => s.id === activeSections[0]);
                        bgColor = sectionColor(si < 0 ? 0 : si);
                    } else if (dayData) {
                        // Blend or use dominant
                        const topSec = Object.entries(dayData).sort((a,b) => b[1]-a[1])[0]?.[0];
                        const si = state.sections.findIndex(s => s.id === topSec);
                        bgColor = sectionColor(si < 0 ? 0 : si);
                    }
                    const lvl = total > 7200 ? 'lvl-4' : total > 3600 ? 'lvl-3' : total > 1800 ? 'lvl-2' : 'lvl-1';
                    cell.classList.add(lvl);
                    cell.style.background = bgColor;
                }

                // Tooltip
                const tipText = total > 0
                    ? `${dStr} — ${fmt(total)}`
                    : dStr;
                cell.addEventListener('mouseenter', e => showTip(e, tipText));
                cell.addEventListener('mousemove', e => moveTip(e));
                cell.addEventListener('mouseleave', hideTip);
            }
            col.appendChild(cell);
        }
        grid.appendChild(col);
    }
    wrap.appendChild(grid);
    content.innerHTML = '';
    content.appendChild(wrap);
}

function renderGraph(dateMap, activeSections) {
    const content = $('cal-content');
    const DAYS = 60;
    const today_ = new Date();

    const wrap = document.createElement('div');
    wrap.className = 'cq-graph-wrap';

    // Find max value for scaling
    let maxVal = 1;
    for (let i = 0; i < DAYS; i++) {
        const d = new Date(today_);
        d.setDate(today_.getDate() - (DAYS - 1 - i));
        const dStr = d.toISOString().split('T')[0];
        const dayData = dateMap[dStr];
        if (dayData) {
            const total = Object.values(dayData).reduce((a,b)=>a+b,0);
            if (total > maxVal) maxVal = total;
        }
    }

    for (let i = 0; i < DAYS; i++) {
        const d = new Date(today_);
        d.setDate(today_.getDate() - (DAYS - 1 - i));
        const dStr = d.toISOString().split('T')[0];
        const dayData = dateMap[dStr] ?? {};

        const group = document.createElement('div');
        group.className = 'cq-bar-group';

        if (state.cal.selected.size > 1) {
            // Stacked bars per section
            activeSections.forEach(sid => {
                const si = state.sections.findIndex(s => s.id === sid);
                const color = sectionColor(si < 0 ? 0 : si);
                const secs = dayData[sid] ?? 0;
                const hPct = (secs / maxVal) * 110;
                const bar = document.createElement('div');
                bar.className = 'cq-bar';
                bar.style.cssText = `background:${color};height:${Math.max(hPct,2)}px`;
                bar.title = `${dStr}: ${fmt(secs)}`;
                bar.addEventListener('mouseenter', e => showTip(e, `${dStr} · ${state.sections[si]?.title} · ${fmt(secs)}`));
                bar.addEventListener('mousemove', moveTip);
                bar.addEventListener('mouseleave', hideTip);
                group.appendChild(bar);
            });
        } else {
            const sid = activeSections[0];
            const si = state.sections.findIndex(s => s.id === sid);
            const color = activeSections.length ? sectionColor(si < 0 ? 0 : si) : '#f5c542';
            const total = Object.values(dayData).reduce((a,b)=>a+b,0);
            const hPct = (total / maxVal) * 110;
            const bar = document.createElement('div');
            bar.className = 'cq-bar';
            bar.style.cssText = `background:${color};height:${Math.max(hPct,2)}px;width:12px`;
            bar.addEventListener('mouseenter', e => showTip(e, `${dStr} · ${fmt(total)}`));
            bar.addEventListener('mousemove', moveTip);
            bar.addEventListener('mouseleave', hideTip);
            group.appendChild(bar);
        }
        wrap.appendChild(group);
    }
    content.innerHTML = '';
    content.appendChild(wrap);
}

const tip = () => $('hm-tooltip');
function showTip(e, text) { tip().textContent = text; tip().style.display = 'block'; moveTip(e); }
function moveTip(e) { tip().style.left = (e.clientX + 12) + 'px'; tip().style.top = (e.clientY - 28) + 'px'; }
function hideTip() { tip().style.display = 'none'; }

function bindGlobal() {
    const searchInput = $('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', e => {
            state.searchQuery = e.target.value.toLowerCase();
            renderWorkspace();
        });
    }

    $('btn-quickadd')?.addEventListener('click', async () => {
        const title = $('quickadd-input').value.trim();
        if (!title) return toast('Type a quick to-do first', 'error');
        const section = state.sections[0];
        if (!section) return toast('Create a section first', 'error');
        await addGoal(section.id, title);
        $('quickadd-input').value = '';
        renderAll();
    });

    $('btn-add-section')?.addEventListener('click', () => openModal('section'));
    $('btn-layout')?.addEventListener('click', () => $('layout-dropdown')?.classList.toggle('open'));
    document.addEventListener('click', e => {
        if (!e.target.closest('.cq-layout-menu')) {
            $('layout-dropdown')?.classList.remove('open');
        }
    });
    document.querySelectorAll('.cq-layout-opt').forEach(opt => {
        opt.addEventListener('click', () => {
            setLayoutMode(opt.dataset.layout);
            $('layout-dropdown')?.classList.remove('open');
        });
    });

    $('btn-collapse-all')?.addEventListener('click', () => {
        state.sections.forEach(sec => state.expandedSections.delete(sec.id));
        renderWorkspace();
    });
    $('btn-expand-all')?.addEventListener('click', () => {
        state.sections.forEach(sec => state.expandedSections.add(sec.id));
        renderWorkspace();
    });

    $('btn-timer-toggle')?.addEventListener('click', () => {
        $('timer-widget')?.classList.toggle('show');
    });
    $('cal-view-streak')?.addEventListener('click', () => setCalView('streak'));
    $('cal-view-graph')?.addEventListener('click', () => setCalView('graph'));
    $('btn-analytics-toggle')?.addEventListener('click', () => toggleAnalyticsVisibility());
    $('filter-toggle')?.addEventListener('click', e => {
        e.stopPropagation();
        $('filter-dropdown-panel')?.classList.toggle('hidden');
    });
    $('filter-search')?.addEventListener('input', renderCalendar);
    document.addEventListener('click', e => {
        if (!e.target.closest('#filter-dropdown')) {
            $('filter-dropdown-panel')?.classList.add('hidden');
        }
    });
    $('modal-cancel')?.addEventListener('click', closeModal);
    $('modal-confirm')?.addEventListener('click', handleModalConfirm);
    $('task-modal')?.addEventListener('click', e => {
        if (e.target === e.currentTarget) closeModal();
    });
    $('btn-timer-start')?.addEventListener('click', startTimer);
    $('btn-timer-pause')?.addEventListener('click', pauseTimer);
    $('btn-timer-reset')?.addEventListener('click', resetTimer);
    $('btn-timer-log')?.addEventListener('click', logTimerSession);
    $('btn-pomodoro')?.addEventListener('click', () => setTimerMode('pomodoro'));
    $('btn-stopwatch')?.addEventListener('click', () => setTimerMode('stopwatch'));
    $('btn-timer-close')?.addEventListener('click', () => $('timer-widget')?.classList.remove('show'));

    $('timer-select')?.addEventListener('change', e => {
        state.timer.goalId = e.target.value || null;
        updateTimerStatus();
    });
}

function bindTimer() {
    setLayoutMode(state.layout.mode || 'single');
    setCalView(state.cal.view);
    setTimerMode(state.timer.mode);
    updateTimerStatus();
}

function setLayoutMode(mode) {
    if (mode === 'reset') mode = 'single';
    if (!['single', 'two', 'three'].includes(mode)) return;
    state.layout.mode = mode;
    saveLayout();
    const ws = $('sections-workspace');
    if (!ws) return;
    ws.classList.remove('layout-single', 'layout-two', 'layout-three');
    ws.classList.add(`layout-${mode}`);
}

function setCalView(view) {
    if (!['streak', 'graph'].includes(view)) return;
    state.cal.view = view;
    $('cal-view-streak')?.classList.toggle('active', view === 'streak');
    $('cal-view-graph')?.classList.toggle('active', view === 'graph');
    renderCalendar();
}

function setTimerMode(mode) {
    if (!['pomodoro', 'stopwatch'].includes(mode)) return;
    state.timer.mode = mode;
    document.getElementById('btn-pomodoro')?.classList.toggle('active', mode === 'pomodoro');
    document.getElementById('btn-stopwatch')?.classList.toggle('active', mode === 'stopwatch');
    state.timer.secsRemaining = mode === 'pomodoro' ? 25 * 60 : state.timer.secsRemaining;
    updateTimerDisplay();
}

function updateTimerStatus() {
    const goalId = state.timer.goalId;
    const goal = state.goals.find(g => String(g.id) === String(goalId));
    const status = $('timer-status');
    if (!status) return;
    if (!goal) {
        status.textContent = 'Ready';
        return;
    }
    status.textContent = `Goal: ${goal.title}`;
}

function updateTimerSelect() {
    const select = $('timer-select');
    if (!select) return;
    const current = state.timer.goalId;
    select.innerHTML = '<option value="">— Select Goal —</option>';
    state.goals.forEach(goal => {
        const option = document.createElement('option');
        option.value = goal.id;
        option.textContent = `${goal.title}${goal.completed ? ' ✓' : ''}`;
        if (String(goal.id) === String(current)) option.selected = true;
        select.appendChild(option);
    });
    updateTimerStatus();
}

function updateTimerDisplay() {
    const display = $('timer-display');
    if (!display) return;
    const mins = Math.floor(state.timer.secsRemaining / 60).toString().padStart(2, '0');
    const secs = (state.timer.secsRemaining % 60).toString().padStart(2, '0');
    display.textContent = `${mins}:${secs}`;
}

function startTimer() {
    if (!state.timer.goalId) return toast('Select a goal first', 'error');
    if (state.timer.active) return;
    state.timer.active = true;
    state.timer.intervalId = setInterval(() => {
        if (state.timer.mode === 'pomodoro') {
            if (state.timer.secsRemaining > 0) {
                state.timer.secsRemaining -= 1;
            } else {
                clearInterval(state.timer.intervalId);
                state.timer.active = false;
                toast('Pomodoro complete!', 'success');
            }
        } else {
            state.timer.secsRemaining += 1;
        }
        updateTimerDisplay();
    }, 1000);
    $('btn-timer-start')?.classList.add('hidden');
    $('btn-timer-pause')?.classList.remove('hidden');
    $('btn-timer-log')?.classList.remove('hidden');
}

function pauseTimer() {
    if (!state.timer.active) return;
    clearInterval(state.timer.intervalId);
    state.timer.active = false;
    $('btn-timer-start')?.classList.remove('hidden');
    $('btn-timer-pause')?.classList.add('hidden');
}

function resetTimer() {
    pauseTimer();
    state.timer.secsRemaining = state.timer.mode === 'pomodoro' ? 25 * 60 : 0;
    updateTimerDisplay();
}

async function logTimerSession() {
    if (!state.timer.goalId) return toast('Select a goal first', 'error');
    const goal = state.goals.find(g => String(g.id) === String(state.timer.goalId));
    if (!goal) return toast('Invalid goal selected', 'error');
    const secs = state.timer.mode === 'pomodoro' ? (25 * 60 - state.timer.secsRemaining) : state.timer.secsRemaining;
    if (secs <= 0) return toast('No time recorded yet', 'error');
    const sectionId = goal.section_id;
    const { error } = await supabase.from('work_logs').insert({ user_id: state.user.id, section_id: sectionId, goal_id: goal.id, duration_seconds: secs, created_at: new Date().toISOString() });
    if (error) return toast(error.message, 'error');
    state.workLogs.push({ user_id: state.user.id, section_id: sectionId, goal_id: goal.id, duration_seconds: secs, created_at: new Date().toISOString() });
    toast('Logged time to analytics', 'success');
    renderAll();
}

function renderWorkspace() {
    const ws = $('sections-workspace');
    if (!ws) return;
    ws.innerHTML = '';
    const query = state.searchQuery.trim().toLowerCase();

    const visibleSections = state.sections.filter(sec => {
        if (!query) return true;
        if (sec.title.toLowerCase().includes(query)) return true;
        return state.goals.some(g => g.section_id === sec.id && g.title.toLowerCase().includes(query));
    });

    if (!visibleSections.length) {
        ws.innerHTML = '<div class="cq-empty-section">No sections match your search. Try a different term or add a new section.</div>';
        return;
    }

    visibleSections.forEach((sec, idx) => {
        const goals = state.goals.filter(g => g.section_id === sec.id && (!query || g.title.toLowerCase().includes(query)));
        const sectionEl = document.createElement('div');
        sectionEl.className = 'cq-section';
        sectionEl.innerHTML = `
            <div class="cq-sec-header">
                <span class="cq-sec-drag-handle">☰</span>
                <div class="cq-sec-color-dot" style="background:${sectionColor(idx)}"></div>
                <div class="cq-sec-title">${esc(sec.title)}</div>
                <div class="cq-sec-meta">
                    <span class="cq-sec-progress-txt">${goals.filter(g => g.completed).length}/${goals.length}</span>
                    <div class="cq-mini-prog"><div class="cq-mini-prog-fill" style="width:${goals.length ? Math.round((goals.filter(g => g.completed).length / goals.length) * 100) : 4}%"></div></div>
                </div>
                <div class="cq-sec-actions">
                    <button class="cq-btn sm" data-action="toggle" data-section-id="${sec.id}"><svg class="cq-chevron ${state.expandedSections.has(sec.id) ? 'open' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg></button>
                    <button class="cq-btn xs" data-action="edit-section" data-section-id="${sec.id}">Edit</button>
                    <button class="cq-btn xs danger" data-action="delete-section" data-section-id="${sec.id}">Delete</button>
                </div>
            </div>
            <div class="cq-tasks-wrap" ${state.expandedSections.has(sec.id) ? '' : 'style="display:none"'}>
                ${goals.length === 0 ? '<div class="cq-empty-section">No goals yet. Add one below.</div>' : ''}
                <div class="cq-tasks-inner"></div>
                <div class="cq-add-goal-row">
                    <input type="text" placeholder="Add a goal to this section…" aria-label="Add goal">
                    <button class="cq-btn sm primary">Add</button>
                </div>
            </div>
        `;

        const tasksInner = sectionEl.querySelector('.cq-tasks-inner');
        goals.forEach(goal => {
            const done = goal.completed;
            const goalWrap = document.createElement('div');
            goalWrap.className = 'cq-goal-wrap';
            goalWrap.innerHTML = `
                <div class="cq-goal ${done ? 'done' : ''}">
                    <div class="cq-checkbox ${done ? 'checked' : ''}" data-action="goal-toggle" data-goal-id="${goal.id}"></div>
                    <div class="cq-goal-title">${esc(goal.title)}</div>
                    ${goal.deadline ? `<div class="cq-time-badge">${esc(shortDate(goal.deadline))}</div>` : ''}
                    <div class="cq-goal-actions">
                        <button class="cq-btn sm cq-btn-pin ${goal.is_pinned ? 'pinned' : ''}" data-action="pin" data-goal-id="${goal.id}">${goal.is_pinned ? '★' : '☆'}</button>
                        <button class="cq-btn sm" data-action="add-subtask" data-goal-id="${goal.id}">+ subtask</button>
                    </div>
                </div>
            `;

            const subtasks = state.subtasks.filter(st => st.task_id === goal.id);
            if (subtasks.length) {
                const subList = document.createElement('div');
                subList.className = 'cq-subtasks';
                subtasks.forEach(st => {
                    const isDone = st.completed || (st.is_repeatable && st.last_completed_date === today());
                    const dueLabel = st.due_date
                        ? `${shortDate(st.due_date)}${st.due_time ? ' ' + shortTime(st.due_time) : ''}`
                        : st.due_time ? shortTime(st.due_time) : '';
                    const subEl = document.createElement('div');
                    subEl.className = 'cq-subtask';
                    subEl.innerHTML = `
                        <div class="cq-checkbox ${isDone ? 'checked' : ''}" data-action="subtask-toggle" data-subtask-id="${st.id}"></div>
                        <div>${esc(st.title)}${st.is_repeatable ? ' 🔄' : ''}${dueLabel ? ` <span class="cq-time-badge">${esc(dueLabel)}</span>` : ''}</div>
                    `;
                    subEl.querySelector('[data-action="subtask-toggle"]')?.addEventListener('click', () => toggleSubtask(st.id));
                    subList.appendChild(subEl);
                });
                goalWrap.appendChild(subList);
            }

            tasksInner.appendChild(goalWrap);
        });

        sectionEl.querySelector('[data-action="toggle"]')?.addEventListener('click', () => {
            if (state.expandedSections.has(sec.id)) state.expandedSections.delete(sec.id);
            else state.expandedSections.add(sec.id);
            renderWorkspace();
        });
        sectionEl.querySelector('.cq-add-goal-row button')?.addEventListener('click', async () => {
            const input = sectionEl.querySelector('.cq-add-goal-row input');
            const value = input.value.trim();
            if (!value) return;
            await addGoal(sec.id, value);
            input.value = '';
            renderAll();
        });
        sectionEl.querySelectorAll('[data-action="goal-toggle"]').forEach(el => {
            el.addEventListener('click', () => toggleGoal(el.dataset.goalId));
        });
        sectionEl.querySelectorAll('[data-action="pin"]').forEach(el => {
            el.addEventListener('click', () => toggleGoalPin(el.dataset.goalId));
        });
        sectionEl.querySelectorAll('[data-action="add-subtask"]').forEach(el => {
            el.addEventListener('click', () => openModal('subtask', el.dataset.goalId));
        });
        sectionEl.querySelector('[data-action="edit-section"]')?.addEventListener('click', () => openModal('section', sec.id));
        sectionEl.querySelector('[data-action="delete-section"]')?.addEventListener('click', async () => {
            if (!confirm('Delete section "' + sec.title + '" and all its goals?')) return;
            await deleteSection(sec.id);
            renderAll();
        });

        ws.appendChild(sectionEl);
    });
}

async function addGoal(sectionId, title) {
    const { data, error } = await supabase.from('tasks').insert({
        user_id: state.user.id,
        section_id: sectionId,
        title,
        sort_order: state.goals.filter(g => g.section_id === sectionId).length,
        completed: false,
        is_pinned: false
    }).select().single();
    if (error) {
        toast(error.message, 'error');
        return null;
    }
    state.goals.push(data);
    return data;
}

async function createSection(title) {
    const { data, error } = await supabase.from('sections').insert({
        user_id: state.user.id,
        title,
        sort_order: state.sections.length
    }).select().single();
    if (error) {
        toast(error.message, 'error');
        return null;
    }
    state.sections.push(data);
    state.expandedSections.add(data.id);
    return data;
}

async function updateSection(sectionId, title) {
    const section = state.sections.find(sec => String(sec.id) === String(sectionId));
    if (!section) return null;
    const { data, error } = await supabase.from('sections').update({ title }).eq('id', section.id).select().single();
    if (error) {
        toast(error.message, 'error');
        return null;
    }
    section.title = data.title;
    return section;
}

async function deleteSection(sectionId) {
    const sid = Number(sectionId);
    const goals = state.goals.filter(g => g.section_id === sid);
    const goalIds = goals.map(g => g.id);

    if (goalIds.length) {
        const { error: subtaskError } = await supabase.from('subtasks').delete().in('task_id', goalIds);
        if (subtaskError) return toast(subtaskError.message, 'error');
        state.subtasks = state.subtasks.filter(st => !goalIds.includes(st.task_id));

        const { error: taskError } = await supabase.from('tasks').delete().in('id', goalIds);
        if (taskError) return toast(taskError.message, 'error');
        state.goals = state.goals.filter(g => g.section_id !== sid);
    }

    const { error: sectionError } = await supabase.from('sections').delete().eq('id', sid);
    if (sectionError) return toast(sectionError.message, 'error');
    state.sections = state.sections.filter(sec => sec.id !== sid);
    state.expandedSections.delete(sid);
    return true;
}

async function createSubtask(goalId, title, dueDate = null, dueTime = null, isRepeatable = false) {
    const { data, error } = await supabase.from('subtasks').insert({
        user_id: state.user.id,
        task_id: goalId,
        title,
        due_date: dueDate,
        due_time: dueTime,
        is_repeatable: isRepeatable,
        completed: false,
        last_completed_date: null,
        sort_order: state.subtasks.filter(st => st.task_id === goalId).length
    }).select().single();
    if (error) {
        toast(error.message, 'error');
        return null;
    }
    state.subtasks.push(data);
    return data;
}

async function toggleGoal(goalId) {
    const goal = state.goals.find(g => String(g.id) === String(goalId));
    if (!goal) return;
    const newCompleted = !goal.completed;
    const { error } = await supabase.from('tasks').update({ completed: newCompleted }).eq('id', goal.id);
    if (error) return toast(error.message, 'error');
    goal.completed = newCompleted;
    renderAll();
}

async function toggleGoalPin(goalId) {
    const goal = state.goals.find(g => String(g.id) === String(goalId));
    if (!goal) return;
    const newPinned = !goal.is_pinned;
    const { error } = await supabase.from('tasks').update({ is_pinned: newPinned }).eq('id', goal.id);
    if (error) return toast(error.message, 'error');
    goal.is_pinned = newPinned;
    renderAll();
}

async function toggleSubtask(subtaskId) {
    const st = state.subtasks.find(s => String(s.id) === String(subtaskId));
    if (!st) return;
    const todayStr = today();
    const isRepeat = !!st.is_repeatable;
    let update = {};
    if (isRepeat) {
        update.last_completed_date = st.last_completed_date === todayStr ? null : todayStr;
    } else {
        update.completed = !st.completed;
    }
    const { error } = await supabase.from('subtasks').update(update).eq('id', st.id);
    if (error) return toast(error.message, 'error');
    Object.assign(st, update);
    renderAll();
}

function openModal(type, contextId = null) {
    state.modal.type = type;
    state.modal.contextId = contextId;
    $('modal-type').value = type;
    $('modal-context-id').value = contextId || '';
    $('modal-task-title').value = '';
    $('modal-task-title').placeholder = type === 'section' ? 'Section name…' : type === 'goal' ? 'Goal title…' : 'Subtask title…';
    const isEdit = type === 'section' && contextId;
    $('modal-title').textContent = type === 'section'
        ? (isEdit ? 'Edit Section' : 'New Section')
        : type === 'goal'
            ? 'New Goal'
            : 'New Subtask';
    $('modal-confirm').textContent = type === 'section'
        ? (isEdit ? 'Save ✓' : 'Add ✓')
        : type === 'goal'
            ? 'Add ✓'
            : 'Add ✓';

    if (type === 'section' && contextId) {
        const section = state.sections.find(sec => String(sec.id) === String(contextId));
        if (section) $('modal-task-title').value = section.title;
    }

    const extra = $('modal-subtask-extra');
    if (!extra) return;
    extra.classList.toggle('hidden', type !== 'subtask');
    $('task-modal')?.classList.add('open');
    $('modal-task-title')?.focus();
}

function closeModal() {
    $('task-modal')?.classList.remove('open');
    state.modal.type = null;
    state.modal.contextId = null;
}

async function handleModalConfirm() {
    const type = $('modal-type').value;
    const title = $('modal-task-title').value.trim();
    if (!title) return toast('Please enter a title', 'error');

    if (type === 'section') {
        const sectionId = $('modal-context-id').value;
        if (sectionId) {
            await updateSection(sectionId, title);
        } else {
            await createSection(title);
        }
    } else if (type === 'goal') {
        const sectionId = Number($('modal-context-id').value) || state.sections[0]?.id;
        if (!sectionId) return toast('Select a section first', 'error');
        await addGoal(sectionId, title);
    } else if (type === 'subtask') {
        const goalId = Number($('modal-context-id').value);
        if (!goalId) return toast('Invalid goal context', 'error');
        const dueDate = $('modal-due-date')?.value || null;
        const dueTime = $('modal-due-time')?.value || null;
        const isRepeatable = $('modal-is-repeatable')?.checked || false;
        await createSubtask(goalId, title, dueDate, dueTime, isRepeatable);
    }

    closeModal();
    renderAll();
}


init();
