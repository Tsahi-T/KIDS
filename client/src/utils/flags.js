export const COUNTRIES = [
  { he: 'ישראל',       en: 'Israel',       flag: '🇮🇱' },
  { he: 'ארצות הברית', en: 'USA',          flag: '🇺🇸' },
  { he: 'צרפת',        en: 'France',       flag: '🇫🇷' },
  { he: 'גרמניה',      en: 'Germany',      flag: '🇩🇪' },
  { he: 'בריטניה',     en: 'UK',           flag: '🇬🇧' },
  { he: 'יפן',         en: 'Japan',        flag: '🇯🇵' },
  { he: 'קנדה',        en: 'Canada',       flag: '🇨🇦' },
  { he: 'ברזיל',       en: 'Brazil',       flag: '🇧🇷' },
  { he: 'סין',         en: 'China',        flag: '🇨🇳' },
  { he: 'הודו',        en: 'India',        flag: '🇮🇳' },
  { he: 'אוסטרליה',    en: 'Australia',    flag: '🇦🇺' },
  { he: 'איטליה',      en: 'Italy',        flag: '🇮🇹' },
  { he: 'ספרד',        en: 'Spain',        flag: '🇪🇸' },
  { he: 'רוסיה',       en: 'Russia',       flag: '🇷🇺' },
  { he: 'מקסיקו',      en: 'Mexico',       flag: '🇲🇽' },
  { he: 'דרום קוריאה', en: 'South Korea',  flag: '🇰🇷' },
  { he: 'שוויץ',       en: 'Switzerland',  flag: '🇨🇭' },
  { he: 'הולנד',       en: 'Netherlands',  flag: '🇳🇱' },
  { he: 'שוודיה',      en: 'Sweden',       flag: '🇸🇪' },
  { he: 'נורווגיה',    en: 'Norway',       flag: '🇳🇴' },
  { he: 'דנמרק',       en: 'Denmark',      flag: '🇩🇰' },
  { he: 'יוון',        en: 'Greece',       flag: '🇬🇷' },
  { he: 'טורקיה',      en: 'Turkey',       flag: '🇹🇷' },
  { he: 'מצרים',       en: 'Egypt',        flag: '🇪🇬' },
  { he: 'ארגנטינה',    en: 'Argentina',    flag: '🇦🇷' },
  { he: 'פורטוגל',     en: 'Portugal',     flag: '🇵🇹' },
  { he: 'בלגיה',       en: 'Belgium',      flag: '🇧🇪' },
  { he: 'פולין',       en: 'Poland',       flag: '🇵🇱' },
  { he: 'אוקראינה',    en: 'Ukraine',      flag: '🇺🇦' },
  { he: 'תאילנד',      en: 'Thailand',     flag: '🇹🇭' },
  { he: 'דרום אפריקה', en: 'South Africa', flag: '🇿🇦' },
  { he: 'איחוד האמירויות', en: 'UAE',      flag: '🇦🇪' },
]

// types: 'flag_to_name' | 'name_to_flag'
export function generateFlagQuestion(usedIndices) {
  const available = COUNTRIES.map((_, i) => i).filter(i => !usedIndices.has(i))
  const pool = available.length > 0 ? available : COUNTRIES.map((_, i) => i)
  const idx     = pool[Math.floor(Math.random() * pool.length)]
  const country = COUNTRIES[idx]
  const type    = Math.random() < 0.6 ? 'flag_to_name' : 'name_to_flag'

  const others = COUNTRIES.filter((_, i) => i !== idx).sort(() => Math.random() - 0.5).slice(0, 3)

  if (type === 'flag_to_name') {
    const answers = [
      { label: country.he, value: country.he },
      ...others.map(c => ({ label: c.he, value: c.he })),
    ].sort(() => Math.random() - 0.5)
    return { index: idx, type, flag: country.flag, prompt: country.flag, promptSub: 'מאיזו מדינה הדגל?', correct: country.he, answers, enName: country.en }
  } else {
    const answers = [
      { label: country.flag, value: country.flag },
      ...others.map(c => ({ label: c.flag, value: c.flag })),
    ].sort(() => Math.random() - 0.5)
    return { index: idx, type, flag: country.flag, prompt: country.he, promptSub: 'מה הדגל של המדינה?', correct: country.flag, answers, enName: country.en }
  }
}
