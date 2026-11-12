// Starter verb dictionary. This is NOT exhaustive. To add a verb, add one row:
// [kanji, kana, English, 'g' godan | 'i' ichidan | 'x' する/来る compound, optional {ex, skip, note}]
// ex: 'iku' (行く te/ta exception) or 'aru' (ない negative). skip: forms that are not used for that verb.
(function () {
  const raw = [
    ['買う', 'かう', 'to buy', 'g'], ['会う', 'あう', 'to meet', 'g'], ['言う', 'いう', 'to say', 'g'], ['使う', 'つかう', 'to use', 'g'],
    ['手伝う', 'てつだう', 'to help', 'g'], ['歌う', 'うたう', 'to sing', 'g'],
    ['待つ', 'まつ', 'to wait', 'g'], ['持つ', 'もつ', 'to hold / to have', 'g'], ['立つ', 'たつ', 'to stand', 'g'],
    ['作る', 'つくる', 'to make', 'g'], ['乗る', 'のる', 'to ride', 'g'],
    ['帰る', 'かえる', 'to return home', 'g', { note: '帰る looks like an ichidan verb but it is godan.' }],
    ['入る', 'はいる', 'to enter', 'g', { note: '入る looks like an ichidan verb but it is godan.' }],
    ['走る', 'はしる', 'to run', 'g', { note: '走る looks like an ichidan verb but it is godan.' }],
    ['知る', 'しる', 'to know', 'g', { skip: ['potential'], note: '知る looks like an ichidan verb but it is godan.' }],
    ['分かる', 'わかる', 'to understand', 'g', { skip: ['potential'], note: '分かる already means "can be understood", so it has no potential form.' }],
    ['切る', 'きる', 'to cut', 'g', { note: '切る (godan) and 着る (ichidan) are both read きる but conjugate differently.' }],
    ['読む', 'よむ', 'to read', 'g'], ['飲む', 'のむ', 'to drink', 'g'], ['休む', 'やすむ', 'to rest', 'g'], ['住む', 'すむ', 'to live (reside)', 'g'],
    ['遊ぶ', 'あそぶ', 'to play', 'g'], ['呼ぶ', 'よぶ', 'to call', 'g'], ['死ぬ', 'しぬ', 'to die', 'g'],
    ['書く', 'かく', 'to write', 'g'], ['聞く', 'きく', 'to listen / to ask', 'g'], ['歩く', 'あるく', 'to walk', 'g'], ['働く', 'はたらく', 'to work', 'g'],
    ['行く', 'いく', 'to go', 'g', { ex: 'iku', note: '行く is the one く-verb whose て/た forms are 行って / 行った.' }], ['置く', 'おく', 'to put', 'g'],
    ['泳ぐ', 'およぐ', 'to swim', 'g'], ['急ぐ', 'いそぐ', 'to hurry', 'g'],
    ['話す', 'はなす', 'to speak', 'g'], ['貸す', 'かす', 'to lend', 'g'], ['返す', 'かえす', 'to return (an item)', 'g'], ['出す', 'だす', 'to take out / to submit', 'g'],
    ['ある', 'ある', 'to exist (things)', 'g', { ex: 'aru', skip: ['potential', 'volitional', 'nakuteMoIi', 'nakereba'], note: 'ある is irregular in the negative (ない), and it has no potential form.' }],
    ['食べる', 'たべる', 'to eat', 'i'], ['見る', 'みる', 'to see / to watch', 'i'], ['起きる', 'おきる', 'to wake up', 'i'], ['寝る', 'ねる', 'to sleep', 'i'],
    ['着る', 'きる', 'to wear', 'i', { note: '着る (ichidan) and 切る (godan) are both read きる but conjugate differently.' }],
    ['出る', 'でる', 'to go out / to leave', 'i'], ['教える', 'おしえる', 'to teach', 'i'], ['覚える', 'おぼえる', 'to remember', 'i'],
    ['借りる', 'かりる', 'to borrow', 'i'], ['降りる', 'おりる', 'to get off', 'i'], ['考える', 'かんがえる', 'to think', 'i'],
    ['開ける', 'あける', 'to open (something)', 'i'], ['閉める', 'しめる', 'to close (something)', 'i'], ['忘れる', 'わすれる', 'to forget', 'i'],
    ['する', 'する', 'to do', 'x'], ['来る', 'くる', 'to come', 'x', { note: '来る keeps the kanji 来 but the reading changes: き, こ or く.' }],
    ['勉強する', 'べんきょうする', 'to study', 'x'], ['掃除する', 'そうじする', 'to clean', 'x']

    // Add these items to your `raw` array:

    // Godan verbs (u-verbs)
    ['洗う', 'あらう', 'to wash', 'g'],
    ['払う', 'はらう', 'to pay', 'g'],
    ['手伝う', 'てつだう', 'to help', 'g'],
    ['貰う', 'もらう', 'to receive', 'g'],
    ['勝つ', 'かつ', 'to win', 'g'],
    ['手伝う', 'てつだう', 'to help', 'g'],
    ['終わる', 'おわる', 'to finish / to end', 'g'],
    ['始まる', 'はじまる', 'to start (intransitive)', 'g'],
    ['売る', 'うる', 'to sell', 'g'],
    ['登る', 'のぼる', 'to climb', 'g'],
    ['振る', 'ふる', 'to wave / to shake', 'g'],
    ['困る', 'こまる', 'to be in trouble', 'g'],
    ['送る', 'おくる', 'to send', 'g'],
    ['折る', 'おる', 'to break / to fold', 'g'],
    ['渡る', 'わたる', 'to cross', 'g'],
    ['滑る', 'すべる', 'to slip / to slide', 'g', { note: '滑る looks like an ichidan verb but it is godan.' }],
    ['要る', 'いる', 'to need', 'g', { note: '要る looks like an ichidan verb but it is godan.' }],
    ['減る', 'へる', 'to decrease', 'g', { note: '減る looks like an ichidan verb but it is godan.' }],
    ['混む', 'こむ', 'to become crowded', 'g'],
    ['噛む', 'かむ', 'to chew / to bite', 'g'],
    ['選ぶ', 'えらぶ', 'to choose', 'g'],
    ['運ぶ', 'はこぶ', 'to carry / to transport', 'g'],
    ['咲く', 'さく', 'to bloom', 'g'],
    ['空く', 'すく', 'to become empty / uncrowded', 'g'],
    ['開く', 'ひらく', 'to open / to hold (an event)', 'g'],
    ['泣く', 'なく', 'to cry', 'g'],
    ['脱ぐ', 'ぬぐ', 'to take off (clothes)', 'g'],
    ['騒ぐ', 'さわぐ', 'to make noise', 'g'],
    ['直す', 'なおす', 'to repair / to fix', 'g'],
    ['落とす', 'おとす', 'to drop', 'g'],
    ['動かす', 'うごかす', 'to move (something)', 'g'],
    ['沸かす', 'わかす', 'to boil (water)', 'g'],
    ['押す', 'おす', 'to push / to press', 'g'],

    // Ichidan verbs (ru-verbs)
    ['調べる', 'しらべる', 'to investigate / to check', 'i'],
    ['受ける', 'うける', 'to take (an exam) / to receive', 'i'],
    ['増える', 'ふえる', 'to increase', 'i'],
    ['変える', 'かえる', 'to change (something)', 'i'],
    ['集める', 'あつめる', 'to collect / to gather', 'i'],
    ['負ける', 'まける', 'to lose (a match)', 'i'],
    ['決める', 'きめる', 'to decide', 'i'],
    ['込める', 'こめる', 'to put into / to load', 'i'],
    ['建てる', 'たてる', 'to build', 'i'],
    ['助ける', 'たすける', 'to help / to rescue', 'i'],
    ['捨てる', 'すてる', 'to throw away', 'i'],
    ['届ける', 'とどける', 'to deliver', 'i'],
    ['極める', 'きわめる', 'to master', 'i'],
    ['始める', 'はじめる', 'to start (something)', 'i'],
    ['借りる', 'かりる', 'to borrow', 'i'],
    ['落つる', 'おちる', 'to fall / to drop (intransitive)', 'i'],
    ['足る', 'たりる', 'to be sufficient', 'i'],
    ['信じる', 'しんじる', 'to believe', 'i'],
    ['起きる', 'おきる', 'to happen / to wake up', 'i'],
    ['褒める', 'ほめる', 'to praise', 'i'],

    // Compound Suru Verbs (x-verbs)
    ['予約する', 'よやくする', 'to reserve / to book', 'x'],
    ['案内する', 'あんないする', 'to guide / to show around', 'x'],
    ['準備する', 'じゅんびする', 'to prepare', 'x'],
    ['約束する', 'やくそくする', 'to promise', 'x'],
    ['紹介する', 'しょうかいする', 'to introduce', 'x'],
    ['理解する', 'りかいする', 'to comprehend', 'x'],
    ['説明する', 'せつめいする', 'to explain', 'x'],
    ['注意する', 'ちゅういする', 'to watch out / to pay attention', 'x'],
    ['相談する', 'そうだんする', 'to consult', 'x'],
    ['故障する', 'こしょうする', 'to break down', 'x'],
    ['遠慮する', 'えんりょする', 'to hold back / to hesitate', 'x'],
    ['出発する', 'しゅっぱつする', 'to depart', 'x'],
    ['到着する', 'とうちゃくする', 'to arrive', 'x'],
    ['利用する', 'りようする', 'to make use of', 'x']
  ];
  const verbs = raw.map(([kanji, kana, en, c, opt]) => {
    const type = c === 'g' ? 'godan' : c === 'i' ? 'ichidan' : kana === 'くる' ? 'kuru' : 'suru';
    return Object.assign({ id: kanji, kanji, kana, en, type, group: type === 'godan' || type === 'ichidan' ? type : 'irregular' }, opt || {});
  });
  const api = { verbs };
  if (typeof window !== 'undefined') window.NekoVerbData = api;
  if (typeof module !== 'undefined') module.exports = api;
})();