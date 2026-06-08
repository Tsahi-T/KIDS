import { useState, useEffect } from 'react'
import AvatarDisplay from '../components/AvatarDisplay.jsx'
import { getCoins } from '../utils/coins.js'

const SUBJECTS = [
  {
    id: 'math',
    icon: '🔢',
    name: 'חשבון',
    desc: 'לוח כפל',
    color1: '#6C63FF',
    color2: '#4834D4',
    available: true,
  },
  {
    id: 'hebrew',
    icon: '📖',
    name: 'עברית',
    desc: 'קריאה מהירה',
    color1: '#FF6B9D',
    color2: '#C9184A',
    available: true,
  },
  {
    id: 'english',
    icon: '🔤',
    name: 'English',
    desc: 'אוצר מילים',
    color1: '#43C59E',
    color2: '#1A7A5E',
    available: true,
  },
  {
    id: 'general',
    icon: '🧠',
    name: 'ידע כללי',
    desc: 'דגלים • חודשים',
    color1: '#F59E0B',
    color2: '#B45309',
    available: true,
  },
]

export default function SubjectMap({ player, userProfile, onSelect, onRandom, onDashboard, onLeaderboard, onHome }) {
  const [coins,    setCoins]    = useState(0)
  const [rolling,  setRolling]  = useState(false)

  function handleRandom() {
    if (rolling) return
    setRolling(true)
    setTimeout(() => { setRolling(false); onRandom() }, 700)
  }

  useEffect(() => {
    setCoins(getCoins())
  }, [])

  return (
    <div className="map-screen">

      {/* header */}
      <div className="map-header">
        <button className="map-back-home" onClick={onHome}>← החלף שחקן</button>
        <div className="map-avatar">
          <AvatarDisplay avatar={player.avatar} size={38} />
        </div>
        <div className="map-greeting">
          <span className="map-hello">שלום,</span>
          <span className="map-name">{player.name}!</span>
        </div>
        <div className="map-coins-badge">
          <span>🪙</span>
          <span>{coins}</span>
        </div>
        {userProfile && (
          <div className="map-icon-btns">
            <button className="map-icon-btn" onClick={onDashboard} title="הישגים">📊</button>
            <button className="map-icon-btn" onClick={onLeaderboard} title="שיאים">🏆</button>
          </div>
        )}
        <div className="map-title-text">בחר מקצוע</div>
      </div>

      {/* subject cards */}
      <div className="subjects-grid">
        {SUBJECTS.map(s => (
          <button
            key={s.id}
            className={`subject-card${s.available ? '' : ' locked'}`}
            style={{ '--c1': s.color1, '--c2': s.color2 }}
            onClick={() => s.available && onSelect(s.id)}
            disabled={!s.available}
          >
            <div className="subject-glow" />
            <div className="subject-icon">{s.icon}</div>
            <div className="subject-name-col">
              <div className="subject-name">{s.name}</div>
              <div className="subject-desc">{s.desc}</div>
            </div>
            {!s.available && <div className="subject-lock">🔒</div>}
          </button>
        ))}
      </div>

      {/* random game button */}
      <button
        className={`random-game-btn${rolling ? ' rolling' : ''}`}
        onClick={handleRandom}
        disabled={rolling}
      >
        <span className="random-dice">{rolling ? '🎲' : '🎲'}</span>
        <span className="random-label">הגרל משחק!</span>
      </button>

      {/* decorative stars */}
      <div className="map-stars" aria-hidden="true">
        {Array.from({ length: 18 }, (_, i) => (
          <span
            key={i}
            className="map-star"
            style={{
              left:  `${(i * 37 + 11) % 95}%`,
              top:   `${(i * 53 + 7)  % 85}%`,
              animationDelay: `${(i * 0.4) % 3}s`,
              fontSize: `${0.5 + (i % 3) * 0.25}rem`,
              opacity: 0.15 + (i % 4) * 0.06,
            }}
          >★</span>
        ))}
      </div>

    </div>
  )
}
