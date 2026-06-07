let current = null

export function speakEnglish(text) {
  if (current) { current.pause(); current = null }
  // /api/tts is a Vercel serverless function that proxies Google Translate TTS
  const audio = new Audio(`/api/tts?text=${encodeURIComponent(text)}`)
  audio.volume = 1
  current = audio
  audio.play().catch(() => {})
}
