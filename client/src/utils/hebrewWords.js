// ── Word bank ─────────────────────────────────────────────────────────
// Grouped by semantic category so distractors are meaningful + confusable
export const WORDS = [
  // גוף
  'ראש','רגל','יד','עין','אף','פה','אוזן','כתף','בטן','גב','לשון','שן',
  // בעלי חיים
  'כלב','חתול','פרה','סוס','ציפור','דג','ארנב','צב','עכבר','גמל','נמר','דוב',
  // משפחה
  'אמא','אבא','אח','אחות','סבא','סבתא','דוד','דודה','ילד','ילדה',
  // בית
  'בית','דלת','חלון','שולחן','כיסא','מיטה','ספה','מקרר','אמבטיה','מטבח',
  // טבע
  'שמש','ירח','כוכב','ענן','גשם','שלג','רוח','ים','הר','נהר','עץ','פרח',
  // אוכל
  'לחם','חלב','ביצה','תפוח','בננה','עוגה','גלידה','עוגיה','מרק','שוקו',
  // צבעים
  'אדום','כחול','ירוק','צהוב','כתום','סגול','ורוד','שחור','לבן','חום',
  // פעולות
  'אוכל','שותה','רץ','קופץ','ישן','קורא','כותב','צוחק','בוכה','שר','משחק','צועק',
  // בית ספר
  'ספר','עיפרון','מחברת','תיק','כיתה','מורה','לוח','שיעור','הפסקה','ציון',
  // רגשות
  'שמח','עצוב','כועס','מפחד','נרגש','עייף','רעב','צמא',
]

// ── Similar-looking Hebrew letters ────────────────────────────────────
const SIMILAR_LETTERS = {
  'ד': ['ר'],
  'ר': ['ד'],
  'ה': ['ח', 'ת'],
  'ח': ['ה', 'ת'],
  'ת': ['ח', 'ה'],
  'ב': ['כ'],
  'כ': ['ב'],
  'ו': ['ז', 'י'],
  'ז': ['ו'],
  'י': ['ו'],
  'מ': ['ס'],
  'ס': ['מ'],
  'פ': ['ף'],
  'ף': ['פ'],
  'נ': ['ג'],
  'ג': ['ג'],
  'ק': ['ף'],
  'ל': ['כ'],
  'ע': ['צ'],
}

function swapLetter(word) {
  // find all swappable positions
  const positions = []
  for (let i = 0; i < word.length; i++) {
    if (SIMILAR_LETTERS[word[i]]) positions.push(i)
  }
  if (positions.length === 0) return null
  const pos = positions[Math.floor(Math.random() * positions.length)]
  const alts = SIMILAR_LETTERS[word[pos]]
  const alt  = alts[Math.floor(Math.random() * alts.length)]
  return word.slice(0, pos) + alt + word.slice(pos + 1)
}

function makeVisualDistractor(word) {
  // Try up to 5 times to produce a different word
  for (let i = 0; i < 5; i++) {
    const d = swapLetter(word)
    if (d && d !== word) return d
  }
  return null
}

// ── Question generator ─────────────────────────────────────────────────
export function generateFlashQuestion(usedIndices) {
  const available = WORDS.map((_, i) => i).filter(i => !usedIndices.has(i))
  const idx     = available[Math.floor(Math.random() * available.length)]
  const correct = WORDS[idx]

  const distractors = new Set()

  // 1. Visual distractor (letter swap) — most educationally valuable
  const visual = makeVisualDistractor(correct)
  if (visual) distractors.add(visual)

  // 2. Semantic distractors — same length ± 1 from the pool
  const pool = WORDS.filter((w, i) => i !== idx && w !== correct)
  const byLen = pool.filter(w => Math.abs(w.length - correct.length) <= 1)
  const src   = byLen.length >= 6 ? byLen : pool

  let attempts = 0
  while (distractors.size < 3 && attempts < 60) {
    const w = src[Math.floor(Math.random() * src.length)]
    if (w !== correct) distractors.add(w)
    attempts++
  }

  const answers = [correct, ...Array.from(distractors).slice(0, 3)]
    .sort(() => Math.random() - 0.5)

  return { index: idx, correct, answers }
}

// ── Flash duration by question number ────────────────────────────────
// Starts comfortable, gets progressively shorter
export function getFlashDuration(qNum) {
  if (qNum < 5)  return 1800
  if (qNum < 10) return 1400
  if (qNum < 15) return 1100
  if (qNum < 20) return 850
  return 600
}

export function getSpeedLabel(qNum) {
  if (qNum < 5)  return { label: '🐢 מתחילים',   color: '#4ade80' }
  if (qNum < 10) return { label: '🚶 מהיר קצת',  color: '#a3e635' }
  if (qNum < 15) return { label: '🏃 מהיר!',      color: '#fbbf24' }
  if (qNum < 20) return { label: '⚡ מהיר מאוד', color: '#fb923c' }
  return              { label: '🚀 בזק!',          color: '#f87171' }
}
