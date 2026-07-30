import { SEED_DATA } from './conquer-data.js';

// Configuration
const SUPABASE_URL = 'https://kbmimkfdhblyrdskdcxc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_fBTnwIh34wJb61_aXNzk6Q_sv5oZkoG';

let supabase = null;
if (window.supabase) {
    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (e) {
        console.warn("Supabase client failed to initialize:", e);
    }
}

const REQUEST_TIMEOUT_MS = 2000;

function requestWithTimeout(promiseFactory, timeoutMs) {
    let timeoutId;
    const controller = new AbortController();
    const promise = promiseFactory(controller.signal);
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
            controller.abort?.();
            reject(new Error(`Request timed out after ${timeoutMs}ms`));
        }, timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]).finally(() => {
        clearTimeout(timeoutId);
    });
}

// App State
let state = {
    user: null,
    sections: [],
    goals: [], // conceptually our tasks table
    subtasks: [],
    workLogs: [],
    loading: true,
    error: null,
    searchQuery: '',
    expandedSections: new Set(),
    
    // Timer state
    timer: {
        active: false,
        mode: 'pomodoro', // 'pomodoro' or 'stopwatch'
        secondsRemaining: 25 * 60, // for pomodoro
        secondsElapsed: 0, // for stopwatch and total time tracking
        intervalId: null,
        selectedGoalId: null
    }
};

// DOM Elements
const els = {
    authView: document.getElementById('auth-view'),
    appView: document.getElementById('app-view'),
    loadingView: document.getElementById('loading-view'),
    loginEmailInput: document.getElementById('input-login-email'),
    loginPasswordInput: document.getElementById('input-login-password'),
    signUpPasswordBtn: document.getElementById('btn-signup-password'),
    loginPasswordBtn: document.getElementById('btn-login-password'),
    loginEmailBtn: document.getElementById('btn-login-email'),
    loginGoogleBtn: document.getElementById('btn-login-google'),
    logoutBtn: document.getElementById('btn-logout'),
    sectionsContainer: document.getElementById('sections-container'),
    toast: document.getElementById('toast'),
    
    // Stats
    statProgress: document.getElementById('stat-progress'),
    statCompleted: document.getElementById('stat-completed'),
    statRemaining: document.getElementById('stat-remaining'),
    statTotal: document.getElementById('stat-total'),
    progressBar: document.getElementById('overall-progress-bar'),
    
    // Highlights
    highlightsDashboard: document.getElementById('highlights-dashboard'),
    todayTasksContainer: document.getElementById('today-tasks-container'),
    pinnedGoalsContainer: document.getElementById('pinned-goals-container'),

    // Timer
    timerWidget: document.getElementById('timer-widget'),
    timerStatus: document.getElementById('timer-status'),
    timerDisplay: document.getElementById('timer-display'),
    timerSelect: document.getElementById('timer-task-select'),
    btnTimerStart: document.getElementById('btn-timer-start'),
    btnTimerPause: document.getElementById('btn-timer-pause'),
    btnTimerReset: document.getElementById('btn-timer-reset'),
    btnTimerLog: document.getElementById('btn-timer-log'),
    btnTimerClose: document.getElementById('btn-timer-close'),
    btnModePomodoro: document.getElementById('btn-mode-pomodoro'),
    btnModeStopwatch: document.getElementById('btn-mode-stopwatch'),
    btnToggleTimerWidget: document.getElementById('btn-toggle-timer-widget'),

    // Actions
    addSectionBtn: document.getElementById('btn-add-section'),
    collapseAllBtn: document.getElementById('btn-collapse-all'),
    expandAllBtn: document.getElementById('btn-expand-all'),
    searchInput: document.getElementById('search-input'),
    configNotice: document.getElementById('config-notice')
};

// Initialize
async function init() {
    if (!supabase) return;

    // Check auth
    const { data: { session } } = await supabase.auth.getSession();
    
    supabase.auth.onAuthStateChange(async (_event, session) => {
        state.user = session?.user || null;
        renderAuth();
        if (state.user) {
            await loadData();
        }
    });

    state.user = session?.user || null;
    renderAuth();

    if (state.user) {
        await loadData();
    }

    setupEventListeners();
    setupTimerListeners();
}

// Data fetching
async function loadData() {
    state.loading = true;
    renderApp();
    
    try {
        const [sectionsRes, goalsRes, subRes, logsRes] = await Promise.all([
            supabase.from('sections').select('*').order('sort_order', { ascending: true }),
            supabase.from('tasks').select('*').order('sort_order', { ascending: true }), // mapped to goals
            supabase.from('subtasks').select('*').order('sort_order', { ascending: true }),
            supabase.from('work_logs').select('*')
        ]);

        if (sectionsRes.error) throw sectionsRes.error;
        if (goalsRes.error) throw goalsRes.error;
        if (subRes.error) throw subRes.error;
        if (logsRes.error) throw logsRes.error;

        state.sections = sectionsRes.data || [];
        state.goals = goalsRes.data || [];
        state.subtasks = subRes.data || [];
        state.workLogs = logsRes.data || [];

        // Check if we need to seed
        if (state.sections.length === 0) {
            await seedDatabase();
        }

        // Expand all by default initially
        state.sections.forEach(s => state.expandedSections.add(s.id));
        
        state.loading = false;
        renderApp();
    } catch (err) {
        showToast(err.message, 'error');
        state.loading = false;
        renderApp();
    }
}

async function seedDatabase() {
    showToast('Seeding initial data...', 'info');
    try {
        for (let i = 0; i < SEED_DATA.length; i++) {
            const section = SEED_DATA[i];
            
            const { data: newSection, error: sectionErr } = await supabase.from('sections')
                .insert({ user_id: state.user.id, title: section.title, sort_order: i })
                .select().single();
                
            if (sectionErr) throw sectionErr;
            state.sections.push(newSection);

            if (section.tasks && section.tasks.length > 0) {
                const goalsToInsert = section.tasks.map((taskTitle, tIndex) => ({
                    user_id: state.user.id, section_id: newSection.id, title: taskTitle, sort_order: tIndex, completed: false
                }));
                const { data: insertedGoals, error: taskErr } = await supabase.from('tasks')
                    .insert(goalsToInsert).select();
                    
                if (taskErr) throw taskErr;
                state.goals.push(...insertedGoals);
            }
        }
        showToast('Data seeded successfully!', 'success');
    } catch (err) {
        showToast('Seed failed: ' + err.message, 'error');
    }
}

// Rendering
function renderAuth() {
    els.loadingView.classList.add('hidden');
    if (state.user) {
        els.authView.classList.add('hidden');
        els.appView.classList.remove('hidden');
    } else {
        els.authView.classList.remove('hidden');
        els.appView.classList.add('hidden');
    }
}

function renderApp() {
    if (state.loading) {
        els.sectionsContainer.innerHTML = '<div class="lc-skeleton" style="width:100%;height:40px;margin-bottom:1rem;"></div><div class="lc-skeleton" style="width:100%;height:200px"></div>';
        return;
    }
    
    renderStats();
    renderHighlightsBoard();
    updateTimerSelect();
    
    const filteredGoals = state.goals.filter(t => 
        t.title.toLowerCase().includes(state.searchQuery.toLowerCase())
    );

    els.sectionsContainer.innerHTML = '';
    
    state.sections.sort((a, b) => a.sort_order - b.sort_order).forEach(section => {
        const sectionGoals = filteredGoals
            .filter(t => t.section_id === section.id)
            .sort((a, b) => a.sort_order - b.sort_order);

        if (state.searchQuery && sectionGoals.length === 0) return;

        const isExpanded = state.expandedSections.has(section.id);
        const sectionProgress = calculateSectionProgress(section.id, filteredGoals);
        const sectionTime = state.workLogs.filter(wl => wl.section_id === section.id).reduce((sum, wl) => sum + wl.duration_seconds, 0);

        const sectionEl = document.createElement('div');
        sectionEl.className = 'conquer-section lc';
        sectionEl.dataset.id = section.id;
        
        // Heatmap gen for the section
        const heatmapHTML = generateHeatmap(section.id);

        sectionEl.innerHTML = `
            <div class="conquer-section-header">
                <div class="conquer-section-drag-handle">⋮⋮</div>
                <div class="conquer-section-title-wrap">
                    <div class="conquer-section-title" contenteditable="true" spellcheck="false">${escapeHTML(section.title)}</div>
                    ${sectionTime > 0 ? `<div class="time-badge">⏱ ${formatCompactTime(sectionTime)}</div>` : ''}
                    <div class="conquer-section-meta" style="margin-left:auto;">
                        <span class="conquer-progress-text">${sectionProgress.completed}/${sectionProgress.total}</span>
                        <div class="conquer-mini-progress">
                            <div class="conquer-mini-progress-fill" style="width: ${sectionProgress.percent}%"></div>
                        </div>
                    </div>
                </div>
                <div class="conquer-section-actions">
                    <button class="conquer-btn small btn-add-goal" title="Add Goal">+</button>
                    <button class="conquer-btn small btn-delete-section" title="Delete Section">×</button>
                    <button class="conquer-btn small btn-toggle-section">
                        <svg class="conquer-chevron ${isExpanded ? 'expanded' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                </div>
            </div>
            <div class="conquer-tasks-container ${isExpanded ? '' : 'hidden'}" data-section-id="${section.id}">
                ${heatmapHTML}
                ${sectionGoals.length === 0 ? '<div class="conquer-empty-tasks">No goals.</div>' : ''}
            </div>
        `;

        if (isExpanded) {
            const tasksContainer = sectionEl.querySelector('.conquer-tasks-container');
            sectionGoals.forEach(goal => {
                const goalEl = renderGoal(goal);
                tasksContainer.appendChild(goalEl);
            });
            
            new Sortable(tasksContainer, {
                group: 'goals',
                handle: '.conquer-task-drag-handle',
                animation: 150,
                ghostClass: 'sortable-ghost',
                onEnd: handleGoalSort
            });
        }

        // Events
        const titleEl = sectionEl.querySelector('.conquer-section-title');
        titleEl.addEventListener('blur', (e) => updateSectionTitle(section.id, e.target.innerText));
        titleEl.addEventListener('keydown', (e) => { if(e.key === 'Enter') { e.preventDefault(); titleEl.blur(); } });
        sectionEl.querySelector('.btn-add-goal').addEventListener('click', (e) => { e.stopPropagation(); addGoal(section.id); });
        sectionEl.querySelector('.btn-delete-section').addEventListener('click', (e) => { e.stopPropagation(); if(confirm('Delete section?')) deleteSection(section.id); });
        sectionEl.querySelector('.btn-toggle-section').addEventListener('click', () => toggleSection(section.id));
        sectionEl.querySelector('.conquer-section-title-wrap').addEventListener('dblclick', () => toggleSection(section.id));

        els.sectionsContainer.appendChild(sectionEl);
    });

    new Sortable(els.sectionsContainer, {
        handle: '.conquer-section-drag-handle',
        animation: 150,
        ghostClass: 'sortable-ghost',
        onEnd: handleSectionSort
    });
}

function renderGoal(goal) {
    const el = document.createElement('div');
    const isPinned = goal.is_pinned;
    const subtasks = state.subtasks.filter(s => s.task_id === goal.id).sort((a,b) => a.sort_order - b.sort_order);
    const deadlineTxt = goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'Set Deadline';
    
    el.className = 'conquer-task-wrapper';
    el.innerHTML = `
        <div class="conquer-task ${goal.completed ? 'completed' : ''}" data-id="${goal.id}">
            <div class="conquer-task-drag-handle">⋮⋮</div>
            <div class="conquer-checkbox btn-toggle-goal ${goal.completed ? 'checked' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="${goal.completed ? '' : 'hidden'}"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <div class="conquer-task-title" contenteditable="true" spellcheck="false">${escapeHTML(goal.title)}</div>
            
            ${goal.time_spent > 0 ? `<div class="time-badge">⏱ ${formatCompactTime(goal.time_spent)}</div>` : ''}
            
            <button class="conquer-btn small btn-set-deadline" title="Set Deadline">${deadlineTxt}</button>
            <button class="btn-pin-task ${isPinned ? 'pinned' : ''}" title="Pin Goal">📌</button>
            <button class="conquer-btn small btn-add-subtask" title="Add Subtask">↳ Add Task</button>
            <button class="conquer-btn small btn-delete-task" title="Delete Goal">×</button>
        </div>
        <div class="conquer-subtasks-container" data-goal-id="${goal.id}">
            <!-- Subtasks injected here -->
        </div>
    `;

    const subContainer = el.querySelector('.conquer-subtasks-container');
    subtasks.forEach(st => {
        const subEl = document.createElement('div');
        subEl.className = 'conquer-subtask';
        const isStDone = st.completed || (st.is_repeatable && st.last_completed_date === getTodayStr());
        subEl.innerHTML = `
            <div class="conquer-checkbox small btn-toggle-subtask ${isStDone ? 'checked' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="${isStDone ? '' : 'hidden'}"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <span class="subtask-title" contenteditable="true">${escapeHTML(st.title)}</span>
            ${st.is_repeatable ? '<span title="Daily Repeat" style="color:var(--accent); font-size:0.7em;">🔄</span>' : ''}
            <button class="conquer-btn small btn-del-subtask" style="margin-left:auto; opacity:0; padding:1px 5px;">×</button>
        `;
        
        subEl.addEventListener('mouseenter', () => subEl.querySelector('.btn-del-subtask').style.opacity = 1);
        subEl.addEventListener('mouseleave', () => subEl.querySelector('.btn-del-subtask').style.opacity = 0);
        
        subEl.querySelector('.btn-toggle-subtask').addEventListener('click', () => toggleSubtask(st.id));
        subEl.querySelector('.btn-del-subtask').addEventListener('click', () => deleteSubtask(st.id));
        
        const titleEl = subEl.querySelector('.subtask-title');
        titleEl.addEventListener('blur', (e) => updateSubtaskTitle(st.id, e.target.innerText));
        titleEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); titleEl.blur(); } });
        
        subContainer.appendChild(subEl);
    });

    const checkbox = el.querySelector('.btn-toggle-goal');
    checkbox.addEventListener('click', () => toggleGoalCompletion(goal.id, !goal.completed));

    const titleEl = el.querySelector('.conquer-task-title');
    titleEl.addEventListener('blur', (e) => updateGoalTitle(goal.id, e.target.innerText));
    titleEl.addEventListener('keydown', (e) => { if(e.key === 'Enter') { e.preventDefault(); titleEl.blur(); } });

    el.querySelector('.btn-pin-task').addEventListener('click', () => togglePinContext(goal.id, !goal.is_pinned));
    el.querySelector('.btn-delete-task').addEventListener('click', () => { if(confirm('Delete goal?')) deleteGoal(goal.id); });
    el.querySelector('.btn-add-subtask').addEventListener('click', () => addSubtask(goal.id));
    
    el.querySelector('.btn-set-deadline').addEventListener('click', () => {
        const d = prompt("Enter deadline (YYYY-MM-DD):", goal.deadline ? goal.deadline.split('T')[0] : '');
        if(d !== null) setGoalDeadline(goal.id, d);
    });

    return el;
}

function renderHighlightsBoard() {
    els.highlightsDashboard.classList.remove('hidden');
    els.todayTasksContainer.innerHTML = '';
    els.pinnedGoalsContainer.innerHTML = '';

    const todayStr = getTodayStr();
    
    // Left side: Today's Focus (subtasks that are repeatable and not done today, or due today/earlier)
    const todayTasks = state.subtasks.filter(st => {
        if (st.is_repeatable) return st.last_completed_date !== todayStr;
        if (st.due_date && st.due_date <= todayStr && !st.completed) return true;
        // Non-repeatable, no due date, unfinished goes to pending pool. For now we just show it if user pinned the goal maybe? 
        // Let's show all pending non-repeatable subtasks of pinned goals to keep it clean.
        const parentGoal = state.goals.find(g => g.id === st.task_id);
        return (!st.completed && parentGoal && parentGoal.is_pinned);
    });

    if(todayTasks.length === 0) {
        els.todayTasksContainer.innerHTML = `<div class="conquer-highlight-col empty">All caught up for today! 🎉</div>`;
    } else {
        todayTasks.forEach(st => {
            const parentGoal = state.goals.find(g => g.id === st.task_id);
            const parentSec = state.sections.find(s => s.id === parentGoal?.section_id);
            
            const div = document.createElement('div');
            div.className = 'highlight-item';
            div.innerHTML = `
                <div class="conquer-checkbox small btn-toggle-subtask ${st.completed ? 'checked' : ''}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="${st.completed ? '' : 'hidden'}"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <div>
                    <div>${escapeHTML(st.title)} ${st.is_repeatable ? '🔄' : ''}</div>
                    <div style="font-size: 0.65rem; color: var(--text-dim);">${parentSec?.title} > ${parentGoal?.title}</div>
                </div>
            `;
            div.querySelector('.btn-toggle-subtask').addEventListener('click', () => toggleSubtask(st.id));
            els.todayTasksContainer.appendChild(div);
        });
    }

    // Right Side: Pinned Goals
    const pinnedGoals = state.goals.filter(g => g.is_pinned);
    if(pinnedGoals.length === 0) {
        els.pinnedGoalsContainer.innerHTML = `<div class="conquer-highlight-col empty">No pinned goals.</div>`;
    } else {
        pinnedGoals.forEach(g => {
            const parentSec = state.sections.find(s => s.id === g.section_id);
            const div = document.createElement('div');
            div.className = 'highlight-item';
            div.innerHTML = `
                📌 <span>${escapeHTML(g.title)}</span>
                <span class="highlight-meta">${parentSec?.title}</span>
                ${g.deadline ? `<span class="highlight-meta" style="color:var(--accent)">${new Date(g.deadline).toLocaleDateString()}</span>` : ''}
            `;
            els.pinnedGoalsContainer.appendChild(div);
        });
    }
}

function generateHeatmap(sectionId) {
    const sectionLogs = state.workLogs.filter(wl => wl.section_id === sectionId);
    
    // Create mapping of date string to total duration
    const logMap = {};
    sectionLogs.forEach(wl => {
        const dStr = wl.created_at.split('T')[0];
        logMap[dStr] = (logMap[dStr] || 0) + wl.duration_seconds;
    });

    let cellsHTML = '';
    const today = new Date();
    // last 60 days
    for (let i = 59; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dStr = d.toISOString().split('T')[0];
        
        const secs = logMap[dStr] || 0;
        let lvl = '';
        if(secs > 0) lvl = 'lvl-1';
        if(secs > 1800) lvl = 'lvl-2'; // 30 mins
        if(secs > 3600) lvl = 'lvl-3'; // 1 hour

        const title = `${dStr}: ${secs > 0 ? formatCompactTime(secs) : '0s'} spent`;
        cellsHTML += `<div class="heatmap-cell ${lvl}" title="${title}"></div>`;
    }

    return `<div class="heatmap-container">${cellsHTML}</div>`;
}

function renderStats() {
    const total = state.goals.length;
    const completed = state.goals.filter(t => t.completed).length;
    const p = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    els.statProgress.innerText = `${p}%`;
    els.statCompleted.innerText = completed.toString();
    els.statRemaining.innerText = (total - completed).toString();
    els.statTotal.innerText = total.toString();
    els.progressBar.style.width = `${p}%`;
}

// Timer Logic
function setupTimerListeners() {
    els.btnModePomodoro.addEventListener('click', () => setTimerMode('pomodoro'));
    els.btnModeStopwatch.addEventListener('click', () => setTimerMode('stopwatch'));
    els.btnTimerStart.addEventListener('click', toggleTimer);
    els.btnTimerPause.addEventListener('click', toggleTimer);
    els.btnTimerReset.addEventListener('click', resetTimer);
    els.btnTimerLog.addEventListener('click', handleLogTime);
    els.timerSelect.addEventListener('change', (e) => state.timer.selectedGoalId = e.target.value);
    
    // Close button hides timer, but we let it run in bg
    els.btnTimerClose.addEventListener('click', () => els.timerWidget.classList.remove('show'));
    if(els.btnToggleTimerWidget) els.btnToggleTimerWidget.addEventListener('click', () => els.timerWidget.classList.toggle('show'));
}

function updateTimerSelect() {
    const curr = state.timer.selectedGoalId;
    let options = '<option value="">-- Select Goal to Work On --</option>';
    
    state.goals.forEach(g => {
        options += `<option value="${g.id}" ${g.id === curr ? 'selected' : ''}>${escapeHTML(g.title)}</option>`;
    });
    els.timerSelect.innerHTML = options;
}

function setTimerMode(mode) {
    if(state.timer.active) return; // Prevent change while running
    state.timer.mode = mode;
    els.btnModePomodoro.classList.toggle('active', mode === 'pomodoro');
    els.btnModeStopwatch.classList.toggle('active', mode === 'stopwatch');
    resetTimer();
}

function toggleTimer() {
    if(state.timer.active) {
        clearInterval(state.timer.intervalId);
        state.timer.active = false;
        els.btnTimerStart.classList.remove('hidden');
        els.btnTimerPause.classList.add('hidden');
        els.btnTimerLog.classList.remove('hidden');
        els.timerStatus.innerText = "Paused";
    } else {
        if(!state.timer.selectedGoalId) {
            showToast('Please select a goal first!', 'error');
            return;
        }
        state.timer.active = true;
        els.btnTimerStart.classList.add('hidden');
        els.btnTimerPause.classList.remove('hidden');
        els.btnTimerLog.classList.add('hidden');
        els.timerStatus.innerText = "Running...";
        
        state.timer.intervalId = setInterval(() => {
            if(state.timer.mode === 'pomodoro') {
                if(state.timer.secondsRemaining > 0) {
                    state.timer.secondsRemaining--;
                    state.timer.secondsElapsed++;
                } else {
                    playSound();
                    toggleTimer();
                    els.timerStatus.innerText = "Time's up!";
                }
            } else {
                state.timer.secondsElapsed++;
            }
            updateTimerDisplay();
        }, 1000);
    }
}

function resetTimer() {
    clearInterval(state.timer.intervalId);
    state.timer.active = false;
    state.timer.secondsElapsed = 0;
    state.timer.secondsRemaining = 25 * 60;
    els.btnTimerStart.classList.remove('hidden');
    els.btnTimerPause.classList.add('hidden');
    els.btnTimerLog.classList.add('hidden');
    els.timerStatus.innerText = "Ready";
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const s = state.timer.mode === 'pomodoro' ? state.timer.secondsRemaining : state.timer.secondsElapsed;
    const mins = Math.floor(s / 60).toString().padStart(2, '0');
    const secs = (s % 60).toString().padStart(2, '0');
    els.timerDisplay.innerText = `${mins}:${secs}`;
}

async function handleLogTime() {
    if(state.timer.secondsElapsed < 5) {
        showToast('Too little time to log.', 'error');
        return;
    }
    const goalId = state.timer.selectedGoalId;
    if(!goalId) return;

    const goal = state.goals.find(g => g.id === goalId);
    const secs = state.timer.secondsElapsed;
    if(!goal) return;

    try {
        // Optimistic
        goal.time_spent += secs;
        const wl = {
            id: crypto.randomUUID(), user_id: state.user.id, section_id: goal.section_id, task_id: goal.id, duration_seconds: secs, created_at: new Date().toISOString()
        };
        state.workLogs.push(wl);
        renderApp();
        showToast(`Logged ${formatCompactTime(secs)}`);

        // DB Calls
        const prom1 = supabase.from('work_logs').insert(wl);
        const prom2 = supabase.from('tasks').update({ time_spent: goal.time_spent }).eq('id', goal.id);
        
        await Promise.all([prom1, prom2]);
        resetTimer();
    } catch(err) {
        showToast('Failed to log time', 'error');
        await loadData();
    }
}

function playSound() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.type = 'sine'; osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.5);
}

function formatCompactTime(totalSeconds) {
    if(!totalSeconds) return '0s';
    const hrs = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    if(hrs >= 24) return `${Math.floor(hrs/24)}d ${hrs%24}h`;
    if(hrs > 0) return `${hrs}h ${m}m`;
    return `${m}m`;
}
function getTodayStr() {
    return new Date().toISOString().split('T')[0];
}

// Data Actions...
async function addGoal(sectionId) {
    state.expandedSections.add(sectionId);
    const title = prompt("Goal Title:");
    if(!title) return;

    const maxOrder = state.goals.filter(t => t.section_id === sectionId).reduce((max, t) => Math.max(max, t.sort_order), -1);
    const tempGoal = {
        id: crypto.randomUUID(), title, completed: false, is_pinned: false, time_spent: 0, section_id: sectionId, sort_order: maxOrder + 1, user_id: state.user.id
    };
    
    state.goals.push(tempGoal);
    renderApp();
    
    try {
        const { data, error } = await supabase.from('tasks').insert({
            title, section_id: sectionId, sort_order: tempGoal.sort_order, user_id: state.user.id
        }).select().single();
        if (error) throw error;
        const idx = state.goals.findIndex(t => t.id === tempGoal.id);
        if (idx !== -1) state.goals[idx] = data;
        renderApp();
    } catch (err) {
        state.goals = state.goals.filter(t => t.id !== tempGoal.id);
        renderApp();
        showToast('Failed to add goal', 'error');
    }
}

async function addSubtask(goalId) {
    const title = prompt("Subtask Title:");
    if(!title) return;
    const isRep = confirm("Make it repeat daily?");

    const tempST = {
        id: crypto.randomUUID(), task_id: goalId, title, completed: false, is_repeatable: isRep, user_id: state.user.id
    };
    state.subtasks.push(tempST);
    renderApp();

    try {
        const { data, error } = await supabase.from('subtasks').insert({
            task_id: goalId, title, is_repeatable: isRep, user_id: state.user.id
        }).select().single();
        if(error) throw error;
        const idx = state.subtasks.findIndex(s => s.id === tempST.id);
        if(idx !== -1) state.subtasks[idx] = data;
        renderApp();
    } catch(err) {
        state.subtasks = state.subtasks.filter(s => s.id !== tempST.id);
        renderApp();
        showToast('Add subtask failed', 'error');
    }
}

async function toggleSubtask(id) {
    const st = state.subtasks.find(s => s.id === id);
    if(!st) return;
    const isNowDone = !(st.completed || (st.is_repeatable && st.last_completed_date === getTodayStr()));
    
    if (st.is_repeatable) {
        st.last_completed_date = isNowDone ? getTodayStr() : null;
    } else {
        st.completed = isNowDone;
    }
    renderApp();
    try {
        const obj = st.is_repeatable ? { last_completed_date: st.last_completed_date } : { completed: st.completed };
        const {error} = await supabase.from('subtasks').update(obj).eq('id', id);
        if(error) throw error;
    } catch(err) {
        await loadData();
    }
}

async function toggleGoalCompletion(id, completed) {
    const g = state.goals.find(t => t.id === id);
    if (!g) return;
    g.completed = completed;
    renderApp();
    try {
        const { error } = await supabase.from('tasks').update({ completed }).eq('id', id);
        if (error) throw error;
    } catch (err) {
        g.completed = !completed; renderApp(); showToast('Failed', 'error');
    }
}

async function togglePinContext(id, is_pinned) {
    const g = state.goals.find(t => t.id === id);
    g.is_pinned = is_pinned;
    renderApp();
    try {
        await supabase.from('tasks').update({ is_pinned }).eq('id', id);
    } catch(err) { await loadData(); }
}

async function setGoalDeadline(id, deadlineStr) {
    if(!deadlineStr) return;
    const g = state.goals.find(t => t.id === id);
    g.deadline = new Date(deadlineStr).toISOString();
    renderApp();
    try { await supabase.from('tasks').update({ deadline: g.deadline }).eq('id', id); } 
    catch(err) { await loadData(); }
}

// ... Additional helper handlers (sorting, renaming, deleting) which mostly follow previous patterns but rename state.tasks -> state.goals...
async function toggleSection(id) {
    state.expandedSections.has(id) ? state.expandedSections.delete(id) : state.expandedSections.add(id);
    renderApp();
}

async function handleSectionSort(evt) {
    const updates = [...evt.to.children].map((el, i) => ({ id: el.dataset.id, sort_order: i }));
    updates.forEach(u => { const s = state.sections.find(x => x.id === u.id); if(s) s.sort_order = u.sort_order; });
    try { await supabase.from('sections').upsert(updates); } catch (err) { await loadData(); }
}

async function handleGoalSort(evt) {
    const toSectionId = evt.to.dataset.sectionId;
    const itemEls = [...evt.to.children].filter(el => el.classList.contains('conquer-task-wrapper'));
    const updates = itemEls.map((el, index) => ({
        id: el.querySelector('.conquer-task').dataset.id, section_id: toSectionId, sort_order: index
    }));
    updates.forEach(u => {
        const t = state.goals.find(x => x.id === u.id);
        if(t) { t.sort_order = u.sort_order; t.section_id = u.section_id; }
    });
    try { await supabase.from('tasks').upsert(updates); } catch (err) { await loadData(); }
}

async function updateSectionTitle(id, val) { 
    try { await supabase.from('sections').update({title: val}).eq('id', id); } catch(e){} 
}
async function updateGoalTitle(id, val) { 
    try { await supabase.from('tasks').update({title: val}).eq('id', id); } catch(e){} 
}
async function updateSubtaskTitle(id, val) { 
    try { await supabase.from('subtasks').update({title: val}).eq('id', id); } catch(e){} 
}
async function deleteSection(id) { 
    state.sections = state.sections.filter(s=>s.id!==id); renderApp(); 
    supabase.from('sections').delete().eq('id',id); 
}
async function deleteGoal(id) { 
    state.goals = state.goals.filter(g=>g.id!==id); renderApp(); 
    supabase.from('tasks').delete().eq('id',id); 
}
async function deleteSubtask(id) { 
    state.subtasks = state.subtasks.filter(s=>s.id!==id); renderApp(); 
    supabase.from('subtasks').delete().eq('id',id); 
}

function calculateSectionProgress(sectionId, list) {
    const st = list.filter(t => t.section_id === sectionId);
    const total = st.length;
    const completed = st.filter(t => t.completed).length;
    return { total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;','<': '&lt;','>': '&gt;',"'": '&#39;','"': '&quot;' }[tag]));
}

let toastTimeout;
function showToast(msg, type='info') {
    els.toast.textContent = msg; els.toast.className = `conquer-toast show ${type}`;
    clearTimeout(toastTimeout); toastTimeout = setTimeout(() => { els.toast.classList.remove('show'); }, 3000);
}

function setupEventListeners() {
    /* Auth listeners keep existing simplified boilerplate */
    if(els.logoutBtn) els.logoutBtn.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.reload();
    });
    if(els.expandAllBtn) els.expandAllBtn.addEventListener('click', () => {
        state.sections.forEach(s => state.expandedSections.add(s.id)); renderApp();
    });
    if(els.collapseAllBtn) els.collapseAllBtn.addEventListener('click', () => {
        state.expandedSections.clear(); renderApp();
    });
    if(els.addSectionBtn) els.addSectionBtn.addEventListener('click', async () => {
        const title = prompt('Section Name:');
        if(!title) return;
        const maxOrder = state.sections.reduce((max, s) => Math.max(max, s.sort_order), -1);
        try {
            await supabase.from('sections').insert({ title, sort_order: maxOrder + 1, user_id: state.user.id });
            loadData();
        } catch(e) { showToast('Fail', 'error'); }
    });
    if(els.searchInput) els.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        if(state.searchQuery) state.sections.forEach(s => state.expandedSections.add(s.id));
        renderApp();
    });
}

document.addEventListener('DOMContentLoaded', init);
