// Grammar CONTENT only. To add a pattern, add one lesson object to LESSONS below.
// Question helpers: mc = multiple choice, tx = typed answer, od = sentence ordering.
(function () {
  const mc = (mode, q, options, answer, explanation, difficulty = 'easy') => ({ kind: 'mc', mode, q, options, answer, explanation, difficulty });
  const tx = (mode, q, accept, explanation, difficulty = 'easy') => ({ kind: 'text', mode, q, accept, explanation, difficulty });
  const od = (q, answer, explanation, difficulty = 'medium', alts = []) => ({ kind: 'order', mode: 'Sentence ordering', q, answer, alts, explanation, difficulty });

  const LESSONS = [
    { id: 'omou', pattern: '～と思います', category: 'Opinions & Intentions', meaning: 'I think that…',
      formation: 'Plain form + と思います. After a noun or な-adjective use だ: 先生だと思います.',
      usage: 'Gives a soft opinion or guess. The part before と is in plain form even in a polite sentence.',
      example: { jp: '明日は雨が降ると思います。', kana: 'あしたはあめがふるとおもいます。', en: 'I think it will rain tomorrow.' },
      mistakes: 'Do not put the polite ます-form before と (降りますと思います is wrong). Do not use it for facts you are certain of.',
      related: ['tsumori'],
      questions: [
        mc('Choose the correct sentence', 'Which sentence means "I think he is a teacher"?', ['先生だと思います。', '先生ですと思います。', '先生だが思います。', '先生をと思います。'], '先生だと思います。', 'Use the plain form (だ after a noun) before と. ですと is not used before 思います.'),
        tx('Fill in the blank', '明日は晴れる___思います。 (I think it will be sunny tomorrow.)', ['と'], 'と marks what you think, and 晴れる stays in plain form before it.'),
        tx('Translation', 'Translate: I think this book is interesting.', ['この本はおもしろいと思います', 'この本は面白いと思います', 'この本がおもしろいと思います', 'この本が面白いと思います', 'このほんはおもしろいとおもいます', 'このほんがおもしろいとおもいます'], 'Plain form おもしろい + と思います. は or が both work after この本.', 'medium')
      ] },
    { id: 'tsumori', pattern: '～つもりです', category: 'Opinions & Intentions', meaning: 'I intend to… / I plan to…',
      formation: 'Dictionary form + つもりです. Negative: ない-form + つもりです (行かないつもりです).',
      usage: 'Says what you have decided to do. It is about your own intention.',
      example: { jp: '来年、日本へ行くつもりです。', kana: 'らいねん、にほんへいくつもりです。', en: 'I intend to go to Japan next year.' },
      mistakes: 'Do not use the ます-form or the volitional form before つもり (行きますつもり, 行こうつもり are wrong).',
      related: ['omou'],
      questions: [
        mc('Sentence completion', '夏休みに北海道へ___つもりです。 (I intend to go to Hokkaido during summer vacation.)', ['行く', '行きます', '行って', '行こう'], '行く', 'Dictionary form comes right before つもり.'),
        mc('Identify the incorrect sentence', 'Which sentence is incorrect?', ['今晩は早く寝るつもりです。', '今日は何も食べないつもりです。', '来月、結婚するつもりです。', '明日、友達に会いますつもりです。'], '明日、友達に会いますつもりです。', 'つもり cannot follow the ます-form. The correct sentence is 友達に会うつもりです。', 'medium'),
        od('Arrange the pieces: I intend to enter university next year.', ['私は', '来年', '大学に', '入る', 'つもりです'], 'The verb (入る) goes just before つもりです. 来年 can also come before 私は.', 'medium', [['来年', '私は', '大学に', '入る', 'つもりです'], ['私は', '大学に', '来年', '入る', 'つもりです']])
      ] },
    { id: 'kotoga', pattern: '～ことがある', category: 'Experience', meaning: 'I have done… before / It sometimes happens that…',
      formation: 'た-form + ことがある for experience. Dictionary form or ない-form + ことがある for "sometimes".',
      usage: 'Talks about past experiences in general, not one specific time.',
      example: { jp: '富士山に登ったことがあります。', kana: 'ふじさんにのぼったことがあります。', en: 'I have climbed Mt. Fuji.' },
      mistakes: 'Dictionary form changes the meaning to "sometimes". Do not use it with a specific time such as 昨日.',
      related: [],
      questions: [
        mc('Multiple choice', 'Which sentence means "I have eaten sushi before"?', ['すしを食べたことがあります。', 'すしを食べることがあります。', 'すしを食べるがあります。', 'すしを食べたがあります。'], 'すしを食べたことがあります。', 'た-form + ことがある is experience. The dictionary form (食べることがある) means "sometimes eat".'),
        tx('Fill in the blank', '私は京都へ行った___があります。 (I have been to Kyoto.)', ['こと'], 'た-form + ことがあります expresses experience.'),
        tx('Translation', 'Translate: I have never seen a koala.', ['コアラを見たことがありません', 'コアラをみたことがありません', 'コアラは見たことがありません', 'コアラを見たことがない'], 'た-form + ことがありません means "have never".', 'medium')
      ] },
    { id: 'shimau', pattern: '～てしまう', category: 'て-form Patterns', meaning: 'to finish completely / to do by mistake (with regret)',
      formation: 'て-form + しまう (casual: ちゃう, じゃう). 食べる → 食べてしまう.',
      usage: 'Either "finish something completely" (宿題をやってしまった) or "did something unfortunate" (財布を忘れてしまった). Context tells you which.',
      example: { jp: '財布を忘れてしまいました。', kana: 'さいふをわすれてしまいました。', en: 'I forgot my wallet (and I regret it).' },
      mistakes: 'Do not attach しまう to the ます-form. It does not always show regret.',
      related: ['oku', 'miru'],
      questions: [
        mc('Sentence completion', '電車に傘を忘れ___。 (Oh no, I left my umbrella on the train.)', ['てしまいました', 'ておきました', 'てみました', 'てあげました'], 'てしまいました', 'Doing something unfortunate by accident uses てしまう.'),
        mc('Identify the incorrect sentence', 'Which sentence is incorrect?', ['宿題を全部やってしまいました。', '財布を落としてしまいました。', '本を読みますしまいました。', 'ケーキを食べてしまいました。'], '本を読みますしまいました。', 'しまう follows the て-form: 読んでしまいました.', 'medium'),
        tx('Fill in the blank', 'ケーキを全部食べ___ました。 (I ate all of the cake.)', ['てしまい'], 'て-form + しまう (here in the polite past stem しまい) shows the cake was finished completely.')
      ] },
    { id: 'oku', pattern: '～ておく', category: 'て-form Patterns', meaning: 'to do something in advance / to leave something as it is',
      formation: 'て-form + おく. 買う → 買っておく.',
      usage: 'Preparing ahead for something, or leaving a thing in a certain state.',
      example: { jp: '明日のために、食べ物を買っておきます。', kana: 'あしたのために、たべものをかっておきます。', en: 'I will buy food in advance for tomorrow.' },
      mistakes: 'Do not use it for accidents (that is てしまう). It needs a purpose or a later moment in mind.',
      related: ['shimau', 'miru'],
      questions: [
        mc('Sentence completion', '来週のテストのために、単語を勉強___。 (I will study the words in advance for next week\'s test.)', ['ておきます', 'てしまいます', 'てみます', 'てくれます'], 'ておきます', 'Preparing ahead for something is ておく.'),
        od('Arrange the pieces: I will buy drinks before the party.', ['パーティーの前に', '飲み物を', '買って', 'おきます'], '買って (て-form) + おきます. The time phrase and 飲み物を can swap places.', 'medium', [['飲み物を', 'パーティーの前に', '買って', 'おきます']]),
        tx('Translation', 'Translate: I will book the hotel in advance. (予約する = to book)', ['ホテルを予約しておきます', 'ホテルを前もって予約しておきます', 'ホテルを先に予約しておきます', 'ホテルをよやくしておきます', 'ほてるをよやくしておきます', 'ホテルをまえもってよやくしておきます'], 'て-form 予約して + おきます expresses doing it ahead of time.', 'medium')
      ] },
    { id: 'miru', pattern: '～てみる', category: 'て-form Patterns', meaning: 'to try doing something (to see how it is)',
      formation: 'て-form + みる. 食べる → 食べてみる. Written in hiragana.',
      usage: 'Trying something once to find out what it is like.',
      example: { jp: '新しいラーメン屋に行ってみました。', kana: 'あたらしいラーメンやにいってみました。', en: 'I tried going to the new ramen shop.' },
      mistakes: 'Do not use the ます-form (聞きてみる). It is not for things you do repeatedly or by obligation.',
      related: ['oku', 'shimau'],
      questions: [
        mc('Multiple choice', 'この靴を___もいいですか。 (May I try on these shoes?)', ['履いてみて', '履いておいて', '履いてしまって', '履いてあげて'], '履いてみて', 'Trying something to see how it is uses てみる.'),
        tx('Fill in the blank', 'この料理を食べ___ください。 (Please try eating this dish.)', ['てみて'], 'て-form + みて + ください asks someone to try it.'),
        mc('Choose the correct sentence', 'Which sentence correctly says "I tried listening to Japanese songs"?', ['日本の歌を聞いてみました。', '日本の歌を聞くみました。', '日本の歌を聞きてみました。', '日本の歌を聞いてみるました。'], '日本の歌を聞いてみました。', 'Use the て-form 聞いて + みました.')
      ] },
    { id: 'node', pattern: '～ので', category: 'Reasons & Contrast', meaning: 'because / since',
      formation: 'Plain form + ので. Nouns and な-adjectives take な: 暇なので.',
      usage: 'Gives a reason in a soft, fairly objective way. Polite speech often uses it for explanations.',
      example: { jp: '雨が降っているので、家にいます。', kana: 'あめがふっているので、いえにいます。', en: 'Because it is raining, I will stay home.' },
      mistakes: 'Use なので, not だので, after nouns and な-adjectives.',
      related: ['noni'],
      questions: [
        mc('Sentence completion', '今日は暇___、映画を見に行きます。 (Because I am free today, I will go to a movie.)', ['なので', 'だので', 'ので', 'のだので'], 'なので', '暇 is a な-adjective, so it takes なので.'),
        tx('Fill in the blank', '頭が痛い___、早く寝ます。 (My head hurts, so I will go to bed early. Use ので.)', ['ので'], 'Plain form 痛い + ので gives the reason.'),
        od('Arrange the pieces: I closed the window because it was cold.', ['寒い', 'ので', '窓を', '閉めました'], 'The reason (寒いので) comes first, then the result.', 'medium')
      ] },
    { id: 'noni', pattern: '～のに', category: 'Reasons & Contrast', meaning: 'even though / although (with surprise or disappointment)',
      formation: 'Plain form + のに. Nouns and な-adjectives take な: 春なのに.',
      usage: 'The result is the opposite of what you expected, and you feel surprised or disappointed.',
      example: { jp: '勉強したのに、テストが難しかったです。', kana: 'べんきょうしたのに、テストがむずかしかったです。', en: 'Even though I studied, the test was hard.' },
      mistakes: 'Do not follow のに with a request or command. Do not confuse it with ので (reason).',
      related: ['node'],
      questions: [
        mc('Multiple choice', 'Which sentence means "Even though it is spring, it is cold"?', ['春なのに、寒いです。', '春なので、寒いです。', '春だのに、寒いです。', '春のに、寒いです。'], '春なのに、寒いです。', 'のに shows a contrast. 春なので means "because it is spring". After a noun use なのに.'),
        mc('Sentence completion', '薬を飲んだ___、熱が下がりません。 (Even though I took medicine, my fever has not gone down.)', ['のに', 'ので', 'から', 'ために'], 'のに', 'The result is not what you expected, so のに fits.', 'medium'),
        tx('Translation', 'Translate: I invited him, but he did not come. (誘う = to invite)', ['彼を誘ったのに来ませんでした', '誘ったのに来ませんでした', '彼を誘ったのに彼は来ませんでした', 'かれをさそったのにきませんでした', 'さそったのにきませんでした', 'かれをさそったのにかれはきませんでした'], 'Plain past 誘った + のに, then the unexpected result.', 'hard')
      ] },
    { id: 'morau', pattern: '～てもらう', category: 'Giving & Receiving', meaning: 'to have someone do something for me',
      formation: 'て-form + もらう. The person who does the action is marked with に.',
      usage: 'You receive a favor. The focus is on the person who receives it.',
      example: { jp: '友達に宿題を手伝ってもらいました。', kana: 'ともだちにしゅくだいをてつだってもらいました。', en: 'I had my friend help me with my homework.' },
      mistakes: 'The doer takes に, not が (友達が手伝ってもらった is wrong).',
      related: [],
      questions: [
        mc('Multiple choice', '先生___日本語を直してもらいました。 (I had my teacher correct my Japanese.)', ['に', 'が', 'を', 'で'], 'に', 'With てもらう the person who does the favor is marked with に.'),
        mc('Identify the incorrect sentence', 'Which sentence is incorrect?', ['母に料理を教えてもらいました。', '友達に傘を貸してもらいました。', '先生が作文を直してもらいました。', '田中さんに写真を撮ってもらいました。'], '先生が作文を直してもらいました。', 'The doer should be 先生に. Correct: 先生に作文を直してもらいました。', 'medium'),
        tx('Fill in the blank', '兄に車で送っ___ました。 (My older brother gave me a ride.)', ['てもらい'], '兄に + て-form + もらいました: I received the ride from my brother.', 'medium')
      ] },
    { id: 'nakereba', pattern: '～なければならない', category: 'Obligation', meaning: 'must / have to',
      formation: 'ない-form, drop い, add ければならない: 行かない → 行かなければならない. Polite: ～なければなりません.',
      usage: 'Says something is necessary or required. Also common: ～なくてはならない.',
      example: { jp: '明日は早く起きなければなりません。', kana: 'あしたははやくおきなければなりません。', en: 'I have to get up early tomorrow.' },
      mistakes: 'Start from the ない-form, not the ます-stem (行きなければ is wrong). Do not confuse it with なくてもいい (not necessary).',
      related: [],
      questions: [
        mc('Sentence completion', '毎日薬を飲___ならません。 (I have to take medicine every day.)', ['まなければ', 'みなければ', 'まないければ', 'んでなければ'], 'まなければ', '飲む → 飲まない → 飲まなければならない.'),
        od('Arrange the pieces: I have to take my passport.', ['パスポートを', '持って', '行かなければ', 'なりません'], '持って行く (take along) + なければなりません.', 'medium'),
        tx('Translation', 'Translate: I have to study tonight.', ['今晩勉強しなければなりません', '今夜勉強しなければなりません', '今晩は勉強しなければなりません', '今夜は勉強しなければなりません', '今晩勉強しなくてはなりません', '今夜勉強しなくてはなりません', 'こんばんべんきょうしなければなりません', 'こんやべんきょうしなければなりません', 'こんばんはべんきょうしなければなりません', 'こんやはべんきょうしなければなりません'], 'する → しない → しなければなりません.', 'medium')
      ] }
  ];

  const QUESTIONS = [];
  LESSONS.forEach(l => l.questions.forEach((q, i) => {
    q.id = l.id + '_' + (i + 1); q.category = l.category; q.lessonId = l.id; q.xp = 10;
    QUESTIONS.push(q);
  }));

  window.NekoGrammarData = { lessons: LESSONS, questions: QUESTIONS };
})();