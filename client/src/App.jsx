import { useState } from 'react'
import NameEntry        from './pages/NameEntry.jsx'
import SubjectMap       from './pages/SubjectMap.jsx'
import EnglishMap       from './pages/EnglishMap.jsx'
import Game             from './pages/Game.jsx'
import EnglishGame      from './pages/EnglishGame.jsx'
import NumbersGame      from './pages/NumbersGame.jsx'
import PrepositionsGame from './pages/PrepositionsGame.jsx'
import GameOver         from './pages/GameOver.jsx'

export default function App() {
  const [screen,    setScreen]   = useState('entry')
  const [player,    setPlayer]   = useState({ name: '', avatar: 'photo:OFEK' })
  const [subject,   setSubject]  = useState('math')
  const [engGame,   setEngGame]  = useState('vocab')
  const [result,    setResult]   = useState({ score: 0, total: 25, won: false })
  const [gameName,  setGameName] = useState('')

  const GAME_NAMES = {
    math:         'לוח כפל 🔢',
    vocab:        'מילים ותמונות 🖼️',
    numbers:      'מספרים 🔢',
    prepositions: 'מיקום 📍',
  }

  function handleStart(name, avatar) {
    setPlayer({ name, avatar })
    setScreen('map')
  }

  function handleSubjectSelect(subj) {
    setSubject(subj)
    if (subj === 'english') setScreen('english-map')
    else { setGameName(GAME_NAMES.math); setScreen('game') }
  }

  function handleEngGameSelect(game) {
    setEngGame(game)
    setGameName(GAME_NAMES[game] ?? game)
    setScreen('game')
  }

  function handleGameOver(score, total, won) {
    setResult({ score, total, won })
    setScreen('gameover')
  }

  function handleMap() {
    if (subject === 'english') setScreen('english-map')
    else setScreen('map')
  }

  return (
    <div className="app">
      {screen === 'entry' && (
        <NameEntry onStart={handleStart} />
      )}
      {screen === 'map' && (
        <SubjectMap player={player} onSelect={handleSubjectSelect} />
      )}
      {screen === 'english-map' && (
        <EnglishMap
          player={player}
          onSelect={handleEngGameSelect}
          onBack={() => setScreen('map')}
        />
      )}
      {screen === 'game' && subject === 'math' && (
        <Game key={`math-${Date.now()}`} player={player} onGameOver={handleGameOver} />
      )}
      {screen === 'game' && subject === 'english' && engGame === 'vocab' && (
        <EnglishGame key={`vocab-${Date.now()}`} player={player} onGameOver={handleGameOver} />
      )}
      {screen === 'game' && subject === 'english' && engGame === 'numbers' && (
        <NumbersGame key={`num-${Date.now()}`} player={player} onGameOver={handleGameOver} />
      )}
      {screen === 'game' && subject === 'english' && engGame === 'prepositions' && (
        <PrepositionsGame key={`prep-${Date.now()}`} player={player} onGameOver={handleGameOver} />
      )}
      {screen === 'gameover' && (
        <GameOver
          player={player}
          score={result.score}
          total={result.total}
          won={result.won}
          gameName={gameName}
          onRestart={() => setScreen('game')}
          onMap={handleMap}
          onHome={() => setScreen('entry')}
        />
      )}
    </div>
  )
}
