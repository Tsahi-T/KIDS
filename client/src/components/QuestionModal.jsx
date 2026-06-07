import { useState, useEffect, useRef } from 'react'

const ANSWER_COLORS = ['#FFD93D', '#6BCB77', '#4D96FF', '#FF6B6B']
export const TIME_LIMIT = 30   // שניות — קל לשנות

export default function QuestionModal({ question, onAnswer, onTimeout, disabled }) {
  const [remaining, setRemaining] = useState(TIME_LIMIT)
  const intervalRef = useRef(null)

  useEffect(() => {
    setRemaining(TIME_LIMIT)
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          setTimeout(onTimeout, 80)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [question.a, question.b])  // מאפס כשמגיעה שאלה חדשה

  const pct       = remaining / TIME_LIMIT
  const r         = 22
  const circ      = 2 * Math.PI * r
  const dash      = circ * (1 - pct)
  const urgent    = remaining <= 8
  const timerColor = remaining > 15 ? '#4ade80' : remaining > 8 ? '#fbbf24' : '#f87171'

  return (
    <div className="question-overlay">
      <div className={`question-box${urgent ? ' urgent' : ''}`}>

        {/* כותרת + טיימר */}
        <div className="q-header">
          <span className="question-label">כמה זה?</span>
          <div className="timer-wrap">
            <svg width="52" height="52" viewBox="0 0 52 52" style={{ display: 'block' }}>
              <circle cx="26" cy="26" r={r} fill="none" stroke="#2a2a3e" strokeWidth="4" />
              <circle
                cx="26" cy="26" r={r}
                fill="none"
                stroke={timerColor}
                strokeWidth="4"
                strokeDasharray={circ}
                strokeDashoffset={dash}
                strokeLinecap="round"
                transform="rotate(-90 26 26)"
                style={{ transition: 'stroke-dashoffset 0.92s linear, stroke 0.3s' }}
              />
            </svg>
            <span className="timer-num" style={{ color: timerColor }}>{remaining}</span>
          </div>
        </div>

        <div className="question-text">{question.a} × {question.b} = ?</div>

        <div className="answers-grid">
          {question.answers.map((ans, i) => (
            <button
              key={`${ans}-${i}`}
              className="answer-btn"
              style={{ background: ANSWER_COLORS[i] }}
              onClick={() => !disabled && onAnswer(ans)}
              disabled={disabled}
            >
              {ans}
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}
