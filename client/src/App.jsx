import { useState, useRef } from 'react'
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
import Dashboard        from './pages/Dashboard.jsx'
import Leaderboard      from './pages/Leaderboard.jsx'
import { getCoins, setCoins } from './utils/coins.js'

const GAME_NAMES = {
  math:         'לוח כפל 🔢',
  vocab:        'מילים ותמונות 🖼️',
  numbers:      'מספרים 🔢',
  prepositions: 'מיקום 📍',
  months:       'חודשי השנה 📅',
  flags:        'דגלי מדינות 🌍',
}

export default function App() {
  const [screen,      setScreen]      = useState('entry')
  const [player,      setPlayer]      = useState({ name: '', avatar: 'photo:OFEK' })
  const [userProfile, setUserProfile] = useState(null) // null = guest
  const [subject,     setSubject]     = useState('math')
  const [subGame,     setSubGame]     = useState('vocab')
  const [gameName,    setGameName]    = useState('')
  const [result,      setResult]      = useState({ score: 0, total: 25, won: false })
  const coinsBeforeRef                = useRef(0)
  const gameIdRef                     = useRef('math')

  function handleStart(name, avatar, profile) {
    setPlayer({ name, avatar })
    setUserProfile(profile)
    if (profile) setCoins(profile.coins ?? 0)
    setScreen('map')
  }

  function handleSubjectSelect(subj) {
    setSubject(subj)
    if (subj === 'english') setScreen('english-map')
    else if (subj === 'general') setScreen('general-map')
    else {
      gameIdRef.current     = 'math'
      coinsBeforeRef.current = getCoins()
      setGameName(GAME_NAMES.math)
      setScreen('game')
    }
  }

  function handleSubGameSelect(game) {
    gameIdRef.current      = game
    coinsBeforeRef.current = getCoins()
    setSubGame(game)
    setGameName(GAME_NAMES[game] ?? game)
    setScreen('game')
  }

  async function handleGameOver(score, total, won) {
    const coinDelta = Math.max(0, getCoins() - coinsBeforeRef.current)
    setResult({ score, total, won })
    setScreen('gameover')

    if (userProfile?.userId) {
      try {
        await fetch(`/api/stats?user=${userProfile.userId}`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ game: gameIdRef.current, score, total, coinDelta }),
        })
      } catch { /* non-critical */ }
    }
  }

  function handleMap() {
    if (subject === 'english') setScreen('english-map')
    else if (subject === 'general') setScreen('general-map')
    else setScreen('map')
  }

  return (
    <div className="app">
      {screen === 'entry' && <NameEntry onStart={handleStart} />}

      {screen === 'map' && (
        <SubjectMap
          player={player}
          userProfile={userProfile}
          onSelect={handleSubjectSelect}
          onDashboard={() => setScreen('dashboard')}
          onLeaderboard={() => setScreen('leaderboard')}
        />
      )}

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
          onRestart={() => { coinsBeforeRef.current = getCoins(); setScreen('game') }}
          onMap={handleMap}
          onHome={() => setScreen('entry')}
          onLeaderboard={() => setScreen('leaderboard')}
          isAuthenticated={!!userProfile}
        />
      )}

      {screen === 'dashboard' && (
        <Dashboard
          player={player}
          userProfile={userProfile}
          onBack={() => setScreen('map')}
          onLeaderboard={() => setScreen('leaderboard')}
        />
      )}

      {screen === 'leaderboard' && (
        <Leaderboard
          player={player}
          userProfile={userProfile}
          onBack={() => setScreen('map')}
        />
      )}
    </div>
  )
}
