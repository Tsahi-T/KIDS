import { useState, useEffect } from 'react'
import AvatarDisplay from '../components/AvatarDisplay.jsx'

const GAME_LABELS = {
  math:         'לוח כפל 🔢',
  vocab:        'אוצר מילים 🖼️',
  numbers:      'מספרים 🔢',
  prepositions: 'מיקום 📍',
  months:       'חודשי השנה 📅',
  flags:        'דגלי מדינות 🌍',
}

function fmt(isoDate) {
  const d = new Date(isoDate)
  return `${d.getDate()}/${d.getMonth() + 1} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

export default function Dashboard({ player, userProfile, onBack, onLeaderboard }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userProfile?.userId) { setLoading(false); return }
    fetch(`/api/stats?user=${userProfile.userId}`)
      .then(r => r.json())
      .then(data => setProfile(data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false))
  }, [userProfile?.userId])

  const games = profile?.games ?? {}

  return (
    <div className="dash-screen">
      <div className="dash-header">
        <button className="back-link" onClick={onBack}>← חזרה</button>
        <div className="dash-player">
          <AvatarDisplay avatar={player.avatar} size={48} />
          <div className="dash-player-info">
            <div className="dash-player-name">{player.name}</div>
            <div className="dash-player-coins">🪙 {profile?.coins ?? userProfile?.coins ?? 0} מטבעות</div>
          </div>
        </div>
        {onLeaderboard && (
          <button className="dash-lb-btn" onClick={onLeaderboard}>🏆 שיאים</button>
        )}
      </div>

      <div className="dash-title">הישגים שלי</div>

      {loading && <div className="dash-loading">טוען...</div>}

      {!loading && Object.keys(games).length === 0 && (
        <div className="dash-empty">עדיין לא שיחקת. יאללה! 🎮</div>
      )}

      <div className="dash-games-list">
        {Object.entries(games).map(([gameId, g]) => {
          const recent = [...(g.history || [])].reverse().slice(0, 5)
          return (
            <div key={gameId} className="dash-game-card">
              <div className="dash-game-header">
                <span className="dash-game-name">{GAME_LABELS[gameId] ?? gameId}</span>
                <span className="dash-game-badge">שיא: {g.bestScore}/25</span>
              </div>
              <div className="dash-game-meta">
                <span>🎮 {g.played} משחקים</span>
              </div>
              <div className="dash-history">
                {recent.map((h, i) => (
                  <div key={i} className="dash-history-row">
                    <span className="dash-hist-date">{fmt(h.date)}</span>
                    <span className="dash-hist-score">{h.score}/{h.total}</span>
                    <span className="dash-hist-pct">{Math.round(h.score / h.total * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
