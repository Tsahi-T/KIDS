import { useState, useEffect, useRef } from 'react'
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
  reading:      'קרא ובחר 🖼️',
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
  reading:      '#F59E0B',
}


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

// ── Admin: delete user panel ─────────────────────────────────────────
function ManageUsers({ adminProfile, allUsers, onUsersChanged }) {
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [adminPin,     setAdminPin]     = useState(['', '', '', ''])
  const [delError,     setDelError]     = useState('')
  const [delLoading,   setDelLoading]   = useState(false)
  const pinRefs = useRef([])

  function openDelete(u) {
    setDeleteTarget(u)
    setAdminPin(['', '', '', ''])
    setDelError('')
    setTimeout(() => pinRefs.current[0]?.focus(), 150)
  }

  function handleDigit(i, val) {
    if (!/^\d?$/.test(val)) return
    const next = [...adminPin]
    next[i] = val
    setAdminPin(next)
    if (val && i < 3) pinRefs.current[i + 1]?.focus()
    if (val && next.every(d => d)) confirmDelete(next.join(''))
  }

  async function confirmDelete(pin) {
    setDelLoading(true)
    setDelError('')
    try {
      const r = await fetch('/api/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPin: pin, targetUserId: deleteTarget.userId }),
      })
      const data = await r.json()
      if (data.ok) {
        setDeleteTarget(null)
        onUsersChanged()
      } else {
        setDelError(data.error === 'unauthorized' ? 'קוד שגוי' : 'שגיאה')
        setAdminPin(['', '', '', ''])
        setTimeout(() => pinRefs.current[0]?.focus(), 100)
      }
    } catch {
      setDelError('שגיאת רשת')
    } finally {
      setDelLoading(false)
    }
  }

  const deletable = allUsers.filter(u => !u.isAdmin)

  if (deleteTarget) {
    return (
      <div style={{ padding: '1rem 0' }}>
        <button className="back-link" style={{ marginBottom: '1rem' }} onClick={() => setDeleteTarget(null)}>← ביטול</button>
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <AvatarDisplay avatar={deleteTarget.avatar} size={56} />
          <div style={{ marginTop: '0.5rem', fontWeight: 700 }}>מחיקת {deleteTarget.name}</div>
          <div style={{ color: '#f87171', fontSize: '0.85rem', marginTop: '0.25rem' }}>פעולה זו אינה ניתנת לביטול</div>
        </div>
        <div className="pin-label">הכנס את הקוד שלך לאישור</div>
        <div className="pin-inputs">
          {adminPin.map((d, i) => (
            <input
              key={i}
              ref={el => pinRefs.current[i] = el}
              className="pin-digit"
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleDigit(i, e.target.value)}
              onKeyDown={e => { if (e.key === 'Backspace' && !adminPin[i] && i > 0) pinRefs.current[i-1]?.focus() }}
              disabled={delLoading}
            />
          ))}
        </div>
        {delError && <div className="pin-error-msg">{delError}</div>}
        {delLoading && <div className="pin-loading">מוחק...</div>}
      </div>
    )
  }

  return (
    <div style={{ padding: '0.5rem 0' }}>
      <div className="dash-title">ניהול משתמשים</div>
      {deletable.length === 0 && (
        <div className="dash-empty">אין משתמשים למחוק</div>
      )}
      {deletable.map(u => (
        <div key={u.userId} style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.6rem 0.75rem', marginBottom: '0.5rem',
          background: 'rgba(255,255,255,0.05)', borderRadius: 12,
        }}>
          <AvatarDisplay avatar={u.avatar} size={40} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>{u.name}</div>
            <div style={{ fontSize: '0.75rem', color: '#888' }}>
              {new Date(u.createdAt).toLocaleDateString('he-IL')}
            </div>
          </div>
          <button
            onClick={() => openDelete(u)}
            style={{
              background: 'rgba(248,113,113,0.15)', color: '#f87171',
              border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8,
              padding: '0.35rem 0.75rem', cursor: 'pointer', fontSize: '0.85rem',
              fontFamily: 'Heebo, sans-serif',
            }}
          >
            מחק
          </button>
        </div>
      ))}
    </div>
  )
}

// ── Main Dashboard ───────────────────────────────────────────────────
export default function Dashboard({ player, userProfile, onBack, onLeaderboard }) {
  const isAdmin = userProfile?.userId === 'tsahy'

  const [allUsers,    setAllUsers]    = useState([])
  const [viewUserId,  setViewUserId]  = useState(userProfile?.userId ?? null)
  const [profile,     setProfile]     = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [mode,        setMode]        = useState('stats') // 'stats' | 'analytics' | 'manage'

  function fetchUsers() {
    fetch('/api/users/list')
      .then(r => r.json())
      .then(setAllUsers)
      .catch(() => {})
  }

  useEffect(() => {
    if (isAdmin) fetchUsers()
  }, [isAdmin])

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

  const viewUser      = allUsers.find(u => u.userId === viewUserId)
  const displayAvatar = isAdmin ? (viewUser?.avatar ?? player.avatar) : player.avatar
  const displayName   = isAdmin ? (viewUser?.name   ?? player.name)  : player.name
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
      {isAdmin && mode !== 'manage' && (
        <div className="dash-user-tabs" style={{ overflowX: 'auto' }}>
          {allUsers.map(u => (
            <button
              key={u.userId}
              className={`dash-tab${viewUserId === u.userId ? ' dash-tab-active' : ''}`}
              onClick={() => setViewUserId(u.userId)}
            >
              <AvatarDisplay avatar={u.avatar} size={26} />
              <span>{u.name}</span>
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
          >📊 ניתוח</button>
          <button
            className={`dmt-btn${mode === 'manage' ? ' dmt-active' : ''}`}
            onClick={() => setMode('manage')}
          >👥 ניהול</button>
        </div>
      )}

      {/* ── MANAGE MODE (admin only) ── */}
      {isAdmin && mode === 'manage' && (
        <ManageUsers
          adminProfile={userProfile}
          allUsers={allUsers}
          onUsersChanged={() => { fetchUsers() }}
        />
      )}

      {mode !== 'manage' && (
        <>
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
        </>
      )}
    </div>
  )
}
