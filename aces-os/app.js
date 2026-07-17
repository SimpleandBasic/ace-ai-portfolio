(() => {
  'use strict';

  const SUPABASE_URL = 'https://cmryhxnhnltrewvduico.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_JO9jeKWrzTlTNG4vweDX4A_wju68apF';
  const PRACTICE_URL = 'https://ace-os-lyart.vercel.app';
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  const categories = ['All', 'Identity', 'Awareness', 'Regulation', 'Relationships'];
  const categoryIcons = { Identity: '◆', Awareness: '◉', Regulation: '◌', Relationships: '♡' };

  const state = {
    session: null,
    loading: true,
    systems: [],
    query: '',
    category: 'All',
    selectedId: null,
    view: 'systems',
    editorOpen: false,
    editingId: null,
    notice: '',
    error: '',
  };

  const app = document.getElementById('app');

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }

  function attr(value) {
    return escapeHtml(value).replace(/\n/g, '&#10;');
  }

  function array(value) {
    return Array.isArray(value) ? value : [];
  }

  function slugify(value) {
    const base = String(value || 'new-system').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'new-system';
    return `${base}-${Date.now().toString(36)}`;
  }

  function setNotice(message) {
    state.notice = message;
    render();
    window.setTimeout(() => {
      if (state.notice === message) {
        state.notice = '';
        render();
      }
    }, 3200);
  }

  async function loadSystems() {
    state.loading = true;
    state.error = '';
    render();
    const { data, error } = await client
      .from('aces_systems')
      .select('*')
      .eq('status', 'active')
      .order('sort_order', { ascending: true });
    state.loading = false;
    if (error) state.error = error.message;
    else state.systems = data || [];
    render();
  }

  function render() {
    if (state.loading && !state.session) {
      app.innerHTML = '<main class="center-screen"><div class="loading-ring" aria-label="Loading ACES OS"></div></main>';
      return;
    }
    if (!state.session) {
      renderAuth();
      return;
    }
    renderApp();
  }

  function renderAuth() {
    app.innerHTML = `
      <main class="auth-shell">
        <section class="auth-card">
          <div class="brand-mark">A</div>
          <p class="eyebrow">Private living systems library</p>
          <h1>ACES OS</h1>
          <p class="muted">See the system. Grab the handle. Run the next faithful protocol with our Father.</p>
          <form id="login-form" class="auth-form">
            <label class="field"><span>Email</span><input class="input" name="email" type="email" autocomplete="email" required placeholder="you@example.com" /></label>
            <label class="field"><span>Password</span><input class="input" name="password" type="password" autocomplete="current-password" required placeholder="Your password" /></label>
            <button class="primary" type="submit">Sign in</button>
            <button class="secondary" type="button" data-action="magic-link">Email me a magic link</button>
          </form>
          <p class="form-message">${escapeHtml(state.error)}</p>
          <p class="privacy">Protected by Supabase Auth and Row Level Security.</p>
        </section>
      </main>`;
  }

  function renderApp() {
    const selected = state.systems.find((system) => system.id === state.selectedId) || null;
    const content = state.view === 'practice'
      ? practiceView()
      : selected
        ? detailView(selected)
        : systemsView();

    app.innerHTML = `
      <div class="app-shell">
        <header class="topbar">
          <button class="brand" data-action="home"><span class="mark">A</span><span><b>ACES OS</b><small>Living systems</small></span></button>
          <div class="top-actions">
            <button class="icon-btn" data-action="theme" aria-label="Change theme">◐</button>
            <button class="icon-btn" data-action="sign-out" aria-label="Sign out">↪</button>
          </div>
        </header>
        <nav class="nav-switch" aria-label="ACES OS workspace">
          <button class="${state.view === 'systems' ? 'active' : ''}" data-action="show-systems">Systems</button>
          <button class="${state.view === 'practice' ? 'active' : ''}" data-action="show-practice">Practice</button>
        </nav>
        <main class="main">${state.error ? `<div class="reality"><span class="section-label">Could not load</span><p>${escapeHtml(state.error)}</p></div>` : content}</main>
        ${state.editorOpen ? editorModal() : ''}
        ${state.notice ? `<div class="notice">${escapeHtml(state.notice)}</div>` : ''}
      </div>`;
  }

  function systemsView() {
    const needle = state.query.trim().toLowerCase();
    const filtered = state.systems.filter((system) => {
      const categoryMatch = state.category === 'All' || system.category === state.category;
      const searchable = [
        system.title, system.one_line, system.when_to_grab, system.false_belief,
        system.paradigm, system.freedom_unlocked, system.truth, system.phrase,
        ...array(system.signals), ...array(system.protocol),
      ].join(' ').toLowerCase();
      return categoryMatch && (!needle || searchable.includes(needle));
    });
    const steps = state.systems.reduce((total, system) => total + array(system.protocol).length, 0);

    return `
      <div class="stack">
        <section class="hero">
          <div class="hero-icon">☰</div>
          <p class="eyebrow">The main library</p>
          <h1>Grab a handle.<br />Open the system.</h1>
          <p>ACES OS is a growing library of the systems ACE discovers with the Lord. Each system explains the paradigm, the warning signs, and the protocol to run in real life.</p>
          <div class="stats"><span><b>${state.systems.length}</b> living systems</span><span><b>${steps}</b> protocol steps</span><span>Saved in Supabase</span></div>
        </section>

        <section class="anchor-card">
          <span class="anchor-icon">⚓</span>
          <div><small>Non-negotiable center</small><h2>ACE’s identity is in the Lord.</h2><p>Every thought, emotion, role, circumstance, and system can receive distance. The Lord remains the closest point of identity.</p></div>
        </section>

        <section class="stack">
          <div class="heading"><div><p class="eyebrow">Systems library</p><h2>What system does ACE need?</h2></div><button class="new-button" data-action="new-system">＋ New system</button></div>
          <label class="search"><span>⌕</span><input id="system-search" value="${attr(state.query)}" placeholder="Search a feeling, pattern, or handle" /></label>
          <div class="filters">${categories.map((category) => `<button class="${state.category === category ? 'active' : ''}" data-category="${category}">${category}</button>`).join('')}</div>
        </section>

        ${state.loading ? '<section class="empty"><div class="loading-ring"></div></section>' : `
          <section class="grid">${filtered.map(systemCard).join('')}</section>
          ${filtered.length ? '' : '<section class="empty"><div><h3>No system found</h3><p>Try another word or category.</p></div></section>'}
        `}

        <section class="growth-card"><span class="anchor-icon">✦</span><div><small class="section-label">Built to keep growing</small><h2>New discoveries become new systems.</h2><p>New paradigms and protocols can be added here without rebuilding the app. The library now lives in Supabase.</p></div></section>
      </div>`;
  }

  function systemCard(system) {
    return `
      <button class="system-card" data-system-id="${attr(system.id)}">
        <span class="system-icon">${categoryIcons[system.category] || '◆'}</span>
        <span class="system-copy"><small>${escapeHtml(system.category)} system</small><b>${escapeHtml(system.title)}</b><p>${escapeHtml(system.one_line)}</p><em>${array(system.protocol).length}-step protocol</em></span>
        <span class="chev">›</span>
      </button>`;
  }

  function detailView(system) {
    const signals = array(system.signals);
    const protocol = array(system.protocol);
    const hebrew = system.hebrew && typeof system.hebrew === 'object' ? system.hebrew : null;
    return `
      <article class="stack">
        <div class="heading"><button class="back" data-action="back-systems">← All systems</button><button class="new-button" data-action="edit-system">Edit system</button></div>
        <section class="detail-hero">
          <div class="hero-icon">${categoryIcons[system.category] || '◆'}</div>
          <p class="eyebrow">${escapeHtml(system.category)} system</p>
          <h1>${escapeHtml(system.title)}</h1>
          <p>${escapeHtml(system.one_line)}</p>
          <div class="quote">“${escapeHtml(system.phrase)}”</div>
        </section>
        <section class="paradigms">
          ${paradigmCard('Old belief', system.false_belief, false)}
          ${paradigmCard('New paradigm', system.paradigm, true)}
          ${paradigmCard('Freedom unlocked', system.freedom_unlocked, false)}
        </section>
        <section class="section-card"><span class="section-label">Grab this handle when</span><h2>The system is becoming active</h2><p>${escapeHtml(system.when_to_grab)}</p><div class="signals">${signals.map((signal) => `<span>${escapeHtml(signal)}</span>`).join('')}</div></section>
        <section class="reality"><span class="section-label">Reality anchor</span><p>${escapeHtml(system.truth)}</p></section>
        <section class="protocol"><span class="section-label">Run this in reality</span><h2>${escapeHtml(system.title)} protocol</h2><ol>${protocol.map((step, index) => `<li><span>${index + 1}</span><p>${escapeHtml(step)}</p></li>`).join('')}</ol><button class="primary" data-action="show-practice">Open daily practice tools</button></section>
        <section class="anchors">
          ${hebrew ? `<div class="hebrew"><span lang="he" dir="rtl">${escapeHtml(hebrew.word)}</span><div><b>${escapeHtml(hebrew.transliteration)}</b><p>${escapeHtml(hebrew.meaning)}</p></div></div>` : '<div class="hebrew"><span>יָד</span><div><b>Yad</b><p>Hand or handle</p></div></div>'}
          <div class="scripture"><span class="section-label">Scripture anchor</span><p>${escapeHtml(system.scripture)}</p></div>
        </section>
      </article>`;
  }

  function paradigmCard(label, value, featured) {
    return `<section class="paradigm ${featured ? 'featured' : ''}"><span class="section-label">${label}</span><p>${escapeHtml(value)}</p></section>`;
  }

  function practiceView() {
    return `
      <div class="stack">
        <section class="hero"><div class="hero-icon">✓</div><p class="eyebrow">Daily application</p><h1>Run the system<br />in real life.</h1><p>The systems library explains the operating system. The practice tools help ACE record what is happening, release burdens, celebrate victories, and prepare for conversations.</p></section>
        <section class="practice-grid">
          ${practiceCard('Check In', 'Name the present system, energy level, body signals, and next faithful action.')}
          ${practiceCard('Backpack Release', 'Separate care from carrying and return the burden to our Father.')}
          ${practiceCard('Celebrate a Victory', 'Mark faithfulness with the Lord without waiting for outside applause.')}
          ${practiceCard('Conversation Preparation', 'Stay loving and clear without absorbing another person’s nervous system.')}
        </section>
        <a class="primary practice-link" href="${PRACTICE_URL}" target="_blank" rel="noopener">Open the existing practice dashboard ↗</a>
        <section class="anchor-card"><span class="anchor-icon">ℹ</span><div><small>Preserved, not replaced</small><h2>Your saved nodes remain in Supabase.</h2><p>The existing dashboard continues to hold your check-ins, releases, victories, and conversations while the systems library becomes the main doorway.</p></div></section>
      </div>`;
  }

  function practiceCard(title, copy) {
    return `<section class="practice-card"><span class="section-label">Practice tool</span><h2>${title}</h2><p>${copy}</p></section>`;
  }

  function editorModal() {
    const system = state.systems.find((item) => item.id === state.editingId) || {};
    const isEdit = Boolean(system.id);
    return `
      <div class="modal-backdrop" data-action="close-editor">
        <section class="modal" role="dialog" aria-modal="true" aria-label="${isEdit ? 'Edit' : 'Add'} ACES OS system" data-modal>
          <div class="modal-head"><div><p class="eyebrow">Living systems library</p><h2>${isEdit ? 'Edit system' : 'Add a new system'}</h2></div><button class="close" type="button" data-action="close-editor">×</button></div>
          <form id="system-form" class="form-grid" data-editing-id="${attr(system.id || '')}">
            <div class="two">
              <label class="field"><span>System name</span><input class="input" name="title" required value="${attr(system.title || '')}" /></label>
              <label class="field"><span>Category</span><select class="input" name="category">${categories.slice(1).map((item) => `<option ${system.category === item ? 'selected' : ''}>${item}</option>`).join('')}</select></label>
            </div>
            <label class="field"><span>One-line handle</span><textarea class="input textarea" name="one_line" required>${escapeHtml(system.one_line || '')}</textarea></label>
            <label class="field"><span>Grab this when</span><textarea class="input textarea" name="when_to_grab" required>${escapeHtml(system.when_to_grab || '')}</textarea></label>
            <label class="field"><span>Old belief</span><textarea class="input textarea" name="false_belief" required>${escapeHtml(system.false_belief || '')}</textarea></label>
            <label class="field"><span>New paradigm</span><textarea class="input textarea" name="paradigm" required>${escapeHtml(system.paradigm || '')}</textarea></label>
            <label class="field"><span>Freedom unlocked</span><textarea class="input textarea" name="freedom_unlocked" required>${escapeHtml(system.freedom_unlocked || '')}</textarea></label>
            <label class="field"><span>Warning signals, one per line</span><textarea class="input textarea" name="signals" required>${escapeHtml(array(system.signals).join('\n'))}</textarea></label>
            <label class="field"><span>Reality anchor</span><textarea class="input textarea" name="truth" required>${escapeHtml(system.truth || '')}</textarea></label>
            <label class="field"><span>Protocol steps, one per line</span><textarea class="input textarea" name="protocol" required>${escapeHtml(array(system.protocol).join('\n'))}</textarea></label>
            <label class="field"><span>Short phrase</span><input class="input" name="phrase" required value="${attr(system.phrase || '')}" /></label>
            <label class="field"><span>Scripture anchor</span><textarea class="input textarea" name="scripture" required>${escapeHtml(system.scripture || '')}</textarea></label>
            <button class="primary" type="submit">${isEdit ? 'Save system changes' : 'Add system to ACES OS'}</button>
          </form>
        </section>
      </div>`;
  }

  async function login(form) {
    state.error = '';
    const data = new FormData(form);
    const { error } = await client.auth.signInWithPassword({
      email: String(data.get('email') || '').trim(),
      password: String(data.get('password') || ''),
    });
    if (error) {
      state.error = error.message;
      render();
    }
  }

  async function magicLink() {
    const email = document.querySelector('[name=email]')?.value?.trim();
    if (!email) {
      state.error = 'Enter your email first.';
      render();
      return;
    }
    const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.href.split('#')[0] } });
    state.error = error ? error.message : 'Magic link sent. Check your email.';
    render();
  }

  async function saveSystem(form) {
    const values = new FormData(form);
    const editingId = form.dataset.editingId;
    const lines = (name) => String(values.get(name) || '').split('\n').map((item) => item.trim()).filter(Boolean);
    const payload = {
      title: String(values.get('title') || '').trim(),
      category: String(values.get('category') || 'Awareness'),
      one_line: String(values.get('one_line') || '').trim(),
      when_to_grab: String(values.get('when_to_grab') || '').trim(),
      false_belief: String(values.get('false_belief') || '').trim(),
      paradigm: String(values.get('paradigm') || '').trim(),
      freedom_unlocked: String(values.get('freedom_unlocked') || '').trim(),
      signals: lines('signals'),
      truth: String(values.get('truth') || '').trim(),
      protocol: lines('protocol'),
      phrase: String(values.get('phrase') || '').trim(),
      scripture: String(values.get('scripture') || '').trim(),
      status: 'active',
    };
    let result;
    if (editingId) {
      result = await client.from('aces_systems').update(payload).eq('id', editingId);
    } else {
      result = await client.from('aces_systems').insert({
        ...payload,
        id: slugify(payload.title),
        user_id: state.session.user.id,
        sort_order: state.systems.length + 1,
      });
    }
    if (result.error) {
      state.error = result.error.message;
      render();
      return;
    }
    state.editorOpen = false;
    state.editingId = null;
    await loadSystems();
    if (editingId) state.selectedId = editingId;
    setNotice(editingId ? 'System updated.' : 'New system added to ACES OS.');
  }

  document.addEventListener('click', async (event) => {
    const target = event.target.closest('button,[data-system-id],[data-category]');
    if (!target) return;

    if (target.dataset.systemId) {
      state.selectedId = target.dataset.systemId;
      state.view = 'systems';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      render();
      return;
    }
    if (target.dataset.category) {
      state.category = target.dataset.category;
      render();
      return;
    }

    const action = target.dataset.action;
    if (!action) return;
    if (action === 'magic-link') return magicLink();
    if (action === 'home' || action === 'show-systems') {
      state.view = 'systems'; state.selectedId = null; render(); return;
    }
    if (action === 'show-practice') {
      state.view = 'practice'; state.selectedId = null; render(); return;
    }
    if (action === 'back-systems') {
      state.selectedId = null; render(); return;
    }
    if (action === 'new-system') {
      state.editingId = null; state.editorOpen = true; render(); return;
    }
    if (action === 'edit-system') {
      state.editingId = state.selectedId; state.editorOpen = true; render(); return;
    }
    if (action === 'close-editor') {
      if (event.target.closest('[data-modal]') && !event.target.classList.contains('close')) return;
      state.editorOpen = false; state.editingId = null; render(); return;
    }
    if (action === 'theme') {
      const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      document.documentElement.dataset.theme = next;
      localStorage.setItem('aces-theme', next);
      return;
    }
    if (action === 'sign-out') {
      await client.auth.signOut();
    }
  });

  document.addEventListener('input', (event) => {
    if (event.target.id === 'system-search') {
      state.query = event.target.value;
      const position = event.target.selectionStart;
      render();
      const input = document.getElementById('system-search');
      input?.focus();
      input?.setSelectionRange(position, position);
    }
  });

  document.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (event.target.id === 'login-form') return login(event.target);
    if (event.target.id === 'system-form') return saveSystem(event.target);
  });

  async function initialize() {
    const theme = localStorage.getItem('aces-theme');
    document.documentElement.dataset.theme = theme === 'light' ? 'light' : 'dark';
    const { data } = await client.auth.getSession();
    state.session = data.session;
    state.loading = false;
    if (state.session) await loadSystems();
    else render();
    client.auth.onAuthStateChange(async (_event, session) => {
      state.session = session;
      state.error = '';
      if (session) await loadSystems();
      else {
        state.systems = [];
        state.selectedId = null;
        state.view = 'systems';
        render();
      }
    });
  }

  initialize().catch((error) => {
    state.loading = false;
    state.error = error instanceof Error ? error.message : 'ACES OS could not open.';
    render();
  });
})();
