let currentAudio = null

// Uses StreamElements (Amazon Polly) - free, reliable on all browsers/iOS
export function speakEnglish(text) {
  if (currentAudio) { currentAudio.pause(); currentAudio = null }
  const url = `https://api.streamelements.com/kappa/v2/speech?voice=Ivy&text=${encodeURIComponent(text)}`
  const audio = new Audio(url)
  audio.volume = 1
  currentAudio = audio
  audio.play().catch(() => {})
}
