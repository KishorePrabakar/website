import { SEED_DATA } from './conquer-data.js';

// Configuration
// Users should replace this with their Supabase URL and Anon Key
const SUPABASE_URL = 'https://kbmimkfdhblyrdskdcxc.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_fBTnwIh34wJb61_aXNzk6Q_sv5oZkoG'
// const SUPABASE_URL = 'https://YOUR_SUPABASE_PROJECT.supabase.co';
// const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

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
    tasks: [],
    loading: true,
    error: null,
    searchQuery: '',
    expandedSections: new Set() // stores section IDs
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
    
    // Actions
    addSectionBtn: document.getElementById('btn-add-section'),
    collapseAllBtn: document.getElementById('btn-collapse-all'),
    expandAllBtn: document.getElementById('btn-expand-all'),
    searchInput: document.getElementById('search-input'),
    configNotice: document.getElementById('config-notice')
};

// Initialize
async function init() {
    if (SUPABASE_URL.includes('YOUR_SUPABASE_PROJECT')) {
        els.loadingView.classList.add('hidden');
        els.authView.classList.remove('hidden');
        els.configNotice.classList.remove('hidden');
        return;
    }

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
}

// Data fetching
async function loadData() {
    state.loading = true;
    renderApp();
    
    try {
        const [sectionsRes, tasksRes] = await Promise.all([
            supabase.from('sections').select('*').order('sort_order', { ascending: true }),
            supabase.from('tasks').select('*').order('sort_order', { ascending: true })
        ]);

        if (sectionsRes.error) throw sectionsRes.error;
        if (tasksRes.error) throw tasksRes.error;

        state.sections = sectionsRes.data || [];
        state.tasks = tasksRes.data || [];

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
            
            // Insert section
            const { data: newSection, error: sectionErr } = await supabase
                .from('sections')
                .insert({
                    user_id: state.user.id,
                    title: section.title,
                    sort_order: i
                })
                .select()
                .single();
                
            if (sectionErr) throw sectionErr;
            state.sections.push(newSection);

            // Insert tasks
            if (section.tasks && section.tasks.length > 0) {
                const tasksToInsert = section.tasks.map((taskTitle, tIndex) => ({
                    user_id: state.user.id,
                    section_id: newSection.id,
                    title: taskTitle,
                    sort_order: tIndex,
                    completed: false
                }));
                
                const { data: insertedTasks, error: taskErr } = await supabase
                    .from('tasks')
                    .insert(tasksToInsert)
                    .select();
                    
                if (taskErr) throw taskErr;
                state.tasks.push(...insertedTasks);
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
    
    const filteredTasks = state.tasks.filter(t => 
        t.title.toLowerCase().includes(state.searchQuery.toLowerCase())
    );

    els.sectionsContainer.innerHTML = '';
    
    state.sections.sort((a, b) => a.sort_order - b.sort_order).forEach(section => {
        const sectionTasks = filteredTasks
            .filter(t => t.section_id === section.id)
            .sort((a, b) => a.sort_order - b.sort_order);

        // Don't show empty sections if searching
        if (state.searchQuery && sectionTasks.length === 0) return;

        const isExpanded = state.expandedSections.has(section.id);
        const sectionProgress = calculateSectionProgress(section.id, filteredTasks);

        const sectionEl = document.createElement('div');
        sectionEl.className = 'conquer-section lc';
        sectionEl.dataset.id = section.id;
        
        sectionEl.innerHTML = `
            <div class="conquer-section-header">
                <div class="conquer-section-drag-handle">⋮⋮</div>
                <div class="conquer-section-title-wrap">
                    <div class="conquer-section-title" contenteditable="true" spellcheck="false">${escapeHTML(section.title)}</div>
                    <div class="conquer-section-meta">
                        <span class="conquer-progress-text">${sectionProgress.completed}/${sectionProgress.total}</span>
                        <div class="conquer-mini-progress">
                            <div class="conquer-mini-progress-fill" style="width: ${sectionProgress.percent}%"></div>
                        </div>
                    </div>
                </div>
                <div class="conquer-section-actions">
                    <button class="conquer-btn small btn-add-task" title="Add Task">+</button>
                    <button class="conquer-btn small btn-delete-section" title="Delete Section">×</button>
                    <button class="conquer-btn small btn-toggle-section">
                        <svg class="conquer-chevron ${isExpanded ? 'expanded' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                </div>
            </div>
            <div class="conquer-tasks-container ${isExpanded ? '' : 'hidden'}" data-section-id="${section.id}">
                ${sectionTasks.length === 0 ? '<div class="conquer-empty-tasks">No tasks.</div>' : ''}
            </div>
        `;

        if (isExpanded) {
            const tasksContainer = sectionEl.querySelector('.conquer-tasks-container');
            sectionTasks.forEach(task => {
                const taskEl = renderTask(task);
                tasksContainer.appendChild(taskEl);
            });
            
            // Init sortable for tasks
            new Sortable(tasksContainer, {
                group: 'tasks',
                handle: '.conquer-task-drag-handle',
                animation: 150,
                ghostClass: 'sortable-ghost',
                onEnd: handleTaskSort
            });
        }

        // Attach events
        const titleEl = sectionEl.querySelector('.conquer-section-title');
        titleEl.addEventListener('blur', (e) => updateSectionTitle(section.id, e.target.innerText));
        titleEl.addEventListener('keydown', (e) => { if(e.key === 'Enter') { e.preventDefault(); titleEl.blur(); } });

        sectionEl.querySelector('.btn-add-task').addEventListener('click', (e) => {
            e.stopPropagation();
            addTask(section.id);
        });
        
        sectionEl.querySelector('.btn-delete-section').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Delete this section and all its tasks?')) deleteSection(section.id);
        });

        sectionEl.querySelector('.btn-toggle-section').addEventListener('click', () => toggleSection(section.id));
        sectionEl.querySelector('.conquer-section-title-wrap').addEventListener('dblclick', () => toggleSection(section.id));

        els.sectionsContainer.appendChild(sectionEl);
    });

    // Init sortable for sections
    new Sortable(els.sectionsContainer, {
        handle: '.conquer-section-drag-handle',
        animation: 150,
        ghostClass: 'sortable-ghost',
        onEnd: handleSectionSort
    });
}

function renderTask(task) {
    const el = document.createElement('div');
    el.className = `conquer-task ${task.completed ? 'completed' : ''}`;
    el.dataset.id = task.id;
    
    el.innerHTML = `
        <div class="conquer-task-drag-handle">⋮⋮</div>
        <div class="conquer-checkbox ${task.completed ? 'checked' : ''}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="${task.completed ? '' : 'hidden'}"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
        <div class="conquer-task-title" contenteditable="true" spellcheck="false">${escapeHTML(task.title)}</div>
        <button class="conquer-btn small btn-delete-task" title="Delete Task">×</button>
    `;

    const checkbox = el.querySelector('.conquer-checkbox');
    checkbox.addEventListener('click', () => toggleTaskCompletion(task.id, !task.completed));

    const titleEl = el.querySelector('.conquer-task-title');
    titleEl.addEventListener('blur', (e) => updateTaskTitle(task.id, e.target.innerText));
    titleEl.addEventListener('keydown', (e) => { if(e.key === 'Enter') { e.preventDefault(); titleEl.blur(); } });

    el.querySelector('.btn-delete-task').addEventListener('click', () => {
        if(confirm('Delete task?')) deleteTask(task.id);
    });

    return el;
}

function renderStats() {
    const total = state.tasks.length;
    const completed = state.tasks.filter(t => t.completed).length;
    const p = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    els.statProgress.innerText = `${p}%`;
    els.statCompleted.innerText = completed.toString();
    els.statRemaining.innerText = (total - completed).toString();
    els.statTotal.innerText = total.toString();
    els.progressBar.style.width = `${p}%`;
}

// Actions
async function toggleSection(id) {
    if (state.expandedSections.has(id)) {
        state.expandedSections.delete(id);
    } else {
        state.expandedSections.add(id);
    }
    renderApp();
}

async function handleSectionSort(evt) {
    const itemEls = [...els.sectionsContainer.children];
    const updates = itemEls.map((el, index) => ({
        id: el.dataset.id,
        sort_order: index
    }));

    // Optimistic UI Update
    updates.forEach(u => {
        const s = state.sections.find(x => x.id === u.id);
        if(s) s.sort_order = u.sort_order;
    });
    
    try {
        const { error } = await supabase.from('sections').upsert(updates);
        if (error) throw error;
    } catch (err) {
        showToast('Failed to update order', 'error');
        await loadData();
    }
}

async function handleTaskSort(evt) {
    const toSectionId = evt.to.dataset.sectionId;
    const itemEls = [...evt.to.children].filter(el => el.classList.contains('conquer-task'));
    
    const updates = itemEls.map((el, index) => ({
        id: el.dataset.id,
        section_id: toSectionId,
        sort_order: index
    }));

    // Optimistic
    updates.forEach(u => {
        const t = state.tasks.find(x => x.id === u.id);
        if(t) {
            t.sort_order = u.sort_order;
            t.section_id = u.section_id;
        }
    });
    renderStats();

    try {
        const { error } = await supabase.from('tasks').upsert(updates);
        if (error) throw error;
    } catch (err) {
        showToast('Failed to update task', 'error');
        await loadData();
    }
}

async function addSection() {
    const title = prompt('Section Name:');
    if (!title) return;
    
    const maxOrder = state.sections.reduce((max, s) => Math.max(max, s.sort_order), -1);
    
    const tempSection = {
        id: crypto.randomUUID(),
        title,
        sort_order: maxOrder + 1,
        user_id: state.user.id
    };
    
    state.sections.push(tempSection);
    state.expandedSections.add(tempSection.id);
    renderApp();
    
    try {
        const { data, error } = await supabase.from('sections').insert({
            title, sort_order: tempSection.sort_order, user_id: state.user.id
        }).select().single();
        
        if (error) throw error;
        
        // Update temp id
        const idx = state.sections.findIndex(s => s.id === tempSection.id);
        if (idx !== -1) state.sections[idx] = data;
        state.expandedSections.delete(tempSection.id);
        state.expandedSections.add(data.id);
        renderApp();
    } catch (err) {
        showToast('Failed to add section', 'error');
        state.sections = state.sections.filter(s => s.id !== tempSection.id);
        renderApp();
    }
}

async function updateSectionTitle(id, newTitle) {
    const section = state.sections.find(s => s.id === id);
    if (!section || section.title === newTitle) return;
    
    const oldTitle = section.title;
    section.title = newTitle;
    
    try {
        const { error } = await supabase.from('sections').update({ title: newTitle }).eq('id', id);
        if (error) throw error;
    } catch (err) {
        section.title = oldTitle;
        renderApp();
        showToast('Failed to rename section', 'error');
    }
}

async function deleteSection(id) {
    const backupSections = [...state.sections];
    const backupTasks = [...state.tasks];
    
    state.sections = state.sections.filter(s => s.id !== id);
    state.tasks = state.tasks.filter(t => t.section_id !== id);
    renderApp();
    
    try {
        const { error } = await supabase.from('sections').delete().eq('id', id);
        if (error) throw error;
        showToast('Section deleted', 'success');
    } catch (err) {
        state.sections = backupSections;
        state.tasks = backupTasks;
        renderApp();
        showToast('Failed to delete section', 'error');
    }
}

async function addTask(sectionId) {
    state.expandedSections.add(sectionId);
    renderApp();
    
    const taskContainer = els.sectionsContainer.querySelector(`.conquer-tasks-container[data-section-id="${sectionId}"]`);
    if(taskContainer) {
        const dummy = document.createElement('div');
        dummy.className = 'conquer-task editing-new';
        dummy.innerHTML = `<div class="conquer-checkbox"></div><input type="text" class="new-task-input" placeholder="Task name..." />`;
        taskContainer.appendChild(dummy);
        const input = dummy.querySelector('input');
        input.focus();
        
        const save = async () => {
            const title = input.value.trim();
            if (!title) { renderApp(); return; }
            
            const maxOrder = state.tasks.filter(t => t.section_id === sectionId).reduce((max, t) => Math.max(max, t.sort_order), -1);
            
            const tempTask = {
                id: crypto.randomUUID(), title, completed: false, section_id: sectionId, sort_order: maxOrder + 1, user_id: state.user.id
            };
            
            state.tasks.push(tempTask);
            renderApp();
            
            try {
                const { data, error } = await supabase.from('tasks').insert({
                    title, section_id: sectionId, sort_order: tempTask.sort_order, user_id: state.user.id
                }).select().single();
                if (error) throw error;
                const idx = state.tasks.findIndex(t => t.id === tempTask.id);
                if (idx !== -1) state.tasks[idx] = data;
                renderApp();
            } catch (err) {
                state.tasks = state.tasks.filter(t => t.id !== tempTask.id);
                renderApp();
                showToast('Failed to add task', 'error');
            }
        };
        
        input.addEventListener('blur', save);
        input.addEventListener('keydown', (e) => { if(e.key === 'Enter') input.blur(); else if (e.key === 'Escape') renderApp(); });
    }
}

async function updateTaskTitle(id, newTitle) {
    const task = state.tasks.find(t => t.id === id);
    if (!task || task.title === newTitle) return;
    
    const oldTitle = task.title;
    task.title = newTitle;
    
    try {
        const { error } = await supabase.from('tasks').update({ title: newTitle }).eq('id', id);
        if (error) throw error;
    } catch (err) {
        task.title = oldTitle;
        renderApp();
        showToast('Failed to update task', 'error');
    }
}

async function toggleTaskCompletion(id, completed) {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;
    
    task.completed = completed;
    renderApp(); // optimistic
    
    try {
        const { error } = await supabase.from('tasks').update({ completed }).eq('id', id);
        if (error) throw error;
    } catch (err) {
        task.completed = !completed;
        renderApp();
        showToast('Failed to save completion', 'error');
    }
}

async function deleteTask(id) {
    const backupTasks = [...state.tasks];
    state.tasks = state.tasks.filter(t => t.id !== id);
    renderApp();
    
    try {
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (error) throw error;
    } catch (err) {
        state.tasks = backupTasks;
        renderApp();
        showToast('Failed to delete task', 'error');
    }
}

// Helpers
function calculateSectionProgress(sectionId, tasksList) {
    const st = tasksList.filter(t => t.section_id === sectionId);
    const total = st.length;
    const completed = st.filter(t => t.completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;','<': '&lt;','>': '&gt;',"'": '&#39;','"': '&quot;'
    }[tag]));
}

let toastTimeout;
function showToast(msg, type='info') {
    els.toast.textContent = msg;
    els.toast.className = `conquer-toast show ${type}`;
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => { els.toast.classList.remove('show'); }, 3000);
}

function updateButtonState(button, text, disabled) {
    if (!button) return;
    button.innerText = text;
    button.disabled = disabled;
}

async function handleAuthRequest(button, action, originalText) {
    updateButtonState(button, originalText, true);
    try {
        return await requestWithTimeout(action, REQUEST_TIMEOUT_MS);
    } catch (error) {
        showToast(error.message, 'error');
        throw error;
    } finally {
        updateButtonState(button, originalText, false);
    }
}

// DOM Events Setup
function setupEventListeners() {
    if (els.signUpPasswordBtn) els.signUpPasswordBtn.addEventListener('click', async () => {
        const email = els.loginEmailInput.value.trim();
        const password = els.loginPasswordInput.value;
        if (!email || !password) {
            showToast('Enter both email and password', 'error');
            return;
        }
        const originalText = els.signUpPasswordBtn.innerText;
        updateButtonState(els.signUpPasswordBtn, 'Creating...', true);

        try {
            const { data, error } = await requestWithTimeout((signal) =>
                supabase.auth.signUp(
                    { email, password },
                    { redirectTo: window.location.origin + '/conquer', signal }
                ),
                REQUEST_TIMEOUT_MS
            );

            if (error) {
                showToast(error.message, 'error');
            } else if (data?.user) {
                showToast('Account created and logged in!', 'success');
            } else {
                showToast('Account created. Check your email to confirm.', 'success');
            }
        } catch (err) {
            // handled by requestWithTimeout
        } finally {
            updateButtonState(els.signUpPasswordBtn, originalText, false);
        }
    });

    if (els.loginPasswordBtn) els.loginPasswordBtn.addEventListener('click', async () => {
        const email = els.loginEmailInput.value.trim();
        const password = els.loginPasswordInput.value;
        if (!email || !password) {
            showToast('Enter both email and password', 'error');
            return;
        }
        const originalText = els.loginPasswordBtn.innerText;
        updateButtonState(els.loginPasswordBtn, 'Logging in...', true);

        try {
            const { error } = await requestWithTimeout((signal) =>
                supabase.auth.signInWithPassword({ email, password }, { signal }),
                REQUEST_TIMEOUT_MS
            );

            if (error) {
                showToast(error.message, 'error');
            }
        } catch (err) {
            // handled by requestWithTimeout
        } finally {
            updateButtonState(els.loginPasswordBtn, originalText, false);
        }
    });

    if (els.loginEmailBtn) els.loginEmailBtn.addEventListener('click', async () => {
        const email = els.loginEmailInput.value.trim();
        if (!email) {
            showToast('Please enter your email', 'error');
            return;
        }
        const originalText = els.loginEmailBtn.innerText;
        updateButtonState(els.loginEmailBtn, 'Sending...', true);

        try {
            const { error } = await requestWithTimeout((signal) =>
                supabase.auth.signInWithOtp({
                    email,
                    options: {
                        emailRedirectTo: window.location.origin + '/conquer',
                        signal
                    }
                }),
                REQUEST_TIMEOUT_MS
            );

            if (error) {
                showToast(error.message, 'error');
            } else {
                showToast('Magic link sent! Check your inbox.', 'success');
            }
        } catch (err) {
            // handled by requestWithTimeout
        } finally {
            updateButtonState(els.loginEmailBtn, originalText, false);
        }
    });

    if (els.loginGoogleBtn) els.loginGoogleBtn.addEventListener('click', async () => {
        const originalText = els.loginGoogleBtn.innerText;
        updateButtonState(els.loginGoogleBtn, 'Redirecting...', true);

        try {
            const { error } = await requestWithTimeout(() =>
                supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: window.location.origin + '/conquer'
                    }
                }),
                REQUEST_TIMEOUT_MS
            );

            if (error) {
                showToast(error.message, 'error');
            }
        } catch (err) {
            // handled by requestWithTimeout
        } finally {
            updateButtonState(els.loginGoogleBtn, originalText, false);
        }
    });

    els.logoutBtn.addEventListener('click', async () => {
        await supabase.auth.signOut();
        state.user = null;
        state.sections = [];
        state.tasks = [];
        renderAuth();
    });
    
    els.addSectionBtn.addEventListener('click', addSection);
    
    els.expandAllBtn.addEventListener('click', () => {
        state.sections.forEach(s => state.expandedSections.add(s.id));
        renderApp();
    });
    els.collapseAllBtn.addEventListener('click', () => {
        state.expandedSections.clear();
        renderApp();
    });
    
    els.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        if(state.searchQuery) {
            state.sections.forEach(s => state.expandedSections.add(s.id));
        }
        renderApp();
    });
}

document.addEventListener('DOMContentLoaded', init);
