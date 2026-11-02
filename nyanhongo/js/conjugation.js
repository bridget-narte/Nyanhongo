// Verb conjugation engine. Pure logic: no DOM, no saved data. Works in the browser and in Node (for tests).
// A verb looks like {kanji, kana, en, type: 'godan'|'ichidan'|'suru'|'kuru', group, ex?, skip?}.
// Every form is built twice (kanji spelling + kana spelling) by the same rules.
(function () {
  // Godan endings: [i-row (ます), a-row (ない), e-row (potential/ば), o-row (volitional), て, た]
  const GODAN = {
    'う': ['い', 'わ', 'え', 'お', 'って', 'った'], 'つ': ['ち', 'た', 'て', 'と', 'って', 'った'], 'る': ['り', 'ら', 'れ', 'ろ', 'って', 'った'],
    'む': ['み', 'ま', 'め', 'も', 'んで', 'んだ'], 'ぶ': ['び', 'ば', 'べ', 'ぼ', 'んで', 'んだ'], 'ぬ': ['に', 'な', 'ね', 'の', 'んで', 'んだ'],
    'く': ['き', 'か', 'け', 'こ', 'いて', 'いた'], 'ぐ': ['ぎ', 'が', 'げ', 'ご', 'いで', 'いだ'], 'す': ['し', 'さ', 'せ', 'そ', 'して', 'した']
  };
  // "conjugation" = one verb ending. "construction" = a conjugated verb plus extra grammar.
  const FORMS = [
    { id: 'dictionary', label: 'Dictionary form', kind: 'conjugation' }, { id: 'masu', label: 'ます form', kind: 'conjugation' },
    { id: 'masen', label: 'ません form', kind: 'conjugation' }, { id: 'mashita', label: 'ました form', kind: 'conjugation' },
    { id: 'masendeshita', label: 'ませんでした form', kind: 'conjugation' }, { id: 'nai', label: 'ない form', kind: 'conjugation' },
    { id: 'ta', label: 'た form', kind: 'conjugation' }, { id: 'te', label: 'て form', kind: 'conjugation' },
    { id: 'nakute', label: 'なくて form', kind: 'conjugation' }, { id: 'potential', label: 'Potential form', kind: 'conjugation' },
    { id: 'volitional', label: 'Volitional form', kind: 'conjugation' }, { id: 'ba', label: 'ば conditional', kind: 'conjugation' },
    { id: 'tara', label: 'たら conditional', kind: 'conjugation' }, { id: 'nakuteMoIi', label: 'なくてもいい', kind: 'construction' },
    { id: 'nakereba', label: 'なければならない', kind: 'construction' }
  ];
  const GROUP_NAME = { godan: 'Godan (u-verb)', ichidan: 'Ichidan (ru-verb)', irregular: 'Irregular' };
  const norm = s => String(s).normalize('NFKC').replace(/[\s。、.,]/g, '');
  const supports = (v, form) => !(v.skip || []).includes(form);

  // The part of the word that changes, as a set of stems for one spelling (kanji or kana).
  function stems(v, script) {
    const s = v[script];
    if (v.type === 'godan') {
      const p = s.slice(0, -1), r = GODAN[s.slice(-1)], iku = v.ex === 'iku';
      return { masu: p + r[0], nai: p + r[1], pot: p + r[2] + 'る', vol: p + r[3] + 'う', ba: p + r[2] + 'ば', te: p + (iku ? 'って' : r[4]), ta: p + (iku ? 'った' : r[5]) };
    }
    if (v.type === 'ichidan') { const p = s.slice(0, -1); return { masu: p, nai: p, pot: p + 'られる', vol: p + 'よう', ba: p + 'れば', te: p + 'て', ta: p + 'た' }; }
    if (v.type === 'suru') { const p = s.slice(0, -2); return { masu: p + 'し', nai: p + 'し', pot: p + 'できる', vol: p + 'しよう', ba: p + 'すれば', te: p + 'して', ta: p + 'した' }; }
    return script === 'kanji' // 来る: the kanji stays, only the reading changes
      ? { masu: '来', nai: '来', pot: '来られる', vol: '来よう', ba: '来れば', te: '来て', ta: '来た' }
      : { masu: 'き', nai: 'こ', pot: 'こられる', vol: 'こよう', ba: 'くれば', te: 'きて', ta: 'きた' };
  }

  function build(v, form, script) {
    const S = stems(v, script);
    const nai = v.ex === 'aru' ? 'ない' : S.nai + 'ない'; // ある is irregular: ない, not あらない
    switch (form) {
      case 'dictionary': return v[script];
      case 'masu': return S.masu + 'ます';
      case 'masen': return S.masu + 'ません';
      case 'mashita': return S.masu + 'ました';
      case 'masendeshita': return S.masu + 'ませんでした';
      case 'nai': return nai;
      case 'ta': return S.ta;
      case 'te': return S.te;
      case 'nakute': return nai.slice(0, -1) + 'くて';
      case 'potential': return S.pot;
      case 'volitional': return S.vol;
      case 'ba': return S.ba;
      case 'tara': return S.ta + 'ら';
      case 'nakuteMoIi': return nai.slice(0, -1) + 'くてもいい';   // construction: なくて + もいい
      case 'nakereba': return nai.slice(0, -1) + 'ければならない'; // construction: ない - い + ければならない
    }
    throw new Error('Unknown form: ' + form);
  }
  const conjugate = (v, form) => ({ kanji: build(v, form, 'kanji'), kana: build(v, form, 'kana') });

  // Accepted answers. main = standard forms (kanji spelling or kana spelling). variants = clearly defined alternatives.
  function answers(v, form) {
    const c = conjugate(v, form), uniq = a => a.filter((x, i) => a.indexOf(x) === i), vr = [];
    if (form === 'potential' && (v.type === 'ichidan' || v.type === 'kuru')) vr.push(c.kanji.replace('られる', 'れる'), c.kana.replace('られる', 'れる')); // ら抜き, casual
    if (form === 'nakereba') vr.push(c.kanji.replace('ければならない', 'くてはならない'), c.kana.replace('ければならない', 'くてはならない'));
    const main = uniq([c.kanji, c.kana]);
    return { main, variants: uniq(vr).filter(x => !main.includes(x)) };
  }
  // Exact comparison after removing spaces and punctuation. A wrong conjugation never passes just by sharing an ending.
  function check(v, form, response) {
    const a = answers(v, form), n = norm(response);
    if (a.main.some(x => norm(x) === n)) return { ok: true, variant: false };
    if (a.variants.some(x => norm(x) === n)) return { ok: true, variant: true };
    return { ok: false, variant: false };
  }

  // Short rule text, used for hints and explanations.
  function rule(v, form) {
    const t = v.type, last = v.kana.slice(-1), r = GODAN[last] || [];
    const pick = (g, i, s, k) => t === 'godan' ? g : t === 'ichidan' ? i : t === 'suru' ? s : k;
    const stem = (idx, s, k) => pick(`change the final ${last} to ${r[idx]}`, 'drop る', s, k);
    const te = form === 'te', sfx = te ? 'て' : 'た';
    switch (form) {
      case 'dictionary': return pick(`Godan: the ます stem ends in ${r[0]}. Change it back to ${last}.`, 'Ichidan: add る to the ます stem.', 'し → する.', '来(き)ます → 来る(くる).');
      case 'masu': case 'masen': case 'mashita': case 'masendeshita': {
        const add = { masu: 'ます', masen: 'ません', mashita: 'ました', masendeshita: 'ませんでした' }[form];
        return `Take the ます stem (${stem(0, 'する → し', '来る → 来(き)')}), then add ${add}.`;
      }
      case 'nai': return v.ex === 'aru' ? 'ある is an exception: its negative is just ない (never あらない).'
        : `Take the ない stem (${stem(1, 'する → し', '来る → 来(こ)')}${t === 'godan' && last === 'う' ? '; verbs ending in う use わ, not あ' : ''}), then add ない.`;
      case 'ta': case 'te': return pick(v.ex === 'iku' ? `行く is an exception: it becomes 行って / 行った (not 行いて).` : `Godan verbs ending in ${last}: ${last} → ${r[te ? 4 : 5]}.`,
        `Ichidan: drop る, add ${sfx}.`, `する → し${sfx}.`, `来る → 来(き)${sfx}.`);
      case 'nakute': return 'Make the ない form, then change the final い to くて.';
      case 'potential': return pick(`Godan: change ${last} to ${r[2]}, then add る.`, 'Ichidan: drop る, add られる (casual speech often shortens it to れる).', 'する uses a different verb: できる.', '来る → 来(こ)られる.');
      case 'volitional': return pick(`Godan: change ${last} to ${r[3]}, then add う.`, 'Ichidan: drop る, add よう.', 'する → しよう.', '来る → 来(こ)よう.');
      case 'ba': return pick(`Godan: change ${last} to ${r[2]}, then add ば.`, 'Ichidan: drop る, add れば.', 'する → すれば.', '来る → 来(く)れば.');
      case 'tara': return 'Make the た form, then add ら.';
      case 'nakuteMoIi': return 'Construction (not a single conjugation): the なくて form + もいい means "you do not have to". Build the なくて form first.';
      case 'nakereba': return 'Construction: the ない form, drop the final い, add ければならない ("must"). なくてはならない is also accepted.';
    }
  }
  const explain = (v, form) => rule(v, form) + (v.note ? ' ' + v.note : '');

  const api = { GODAN, FORMS, GROUP_NAME, norm, supports, conjugate, answers, check, rule, explain };
  if (typeof window !== 'undefined') window.NekoConj = api;
  if (typeof module !== 'undefined') module.exports = api;
})();