// Particle tab UI. Content: particle-data.js. Quiz rules: quiz-engine.js. Saved stats: data.particles.
(function () {
  const PD = NekoParticleData, Q = PD.questions, P = PD.roles, G = NekoGame;
  const E = s => NekoApp.esc(s), D = () => NekoApp.data();
  let st = { screen: 'home', lesson: null, quiz: null };

  const problems = NekoQuiz.validate(Q);
  if (problems.length) console.warn('Particle data problems:', problems);
  else console.info('Particle data OK: ' + Q.length + ' questions.');

  const show = () => { NekoApp.render(); window.scrollTo(0, 0); };
  const missed = () => Object.keys(D().particles.mistakes).filter(id => Q.some(x => x.id === id));
  const MODES = [
    ['basic', 'Basic Review', 'The core particles: は が を に で へ と も の から まで.', 'var(--primary)'],
    ['n4', 'N4-Level Practice', 'より, や, か, しか, だけ, でも, など and N4 uses of に, と, から.', 'var(--secondary)'],
    ['compare', 'Similar-Particle Comparison', 'Lessons and questions on pairs that learners mix up.', 'var(--accent-blue)'],
    ['mixed', 'Mixed Challenge', 'A random mix from every question.', 'var(--accent-yellow)'],
    ['mistakes', 'Mistakes Review', 'Questions you got wrong, most missed first.', 'var(--accent-green)']
  ];
  const count = m => m === 'basic' ? Q.filter(x => x.level === 'basic').length : m === 'n4' ? Q.filter(x => x.level === 'n4' && !x.pair).length
    : m === 'compare' ? Q.filter(x => x.pair).length : m === 'mixed' ? Q.length : missed().length;

  function pool(mode) {
    const len = D().profile.sessionLength;
    if (mode === 'basic') return { qs: Q.filter(x => x.level === 'basic') };
    if (mode === 'n4') return { qs: Q.filter(x => x.level === 'n4' && !x.pair) };
    if (mode === 'mixed') return { qs: NekoQuiz.shuffle(Q).slice(0, Math.min(Q.length, len)) };
    if (mode === 'mistakes') {
      const m = D().particles.mistakes;
      return { qs: missed().map(id => Q.find(x => x.id === id)).sort((a, b) => m[b.id].count - m[a.id].count).slice(0, len), keep: true };
    }
    return { qs: Q.filter(x => x.pair === mode) }; // a comparison pair id
  }

  // ---------- screens ----------
  function homeHTML() {
    const stats = D().particles.stats;
    const cards = MODES.map(([id, name, desc, color]) => {
      const n = count(id), off = id === 'mistakes' && !n;
      return `<article class="card ${id === 'basic' || id === 'n4' ? 'dark' : ''}" style="background:${color}"><h3>${name}</h3><p>${desc}</p>
        <div class="meta">${off ? 'No mistakes yet' : n + ' questions'}</div>
        <button class="btn" data-p="${id === 'compare' ? 'compare' : 'mode'}" data-m="${id}" ${off ? 'disabled' : ''}>${id === 'compare' ? 'Open' : 'Start'}</button></article>`;
    }).join('');
    const rows = PD.order.map(p => {
      const s = stats[p], acc = s ? Math.round((s.correct / s.seen) * 100) : 0;
      return `<div class="p-row"><span class="jp p-name">${p}</span><div><div class="note">${E(P[p])}</div><div class="mini-bar" aria-label="${acc}% correct"><i style="width:${acc}%"></i></div></div><b>${s ? acc + '%' : '–'}</b></div>`;
    }).join('');
    const weak = PD.order.map(p => ({ p, s: stats[p] })).filter(x => x.s && x.s.seen >= 2 && x.s.correct / x.s.seen < 0.7)
      .sort((a, b) => a.s.correct / a.s.seen - b.s.correct / b.s.seen).slice(0, 4);
    return `<div class="panel"><h2>Particle practice</h2><p class="note">Pick the particle that fits the blank. Each question has one correct answer, and you get an explanation every time.</p></div>
      <div class="grid" style="margin-top:16px">${cards}</div>
      <div class="sec-title"><h2>Your particle accuracy</h2><span>${missed().length} question${missed().length === 1 ? '' : 's'} to review</span></div>
      <div class="panel"><p><b>Needs work:</b> ${weak.length ? weak.map(x => `<span class="tag jp">${x.p} ${Math.round(x.s.correct / x.s.seen * 100)}%</span>`).join(' ') : '<span class="note">Answer a few questions and your weakest particles will show up here.</span>'}</p>${rows}</div>
      <div class="sec-title"><h2>Common combinations</h2></div>
      <div class="panel">${PD.combos.map(c => `<div class="stat-row"><span class="jp">${E(c[0])}</span><span class="jp note" style="text-align:right">${E(c[1])}</span></div>`).join('')}</div>`;
  }
  function compareHTML() {
    return `<button class="btn ghost" data-p="back">← Particles</button><div class="panel" style="margin-top:14px"><h2>Similar-particle comparison</h2>
      <p class="note">Which particle you need depends on its job in the sentence and on the context. Some particles have several jobs.</p></div>
      <div class="grid" style="margin-top:16px">${PD.lessons.map(l => `<article class="card g-card"><h3 class="jp">${E(l.title)}</h3>
        <div class="row"><button class="btn primary" data-p="lesson" data-id="${l.id}">Read</button><button class="btn ghost" data-p="pair" data-id="${l.id}">Practice (${Q.filter(x => x.pair === l.id).length})</button></div></article>`).join('')}</div>`;
  }
  function lessonHTML() {
    const l = PD.lessons.find(x => x.id === st.lesson);
    return `<button class="btn ghost" data-p="compare" data-m="compare">← Comparisons</button><div class="panel g-lesson" style="margin-top:14px"><h2 class="jp g-pattern">${E(l.title)}</h2>
      ${l.points.map(p => `<h3 class="jp">${E(p[0])}</h3><p>${E(p[1])}</p>`).join('')}
      ${l.examples.map(e => `<div class="g-example"><div class="jp g-jp">${E(e[0])}</div><div>${E(e[1])}</div></div>`).join('')}
      <p class="note" style="margin-top:14px">Particle choice depends on the grammatical role and the context, so one English word can match several particles.</p>
      <div style="margin-top:16px"><button class="btn primary" data-p="pair" data-id="${l.id}">Practice this pair</button></div></div>`;
  }
  function quizHTML() {
    const z = st.quiz, s = z.s, q = s.questions[s.index], n = s.questions.length, a = z.answered;
    const pct = Math.round(((s.index + (a ? 1 : 0)) / n) * 100);
    const opts = q.options.map((o, i) => {
      const cls = a ? (o === q.answer ? 'right' : o === a.response ? 'wrong' : '') : '';
      return `<button class="opt ${cls}" data-p="pick" data-i="${i}" ${a ? 'disabled' : ''}><b>${'ABCD'[i]}</b><span class="jp p-big">${E(o)}</span></button>`;
    }).join('');
    const fb = a ? `<div class="fb ${a.correct ? 'ok' : 'no'}" role="status"><b>${a.correct ? 'Correct!' : 'Not quite.'}</b> The answer is <span class="jp p-big">${E(q.answer)}</span>
      <p class="jp">${E(q.q.replace('___', q.answer))}<br><span class="note">${E(q.en)}</span></p>
      <p><b>Why it fits:</b> ${E(q.why)}</p><p><b>The other choices:</b></p>
      ${q.options.filter(o => o !== q.answer).map(o => `<div class="p-other"><span class="jp">${E(o)}</span> normally ${E(P[o])}, which is not what this sentence needs.</div>`).join('')}
      <p><b>Another example:</b> <span class="jp">${E(q.example.jp)}</span><br><span class="note">${E(q.example.en)}</span></p></div>
      <button class="btn primary" data-p="next">${s.index + 1 < n ? 'Next question' : 'See results'}</button>` : '';
    return `<div class="panel g-quiz"><div class="row" style="justify-content:space-between"><b>Question ${s.index + 1} of ${n}</b><span class="tag">${E(q.mode)}</span></div>
      <div class="mini-bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>
      <h2 class="g-q jp">${E(q.q).replace('___', '<span class="blank">＿＿</span>')}</h2><p class="note p-en">${E(q.en)}</p><div class="opts">${opts}</div>${fb}</div>`;
  }
  function resultHTML() {
    const z = st.quiz, r = NekoQuiz.summary(z.s);
    const miss = r.mistakes.map(m => `<div class="fb no"><div class="jp"><b>${E(m.q.q.replace('___', m.q.answer))}</b></div><div class="note">${E(m.q.en)}</div><p>You chose <span class="jp">${E(m.response)}</span>. ${E(m.q.why)}</p></div>`).join('');
    return `<div class="panel g-result"><h2>${r.pct >= 80 ? 'Great work!' : r.pct >= 50 ? 'Nice try!' : 'Keep practicing!'}</h2><div class="g-score">${r.correct} / ${r.total}</div>
      <div class="row"><span class="chip"><small>Accuracy</small>${r.pct}%</span><span class="chip"><small>Correct</small>${r.correct}</span><span class="chip"><small>Incorrect</small>${r.wrong}</span><span class="chip"><small>XP earned</small>+${z.xp}</span></div>
      ${z.xp === 0 ? '<p class="note">No new XP: each question and each session type pays XP once per day.</p>' : ''}
      ${miss ? `<h3 style="margin-top:20px">Review your mistakes</h3>${miss}` : '<p>No mistakes. Perfect!</p>'}
      <div class="row" style="margin-top:18px"><button class="btn primary" data-p="retry">Retry</button><button class="btn ghost" data-p="back">Back to particles</button></div></div>`;
  }
  const view = () => st.screen === 'quiz' ? quizHTML() : st.screen === 'result' ? resultHTML() : st.screen === 'compare' ? compareHTML() : st.screen === 'lesson' ? lessonHTML() : homeHTML();

  // ---------- quiz flow ----------
  function start(mode, qs, keep) {
    if (!qs.length) return NekoApp.toast('Nothing to practice here yet.', 'err');
    st.quiz = { mode, keep, pool: qs, s: NekoQuiz.createSession(qs, { keepOrder: keep }), answered: null, xpStart: D().xp, xp: 0, done: false };
    st.screen = 'quiz'; show();
  }
  function submit(resp) {
    const z = st.quiz;
    if (z.answered) return;
    const q = z.s.questions[z.s.index], ok = NekoQuiz.evaluate(q, resp);
    NekoQuiz.record(z.s, q, resp, ok);
    z.answered = { response: resp, correct: ok };
    NekoApp.mutate(() => {
      const d = D();
      if (ok) G.awardOnce(d, 'pq:' + q.id + ':' + G.dateKey(), G.CONFIG.rewards.correct, 'Correct particle answer'); // once per question per day
      G.recordParticle(d, q, ok);
      G.recordAnswer(d, 'particles', ok, false);
    });
  }
  function next() {
    const z = st.quiz;
    if (z.s.index + 1 < z.s.questions.length) { z.s.index++; z.answered = null; return show(); }
    if (z.done) return;
    z.done = true; st.screen = 'result';
    NekoApp.mutate(() => {
      const d = D();
      G.awardOnce(d, 'psess:' + z.mode + ':' + G.dateKey(), G.CONFIG.rewards.session, 'Particle session: ' + z.mode); // once per mode per day
      G.recordSession(d, 'particles', false);
      z.xp = d.xp - z.xpStart;
    });
    window.scrollTo(0, 0);
  }

  // ---------- events ----------
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-p]');
    if (!b) return;
    const z = st.quiz, q = z && st.screen === 'quiz' ? z.s.questions[z.s.index] : null;
    switch (b.dataset.p) {
      case 'mode': { const p = pool(b.dataset.m); return start(b.dataset.m, p.qs, p.keep); }
      case 'compare': st.screen = 'compare'; return show();
      case 'lesson': st.lesson = b.dataset.id; st.screen = 'lesson'; return show();
      case 'pair': return start(b.dataset.id, pool(b.dataset.id).qs);
      case 'back': st.screen = 'home'; return show();
      case 'pick': return submit(q.options[Number(b.dataset.i)]);
      case 'next': return next();
      case 'retry': return start(z.mode, z.pool, z.keep);
    }
  });

  window.NekoParticles = { view };
})();
