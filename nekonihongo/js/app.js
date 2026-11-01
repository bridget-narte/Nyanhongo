(function () {
  const S = NekoStorage, G = NekoGame;
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Change this one line to rename the app everywhere.
  const APP_NAME = 'NekoNihongo';

  const MODS = {
    particles: { label: 'Particle Practice', jp: 'は', color: 'var(--secondary)', dark: true, desc: 'Pick the right は, が, を, に, で…', coming: 'Fill-in-the-particle quizzes with explanations, comparison mode and mistake review.' },
    grammar:   { label: 'Grammar Practice', jp: '文', color: 'var(--primary)', dark: true, desc: 'JLPT N4 patterns with examples and quizzes.', coming: 'Grammar lessons by category plus the quiz engine (multiple choice, fill-in, ordering).' },
    verbs:     { label: 'Verb Conjugation', jp: '動', color: 'var(--accent-blue)', desc: 'Godan, ichidan and irregular verbs.', coming: 'A rule-based conjugation engine with hints, timed mode and a reference table.' },
    kanji:     { label: 'Kanji Flashcards', jp: '漢', color: 'var(--accent-yellow)', desc: '300 kanji with readings and sentences.', coming: 'The 300-kanji deck, flip cards, filters, search and spaced review.' },
    vocab:     { label: 'Vocabulary', jp: '語', color: 'var(--accent-green)', desc: 'Everyday words by topic.', coming: 'Topic-based vocabulary with four practice modes and bookmarks.' },
    daily:     { label: 'Daily Challenge', jp: '毎', color: 'linear-gradient(135deg,var(--secondary),var(--primary))', dark: true, desc: 'A fresh mixed set every day.', coming: 'A date-seeded mixed quiz with a one-time bonus reward.' }
  };
  const NAV = [
    ['home', 'Home', '家'], ['grammar', 'Grammar', '文'], ['particles', 'Particles', 'は'], ['verbs', 'Verb Lab', '動'],
    ['kanji', 'Kanji Cards', '漢'], ['vocab', 'Vocabulary', '語'], ['daily', 'Daily Challenge', '毎'],
    ['progress', 'Progress', '進'], ['settings', 'Settings', '設']
  ];
  const PLAN = ['particles', 'grammar', 'verbs', 'kanji', 'vocab', 'daily'];

  let data = S.loadUserData();
  let view = 'home';
  let chartMetric = 'questions';

  // Placeholder cat. Swap this function for a real illustration later.
  const mascot = () => `<svg viewBox="0 0 100 100" aria-hidden="true">
    <path d="M16 42 22 8 46 26Z" fill="#fff"/><path d="M84 42 78 8 54 26Z" fill="#fff"/>
    <path d="M25 33 27 20 37 28Z" fill="#F36DBB"/><path d="M75 33 73 20 63 28Z" fill="#F36DBB"/>
    <ellipse cx="50" cy="58" rx="38" ry="33" fill="#fff"/>
    <circle cx="36" cy="55" r="4.5" fill="#292536"/><circle cx="64" cy="55" r="4.5" fill="#292536"/>
    <circle cx="34.5" cy="53.5" r="1.4" fill="#fff"/><circle cx="62.5" cy="53.5" r="1.4" fill="#fff"/>
    <ellipse cx="25" cy="66" rx="6" ry="4" fill="#F36DBB" opacity=".35"/><ellipse cx="75" cy="66" rx="6" ry="4" fill="#F36DBB" opacity=".35"/>
    <path d="M46 63h8l-4 5Z" fill="#F36DBB"/><path d="M50 68q-5 7-10 3M50 68q5 7 10 3" stroke="#292536" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;

  // ---------- helpers ----------
  function toast(msg, kind) {
    const t = document.createElement('div');
    t.className = 'toast ' + (kind || '');
    t.textContent = msg;
    $('#toasts').appendChild(t);
    setTimeout(() => t.remove(), 2800);
  }
  function confirmDialog(title, text, okLabel) {
    return new Promise(resolve => {
      const dlg = $('#dialog');
      $('#dlgTitle').textContent = title; $('#dlgText').textContent = text; $('#dlgOk').textContent = okLabel;
      const done = v => { dlg.close(); $('#dlgOk').onclick = $('#dlgCancel').onclick = null; resolve(v); };
      $('#dlgOk').onclick = () => done(true); $('#dlgCancel').onclick = () => done(false);
      dlg.showModal();
    });
  }
  // Run a change to saved data, save it, announce level-ups, redraw.
  function mutate(fn) {
    const before = G.levelInfo(data.xp).level;
    fn();
    S.saveUserData(data);
    const after = G.levelInfo(data.xp).level;
    if (after > before) toast('Level up! You reached Level ' + after, 'win');
    render();
  }

  // ---------- chrome ----------
  function renderNav() {
    $('#nav').innerHTML = NAV.map(([id, label, jp]) =>
      `<button class="nav-btn ${id === view ? 'active' : ''}" data-go="${id}" ${id === view ? 'aria-current="page"' : ''}><span class="ic">${jp}</span>${label}</button>`).join('');
  }
  function renderTopbar() {
    const lv = G.levelInfo(data.xp), streak = G.currentStreak(data);
    $('#topbar').innerHTML = `
      <div class="greet">${mascot()}<div>
        <h1><span class="jp">おかえり！</span> ${esc(data.profile.name)}</h1>
        <p>Let's study Japanese!</p></div></div>
      <div class="chips">
        <div class="chip"><small>Level</small>${lv.level}</div>
        <div class="chip"><small>XP</small>${lv.xp}</div>
        <div class="chip"><small>Streak</small>${streak} day${streak === 1 ? '' : 's'}</div>
        <div class="lvl" title="${lv.toNext} XP to level ${lv.level + 1}"><div class="xpbar"><i style="width:${lv.pct}%"></i></div>${lv.toNext} XP to Level ${lv.level + 1}</div>
        <button class="btn ghost" data-go="settings">Profile</button>
      </div>`;
  }

  // ---------- views ----------
  function chart() {
    const week = G.weekData(data), max = chartMetric === 'accuracy' ? 100 : Math.max(1, ...week.map(d => d[chartMetric]));
    const unit = chartMetric === 'accuracy' ? '%' : '';
    return `<div class="chart" role="img" aria-label="Last 7 days of ${chartMetric}">` + week.map(d =>
      `<div class="col ${d.isToday ? 'today' : ''}"><span class="v">${d[chartMetric]}${unit}</span><div class="b" style="height:${Math.round((d[chartMetric] / max) * 100)}%"></div>${d.label}</div>`).join('') + '</div>';
  }
  function chartPanel() {
    const opts = [['questions', 'Questions answered'], ['sessions', 'Study sessions'], ['accuracy', 'Accuracy'], ['xp', 'XP earned']];
    return `<div class="panel"><div class="sec-title" style="margin-top:0"><h2>This week</h2>
      <select id="metric" aria-label="Chart metric">${opts.map(([v, l]) => `<option value="${v}" ${v === chartMetric ? 'selected' : ''}>${l}</option>`).join('')}</select></div>${chart()}</div>`;
  }
  function planCard(id) {
    const m = MODS[id], st = data.modules[id] || { answered: 0, correct: 0 }, acc = G.accuracy(st);
    const doneToday = G.dayRecord(data).mods[id];
    return `<article class="card ${m.dark ? 'dark' : ''}" style="--c:${m.color};background:${m.color}">
      <span class="glyph" aria-hidden="true">${m.jp}</span><h3>${m.label}</h3><p>${m.desc}</p>
      <div class="bar" aria-label="Accuracy ${acc}%"><i style="width:${acc}%"></i></div>
      <div class="meta">${st.answered} answered · ${acc}% correct</div>
      <button class="btn" data-go="${id}">${st.answered ? 'Continue' : 'Start'}</button>
      ${doneToday ? '<span class="done-badge">Done today</span>' : ''}</article>`;
  }
  function viewHome() {
    const today = G.dayRecord(data), doneCount = PLAN.filter(id => today.mods[id]).length;
    const last = data.lastModule && MODS[data.lastModule];
    return `
      ${last ? `<div class="panel row" style="align-items:center;justify-content:space-between"><div><b>Pick up where you left off</b><div class="note">${last.label}</div></div><button class="btn primary" data-go="${data.lastModule}">Continue</button></div>` : ''}
      <div class="sec-title"><h2>Today's learning plan</h2><span>${doneCount} / ${PLAN.length} activities done today</span></div>
      <div class="grid">${PLAN.map(planCard).join('')}</div>
      <div class="sec-title"><h2>Your progress</h2></div>
      <div class="two">${statsPanel()}${chartPanel()}</div>`;
  }
  function totals() {
    const mods = Object.values(data.modules);
    const answered = mods.reduce((a, m) => a + m.answered, 0), correct = mods.reduce((a, m) => a + m.correct, 0);
    return { answered, correct, sessions: mods.reduce((a, m) => a + m.sessions, 0), acc: answered ? Math.round(correct / answered * 100) : 0 };
  }
  function statsPanel() {
    const t = totals(), acc = id => G.accuracy(data.modules[id]) + '%';
    const known = Object.values(data.kanji).filter(k => k.status === 'known').length;
    const words = Object.values(data.vocab).filter(v => v.status === 'known').length;
    const rows = [['Overall accuracy', t.acc + '%'], ['Grammar accuracy', acc('grammar')], ['Particle accuracy', acc('particles')],
      ['Verb accuracy', acc('verbs')], ['Kanji known', known + ' / 300'], ['Vocabulary known', words], ['Best streak', data.streak.best + ' days'], ['Total XP', data.xp]];
    return `<div class="panel"><h2 style="margin-bottom:8px">Stats</h2>${rows.map(([a, b]) => `<div class="stat-row"><span>${a}</span><b>${b}</b></div>`).join('')}</div>`;
  }
  function viewModule(id) {
    const m = MODS[id];
    return `<div class="panel"><h2>${m.label} <span class="tag">Phase 2</span></h2>
      <p>${m.coming}</p><p class="note">This lesson isn't built yet. Use the buttons below to test XP, levels, streaks and the weekly chart.</p>
      <div class="row">
        <button class="btn primary" data-sim="correct" data-mod="${id}">Answer correct (+${G.CONFIG.rewards.correct} XP)</button>
        <button class="btn ghost" data-sim="wrong" data-mod="${id}">Answer wrong</button>
        <button class="btn ghost" data-sim="session" data-mod="${id}">Finish session (+${G.CONFIG.rewards.session} XP)</button>
      </div></div>`;
  }
  function viewProgress() {
    const t = totals();
    const rows = Object.keys(MODS).map(id => {
      const st = data.modules[id] || { answered: 0, correct: 0, sessions: 0 }, acc = G.accuracy(st);
      return `<div style="margin-bottom:14px"><div class="stat-row" style="border:0;padding-bottom:0"><span>${MODS[id].label}</span><b>${st.answered} answered · ${acc}% correct</b></div>
        <div class="mini-bar" aria-label="${acc}% correct"><i style="width:${acc}%"></i></div></div>`;
    }).join('');
    return `<div class="two"><div class="panel"><h2 style="margin-bottom:8px">Totals</h2>
      <div class="stat-row"><span>Study sessions</span><b>${t.sessions}</b></div>
      <div class="stat-row"><span>Questions answered</span><b>${t.answered}</b></div>
      <div class="stat-row"><span>Overall accuracy</span><b>${t.acc}%</b></div>
      <div class="stat-row"><span>Current streak</span><b>${G.currentStreak(data)} days</b></div>
      <div class="stat-row"><span>Total XP</span><b>${data.xp}</b></div>
      <p class="note">Mastery tracking (spaced review) arrives with the flashcards in Phase 2. Opening a card will never count as mastery.</p></div>
      <div class="panel"><h2 style="margin-bottom:12px">By activity</h2>${rows}</div></div>
      <div style="margin-top:16px">${chartPanel()}</div>`;
  }
  function viewSettings() {
    const p = data.profile;
    return `<div class="two"><div class="panel"><h2 style="margin-bottom:14px">Profile</h2>
      <label class="field">Display name<input type="text" maxlength="24" data-setting="name" value="${esc(p.name)}"></label>
      <label class="field">Daily XP goal<input type="number" min="10" max="1000" step="10" data-setting="dailyGoal" value="${p.dailyGoal}"></label>
      <label class="field">Session length (questions)<input type="number" min="5" max="50" data-setting="sessionLength" value="${p.sessionLength}"></label>
      <label class="check"><input type="checkbox" data-setting="sound" ${p.sound ? 'checked' : ''}>Sound effects <span class="note">(saved; sounds come later)</span></label>
      <label class="check"><input type="checkbox" data-setting="animations" ${p.animations ? 'checked' : ''}>Animations</label>
      <label class="check"><input type="checkbox" data-setting="furigana" ${p.furigana ? 'checked' : ''}>Show furigana <span class="note">(used once lessons exist)</span></label></div>
      <div class="panel"><h2 style="margin-bottom:8px">Your data</h2>
      <p class="note">Everything is stored only in this browser. Nothing is sent anywhere.</p>
      <div class="row"><button class="btn primary" data-act="export">Export progress</button>
      <button class="btn ghost" data-act="import">Import progress</button>
      <button class="btn danger" data-act="reset">Reset progress</button></div></div></div>`;
  }

  // ---------- render + routing ----------
  function render() {
    document.body.classList.toggle('no-anim', !data.profile.animations);
    $('#brandMascot').innerHTML = mascot();
    $('#brandName').textContent = APP_NAME;
    document.title = APP_NAME;
    renderNav(); renderTopbar();
    $('#view').innerHTML = view === 'home' ? viewHome() : view === 'progress' ? viewProgress() : view === 'settings' ? viewSettings() : view === 'grammar' && window.NekoGrammar ? NekoGrammar.view() : view === 'particles' && window.NekoParticles ? NekoParticles.view() : viewModule(view);
  }
  function go(id) {
    view = id;
    if (MODS[id]) { data.lastModule = id; S.saveUserData(data); }
    closeMenu(); render(); window.scrollTo(0, 0);
  }
  function closeMenu() { $('#sidebar').classList.remove('open'); $('#scrim').classList.remove('open'); }

  // ---------- events ----------
  document.addEventListener('click', async e => {
    const goBtn = e.target.closest('[data-go]');
    if (goBtn) return go(goBtn.dataset.go);

    const sim = e.target.closest('[data-sim]');
    if (sim) {
      const mod = sim.dataset.mod, kind = sim.dataset.sim;
      if (kind === 'session') { mutate(() => G.recordSession(data, mod)); toast('+' + G.CONFIG.rewards.session + ' XP for finishing a session'); }
      else { mutate(() => G.recordAnswer(data, mod, kind === 'correct')); toast(kind === 'correct' ? '+' + G.CONFIG.rewards.correct + ' XP' : 'Not quite. Try again!', kind === 'correct' ? '' : 'err'); }
      return;
    }
    const act = e.target.closest('[data-act]');
    if (!act) return;
    if (act.dataset.act === 'export') {
      const url = URL.createObjectURL(new Blob([S.exportProgress(data)], { type: 'application/json' }));
      const a = Object.assign(document.createElement('a'), { href: url, download: 'nekonihongo-progress-' + G.dateKey() + '.json' });
      a.click(); URL.revokeObjectURL(url); toast('Progress exported');
    } else if (act.dataset.act === 'import') {
      $('#importFile').click();
    } else if (act.dataset.act === 'reset') {
      if (await confirmDialog('Reset all progress?', 'This erases your XP, streak and history in this browser. Export first if you want a backup.', 'Reset')) {
        data = S.resetProgress(); S.saveUserData(data); render(); toast('Progress reset');
      }
    }
  });

  document.addEventListener('change', e => {
    if (e.target.id === 'metric') { chartMetric = e.target.value; return render(); }
    const key = e.target.dataset.setting;
    if (!key) return;
    const el = e.target;
    let v = el.type === 'checkbox' ? el.checked : el.type === 'number' ? Number(el.value) : el.value.trim();
    if (key === 'name' && !v) v = 'Learner';
    if (el.type === 'number') v = Math.min(Number(el.max), Math.max(Number(el.min), v || Number(el.min)));
    data.profile[key] = v;
    S.saveUserData(data); render();
  });

  $('#importFile').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const r = S.importProgress(String(reader.result));
      if (!r.ok) return toast(r.error, 'err');
      data = r.data; S.saveUserData(data); render(); toast('Progress imported');
    };
    reader.onerror = () => toast('Could not read that file.', 'err');
    reader.readAsText(file);
    e.target.value = '';
  });

  $('#menuBtn').addEventListener('click', () => { $('#sidebar').classList.add('open'); $('#scrim').classList.add('open'); });
  $('#scrim').addEventListener('click', closeMenu);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  // Small API that tab modules (like grammar.js) use.
  window.NekoApp = { render, mutate, toast, esc, data: () => data };

  render();
})();
