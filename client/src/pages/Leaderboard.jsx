import { useState, useEffect } from 'react'

const AVATARS  = { ofek: 'photo:OFEK', ori: 'photo:ORI', tsahy: 'photo:TSAHY' }
const MEDALS   = ['🥇', '🥈', '🥉']

const GAME_LABELS = {
  math:         'כפל',
  vocab:        'מילים',
  numbers:      'מספרים',
  prepositions: 'מיקום',
  months:       'חודשים',
  flags:        'דגלים',
}

export default function Leaderboard({ player, userProfile, onBack }) {
  const [board,   setBoard]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(data => setBoard(Array.isArray(data) ? data : []))
      .catch(() => setBoard([]))
      .finally(() => setLoading(false))
  }, [])

  // collect all game IDs that appear in any profile
  const allGames = [...new Set(board.flatMap(u => Object.keys(u.games || {})))]

  return (
    <div className="lb-screen">
      <div className="lb-header">
        <button className="back-link" onClick={onBack}>← חזרה</button>
        <div className="lb-title">🏆 לוח שיאים</div>
      </div>

      {loading && <div className="lb-loading">טוען...</div>}

      {/* podium */}
      {!loading && (
        <div className="lb-podium">
          {board.map((u, i) => (
            <div key={u.userId} className={`lb-row${u.userId === userProfile?.userId ? ' lb-row-me' : ''}`}>
              <span className="lb-medal">{MEDALS[i] ?? `${i + 1}.`}</span>
              <span className="lb-user-name">{u.name}</span>
              <span className="lb-coins">🪙 {u.coins}</span>
            </div>
          ))}
        </div>
      )}

      {/* per-game best scores */}
      {!loading && allGames.length > 0 && (
        <div className="lb-games">
          <div className="lb-games-title">שיאים לפי משחקון</div>
          {allGames.map(gameId => (
            <div key={gameId} className="lb-game-row">
              <div className="lb-game-label">{GAME_LABELS[gameId] ?? gameId}</div>
              <div className="lb-game-scores">
                {board.map(u => {
                  const g = u.games[gameId]
                  return (
                    <div key={u.userId}
                      className={`lb-game-score${u.userId === userProfile?.userId ? ' lb-me' : ''}`}
                    >
                      <span className="lb-gs-name">{u.name}</span>
                      <span className="lb-gs-val">{g ? `${g.bestScore}/25` : '—'}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
