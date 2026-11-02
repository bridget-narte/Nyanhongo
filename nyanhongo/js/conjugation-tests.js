// Conjugation tests. Run with:  node tests/conjugation-tests.js
// (Or add <script src="tests/conjugation-tests.js"></script> after verb-data.js and read the browser console.)
// Expected answers below are typed by hand from Japanese grammar, NOT produced by the engine.
const C = typeof require === 'function' ? require('../js/conjugation.js') : window.NekoConj;
const V = (typeof require === 'function' ? require('../js/verb-data.js') : window.NekoVerbData).verbs;
const byKanji = k => V.find(v => v.kanji === k);

let pass = 0, fail = 0;
const t = (name, ok, extra) => { if (ok) pass++; else { fail++; console.log('FAIL: ' + name + (extra ? '  ' + extra : '')); } };

// [verb, form, expected written form, expected reading]
const CASES = [
  // Godan, grouped by final kana
  ['書く', 'masu', '書きます', 'かきます'], ['書く', 'nai', '書かない', 'かかない'], ['書く', 'te', '書いて', 'かいて'], ['書く', 'ta', '書いた', 'かいた'],
  ['書く', 'potential', '書ける', 'かける'], ['書く', 'volitional', '書こう', 'かこう'], ['書く', 'ba', '書けば', 'かけば'], ['書く', 'tara', '書いたら', 'かいたら'], ['書く', 'nakute', '書かなくて', 'かかなくて'],
  ['泳ぐ', 'te', '泳いで', 'およいで'], ['泳ぐ', 'ta', '泳いだ', 'およいだ'], ['泳ぐ', 'nai', '泳がない', 'およがない'], ['泳ぐ', 'potential', '泳げる', 'およげる'],
  ['話す', 'te', '話して', 'はなして'], ['話す', 'nai', '話さない', 'はなさない'], ['話す', 'potential', '話せる', 'はなせる'], ['話す', 'volitional', '話そう', 'はなそう'],
  ['待つ', 'te', '待って', 'まって'], ['待つ', 'nai', '待たない', 'またない'], ['待つ', 'masu', '待ちます', 'まちます'], ['待つ', 'volitional', '待とう', 'まとう'],
  ['買う', 'nai', '買わない', 'かわない'], ['買う', 'te', '買って', 'かって'], ['買う', 'potential', '買える', 'かえる'], ['買う', 'volitional', '買おう', 'かおう'], ['買う', 'masu', '買います', 'かいます'], ['買う', 'ba', '買えば', 'かえば'],
  ['作る', 'te', '作って', 'つくって'], ['作る', 'nai', '作らない', 'つくらない'], ['作る', 'ba', '作れば', 'つくれば'], ['作る', 'tara', '作ったら', 'つくったら'],
  ['読む', 'te', '読んで', 'よんで'], ['読む', 'ta', '読んだ', 'よんだ'], ['読む', 'nai', '読まない', 'よまない'], ['読む', 'potential', '読める', 'よめる'],
  ['遊ぶ', 'te', '遊んで', 'あそんで'], ['遊ぶ', 'nai', '遊ばない', 'あそばない'], ['遊ぶ', 'volitional', '遊ぼう', 'あそぼう'],
  ['死ぬ', 'te', '死んで', 'しんで'], ['死ぬ', 'nai', '死なない', 'しなない'], ['死ぬ', 'potential', '死ねる', 'しねる'],
  // る-ending verbs that are godan, not ichidan
  ['帰る', 'masu', '帰ります', 'かえります'], ['帰る', 'nai', '帰らない', 'かえらない'], ['帰る', 'te', '帰って', 'かえって'], ['切る', 'nai', '切らない', 'きらない'], ['切る', 'te', '切って', 'きって'],
  // Exceptions
  ['行く', 'te', '行って', 'いって'], ['行く', 'ta', '行った', 'いった'], ['行く', 'nai', '行かない', 'いかない'], ['行く', 'tara', '行ったら', 'いったら'],
  ['ある', 'nai', 'ない', 'ない'], ['ある', 'nakute', 'なくて', 'なくて'], ['ある', 'masu', 'あります', 'あります'], ['ある', 'masen', 'ありません', 'ありません'], ['ある', 'ta', 'あった', 'あった'],
  // Ichidan
  ['食べる', 'masu', '食べます', 'たべます'], ['食べる', 'masen', '食べません', 'たべません'], ['食べる', 'mashita', '食べました', 'たべました'], ['食べる', 'masendeshita', '食べませんでした', 'たべませんでした'],
  ['食べる', 'nai', '食べない', 'たべない'], ['食べる', 'ta', '食べた', 'たべた'], ['食べる', 'te', '食べて', 'たべて'], ['食べる', 'nakute', '食べなくて', 'たべなくて'],
  ['食べる', 'potential', '食べられる', 'たべられる'], ['食べる', 'volitional', '食べよう', 'たべよう'], ['食べる', 'ba', '食べれば', 'たべれば'], ['食べる', 'tara', '食べたら', 'たべたら'],
  ['食べる', 'nakuteMoIi', '食べなくてもいい', 'たべなくてもいい'], ['食べる', 'nakereba', '食べなければならない', 'たべなければならない'],
  ['見る', 'nai', '見ない', 'みない'], ['見る', 'te', '見て', 'みて'], ['見る', 'potential', '見られる', 'みられる'], ['見る', 'ba', '見れば', 'みれば'],
  ['着る', 'nai', '着ない', 'きない'], ['着る', 'te', '着て', 'きて'], ['起きる', 'ta', '起きた', 'おきた'], ['教える', 'te', '教えて', 'おしえて'],
  // する
  ['する', 'masu', 'します', 'します'], ['する', 'masendeshita', 'しませんでした', 'しませんでした'], ['する', 'nai', 'しない', 'しない'], ['する', 'te', 'して', 'して'], ['する', 'ta', 'した', 'した'],
  ['する', 'potential', 'できる', 'できる'], ['する', 'volitional', 'しよう', 'しよう'], ['する', 'ba', 'すれば', 'すれば'], ['する', 'tara', 'したら', 'したら'],
  ['する', 'nakute', 'しなくて', 'しなくて'], ['する', 'nakereba', 'しなければならない', 'しなければならない'],
  ['勉強する', 'te', '勉強して', 'べんきょうして'], ['勉強する', 'potential', '勉強できる', 'べんきょうできる'], ['勉強する', 'nai', '勉強しない', 'べんきょうしない'],
  // 来る (kanji stays, reading changes)
  ['来る', 'masu', '来ます', 'きます'], ['来る', 'nai', '来ない', 'こない'], ['来る', 'te', '来て', 'きて'], ['来る', 'ta', '来た', 'きた'], ['来る', 'potential', '来られる', 'こられる'],
  ['来る', 'volitional', '来よう', 'こよう'], ['来る', 'ba', '来れば', 'くれば'], ['来る', 'tara', '来たら', 'きたら'], ['来る', 'nakute', '来なくて', 'こなくて'],
  ['来る', 'nakereba', '来なければならない', 'こなければならない'], ['来る', 'nakuteMoIi', '来なくてもいい', 'こなくてもいい']
];
CASES.forEach(([k, f, kanji, kana]) => {
  const v = byKanji(k);
  if (!v) return t('verb exists: ' + k, false);
  const c = C.conjugate(v, f);
  t(k + ' ' + f + ' (written)', c.kanji === kanji, 'got ' + c.kanji + ', expected ' + kanji);
  t(k + ' ' + f + ' (reading)', c.kana === kana, 'got ' + c.kana + ', expected ' + kana);
});

// Answer checking: what is accepted and what must be rejected
const ok = (k, f, s) => C.check(byKanji(k), f, s).ok;
[['書く', 'te', '書いて'], ['書く', 'te', 'かいて'], ['書く', 'te', '  書 いて '], ['食べる', 'potential', '食べられる'], ['食べる', 'potential', 'たべられる'], ['来る', 'nai', 'こない'], ['来る', 'nai', '来ない'], ['ある', 'nai', 'ない']]
  .forEach(([k, f, s]) => t('accepts ' + s + ' for ' + k + ' ' + f, ok(k, f, s)));
[['書く', 'te', '書きて'], ['書く', 'te', '書って'], ['書く', 'te', '書いた'], ['書く', 'te', '書く'], ['行く', 'te', '行いて'], ['泳ぐ', 'te', '泳いて'], ['読む', 'ta', '読んで'], ['買う', 'ta', '買いた'],
  ['食べる', 'nai', '食べらない'], ['食べる', 'potential', '食べる'], ['来る', 'nai', 'きない'], ['来る', 'nai', '来らない'], ['ある', 'nai', 'あらない'], ['食べる', 'nakereba', '食べなければなりません'], ['話す', 'nai', '話らない'], ['', '', '']]
  .filter(a => a[0]).forEach(([k, f, s]) => t('rejects ' + s + ' for ' + k + ' ' + f, !ok(k, f, s)));
t('ら抜き 食べれる accepted as a variant', C.check(byKanji('食べる'), 'potential', '食べれる').ok && C.check(byKanji('食べる'), 'potential', '食べれる').variant);
t('standard 食べられる is not flagged as a variant', !C.check(byKanji('食べる'), 'potential', '食べられる').variant);
t('なくてはならない accepted as a variant', C.check(byKanji('食べる'), 'nakereba', '食べなくてはならない').variant === true);

// Independent cross-checks: different algorithm (regex on the reading), run over every verb
const TE = [[/[うつる]$/, 'って', 'った'], [/[むぶぬ]$/, 'んで', 'んだ'], [/く$/, 'いて', 'いた'], [/ぐ$/, 'いで', 'いだ'], [/す$/, 'して', 'した']];
const NAI = { 'う': 'わ', 'つ': 'た', 'る': 'ら', 'む': 'ま', 'ぶ': 'ば', 'ぬ': 'な', 'く': 'か', 'ぐ': 'が', 'す': 'さ' };
V.filter(v => v.type === 'godan').forEach(v => {
  const rule = TE.find(r => r[0].test(v.kana)), stem = v.kana.replace(rule[0], '');
  const iku = v.ex === 'iku';
  t(v.kanji + ' て (cross-check)', C.conjugate(v, 'te').kana === stem + (iku ? 'って' : rule[1]));
  t(v.kanji + ' た (cross-check)', C.conjugate(v, 'ta').kana === stem + (iku ? 'った' : rule[2]));
  if (v.ex !== 'aru') t(v.kanji + ' ない (cross-check)', C.conjugate(v, 'nai').kana === v.kana.slice(0, -1) + NAI[v.kana.slice(-1)] + 'ない');
});
V.filter(v => v.type === 'ichidan').forEach(v => {
  t(v.kanji + ' ない (cross-check)', C.conjugate(v, 'nai').kana === v.kana.slice(0, -1) + 'ない');
  t(v.kanji + ' potential (cross-check)', C.conjugate(v, 'potential').kana === v.kana.slice(0, -1) + 'られる');
});

// Data integrity
t('at least 50 verbs', V.length >= 50);
t('unique verb ids', new Set(V.map(v => v.id)).size === V.length);
t('every group is present', ['godan', 'ichidan', 'irregular'].every(g => V.some(v => v.group === g)));
t('する and 来る are present', !!byKanji('する') && !!byKanji('来る'));
t('ichidan readings end in an i-row or e-row sound + る', V.filter(v => v.type === 'ichidan').every(v => /[いきぎしじちぢにひびぴみりえけげせぜてでねへべぺめれ]る$/.test(v.kana)));
t('kanji and kana spellings end the same', V.filter(v => v.type !== 'kuru').every(v => v.kanji.slice(-1) === v.kana.slice(-1)));
t('every supported form gives a non-empty answer', V.every(v => C.FORMS.every(f => !C.supports(v, f.id) || (C.answers(v, f.id).main.every(x => x.length > 0)))));
t('constructions are marked', C.FORMS.filter(f => f.kind === 'construction').map(f => f.id).join() === 'nakuteMoIi,nakereba');
t('15 forms', C.FORMS.length === 15);

console.log((fail ? fail + ' FAILED, ' : 'ALL PASSED: ') + pass + ' checks passed');
if (typeof process !== 'undefined' && fail) process.exitCode = 1;