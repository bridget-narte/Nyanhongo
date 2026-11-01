// Reusable quiz logic. No DOM code and no grammar content, so other tabs can use it too.
// Question kinds: 'mc' {options, answer}, 'text' {accept[]}, 'order' {answer[], alts[][]}.
(function () {
  const shuffle = a => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
  // Ignore spaces, full/half-width differences and punctuation when comparing typed answers.
  const norm = s => String(s).normalize('NFKC').replace(/[\s。、.,!?！？]/g, '');

  function prepare(q) {
    const p = Object.assign({}, q);
    if (q.kind === 'mc') p.options = shuffle(q.options);
    if (q.kind === 'order') { let t; do { t = shuffle(q.answer); } while (t.join('|') === q.answer.join('|')); p.tiles = t; }
    return p;
  }
  function createSession(questions, opts = {}) {
    return { questions: (opts.keepOrder ? questions : shuffle(questions)).map(prepare), index: 0, results: [] }; // each question appears once
  }
  function evaluate(q, resp) {
    if (q.kind === 'mc') return resp === q.answer;
    if (q.kind === 'text') return q.accept.some(a => norm(a) === norm(resp));
    if (q.kind === 'order') { const j = resp.join(''); return [q.answer].concat(q.alts || []).some(a => a.join('') === j); }
    return false;
  }
  const displayAnswer = q => q.kind === 'mc' ? q.answer : q.kind === 'text' ? q.accept[0] : q.answer.join('');
  const record = (s, q, response, correct) => s.results.push({ id: q.id, correct, response });
  function summary(s) {
    const total = s.questions.length, correct = s.results.filter(r => r.correct).length;
    return { total, correct, wrong: s.results.length - correct, pct: total ? Math.round((correct / total) * 100) : 0,
      mistakes: s.results.filter(r => !r.correct).map(r => ({ q: s.questions.find(x => x.id === r.id), response: r.response })) };
  }
  // Data check: returns a list of problems (empty = all good). Run in the console: NekoQuiz.validate(NekoGrammarData.questions)
  function validate(qs) {
    const bad = [], ids = new Set();
    qs.forEach(q => {
      if (ids.has(q.id)) bad.push(q.id + ': duplicate id'); ids.add(q.id);
      if (!q.explanation || !q.category || !q.difficulty) bad.push(q.id + ': missing explanation/category/difficulty');
      if (q.kind === 'mc') {
        if (q.options.length !== 4 || new Set(q.options).size !== 4) bad.push(q.id + ': needs 4 distinct options');
        if (q.options.filter(o => o === q.answer).length !== 1) bad.push(q.id + ': answer must match exactly one option');
      } else if (q.kind === 'text') {
        if (!q.accept || !q.accept.length || !evaluate(q, q.accept[0])) bad.push(q.id + ': bad accept list');
      } else if (q.kind === 'order') {
        if (q.answer.length < 3 || !evaluate(q, q.answer)) bad.push(q.id + ': bad ordering answer');
      } else bad.push(q.id + ': unknown kind');
    });
    return bad;
  }

  window.NekoQuiz = { shuffle, createSession, evaluate, displayAnswer, record, summary, validate };
})();
