// Grammar tab UI. Draws screens and wires clicks; rules live in quiz-engine.js, content in grammar-data.js.
(function () {
  const L = NekoGrammarData.lessons, Q = NekoGrammarData.questions;
  const E = s => NekoApp.esc(s), D = () => NekoApp.data();
  const cats = [...new Set(L.map(l => l.category))];
  const byId = id => L.find(l => l.id === id);
  let st = { screen: 'library', query: '', cat: 'all', lessonId: null, quiz: null };

  const problems = NekoQuiz.validate(Q);
  if (problems.length) console.warn('Grammar data problems:', problems);
  else console.info('Grammar data OK: ' + L.length + ' patterns, ' + Q.length + ' questions.');

  const show = () => { NekoApp.render(); window.scrollTo(0, 0); };

  // ---------- screens ----------
  function listHTML() {
    const q = st.query.trim().toLowerCase();
    const items = L.filter(l => (st.cat === 'all' || l.category === st.cat) && (!q || (l.pattern + l.meaning + l.category).toLowerCase().includes(q)));
    if (!items.length) return '<p class="note">No patterns match. Try another word or category.</p>';
    return cats.filter(c => items.some(l => l.category === c)).map(c =>
      `<h3 class="g-cat">${E(c)}</h3><div class="grid">` + items.filter(l => l.category === c).map(l =>
        `<article class="card g-card"><h3 class="jp">${E(l.pattern)}</h3><p>${E(l.meaning)}</p>
         <button class="btn primary" data-g="open" data-id="${l.id}">Study</button></article>`).join('') + '</div>').join('');
  }
  function libraryHTML() {
    const chip = (v, label) => `<button class="chip-btn ${st.cat === v ? 'on' : ''}" data-g="cat" data-v="${E(v)}">${E(label)}</button>`;
    return `<div class="panel"><div class="row" style="justify-content:space-between;align-items:center">
      <div><h2>Grammar library</h2><p class="note">${L.length} patterns · ${Q.length} practice questions</p></div>
      <button class="btn primary" data-g="mixed">Mixed quiz</button></div>
      <input id="gSearch" class="g-input" type="search" placeholder="Search patterns or meanings" aria-label="Search grammar" value="${E(st.query)}">
      <div class="row">${chip('all', 'All')}${cats.map(c => chip(c, c)).join('')}</div></div>
      <div id="gList">${listHTML()}</div>`;
  }
  function lessonHTML() {
    const l = byId(st.lessonId), n = Q.filter(q => q.lessonId === l.id).length;
    const rel = l.related.map(byId).filter(Boolean).map(r => `<button class="chip-btn" data-g="open" data-id="${r.id}">${E(r.pattern)}</button>`).join('');
    return `<button class="btn ghost" data-g="back">← Library</button>
      <div class="panel g-lesson"><span class="tag">${E(l.category)}</span><h2 class="jp g-pattern">${E(l.pattern)}</h2><p class="g-meaning">${E(l.meaning)}</p>
      <h3>How to form it</h3><p>${E(l.formation)}</p><h3>When to use it</h3><p>${E(l.usage)}</p>
      <div class="g-example"><div class="jp g-jp">${E(l.example.jp)}</div>${D().profile.furigana ? `<div class="jp note">${E(l.example.kana)}</div>` : ''}<div>${E(l.example.en)}</div></div>
      <h3>Common mistakes</h3><p>${E(l.mistakes)}</p>${rel ? `<h3>Compare with</h3><div class="row">${rel}</div>` : ''}
      <div style="margin-top:18px"><button class="btn primary" data-g="practice" data-id="${l.id}">Practice (${n} questions)</button></div></div>`;
  }
  function quizHTML() {
    const z = st.quiz, s = z.s, q = s.questions[s.index], n = s.questions.length, a = z.answered;
    const pct = Math.round(((s.index + (a ? 1 : 0)) / n) * 100);
    let body = '';
    if (q.kind === 'mc') {
      body = '<div class="opts">' + q.options.map((o, i) => {
        const cls = a ? (o === q.answer ? 'right' : o === a.response ? 'wrong' : '') : '';
        return `<button class="opt ${cls}" data-g="pick" data-i="${i}" ${a ? 'disabled' : ''}><b>${'ABCD'[i]}</b><span class="jp">${E(o)}</span></button>`;
      }).join('') + '</div>';
    } else if (q.kind === 'text') {
      body = `<div class="row"><input id="gText" class="g-input jp"${NekoKana.attr()} autocomplete="off" aria-label="Your answer" placeholder="Type in Japanese" ${a ? `disabled value="${E(a.response)}"` : ''}>
        ${a ? '' : '<button class="btn primary" data-g="check">Check</button>'}</div>
        <div class="row" style="margin-top:10px">${NekoKana.toggle(!!a)}</div>${NekoKana.panel('gText', !!a)}`;
    } else {
      const pool = q.tiles.map((t, i) => z.picked.includes(i) ? '' : `<button class="tile jp" data-g="tile" data-i="${i}" ${a ? 'disabled' : ''}>${E(t)}</button>`).join('');
      const line = z.picked.map(i => `<button class="tile jp on" data-g="untile" data-i="${i}" ${a ? 'disabled' : ''}>${E(q.tiles[i])}</button>`).join('');
      body = `<div class="line" aria-label="Your sentence">${line || '<span class="note">Tap the pieces in order</span>'}</div><div class="tiles">${pool}</div>
        ${a ? '' : `<button class="btn primary" data-g="check" ${z.picked.length === q.tiles.length ? '' : 'disabled'}>Check</button>`}`;
    }
    const fb = a ? `<div class="fb ${a.correct ? 'ok' : 'no'}" role="status"><b>${a.correct ? 'Correct!' : 'Not quite.'}</b>
      ${a.correct ? '' : `<div>Answer: <span class="jp">${E(NekoQuiz.displayAnswer(q))}</span></div>`}<p>${E(q.explanation)}</p></div>
      <button class="btn primary" data-g="next">${s.index + 1 < n ? 'Next question' : 'See results'}</button>` : '';
    return `<div class="panel g-quiz"><div class="row" style="justify-content:space-between"><b>Question ${s.index + 1} of ${n}</b><span class="tag">${E(q.mode)}</span></div>
      <div class="mini-bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>
      <h2 class="g-q jp">${E(q.q)}</h2>${body}${fb}</div>`;
  }
  function resultHTML() {
    const z = st.quiz, r = NekoQuiz.summary(z.s);
    const miss = r.mistakes.map(m => `<div class="fb no"><div class="jp"><b>${E(m.q.q)}</b></div><div>Answer: <span class="jp">${E(NekoQuiz.displayAnswer(m.q))}</span></div><p>${E(m.q.explanation)}</p></div>`).join('');
    return `<div class="panel g-result"><h2>${r.pct >= 80 ? 'Great work!' : r.pct >= 50 ? 'Nice try!' : 'Keep practicing!'}</h2>
      <div class="g-score">${r.correct} / ${r.total}</div>
      <div class="row"><span class="chip"><small>Accuracy</small>${r.pct}%</span><span class="chip"><small>Correct</small>${r.correct}</span><span class="chip"><small>Incorrect</small>${r.wrong}</span><span class="chip"><small>XP earned</small>+${z.xp}</span></div>
      ${miss ? `<h3 style="margin-top:20px">Review your mistakes</h3>${miss}` : '<p>No mistakes. Perfect!</p>'}
      <div class="row" style="margin-top:18px"><button class="btn primary" data-g="retry">Retry</button><button class="btn ghost" data-g="back">Back to library</button></div></div>`;
  }
  function view() {
    return st.screen === 'lesson' ? lessonHTML() : st.screen === 'quiz' ? quizHTML() : st.screen === 'result' ? resultHTML() : libraryHTML();
  }

  // ---------- quiz flow ----------
  function start(pool) {
    st.quiz = { pool, s: NekoQuiz.createSession(pool), answered: null, picked: [], xpStart: D().xp, xp: 0 };
    st.screen = 'quiz'; show();
  }
  function submit(resp) {
    const z = st.quiz;
    if (z.answered) return;
    const q = z.s.questions[z.s.index], ok = NekoQuiz.evaluate(q, resp);
    NekoQuiz.record(z.s, q, resp, ok);
    z.answered = { response: resp, correct: ok };
    NekoApp.mutate(() => NekoGame.recordAnswer(D(), 'grammar', ok));
  }
  function next() {
    const z = st.quiz;
    if (z.s.index + 1 < z.s.questions.length) { z.s.index++; z.answered = null; z.picked = []; return show(); }
    st.screen = 'result';
    NekoApp.mutate(() => { NekoGame.recordSession(D(), 'grammar'); z.xp = D().xp - z.xpStart; });
    window.scrollTo(0, 0);
  }

  // ---------- events ----------
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-g]');
    if (!b) return;
    const z = st.quiz, q = z && st.screen === 'quiz' ? z.s.questions[z.s.index] : null, i = Number(b.dataset.i);
    switch (b.dataset.g) {
      case 'open': st.lessonId = b.dataset.id; st.screen = 'lesson'; return show();
      case 'back': st.screen = 'library'; return show();
      case 'cat': st.cat = b.dataset.v; return NekoApp.render();
      case 'practice': return start(Q.filter(x => x.lessonId === b.dataset.id));
      case 'mixed': return start(NekoQuiz.shuffle(Q).slice(0, Math.min(Q.length, D().profile.sessionLength)));
      case 'retry': return start(z.pool);
      case 'pick': return submit(q.options[i]);
      case 'tile': z.picked.push(i); return NekoApp.render();
      case 'untile': z.picked = z.picked.filter(x => x !== i); return NekoApp.render();
      case 'check': return submit(q.kind === 'text' ? document.getElementById('gText').value : z.picked.map(x => q.tiles[x]));
      case 'next': return next();
    }
  });
  document.addEventListener('input', e => {
    if (e.target.id === 'gSearch') { st.query = e.target.value; document.getElementById('gList').innerHTML = listHTML(); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.id === 'gText' && !e.target.disabled && e.target.value.trim()) submit(e.target.value);
  });

  window.NekoGrammar = { view };
})();