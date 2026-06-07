export const NUMBERS = [
  { digit: 1,  word: 'ONE'       },
  { digit: 2,  word: 'TWO'       },
  { digit: 3,  word: 'THREE'     },
  { digit: 4,  word: 'FOUR'      },
  { digit: 5,  word: 'FIVE'      },
  { digit: 6,  word: 'SIX'       },
  { digit: 7,  word: 'SEVEN'     },
  { digit: 8,  word: 'EIGHT'     },
  { digit: 9,  word: 'NINE'      },
  { digit: 10, word: 'TEN'       },
  { digit: 11, word: 'ELEVEN'    },
  { digit: 12, word: 'TWELVE'    },
  { digit: 13, word: 'THIRTEEN'  },
  { digit: 14, word: 'FOURTEEN'  },
  { digit: 15, word: 'FIFTEEN'   },
  { digit: 16, word: 'SIXTEEN'   },
  { digit: 17, word: 'SEVENTEEN' },
  { digit: 18, word: 'EIGHTEEN'  },
  { digit: 19, word: 'NINETEEN'  },
  { digit: 20, word: 'TWENTY'    },
]

export function generateNumberQuestion(usedIndices) {
  const available = NUMBERS.map((_, i) => i).filter(i => !usedIndices.has(i))
  const pool = available.length > 0 ? available : NUMBERS.map((_, i) => i)
  const idx     = pool[Math.floor(Math.random() * pool.length)]
  const correct = NUMBERS[idx]

  const others = NUMBERS.filter((_, i) => i !== idx)
  const distractors = others.sort(() => Math.random() - 0.5).slice(0, 3)
  const answers = [correct, ...distractors].sort(() => Math.random() - 0.5)

  return { index: idx, digit: correct.digit, correct: correct.word, answers }
}
