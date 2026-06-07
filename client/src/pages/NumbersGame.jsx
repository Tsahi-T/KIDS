import { useState, useEffect, useRef, useCallback } from 'react'
import AvatarDisplay from '../components/AvatarDisplay.jsx'
import { generateNumberQuestion } from '../utils/numbers.js'
import { calcCoins, addCoins } from '../utils/coins.js'
import { speakEnglish } from '../utils/tts.js'

const MAX_Q      = 25
const TIME_LIMIT = 20
const COIN_VAL   = 10

const ANS_COLORS = ['#FFD93D', '#6BCB77', '#4D96FF', '#FF6B6B']

export default function NumbersGame({ player, onGameOver }) {
  const [question,  setQuestion]  = useState(null)
  const [lives,     setLives]     = useState(3)
  const [score,     setScore]     = useState(0)
  const [coins,     setCoins]     = useState(0)
  const [remaining, setRemaining] = useState(TIME_LIMIT)
  const [selected,  setSelected]  = useState(null)
  const [coinPop,   setCoinPop]   = useState(null)
  const [qNum,      setQNum]      = useState(0)

  const usedRef   = useRef(new Set())
  const livesRef  = useRef(3)
  const scoreRef  = useRef(0)
  const coinsRef  = useRef(0)
  const timerRef  = useRef(null)
  const lockedRef = useRef(false)
  const qRef      = useRef(null)

  function nextQuestion() {
    lockedRef.current = false
    setSelected(null)
    const q = generateNumberQuestion(usedRef.current)
    usedRef.current.add(q.index)
    qRef.current = q
    setQuestion(q)
    setRemaining(TIME_LIMIT)
    setTimeout(() => speakEnglish(q.correct), 300)
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

  function advance(nextQNum, currentLives) {
    if (nextQNum >= MAX_Q || currentLives <= 0) {
      setTimeout(() => {
        const stars = scoreRef.current >= MAX_Q ? 3
          : scoreRef.current >= Math.ceil(MAX_Q * 0.7) ? 2
          : scoreRef.current >= Math.ceil(MAX_Q * 0.4) ? 1 : 0
        addCoins(calcCoins(0, stars))
        onGameOver(scoreRef.current, MAX_Q, currentLives > 0)
      }, 1200)
    } else {
      setTimeout(nextQuestion, 1100)
    }
  }

  function handleTimeout() {
    if (lockedRef.current) return
    lockedRef.current = true
    clearInterval(timerRef.current)
    livesRef.current = Math.max(0, livesRef.current - 1)
    setLives(livesRef.current)
    setSelected({ ans: null, correct: qRef.current?.correct })
    const next = qNum + 1
    setQNum(next)
    advance(next, livesRef.current)
  }

  const handleAnswer = useCallback((ans) => {
    if (lockedRef.current) return
    lockedRef.current = true
    clearInterval(timerRef.current)
    const isCorrect = ans === qRef.current?.correct
    setSelected({ ans, correct: qRef.current?.correct })
    if (isCorrect) {
      scoreRef.current++
      coinsRef.current += COIN_VAL
      addCoins(COIN_VAL)
      setScore(scoreRef.current)
      setCoins(coinsRef.current)
      setCoinPop(Date.now())
      setTimeout(() => setCoinPop(null), 1100)
      speakEnglish(ans)
    } else {
      livesRef.current = Math.max(0, livesRef.current - 1)
      setLives(livesRef.current)
    }
    const next = qNum + 1
    setQNum(next)
    advance(next, livesRef.current)
  }, [qNum])

  if (!question) return null

  const pct        = remaining / TIME_LIMIT
  const r          = 20
  const circ       = 2 * Math.PI * r
  const dash       = circ * (1 - pct)
  const timerColor = remaining > 10 ? '#4ade80' : remaining > 5 ? '#fbbf24' : '#f87171'
  const urgent     = remaining <= 5

  return (
    <div className="eng-screen">
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

      <div className="eng-progress-wrap">
        <div className="eng-progress-bar" style={{ width: `${(qNum / MAX_Q) * 100}%` }} />
      </div>

      {/* big number display */}
      <div className="num-display-wrap">
        <div className={`num-big${urgent ? ' urgent-word' : ''}`}>{question.digit}</div>
        <div className="eng-word-row" style={{ justifyContent: 'center', marginTop: 0 }}>
          <button className="speak-btn" onClick={() => speakEnglish(question.correct)}>🔊</button>
          <div className="eng-timer">
            <svg width="48" height="48" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r={r} fill="none" stroke="#2a2a3e" strokeWidth="4" />
              <circle cx="24" cy="24" r={r} fill="none" stroke={timerColor} strokeWidth="4"
                strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round"
                transform="rotate(-90 24 24)"
                style={{ transition: 'stroke-dashoffset 0.92s linear, stroke 0.3s' }} />
            </svg>
            <span className="eng-timer-num" style={{ color: timerColor }}>{remaining}</span>
          </div>
        </div>
        <div className="eng-hint">מה המספר באנגלית?</div>
      </div>

      {/* answer buttons */}
      <div className="num-answers-grid">
        {question.answers.map((item, i) => {
          let state = ''
          if (selected) {
            if (item.word === selected.correct) state = ' ans-correct'
            else if (item.word === selected.ans) state = ' ans-wrong'
          }
          return (
            <button
              key={i}
              className={`num-ans-btn${state}`}
              style={{ background: state ? undefined : ANS_COLORS[i] }}
              onClick={() => handleAnswer(item.word)}
              disabled={!!selected}
            >
              {item.word}
            </button>
          )
        })}
      </div>

      {coinPop && <div key={coinPop} className="coin-float eng-coin-float">🪙 +{COIN_VAL}</div>}
    </div>
  )
}
