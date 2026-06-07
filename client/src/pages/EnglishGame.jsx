import { useState, useEffect, useRef, useCallback } from 'react'
import AvatarDisplay, { isPhoto, photoName } from '../components/AvatarDisplay.jsx'
import { generateVocabQuestion } from '../utils/vocabulary.js'
import { calcCoins, addCoins } from '../utils/coins.js'

const MAX_Q      = 25
const TIME_LIMIT = 20
const COIN_VAL   = 10

export default function EnglishGame({ player, onGameOver }) {
  const [question,  setQuestion]  = useState(null)
  const [lives,     setLives]     = useState(3)
  const [score,     setScore]     = useState(0)
  const [coins,     setCoins]     = useState(0)
  const [remaining, setRemaining] = useState(TIME_LIMIT)
  const [selected,  setSelected]  = useState(null) // { emoji, correct }
  const [coinPop,   setCoinPop]   = useState(null)
  const [qNum,      setQNum]      = useState(0)

  const usedRef    = useRef(new Set())
  const livesRef   = useRef(3)
  const scoreRef   = useRef(0)
  const coinsRef   = useRef(0)
  const timerRef   = useRef(null)
  const lockedRef  = useRef(false)

  function speak(word) {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utter  = new SpeechSynthesisUtterance(word)
    utter.lang   = 'en-US'
    utter.rate   = 0.8
    utter.pitch  = 1.1
    window.speechSynthesis.speak(utter)
  }

  function nextQuestion() {
    lockedRef.current = false
    setSelected(null)
    const q = generateVocabQuestion(usedRef.current)
    usedRef.current.add(q.index)
    setQuestion(q)
    setRemaining(TIME_LIMIT)
    setTimeout(() => speak(q.word), 300)
  }

  // start first question
  useEffect(() => { nextQuestion() }, [])

  // timer
  useEffect(() => {
    if (!question) return
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleTimeout()
          return 0
        }
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
    setSelected({ emoji: null, correct: question.correct })
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
        const bonus = calcCoins(0, stars) // star bonus only — per-answer already added
        addCoins(bonus)
        onGameOver(scoreRef.current, MAX_Q, livesRef.current > 0 && scoreRef.current >= Math.ceil(MAX_Q * 0.7))
      }, 1200)
    } else {
      setTimeout(nextQuestion, 1100)
    }
  }

  const handleAnswer = useCallback((emoji) => {
    if (lockedRef.current) return
    lockedRef.current = true
    clearInterval(timerRef.current)

    const isCorrect = emoji === question.correct
    setSelected({ emoji, correct: question.correct })

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

  const pct         = remaining / TIME_LIMIT
  const r           = 20
  const circ        = 2 * Math.PI * r
  const dash        = circ * (1 - pct)
  const timerColor  = remaining > 10 ? '#4ade80' : remaining > 5 ? '#fbbf24' : '#f87171'
  const urgent      = remaining <= 5

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

      {/* progress bar */}
      <div className="eng-progress-wrap">
        <div className="eng-progress-bar" style={{ width: `${(qNum / MAX_Q) * 100}%` }} />
      </div>

      {/* word + timer */}
      <div className="eng-word-row">
        <button className="speak-btn" onClick={() => speak(question.word)} title="השמע מילה">
          🔊
        </button>
        <div className={`eng-word${urgent ? ' urgent-word' : ''}`}>{question.word}</div>
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

      <div className="eng-hint">איזו תמונה מתאימה למילה?</div>

      {/* 2×2 emoji grid */}
      <div className="eng-grid">
        {question.answers.map((item, i) => {
          let state = ''
          if (selected) {
            if (item.emoji === selected.correct) state = ' ans-correct'
            else if (item.emoji === selected.emoji) state = ' ans-wrong'
          }
          return (
            <button
              key={i}
              className={`eng-btn${state}`}
              onClick={() => handleAnswer(item.emoji)}
              disabled={!!selected}
            >
              <span className="eng-emoji">{item.emoji}</span>
            </button>
          )
        })}
      </div>

      {/* coin pop */}
      {coinPop && <div key={coinPop} className="coin-float eng-coin-float">🪙 +{COIN_VAL}</div>}

    </div>
  )
}
