import { useState, useRef, useEffect } from 'react'
import AvatarDisplay from '../components/AvatarDisplay.jsx'

const EMOJIS = ['🦊', '🐸', '🐼', '🦁', '🐯', '🦄', '🐲', '🚀', '🐙', '🦋', '🐬', '🦖']

function resizeImage(file, size = 280) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        const min = Math.min(img.width, img.height)
        const sx = (img.width - min) / 2
        const sy = (img.height - min) / 2
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function NameEntry({ onStart }) {
  const [step, setStep]               = useState('home')
  const [users, setUsers]             = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)

  // Login state
  const [selected, setSelected]       = useState(null)
  const [pin, setPin]                 = useState(['', '', '', ''])
  const [pinError, setPinError]       = useState(false)
  const [loading, setLoading]         = useState(false)

  // Guest state
  const [guestName, setGuestName]     = useState('')
  const [guestAvatar, setGuestAvatar] = useState(EMOJIS[0])

  // Register state
  const [regName, setRegName]         = useState('')
  const [regPin, setRegPin]           = useState(['', '', '', ''])
  const [regPin2, setRegPin2]         = useState(['', '', '', ''])
  const [regAvatar, setRegAvatar]     = useState(EMOJIS[0])
  const [regPhoto, setRegPhoto]       = useState(null)   // base64 preview
  const [regPhotoData, setRegPhotoData] = useState(null) // base64 to upload
  const [regError, setRegError]       = useState('')
  const [regLoading, setRegLoading]   = useState(false)
  const [regSuccess, setRegSuccess]   = useState(false)

  const inputRefs    = useRef([])
  const regPinRefs   = useRef([])
  const regPin2Refs  = useRef([])
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetch('/api/users/list')
      .then(r => r.json())
      .then(list => { setUsers(list); setLoadingUsers(false) })
      .catch(() => setLoadingUsers(false))
  }, [])

  /* ── PIN login helpers ──────────────────────────────── */
  function openPin(user) {
    setSelected(user)
    setPin(['', '', '', ''])
    setPinError(false)
    setStep('pin')
    setTimeout(() => inputRefs.current[0]?.focus(), 150)
  }

  function handleDigit(i, val) {
    if (!/^\d?$/.test(val)) return
    const next = [...pin]
    next[i] = val
    setPin(next)
    if (val && i < 3) inputRefs.current[i + 1]?.focus()
    if (val && next.every(d => d)) submitPin(next.join(''))
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace' && !pin[i] && i > 0) inputRefs.current[i - 1]?.focus()
  }

  async function submitPin(code) {
    setLoading(true)
    try {
      const r = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: selected.userId, pin: code }),
      })
      const data = await r.json()
      if (data.ok) {
        onStart(selected.name, selected.avatar, data.profile)
      } else {
        setPinError(true)
        setPin(['', '', '', ''])
        setTimeout(() => { setPinError(false); inputRefs.current[0]?.focus() }, 1200)
      }
    } catch {
      setPinError(true)
      setPin(['', '', '', ''])
      setTimeout(() => { setPinError(false); inputRefs.current[0]?.focus() }, 1200)
    } finally {
      setLoading(false)
    }
  }

  /* ── Register helpers ───────────────────────────────── */
  function handleRegDigit(refs, arr, setArr, i, val, onComplete) {
    if (!/^\d?$/.test(val)) return
    const next = [...arr]
    next[i] = val
    setArr(next)
    if (val && i < 3) refs.current[i + 1]?.focus()
    if (val && next.every(d => d) && onComplete) onComplete(next.join(''))
  }

  function handleRegKeyDown(refs, arr, i, e) {
    if (e.key === 'Backspace' && !arr[i] && i > 0) refs.current[i - 1]?.focus()
  }

  async function handlePhotoFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const data = await resizeImage(file)
      setRegPhoto(data)
      setRegPhotoData(data)
    } catch { /* ignore */ }
  }

  async function submitRegister() {
    setRegError('')
    const name = regName.trim()
    if (name.length < 1) return setRegError('יש להזין שם')
    const pinStr  = regPin.join('')
    const pin2Str = regPin2.join('')
    if (pinStr.length < 4) return setRegError('יש להזין קוד כניסה של 4 ספרות')
    if (pinStr !== pin2Str) return setRegError('הקודים לא תואמים')

    setRegLoading(true)
    try {
      const body = {
        name,
        pin: pinStr,
        avatar: regPhoto ? undefined : regAvatar,
        avatarBase64: regPhotoData || undefined,
      }
      const r = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await r.json()
      if (data.ok) {
        setRegSuccess(true)
        // Refresh user list
        const list = await fetch('/api/users/list').then(r => r.json()).catch(() => users)
        setUsers(list)
        setTimeout(() => {
          setRegSuccess(false)
          setStep('home')
          setRegName('')
          setRegPin(['', '', '', ''])
          setRegPin2(['', '', '', ''])
          setRegAvatar(EMOJIS[0])
          setRegPhoto(null)
          setRegPhotoData(null)
        }, 1800)
      } else {
        const msgs = {
          invalid_name: 'שם לא תקין',
          invalid_pin:  'קוד חייב להיות 4 ספרות',
          name_taken:   'השם הזה כבר תפוס',
          max_users:    'הגענו למקסימום משתמשים (20)',
        }
        setRegError(msgs[data.error] || 'שגיאה, נסה שוב')
      }
    } catch {
      setRegError('שגיאת רשת, נסה שוב')
    } finally {
      setRegLoading(false)
    }
  }

  /* ── PIN screen ─────────────────────────────────────── */
  if (step === 'pin') {
    return (
      <div className="entry-screen">
        <button className="back-link" onClick={() => setStep('home')}>← חזור</button>
        <div className="pin-avatar-wrap">
          <AvatarDisplay avatar={selected.avatar} size={80} />
          <div className="pin-hello">שלום {selected.name}!</div>
        </div>
        <div className="pin-label">הכנס קוד כניסה</div>
        <div className={`pin-inputs${pinError ? ' pin-shake' : ''}`}>
          {pin.map((d, i) => (
            <input
              key={i}
              ref={el => inputRefs.current[i] = el}
              className={`pin-digit${pinError ? ' pin-digit-error' : ''}`}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleDigit(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              disabled={loading}
            />
          ))}
        </div>
        {pinError && <div className="pin-error-msg">קוד שגוי, נסה שוב</div>}
        {loading  && <div className="pin-loading">מאמת...</div>}
      </div>
    )
  }

  /* ── Guest screen ───────────────────────────────────── */
  if (step === 'guest') {
    return (
      <div className="entry-screen">
        <button className="back-link" onClick={() => setStep('home')}>← חזור</button>
        <div className="entry-logo">C3 Kids</div>
        <p className="entry-sub">כניסה כאורח</p>
        <label className="field-label">בחר דמות</label>
        <div className="avatar-grid">
          {EMOJIS.map(em => (
            <button key={em}
              className={`avatar-btn${guestAvatar === em ? ' selected' : ''}`}
              onClick={() => setGuestAvatar(em)}
            >{em}</button>
          ))}
        </div>
        <input
          className="name-input"
          type="text"
          placeholder="שם (אופציונלי)"
          value={guestName}
          onChange={e => setGuestName(e.target.value)}
          maxLength={12}
        />
        <button className="start-btn"
          onClick={() => onStart(guestName.trim() || 'אורח', guestAvatar, null)}
        >
          בוא נשחק! 🎮
        </button>
      </div>
    )
  }

  /* ── Register screen ────────────────────────────────── */
  if (step === 'register') {
    if (regSuccess) {
      return (
        <div className="entry-screen" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#a78bfa' }}>
            ברוך הבא, {regName}!
          </div>
          <div style={{ color: '#aaa', marginTop: '0.5rem' }}>החשבון נוצר בהצלחה</div>
        </div>
      )
    }

    return (
      <div className="entry-screen">
        <button className="back-link" onClick={() => setStep('home')}>← חזור</button>
        <div className="entry-logo" style={{ fontSize: '1.5rem' }}>משתמש חדש</div>

        {/* Avatar preview & photo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', margin: '0.75rem 0' }}>
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: 80, height: 80, borderRadius: '50%',
              border: '2px dashed #a78bfa', cursor: 'pointer',
              overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(167,139,250,0.08)',
            }}
          >
            {regPhoto
              ? <img src={regPhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="preview" />
              : <span style={{ fontSize: '2.5rem' }}>{regAvatar}</span>
            }
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{ fontSize: '0.75rem', color: '#a78bfa', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            {regPhoto ? '📷 החלף תמונה' : '📷 הוסף תמונה'}
          </button>
          {regPhoto && (
            <button
              onClick={() => { setRegPhoto(null); setRegPhotoData(null) }}
              style={{ fontSize: '0.7rem', color: '#888', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              הסר תמונה
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handlePhotoFile}
          />
        </div>

        {/* Emoji picker (only if no photo) */}
        {!regPhoto && (
          <div className="avatar-grid" style={{ marginBottom: '0.5rem' }}>
            {EMOJIS.map(em => (
              <button key={em}
                className={`avatar-btn${regAvatar === em ? ' selected' : ''}`}
                onClick={() => setRegAvatar(em)}
              >{em}</button>
            ))}
          </div>
        )}

        {/* Name */}
        <input
          className="name-input"
          type="text"
          placeholder="שם"
          value={regName}
          onChange={e => setRegName(e.target.value)}
          maxLength={12}
          autoComplete="off"
        />

        {/* PIN */}
        <div className="pin-label" style={{ marginTop: '0.75rem' }}>קוד כניסה (4 ספרות)</div>
        <div className="pin-inputs">
          {regPin.map((d, i) => (
            <input
              key={i}
              ref={el => regPinRefs.current[i] = el}
              className="pin-digit"
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleRegDigit(regPinRefs, regPin, setRegPin, i, e.target.value)}
              onKeyDown={e => handleRegKeyDown(regPinRefs, regPin, i, e)}
            />
          ))}
        </div>

        <div className="pin-label" style={{ marginTop: '0.5rem' }}>אמת קוד</div>
        <div className="pin-inputs">
          {regPin2.map((d, i) => (
            <input
              key={i}
              ref={el => regPin2Refs.current[i] = el}
              className="pin-digit"
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleRegDigit(regPin2Refs, regPin2, setRegPin2, i, e.target.value)}
              onKeyDown={e => handleRegKeyDown(regPin2Refs, regPin2, i, e)}
            />
          ))}
        </div>

        {regError && <div className="pin-error-msg">{regError}</div>}

        <button
          className="start-btn"
          onClick={submitRegister}
          disabled={regLoading}
          style={{ marginTop: '1rem' }}
        >
          {regLoading ? 'יוצר חשבון...' : 'צור חשבון ✨'}
        </button>
      </div>
    )
  }

  /* ── Home screen ────────────────────────────────────── */
  return (
    <div className="entry-screen">
      <div className="entry-logo">C3 Kids</div>
      <p className="entry-sub">לומדים ומשחקים 🎮</p>

      {loadingUsers ? (
        <div style={{ color: '#aaa', margin: '1rem 0' }}>טוען...</div>
      ) : (
        <>
          <div className="login-section-label">בחר משתמש</div>
          <div className="family-login-row" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
            {users.map(u => (
              <button key={u.userId} className="family-login-btn" onClick={() => openPin(u)}>
                <AvatarDisplay avatar={u.avatar} size={64} />
                <span className="family-login-name">{u.name}</span>
              </button>
            ))}
          </div>
        </>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="guest-btn" onClick={() => setStep('register')}>
          ➕ משתמש חדש
        </button>
        <button className="guest-btn" onClick={() => setStep('guest')}>
          👤 כניסה כאורח
        </button>
      </div>
    </div>
  )
}
