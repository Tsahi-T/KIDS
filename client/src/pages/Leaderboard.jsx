import { useState, useEffect } from 'react'
import AvatarDisplay from '../components/AvatarDisplay.jsx'

const MEDALS = ['🥇', '🥈', '🥉']

const GAME_LABELS = {
  math:         'כפל',
  vocab:        'מילים',
  numbers:      'מספרים',
  prepositions: 'מיקום',
  months:       'חודשים',
  flags:        'דגלים',
  colors:       'צבעים',
  flash:        'הבזק',
  reading:      'קריאה',
  trivia:       'ידע מגניב',
}

function fmtTime(seconds) {
  if (!seconds) return '—'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}ש׳ ${m}ד׳`
  if (m > 0) return `${m}ד׳ ${s}ש׳`
  return `${s}ש׳`
}

export default function Leaderboard({ player, userProfile, onBack }) {
  const [board,   setBoard]   = useState([])
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState('coins') // 'coins' | 'time'

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(data => setBoard(Array.isArray(data) ? data : []))
      .catch(() => setBoard([]))
      .finally(() => setLoading(false))
  }, [])

  const allGames = [...new Set(board.flatMap(u => Object.keys(u.games || {})))]

  const coinsSorted = [...board].sort((a, b) => b.coins - a.coins)
  const timeSorted  = [...board].sort((a, b) => b.totalSeconds - a.totalSeconds)

  return (
    <div className="lb-screen">
      <div className="lb-header">
        <button className="back-link" onClick={onBack}>← חזרה</button>
        <div className="lb-title">🏆 לוח שיאים</div>
      </div>

      {/* tab toggle */}
      <div className="dash-mode-toggle" style={{ margin: '0 1rem 0.75rem' }}>
        <button
          className={`dmt-btn${tab === 'coins' ? ' dmt-active' : ''}`}
          onClick={() => setTab('coins')}
        >🪙 מטבעות</button>
        <button
          className={`dmt-btn${tab === 'time' ? ' dmt-active' : ''}`}
          onClick={() => setTab('time')}
        >⏱️ זמן משחק</button>
      </div>

      {loading && <div className="lb-loading">טוען...</div>}

      {/* coins leaderboard */}
      {!loading && tab === 'coins' && (
        <>
          <div className="lb-podium">
            {coinsSorted.map((u, i) => (
              <div key={u.userId} className={`lb-row${u.userId === userProfile?.userId ? ' lb-row-me' : ''}`}>
                <span className="lb-medal">{MEDALS[i] ?? `${i + 1}.`}</span>
                <AvatarDisplay avatar={u.avatar} size={32} />
                <span className="lb-user-name">{u.name}</span>
                <span className="lb-coins">🪙 {u.coins}</span>
              </div>
            ))}
          </div>

          {/* per-game best scores */}
          {allGames.length > 0 && (
            <div className="lb-games">
              <div className="lb-games-title">שיאים לפי משחקון</div>
              {allGames.map(gameId => (
                <div key={gameId} className="lb-game-row">
                  <div className="lb-game-label">{GAME_LABELS[gameId] ?? gameId}</div>
                  <div className="lb-game-scores">
                    {coinsSorted.map(u => {
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
        </>
      )}

      {/* time leaderboard */}
      {!loading && tab === 'time' && (
        <>
          <div className="lb-podium">
            {timeSorted.map((u, i) => (
              <div key={u.userId} className={`lb-row${u.userId === userProfile?.userId ? ' lb-row-me' : ''}`}>
                <span className="lb-medal">{MEDALS[i] ?? `${i + 1}.`}</span>
                <AvatarDisplay avatar={u.avatar} size={32} />
                <span className="lb-user-name">{u.name}</span>
                <span className="lb-coins">⏱️ {fmtTime(u.totalSeconds)}</span>
              </div>
            ))}
          </div>

          {/* per-game time */}
          {allGames.length > 0 && (
            <div className="lb-games">
              <div className="lb-games-title">זמן לפי משחקון</div>
              {allGames.map(gameId => (
                <div key={gameId} className="lb-game-row">
                  <div className="lb-game-label">{GAME_LABELS[gameId] ?? gameId}</div>
                  <div className="lb-game-scores">
                    {timeSorted.map(u => {
                      const g = u.games[gameId]
                      return (
                        <div key={u.userId}
                          className={`lb-game-score${u.userId === userProfile?.userId ? ' lb-me' : ''}`}
                        >
                          <span className="lb-gs-name">{u.name}</span>
                          <span className="lb-gs-val">{g?.totalSeconds ? fmtTime(g.totalSeconds) : '—'}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
