export default async function handler(req, res) {
  const { text } = req.query
  if (!text) return res.status(400).send('text required')

  const url =
    `https://translate.googleapis.com/translate_tts` +
    `?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en-US&client=gtx&ttsspeed=0.8`

  try {
    const r = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
          'AppleWebKit/537.36 (KHTML, like Gecko) ' +
          'Chrome/124.0.0.0 Safari/537.36',
        Referer: 'https://translate.google.com/',
        Accept:  'audio/webm,audio/ogg,audio/*;q=0.9,*/*;q=0.5',
      },
    })

    if (!r.ok) return res.status(502).send(`upstream ${r.status}`)

    const buf = await r.arrayBuffer()
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Cache-Control', 'public, s-maxage=86400, max-age=86400')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.end(Buffer.from(buf))
  } catch (e) {
    res.status(500).send(e.message)
  }
}
