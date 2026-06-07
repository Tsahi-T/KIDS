import { useState } from 'react'

const FAMILY = [
  { id: 'photo:OFEK',  label: 'אופק'  },
  { id: 'photo:ORI',   label: 'אורי'  },
  { id: 'photo:TSAHY', label: 'צאהי'  },
]

const EMOJIS = ['🦊', '🐸', '🐼', '🦁', '🐯', '🦄', '🐲', '🚀']

export default function NameEntry({ onStart }) {
  const [name,   setName]   = useState('')
  const [avatar, setAvatar] = useState('photo:OFEK')

  return (
    <div className="entry-screen">
      <div className="entry-logo">C3 Kids</div>
      <p className="entry-sub">לומדים ומשחקים</p>

      <label className="field-label">מה שמך?</label>
      <input
        className="name-input"
        type="text"
        placeholder="הכנס שם..."
        value={name}
        onChange={e => setName(e.target.value)}
        maxLength={12}
        autoFocus
      />

      {/* family photos */}
      <label className="field-label">המשפחה שלי</label>
      <div className="family-row">
        {FAMILY.map(f => (
          <button
            key={f.id}
            className={`family-btn${avatar === f.id ? ' selected' : ''}`}
            onClick={() => setAvatar(f.id)}
          >
            <img src={`/avatars/${f.id.split(':')[1]}.png`} alt={f.label} />
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      {/* emoji avatars */}
      <label className="field-label">או בחר דמות</label>
      <div className="avatar-grid">
        {EMOJIS.map(av => (
          <button
            key={av}
            className={`avatar-btn${avatar === av ? ' selected' : ''}`}
            onClick={() => setAvatar(av)}
          >
            {av}
          </button>
        ))}
      </div>

      <button
        className="start-btn"
        onClick={() => onStart(name.trim() || 'שחקן', avatar)}
      >
        בוא נשחק! 🎮
      </button>
    </div>
  )
}
