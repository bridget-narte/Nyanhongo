// Verb Lab UI. Rules: conjugation.js. Verbs: verb-data.js. Quiz sessions: quiz-engine.js. Saved stats: data.verbs.
(function () {
  const C = NekoConj, V = NekoVerbData.verbs, F = C.FORMS, G = NekoGame;
  const E = s => NekoApp.esc(s), D = () => NekoApp.data();
  const TIMED = 90; // seconds for the Timed Challenge
  let st = { screen: 'home', quiz: null, ref: V[0].id };
  let tick = null;
  const vById = id => V.find(v => v.id === id), fById = id => F.find(f => f.id === id);
  const fmt = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  const focus = () => setTimeout(() => { const i = document.getElementById('vAns'); if (i && !i.disabled) i.focus(); }, 0);
  const show = () => { NekoApp.render(); window.scrollTo(0, 0); focus(); };
  const spell = c => c.kanji === c.kana ? c.kanji : c.kanji + ' (' + c.kana + ')';

  // Questions are generated from the engine, not stored as fixed strings.
  function mkQ(v, form) {
    const a = C.answers(v, form), dict = form === 'dictionary';
    return { id: v.id + '|' + form, kind: 'text', mode: 'Verb Lab', verb: v, form, main: a.main, variants: a.variants, accept: a.main.concat(a.variants),
      shown: dict ? C.conjugate(v, 'masu') : { kanji: v.kanji, kana: v.kana }, shownLabel: dict ? 'Verb (ます form)' : 'Verb',
      q: 'Write the ' + fById(form).label, explanation: C.explain(v, form), category: v.group, difficulty: v.group === 'irregular' ? 'hard' : v.group === 'godan' ? 'medium' : 'easy', xp: 10 };
  }
  const pairs = (vs, fs) => { const r = []; vs.forEach(v => fs.forEach(f => { if (C.supports(v, f.id)) r.push([v, f.id]); })); return r; };
  const pick = (ps, n) => NekoQuiz.shuffle(ps).slice(0, n).map(p => mkQ(p[0], p[1]));
  const validMistakes = () => { const m = D().verbs.mistakes; return Object.keys(m).filter(id => { const [vid, f] = id.split('|'); const v = vById(vid); return v && fById(f) && C.supports(v, f); }); };

  function pool(mode, arg) {
    const n = D().profile.sessionLength;
    if (mode === 'random') return { qs: pick(pairs(V, F), n) };
    if (mode === 'timed') return { qs: pick(pairs(V, F), 60) };
    if (mode === 'group') return { qs: pick(pairs(V.filter(v => v.group === arg), F), n) };
    if (mode === 'form') return { qs: pick(pairs(V, F.filter(f => f.id === arg)), n) };
    const m = D().verbs.mistakes; // mistakes: most missed first
    return { qs: validMistakes().sort((a, b) => m[b].count - m[a].count).slice(0, n).map(id => mkQ(vById(id.split('|')[0]), id.split('|')[1])), keep: true };
  }

  // ---------- screens ----------
  function homeHTML() {
    const stats = D().verbs.stats, nm = validMistakes().length;
    const weak = F.map(f => ({ f, s: stats[f.id] })).filter(x => x.s && x.s.seen >= 2 && x.s.correct / x.s.seen < 0.7).sort((a, b) => a.s.correct / a.s.seen - b.s.correct / b.s.seen).slice(0, 4);
    const rows = F.map(f => { const s = stats[f.id], acc = s ? Math.round((s.correct / s.seen) * 100) : 0;
      return `<div style="margin-bottom:12px"><div class="stat-row" style="border:0;padding-bottom:0"><span class="jp">${E(f.label)}${f.kind === 'construction' ? ' <span class="tag">construction</span>' : ''}</span><b>${s ? acc + '%' : '–'}</b></div><div class="mini-bar" aria-label="${acc}% correct"><i style="width:${acc}%"></i></div></div>`; }).join('');
    return `<div class="panel"><h2>Verb Lab</h2><p class="note">Type the conjugated form. Answers are built by conjugation rules, not memorised strings. The starter dictionary has ${V.length} verbs and ${F.length} forms. It is not a complete verb list.</p></div>
      <div class="two" style="margin-top:16px"><div class="panel"><h3 class="v-h">Quick practice</h3><div class="row">
        <button class="btn primary" data-v="random">Random practice</button><button class="btn primary" data-v="timed">Timed challenge (${TIMED}s)</button>
        <button class="btn ghost" data-v="mistakes" ${nm ? '' : 'disabled'}>Mistakes review (${nm})</button><button class="btn ghost" data-v="ref">Reference table</button></div></div>
      <div class="panel"><h3 class="v-h">By verb group</h3><div class="row">${['godan', 'ichidan', 'irregular'].map(g => `<button class="chip-btn" data-v="group" data-g="${g}">${C.GROUP_NAME[g]}</button>`).join('')}</div>
        <h3 class="v-h" style="margin-top:16px">By conjugation</h3><div class="row"><select id="vForm" aria-label="Conjugation">${F.map(f => `<option value="${f.id}">${E(f.label)}${f.kind === 'construction' ? ' (construction)' : ''}</option>`).join('')}</select><button class="btn primary" data-v="form">Start</button></div></div></div>
      <div class="sec-title"><h2>Accuracy by form</h2><span>${weak.length ? 'Needs work: ' + weak.map(x => E(x.f.label)).join(', ') : 'Answer a few questions to see your weak spots'}</span></div>
      <div class="panel">${rows}<p class="note">Constructions combine a conjugated verb with extra grammar. Conjugations are a single verb ending.</p></div>`;
  }
  function refTable() {
    const v = vById(st.ref);
    const body = F.map(f => { if (!C.supports(v, f.id)) return `<tr><td>${E(f.label)}</td><td colspan="2" class="note">not used for this verb</td></tr>`;
      const c = C.conjugate(v, f.id); return `<tr><td>${E(f.label)}${f.kind === 'construction' ? ' <span class="tag">construction</span>' : ''}</td><td class="jp">${E(c.kanji)}</td><td class="jp">${E(c.kana)}</td></tr>`; }).join('');
    return `<p><b class="jp">${E(v.kanji)}</b> <span class="jp note">(${E(v.kana)})</span> · ${E(v.en)} · <span class="tag">${C.GROUP_NAME[v.group]}</span></p>${v.note ? `<p class="note">${E(v.note)}</p>` : ''}
      <div class="tbl-wrap"><table class="v-table"><thead><tr><th>Form</th><th>Written</th><th>Reading</th></tr></thead><tbody>${body}</tbody></table></div>`;
  }
  function refHTML() {
    const opt = g => V.filter(v => v.group === g).map(v => `<option value="${E(v.id)}" ${v.id === st.ref ? 'selected' : ''}>${E(v.kanji)} (${E(v.kana)}) ${E(v.en)}</option>`).join('');
    return `<button class="btn ghost" data-v="back">← Verb Lab</button><div class="panel" style="margin-top:14px"><h2>Conjugation reference table</h2>
      <label class="field" style="margin-top:12px">Choose a verb<select id="vRefSel">${['godan', 'ichidan', 'irregular'].map(g => `<optgroup label="${C.GROUP_NAME[g]}">${opt(g)}</optgroup>`).join('')}</select></label>
      <div id="vRefTable">${refTable()}</div></div>`;
  }
  function quizHTML() {
    const z = st.quiz, s = z.s, q = s.questions[s.index], n = s.questions.length, a = z.answered, f = fById(q.form);
    const pct = z.timed ? Math.round((z.left / TIMED) * 100) : Math.round(((s.index + (a ? 1 : 0)) / n) * 100);
    const showExp = a && (z.exp === undefined ? !a.correct : z.exp);
    const fb = a ? `<div class="fb ${a.correct ? 'ok' : 'no'}" role="status"><b>${a.correct ? 'Correct!' : 'Not quite.'}</b>
      <div>Answer: <span class="jp p-big">${E(spell({ kanji: q.main[0], kana: q.main[1] || q.main[0] }))}</span></div>
      ${a.variant ? `<p class="note">Accepted as a casual or alternative form. The standard form is above.</p>` : ''}
      ${showExp ? `<p><b>Rule:</b> ${E(q.explanation)}</p><p class="jp note">${E(q.verb.kanji)} → ${E(q.main[0])}</p>` : ''}</div>` : '';
    return `<div class="panel g-quiz" id="vQuiz"><div class="row" style="justify-content:space-between;align-items:center"><b>${z.timed ? 'Question ' + (s.index + 1) : 'Question ' + (s.index + 1) + ' of ' + n}</b>
      <span>${z.timed ? `<span class="chip" id="vTimer">${fmt(z.left)}</span> ` : ''}<span class="tag">${E(C.GROUP_NAME[q.verb.group])}</span></span></div>
      <div class="mini-bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i id="vTimeBar" style="width:${pct}%"></i></div>
      <div class="v-card"><div class="note">${q.shownLabel}</div><div class="v-verb jp">${E(q.shown.kanji)}</div><div class="jp note">${E(q.shown.kana)}</div><div>${E(q.verb.en)}</div></div>
      <p class="v-target">Target: <b class="jp">${E(f.label)}</b> <span class="tag">${f.kind}</span></p>
      <div class="row"><input id="vAns" class="g-input jp" lang="ja"${NekoKana.attr()} autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Your answer" placeholder="Type the answer in Japanese" value="${E(a ? a.response : z.draft)}" ${a ? 'disabled' : ''}>
        <button class="btn primary" data-v="check" ${a ? 'disabled' : ''}>Check answer</button></div>
      <div class="row" style="margin-top:10px"><button class="btn ghost" data-v="hint" ${a ? 'disabled' : ''}>Hint</button>${NekoKana.toggle(!!a)}<button class="btn ghost" data-v="exp" ${a ? '' : 'disabled'}>Explanation</button>
        <button class="btn primary" data-v="next" ${a ? '' : 'disabled'}>${s.index + 1 < n ? 'Next verb' : 'See results'}</button><button class="btn ghost" data-v="back">Quit</button></div>${NekoKana.panel('vAns', !!a)}
      ${z.hint && !a ? `<div class="v-hint"><b>Hint:</b> ${E(C.rule(q.verb, q.form))}</div>` : ''}${fb}</div>`;
  }
  function resultHTML() {
    const z = st.quiz, r = NekoQuiz.summary(z.s);
    const miss = r.mistakes.map(m => `<div class="fb no"><div class="jp"><b>${E(m.q.shown.kanji)}</b> → ${E(fById(m.q.form).label)}</div><div>You typed <span class="jp">${E(m.response)}</span>. Answer: <span class="jp">${E(m.q.main.join(' / '))}</span></div><p>${E(m.q.explanation)}</p></div>`).join('');
    return `<div class="panel g-result"><h2>${z.timed ? "Time's up!" : r.pct >= 80 ? 'Great work!' : r.pct >= 50 ? 'Nice try!' : 'Keep practicing!'}</h2><div class="g-score">${r.correct} / ${r.total}</div>
      <div class="row"><span class="chip"><small>Accuracy</small>${r.pct}%</span><span class="chip"><small>Correct</small>${r.correct}</span><span class="chip"><small>Incorrect</small>${r.wrong}</span><span class="chip"><small>XP earned</small>+${z.xp}</span></div>
      ${z.xp === 0 && r.total ? '<p class="note">No new XP: each question and each session type pays XP once per day.</p>' : ''}
      ${miss ? `<h3 style="margin-top:20px">Review your mistakes</h3>${miss}` : r.total ? '<p>No mistakes. Perfect!</p>' : ''}
      <div class="row" style="margin-top:18px"><button class="btn primary" data-v="retry">Retry</button><button class="btn ghost" data-v="back">Back to Verb Lab</button></div></div>`;
  }
  const view = () => st.screen === 'quiz' ? quizHTML() : st.screen === 'result' ? resultHTML() : st.screen === 'reference' ? refHTML() : homeHTML();

  // ---------- quiz flow ----------
  function stopTimer() { if (tick) { clearInterval(tick); tick = null; } }
  function startTimer() {
    stopTimer();
    tick = setInterval(() => {
      const z = st.quiz;
      if (!z || !z.timed || z.done || st.screen !== 'quiz') return stopTimer();
      z.left--;
      const t = document.getElementById('vTimer'), b = document.getElementById('vTimeBar');
      if (t) t.textContent = fmt(Math.max(z.left, 0));
      if (b) b.style.width = Math.max(z.left, 0) / TIMED * 100 + '%';
      if (z.left <= 0) finish();
    }, 1000);
  }
  function start(mode, qs, keep) {
    if (!qs.length) return NekoApp.toast('No questions available yet.', 'err');
    stopTimer();
    st.quiz = { mode, keep, timed: mode === 'timed', left: TIMED, pool: qs, s: NekoQuiz.createSession(qs, { keepOrder: keep }), answered: null, hint: false, exp: undefined, draft: '', xpStart: D().xp, xp: 0, done: false };
    st.screen = 'quiz'; show();
    if (st.quiz.timed) startTimer();
  }
  function submit(resp) {
    const z = st.quiz;
    if (!z || z.answered || z.done) return;
    if (!resp.trim()) return NekoApp.toast('Type your answer first.', 'err');
    const q = z.s.questions[z.s.index], ok = NekoQuiz.evaluate(q, resp);
    NekoQuiz.record(z.s, q, resp, ok);
    z.answered = { response: resp, correct: ok, variant: ok && !q.main.some(x => C.norm(x) === C.norm(resp)) };
    NekoApp.mutate(() => {
      const d = D();
      if (ok) G.awardOnce(d, 'vq:' + q.id + ':' + G.dateKey(), G.CONFIG.rewards.correct, 'Correct conjugation'); // once per question per day
      G.recordVerb(d, q.id, q.form, ok);
      G.recordAnswer(d, 'verbs', ok, false);
    });
  }
  function finish() {
    const z = st.quiz;
    if (!z || z.done) return;
    z.done = true; stopTimer();
    if (z.timed) z.s.questions = z.s.questions.slice(0, z.s.results.length); // drop unanswered questions
    st.screen = 'result';
    NekoApp.mutate(() => {
      const d = D();
      if (z.s.results.length) {
        G.awardOnce(d, 'vsess:' + z.mode + ':' + G.dateKey(), G.CONFIG.rewards.session, 'Verb session: ' + z.mode); // once per mode per day
        G.recordSession(d, 'verbs', false);
      }
      z.xp = d.xp - z.xpStart;
    });
    window.scrollTo(0, 0);
  }
  function next() {
    const z = st.quiz;
    if (!z || !z.answered) return;
    if (z.s.index + 1 < z.s.questions.length) { z.s.index++; z.answered = null; z.hint = false; z.exp = undefined; z.draft = ''; return show(); }
    finish();
  }
  const keepDraft = () => { const i = document.getElementById('vAns'); if (i && st.quiz && !st.quiz.answered) st.quiz.draft = i.value; };

  // ---------- events ----------
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-v]');
    if (!b || b.disabled) return;
    const z = st.quiz;
    switch (b.dataset.v) {
      case 'random': case 'timed': case 'mistakes': { const p = pool(b.dataset.v); return start(b.dataset.v, p.qs, p.keep); }
      case 'group': return start('group', pool('group', b.dataset.g).qs);
      case 'form': return start('form', pool('form', document.getElementById('vForm').value).qs);
      case 'ref': st.screen = 'reference'; return show();
      case 'back': stopTimer(); st.screen = 'home'; return show();
      case 'check': return submit(document.getElementById('vAns').value);
      case 'hint': keepDraft(); z.hint = true; NekoApp.render(); return focus();
      case 'exp': z.exp = !(z.exp === undefined ? !z.answered.correct : z.exp); return NekoApp.render();
      case 'next': return next();
      case 'retry': return start(z.mode, z.pool, z.keep);
    }
  });
  document.addEventListener('change', e => {
    if (e.target.id === 'vRefSel') { st.ref = e.target.value; document.getElementById('vRefTable').innerHTML = refTable(); }
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter' || e.isComposing || !document.getElementById('vQuiz') || !st.quiz || st.screen !== 'quiz') return;
    if (e.target.id === 'vAns' && !st.quiz.answered) { e.preventDefault(); submit(e.target.value); }
    else if (st.quiz.answered && e.target.tagName !== 'BUTTON') { e.preventDefault(); next(); }
  });

  window.NekoVerbs = { view, mkQ };
})();