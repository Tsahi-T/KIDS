import { useState, useEffect } from 'react'
import AvatarDisplay from '../components/AvatarDisplay.jsx'

const GAME_LABELS = {
  math:         'לוח כפל 🔢',
  vocab:        'אוצר מילים 🖼️',
  numbers:      'מספרים 🔢',
  prepositions: 'מיקום 📍',
  months:       'חודשי השנה 📅',
  flags:        'דגלי מדינות 🌍',
  colors:       'צבעים 🎨',
  flash:        'הבזק מילים ⚡',
}

const GAME_COLORS = {
  math:         '#6C63FF',
  vocab:        '#43C59E',
  numbers:      '#6C63FF',
  prepositions: '#FF6B9D',
  months:       '#F97316',
  flags:        '#3B82F6',
  colors:       '#A855F7',
  flash:        '#FF6B9D',
}

const FAMILY_USERS = [
  { id: 'ofek',  label: 'אופק', avatar: 'photo:OFEK'  },
  { id: 'ori',   label: 'אורי', avatar: 'photo:ORI'   },
  { id: 'tsahy', label: 'צחי', avatar: 'photo:TSAHY' },
]

function fmt(isoDate) {
  const d = new Date(isoDate)
  return `${d.getDate()}/${d.getMonth() + 1} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

function fmtDate(isoDate) {
  const d = new Date(isoDate)
  return `${d.getDate()}/${d.getMonth() + 1}/${String(d.getFullYear()).slice(2)}`
}

function pct(score, total) {
  if (!total) return 0
  return Math.round(score / total * 100)
}

function PctBar({ value, color }) {
  return (
    <div className="pct-bar-wrap">
      <div
        className="pct-bar-fill"
        style={{ width: `${value}%`, background: color ?? '#6C63FF' }}
      />
    </div>
  )
}

// ── Analytics view (admin only) ─────────────────────────────────────
function AnalyticsPanel({ profile, userName }) {
  const games = profile?.games ?? {}
  const [filterGame, setFilterGame] = useState('all')

  // flatten all history entries across games
  const allEntries = Object.entries(games).flatMap(([gameId, g]) =>
    (g.history ?? []).map(h => ({ ...h, gameId }))
  ).sort((a, b) => new Date(b.date) - new Date(a.date))

  const filtered = filterGame === 'all'
    ? allEntries
    : allEntries.filter(e => e.gameId === filterGame)

  // per-game aggregate
  const gameIds = Object.keys(games)

  return (
    <div className="analytics-wrap">

      {/* summary cards per game */}
      <div className="analytics-section-title">📊 סיכום לפי משחק</div>
      <div className="analytics-cards">
        {gameIds.map(gid => {
          const g       = games[gid]
          const history = g.history ?? []
          const avgPct  = history.length
            ? Math.round(history.reduce((s, h) => s + pct(h.score, h.total), 0) / history.length)
            : 0
          const bestPct = history.length
            ? Math.max(...history.map(h => pct(h.score, h.total)))
            : 0
          const trend   = history.length >= 2
            ? pct(history.at(-1).score, history.at(-1).total) - pct(history.at(-2).score, history.at(-2).total)
            : null
          const color   = GAME_COLORS[gid] ?? '#6C63FF'
          return (
            <div key={gid} className="analytics-card" style={{ borderColor: color }}>
              <div className="analytics-card-title">{GAME_LABELS[gid] ?? gid}</div>
              <div className="analytics-card-row">
                <span className="analytics-stat-label">משחקים</span>
                <span className="analytics-stat-val">{g.played}</span>
              </div>
              <div className="analytics-card-row">
                <span className="analytics-stat-label">ממוצע</span>
                <span className="analytics-stat-val">{avgPct}%</span>
              </div>
              <PctBar value={avgPct} color={color} />
              <div className="analytics-card-row">
                <span className="analytics-stat-label">שיא</span>
                <span className="analytics-stat-val">{bestPct}%</span>
              </div>
              {trend !== null && (
                <div className={`analytics-trend ${trend >= 0 ? 'trend-up' : 'trend-down'}`}>
                  {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}% vs קודם
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* timeline filter */}
      <div className="analytics-section-title" style={{ marginTop: '1.4rem' }}>
        📅 היסטוריה לפי תאריך
      </div>
      <div className="analytics-filter-row">
        <button
          className={`af-btn${filterGame === 'all' ? ' af-active' : ''}`}
          onClick={() => setFilterGame('all')}
        >הכל</button>
        {gameIds.map(gid => (
          <button
            key={gid}
            className={`af-btn${filterGame === gid ? ' af-active' : ''}`}
            style={filterGame === gid ? { borderColor: GAME_COLORS[gid] ?? '#6C63FF', color: GAME_COLORS[gid] ?? '#6C63FF' } : {}}
            onClick={() => setFilterGame(gid)}
          >
            {(GAME_LABELS[gid] ?? gid).split(' ')[0]}
          </button>
        ))}
      </div>

      {/* scrollable timeline */}
      <div className="analytics-timeline">
        {filtered.length === 0 && (
          <div className="dash-empty">אין נתונים עדיין 🎮</div>
        )}
        {filtered.map((entry, i) => {
          const p     = pct(entry.score, entry.total)
          const color = GAME_COLORS[entry.gameId] ?? '#6C63FF'
          const grade = p >= 80 ? '⭐' : p >= 60 ? '👍' : '💪'
          return (
            <div key={i} className="tl-row">
              <div className="tl-dot" style={{ background: color }} />
              <div className="tl-content">
                <div className="tl-top">
                  <span className="tl-game">{GAME_LABELS[entry.gameId] ?? entry.gameId}</span>
                  <span className="tl-date">{fmt(entry.date)}</span>
                </div>
                <div className="tl-bottom">
                  <PctBar value={p} color={color} />
                  <span className="tl-score">{entry.score}/{entry.total}</span>
                  <span className="tl-pct" style={{ color }}>{p}%</span>
                  <span className="tl-grade">{grade}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main Dashboard ───────────────────────────────────────────────────
export default function Dashboard({ player, userProfile, onBack, onLeaderboard }) {
  const isAdmin = userProfile?.userId === 'tsahy'

  const [viewUserId, setViewUserId] = useState(userProfile?.userId ?? null)
  const [profile,    setProfile]    = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [mode,       setMode]       = useState('stats') // 'stats' | 'analytics'

  useEffect(() => {
    if (!viewUserId) { setLoading(false); return }
    setLoading(true)
    setProfile(null)
    fetch(`/api/stats?user=${viewUserId}`)
      .then(r => r.json())
      .then(data => setProfile(data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false))
  }, [viewUserId])

  const viewUser      = FAMILY_USERS.find(u => u.id === viewUserId)
  const displayAvatar = isAdmin ? (viewUser?.avatar ?? player.avatar) : player.avatar
  const displayName   = isAdmin ? (viewUser?.label  ?? player.name)  : player.name
  const games         = profile?.games ?? {}

  return (
    <div className="dash-screen">

      {/* header */}
      <div className="dash-header">
        <button className="back-link" onClick={onBack}>← חזרה</button>
        <div className="dash-player">
          <AvatarDisplay avatar={displayAvatar} size={42} />
          <div className="dash-player-info">
            <div className="dash-player-name">{displayName}</div>
            <div className="dash-player-coins">🪙 {profile?.coins ?? 0} מטבעות</div>
          </div>
        </div>
        {onLeaderboard && (
          <button className="dash-lb-btn" onClick={onLeaderboard}>🏆 שיאים</button>
        )}
      </div>

      {/* admin user tabs */}
      {isAdmin && (
        <div className="dash-user-tabs">
          {FAMILY_USERS.map(u => (
            <button
              key={u.id}
              className={`dash-tab${viewUserId === u.id ? ' dash-tab-active' : ''}`}
              onClick={() => setViewUserId(u.id)}
            >
              <AvatarDisplay avatar={u.avatar} size={26} />
              <span>{u.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* admin mode toggle */}
      {isAdmin && (
        <div className="dash-mode-toggle">
          <button
            className={`dmt-btn${mode === 'stats' ? ' dmt-active' : ''}`}
            onClick={() => setMode('stats')}
          >📋 הישגים</button>
          <button
            className={`dmt-btn${mode === 'analytics' ? ' dmt-active' : ''}`}
            onClick={() => setMode('analytics')}
          >📊 ניתוח מעמיק</button>
        </div>
      )}

      <div className="dash-title">
        {isAdmin && viewUserId !== userProfile?.userId
          ? `${mode === 'analytics' ? 'ניתוח' : 'הישגים'} של ${displayName}`
          : 'הישגים שלי'}
      </div>

      {loading && <div className="dash-loading">טוען...</div>}

      {/* ── ANALYTICS MODE (admin only) ── */}
      {!loading && isAdmin && mode === 'analytics' && (
        <AnalyticsPanel profile={profile} userName={displayName} />
      )}

      {/* ── STATS MODE (default) ── */}
      {!loading && mode === 'stats' && (
        <>
          {Object.keys(games).length === 0 && (
            <div className="dash-empty">עדיין לא שיחקו כאן. יאללה! 🎮</div>
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
                  <div className="dash-game-meta">🎮 {g.played} משחקים</div>
                  <div className="dash-history">
                    {recent.map((h, i) => (
                      <div key={i} className="dash-history-row">
                        <span className="dash-hist-date">{fmt(h.date)}</span>
                        <span className="dash-hist-score">{h.score}/{h.total}</span>
                        <span className="dash-hist-pct">{pct(h.score, h.total)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
