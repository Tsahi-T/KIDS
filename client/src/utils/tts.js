let currentAudio = null

export function speakEnglish(text) {
  if (currentAudio) { currentAudio.pause(); currentAudio = null }
  const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en-US&client=gtx`
  const audio = new Audio(url)
  audio.playbackRate = 0.85
  currentAudio = audio
  audio.play().catch(() => {})
}
