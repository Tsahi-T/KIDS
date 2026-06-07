import { useEffect, useState } from 'react'
import AvatarDisplay, { isPhoto, photoName } from '../components/AvatarDisplay.jsx'
import { getCoins, addCoins, calcCoins } from '../utils/coins.js'

export default function GameOver({ player, score, total, won, gameName, onRestart, onMap, onHome }) {
  const stars    = score >= total ? 3 : score >= Math.ceil(total * 0.7) ? 2 : score >= Math.ceil(total * 0.4) ? 1 : 0
  const starStr  = '⭐'.repeat(stars) + '☆'.repeat(3 - stars)
  const earned   = calcCoins(score, stars)

  const [totalCoins, setTotalCoins] = useState(0)
  const [animate,    setAnimate]    = useState(false)

  useEffect(() => {
    const newTotal = addCoins(earned)
    setTotalCoins(newTotal)
    setTimeout(() => setAnimate(true), 400)
  }, [])

  function shareWhatsApp() {
    const msg =
      `🎮 *${player.name}* שיחק ב-*${gameName}*!\n\n` +
      `${starStr}\n` +
      `✅ *${score}/${total}* תשובות נכונות\n` +
      `🪙 *+${earned}* מטבעות הוספו\n` +
      `🏦 סה"כ אוסף: *${totalCoins}* מטבעות\n\n` +
      `בוא תנסה גם! 👇\nhttps://kids-bg5f.vercel.app`

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className="gameover-screen">
      <div className="gameover-avatar">
        {isPhoto(player.avatar)
          ? <img src={`/avatars/${photoName(player.avatar)}.png`} alt={player.name} className="gameover-photo" />
          : player.avatar
        }
      </div>
      <h1>{won ? '🎉 כל הכבוד!' : '💪 נסה שוב!'}</h1>
      <p className="gameover-name">{player.name}</p>
      {gameName && <p className="gameover-game-name">{gameName}</p>}

      <div className="stars-row">{starStr}</div>
      <div className="score-display">{score}<span className="score-total">/{total}</span></div>
      <div className="score-label">תשובות נכונות</div>

      <div className={`coins-earned${animate ? ' coins-pop' : ''}`}>
        <span className="coin-icon">🪙</span>
        <span className="coins-earned-num">+{earned}</span>
        <span className="coins-earned-label">מטבעות!</span>
      </div>

      <div className="coins-total-row">
        <span className="coins-total-label">סה"כ אוסף:</span>
        <span className="coins-total-num">🪙 {totalCoins}</span>
      </div>

      <div className="btn-row">
        <button className="btn-secondary" onClick={onMap}>🗺️ מפה</button>
        <button className="start-btn" onClick={onRestart}>🔄 שוב!</button>
      </div>

      <button className="btn-whatsapp" onClick={shareWhatsApp}>
        <span>📤 שתף בוואטסאפ</span>
      </button>

      <button className="btn-home-small" onClick={onHome}>🏠 החלף שחקן</button>
    </div>
  )
}
