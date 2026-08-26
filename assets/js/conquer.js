// ─── Config ────────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://kbmimkfdhblyrdskdcxc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_fBTnwIh34wJb61_aXNzk6Q_sv5oZkoG';

let db = null;
try { db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY); }
catch (e) { console.warn('Supabase init failed', e); }

// ─── State ─────────────────────────────────────────────────────────────────
const state = {
    user: null,
    items: [],           // flat array from DB
    tree: [],            // nested tree built from items
    expanded: new Set(), // expanded item IDs
    editing: false,      // edit mode
};

// ─── Helpers ────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

let toastTimer;
function toast(msg, type = '') {
    const el = $('il-toast');
    el.textContent = msg;
    el.className = 'il-toast show ' + type;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

// ─── Tree Building ──────────────────────────────────────────────────────────
function buildTree(items) {
    const map = new Map();
    items.forEach(it => { it.children = []; map.set(it.id, it); });
    const roots = [];
    items.forEach(it => {
        if (it.parent_id && map.has(it.parent_id)) {
            map.get(it.parent_id).children.push(it);
        } else if (!it.parent_id) {
            roots.push(it);
        }
    });
    // Sort children by sort_order
    function sortTree(nodes) {
        nodes.sort((a, b) => a.sort_order - b.sort_order);
        nodes.forEach(n => sortTree(n.children));
    }
    sortTree(roots);
    return roots;
}

function countStats(items) {
    let total = 0, done = 0;
    items.forEach(it => {
        if (it.children.length === 0) { total++; if (it.completed) done++; }
        else { const s = countStats(it.children); total += s.total; done += s.done; }
    });
    return { total, done };
}

function updateProgress() {
    const { total, done } = countStats(state.tree);
    $('il-prog-text').textContent = `${done} / ${total}`;
    $('il-prog-fill').style.width = total ? `${Math.round((done / total) * 100)}%` : '0%';
}

// ─── Rendering ──────────────────────────────────────────────────────────────
function render() {
    const container = $('il-tree');
    container.innerHTML = '';
    state.tree.forEach((item, idx) => {
        container.appendChild(renderItem(item, 0, idx));
    });
    updateProgress();
}

function renderItem(item, depth, catIndex) {
    const el = document.createElement('div');
    el.className = `il-item level-${depth}${item.completed ? ' completed' : ''}`;
    el.dataset.id = item.id;
    if (depth === 0) el.dataset.cat = catIndex % 8;

    const hasChildren = item.children.length > 0;
    const isExpanded = state.expanded.has(item.id);

    // Row
    const row = document.createElement('div');
    row.className = 'il-item-row';

    // Drag handle
    const drag = document.createElement('div');
    drag.className = 'il-drag-handle';
    drag.draggable = true;
    drag.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>';
    setupDrag(drag, item);
    row.appendChild(drag);

    // Toggle
    const toggle = document.createElement('div');
    toggle.className = `il-toggle ${!hasChildren ? 'leaf' : ''} ${!isExpanded && hasChildren ? 'collapsed' : ''}`;
    toggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>';
    if (hasChildren) {
        toggle.addEventListener('click', () => {
            if (state.expanded.has(item.id)) state.expanded.delete(item.id);
            else state.expanded.add(item.id);
            render();
        });
    }
    row.appendChild(toggle);

    // Checkbox
    const cb = document.createElement('div');
    cb.className = `il-checkbox ${item.completed ? 'checked' : ''} ${!state.editing ? 'readonly' : ''}`;
    cb.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>';
    if (state.editing) {
        cb.addEventListener('click', () => toggleCompleted(item));
    }
    row.appendChild(cb);

    // Title
    const title = document.createElement('div');
    title.className = 'il-title';
    title.textContent = item.title;
    if (state.editing) {
        title.contentEditable = 'true';
        title.spellcheck = false;
        title.addEventListener('blur', () => {
            const newTitle = title.textContent.trim();
            if (newTitle && newTitle !== item.title) updateItem(item, { title: newTitle });
            else title.textContent = item.title;
        });
        title.addEventListener('keydown', e => {
            if (e.key === 'Enter') { e.preventDefault(); title.blur(); }
            if (e.key === 'Escape') { title.textContent = item.title; title.blur(); }
        });
    }
    row.appendChild(title);

    // Status badge
    if (item.status === 'someday') {
        const badge = document.createElement('span');
        badge.className = 'il-status-badge someday';
        badge.textContent = 'someday';
        row.appendChild(badge);
    } else if (item.status === 'abandoned') {
        const badge = document.createElement('span');
        badge.className = 'il-status-badge abandoned';
        badge.textContent = 'abandoned';
        row.appendChild(badge);
    }

    // Controls
    const controls = document.createElement('div');
    controls.className = 'il-controls';

    // Add child button
    const addBtn = document.createElement('button');
    addBtn.className = 'il-ctrl-btn';
    addBtn.title = 'Add child';
    addBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>';
    addBtn.addEventListener('click', () => addChildInline(item, el));
    controls.appendChild(addBtn);

    // Status cycle button
    const statusBtn = document.createElement('button');
    statusBtn.className = 'il-ctrl-btn';
    statusBtn.title = 'Cycle status';
    const dot = document.createElement('div');
    dot.className = `il-status-dot ${item.status}`;
    statusBtn.appendChild(dot);
    statusBtn.addEventListener('click', () => cycleStatus(item));
    controls.appendChild(statusBtn);

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.className = 'il-ctrl-btn danger';
    delBtn.title = 'Delete';
    delBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>';
    delBtn.addEventListener('click', e => { e.stopPropagation(); confirmDelete(item); });
    controls.appendChild(delBtn);

    row.appendChild(controls);
    el.appendChild(row);

    // Description
    if (item.description) {
        const desc = document.createElement('div');
        desc.className = 'il-desc visible';
        desc.textContent = item.description;
        if (state.editing) {
            desc.contentEditable = 'true';
            desc.spellcheck = false;
            desc.addEventListener('blur', () => {
                const newDesc = desc.textContent.trim();
                if (newDesc !== item.description) updateItem(item, { description: newDesc });
            });
            desc.addEventListener('keydown', e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); desc.blur(); }
                if (e.key === 'Escape') { desc.textContent = item.description; desc.blur(); }
            });
        }
        el.appendChild(desc);
    }

    // Children
    if (hasChildren) {
        const children = document.createElement('div');
        children.className = `il-children ${!isExpanded ? 'collapsed' : ''}`;
        item.children.forEach((child, i) => {
            children.appendChild(renderItem(child, depth + 1, depth === 0 ? i : catIndex));
        });
        el.appendChild(children);
    }

    // Inline add row (auth only)
    const addRow = document.createElement('div');
    addRow.className = 'il-add-row';
    const addInput = document.createElement('input');
    addInput.className = 'il-add-input';
    addInput.placeholder = depth === 0 ? 'new category…' : 'new item…';
    addInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            const val = addInput.value.trim();
            if (val) createItem(item.id, val, item.children.length).then(() => { addInput.value = ''; render(); });
        }
        if (e.key === 'Escape') addInput.blur();
    });
    addRow.appendChild(addInput);
    const addSubmit = document.createElement('button');
    addSubmit.className = 'il-add-btn';
    addSubmit.textContent = '+';
    addSubmit.addEventListener('click', () => {
        const val = addInput.value.trim();
        if (val) createItem(item.id, val, item.children.length).then(() => { addInput.value = ''; render(); });
    });
    addRow.appendChild(addSubmit);
    el.appendChild(addRow);

    // Drop zone for drag reorder
    setupDrop(el, item);

    return el;
}

// ─── Drag & Drop ────────────────────────────────────────────────────────────
let dragItem = null;

function setupDrag(handle, item) {
    handle.addEventListener('dragstart', e => {
        dragItem = item;
        e.dataTransfer.effectAllowed = 'move';
        handle.closest('.il-item').classList.add('dragging');
    });
    handle.addEventListener('dragend', () => {
        dragItem = null;
        document.querySelectorAll('.dragging, .drag-over').forEach(el => el.classList.remove('dragging', 'drag-over'));
    });
}

function setupDrop(el, item) {
    el.addEventListener('dragover', e => {
        if (!dragItem || dragItem.id === item.id) return;
        if (dragItem.parent_id === item.id) return;
        e.preventDefault();
        el.classList.add('drag-over');
    });
    el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
    el.addEventListener('drop', async e => {
        e.preventDefault();
        el.classList.remove('drag-over');
        if (!dragItem || dragItem.id === item.id) return;

        // Move dragged item to be a sibling before/after this item
        const newParentId = item.parent_id || null;
        const siblings = state.items.filter(i => i.parent_id === newParentId && i.id !== dragItem.id);
        const targetIdx = siblings.findIndex(i => i.id === item.id);
        const dragIdx = siblings.findIndex(i => i.id === dragItem.id);

        let newOrder;
        if (dragIdx !== -1 && dragIdx < targetIdx) {
            // Moving down
            newOrder = siblings.splice(targetIdx, 0, dragItem);
        } else {
            // Moving up or from different parent
            siblings.splice(targetIdx + 1, 0, dragItem);
        }

        // Update parent and sort orders
        await updateItem(dragItem, { parent_id: newParentId });
        for (let i = 0; i < siblings.length; i++) {
            if (siblings[i].sort_order !== i || siblings[i].parent_id !== newParentId) {
                await updateItem(siblings[i], { sort_order: i, parent_id: newParentId });
            }
        }
        render();
    });
}

// ─── CRUD Operations ────────────────────────────────────────────────────────
async function createItem(parentId, title, sortOrder) {
    if (!db || !state.user) return;
    const { data, error } = await db.from('impossible_items').insert({
        user_id: state.user.id,
        parent_id: parentId || null,
        title,
        sort_order: sortOrder,
    }).select().single();
    if (error) { toast(error.message, 'error'); return null; }
    state.items.push(data);
    state.expanded.add(parentId);
    return data;
}

async function updateItem(item, updates) {
    if (!db || !state.user) return;
    const { error } = await db.from('impossible_items')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', item.id);
    if (error) { toast(error.message, 'error'); return; }
    Object.assign(item, updates);
}

async function deleteItem(item) {
    if (!db || !state.user) return;
    // Collect all descendant IDs
    const ids = [item.id];
    function collectIds(node) {
        node.children.forEach(c => { ids.push(c.id); collectIds(c); });
    }
    collectIds(item);

    const { error } = await db.from('impossible_items').delete().in('id', ids);
    if (error) { toast(error.message, 'error'); return; }

    // Remove from state
    function removeFromState(nodes, id) {
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].id === id) { nodes.splice(i, 1); return true; }
            if (removeFromState(nodes[i].children, id)) return true;
        }
        return false;
    }
    removeFromState(state.tree, item.id);
    state.items = state.items.filter(i => !ids.includes(i.id));
    render();
}

async function toggleCompleted(item) {
    const newVal = !item.completed;
    const newStatus = newVal ? 'completed' : 'active';
    await updateItem(item, { completed: newVal, status: newStatus });
    render();
}

async function cycleStatus(item) {
    const statuses = ['active', 'someday', 'abandoned'];
    const current = statuses.indexOf(item.status === 'completed' ? 'active' : item.status);
    const next = statuses[(current + 1) % statuses.length];
    const completed = next === 'completed';
    await updateItem(item, { status: next, completed });
    render();
}

function addChildInline(item, el) {
    // Expand this item and focus the add input
    state.expanded.add(item.id);
    render();
    // Find the add input for this item after re-render
    setTimeout(() => {
        const newItemEl = document.querySelector(`.il-item[data-id="${item.id}"]`);
        if (newItemEl) {
            const input = newItemEl.querySelector(':scope > .il-add-row .il-add-input');
            if (input) input.focus();
        }
    }, 50);
}

// ─── Delete Confirm ─────────────────────────────────────────────────────────
function confirmDelete(item) {
    const count = (function countDesc(n) { let c = 0; n.children.forEach(ch => { c++; c += countDesc(ch); }); return c; })(item);
    $('il-confirm-text').textContent = count > 0
        ? `delete "${item.title}" and ${count} child${count > 1 ? 'ren' : ''}?`
        : `delete "${item.title}"?`;
    $('il-confirm').classList.add('open');
    $('il-confirm').style.position = 'fixed';
    $('il-confirm').style.top = '50%';
    $('il-confirm').style.left = '50%';
    $('il-confirm').style.transform = 'translate(-50%, -50%)';

    const ok = () => { $('il-confirm').classList.remove('open'); deleteItem(item); cleanup(); };
    const cancel = () => { $('il-confirm').classList.remove('open'); cleanup(); };
    const cleanup = () => {
        $('il-confirm-ok').removeEventListener('click', ok);
        $('il-confirm-cancel').removeEventListener('click', cancel);
    };
    $('il-confirm-ok').addEventListener('click', ok);
    $('il-confirm-cancel').addEventListener('click', cancel);
}

// ─── Auth ───────────────────────────────────────────────────────────────────
function setEditing(on) {
    state.editing = on;
    document.body.classList.toggle('authenticated', on);
}

function showAuthModal() {
    $('il-auth-overlay').classList.add('open');
    setTimeout(() => $('il-auth-email').focus(), 100);
}

function hideAuthModal() {
    $('il-auth-overlay').classList.remove('open');
}

function bindAuth() {
    $('il-auth-login').addEventListener('click', async () => {
        const email = $('il-auth-email').value.trim();
        const pass = $('il-auth-pass').value;
        if (!email || !pass) return toast('enter email and password', 'error');
        const { error } = await db.auth.signInWithPassword({ email, password: pass });
        if (error) { toast(error.message, 'error'); return; }
        hideAuthModal();
    });
    $('il-auth-signup').addEventListener('click', async () => {
        const email = $('il-auth-email').value.trim();
        const pass = $('il-auth-pass').value;
        if (!email || !pass) return toast('enter email and password', 'error');
        const { error } = await db.auth.signUp({ email, password: pass });
        if (error) toast(error.message, 'error');
        else toast('check your email to confirm', 'success');
    });
    $('il-auth-close').addEventListener('click', hideAuthModal);
    $('il-auth-overlay').addEventListener('click', e => { if (e.target === e.currentTarget) hideAuthModal(); });
    $('il-logout').addEventListener('click', async () => {
        await db.auth.signOut();
    });
    // Enter key
    $('il-auth-pass').addEventListener('keydown', e => { if (e.key === 'Enter') $('il-auth-login').click(); });
    $('il-auth-email').addEventListener('keydown', e => { if (e.key === 'Enter') $('il-auth-pass').focus(); });
}

// ─── "neo" Easter Egg ───────────────────────────────────────────────────────
function setupNeoKeySequence() {
    let buffer = '';
    const SEQUENCE = 'neo';
    const TIMEOUT = 2000;
    let lastKey = 0;

    document.addEventListener('keydown', e => {
        // Don't capture when typing in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;

        const now = Date.now();
        if (now - lastKey > TIMEOUT) buffer = '';
        lastKey = now;

        buffer += e.key.toLowerCase();
        if (buffer.length > SEQUENCE.length) buffer = buffer.slice(-SEQUENCE.length);

        if (buffer === SEQUENCE) {
            buffer = '';
            if (state.user) {
                // Already logged in — toggle edit mode
                setEditing(!state.editing);
                toast(state.editing ? 'edit mode on' : 'edit mode off', 'success');
            } else {
                showAuthModal();
            }
        }
    });
}

// ─── Seed Data ──────────────────────────────────────────────────────────────
const SEED_CATEGORIES = [
    { title: 'mind', children: ['goal placeholder'] },
    { title: 'engineering & building', children: ['goal placeholder'] },
    { title: 'physical capability', children: ['goal placeholder'] },
    { title: 'exploration', children: ['goal placeholder'] },
    { title: 'knowledge', children: ['goal placeholder'] },
    { title: 'relationships & social', children: ['goal placeholder'] },
    { title: 'money & freedom', children: ['goal placeholder'] },
    { title: 'power & influence', children: ['goal placeholder'] },
];

async function seedDB() {
    if (!db || !state.user) return;
    toast('seeding initial structure…');
    for (let i = 0; i < SEED_CATEGORIES.length; i++) {
        const cat = SEED_CATEGORIES[i];
        const { data: catItem, error: catErr } = await db.from('impossible_items').insert({
            user_id: state.user.id,
            parent_id: null,
            title: cat.title,
            sort_order: i,
        }).select().single();
        if (catErr) continue;
        state.items.push(catItem);

        for (let j = 0; j < cat.children.length; j++) {
            const { data: child } = await db.from('impossible_items').insert({
                user_id: state.user.id,
                parent_id: catItem.id,
                title: cat.children[j],
                sort_order: j,
            }).select().single();
            if (child) state.items.push(child);
        }
    }
}

// ─── Data Loading ───────────────────────────────────────────────────────────
async function loadData() {
    $('il-loading').style.display = '';
    $('il-tree').style.display = 'none';

    const { data, error } = await db.from('impossible_items')
        .select('*')
        .order('sort_order');

    if (error) { toast(error.message, 'error'); return; }

    state.items = data || [];

    if (state.items.length === 0) {
        await seedDB();
    }

    // Expand all top-level categories by default
    state.items.forEach(it => {
        if (!it.parent_id) state.expanded.add(it.id);
    });

    state.tree = buildTree(state.items);
    $('il-loading').style.display = 'none';
    $('il-tree').style.display = '';
    render();
}

// ─── Init ───────────────────────────────────────────────────────────────────
async function init() {
    bindAuth();
    setupNeoKeySequence();

    if (!db) {
        $('il-loading').textContent = 'supabase not configured';
        return;
    }

    const { data: { session } } = await db.auth.getSession();
    state.user = session?.user ?? null;

    if (state.user) {
        setEditing(true);
        await loadData();
    } else {
        // Public read-only mode — still load data but via public anon
        // Since RLS requires auth, we'll show a message
        $('il-loading').innerHTML = '<div style="text-align:center"><p style="color:var(--il-dim);margin-bottom:0.5rem">this list is private.</p><p style="font-size:0.75rem;color:var(--il-dim)">type <span style="color:var(--il-accent);font-family:JetBrains Mono,monospace">neo</span> to authenticate.</p></div>';
        $('il-tree').style.display = 'none';

        // Try to load anyway in case there's a public policy
        try {
            const { data, error } = await db.from('impossible_items')
                .select('*')
                .order('sort_order');
            if (!error && data && data.length > 0) {
                state.items = data;
                state.tree = buildTree(state.items);
                state.items.forEach(it => { if (!it.parent_id) state.expanded.add(it.id); });
                $('il-loading').style.display = 'none';
                $('il-tree').style.display = '';
                render();
            }
        } catch {}
    }

    db.auth.onAuthStateChange(async (_ev, sess) => {
        const wasUser = !!state.user;
        state.user = sess?.user ?? null;

        if (state.user && !wasUser) {
            setEditing(true);
            await loadData();
        } else if (!state.user && wasUser) {
            setEditing(false);
            state.items = [];
            state.tree = [];
            $('il-tree').innerHTML = '';
            $('il-loading').style.display = '';
            $('il-loading').innerHTML = '<div style="text-align:center"><p style="color:var(--il-dim);margin-bottom:0.5rem">this list is private.</p><p style="font-size:0.75rem;color:var(--il-dim)">type <span style="color:var(--il-accent);font-family:JetBrains Mono,monospace">neo</span> to authenticate.</p></div>';
            $('il-tree').style.display = 'none';
        }
    });
}

init();
