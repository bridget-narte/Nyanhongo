// Particle CONTENT only. Every question is multiple choice with exactly one correct particle.
// Add a question with q(level, answer, [3 wrong particles], sentence with ___, English, why, [example jp, en], optionalPairId)
(function () {
  const order = ['は', 'が', 'を', 'に', 'で', 'へ', 'と', 'も', 'の', 'から', 'まで', 'より', 'や', 'か', 'しか', 'だけ', 'でも', 'など'];

  // What each particle normally does. Used in the guide and to explain wrong choices.
  const roles = {
    'は': 'marks the topic (what you are talking about), or a contrast',
    'が': 'marks the subject, especially new information, question words, and things you like or can do',
    'を': 'marks the direct object of an action',
    'に': 'marks a point in time, where something exists, a target or receiver, or the purpose of going',
    'で': 'marks where an action happens, or the means or tool used',
    'へ': 'marks the direction you move toward',
    'と': 'means "with" or "and" (a complete list), or marks a quotation',
    'も': 'means "also" or "too"',
    'の': 'links nouns (possession or description)',
    'から': 'means "from", or "because" after a sentence',
    'まで': 'means "until" or "up to"',
    'より': 'means "than" when comparing',
    'や': 'lists examples ("A and B, among other things")',
    'か': 'turns a sentence into a question, or means "or" between choices',
    'しか': 'means "only" and always needs a negative ending',
    'だけ': 'means "only" and goes with a positive or negative ending',
    'でも': 'means "or something" (a soft suggestion), "even", or "any-" (何でも)',
    'など': 'means "and so on" or "such as"'
  };

  const combos = [
    ['～に行く / ～に来る', 'Purpose: 食べに行きます (I go to eat).'],
    ['～から～まで', 'From … until …: 九時から五時まで働きます.'],
    ['～しか～ない', 'Only, and it is not enough: 百円しかありません.'],
    ['～や～など', 'Examples and so on: りんごやみかんなどを買いました.'],
    ['～でも', 'Or something / any-: お茶でもどうですか。 何でも食べます.'],
    ['～には / ～では', 'A place particle plus は for topic or contrast: ここでは話せません.']
  ];

  const lessons = [
    { id: 'wa-ga', title: 'は vs が', points: [['は', 'Marks the topic: something you are already talking about, or a contrast ("as for X").'], ['が', 'Points at the subject itself: new information, question words (誰が, 何が), and the thing you like or can do (〜が好きです).']],
      examples: [['あそこに猫がいます。', 'There is a cat over there. (new information)'], ['その猫は白いです。', 'That cat is white. (the cat is now known)']] },
    { id: 'ni-de', title: 'に vs で', points: [['に', 'Where something exists (あります・います), a point in time, a target or receiver.'], ['で', 'Where an action takes place, or the means or tool used.']],
      examples: [['机の上に本があります。', 'There is a book on the desk. (existence)'], ['図書館で勉強します。', 'I study at the library. (action)']] },
    { id: 'ni-he', title: 'に vs へ', points: [['に', 'An exact point: a time, a receiver, a place where something ends up. It can also mark a destination.'], ['へ', 'Only the direction of movement. It cannot mark time or a receiver.']],
      examples: [['七時に起きます。', 'I get up at seven. (time needs に)'], ['学校へ行きます。', 'I go to school. (へ or に both work for a destination)']] },
    { id: 'kara-made', title: 'から vs まで', points: [['から', 'The starting point of a time or place ("from"). After a sentence it also means "because".'], ['まで', 'The end point ("until", "up to").']],
      examples: [['九時から五時まで働きます。', 'I work from nine to five.'], ['駅まで歩きます。', 'I walk as far as the station.']] },
    { id: 'shika-dake', title: 'しか vs だけ', points: [['だけ', '"Only" with a positive or negative ending, just stating the amount.'], ['しか', '"Only" with a negative ending, often meaning "that is not much" or "not enough".']],
      examples: [['水だけ飲みます。', 'I drink only water.'], ['水しか飲みません。', 'I drink nothing but water. (that is all there is)']] }
  ];

  const q = (level, answer, wrong, sentence, en, why, ex, pair) => ({ level, answer, options: [answer].concat(wrong), q: sentence, en, why, example: { jp: ex[0], en: ex[1] }, pair: pair || null });

  const questions = [
    // Basic review
    q('basic', 'を', ['が', 'に', 'で'], '毎朝、パン___食べます。', 'I eat bread every morning.', 'を marks the direct object, the thing being eaten.', ['水を飲みます。', 'I drink water.']),
    q('basic', 'は', ['を', 'に', 'で'], '私___学生です。', 'I am a student.', 'は marks the topic: "As for me, I am a student."', ['これは本です。', 'This is a book.']),
    q('basic', 'が', ['を', 'に', 'で'], '誰___来ましたか。', 'Who came?', 'A question word like 誰 is the subject, and が marks the subject.', ['何がありますか。', 'What is there?']),
    q('basic', 'に', ['で', 'を', 'へ'], '毎朝七時___起きます。', 'I get up at seven every morning.', 'に marks a specific point in time, such as a clock time.', ['三時に会いましょう。', 'Let us meet at three.']),
    q('basic', 'で', ['に', 'を', 'へ'], '図書館___本を読みます。', 'I read books at the library.', 'で marks the place where an action happens.', ['公園で遊びます。', 'I play in the park.']),
    q('basic', 'へ', ['で', 'を', 'と'], '明日、東京___行きます。', 'I will go to Tokyo tomorrow.', 'へ marks the direction of movement. (に would also work here, but it is not one of the choices.)', ['学校へ行きます。', 'I go to school.']),
    q('basic', 'と', ['に', 'で', 'を'], '友達___映画を見ました。', 'I watched a movie with a friend.', 'と means "with" when you do something together with someone.', ['母と買い物に行きます。', 'I go shopping with my mother.']),
    q('basic', 'も', ['は', 'が', 'に'], '私はコーヒーを飲みます。弟___飲みます。', 'I drink coffee. My younger brother drinks it too.', 'も means "also", so it adds another person to the same action. Without も the sentence would not say "too".', ['私も行きます。', 'I will go too.']),
    q('basic', 'の', ['が', 'を', 'に'], 'これは私___本です。', 'This is my book.', 'の links two nouns. Here it shows possession: "my book".', ['先生の車です。', 'It is the teacher\'s car.']),
    q('basic', 'から', ['に', 'で', 'を'], '私は朝七時___夜十時まで働きます。', 'I work from seven in the morning until ten at night.', 'から marks the starting point ("from"). It pairs with まで for the end point.', ['九時から始まります。', 'It starts from nine.']),
    q('basic', 'まで', ['から', 'に', 'へ'], '昨日は夜の十二時___勉強しました。', 'Yesterday I studied until midnight.', 'まで marks the end point ("until"). から would mean "from midnight".', ['駅まで歩きます。', 'I walk as far as the station.']),
    // N4-level uses
    q('n4', 'より', ['と', 'から', 'まで'], '東京は大阪___人が多いです。', 'Tokyo has more people than Osaka.', 'より marks the thing you compare against ("than").', ['今日は昨日より暑いです。', 'Today is hotter than yesterday.']),
    q('n4', 'や', ['か', 'も', 'を'], '冷蔵庫に卵___牛乳などがあります。', 'There are eggs, milk and so on in the fridge.', 'や lists examples out of a longer list, and it often goes with など.', ['りんごやバナナを買います。', 'I buy apples, bananas and so on.']),
    q('n4', 'か', ['も', 'を', 'に'], 'あの人は先生です___。', 'Is that person a teacher?', 'か at the end of a sentence turns it into a question.', ['お名前は何ですか。', 'What is your name?']),
    q('n4', 'しか', ['だけ', 'も', 'が'], '財布に百円___ありません。', 'I only have 100 yen in my wallet.', 'しか means "only" and must be followed by a negative (ありません).', ['水しか飲みません。', 'I drink nothing but water.']),
    q('n4', 'だけ', ['しか', 'も', 'が'], '私の家には犬___います。', 'There is only a dog in my house.', 'だけ means "only" and goes with a positive ending like います. しか would need a negative.', ['一つだけ食べます。', 'I eat just one.']),
    q('n4', 'でも', ['だけ', 'しか', 'まで'], 'お茶___飲みませんか。', 'Would you like to have tea or something?', 'でも softens an invitation: "tea or something".', ['コーヒーでもどうですか。', 'How about coffee or something?']),
    q('n4', 'など', ['だけ', 'より', 'から'], 'りんごやみかん___を買いました。', 'I bought apples, oranges and so on.', 'など means "and so on" after one or more examples.', ['本などを読みます。', 'I read books and the like.']),
    q('n4', 'に', ['で', 'を', 'へ'], '昼ご飯を食べ___行きます。', 'I am going out to eat lunch.', 'After the ます-stem of a verb (食べ), に shows the purpose of going or coming.', ['本を買いに行きます。', 'I go to buy a book.']),
    q('n4', 'に', ['を', 'で', 'へ'], '母___プレゼントをもらいました。', 'I got a present from my mother.', 'With もらう, the person you receive from is marked with に.', ['友達に本を借りました。', 'I borrowed a book from a friend.']),
    q('n4', 'と', ['を', 'に', 'で'], '彼は「明日来る」___言いました。', 'He said, "I will come tomorrow."', 'と marks a quotation: the words someone said or thought.', ['雨が降ると思います。', 'I think it will rain.']),
    q('n4', 'から', ['まで', 'より', 'でも'], '寒い___、窓を閉めます。', 'It is cold, so I will close the window.', 'After a sentence, から means "because" or "so" and gives the reason.', ['忙しいから行きません。', 'I am busy, so I will not go.']),
    // Similar-particle comparison
    q('n4', 'が', ['は', 'を', 'へ'], 'あそこに猫___います。', 'There is a cat over there.', 'The cat is new information you just noticed, so が marks it as the subject. は would treat it as already known.', ['庭に花が咲いています。', 'Flowers are blooming in the garden.'], 'wa-ga'),
    q('n4', 'は', ['が', 'を', 'へ'], 'さっき猫がいました。その猫___白かったです。', 'Earlier there was a cat. That cat was white.', 'The cat was already mentioned, so it is now the known topic and は marks it. が would sound like you are singling the cat out.', ['この本は面白いです。', 'This book is interesting. (the book is already known)'], 'wa-ga'),
    q('n4', 'で', ['に', 'を', 'が'], '公園___友達と遊びました。', 'I played with my friend in the park.', 'で marks the place where an action (遊びました) happens.', ['教室で勉強します。', 'I study in the classroom.'], 'ni-de'),
    q('n4', 'に', ['で', 'を', 'と'], 'テーブルの上___猫がいます。', 'There is a cat on the table.', 'に marks where something exists (with います or あります). で is for where an action takes place.', ['机の上に本があります。', 'There is a book on the desk.'], 'ni-de'),
    q('n4', 'に', ['へ', 'で', 'を'], '日曜日___友達と買い物に行きます。', 'On Sunday I will go shopping with a friend.', 'に marks a point in time such as a day of the week. へ only shows direction, so it cannot mark time.', ['七時に起きます。', 'I get up at seven.'], 'ni-he'),
    q('n4', 'に', ['へ', 'で', 'を'], 'かばん___財布を入れました。', 'I put my wallet in the bag.', 'に marks the place where something ends up. へ shows a direction of travel, so it does not fit placing an object.', ['机の上に本を置きます。', 'I put a book on the desk.'], 'ni-he'),
    q('n4', 'から', ['まで', 'と', 'の'], '会議は三時___始まります。', 'The meeting starts from three o\'clock.', 'から marks where a time begins ("from"). まで marks where it ends.', ['九時から五時まで働きます。', 'I work from nine to five.'], 'kara-made'),
    q('n4', 'まで', ['から', 'と', 'の'], 'このお店は夜十二時___開いています。', 'This shop is open until midnight.', 'まで marks where a time ends ("until"). から would mean "from midnight".', ['駅まで歩きます。', 'I walk as far as the station.'], 'kara-made'),
    q('n4', 'しか', ['だけ', 'も', 'が'], '時間はあと十五分___ありません。', 'I only have fifteen minutes left.', 'しか means "only" and needs a negative ending (ありません). It also suggests "that is not enough".', ['千円しか持っていません。', 'I only have 1,000 yen (not enough).'], 'shika-dake'),
    q('n4', 'だけ', ['しか', 'より', 'まで'], 'このことは先生___知っています。', 'Only the teacher knows about this.', 'だけ means "only" with a positive ending (知っています). しか would need 知りません.', ['私だけ行きます。', 'Only I will go.'], 'shika-dake')
  ];

  // Fields the shared quiz engine expects.
  questions.forEach((x, i) => {
    x.id = 'p_' + String(i + 1).padStart(2, '0');
    x.kind = 'mc'; x.mode = x.pair ? 'Comparison' : x.level === 'basic' ? 'Basic' : 'N4-Level';
    x.explanation = x.why; x.category = x.pair || x.level; x.difficulty = x.level === 'basic' ? 'easy' : 'medium'; x.xp = 10;
  });

  window.NekoParticleData = { order, roles, combos, lessons, questions };
})();
