import { useState } from 'react'

const AVATARS = ['🦊', '🐸', '🐼', '🦁', '🐯', '🦄', '🐲', '🚀']

export default function NameEntry({ onStart }) {
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('🦊')

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

      <label className="field-label">בחר אווטר</label>
      <div className="avatar-grid">
        {AVATARS.map(av => (
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
