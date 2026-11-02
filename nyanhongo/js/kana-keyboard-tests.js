// Keyboard tests. Run with:  node tests/kana-keyboard-tests.js
const K = require('../js/kana-keyboard.js'), C = require('../js/conjugation.js'), V = require('../js/verb-data.js').verbs;
let pass = 0, fail = 0;
const t = (n, ok, x) => { if (ok) pass++; else { fail++; console.log('FAIL: ' + n + (x ? '  ' + x : '')); } };

// Simulate pressing keys: 'k:か' types a kana, 'd' = ゛, 'h' = ゜, 'b' = backspace
function press(keys, start = '') {
  let v = start, c = start.length;
  keys.forEach(k => {
    const r = K.edit(v, c, c, k[0] === 'k' ? 'key' : k === 'd' ? 'dakuten' : k === 'h' ? 'handaku' : k === 'b' ? 'back' : 'clear', k.slice(2));
    v = r.value; c = r.caret;
  });
  return v;
}
const type = s => [...s].map(c => 'k:' + c);
t('types かいて', press(type('かいて')) === 'かいて');
t('か + ゛ = が', press(['k:か', 'd']) === 'が');
t('が + ゛ again = か', press(['k:か', 'd', 'd']) === 'か');
t('は + ゛ = ば', press(['k:は', 'd']) === 'ば');
t('は + ゜ = ぱ', press(['k:は', 'h']) === 'ぱ');
t('ぱ + ゛ = ば', press(['k:は', 'h', 'd']) === 'ば');
t('ぱ + ゜ again = は', press(['k:は', 'h', 'h']) === 'は');
t('か + ゜ does nothing (no handakuten for か)', press(['k:か', 'h']) === 'か');
t('あ + ゛ does nothing', press(['k:あ', 'd']) === 'あ');
t('only the kana before the cursor changes', press([...type('かき'), 'd']) === 'かぎ');
t('katakana ハ + ゛ = バ', press(['k:ハ', 'd']) === 'バ');
t('backspace removes one character', press([...type('かいて'), 'b']) === 'かい');
t('backspace on empty text is safe', press(['b']) === '');
t('clear empties the box', press([...type('かいて'), 'c']) === '');
t('insert in the middle of text', K.edit('かて', 1, 1, 'key', 'い').value === 'かいて');
t('typing over a selection replaces it', K.edit('かいて', 0, 3, 'key', 'の').value === 'の');
t('backspace deletes a selection', K.edit('かいて', 1, 3, 'back').value === 'か');
t('keyboard HTML is created', K.toggle(false).includes('あ Keyboard') && K.panel('x', false).includes('id="kbPanel"') && K.panel('x', true) === '');
t('panel has the main kana, small kana and ん', ['あ', 'わ', 'を', 'ん', 'っ', 'ゃ', 'ー'].every(c => K.panel('x', false).includes('data-k="' + c + '"')));

// Answers typed with the keyboard are accepted by the verb engine
const verb = k => V.find(v => v.kanji === k);
t('かいて accepted for 書く て-form', C.check(verb('書く'), 'te', press(type('かいて'))).ok);
t('およいで (with ゛) accepted for 泳ぐ て-form', C.check(verb('泳ぐ'), 'te', press([...type('およい'), 'k:て', 'd'])).ok);
t('あそんで accepted for 遊ぶ て-form', C.check(verb('遊ぶ'), 'te', press(type('あそんで'))).ok);
t('こない accepted for 来る ない-form', C.check(verb('来る'), 'nai', press(type('こない'))).ok);
t('べんきょうして accepted for 勉強する て-form', C.check(verb('勉強する'), 'te', press(type('べんきょうして'))).ok);
t('wrong kana still rejected (かきて)', !C.check(verb('書く'), 'te', press(type('かきて'))).ok);
console.log((fail ? fail + ' FAILED, ' : 'ALL PASSED: ') + pass + ' checks passed');
if (fail) process.exitCode = 1;
