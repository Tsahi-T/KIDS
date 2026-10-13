import { useState, useEffect, useRef } from 'react'
import AvatarDisplay from '../components/AvatarDisplay.jsx'
import { addCoins, getCoins } from '../utils/coins.js'

const WORDS = [
  { en: 'afternoon',      he: 'אחר הצהריים' },
  { en: 'apple',          he: 'תפוח' },
  { en: 'autumn',         he: 'סתיו' },
  { en: 'beautiful',      he: 'יפה' },
  { en: 'brave',          he: 'אמיץ' },
  { en: 'bread',          he: 'לחם' },
  { en: 'build',          he: 'לבנות' },
  { en: 'candy',          he: 'ממתקים' },
  { en: 'carrot',         he: 'גזר' },
  { en: 'cereal',         he: 'דגני בוקר' },
  { en: 'cheese',         he: 'גבינה' },
  { en: 'chicken',        he: 'עוף' },
  { en: 'children',       he: 'ילדים' },
  { en: 'chocolate cake', he: 'עוגת שוקולד' },
  { en: 'clean',          he: 'נקי' },
  { en: 'climb',          he: 'לטפס' },
  { en: 'coffee',         he: 'קפה' },
  { en: 'cola',           he: 'קולה' },
  { en: 'cookies',        he: 'עוגיות' },
  { en: 'cool',           he: 'קריר' },
  { en: 'cucumber',       he: 'מלפפון' },
  { en: 'dirty',          he: 'מלוכלך' },
  { en: 'doctor',         he: 'רופא' },
  { en: 'drink',          he: 'לשתות' },
  { en: 'driver',         he: 'נהג' },
  { en: 'easy',           he: 'קל' },
  { en: 'eat',            he: 'לאכול' },
  { en: 'egg',            he: 'ביצה' },
  { en: 'evening',        he: 'ערב' },
  { en: 'family',         he: 'משפחה' },
  { en: 'famous',         he: 'מפורסם' },
  { en: 'fast',           he: 'מהיר' },
  { en: 'friend',         he: 'חבר' },
  { en: 'fruit salad',    he: 'סלט פירות' },
  { en: 'funny',          he: 'מצחיק' },
  { en: 'get up',         he: 'לקום' },
  { en: 'guard',          he: 'שומר' },
  { en: 'hamburger',      he: 'המבורגר' },
  { en: 'hard',           he: 'קשה' },
  { en: 'help',           he: 'לעזור' },
  { en: 'hot dog',        he: 'נקניקייה בלחמנייה' },
  { en: 'ice cream',      he: 'גלידה' },
  { en: 'important',      he: 'חשוב' },
  { en: 'juice',          he: 'מיץ' },
  { en: 'kind',           he: 'טוב לב' },
  { en: 'king',           he: 'מלך' },
  { en: 'learn',          he: 'ללמוד' },
  { en: 'lemonade',       he: 'לימונדה' },
  { en: 'lettuce',        he: 'חסה' },
  { en: 'live',           he: 'לגור' },
  { en: 'meatballs',      he: 'קציצות' },
  { en: 'month',          he: 'חודש' },
  { en: 'morning',        he: 'בוקר' },
  { en: 'new',            he: 'חדש' },
  { en: 'night',          he: 'לילה' },
  { en: 'nurse',          he: 'אחות' },
  { en: 'old',            he: 'ישן' },
  { en: 'onion',          he: 'בצל' },
  { en: 'orange',         he: 'תפוז' },
  { en: 'peach',          he: 'אפרסק' },
  { en: 'pepper',         he: 'פלפל' },
  { en: 'pick up',        he: 'להרים' },
  { en: 'pie',            he: 'פשטידה' },
  { en: 'plum',           he: 'שזיף' },
  { en: 'policeman',      he: 'שוטר' },
  { en: 'poor',           he: 'עני' },
  { en: 'potato',         he: 'תפוח אדמה' },
  { en: 'prince',         he: 'נסיך' },
  { en: 'princess',       he: 'נסיכה' },
  { en: 'rich',           he: 'עשיר' },
  { en: 'ride',           he: 'לרכוב' },
  { en: 'round',          he: 'עגול' },
  { en: 'sausage',        he: 'נקניקייה' },
  { en: 'save',           he: 'להציל' },
  { en: 'shopkeeper',     he: 'בעל חנות' },
  { en: 'sleep',          he: 'לישון' },
  { en: 'special',        he: 'מיוחד' },
  { en: 'spring',         he: 'אביב' },
  { en: 'strong',         he: 'חזק' },
  { en: 'summer',         he: 'קיץ' },
  { en: 'sweet',          he: 'מתוק' },
  { en: 'swim',           he: 'לשחות' },
  { en: 'tea',            he: 'תה' },
  { en: 'throw',          he: 'לזרוק' },
  { en: 'tired',          he: 'עייף' },
  { en: 'toast',          he: 'לחם קלוי' },
  { en: 'tomato',         he: 'עגבנייה' },
  { en: 'ugly',           he: 'מכוער' },
  { en: 'waiter',         he: 'מלצר' },
  { en: 'walk',           he: 'ללכת' },
  { en: 'warm',           he: 'חמים' },
  { en: 'watch',          he: 'לצפות' },
  { en: 'week',           he: 'שבוע' },
  { en: 'winter',         he: 'חורף' },
  { en: 'year',           he: 'שנה' },
  { en: 'young',          he: 'צעיר' },
]

const TOTAL_Q  = 20
const COIN_VAL = 8
const Q_TIME   = 20
const OPT_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA']

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function speak(text) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-US'
  u.rate = 0.82
  u.pitch = 1.05
  window.speechSynthesis.speak(u)
}

function buildQuestions() {
  const picked = shuffle(WORDS).slice(0, TOTAL_Q)
  return picked.map(word => {
    const dir = Math.random() < 0.5 ? 'en-to-he' : 'he-to-en'
    const others = shuffle(WORDS.filter(w => w.en !== word.en)).slice(0, 3)
    if (dir === 'en-to-he') {
      const options = shuffle([word.he, ...others.map(w => w.he)])
      return { dir, prompt: word.en, correct: word.he, options, word }
    } else {
      const options = shuffle([word.en, ...others.map(w => w.en)])
      return { dir, prompt: word.he, correct: word.en, options, word }
    }
  })
}

export default function SpellingGame({ player, onGameOver }) {
  const questionsRef              = useRef(buildQuestions())
  const scoreRef                  = useRef(0)
  const lockedRef                 = useRef(false)
  const timerRef                  = useRef(null)
  const [qIdx,      setQIdx]      = useState(0)
  const [selected,  setSelected]  = useState(null)
  const [coins,     setCoinsDisp] = useState(getCoins())
  const [score,     setScore]     = useState(0)
  const [remaining, setRemain]    = useState(Q_TIME)
  const [speaking,  setSpeaking]  = useState(false)
  const [coinPop,   setCoinPop]   = useState(null)

  const q = questionsRef.current[qIdx]

  function startTimer() {
    clearInterval(timerRef.current)
    setRemain(Q_TIME)
    timerRef.current = setInterval(() => {
      setRemain(r => {
        if (r <= 1) {
          clearInterval(timerRef.current)
          handleAnswer('__timeout__')
          return 0
        }
        return r - 1
      })
    }, 1000)
  }

  useEffect(() => {
    lockedRef.current = false
    startTimer()
    const delay = setTimeout(() => speakCurrent(), 400)
    return () => {
      clearInterval(timerRef.current)
      clearTimeout(delay)
      window.speechSynthesis?.cancel()
    }
  }, [qIdx]) // eslint-disable-line react-hooks/exhaustive-deps

  function speakCurrent() {
    setSpeaking(true)
    speak(questionsRef.current[qIdx].word.en)
    setTimeout(() => setSpeaking(false), 1800)
  }

  function advance(nextIdx) {
    if (nextIdx >= TOTAL_Q) {
      setTimeout(() => {
        const s = scoreRef.current
        onGameOver(s, TOTAL_Q, s >= TOTAL_Q / 2)
      }, 1100)
    } else {
      setTimeout(() => {
        setSelected(null)
        setQIdx(nextIdx)
      }, 1100)
    }
  }

  function handleAnswer(choice) {
    if (lockedRef.current) return
    lockedRef.current = true
    clearInterval(timerRef.current)
    setSelected(choice)

    if (choice === q.correct) {
      addCoins(COIN_VAL)
      setCoinsDisp(getCoins())
      scoreRef.current += 1
      setScore(scoreRef.current)
      setCoinPop(Date.now())
      setTimeout(() => setCoinPop(null), 1100)
    }

    advance(qIdx + 1)
  }

  const isTimeout = selected === '__timeout__'
  const isCorrect = selected !== null && !isTimeout && selected === q.correct
  const timerPct  = remaining / Q_TIME
  const timerColor = remaining > 12 ? '#4ade80' : remaining > 6 ? '#fbbf24' : '#f87171'

  return (
    <div className="spell-screen">

      {/* header */}
      <div className="spell-header">
        <div className="spell-header-left">
          <AvatarDisplay avatar={player.avatar} size={30} />
          <span className="spell-coins">🪙 {coins}</span>
        </div>
        <div className="spell-progress">{qIdx + 1} / {TOTAL_Q}</div>
      </div>

      {/* progress bar */}
      <div className="spell-prog-track">
        <div className="spell-prog-fill" style={{ width: `${(qIdx / TOTAL_Q) * 100}%` }} />
      </div>

      {/* question card */}
      <div className={`spell-card ${q.dir === 'en-to-he' ? 'spell-card-en' : 'spell-card-he'}`}>
        <div className="spell-direction-badge">
          {q.dir === 'en-to-he'
            ? <><span>🇺🇸 English</span><span className="spell-arrow">→</span><span>🇮🇱 עברית</span></>
            : <><span>🇮🇱 עברית</span><span className="spell-arrow">→</span><span>🇺🇸 English</span></>
          }
        </div>

        <div className="spell-prompt" dir={q.dir === 'he-to-en' ? 'rtl' : 'ltr'}>
          {q.prompt}
        </div>

        <button
          className={`spell-speak-btn${speaking ? ' spell-speaking' : ''}`}
          onClick={speakCurrent}
          title="שמע את המילה"
        >
          <span className="spell-speak-icon">🔊</span>
          <span className="spell-speak-label">שמע את המילה</span>
        </button>
      </div>

      {/* timer */}
      <div className="spell-timer-wrap">
        <div className="spell-timer-track">
          <div className="spell-timer-fill" style={{
            width: `${timerPct * 100}%`,
            background: timerColor,
          }} />
        </div>
        <span className="spell-timer-num" style={{ color: timerColor }}>{remaining}s</span>
      </div>

      {/* options */}
      <div className="spell-options">
        {q.options.map((opt, i) => {
          let cls = 'spell-opt'
          if (selected !== null) {
            if (opt === q.correct)         cls += ' spell-opt-correct'
            else if (opt === selected)     cls += ' spell-opt-wrong'
            else                           cls += ' spell-opt-dim'
          }
          return (
            <button
              key={opt}
              className={cls}
              style={selected === null ? { '--oc': OPT_COLORS[i] } : undefined}
              onClick={() => handleAnswer(opt)}
              disabled={selected !== null}
              dir={q.dir === 'en-to-he' ? 'rtl' : 'ltr'}
            >
              {opt}
            </button>
          )
        })}
      </div>

      {/* wrong answer — show correct */}
      {selected !== null && !isCorrect && (
        <div className="spell-correct-hint">
          <span>{isTimeout ? '⏰' : '❌'}</span>
          <span>{q.correct}</span>
        </div>
      )}

      {/* coin pop */}
      {coinPop && <div key={coinPop} className="coin-float spell-coin-float">🪙 +{COIN_VAL}</div>}

      {/* score dots */}
      <div className="spell-dots">
        {Array.from({ length: TOTAL_Q }, (_, i) => (
          <div key={i} className={`spell-dot ${
            i < qIdx ? (i < scoreRef.current ? 'spell-dot-ok' : 'spell-dot-miss') :
            i === qIdx ? 'spell-dot-cur' : ''
          }`} />
        ))}
      </div>

    </div>
  )
}
