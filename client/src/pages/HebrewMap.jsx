import { useState, useEffect } from 'react'
import AvatarDisplay from '../components/AvatarDisplay.jsx'
import { getCoins } from '../utils/coins.js'

const GAMES = [
  {
    id: 'flash',
    icon: '⚡',
    name: 'הבזק מילים',
    desc: 'קרא מהר, זכור טוב',
    color1: '#FF6B9D',
    color2: '#C9184A',
    available: true,
  },
  {
    id: 'reading',
    icon: '🖼️',
    name: 'קרא ובחר',
    desc: 'מילה ← תמונה',
    color1: '#F59E0B',
    color2: '#B45309',
    available: true,
  },
  {
    id: 'trivia',
    icon: '🧠',
    name: 'ידע מגניב',
    desc: 'קרא, זכור, ענה!',
    color1: '#06b6d4',
    color2: '#0284c7',
    available: true,
  },
]

export default function HebrewMap({ player, onSelect, onBack }) {
  const [coins, setCoins] = useState(0)
  useEffect(() => { setCoins(getCoins()) }, [])

  return (
    <div className="engmap-screen">
      <div className="engmap-header">
        <button className="engmap-back" onClick={onBack}>← מפה</button>
        <div className="engmap-title-row">
          <AvatarDisplay avatar={player.avatar} size={32} />
          <span className="engmap-title">📖 עברית</span>
          <div className="map-coins-badge">🪙 {coins}</div>
        </div>
        <div className="engmap-subtitle">בחר משחקון</div>
      </div>

      <div className="engmap-path">
        {GAMES.map((g, i) => (
          <div key={g.id} className={`engmap-node-wrap side-${i % 2 === 0 ? 'right' : 'left'}`}>
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
