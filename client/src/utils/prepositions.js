// layout: 'on' | 'under' | 'next-to' | 'in' | 'between'
export const SCENES = [
  // ON
  { preposition: 'ON',      actor: '🎾', ref: '📦', layout: 'on',      sentence: 'The ball is ___ the box'      },
  { preposition: 'ON',      actor: '🐱', ref: '🛋️', layout: 'on',      sentence: 'The cat is ___ the sofa'     },
  { preposition: 'ON',      actor: '🍎', ref: '🍽️', layout: 'on',      sentence: 'The apple is ___ the plate'  },
  { preposition: 'ON',      actor: '⭐', ref: '🎂', layout: 'on',      sentence: 'The star is ___ the cake'     },
  // UNDER
  { preposition: 'UNDER',   actor: '🐶', ref: '🛏️', layout: 'under',   sentence: 'The dog is ___ the bed'      },
  { preposition: 'UNDER',   actor: '🌂', ref: '☁️', layout: 'under',   sentence: 'The umbrella is ___ the cloud'},
  { preposition: 'UNDER',   actor: '🐢', ref: '🍄', layout: 'under',   sentence: 'The turtle is ___ the mushroom'},
  { preposition: 'UNDER',   actor: '🐭', ref: '🪑', layout: 'under',   sentence: 'The mouse is ___ the chair'  },
  // NEXT TO
  { preposition: 'NEXT TO', actor: '🌹', ref: '🏠', layout: 'next-to', sentence: 'The flower is ___ the house' },
  { preposition: 'NEXT TO', actor: '🚗', ref: '🌳', layout: 'next-to', sentence: 'The car is ___ the tree'     },
  { preposition: 'NEXT TO', actor: '🐸', ref: '🪷', layout: 'next-to', sentence: 'The frog is ___ the flower'  },
  { preposition: 'NEXT TO', actor: '🧸', ref: '📚', layout: 'next-to', sentence: 'The teddy is ___ the book'   },
  // IN
  { preposition: 'IN',      actor: '🐟', ref: '🪣', layout: 'in',      sentence: 'The fish is ___ the bucket'  },
  { preposition: 'IN',      actor: '🐰', ref: '🎩', layout: 'in',      sentence: 'The rabbit is ___ the hat'   },
  { preposition: 'IN',      actor: '🍬', ref: '🎁', layout: 'in',      sentence: 'The candy is ___ the box'    },
  { preposition: 'IN',      actor: '🐣', ref: '🥚', layout: 'in',      sentence: 'The chick is ___ the egg'    },
  // BETWEEN
  { preposition: 'BETWEEN', actor: '🌸', ref: '🌳', layout: 'between', sentence: 'The flower is ___ the trees' },
  { preposition: 'BETWEEN', actor: '🐧', ref: '⛄', layout: 'between', sentence: 'The penguin is ___ the snowmen'},
  { preposition: 'BETWEEN', actor: '🌙', ref: '⭐', layout: 'between', sentence: 'The moon is ___ the stars'   },
  { preposition: 'BETWEEN', actor: '🍌', ref: '🍎', layout: 'between', sentence: 'The banana is ___ the apples' },
]

const ALL_PREPOSITIONS = ['ON', 'UNDER', 'NEXT TO', 'IN', 'BETWEEN']

export function generatePrepositionQuestion(usedIndices) {
  const available = SCENES.map((_, i) => i).filter(i => !usedIndices.has(i))
  const pool = available.length > 0 ? available : SCENES.map((_, i) => i)
  const idx   = pool[Math.floor(Math.random() * pool.length)]
  const scene = SCENES[idx]

  const distractors = ALL_PREPOSITIONS
    .filter(p => p !== scene.preposition)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)

  const answers = [scene.preposition, ...distractors].sort(() => Math.random() - 0.5)
  return { index: idx, scene, correct: scene.preposition, answers }
}
