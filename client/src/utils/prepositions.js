// Each scene: actor is placed relative to ref using layout
// layout: 'on' | 'under' | 'right' | 'left' | 'in' | 'between'
export const SCENES = [
  { preposition: 'ON',          actor: '🎾', ref: '📦', layout: 'on',      sentence: 'The ball is ___ the box'     },
  { preposition: 'ON',          actor: '🐱', ref: '🛋️', layout: 'on',      sentence: 'The cat is ___ the sofa'    },
  { preposition: 'ON',          actor: '🍎', ref: '🍽️', layout: 'on',      sentence: 'The apple is ___ the plate' },
  { preposition: 'UNDER',       actor: '🐶', ref: '🛏️', layout: 'under',   sentence: 'The dog is ___ the bed'     },
  { preposition: 'UNDER',       actor: '🐢', ref: '🍄', layout: 'under',   sentence: 'The turtle is ___ the mushroom' },
  { preposition: 'UNDER',       actor: '🌂', ref: '🌧️', layout: 'under',   sentence: 'Stand ___ the umbrella'     },
  { preposition: 'NEXT TO',     actor: '🌹', ref: '🏠', layout: 'right',   sentence: 'The flower is ___ the house' },
  { preposition: 'NEXT TO',     actor: '🐭', ref: '🧀', layout: 'right',   sentence: 'The mouse is ___ the cheese' },
  { preposition: 'NEXT TO',     actor: '🚗', ref: '🏫', layout: 'right',   sentence: 'The car is ___ the school'  },
  { preposition: 'IN',          actor: '🐟', ref: '🪣', layout: 'in',      sentence: 'The fish is ___ the bucket' },
  { preposition: 'IN',          actor: '🐰', ref: '🎩', layout: 'in',      sentence: 'The rabbit is ___ the hat'  },
  { preposition: 'IN',          actor: '🍬', ref: '🎁', layout: 'in',      sentence: 'The candy is ___ the box'   },
  { preposition: 'BEHIND',      actor: '🌙', ref: '☁️', layout: 'behind',  sentence: 'The moon is ___ the cloud'  },
  { preposition: 'BEHIND',      actor: '🐱', ref: '🌳', layout: 'behind',  sentence: 'The cat is ___ the tree'    },
  { preposition: 'IN FRONT OF', actor: '🐶', ref: '🏫', layout: 'front',   sentence: 'The dog is ___ the school'  },
  { preposition: 'IN FRONT OF', actor: '⭐', ref: '🌙', layout: 'front',   sentence: 'The star is ___ the moon'   },
  { preposition: 'BETWEEN',     actor: '🌸', ref: '🌳', layout: 'between', sentence: 'The flower is ___ the trees' },
  { preposition: 'BETWEEN',     actor: '🐧', ref: '⛄', layout: 'between', sentence: 'The penguin is ___ the snowmen' },
]

const ALL_PREPOSITIONS = ['ON', 'UNDER', 'NEXT TO', 'IN', 'BEHIND', 'IN FRONT OF', 'BETWEEN']

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
