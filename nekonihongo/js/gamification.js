// Game rules: XP, levels, streaks, activity records. No DOM code here.
(function () {
  const CONFIG = {
    rewards: { correct: 10, session: 20, daily: 30, kanji: 5, goal: 15 },
    levelThresholds: [0, 100, 250, 500, 800, 1200], // XP needed for levels 1..6
    levelGrowth: 100                                 // beyond level 6, each gap grows by this much
  };

  // ---- Dates (local calendar days, never 24h math) ----
  const pad = n => String(n).padStart(2, '0');
  const dateKey = (d = new Date()) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  function shiftKey(key, days) {
    const [y, m, d] = key.split('-').map(Number);
    return dateKey(new Date(y, m - 1, d + days));
  }

  // ---- Levels ----
  function threshold(level) {
    const t = CONFIG.levelThresholds;
    if (level <= t.length) return t[level - 1];
    let gap = t[t.length - 1] - t[t.length - 2], total = t[t.length - 1];
    for (let l = t.length + 1; l <= level; l++) { gap += CONFIG.levelGrowth; total += gap; }
    return total;
  }
  function levelInfo(xp) {
    let level = 1;
    while (xp >= threshold(level + 1)) level++;
    const start = threshold(level), next = threshold(level + 1);
    return { level, xp, next, toNext: next - xp, pct: Math.round(((xp - start) / (next - start)) * 100) };
  }

  // ---- Streak ----
  function updateStreak(data, today = dateKey()) {
    const s = data.streak;
    if (s.lastDate === today) return;
    s.current = s.lastDate === shiftKey(today, -1) ? s.current + 1 : 1;
    s.best = Math.max(s.best, s.current);
    s.lastDate = today;
  }
  function currentStreak(data, today = dateKey()) {
    const s = data.streak;
    return s.lastDate === today || s.lastDate === shiftKey(today, -1) ? s.current : 0;
  }

  // ---- Activity ----
  function dayRecord(data, key = dateKey()) {
    return data.activity[key] || (data.activity[key] = { questions: 0, correct: 0, sessions: 0, xp: 0, mods: {} });
  }
  function modStats(data, mod) {
    return data.modules[mod] || (data.modules[mod] = { answered: 0, correct: 0, sessions: 0 });
  }
  function addXP(data, amount, reason, id) {
    data.xp += amount;
    dayRecord(data).xp += amount;
    data.xpLog.push({ id, amount, reason, date: new Date().toISOString() });
    if (data.xpLog.length > 500) data.xpLog.shift();
  }
  // One-time rewards: the same id can never be paid twice.
  function awardOnce(data, id, amount, reason) {
    if (data.claimed[id]) return false;
    data.claimed[id] = true;
    addXP(data, amount, reason, id);
    return true;
  }
  function checkDailyGoal(data) {
    const key = dateKey();
    if (dayRecord(data, key).xp >= data.profile.dailyGoal) awardOnce(data, 'goal:' + key, CONFIG.rewards.goal, 'Daily goal reached');
  }

  function recordAnswer(data, mod, correct, award = true) {
    const day = dayRecord(data), m = modStats(data, mod);
    day.questions++; m.answered++;
    day.mods[mod] = true;
    if (correct) { day.correct++; m.correct++; if (award) addXP(data, CONFIG.rewards.correct, 'Correct answer (' + mod + ')', 'answer'); }
    updateStreak(data);
    checkDailyGoal(data);
    data.lastModule = mod;
  }
  function recordSession(data, mod, award = true) {
    const day = dayRecord(data), m = modStats(data, mod);
    day.sessions++; m.sessions++;
    day.mods[mod] = true;
    // Each finished session is a real event, so its id is unique (refreshing can't repeat it).
    if (award) addXP(data, CONFIG.rewards.session, 'Finished session (' + mod + ')', 'session:' + Date.now());
    updateStreak(data);
    checkDailyGoal(data);
    data.lastModule = mod;
  }

  // Per-particle accuracy + missed-question list (saved with the rest of the progress).
  function recordParticle(data, q, correct) {
    const p = data.particles, s = p.stats[q.answer] || (p.stats[q.answer] = { seen: 0, correct: 0 });
    s.seen++;
    if (correct) { s.correct++; delete p.mistakes[q.id]; }
    else { const m = p.mistakes[q.id] || (p.mistakes[q.id] = { count: 0, last: null }); m.count++; m.last = dateKey(); }
  }

  // ---- Stats for charts ----
  function weekData(data) {
    const out = [], today = dateKey();
    for (let i = 6; i >= 0; i--) {
      const key = shiftKey(today, -i), r = data.activity[key] || { questions: 0, correct: 0, sessions: 0, xp: 0 };
      const [y, m, d] = key.split('-').map(Number);
      out.push({
        key, isToday: i === 0,
        label: new Date(y, m - 1, d).toLocaleDateString('en', { weekday: 'short' }),
        questions: r.questions, sessions: r.sessions, xp: r.xp,
        accuracy: r.questions ? Math.round((r.correct / r.questions) * 100) : 0
      });
    }
    return out;
  }
  const accuracy = m => (m && m.answered ? Math.round((m.correct / m.answered) * 100) : 0);

  window.NekoGame = { CONFIG, dateKey, shiftKey, levelInfo, threshold, updateStreak, currentStreak,
    dayRecord, recordAnswer, recordSession, recordParticle, awardOnce, weekData, accuracy };
})();
