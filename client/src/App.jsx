import { useState } from 'react'
import NameEntry        from './pages/NameEntry.jsx'
import SubjectMap       from './pages/SubjectMap.jsx'
import EnglishMap       from './pages/EnglishMap.jsx'
import GeneralMap       from './pages/GeneralMap.jsx'
import Game             from './pages/Game.jsx'
import EnglishGame      from './pages/EnglishGame.jsx'
import NumbersGame      from './pages/NumbersGame.jsx'
import PrepositionsGame from './pages/PrepositionsGame.jsx'
import MonthsGame       from './pages/MonthsGame.jsx'
import FlagsGame        from './pages/FlagsGame.jsx'
import GameOver         from './pages/GameOver.jsx'

const GAME_NAMES = {
  math:         'לוח כפל 🔢',
  vocab:        'מילים ותמונות 🖼️',
  numbers:      'מספרים 🔢',
  prepositions: 'מיקום 📍',
  months:       'חודשי השנה 📅',
  flags:        'דגלי מדינות 🌍',
}

export default function App() {
  const [screen,   setScreen]   = useState('entry')
  const [player,   setPlayer]   = useState({ name: '', avatar: 'photo:OFEK' })
  const [subject,  setSubject]  = useState('math')
  const [subGame,  setSubGame]  = useState('vocab')
  const [gameName, setGameName] = useState('')
  const [result,   setResult]   = useState({ score: 0, total: 25, won: false })

  function handleStart(name, avatar) {
    setPlayer({ name, avatar })
    setScreen('map')
  }

  function handleSubjectSelect(subj) {
    setSubject(subj)
    if (subj === 'english') setScreen('english-map')
    else if (subj === 'general') setScreen('general-map')
    else { setGameName(GAME_NAMES.math); setScreen('game') }
  }

  function handleSubGameSelect(game) {
    setSubGame(game)
    setGameName(GAME_NAMES[game] ?? game)
    setScreen('game')
  }

  function handleGameOver(score, total, won) {
    setResult({ score, total, won })
    setScreen('gameover')
  }

  function handleMap() {
    if (subject === 'english') setScreen('english-map')
    else if (subject === 'general') setScreen('general-map')
    else setScreen('map')
  }

  return (
    <div className="app">
      {screen === 'entry' && <NameEntry onStart={handleStart} />}

      {screen === 'map' && <SubjectMap player={player} onSelect={handleSubjectSelect} />}

      {screen === 'english-map' && (
        <EnglishMap player={player} onSelect={handleSubGameSelect} onBack={() => setScreen('map')} />
      )}
      {screen === 'general-map' && (
        <GeneralMap player={player} onSelect={handleSubGameSelect} onBack={() => setScreen('map')} />
      )}

      {screen === 'game' && subject === 'math' && (
        <Game key={`math-${Date.now()}`} player={player} onGameOver={handleGameOver} />
      )}
      {screen === 'game' && subject === 'english' && subGame === 'vocab' && (
        <EnglishGame key={`vocab-${Date.now()}`} player={player} onGameOver={handleGameOver} />
      )}
      {screen === 'game' && subject === 'english' && subGame === 'numbers' && (
        <NumbersGame key={`num-${Date.now()}`} player={player} onGameOver={handleGameOver} />
      )}
      {screen === 'game' && subject === 'english' && subGame === 'prepositions' && (
        <PrepositionsGame key={`prep-${Date.now()}`} player={player} onGameOver={handleGameOver} />
      )}
      {screen === 'game' && subject === 'general' && subGame === 'months' && (
        <MonthsGame key={`months-${Date.now()}`} player={player} onGameOver={handleGameOver} />
      )}
      {screen === 'game' && subject === 'general' && subGame === 'flags' && (
        <FlagsGame key={`flags-${Date.now()}`} player={player} onGameOver={handleGameOver} />
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
