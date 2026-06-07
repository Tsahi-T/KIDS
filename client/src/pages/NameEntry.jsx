import { useState, useRef } from 'react'
import AvatarDisplay from '../components/AvatarDisplay.jsx'

const FAMILY = [
  { id: 'ofek',  avatar: 'photo:OFEK',  label: 'אופק' },
  { id: 'ori',   avatar: 'photo:ORI',   label: 'אורי' },
  { id: 'tsahy', avatar: 'photo:TSAHY', label: 'צאהי' },
]

const EMOJIS = ['🦊', '🐸', '🐼', '🦁', '🐯', '🦄', '🐲', '🚀', '🐙', '🦋', '🐬', '🦖']

export default function NameEntry({ onStart }) {
  const [step, setStep]               = useState('home')
  const [selected, setSelected]       = useState(null)
  const [pin, setPin]                 = useState(['', '', '', ''])
  const [pinError, setPinError]       = useState(false)
  const [loading, setLoading]         = useState(false)
  const [guestName, setGuestName]     = useState('')
  const [guestAvatar, setGuestAvatar] = useState(EMOJIS[0])
  const inputRefs                     = useRef([])

  function openPin(member) {
    setSelected(member)
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
    if (e.key === 'Backspace' && !pin[i] && i > 0) {
      inputRefs.current[i - 1]?.focus()
    }
  }

  async function submitPin(code) {
    setLoading(true)
    try {
      const r = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: selected.id, pin: code }),
      })
      const data = await r.json()
      if (data.ok) {
        onStart(selected.label, selected.avatar, data.profile)
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

  /* ── PIN screen ─────────────────────────────────────── */
  if (step === 'pin') {
    return (
      <div className="entry-screen">
        <button className="back-link" onClick={() => setStep('home')}>← חזור</button>
        <div className="pin-avatar-wrap">
          <AvatarDisplay avatar={selected.avatar} size={80} />
          <div className="pin-hello">שלום {selected.label}!</div>
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
        {pinError  && <div className="pin-error-msg">קוד שגוי, נסה שוב</div>}
        {loading   && <div className="pin-loading">מאמת...</div>}
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

  /* ── Home screen ────────────────────────────────────── */
  return (
    <div className="entry-screen">
      <div className="entry-logo">C3 Kids</div>
      <p className="entry-sub">לומדים ומשחקים 🎮</p>

      <div className="login-section-label">המשפחה שלי</div>
      <div className="family-login-row">
        {FAMILY.map(f => (
          <button key={f.id} className="family-login-btn" onClick={() => openPin(f)}>
            <AvatarDisplay avatar={f.avatar} size={64} />
            <span className="family-login-name">{f.label}</span>
          </button>
        ))}
      </div>

      <button className="guest-btn" onClick={() => setStep('guest')}>
        👤 כניסה כאורח
      </button>
    </div>
  )
}
