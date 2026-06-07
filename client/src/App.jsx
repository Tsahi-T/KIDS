import { useState } from 'react'
import NameEntry   from './pages/NameEntry.jsx'
import SubjectMap  from './pages/SubjectMap.jsx'
import Game        from './pages/Game.jsx'
import GameOver    from './pages/GameOver.jsx'

export default function App() {
  const [screen,  setScreen]  = useState('entry')
  const [player,  setPlayer]  = useState({ name: '', avatar: 'photo:OFEK' })
  const [subject, setSubject] = useState('math')
  const [result,  setResult]  = useState({ score: 0, total: 10, won: false })

  function handleStart(name, avatar) {
    setPlayer({ name, avatar })
    setScreen('map')
  }

  function handleSelect(subj) {
    setSubject(subj)
    setScreen('game')
  }

  function handleGameOver(score, total, won) {
    setResult({ score, total, won })
    setScreen('gameover')
  }

  return (
    <div className="app">
      {screen === 'entry' && (
        <NameEntry onStart={handleStart} />
      )}
      {screen === 'map' && (
        <SubjectMap player={player} onSelect={handleSelect} />
      )}
      {screen === 'game' && (
        <Game key={`${subject}-${Date.now()}`} player={player} subject={subject} onGameOver={handleGameOver} />
      )}
      {screen === 'gameover' && (
        <GameOver
          player={player}
          score={result.score}
          total={result.total}
          won={result.won}
          onRestart={() => setScreen('game')}
          onMap={() => setScreen('map')}
          onHome={() => setScreen('entry')}
        />
      )}
    </div>
  )
}
