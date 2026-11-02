// On-screen Japanese keyboard for typed-answer questions (hiragana + katakana, no kanji).
// Use: put NekoKana.attr() inside the <input>, NekoKana.toggle() among the buttons and NekoKana.panel(inputId) below.
// The open/closed state is remembered while the page stays open.
(function () {
  const ROWS = ['あかさたなはまやらわ', 'いきしちにひみ　り　', 'うくすつぬふむゆる　', 'えけせてねへめ　れ　', 'おこそとのほもよろを']; // 　 = empty cell
  const EXTRA = ['ん', 'ー', 'っ', 'ゃ', 'ゅ', 'ょ'];
  // Kana that can take ゛ (dakuten) or ゜ (handakuten): [plain, dakuten, handakuten?]
  const GROUPS = ['かが', 'きぎ', 'くぐ', 'けげ', 'こご', 'さざ', 'しじ', 'すず', 'せぜ', 'そぞ', 'ただ', 'ちぢ', 'つづ', 'てで', 'とど', 'はばぱ', 'ひびぴ', 'ふぶぷ', 'へべぺ', 'ほぼぽ'];
  const toKata = s => s.replace(/[ぁ-ゖ]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x60));
  const toHira = s => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));

  // Pure text editing (no DOM) so it can be tested. s/e = selection start/end.
  function edit(value, s, e, action, k) {
    if (action === 'key') return { value: value.slice(0, s) + k + value.slice(e), caret: s + k.length };
    if (action === 'clear') return { value: '', caret: 0 };
    if (action === 'back') {
      if (s !== e) return { value: value.slice(0, s) + value.slice(e), caret: s };
      return s ? { value: value.slice(0, s - 1) + value.slice(e), caret: s - 1 } : { value, caret: 0 };
    }
    // dakuten / handaku: change the kana just before the cursor. Pressing again switches it back.
    if (s !== e || !s) return { value, caret: s };
    const ch = value[s - 1], h = toHira(ch), g = GROUPS.find(x => x.includes(h));
    if (!g) return { value, caret: s };
    const i = g.indexOf(h);
    let n;
    if (action === 'dakuten') n = g[i === 1 ? 0 : 1];
    else if (g.length === 3) n = g[i === 2 ? 0 : 2];
    else return { value, caret: s };
    if (/[ァ-ヶ]/.test(ch)) n = toKata(n);
    return { value: value.slice(0, s - 1) + n + value.slice(s), caret: s };
  }

  let open = false, mode = 'hira';

  function inner() {
    const L = c => mode === 'kata' ? toKata(c) : c;
    const cell = c => c === '　' ? '<span class="kb-blank"></span>' : `<button type="button" data-kb="key" data-k="${L(c)}">${L(c)}</button>`;
    return `<div class="kb-grid">${ROWS.map(r => [...r].map(cell).join('')).join('')}</div>
      <div class="kb-extra">${EXTRA.map(cell).join('')}
        <button type="button" data-kb="dakuten" aria-label="Add dakuten (゛)">゛</button><button type="button" data-kb="handaku" aria-label="Add handakuten (゜)">゜</button>
        <button type="button" data-kb="back" aria-label="Backspace">⌫</button><button type="button" data-kb="clear">Clear</button>
        <button type="button" data-kb="mode" aria-label="Switch between hiragana and katakana">${mode === 'hira' ? 'カナ' : 'ひら'}</button></div>`;
  }
  const attr = () => open ? ' inputmode="none"' : ''; // hides the phone's own keyboard while this one is open
  const toggle = disabled => `<button type="button" class="btn ghost kb-toggle" data-kb="toggle" aria-expanded="${open}" aria-controls="kbPanel" ${disabled ? 'disabled' : ''}>あ Keyboard</button>`;
  const panel = (inputId, disabled) => disabled ? '' : `<div class="kb" id="kbPanel" data-for="${inputId}" role="group" aria-label="Japanese keyboard" ${open ? '' : 'hidden'}>${inner()}</div>`;

  if (typeof document !== 'undefined') {
    const target = () => { const p = document.getElementById('kbPanel'); return p && document.getElementById(p.dataset.for); };
    function apply(action, k) {
      const el = target();
      if (!el || el.disabled) return;
      const len = el.value.length, r = edit(el.value, el.selectionStart == null ? len : el.selectionStart, el.selectionEnd == null ? len : el.selectionEnd, action, k);
      el.value = r.value; el.setSelectionRange(r.caret, r.caret);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.focus();
    }
    document.addEventListener('mousedown', e => { if (e.target.closest('#kbPanel button')) e.preventDefault(); }); // keep focus in the answer box
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-kb]');
      if (!b || b.disabled) return;
      const a = b.dataset.kb;
      if (a === 'toggle') {
        open = !open;
        const p = document.getElementById('kbPanel'), el = target();
        if (p) p.hidden = !open;
        b.setAttribute('aria-expanded', String(open));
        if (el) { if (open) el.setAttribute('inputmode', 'none'); else el.removeAttribute('inputmode'); el.focus(); }
        return;
      }
      if (a === 'mode') { mode = mode === 'hira' ? 'kata' : 'hira'; const p = document.getElementById('kbPanel'); if (p) p.innerHTML = inner(); return; }
      apply(a, b.dataset.k);
    });
  }

  const api = { attr, toggle, panel, edit };
  if (typeof window !== 'undefined') window.NekoKana = api;
  if (typeof module !== 'undefined') module.exports = api;
})();
