export const COLORS = [
  { word: 'RED',    hex: '#EF4444', label: 'אדום' },
  { word: 'BLUE',   hex: '#3B82F6', label: 'כחול' },
  { word: 'GREEN',  hex: '#22C55E', label: 'ירוק' },
  { word: 'YELLOW', hex: '#EAB308', label: 'צהוב' },
  { word: 'ORANGE', hex: '#F97316', label: 'כתום' },
  { word: 'PURPLE', hex: '#A855F7', label: 'סגול' },
  { word: 'PINK',   hex: '#EC4899', label: 'ורוד' },
  { word: 'BLACK',  hex: '#1F2937', label: 'שחור' },
  { word: 'WHITE',  hex: '#F9FAFB', label: 'לבן'  },
  { word: 'BROWN',  hex: '#92400E', label: 'חום'  },
  { word: 'GRAY',   hex: '#6B7280', label: 'אפור' },
  { word: 'CYAN',   hex: '#06B6D4', label: 'תכלת' },
]

// mode A: show color swatch → pick word
// mode B: show word         → pick color swatch
export function generateColorQuestion(usedIndices) {
  const available = COLORS.map((_, i) => i).filter(i => !usedIndices.has(i))
  const idx     = available[Math.floor(Math.random() * available.length)]
  const correct = COLORS[idx]

  const pool       = COLORS.map((_, i) => i).filter(i => i !== idx)
  const distractors = []
  while (distractors.length < 3) {
    const r = pool.splice(Math.floor(Math.random() * pool.length), 1)[0]
    distractors.push(COLORS[r])
  }

  const answers = [correct, ...distractors].sort(() => Math.random() - 0.5)
  const mode    = Math.random() < 0.5 ? 'color-to-word' : 'word-to-color'

  return { index: idx, correct, answers, mode }
}
