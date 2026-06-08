import { useState, useRef } from 'react'
import NameEntry        from './pages/NameEntry.jsx'
import SubjectMap       from './pages/SubjectMap.jsx'
import MathMap          from './pages/MathMap.jsx'
import EnglishMap       from './pages/EnglishMap.jsx'
import HebrewMap        from './pages/HebrewMap.jsx'
import GeneralMap       from './pages/GeneralMap.jsx'
import Game             from './pages/Game.jsx'
import EnglishGame      from './pages/EnglishGame.jsx'
import NumbersGame      from './pages/NumbersGame.jsx'
import PrepositionsGame from './pages/PrepositionsGame.jsx'
import ColorsGame       from './pages/ColorsGame.jsx'
import FlashGame        from './pages/FlashGame.jsx'
import ReadingGame      from './pages/ReadingGame.jsx'
import MonthsGame       from './pages/MonthsGame.jsx'
import FlagsGame        from './pages/FlagsGame.jsx'
import GameOver         from './pages/GameOver.jsx'
import Dashboard        from './pages/Dashboard.jsx'
import Leaderboard      from './pages/Leaderboard.jsx'
import { getCoins, setCoins } from './utils/coins.js'

// All playable games: { subject, subGame? }
const ALL_GAMES = [
  { subject: 'math'                              },
  { subject: 'english', subGame: 'vocab'         },
  { subject: 'english', subGame: 'numbers'       },
  { subject: 'english', subGame: 'prepositions'  },
  { subject: 'english', subGame: 'colors'        },
  { subject: 'hebrew',  subGame: 'flash'         },
  { subject: 'hebrew',  subGame: 'reading'       },
  { subject: 'general', subGame: 'months'        },
  { subject: 'general', subGame: 'flags'         },
]

const GAME_NAMES = {
  math:         'לוח כפל 🔢',
  vocab:        'מילים ותמונות 🖼️',
  numbers:      'מספרים 🔢',
  prepositions: 'מיקום 📍',
  months:       'חודשי השנה 📅',
  flags:        'דגלי מדינות 🌍',
  colors:       'צבעים 🎨',
  flash:        'הבזק מילים ⚡',
  reading:      'קרא ובחר 🖼️',
}

export default function App() {
  const [screen,          setScreen]          = useState('entry')
  const [player,          setPlayer]          = useState({ name: '', avatar: 'photo:OFEK' })
  const [userProfile,     setUserProfile]     = useState(null)
  const [subject,         setSubject]         = useState('math')
  const [subGame,         setSubGame]         = useState('vocab')
  const [gameName,        setGameName]        = useState('')
  const [result,          setResult]          = useState({ score: 0, total: 25, won: false })
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const coinsBeforeRef                        = useRef(0)
  const gameIdRef                             = useRef('math')

  function handleStart(name, avatar, profile) {
    setPlayer({ name, avatar })
    setUserProfile(profile)
    if (profile) setCoins(Math.max(getCoins(), profile.coins ?? 0))
    setScreen('map')
  }

  function launchGame(subj, sg) {
    setSubject(subj)
    const id = sg ?? 'math'
    gameIdRef.current      = id
    coinsBeforeRef.current = getCoins()
    if (sg) setSubGame(sg)
    setGameName(GAME_NAMES[id] ?? id)
    setShowExitConfirm(false)
    setScreen('game')
  }

  function handleRandomGame() {
    const pick = ALL_GAMES[Math.floor(Math.random() * ALL_GAMES.length)]
    launchGame(pick.subject, pick.subGame)
  }

  function handleSubjectSelect(subj) {
    setSubject(subj)
    if      (subj === 'english') setScreen('english-map')
    else if (subj === 'hebrew')  setScreen('hebrew-map')
    else if (subj === 'general') setScreen('general-map')
    else                         setScreen('math-map')
  }

  function handleSubGameSelect(game) {
    launchGame(subject, game)
  }

  async function handleGameOver(score, total, won) {
    const coinDelta = Math.max(0, getCoins() - coinsBeforeRef.current)
    setShowExitConfirm(false)
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
    if      (subject === 'english') setScreen('english-map')
    else if (subject === 'hebrew')  setScreen('hebrew-map')
    else if (subject === 'general') setScreen('general-map')
    else                            setScreen('math-map')
  }

  function confirmExit() {
    setShowExitConfirm(false)
    handleMap()
  }

  return (
    <div className="app">
      {screen === 'entry' && <NameEntry onStart={handleStart} />}

      {screen === 'map' && (
        <SubjectMap
          player={player}
          userProfile={userProfile}
          onSelect={handleSubjectSelect}
          onRandom={handleRandomGame}
          onDashboard={() => setScreen('dashboard')}
          onLeaderboard={() => setScreen('leaderboard')}
          onHome={() => setScreen('entry')}
        />
      )}

      {screen === 'math-map'    && <MathMap    player={player} onSelect={g => launchGame('math',    g)} onBack={() => setScreen('map')} />}
      {screen === 'english-map' && <EnglishMap player={player} onSelect={g => launchGame('english', g)} onBack={() => setScreen('map')} />}
      {screen === 'hebrew-map'  && <HebrewMap  player={player} onSelect={g => launchGame('hebrew',  g)} onBack={() => setScreen('map')} />}
      {screen === 'general-map' && <GeneralMap player={player} onSelect={g => launchGame('general', g)} onBack={() => setScreen('map')} />}

      {screen === 'game' && subject === 'math'    && <Game             key={`math-${Date.now()}`}    player={player} onGameOver={handleGameOver} />}
      {screen === 'game' && subject === 'english' && subGame === 'vocab'        && <EnglishGame      key={`vocab-${Date.now()}`}   player={player} onGameOver={handleGameOver} />}
      {screen === 'game' && subject === 'english' && subGame === 'numbers'      && <NumbersGame      key={`num-${Date.now()}`}     player={player} onGameOver={handleGameOver} />}
      {screen === 'game' && subject === 'english' && subGame === 'prepositions' && <PrepositionsGame key={`prep-${Date.now()}`}    player={player} onGameOver={handleGameOver} />}
      {screen === 'game' && subject === 'english' && subGame === 'colors'       && <ColorsGame       key={`colors-${Date.now()}`}  player={player} onGameOver={handleGameOver} />}
      {screen === 'game' && subject === 'hebrew'  && subGame === 'flash'        && <FlashGame        key={`flash-${Date.now()}`}   player={player} onGameOver={handleGameOver} />}
      {screen === 'game' && subject === 'hebrew'  && subGame === 'reading'      && <ReadingGame      key={`reading-${Date.now()}`} player={player} onGameOver={handleGameOver} />}
      {screen === 'game' && subject === 'general' && subGame === 'months'       && <MonthsGame       key={`months-${Date.now()}`}  player={player} onGameOver={handleGameOver} />}
      {screen === 'game' && subject === 'general' && subGame === 'flags'        && <FlagsGame        key={`flags-${Date.now()}`}   player={player} onGameOver={handleGameOver} />}

      {/* in-game exit */}
      {screen === 'game' && (
        <button className="game-exit-btn" onClick={() => setShowExitConfirm(true)}>✕</button>
      )}

      {/* exit confirmation modal */}
      {showExitConfirm && (
        <div className="exit-overlay" onClick={() => setShowExitConfirm(false)}>
          <div className="exit-card" onClick={e => e.stopPropagation()}>
            <div className="exit-icon">🚪</div>
            <div className="exit-title">לצאת מהמשחק?</div>
            <div className="exit-sub">ההתקדמות במשחק תאבד</div>
            <div className="exit-btns">
              <button className="exit-btn-no"  onClick={() => setShowExitConfirm(false)}>המשך לשחק</button>
              <button className="exit-btn-yes" onClick={confirmExit}>כן, צא</button>
            </div>
          </div>
        </div>
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
        <Dashboard player={player} userProfile={userProfile} onBack={() => setScreen('map')} onLeaderboard={() => setScreen('leaderboard')} />
      )}
      {screen === 'leaderboard' && (
        <Leaderboard player={player} userProfile={userProfile} onBack={() => setScreen('map')} />
      )}
    </div>
  )
}
