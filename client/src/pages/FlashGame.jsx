import { useState, useEffect, useRef, useCallback } from 'react'
import AvatarDisplay from '../components/AvatarDisplay.jsx'
import { generateFlashQuestion, getFlashDuration, getSpeedLabel } from '../utils/hebrewWords.js'
import { calcCoins, addCoins } from '../utils/coins.js'

const MAX_Q      = 25
const CHOOSE_TIME = 8   // seconds to pick an answer
const COIN_VAL   = 10

// ── Phase constants ───────────────────────────────────────────────────
const PHASE_READY  = 'ready'   // "מוכן?" shown for 600ms
const PHASE_FLASH  = 'flash'   // word shown for flashDuration ms
const PHASE_MASK   = 'mask'    // brief blank 250ms (prevents after-image)
const PHASE_CHOOSE = 'choose'  // show 4 options + countdown

export default function FlashGame({ player, onGameOver }) {
  const [question,  setQuestion]  = useState(null)
  const [phase,     setPhase]     = useState(PHASE_READY)
  const [lives,     setLives]     = useState(3)
  const [score,     setScore]     = useState(0)
  const [coins,     setCoins]     = useState(0)
  const [remaining, setRemaining] = useState(CHOOSE_TIME)
  const [feedback,  setFeedback]  = useState(null) // 'correct'|'wrong'|null
  const [qNum,      setQNum]      = useState(0)
  const [coinPop,   setCoinPop]   = useState(null)

  const usedRef   = useRef(new Set())
  const livesRef  = useRef(3)
  const scoreRef  = useRef(0)
  const coinsRef  = useRef(0)
  const timerRef  = useRef(null)
  const lockedRef = useRef(false)
  const phaseRef  = useRef(PHASE_READY)

  function setPhaseSync(p) { phaseRef.current = p; setPhase(p) }

  // ── load next question ────────────────────────────────────────────
  function nextQuestion(nextQNum) {
    lockedRef.current = false
    setFeedback(null)
    if (usedRef.current.size >= Math.floor(MAX_Q * 1.2)) usedRef.current.clear()
    const q = generateFlashQuestion(usedRef.current)
    usedRef.current.add(q.index)
    setQuestion(q)
    setRemaining(CHOOSE_TIME)
    startReady(q, nextQNum ?? 0)
  }

  function startReady(q, n) {
    setPhaseSync(PHASE_READY)
    setTimeout(() => startFlash(q, n), 650)
  }

  function startFlash(q, n) {
    setPhaseSync(PHASE_FLASH)
    const dur = getFlashDuration(n)
    setTimeout(() => {
      setPhaseSync(PHASE_MASK)
      setTimeout(() => setPhaseSync(PHASE_CHOOSE), 260)
    }, dur)
  }

  useEffect(() => { nextQuestion(0) }, [])

  // ── choose-phase countdown ────────────────────────────────────────
  useEffect(() => {
    if (phase !== PHASE_CHOOSE) { clearInterval(timerRef.current); return }
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); handleTimeout(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase])

  // ── timeout ───────────────────────────────────────────────────────
  function handleTimeout() {
    if (lockedRef.current || phaseRef.current !== PHASE_CHOOSE) return
    lockedRef.current = true
    livesRef.current = Math.max(0, livesRef.current - 1)
    setLives(livesRef.current)
    setFeedback('wrong')
    advance()
  }

  // ── advance to next question or game-over ─────────────────────────
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
      }, 1100)
    } else {
      setTimeout(() => nextQuestion(next), 1000)
    }
  }

  // ── answer handler ────────────────────────────────────────────────
  const handleAnswer = useCallback((word) => {
    if (lockedRef.current || phaseRef.current !== PHASE_CHOOSE) return
    lockedRef.current = true
    clearInterval(timerRef.current)

    const isCorrect = word === question.correct
    setFeedback(isCorrect ? 'correct' : 'wrong')

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

  const speed     = getSpeedLabel(qNum)
  const pct       = remaining / CHOOSE_TIME
  const r         = 20
  const circ      = 2 * Math.PI * r
  const dash      = circ * (1 - pct)
  const timerClr  = remaining > 5 ? '#4ade80' : remaining > 3 ? '#fbbf24' : '#f87171'

  return (
    <div className="flash-screen">

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

      {/* progress bar */}
      <div className="eng-progress-wrap">
        <div className="eng-progress-bar" style={{ width: `${(qNum / MAX_Q) * 100}%` }} />
      </div>

      {/* speed badge */}
      <div className="flash-speed-badge" style={{ color: speed.color, borderColor: speed.color }}>
        {speed.label}
      </div>

      {/* main stage */}
      <div className="flash-stage">

        {/* READY phase */}
        {phase === PHASE_READY && (
          <div className="flash-ready">
            <div className="flash-ready-icon">👁️</div>
            <div className="flash-ready-text">התכוננו!</div>
          </div>
        )}

        {/* FLASH phase */}
        {phase === PHASE_FLASH && (
          <div className="flash-word-wrap">
            <div className="flash-word">{question.correct}</div>
          </div>
        )}

        {/* MASK phase */}
        {phase === PHASE_MASK && (
          <div className="flash-mask">
            <div className="flash-mask-dots">• • •</div>
          </div>
        )}

        {/* CHOOSE phase */}
        {phase === PHASE_CHOOSE && (
          <div className="flash-choose-wrap">

            <div className="flash-hint">
              {feedback
                ? (feedback === 'correct' ? '✅ נכון!' : '❌ לא נכון')
                : 'איזו מילה ראית?'}
            </div>

            {/* timer */}
            <div className="flash-timer-row">
              <svg width="48" height="48" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r={r} fill="none" stroke="#2a2a3e" strokeWidth="4" />
                <circle
                  cx="24" cy="24" r={r}
                  fill="none" stroke={timerClr} strokeWidth="4"
                  strokeDasharray={circ} strokeDashoffset={dash}
                  strokeLinecap="round"
                  transform="rotate(-90 24 24)"
                  style={{ transition: 'stroke-dashoffset 0.92s linear, stroke 0.3s' }}
                />
              </svg>
              <span className="eng-timer-num" style={{ color: timerClr }}>{remaining}</span>
            </div>

            {/* 2×2 answer grid */}
            <div className="flash-grid">
              {question.answers.map((w, i) => {
                let state = ''
                if (feedback) {
                  if (w === question.correct) state = ' ans-correct'
                  else if (feedback === 'wrong' && lockedRef.current) state = ' ans-wrong-dim'
                }
                return (
                  <button
                    key={i}
                    className={`flash-btn${state}`}
                    onClick={() => handleAnswer(w)}
                    disabled={!!feedback}
                  >
                    {w}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {coinPop && <div key={coinPop} className="coin-float eng-coin-float">🪙 +{COIN_VAL}</div>}
    </div>
  )
}
