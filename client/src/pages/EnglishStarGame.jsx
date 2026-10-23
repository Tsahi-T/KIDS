import { useState, useRef } from 'react'
import AvatarDisplay from '../components/AvatarDisplay.jsx'
import { addCoins, getCoins } from '../utils/coins.js'

// ── Data ────────────────────────────────────────────────────────────────────

const OPPOSITES = [
  ['beautiful', 'ugly'],
  ['clean',     'dirty'],
  ['easy',      'hard'],
  ['new',       'old'],
  ['poor',      'rich'],
  ['warm',      'cool'],
  ['fast',      'slow'],
  ['strong',    'weak'],
]

const FILL_QUESTIONS = [
  { before: 'I am very', after: '. I need to sleep.',      answer: 'tired'     },
  { before: 'The nurse is', after: 'to everyone.',         answer: 'kind'      },
  { before: 'She is', after: '. Everyone knows her.',      answer: 'famous'    },
  { before: 'The flowers are', after: '.',                 answer: 'beautiful' },
  { before: 'You are', after: '! We love you.',            answer: 'special'   },
  { before: 'Water is', after: 'for your health.',         answer: 'important' },
  { before: 'The lion is big and', after: '.',             answer: 'strong'    },
  { before: 'The baby is so', after: '.',                  answer: 'young'     },
]
const FILL_BANK = ['tired', 'kind', 'famous', 'beautiful', 'special', 'important', 'strong', 'young']

const REF_WORDS = [
  'doctor', 'nurse', 'king', 'prince', 'princess', 'policeman', 'waiter', 'guard', 'driver',
  'kind', 'brave', 'strong', 'special', 'famous', 'tired', 'beautiful',
  'young', 'old', 'rich', 'poor', 'funny', 'clean', 'fast', 'warm', 'sweet', 'ugly',
]

const COINS_OPP  = 5
const COINS_FILL = 5
const COINS_SENT = 8
const TOTAL      = OPPOSITES.length + FILL_QUESTIONS.length + 4 // 20

// ── Helpers ──────────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function validateSentence(raw) {
  const t = raw.trim()
  if (!t)                                                   return { ok: false, hint: 'המשפט ריק' }
  if (!/^[A-Z]/.test(t))                                   return { ok: false, hint: 'התחל באות גדולה!' }
  if (!t.endsWith('.'))                                     return { ok: false, hint: 'שים נקודה בסוף.' }
  if (!/\b(am|is|are)\b/i.test(t))                         return { ok: false, hint: 'חסר am / is / are' }
  return { ok: true, hint: '✓ מעולה!' }
}

// ── Component ────────────────────────────────────────────────────────────────

export default function EnglishStarGame({ player, onGameOver }) {
  // shared
  const scoreRef     = useRef(0)
  const [coins, setCoinsDisp] = useState(getCoins())
  const [phase, setPhase]     = useState('opposites') // 'opposites'|'fill'|'sentences'

  // ── Part 1: opposites
  const leftCol  = useRef(shuffle(OPPOSITES.map(p => p[0])))
  const rightCol = useRef(shuffle(OPPOSITES.map(p => p[1])))
  const [matchedLeft,  setMatchedLeft]  = useState(new Set())
  const [selLeft,      setSelLeft]      = useState(null)
  const [shakeLeft,    setShakeLeft]    = useState(null)
  const [shakeRight,   setShakeRight]   = useState(null)
  const [oppScore,     setOppScore]     = useState(0)
  const [oppCoinPop,   setOppCoinPop]   = useState(null)

  // ── Part 2: fill-in-blank
  const fillOrder  = useRef(shuffle([...Array(FILL_QUESTIONS.length).keys()]))
  const usedBank   = useRef(new Set())
  const lockedFill = useRef(false)
  const [fillIdx,      setFillIdx]      = useState(0)
  const [fillSel,      setFillSel]      = useState(null)
  const [fillFeedback, setFillFeedback] = useState(null)  // 'ok'|'bad'
  const [fillScore,    setFillScore]    = useState(0)
  const [fillCoinPop,  setFillCoinPop]  = useState(null)

  // ── Part 3: sentences
  const [sentences, setSentences] = useState(['', '', '', ''])
  const [sentResults, setSentResults] = useState(null)

  // ── Part 1 handlers ──────────────────────────────────────────────────────
  function clickLeft(word) {
    if (matchedLeft.has(word)) return
    setSelLeft(prev => prev === word ? null : word)
  }

  function clickRight(word) {
    if (!selLeft) return
    const isRightMatched = OPPOSITES.some(p => p[1] === word && matchedLeft.has(p[0]))
    if (isRightMatched) return

    const valid = OPPOSITES.find(p => p[0] === selLeft && p[1] === word)
    if (valid) {
      addCoins(COINS_OPP)
      setCoinsDisp(getCoins())
      scoreRef.current++
      setOppScore(s => s + 1)
      setMatchedLeft(prev => new Set([...prev, selLeft]))
      setSelLeft(null)
      setOppCoinPop(Date.now())
      setTimeout(() => setOppCoinPop(null), 1100)
    } else {
      setShakeLeft(selLeft)
      setShakeRight(word)
      setTimeout(() => { setShakeLeft(null); setShakeRight(null); setSelLeft(null) }, 550)
    }
  }

  function isRightWordMatched(word) {
    return OPPOSITES.some(p => p[1] === word && matchedLeft.has(p[0]))
  }

  // ── Part 2 handlers ──────────────────────────────────────────────────────
  const currentFillQ = FILL_QUESTIONS[fillOrder.current[fillIdx]]

  function pickBankWord(word) {
    if (lockedFill.current || usedBank.current.has(word)) return
    lockedFill.current = true
    setFillSel(word)
    const correct = word === currentFillQ.answer
    setFillFeedback(correct ? 'ok' : 'bad')
    if (correct) {
      addCoins(COINS_FILL)
      setCoinsDisp(getCoins())
      scoreRef.current++
      setFillScore(s => s + 1)
      usedBank.current.add(word)
      setFillCoinPop(Date.now())
      setTimeout(() => setFillCoinPop(null), 1100)
    }
    setTimeout(() => {
      setFillFeedback(null)
      setFillSel(null)
      lockedFill.current = false
      if (fillIdx + 1 >= FILL_QUESTIONS.length) {
        setPhase('sentences')
      } else {
        setFillIdx(i => i + 1)
      }
    }, 1050)
  }

  // ── Part 3 handlers ──────────────────────────────────────────────────────
  function checkSentences() {
    const res = sentences.map(s => validateSentence(s))
    setSentResults(res)
    res.forEach(r => {
      if (r.ok) {
        addCoins(COINS_SENT)
        scoreRef.current++
      }
    })
    setCoinsDisp(getCoins())
  }

  function finish() {
    onGameOver(scoreRef.current, TOTAL, scoreRef.current >= TOTAL / 2)
  }

  // ── Progress bar ─────────────────────────────────────────────────────────
  const phasePct = phase === 'opposites' ? 0.1 + (oppScore / OPPOSITES.length) * 0.3
    : phase === 'fill' ? 0.4 + (fillScore / FILL_QUESTIONS.length) * 0.35
    : 0.75

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="estar-screen">

      {/* header */}
      <div className="estar-header">
        <div className="estar-header-left">
          <AvatarDisplay avatar={player.avatar} size={28} />
          <span className="estar-coins">🪙 {coins}</span>
        </div>
        <div className="estar-title">⭐ English Star</div>
        <div className="estar-score-chip">{scoreRef.current}/{TOTAL}</div>
      </div>

      {/* progress bar */}
      <div className="estar-prog-track">
        <div className="estar-prog-fill" style={{ width: `${phasePct * 100}%` }} />
      </div>

      {/* phase label */}
      <div className="estar-phase-row">
        <div className={`estar-phase-pill${phase === 'opposites' ? ' estar-phase-active' : ''}`}>א הפכים</div>
        <div className="estar-phase-line" />
        <div className={`estar-phase-pill${phase === 'fill' ? ' estar-phase-active' : ''}`}>ב השלם</div>
        <div className="estar-phase-line" />
        <div className={`estar-phase-pill${phase === 'sentences' ? ' estar-phase-active' : ''}`}>ג כתוב</div>
      </div>

      {/* ═══════════════ PART 1: OPPOSITES ═══════════════ */}
      {phase === 'opposites' && (
        <div className="estar-section">
          <div className="estar-instruction">
            <span>🔄</span> התאם כל מילה להפך שלה
          </div>

          <div className="estar-match-grid">
            {/* left column */}
            <div className="estar-match-col">
              {leftCol.current.map(word => {
                const isMatched = matchedLeft.has(word)
                const isSel     = selLeft === word
                const isShaking = shakeLeft === word
                return (
                  <button
                    key={word}
                    className={`estar-mword estar-mword-left
                      ${isMatched  ? ' estar-mword-matched' : ''}
                      ${isSel      ? ' estar-mword-sel' : ''}
                      ${isShaking  ? ' estar-mword-shake' : ''}
                    `}
                    onClick={() => clickLeft(word)}
                    disabled={isMatched}
                    dir="ltr"
                  >{word}</button>
                )
              })}
            </div>

            {/* right column */}
            <div className="estar-match-col">
              {rightCol.current.map(word => {
                const isMatched = isRightWordMatched(word)
                const isShaking = shakeRight === word
                return (
                  <button
                    key={word}
                    className={`estar-mword estar-mword-right
                      ${isMatched  ? ' estar-mword-matched' : ''}
                      ${isShaking  ? ' estar-mword-shake' : ''}
                      ${selLeft && !isMatched ? ' estar-mword-pickable' : ''}
                    `}
                    onClick={() => clickRight(word)}
                    disabled={isMatched}
                    dir="ltr"
                  >{word}</button>
                )
              })}
            </div>
          </div>

          <div className="estar-opp-tally">{oppScore} / {OPPOSITES.length} ✓</div>

          {matchedLeft.size === OPPOSITES.length && (
            <button className="estar-advance-btn" onClick={() => setPhase('fill')}>
              חלק ב׳ — השלם משפט ✏️
            </button>
          )}

          {oppCoinPop && (
            <div key={oppCoinPop} className="coin-float estar-coin-float">🪙 +{COINS_OPP}</div>
          )}
        </div>
      )}

      {/* ═══════════════ PART 2: FILL IN BLANK ═══════════════ */}
      {phase === 'fill' && (
        <div className="estar-section">
          <div className="estar-instruction">
            <span>✏️</span> בחר את המילה המתאימה
          </div>
          <div className="estar-fill-counter">{fillIdx + 1} / {FILL_QUESTIONS.length}</div>

          <div className="estar-sentence-card">
            <p className="estar-sentence-text" dir="ltr">
              {currentFillQ.before}{' '}
              <span className={`estar-blank
                ${fillFeedback === 'ok'  ? ' estar-blank-ok'  : ''}
                ${fillFeedback === 'bad' ? ' estar-blank-bad' : ''}
              `}>
                {fillSel || '______'}
              </span>
              {' '}{currentFillQ.after}
            </p>
          </div>

          <div className="estar-bank">
            {FILL_BANK.map(word => {
              const used  = usedBank.current.has(word)
              const isSel = fillSel === word
              return (
                <button
                  key={word}
                  className={`estar-bank-btn
                    ${used           ? ' estar-bank-used' : ''}
                    ${isSel && fillFeedback === 'ok'  ? ' estar-bank-ok'  : ''}
                    ${isSel && fillFeedback === 'bad' ? ' estar-bank-bad' : ''}
                  `}
                  onClick={() => pickBankWord(word)}
                  disabled={used || lockedFill.current}
                  dir="ltr"
                >{word}</button>
              )
            })}
          </div>

          {fillFeedback === 'bad' && (
            <div className="estar-fill-hint" dir="ltr">
              ✗ &nbsp;התשובה הנכונה: <strong>{currentFillQ.answer}</strong>
            </div>
          )}

          {fillCoinPop && (
            <div key={fillCoinPop} className="coin-float estar-coin-float">🪙 +{COINS_FILL}</div>
          )}
        </div>
      )}

      {/* ═══════════════ PART 3: SENTENCES ═══════════════ */}
      {phase === 'sentences' && (
        <div className="estar-section estar-sent-section">
          <div className="estar-instruction">
            <span>📝</span> כתוב 4 משפטים עם am / is / are
          </div>

          <div className="estar-example-row">
            <span className="estar-example-label">לדוגמה:</span>
            <span className="estar-example-text" dir="ltr">The doctor is kind.</span>
          </div>

          <div className="estar-rules-row">
            <span className="estar-rule">🔠 אות גדולה</span>
            <span className="estar-rule">am / is / are</span>
            <span className="estar-rule">. נקודה בסוף</span>
          </div>

          <div className="estar-inputs">
            {sentences.map((s, i) => (
              <div key={i} className="estar-input-row">
                <span className="estar-input-num">{i + 1}.</span>
                <div className="estar-input-wrap">
                  <input
                    className={`estar-input
                      ${sentResults ? (sentResults[i].ok ? ' estar-input-ok' : ' estar-input-bad') : ''}
                    `}
                    type="text"
                    value={s}
                    onChange={e => setSentences(prev => {
                      const a = [...prev]; a[i] = e.target.value; return a
                    })}
                    placeholder="Write a sentence here..."
                    dir="ltr"
                    disabled={!!sentResults}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                  {sentResults && (
                    <span className="estar-input-badge">
                      {sentResults[i].ok ? '✅' : '❌'}
                    </span>
                  )}
                </div>
                {sentResults && !sentResults[i].ok && (
                  <div className="estar-input-hint">{sentResults[i].hint}</div>
                )}
              </div>
            ))}
          </div>

          {/* word reference bank */}
          <div className="estar-ref-label">מילים לעזרה:</div>
          <div className="estar-ref-bank">
            {REF_WORDS.map(w => (
              <span key={w} className="estar-ref-word" dir="ltr">{w}</span>
            ))}
          </div>

          {!sentResults ? (
            <button
              className="estar-check-btn"
              onClick={checkSentences}
              disabled={sentences.every(s => !s.trim())}
            >
              בדוק ✓
            </button>
          ) : (
            <button className="estar-advance-btn" onClick={finish}>
              🏁 סיום
            </button>
          )}
        </div>
      )}

    </div>
  )
}
