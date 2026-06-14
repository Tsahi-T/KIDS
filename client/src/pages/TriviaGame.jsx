import { useState, useEffect, useRef, useCallback } from 'react'
import AvatarDisplay from '../components/AvatarDisplay.jsx'
import { getTriviaRound } from '../utils/trivia.js'
import { calcCoins, addCoins } from '../utils/coins.js'

const MAX_Q       = 10
const READ_TIME   = 90   // seconds to read facts
const Q_TIME      = 60   // seconds to answer
const COIN_VAL    = 15
const ANS_COLORS  = ['#FFD93D', '#6BCB77', '#4D96FF', '#FF6B6B']

function TimerBar({ remaining, total, color }) {
  const pct = remaining / total
  return (
    <div style={{
      width: '100%', height: 6, background: 'rgba(255,255,255,0.1)',
      borderRadius: 3, overflow: 'hidden', margin: '0.5rem 0',
    }}>
      <div style={{
        height: '100%', width: `${pct * 100}%`,
        background: color,
        transition: 'width 0.95s linear, background 0.3s',
        borderRadius: 3,
      }} />
    </div>
  )
}

function CircleTimer({ remaining, total }) {
  const r    = 20
  const circ = 2 * Math.PI * r
  const pct  = remaining / total
  const dash = circ * (1 - pct)
  const color = remaining > 20 ? '#4ade80' : remaining > 10 ? '#fbbf24' : '#f87171'
  return (
    <div style={{ position: 'relative', width: 48, height: 48, flexShrink: 0 }}>
      <svg width="48" height="48" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={r} fill="none" stroke="#2a2a3e" strokeWidth="4" />
        <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round"
          transform="rotate(-90 24 24)"
          style={{ transition: 'stroke-dashoffset 0.92s linear, stroke 0.3s' }} />
      </svg>
      <span style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color,
      }}>{remaining}</span>
    </div>
  )
}

export default function TriviaGame({ player, onGameOver }) {
  const [phase,    setPhase]    = useState('read')   // 'read' | 'question' | 'result'
  const [round,    setRound]    = useState(null)
  const [qNum,     setQNum]     = useState(0)
  const [score,    setScore]    = useState(0)
  const [lives,    setLives]    = useState(3)
  const [coins,    setCoins]    = useState(0)
  const [selected, setSelected] = useState(null)     // chosen answer
  const [remaining, setRemain]  = useState(READ_TIME)
  const [coinPop,  setCoinPop]  = useState(null)

  const usedSet    = useRef(new Set())
  const timerRef   = useRef(null)
  const lockedRef  = useRef(false)
  const livesRef   = useRef(3)
  const scoreRef   = useRef(0)
  const coinsRef   = useRef(0)
  const roundRef   = useRef(null)

  function loadNextRound() {
    const item = getTriviaRound(usedSet.current)
    if (!item) return finish()
    usedSet.current.add(item._idx)
    roundRef.current = item
    setRound(item)
    lockedRef.current = false
    setSelected(null)
    setPhase('read')
    setRemain(READ_TIME)
  }

  useEffect(() => { loadNextRound() }, [])

  // timer tick
  useEffect(() => {
    clearInterval(timerRef.current)
    if (!round) return
    timerRef.current = setInterval(() => {
      setRemain(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleTimerEnd()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase, round])

  function handleTimerEnd() {
    if (phase === 'read') {
      goToQuestion()
    } else {
      handleTimeout()
    }
  }

  function goToQuestion() {
    clearInterval(timerRef.current)
    setPhase('question')
    setRemain(Q_TIME)
  }

  function handleTimeout() {
    if (lockedRef.current) return
    lockedRef.current = true
    clearInterval(timerRef.current)
    livesRef.current = Math.max(0, livesRef.current - 1)
    setLives(livesRef.current)
    setSelected({ val: null, correct: roundRef.current?.correct })
    setPhase('result')
    const next = qNum + 1
    setQNum(next)
    advance(next, livesRef.current)
  }

  const handleAnswer = useCallback((val) => {
    if (lockedRef.current || phase !== 'question') return
    lockedRef.current = true
    clearInterval(timerRef.current)
    const correct = roundRef.current?.correct
    const isRight = val === correct
    setSelected({ val, correct })
    setPhase('result')
    if (isRight) {
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
    const next = qNum + 1
    setQNum(next)
    advance(next, livesRef.current)
  }, [phase, qNum])

  function advance(next, curLives) {
    if (next >= MAX_Q || curLives <= 0) {
      setTimeout(() => finish(), 1400)
    } else {
      setTimeout(() => loadNextRound(), 1400)
    }
  }

  function finish() {
    const stars = scoreRef.current >= MAX_Q ? 3
      : scoreRef.current >= Math.ceil(MAX_Q * 0.7) ? 2
      : scoreRef.current >= Math.ceil(MAX_Q * 0.4) ? 1 : 0
    addCoins(calcCoins(0, stars))
    onGameOver(scoreRef.current, MAX_Q, livesRef.current > 0)
  }

  if (!round) return null

  const readColor  = remaining > 45 ? '#4ade80' : remaining > 20 ? '#fbbf24' : '#f87171'
  const qColor     = remaining > 30 ? '#4ade80' : remaining > 15 ? '#fbbf24' : '#f87171'

  return (
    <div className="eng-screen" style={{ overflowY: 'auto' }}>

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

      {/* ── READ PHASE ── */}
      {(phase === 'read') && (
        <div style={{ padding: '0.75rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

          <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#a78bfa', fontWeight: 600, letterSpacing: '0.05em' }}>
            📖 קרא את העובדות
          </div>

          {round.facts.map((fact, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(167,139,250,0.2)',
              borderRadius: 14, padding: '1rem 1.1rem',
              fontSize: '1.0rem', lineHeight: 1.6,
              color: '#f0f0f0',
            }}>
              <span style={{ color: '#a78bfa', fontWeight: 700, marginLeft: '0.4rem' }}>{i + 1}.</span>
              {fact}
            </div>
          ))}

          {/* timer bar */}
          <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#888' }}>זמן קריאה</span>
              <span style={{ fontSize: '0.8rem', color: readColor, fontWeight: 700 }}>{remaining}ש׳</span>
            </div>
            <TimerBar remaining={remaining} total={READ_TIME} color={readColor} />
          </div>

          <button
            onClick={goToQuestion}
            style={{
              background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
              color: '#fff', border: 'none', borderRadius: 14,
              padding: '0.85rem', fontSize: '1.05rem', fontWeight: 700,
              fontFamily: 'Heebo, sans-serif', cursor: 'pointer',
              boxShadow: '0 4px 18px rgba(124,58,237,0.4)',
            }}
          >
            הבנתי! לשאלה →
          </button>
        </div>
      )}

      {/* ── QUESTION PHASE ── */}
      {(phase === 'question' || phase === 'result') && (
        <div style={{ padding: '0.75rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

          {/* question */}
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 14, padding: '1rem 1.1rem',
            fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.5,
            textAlign: 'center',
          }}>
            {round.question}
          </div>

          {/* timer row */}
          {phase === 'question' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CircleTimer remaining={remaining} total={Q_TIME} />
              <TimerBar remaining={remaining} total={Q_TIME} color={qColor} />
            </div>
          )}

          {/* answers */}
          <div className="num-answers-grid">
            {round.answers.map((ans, i) => {
              let state = ''
              if (selected) {
                if (ans === selected.correct) state = ' ans-correct'
                else if (ans === selected.val) state = ' ans-wrong'
              }
              return (
                <button key={i}
                  className={`num-ans-btn${state}`}
                  style={{ background: state ? undefined : ANS_COLORS[i], fontSize: '0.9rem' }}
                  onClick={() => handleAnswer(ans)}
                  disabled={!!selected || phase === 'result'}
                >
                  {ans}
                </button>
              )
            })}
          </div>

          {/* feedback */}
          {selected && (
            <div style={{
              textAlign: 'center', fontWeight: 700, fontSize: '1.1rem',
              color: selected.val === selected.correct ? '#4ade80' : '#f87171',
            }}>
              {selected.val === selected.correct ? '✅ כל הכבוד!' : `❌ התשובה הנכונה: ${selected.correct}`}
            </div>
          )}
        </div>
      )}

      {coinPop && <div key={coinPop} className="coin-float eng-coin-float">🪙 +{COIN_VAL}</div>}
    </div>
  )
}
