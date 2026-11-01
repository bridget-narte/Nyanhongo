// Storage layer: the ONLY file that touches localStorage.
(function () {
  const KEY = 'nekonihongo:data';
  const VERSION = 1;

  function defaults() {
    return {
      app: 'nekonihongo',
      version: VERSION,
      profile: { name: 'Learner', dailyGoal: 50, sessionLength: 10, sound: true, animations: true, furigana: true },
      xp: 0,
      xpLog: [],            // [{id, amount, reason, date}] recent transactions
      claimed: {},          // one-time rewards already given, e.g. "goal:2026-10-31"
      streak: { current: 0, best: 0, lastDate: null },
      activity: {},         // "YYYY-MM-DD": {questions, correct, sessions, xp, mods:{}}
      modules: {},          // per-module totals: {answered, correct, sessions}
      kanji: {},            // filled in Phase 2
      vocab: {},            // filled in Phase 2
      particles: { stats: {}, mistakes: {} }, // stats[p]={seen,correct}; mistakes[questionId]={count,last}
      lastModule: null
    };
  }

  // Add new versions here later: if (d.version < 2) { ...upgrade...; d.version = 2; }
  function migrate(d) {
    const base = defaults();
    const out = Object.assign(base, d);
    out.profile = Object.assign(base.profile, d.profile || {});
    out.streak = Object.assign(base.streak, d.streak || {});
    out.particles = { stats: (d.particles && d.particles.stats) || {}, mistakes: (d.particles && d.particles.mistakes) || {} };
    out.version = VERSION;
    return out;
  }

  function loadUserData() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaults();
      const d = JSON.parse(raw);
      return d && typeof d === 'object' ? migrate(d) : defaults();
    } catch (e) {
      console.warn('Saved data unreadable, starting fresh.', e);
      return defaults();
    }
  }

  function saveUserData(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); return true; }
    catch (e) { console.warn('Could not save.', e); return false; }
  }

  function exportProgress(data) {
    return JSON.stringify(data, null, 2);
  }

  // Returns {ok:true, data} or {ok:false, error}. Never throws.
  function importProgress(text) {
    let d;
    try { d = JSON.parse(text); } catch (e) { return { ok: false, error: 'That file is not valid JSON.' }; }
    if (!d || d.app !== 'nekonihongo') return { ok: false, error: 'This is not a NekoNihongo progress file.' };
    if (typeof d.xp !== 'number' || d.xp < 0 || !d.activity || typeof d.activity !== 'object' || !d.profile)
      return { ok: false, error: 'The progress file is missing required data.' };
    return { ok: true, data: migrate(d) };
  }

  function resetProgress() {
    try { localStorage.removeItem(KEY); } catch (e) {}
    return defaults();
  }

  window.NekoStorage = { loadUserData, saveUserData, exportProgress, importProgress, resetProgress };
})();
