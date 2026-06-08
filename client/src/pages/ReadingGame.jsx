import { useState, useEffect, useRef, useCallback } from 'react'
import AvatarDisplay from '../components/AvatarDisplay.jsx'
import { generatePictureQuestion, ITEMS } from '../utils/hebrewPictures.js'
import { calcCoins, addCoins } from '../utils/coins.js'

const MAX_Q      = 25
const TIME_LIMIT = 20
const COIN_VAL   = 10

function EmojiDisplay({ emojis, size = 'normal' }) {
  const cls = size === 'big' ? 'rdg-emoji-big' : 'rdg-emoji-ans'
  return (
    <span className={`rdg-emoji-wrap rdg-emoji-wrap-${emojis.length}`}>
      {emojis.map((e, i) => (
        <span key={i} className={cls}>{e}</span>
      ))}
    </span>
  )
}

export default function ReadingGame({ player, onGameOver }) {
  const [question,  setQuestion]  = useState(null)
  const [lives,     setLives]     = useState(3)
  const [score,     setScore]     = useState(0)
  const [coins,     setCoins]     = useState(0)
  const [remaining, setRemaining] = useState(TIME_LIMIT)
  const [selected,  setSelected]  = useState(null) // index of chosen answer
  const [coinPop,   setCoinPop]   = useState(null)
  const [qNum,      setQNum]      = useState(0)

  const usedRef   = useRef(new Set())
  const livesRef  = useRef(3)
  const scoreRef  = useRef(0)
  const coinsRef  = useRef(0)
  const timerRef  = useRef(null)
  const lockedRef = useRef(false)

  function nextQuestion() {
    lockedRef.current = false
    setSelected(null)
    if (usedRef.current.size >= ITEMS.length - 4) usedRef.current.clear()
    const q = generatePictureQuestion(usedRef.current)
    usedRef.current.add(q.index)
    setQuestion(q)
    setRemaining(TIME_LIMIT)
  }

  useEffect(() => { nextQuestion() }, [])

  useEffect(() => {
    if (!question) return
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); handleTimeout(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [question])

  function handleTimeout() {
    if (lockedRef.current) return
    lockedRef.current = true
    clearInterval(timerRef.current)
    livesRef.current = Math.max(0, livesRef.current - 1)
    setLives(livesRef.current)
    // mark correct answer
    const correctIdx = question.answers.findIndex(a => a.correct)
    setSelected({ chosen: -1, correctIdx })
    advance()
  }

  function advance() {
    const next = qNum + 1
    setQNum(next)
    if (next >= MAX_Q || livesRef.current <= 0) {
      setTimeout(() => {
        const stars = scoreRef.current >= MAX_Q ? 3
          : scoreRef.current >= Math.ceil(MAX_Q * 0.7) ? 2
          : scoreRef.current >= Math.ceil(MAX_Q * 0.4) ? 1 : 0
        addCoins(calcCoins(0, stars))
        onGameOver(scoreRef.current, MAX_Q,
          livesRef.current > 0 && scoreRef.current >= Math.ceil(MAX_Q * 0.7))
      }, 1200)
    } else {
      setTimeout(nextQuestion, 1100)
    }
  }

  const handleAnswer = useCallback((ansIdx) => {
    if (lockedRef.current) return
    lockedRef.current = true
    clearInterval(timerRef.current)

    const ans        = question.answers[ansIdx]
    const correctIdx = question.answers.findIndex(a => a.correct)
    const isCorrect  = ans.correct

    setSelected({ chosen: ansIdx, correctIdx })

    if (isCorrect) {
      scoreRef.current++
      coinsRef.current += COIN_VAL
      addCoins(COIN_VAL)
      setScore(scoreRef.current)
      setCoins(coinsRef.current)
      setCoinPop(Date.now())
      setTimeout(() => setCoinPop(null), 1100)
    } else {
      livesRef.current = Math.max(0, livesRef.current - 1)
      setLives(livesRef.current)
    }
    advance()
  }, [question, qNum])

  if (!question) return null

  const pct        = remaining / TIME_LIMIT
  const r          = 20
  const circ       = 2 * Math.PI * r
  const dash       = circ * (1 - pct)
  const timerColor = remaining > 10 ? '#4ade80' : remaining > 5 ? '#fbbf24' : '#f87171'
  const urgent     = remaining <= 5

  // detect mode: single word or phrase (has space or ו)
  const isPhrase = question.text.includes(' ') || question.answers.some(a => a.emojis.length > 1)

  return (
    <div className="rdg-screen">

      {/* top bar */}
      <div className="eng-topbar">
        <div className="eng-player">
          <AvatarDisplay avatar={player.avatar} size={26} />
          <span>{player.name}</span>
        </div>
        <div className="eng-hud">
          <span className="eng-hud-item eng-score">✓ {score}</span>
          <span className="eng-hud-item eng-coins">🪙 {coins}</span>
          <span className="eng-hud-item eng-lives">
            {'❤️'.repeat(livesRef.current)}{'🖤'.repeat(3 - livesRef.current)}
          </span>
        </div>
      </div>

      {/* progress */}
      <div className="eng-progress-wrap">
        <div className="eng-progress-bar" style={{ width: `${(qNum / MAX_Q) * 100}%` }} />
      </div>

      {/* word / phrase + timer */}
      <div className="rdg-question-row">
        <div className={`rdg-word${urgent ? ' urgent-word' : ''}`} dir="rtl">
          {question.text}
        </div>
        <div className="eng-timer">
          <svg width="48" height="48" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r={r} fill="none" stroke="#2a2a3e" strokeWidth="4" />
            <circle
              cx="24" cy="24" r={r}
              fill="none" stroke={timerColor} strokeWidth="4"
              strokeDasharray={circ} strokeDashoffset={dash}
              strokeLinecap="round"
              transform="rotate(-90 24 24)"
              style={{ transition: 'stroke-dashoffset 0.92s linear, stroke 0.3s' }}
            />
          </svg>
          <span className="eng-timer-num" style={{ color: timerColor }}>{remaining}</span>
        </div>
      </div>

      <div className="eng-hint" dir="rtl">
        {isPhrase ? 'בחר את הצמד הנכון' : 'בחר את התמונה הנכונה'}
      </div>

      {/* 2×2 answer grid */}
      <div className="rdg-grid">
        {question.answers.map((ans, i) => {
          let state = ''
          if (selected !== null) {
            if (i === selected.correctIdx)          state = ' ans-correct'
            else if (i === selected.chosen)         state = ' ans-wrong'
          }
          return (
            <button
              key={i}
              className={`rdg-btn${state}`}
              onClick={() => handleAnswer(i)}
              disabled={selected !== null}
            >
              <EmojiDisplay emojis={ans.emojis} size="normal" />
            </button>
          )
        })}
      </div>

      {coinPop && <div key={coinPop} className="coin-float eng-coin-float">🪙 +{COIN_VAL}</div>}
    </div>
  )
}
