import { useEffect, useRef, useState, useCallback } from 'react'
import QuestionModal from '../components/QuestionModal.jsx'
import AvatarDisplay, { isPhoto, photoName } from '../components/AvatarDisplay.jsx'
import { generateQuestion } from '../utils/questions.js'
import { addCoins, calcCoins } from '../utils/coins.js'

const PHOTO_NAMES = ['OFEK', 'ORI', 'TSAHY']

// ─── constants ────────────────────────────────────────────────────────────────
const W = 600, H = 320
const GROUND_Y   = 255
const CHAR_X     = 110
const GRAVITY    = 0.45
const JUMP_VY    = -15
const BASE_SPEED = 3.4          // slightly faster overall
const OBS_W      = 32
const MAX_OBS    = 25
const Q_DIST     = 100
const WARN_DIST  = 210
const GAP_MIN    = 130          // minimum px between obstacles
const GAP_RANGE  = 160          // random extra px (total: 130–290)

// ─── helpers ──────────────────────────────────────────────────────────────────
function makeObstacle() {
  return { x: W + 60, h: 80 + Math.floor(Math.random() * 50), question: generateQuestion(), asked: false }
}
function makeCloud(x) {
  return { x, y: 25 + Math.random() * 80, r: 28 + Math.random() * 26, speed: 0.2 + Math.random() * 0.3 }
}

// ─── canvas helpers ───────────────────────────────────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y,     x + w, y + r,     r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x,     y + h, x,     y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x,     y,     x + r, y,         r)
  ctx.closePath()
}

// ─── draw functions ───────────────────────────────────────────────────────────
function drawSky(ctx) {
  const g = ctx.createLinearGradient(0, 0, 0, GROUND_Y)
  g.addColorStop(0, '#3A9DD1'); g.addColorStop(1, '#B0DFF5')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, GROUND_Y)
}

function drawGround(ctx) {
  ctx.fillStyle = '#52A843'
  ctx.fillRect(0, GROUND_Y, W, 20)
  ctx.fillStyle = '#7D5230'
  ctx.fillRect(0, GROUND_Y + 20, W, H - GROUND_Y - 20)
  ctx.fillStyle = '#3E8A34'
  for (let x = 4; x < W; x += 24) {
    ctx.fillRect(x, GROUND_Y - 5, 4, 9)
    ctx.fillRect(x + 11, GROUND_Y - 7, 4, 11)
  }
}

function drawCloud(ctx, cl) {
  ctx.fillStyle = 'rgba(255,255,255,0.88)'
  ctx.beginPath()
  ctx.arc(cl.x, cl.y, cl.r, 0, Math.PI * 2)
  ctx.arc(cl.x + cl.r * .9, cl.y + 5, cl.r * .65, 0, Math.PI * 2)
  ctx.arc(cl.x - cl.r * .75, cl.y + 6, cl.r * .6, 0, Math.PI * 2)
  ctx.fill()
}

function drawObstacle(ctx, obs, warn) {
  const top = GROUND_Y - obs.h
  if (warn) {
    ctx.fillStyle = 'rgba(255,215,0,.15)'
    ctx.fillRect(obs.x - 12, top - 12, OBS_W + 24, obs.h + 12)
  }
  const g = ctx.createLinearGradient(obs.x, 0, obs.x + OBS_W, 0)
  g.addColorStop(0, '#607D8B'); g.addColorStop(.35, '#90A4AE'); g.addColorStop(1, '#455A64')
  ctx.fillStyle = g
  ctx.fillRect(obs.x, top + 16, OBS_W, obs.h - 32)
  ctx.fillStyle = '#78909C'
  ctx.fillRect(obs.x - 7, top,       OBS_W + 14, 18)  // capital
  ctx.fillRect(obs.x - 7, GROUND_Y - 18, OBS_W + 14, 18)  // base
  ctx.fillStyle = 'rgba(255,255,255,.2)'
  ctx.fillRect(obs.x + 5, top + 22, 7, obs.h - 50)
  if (warn) {
    ctx.font = 'bold 20px sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
    ctx.fillText('❓', obs.x + OBS_W / 2, top - 6)
  }
}

function drawCharacter(ctx, char, avatar, frame, frozen, photos) {
  const x  = char.x
  const fy = char.y

  // dynamic shadow
  const shadowScaleX = char.onGround ? 1 : Math.max(.35, 1 - (GROUND_Y - fy) / 180)
  ctx.fillStyle = 'rgba(0,0,0,.2)'
  ctx.beginPath()
  ctx.ellipse(x, GROUND_Y + 6, 24 * shadowScaleX, 6 * shadowScaleX, 0, 0, Math.PI * 2)
  ctx.fill()

  const swing = frozen ? 0 : Math.sin(frame * .30) * 13

  // ── legs ──────────────────────────────────────────────────────────────────
  ctx.lineWidth = 8; ctx.lineCap = 'round'

  // pants (dark blue)
  ctx.strokeStyle = '#1A237E'
  ctx.beginPath(); ctx.moveTo(x - 4, fy - 20); ctx.lineTo(x - 13 + swing, fy - 2); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x + 4, fy - 20); ctx.lineTo(x + 13 - swing, fy - 2); ctx.stroke()

  // shoes
  ctx.fillStyle = '#E53935'
  ctx.beginPath(); ctx.ellipse(x - 13 + swing, fy + 2, 10, 5, 0, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(x + 13 - swing, fy + 2, 10, 5, 0, 0, Math.PI * 2); ctx.fill()
  // shoe toe highlight
  ctx.fillStyle = 'rgba(255,255,255,.35)'
  ctx.beginPath(); ctx.ellipse(x - 15 + swing, fy, 4, 2.5, -0.3, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(x + 11 - swing, fy, 4, 2.5, 0.3, 0, Math.PI * 2); ctx.fill()

  // ── body ──────────────────────────────────────────────────────────────────
  // shirt (gradient blue)
  const bg = ctx.createLinearGradient(x - 17, fy - 52, x + 17, fy - 16)
  bg.addColorStop(0, '#42A5F5'); bg.addColorStop(1, '#1565C0')
  ctx.fillStyle = bg
  roundRect(ctx, x - 17, fy - 52, 34, 34, 9); ctx.fill()

  // shirt collar
  ctx.fillStyle = 'white'
  ctx.beginPath(); ctx.arc(x, fy - 50, 5, 0, Math.PI * 2); ctx.fill()

  // shirt pocket
  ctx.fillStyle = 'rgba(255,255,255,.25)'
  roundRect(ctx, x + 4, fy - 44, 9, 9, 3); ctx.fill()

  // ── arms ──────────────────────────────────────────────────────────────────
  const armSwing = frozen ? 0 : Math.sin(frame * .30 + Math.PI) * 14
  ctx.lineWidth = 7; ctx.lineCap = 'round'
  ctx.strokeStyle = '#1565C0'
  ctx.beginPath(); ctx.moveTo(x - 17, fy - 44); ctx.lineTo(x - 28, fy - 32 + armSwing); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x + 17, fy - 44); ctx.lineTo(x + 28, fy - 32 - armSwing); ctx.stroke()
  // hands
  ctx.fillStyle = '#FFCC80'
  ctx.beginPath(); ctx.arc(x - 28, fy - 32 + armSwing, 5, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(x + 28, fy - 32 - armSwing, 5, 0, Math.PI * 2); ctx.fill()

  // ── head ───────────────────────────────────────────────────────────────────
  const headR  = 30                  // larger head for better visibility
  const headCY = fy - 52 - headR + 4 // sits on top of body with slight overlap

  if (isPhoto(avatar) && photos) {
    const img = photos[photoName(avatar)]
    if (img && img.complete && img.naturalWidth > 0) {
      const iw = img.naturalWidth
      const ih = img.naturalHeight
      // Draw only the inner 80% of the processed image (skip background corners)
      const margin = iw * 0.1
      const sw = iw - margin * 2
      const sh = sw
      const sx = margin
      const sy = margin * 0.6          // face is slightly higher in portrait shots
      ctx.save()
      ctx.beginPath()
      ctx.arc(x, headCY, headR, 0, Math.PI * 2)
      ctx.clip()
      ctx.drawImage(img, sx, sy, sw, sh, x - headR, headCY - headR, headR * 2, headR * 2)
      ctx.restore()
      // white ring
      ctx.strokeStyle = 'rgba(255,255,255,0.9)'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.arc(x, headCY, headR, 0, Math.PI * 2)
      ctx.stroke()
    }
  } else {
    ctx.font = '52px serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(avatar, x, headCY)
  }
}

function drawHUD(ctx, lives, score, coins) {
  // score pill (left)
  ctx.fillStyle = 'rgba(0,0,0,.42)'
  roundRect(ctx, 10, 8, 90, 36, 9); ctx.fill()
  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px Heebo, Arial, sans-serif'
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle'
  ctx.fillText(`✓ ${score}`, 94, 26)

  // coin pill (center)
  ctx.fillStyle = 'rgba(0,0,0,.42)'
  roundRect(ctx, W / 2 - 52, 8, 104, 36, 9); ctx.fill()
  ctx.fillStyle = '#FFD700'
  ctx.font = 'bold 18px Heebo, Arial, sans-serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(`🪙 ${coins}`, W / 2, 26)

  // hearts (right)
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < lives ? '#E53935' : 'rgba(255,255,255,.2)'
    const hx = W - 22 - i * 33, hy = 26, r = 10
    ctx.beginPath()
    ctx.moveTo(hx, hy + r * .7)
    ctx.bezierCurveTo(hx, hy + r * .2, hx - r, hy - r * .3, hx - r, hy - r * .4)
    ctx.bezierCurveTo(hx - r, hy - r * 1.1, hx, hy - r * .9, hx, hy - r * .4)
    ctx.bezierCurveTo(hx, hy - r * .9, hx + r, hy - r * 1.1, hx + r, hy - r * .4)
    ctx.bezierCurveTo(hx + r, hy - r * .3, hx, hy + r * .2, hx, hy + r * .7)
    ctx.fill()
  }
}

// ─── component ────────────────────────────────────────────────────────────────
export default function Game({ player, onGameOver }) {
  const canvasRef = useRef(null)
  const stateRef  = useRef(null)
  const rafRef    = useRef(null)

  const photosRef = useRef({})

  const [showQ,          setShowQ]          = useState(false)
  const [question,       setQuestion]       = useState(null)
  const [answerDisabled, setAnswerDisabled] = useState(false)
  const [feedback,       setFeedback]       = useState(null)
  const [coinPop,        setCoinPop]        = useState(null) // { id, amount }

  function createState() {
    return {
      phase:   'running',
      speed:   BASE_SPEED,
      frame:   0,
      char:    { x: CHAR_X, y: GROUND_Y, vy: 0, onGround: true, hitFlash: 0 },
      obstacles: [],
      clouds:  Array.from({ length: 5 }, (_, i) => makeCloud(60 + i * (W / 5))),
      score:   0,
      coins:   0,
      lives:   3,
      spawned: 0,
    }
  }

  function applyWrong(s) {
    s.lives--
    s.char.hitFlash = 50
    s.speed = BASE_SPEED
    setFeedback('wrong')
    setShowQ(false)
    s.phase = 'animating'
    setTimeout(() => setFeedback(null), 900)
  }

  const handleAnswer = useCallback((ans) => {
    const s = stateRef.current
    if (!s || s.phase !== 'question') return
    setAnswerDisabled(true)

    const correct = ans === s.currentCorrect

    if (correct) {
      s.score++
      s.coins += 10
      addCoins(10)
      s.char.vy      = JUMP_VY
      s.char.onGround = false
      s.speed        = BASE_SPEED
      setFeedback('correct')
      setCoinPop({ id: Date.now(), amount: 10 })
      setShowQ(false)
      s.phase = 'animating'
      setTimeout(() => setFeedback(null), 900)
      setTimeout(() => setCoinPop(null), 1100)
    } else {
      applyWrong(s)
    }
  }, [])

  const handleTimeout = useCallback(() => {
    const s = stateRef.current
    if (!s || s.phase !== 'question') return
    setAnswerDisabled(true)
    applyWrong(s)
  }, [])

  useEffect(() => {
    PHOTO_NAMES.forEach(name => {
      const img = new Image()
      img.src = `/avatars/${name}.png`
      photosRef.current[name] = img
    })
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    stateRef.current = createState()

    function resize() {
      const ratio = Math.min(window.innerWidth / W, (window.innerHeight - 130) / H, 1)
      canvas.style.width  = `${W * ratio}px`
      canvas.style.height = `${H * ratio}px`
    }
    resize()
    window.addEventListener('resize', resize)

    function tick() {
      const s = stateRef.current

      if (s.phase === 'running' || s.phase === 'animating') {
        s.frame++
        const c = s.char

        // physics
        c.vy += GRAVITY
        c.y  += c.vy
        if (c.y >= GROUND_Y) { c.y = GROUND_Y; c.vy = 0; c.onGround = true }

        if (c.hitFlash > 0) c.hitFlash--

        // scroll
        for (const o of s.obstacles) o.x -= s.speed

        if (s.phase === 'running') {
          // spawn
          if (s.spawned < MAX_OBS) {
            const last = s.obstacles[s.obstacles.length - 1]
            const gap  = GAP_MIN + Math.random() * GAP_RANGE
            if (!last || last.x < W - gap) {
              s.obstacles.push(makeObstacle())
              s.spawned++
            }
          }
          // trigger question
          for (const o of s.obstacles) {
            if (!o.asked && (o.x - CHAR_X) < Q_DIST) {
              o.asked          = true
              o.x              = CHAR_X + Q_DIST
              s.speed          = 0
              s.phase          = 'question'
              s.currentCorrect = o.question.correct
              setQuestion({ ...o.question })
              setAnswerDisabled(false)
              setShowQ(true)
              break
            }
          }
        }

        // resume
        if (s.phase === 'animating' && c.onGround && c.hitFlash === 0) {
          s.obstacles = s.obstacles.filter(o => o.x > -OBS_W - 30)
          if (s.lives <= 0) {
            s.phase = 'done'
            cancelAnimationFrame(rafRef.current)
            { const st = s.score >= MAX_OBS ? 3 : s.score >= Math.ceil(MAX_OBS*.7) ? 2 : s.score >= Math.ceil(MAX_OBS*.4) ? 1 : 0; addCoins(calcCoins(0, st)) }
            onGameOver(s.score, MAX_OBS, false); return
          }
          if (s.spawned >= MAX_OBS && s.obstacles.length === 0) {
            s.phase = 'done'
            cancelAnimationFrame(rafRef.current)
            { const st = s.score >= MAX_OBS ? 3 : s.score >= Math.ceil(MAX_OBS*.7) ? 2 : s.score >= Math.ceil(MAX_OBS*.4) ? 1 : 0; addCoins(calcCoins(0, st)) }
            onGameOver(s.score, MAX_OBS, true); return
          }
          s.speed = BASE_SPEED
          s.phase = 'running'
        }

        s.obstacles = s.obstacles.filter(o => o.x > -OBS_W - 40)

        if (s.phase === 'running' && s.spawned >= MAX_OBS && s.obstacles.length === 0) {
          s.phase = 'done'
          cancelAnimationFrame(rafRef.current)
          { const st = s.score >= MAX_OBS ? 3 : s.score >= Math.ceil(MAX_OBS*.7) ? 2 : s.score >= Math.ceil(MAX_OBS*.4) ? 1 : 0; addCoins(calcCoins(0, st)) }
          onGameOver(s.score, MAX_OBS, true); return
        }
      }

      // clouds always move
      for (const cl of s.clouds) {
        cl.x -= cl.speed
        if (cl.x < -cl.r * 2) cl.x = W + cl.r
      }

      // ── draw ──────────────────────────────────────────────────────────────
      ctx.clearRect(0, 0, W, H)
      drawSky(ctx)
      for (const cl of s.clouds) drawCloud(ctx, cl)
      drawGround(ctx)

      for (const o of s.obstacles) {
        const warn = !o.asked && (o.x - CHAR_X) < WARN_DIST
        drawObstacle(ctx, o, warn)
      }

      const c     = s.char
      const flash = c.hitFlash > 0 && Math.floor(c.hitFlash / 6) % 2 === 1
      if (!flash) drawCharacter(ctx, c, player.avatar, s.frame, s.phase === 'question', photosRef.current)

      drawHUD(ctx, s.lives, s.score, s.coins)

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [player.avatar, onGameOver])

  return (
    <div className="game-screen">
      <div className="game-top">
        <span className="player-tag">
          <AvatarDisplay avatar={player.avatar} size={28} /> {player.name}
        </span>
        <span className="game-hint">לוח כפל עד 10×10</span>
      </div>
      <div className="canvas-wrapper">
        <canvas ref={canvasRef} width={W} height={H} className="game-canvas" />
        {feedback && (
          <div className={`feedback feedback-${feedback}`}>
            {feedback === 'correct' ? '✓ נכון!' : '✗ טעות!'}
          </div>
        )}
        {coinPop && (
          <div key={coinPop.id} className="coin-float">
            🪙 +{coinPop.amount}
          </div>
        )}
        {showQ && question && (
          <QuestionModal
            question={question}
            onAnswer={handleAnswer}
            onTimeout={handleTimeout}
            disabled={answerDisabled}
          />
        )}
      </div>
    </div>
  )
}
