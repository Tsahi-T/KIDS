import { useEffect, useRef, useState, useCallback } from 'react'
import QuestionModal from '../components/QuestionModal.jsx'
import { generateQuestion } from '../utils/questions.js'

// ─── constants ────────────────────────────────────────────────────────────────
const W = 600, H = 320
const GROUND_Y = 255          // y of ground surface
const CHAR_X = 110            // character fixed x
const GRAVITY = 0.55
const JUMP_VY = -13.5
const BASE_SPEED = 3.2
const OBS_W = 28
const MAX_OBS = 10            // obstacles per game
const QUESTION_DIST = 95      // obstacle x distance from char when question triggers
const CLOUD_COUNT = 4

function makeCloud(x) {
  return { x, y: 30 + Math.random() * 70, r: 28 + Math.random() * 22, speed: 0.25 + Math.random() * 0.35 }
}

function makeObstacle() {
  return {
    x: W + 40,
    h: 75 + Math.floor(Math.random() * 50),
    question: generateQuestion(),
    asked: false,
  }
}

// ─── drawing helpers ───────────────────────────────────────────────────────────
function drawSky(ctx) {
  const g = ctx.createLinearGradient(0, 0, 0, GROUND_Y)
  g.addColorStop(0, '#5BB8F5')
  g.addColorStop(1, '#C9E8FF')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, GROUND_Y)
}

function drawGround(ctx) {
  ctx.fillStyle = '#6DBF5E'
  ctx.fillRect(0, GROUND_Y, W, 18)
  ctx.fillStyle = '#A0785A'
  ctx.fillRect(0, GROUND_Y + 18, W, H - GROUND_Y - 18)
  // grass tufts
  ctx.fillStyle = '#52A845'
  for (let x = 5; x < W; x += 22) {
    ctx.fillRect(x, GROUND_Y - 4, 4, 8)
    ctx.fillRect(x + 9, GROUND_Y - 6, 4, 10)
  }
}

function drawCloud(ctx, cloud) {
  ctx.fillStyle = 'rgba(255,255,255,0.88)'
  ctx.beginPath()
  ctx.arc(cloud.x, cloud.y, cloud.r, 0, Math.PI * 2)
  ctx.arc(cloud.x + cloud.r * 0.9, cloud.y + 5, cloud.r * 0.7, 0, Math.PI * 2)
  ctx.arc(cloud.x - cloud.r * 0.8, cloud.y + 6, cloud.r * 0.65, 0, Math.PI * 2)
  ctx.fill()
}

function drawObstacle(ctx, obs) {
  const top = GROUND_Y - obs.h
  // shaft
  const g = ctx.createLinearGradient(obs.x, 0, obs.x + OBS_W, 0)
  g.addColorStop(0, '#78909C')
  g.addColorStop(0.4, '#B0BEC5')
  g.addColorStop(1, '#546E7A')
  ctx.fillStyle = g
  ctx.fillRect(obs.x, top, OBS_W, obs.h)
  // capital
  ctx.fillStyle = '#90A4AE'
  ctx.fillRect(obs.x - 6, top, OBS_W + 12, 14)
  // base
  ctx.fillRect(obs.x - 6, GROUND_Y - 14, OBS_W + 12, 14)
  // crack detail
  ctx.strokeStyle = 'rgba(0,0,0,0.15)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(obs.x + OBS_W * 0.4, top + 20)
  ctx.lineTo(obs.x + OBS_W * 0.55, top + 50)
  ctx.stroke()
}

function drawCharacter(ctx, char, avatar, frame) {
  const x = char.x
  const fy = char.y // feet y

  const legSwing = char.onGround ? Math.sin(frame * 0.28) * 10 : 0
  const scale = 1

  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.15)'
  ctx.beginPath()
  ctx.ellipse(x, GROUND_Y + 4, 18, 5, 0, 0, Math.PI * 2)
  ctx.fill()

  // legs
  ctx.strokeStyle = '#1565C0'
  ctx.lineWidth = 5
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x - 3, fy - 16)
  ctx.lineTo(x - 10 + legSwing, fy)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x + 3, fy - 16)
  ctx.lineTo(x + 10 - legSwing, fy)
  ctx.stroke()

  // body
  ctx.fillStyle = '#1E88E5'
  ctx.beginPath()
  ctx.roundRect(x - 13, fy - 40, 26, 26, 6)
  ctx.fill()

  // arms
  const armSwing = char.onGround ? Math.sin(frame * 0.28 + Math.PI) * 10 : -15
  ctx.strokeStyle = '#1565C0'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(x - 13, fy - 34)
  ctx.lineTo(x - 24, fy - 24 + armSwing)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x + 13, fy - 34)
  ctx.lineTo(x + 24, fy - 24 - armSwing)
  ctx.stroke()

  // head + avatar emoji
  ctx.font = `${36 * scale}px serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.fillText(avatar, x, fy - 38)
}

function drawHearts(ctx, lives) {
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < lives ? '#E53935' : 'rgba(255,255,255,0.2)'
    const hx = W - 22 - i * 28, hy = 18
    ctx.beginPath()
    ctx.moveTo(hx, hy + 7)
    ctx.bezierCurveTo(hx, hy + 2, hx - 9, hy - 4, hx - 9, hy - 1)
    ctx.bezierCurveTo(hx - 9, hy - 7, hx, hy - 7, hx, hy - 2)
    ctx.bezierCurveTo(hx, hy - 7, hx + 9, hy - 7, hx + 9, hy - 1)
    ctx.bezierCurveTo(hx + 9, hy - 4, hx, hy + 2, hx, hy + 7)
    ctx.fill()
  }
}

function drawScore(ctx, score) {
  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  ctx.beginPath()
  ctx.roundRect(10, 8, 110, 32, 8)
  ctx.fill()
  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px Heebo, sans-serif'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.fillText(`✓ ${score}`, 114, 24)
}

// ─── component ────────────────────────────────────────────────────────────────
export default function Game({ player, onGameOver }) {
  const canvasRef = useRef(null)
  const stateRef = useRef(null)
  const rafRef = useRef(null)

  const [showQ, setShowQ] = useState(false)
  const [question, setQuestion] = useState(null)
  const [answerDisabled, setAnswerDisabled] = useState(false)
  const [feedback, setFeedback] = useState(null) // 'correct' | 'wrong'

  function createState() {
    return {
      phase: 'running',   // 'running' | 'question' | 'animating' | 'done'
      speed: BASE_SPEED,
      frame: 0,
      char: { x: CHAR_X, y: GROUND_Y, vy: 0, onGround: true, hitFlash: 0 },
      obstacles: [],
      clouds: Array.from({ length: CLOUD_COUNT }, (_, i) => makeCloud((i * W) / CLOUD_COUNT + Math.random() * 60)),
      score: 0,
      lives: 3,
      spawned: 0,
      lastObstacleX: W,
    }
  }

  const handleAnswer = useCallback((ans) => {
    const s = stateRef.current
    if (!s || s.phase !== 'question') return
    setAnswerDisabled(true)

    const obs = s.obstacles.find(o => o.asked)
    const correct = obs && ans === obs.question.correct

    if (correct) {
      s.score++
      s.char.vy = JUMP_VY
      s.char.onGround = false
      s.speed = BASE_SPEED   // resume world so obstacle scrolls under the jump
      setFeedback('correct')
    } else {
      s.lives--
      s.char.hitFlash = 40
      s.speed = BASE_SPEED   // obstacle scrolls away
      setFeedback('wrong')
    }

    setShowQ(false)
    s.phase = 'animating'

    setTimeout(() => setFeedback(null), 900)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    stateRef.current = createState()

    function resize() {
      const ratio = Math.min(window.innerWidth / W, (window.innerHeight - 120) / H)
      canvas.style.width = `${W * ratio}px`
      canvas.style.height = `${H * ratio}px`
    }
    resize()
    window.addEventListener('resize', resize)

    function tick() {
      const s = stateRef.current
      s.frame++

      // ── update ──
      if (s.phase === 'running' || s.phase === 'animating') {
        const c = s.char

        // gravity / jump
        c.vy += GRAVITY
        c.y += c.vy
        if (c.y >= GROUND_Y) {
          c.y = GROUND_Y
          c.vy = 0
          c.onGround = true
        }

        // hit flash
        if (c.hitFlash > 0) c.hitFlash--

        // move obstacles
        for (const obs of s.obstacles) obs.x -= s.speed

        if (s.phase === 'running') {
          // spawn obstacles
          const gap = 280 + Math.random() * 120
          if (s.spawned < MAX_OBS) {
            const last = s.obstacles[s.obstacles.length - 1]
            if (!last || last.x < W - gap) {
              s.obstacles.push(makeObstacle())
              s.spawned++
            }
          }

          // trigger question
          for (const obs of s.obstacles) {
            if (!obs.asked && obs.x - CHAR_X < QUESTION_DIST) {
              obs.asked = true
              obs.x = CHAR_X + QUESTION_DIST  // freeze position neatly
              s.speed = 0
              s.phase = 'question'
              setQuestion(obs.question)
              setAnswerDisabled(false)
              setShowQ(true)
              break
            }
          }
        }

        // resume after animation
        if (s.phase === 'animating' && c.onGround && c.hitFlash === 0) {
          s.obstacles = s.obstacles.filter(o => o.x > -OBS_W - 20)
          if (s.lives <= 0) {
            s.phase = 'done'
            onGameOver(s.score, MAX_OBS, false)
            return
          }
          if (s.spawned >= MAX_OBS && s.obstacles.length === 0) {
            s.phase = 'done'
            onGameOver(s.score, MAX_OBS, true)
            return
          }
          s.speed = BASE_SPEED
          s.phase = 'running'
        }

        // remove far-left obstacles
        s.obstacles = s.obstacles.filter(o => o.x > -OBS_W - 40)

        // win check (running phase, after last obstacle scrolls off)
        if (s.phase === 'running' && s.spawned >= MAX_OBS && s.obstacles.length === 0) {
          s.phase = 'done'
          onGameOver(s.score, MAX_OBS, true)
          return
        }
      }

      // ── clouds ──
      for (const cl of s.clouds) {
        cl.x -= cl.speed
        if (cl.x < -cl.r * 2) cl.x = W + cl.r
      }

      // ── draw ──
      ctx.clearRect(0, 0, W, H)
      drawSky(ctx)
      for (const cl of s.clouds) drawCloud(ctx, cl)
      drawGround(ctx)
      for (const obs of s.obstacles) drawObstacle(ctx, obs)

      const c = s.char
      const flash = c.hitFlash > 0 && Math.floor(c.hitFlash / 5) % 2 === 1
      if (!flash) drawCharacter(ctx, c, player.avatar, s.frame)

      drawHearts(ctx, s.lives)
      drawScore(ctx, s.score)

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
        <span className="player-tag">{player.avatar} {player.name}</span>
        <span className="game-hint">לוח כפל עד 10×10</span>
      </div>
      <div className="canvas-wrapper">
        <canvas ref={canvasRef} width={W} height={H} className="game-canvas" />
        {feedback && (
          <div className={`feedback feedback-${feedback}`}>
            {feedback === 'correct' ? '✓ נכון!' : '✗ טעות!'}
          </div>
        )}
        {showQ && question && (
          <QuestionModal question={question} onAnswer={handleAnswer} disabled={answerDisabled} />
        )}
      </div>
    </div>
  )
}
