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

const SUBJECTS = [
  { label: 'I',             verb: 'am'  },
  { label: 'You',           verb: 'are' },
  { label: 'We',            verb: 'are' },
  { label: 'They',          verb: 'are' },
  { label: 'He',            verb: 'is'  },
  { label: 'She',           verb: 'is'  },
  { label: 'The doctor',    verb: 'is'  },
  { label: 'The nurse',     verb: 'is'  },
  { label: 'The king',      verb: 'is'  },
  { label: 'The prince',    verb: 'is'  },
  { label: 'The princess',  verb: 'is'  },
  { label: 'The policeman', verb: 'is'  },
  { label: 'The waiter',    verb: 'is'  },
  { label: 'The guard',     verb: 'is'  },
  { label: 'The baby',      verb: 'is'  },
]

const ADJECTIVES = [
  'kind', 'brave', 'famous', 'important', 'special', 'strong',
  'tired', 'beautiful', 'young', 'old', 'rich', 'poor', 'funny',
  'clean', 'dirty', 'fast', 'warm', 'sweet', 'ugly',
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
  const [sel,          setSel]          = useState(null)  // {word, side:'left'|'right'}
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

  // ── Part 3: sentence builder
  const [builtSents,  setBuiltSents]  = useState([])    // built sentence strings
  const [pickedSubj,  setPickedSubj]  = useState(null)  // SUBJECTS entry
  const [pickedAdj,   setPickedAdj]   = useState(null)  // adjective string
  const [sentCoinPop, setSentCoinPop] = useState(null)

  // ── Part 1 handlers ──────────────────────────────────────────────────────
  function isLeftMatched(word)  { return matchedLeft.has(word) }
  function isRightMatched(word) { return OPPOSITES.some(p => p[1] === word && matchedLeft.has(p[0])) }

  function clickWord(word, side) {
    const matched = side === 'left' ? isLeftMatched(word) : isRightMatched(word)
    if (matched) return

    if (!sel) {
      setSel({ word, side })
      return
    }

    if (sel.side === side) {
      // same column — switch or deselect
      setSel(sel.word === word ? null : { word, side })
      return
    }

    // opposite columns — try to match
    const leftWord  = side === 'left'  ? word : sel.word
    const rightWord = side === 'right' ? word : sel.word

    const valid = OPPOSITES.find(p => p[0] === leftWord && p[1] === rightWord)
    if (valid) {
      addCoins(COINS_OPP)
      setCoinsDisp(getCoins())
      scoreRef.current++
      setOppScore(s => s + 1)
      setMatchedLeft(prev => new Set([...prev, leftWord]))
      setSel(null)
      setOppCoinPop(Date.now())
      setTimeout(() => setOppCoinPop(null), 1100)
    } else {
      setShakeLeft(leftWord)
      setShakeRight(rightWord)
      setTimeout(() => { setShakeLeft(null); setShakeRight(null); setSel(null) }, 550)
    }
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
  const sentPreview = pickedSubj && pickedAdj
    ? `${pickedSubj.label} ${pickedSubj.verb} ${pickedAdj}.`
    : null

  function addSentence() {
    if (!sentPreview || builtSents.length >= 4) return
    setBuiltSents(prev => [...prev, sentPreview])
    addCoins(COINS_SENT)
    setCoinsDisp(getCoins())
    scoreRef.current++
    setSentCoinPop(Date.now())
    setTimeout(() => setSentCoinPop(null), 1100)
    setPickedSubj(null)
    setPickedAdj(null)
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
                const isMatched = isLeftMatched(word)
                const isSel     = sel?.word === word && sel?.side === 'left'
                const isShaking = shakeLeft === word
                return (
                  <button
                    key={word}
                    className={`estar-mword estar-mword-left
                      ${isMatched ? ' estar-mword-matched' : ''}
                      ${isSel     ? ' estar-mword-sel' : ''}
                      ${isShaking ? ' estar-mword-shake' : ''}
                    `}
                    onClick={() => clickWord(word, 'left')}
                    disabled={isMatched}
                    dir="ltr"
                  >{word}</button>
                )
              })}
            </div>

            {/* right column */}
            <div className="estar-match-col">
              {rightCol.current.map(word => {
                const isMatched = isRightMatched(word)
                const isSel     = sel?.word === word && sel?.side === 'right'
                const isShaking = shakeRight === word
                return (
                  <button
                    key={word}
                    className={`estar-mword estar-mword-right
                      ${isMatched ? ' estar-mword-matched' : ''}
                      ${isSel     ? ' estar-mword-sel' : ''}
                      ${isShaking ? ' estar-mword-shake' : ''}
                      ${sel && !isMatched && !isSel ? ' estar-mword-pickable' : ''}
                    `}
                    onClick={() => clickWord(word, 'right')}
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

      {/* ═══════════════ PART 3: SENTENCE BUILDER ═══════════════ */}
      {phase === 'sentences' && (
        <div className="estar-section estar-sent-section">
          <div className="estar-instruction">
            <span>📝</span> בנה 4 משפטים — בחר נושא ושם תואר
          </div>

          {/* built sentences list */}
          <div className="estar-built-list">
            {[0,1,2,3].map(i => (
              <div key={i} className={`estar-built-slot${i < builtSents.length ? ' estar-built-done' : ''}`}>
                <span className="estar-built-num">{i + 1}.</span>
                {i < builtSents.length
                  ? <span className="estar-built-text" dir="ltr">{builtSents[i]}</span>
                  : <span className="estar-built-empty">___</span>
                }
                {i < builtSents.length && <span>✅</span>}
              </div>
            ))}
          </div>

          {builtSents.length < 4 && (
            <>
              {/* subject picker */}
              <div className="estar-picker-label">בחר נושא:</div>
              <div className="estar-subj-grid">
                {SUBJECTS.map(s => (
                  <button
                    key={s.label}
                    className={`estar-subj-btn${pickedSubj?.label === s.label ? ' estar-subj-sel' : ''}`}
                    onClick={() => setPickedSubj(prev => prev?.label === s.label ? null : s)}
                    dir="ltr"
                  >{s.label}</button>
                ))}
              </div>

              {/* verb display */}
              {pickedSubj && (
                <div className="estar-verb-display" dir="ltr">
                  <span className="estar-verb-subj">{pickedSubj.label}</span>
                  <span className="estar-verb-arrow">→</span>
                  <span className="estar-verb-word">{pickedSubj.verb}</span>
                </div>
              )}

              {/* adjective picker */}
              <div className="estar-picker-label">בחר שם תואר:</div>
              <div className="estar-adj-grid">
                {ADJECTIVES.map(adj => (
                  <button
                    key={adj}
                    className={`estar-adj-btn${pickedAdj === adj ? ' estar-adj-sel' : ''}`}
                    onClick={() => setPickedAdj(prev => prev === adj ? null : adj)}
                    dir="ltr"
                  >{adj}</button>
                ))}
              </div>

              {/* preview */}
              <div className={`estar-preview${sentPreview ? ' estar-preview-ready' : ''}`} dir="ltr">
                {sentPreview || <span className="estar-preview-hint">בחר נושא ושם תואר...</span>}
              </div>

              <button
                className="estar-add-btn"
                onClick={addSentence}
                disabled={!sentPreview}
              >הוסף משפט +</button>
            </>
          )}

          {builtSents.length === 4 && (
            <button className="estar-advance-btn" onClick={finish}>🏁 סיום</button>
          )}

          {sentCoinPop && (
            <div key={sentCoinPop} className="coin-float estar-coin-float">🪙 +{COINS_SENT}</div>
          )}
        </div>
      )}

    </div>
  )
}
