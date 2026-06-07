import AvatarDisplay, { isPhoto, photoName } from '../components/AvatarDisplay.jsx'

export default function GameOver({ player, score, total, won, onRestart, onHome }) {
  const stars  = score >= total ? 3 : score >= Math.ceil(total * 0.7) ? 2 : score >= Math.ceil(total * 0.4) ? 1 : 0
  const starStr = '⭐'.repeat(stars) + '☆'.repeat(3 - stars)

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

      <div className="stars-row">{starStr}</div>
      <div className="score-display">{score}<span className="score-total">/{total}</span></div>
      <div className="score-label">תשובות נכונות</div>

      <div className="btn-row">
        <button className="btn-secondary" onClick={onHome}>🏠 בית</button>
        <button className="start-btn" onClick={onRestart}>🔄 שוב!</button>
      </div>
    </div>
  )
}
