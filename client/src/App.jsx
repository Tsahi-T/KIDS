import { useState } from 'react'
import NameEntry from './pages/NameEntry.jsx'
import Game from './pages/Game.jsx'
import GameOver from './pages/GameOver.jsx'

export default function App() {
  const [screen, setScreen] = useState('entry')
  const [player, setPlayer] = useState({ name: '', avatar: '🦊' })
  const [result, setResult] = useState({ score: 0, total: 10, won: false })

  function handleStart(name, avatar) {
    setPlayer({ name, avatar })
    setScreen('game')
  }

  function handleGameOver(score, total, won) {
    setResult({ score, total, won })
    setScreen('gameover')
  }

  return (
    <div className="app">
      {screen === 'entry' && <NameEntry onStart={handleStart} />}
      {screen === 'game' && (
        <Game key={Date.now()} player={player} onGameOver={handleGameOver} />
      )}
      {screen === 'gameover' && (
        <GameOver
          player={player}
          score={result.score}
          total={result.total}
          won={result.won}
          onRestart={() => setScreen('game')}
          onHome={() => setScreen('entry')}
        />
      )}
    </div>
  )
}
