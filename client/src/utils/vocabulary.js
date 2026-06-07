export const WORDS = [
  // Animals
  { word: 'DOG',        emoji: '🐶' },
  { word: 'CAT',        emoji: '🐱' },
  { word: 'FISH',       emoji: '🐟' },
  { word: 'ELEPHANT',   emoji: '🐘' },
  { word: 'LION',       emoji: '🦁' },
  { word: 'BIRD',       emoji: '🐦' },
  { word: 'RABBIT',     emoji: '🐰' },
  { word: 'HORSE',      emoji: '🐴' },
  { word: 'COW',        emoji: '🐮' },
  { word: 'PIG',        emoji: '🐷' },
  { word: 'MONKEY',     emoji: '🐵' },
  { word: 'BEAR',       emoji: '🐻' },
  { word: 'DUCK',       emoji: '🦆' },
  { word: 'FROG',       emoji: '🐸' },
  { word: 'OWL',        emoji: '🦉' },
  { word: 'TIGER',      emoji: '🐯' },
  { word: 'PENGUIN',    emoji: '🐧' },
  { word: 'BUTTERFLY',  emoji: '🦋' },
  { word: 'SNAKE',      emoji: '🐍' },
  { word: 'TURTLE',     emoji: '🐢' },
  // Food
  { word: 'APPLE',      emoji: '🍎' },
  { word: 'BANANA',     emoji: '🍌' },
  { word: 'PIZZA',      emoji: '🍕' },
  { word: 'CAKE',       emoji: '🎂' },
  { word: 'BREAD',      emoji: '🍞' },
  { word: 'EGG',        emoji: '🥚' },
  { word: 'ICE CREAM',  emoji: '🍦' },
  { word: 'COOKIE',     emoji: '🍪' },
  { word: 'BURGER',     emoji: '🍔' },
  { word: 'STRAWBERRY', emoji: '🍓' },
  { word: 'WATERMELON', emoji: '🍉' },
  { word: 'GRAPES',     emoji: '🍇' },
  { word: 'LEMON',      emoji: '🍋' },
  { word: 'CHERRY',     emoji: '🍒' },
  // Nature & objects
  { word: 'SUN',        emoji: '☀️' },
  { word: 'MOON',       emoji: '🌙' },
  { word: 'STAR',       emoji: '⭐' },
  { word: 'TREE',       emoji: '🌳' },
  { word: 'FLOWER',     emoji: '🌸' },
  { word: 'HOUSE',      emoji: '🏠' },
  { word: 'CAR',        emoji: '🚗' },
  { word: 'BALL',       emoji: '⚽' },
  { word: 'BOOK',       emoji: '📚' },
  { word: 'ROCKET',     emoji: '🚀' },
  { word: 'RAINBOW',    emoji: '🌈' },
  { word: 'FIRE',       emoji: '🔥' },
  { word: 'UMBRELLA',   emoji: '☂️' },
  { word: 'DIAMOND',    emoji: '💎' },
]

export function generateVocabQuestion(usedIndices) {
  const available = WORDS
    .map((w, i) => i)
    .filter(i => !usedIndices.has(i))

  const idx     = available[Math.floor(Math.random() * available.length)]
  const correct = WORDS[idx]

  // pick 3 distractors
  const pool = WORDS.map((_, i) => i).filter(i => i !== idx)
  const distractors = []
  while (distractors.length < 3) {
    const r = pool.splice(Math.floor(Math.random() * pool.length), 1)[0]
    distractors.push(WORDS[r])
  }

  const answers = [correct, ...distractors].sort(() => Math.random() - 0.5)
  return { index: idx, word: correct.word, correct: correct.emoji, answers }
}
