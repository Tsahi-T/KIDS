import AvatarDisplay from '../components/AvatarDisplay.jsx'
import { getCoins } from '../utils/coins.js'
import { useState, useEffect } from 'react'

const GAMES = [
  {
    id: 'vocab',
    icon: '🖼️',
    name: 'מילים ותמונות',
    desc: 'Words & Pictures',
    color1: '#43C59E',
    color2: '#1A7A5E',
    available: true,
  },
  {
    id: 'numbers',
    icon: '🔢',
    name: 'מספרים',
    desc: 'Numbers 1–20',
    color1: '#6C63FF',
    color2: '#4834D4',
    available: true,
  },
  {
    id: 'prepositions',
    icon: '📍',
    name: 'מיקום',
    desc: 'On • Under • Next to...',
    color1: '#FF6B9D',
    color2: '#C9184A',
    available: true,
  },
  {
    id: 'coming1',
    icon: '🔒',
    name: 'בקרוב',
    desc: 'עוד משחקים בדרך!',
    color1: '#2a2a3e',
    color2: '#1a1a2e',
    available: false,
  },
]

export default function EnglishMap({ player, onSelect, onBack }) {
  const [coins, setCoins] = useState(0)
  useEffect(() => { setCoins(getCoins()) }, [])

  return (
    <div className="engmap-screen">

      {/* header */}
      <div className="engmap-header">
        <button className="engmap-back" onClick={onBack}>← מפה</button>
        <div className="engmap-title-row">
          <AvatarDisplay avatar={player.avatar} size={32} />
          <span className="engmap-title">English</span>
          <div className="map-coins-badge">🪙 {coins}</div>
        </div>
        <div className="engmap-subtitle">בחר משחקון</div>
      </div>

      {/* adventure path */}
      <div className="engmap-path">
        {GAMES.map((g, i) => (
          <div key={g.id} className={`engmap-node-wrap side-${i % 2 === 0 ? 'right' : 'left'}`}>
            {/* connector line (not for last) */}
            {i < GAMES.length - 1 && <div className="engmap-connector" />}

            <button
              className={`engmap-node${g.available ? '' : ' engmap-locked'}`}
              style={{ '--c1': g.color1, '--c2': g.color2 }}
              onClick={() => g.available && onSelect(g.id)}
              disabled={!g.available}
            >
              <div className="engmap-node-glow" />
              <span className="engmap-node-icon">{g.icon}</span>
              <div className="engmap-node-info">
                <div className="engmap-node-name">{g.name}</div>
                <div className="engmap-node-desc">{g.desc}</div>
              </div>
              {!g.available && <span className="engmap-lock">🔒</span>}
            </button>
          </div>
        ))}
      </div>

      {/* bg stars */}
      <div className="map-stars" aria-hidden="true">
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i} className="map-star" style={{
            left: `${(i * 43 + 7) % 92}%`,
            top:  `${(i * 61 + 13) % 88}%`,
            animationDelay: `${(i * 0.5) % 3}s`,
            fontSize: `${0.4 + (i % 3) * 0.2}rem`,
            opacity: 0.1 + (i % 4) * 0.05,
          }}>★</span>
        ))}
      </div>
    </div>
  )
}
